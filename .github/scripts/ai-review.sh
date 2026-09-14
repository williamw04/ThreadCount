#!/usr/bin/env bash
# Single-shot PR review: diff + changed files + linter output in, one model call, one GitHub review out.
# Env: PR (number), REPO (owner/name), MUSE_API_KEY. Optional: MUSE_MODEL, MUSE_API_URL, DRY_RUN=1.
# ponytail: reviews the whole PR on every push; review only new commits if threads pile up.
set -euo pipefail

: "${PR:?}" "${REPO:?}"
API_URL="${MUSE_API_URL:-https://api.meta.ai/v1/chat/completions}"
MODEL="${MUSE_MODEL:-muse-spark-1.3-contributor}"
MAX_FILE_BYTES=200000
MAX_CONTEXT_BYTES=1500000 # ~400k tokens, well inside the 1M window

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# 1. Gather the PR.
gh pr view "$PR" --json title,body,files --jq '"# \(.title)\n\n\(.body // "")"' > "$work/meta.md"
gh pr view "$PR" --json files --jq '.files[].path' > "$work/files.txt"
gh pr diff "$PR" > "$work/diff.patch"

# 2. Linters on the changed files that exist on disk. Output is context, never a failure.
files=(); while IFS= read -r f; do files+=("$f"); done < "$work/files.txt"
ts=(); py=()
for f in "${files[@]}"; do
  [ -f "$f" ] || continue
  case "$f" in
    frontend/*.ts|frontend/*.tsx) ts+=("${f#frontend/}") ;;
    backend/*.py) py+=("$f") ;;
  esac
done
{
  if [ ${#ts[@]} -gt 0 ] && [ -d frontend/node_modules ]; then
    echo "## eslint"; (cd frontend && npx eslint "${ts[@]}" 2>&1) || true
  fi
  if [ ${#py[@]} -gt 0 ] && command -v ruff >/dev/null; then
    echo "## ruff"; ruff check --output-format concise "${py[@]}" 2>&1 || true
  fi
} > "$work/lint.txt"

# 3. Full contents of changed text files, skipping lockfiles, binaries and anything huge.
: > "$work/sources.md"
for f in "${files[@]}"; do
  [ -f "$f" ] || continue
  case "$f" in *lock*|*.min.*|*.png|*.jpg|*.jpeg|*.gif|*.webp|*.ico|*.woff*|*.tsbuildinfo) continue ;; esac
  size=$(wc -c < "$f")
  [ "$size" -le "$MAX_FILE_BYTES" ] || { echo "(skipped $f: $size bytes)" >> "$work/sources.md"; continue; }
  grep -qI . "$f" || continue
  printf '\n### %s\n```\n' "$f" >> "$work/sources.md"
  cat "$f" >> "$work/sources.md"
  printf '\n```\n' >> "$work/sources.md"
  [ "$(wc -c < "$work/sources.md")" -le "$MAX_CONTEXT_BYTES" ] || { echo "(context cap reached; remaining files omitted)" >> "$work/sources.md"; break; }
done

# 4. One model call, JSON out.
system='You are a senior reviewer for a React 19 + TypeScript frontend and a FastAPI backend. Review the pull request for bugs, security issues, behaviour regressions and broken contracts between the diff and the surrounding code. Linter output is provided; do not repeat what it already says unless it hides a deeper bug. Report only findings you are confident about, at most 8, most severe first. Every finding must point at a line that appears in the diff as an added or context line. When the fix is a replacement of one to three consecutive lines starting at that line, include it as "suggestion": the exact replacement text for those lines with original indentation, and "end_line": the last line replaced (omit for a single line). Never include a suggestion for anything larger; describe it in body instead. Reply with JSON only: {"summary": string, "findings": [{"path": string, "line": integer, "end_line"?: integer, "severity": "high"|"medium"|"low", "body": string, "suggestion"?: string}]}. If there is nothing worth raising, return an empty findings array and say so in summary.'
jq -n --arg model "$MODEL" --arg system "$system" \
  --rawfile meta "$work/meta.md" --rawfile lint "$work/lint.txt" --rawfile diff "$work/diff.patch" --rawfile src "$work/sources.md" '
  {
    model: $model,
    reasoning_effort: "low",
    max_completion_tokens: 16000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: $system },
      { role: "user", content: ($meta + "\n\n## Linter output\n" + $lint + "\n\n## Diff\n```diff\n" + $diff + "\n```\n\n## Changed files (full)\n" + $src) }
    ]
  }' > "$work/payload.json"

if [ "${DRY_RUN:-}" = 1 ]; then
  echo "payload bytes: $(wc -c < "$work/payload.json"); files: ${#files[@]}; lint lines: $(wc -l < "$work/lint.txt")"
  jq -r '.messages[1].content' "$work/payload.json" | head -40
  exit 0
fi

: "${MUSE_API_KEY:?}"
curl --fail-with-body --silent --show-error --max-time 300 "$API_URL" \
  -H "Authorization: Bearer $MUSE_API_KEY" -H "Content-Type: application/json" \
  --data-binary @"$work/payload.json" > "$work/response.json"
# Log the reply shape without its text so a bad run is diagnosable from the job log.
jq -c 'del(.choices[]?.message.content) | {model, finish_reason: .choices[0]?.finish_reason, usage, keys: (.choices[0]?.message // {} | keys)}' "$work/response.json" || true
# Content may be a string or an array of parts; strip a ```json fence if the model added one.
jq -r '.choices[0].message.content
       | if type == "array" then map(.text // "") | join("") else (. // "") end
       | sub("^\\s*```(json)?\\s*"; "") | sub("\\s*```\\s*$"; "")' "$work/response.json" > "$work/content.txt"

# 5. Post. Bad JSON from the model is posted verbatim, never a red check.
if ! jq -e '.findings | type == "array"' "$work/content.txt" >/dev/null 2>&1; then
  if [ -n "$(tr -d '[:space:]' < "$work/content.txt")" ]; then
    printf '## AI review\n\n%s\n' "$(cat "$work/content.txt")" | gh pr comment "$PR" --body-file -
    echo "::warning::model reply was not the expected JSON; posted as a plain comment"
  else
    echo "::warning::model returned no content ($(jq -c '{finish_reason: .choices[0]?.finish_reason, usage}' "$work/response.json")); nothing posted"
  fi
  exit 0
fi

summary=$(jq -r '.summary' "$work/content.txt")
jq --slurpfile changed <(jq -R . "$work/files.txt" | jq -s .) '
  ($changed[0]) as $paths
  | {
      event: "COMMENT",
      body: ("## AI review (" + env.MODEL + ")\n\n" + .summary),
      comments: [ .findings[] | select(.path as $p | $paths | index($p))
                  | { path, side: "RIGHT",
                      body: ("**" + (.severity | ascii_upcase) + "** " + .body
                             + (if (.suggestion // "") != "" then "\n\n```suggestion\n" + .suggestion + "\n```" else "" end)) }
                    + (if (.end_line // .line) > .line then { start_line: .line, start_side: "RIGHT", line: .end_line } else { line } end) ]
    }' "$work/content.txt" > "$work/review.json"

if gh api "repos/$REPO/pulls/$PR/reviews" --input "$work/review.json" --jq '.id' > /dev/null 2> "$work/post.err"; then
  echo "posted review with $(jq '.comments | length' "$work/review.json") inline comments"
else
  # Usually a line outside the diff. Fall back to one comment with the same findings.
  echo "::warning::inline review rejected: $(cat "$work/post.err")"
  {
    printf '## AI review (%s)\n\n%s\n\n' "$MODEL" "$summary"
    jq -r '.findings[] | "- **\(.severity | ascii_upcase)** `\(.path):\(.line)` \(.body)"' "$work/content.txt"
  } | gh pr comment "$PR" --body-file -
fi

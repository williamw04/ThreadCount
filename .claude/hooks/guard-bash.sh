#!/bin/bash
# PreToolUse(Bash): exit 2 blocks the command and shows the reason to the agent.
# Prose is stripped before matching (-m "..." payloads and heredoc bodies) so commit
# messages that mention git push do not trip the rules, while the rules stay unanchored
# so eval/sh -c/xargs/loops cannot smuggle a push past them.
raw=$(jq -r '.tool_input.command // empty')
cmd=$(printf '%s\n' "$raw" | awk '
  /<<-?[ \t]*["'"'"']?[A-Za-z_]+["'"'"']?/ { match($0, /<<-?[ \t]*["'"'"']?[A-Za-z_]+/); tag=substr($0, RSTART, RLENGTH); sub(/<<-?[ \t]*["'"'"']?/, "", tag); skip=1; print; next }
  skip && $0 == tag { skip=0; next }
  skip { next }
  { print }' | sed -E "s/(^|[[:space:]])-m[[:space:]]+(\"[^\"]*\"|'[^']*')//g")

if echo "$cmd" | grep -qE -- '--no-verify|git\s+push\b[^|;&]*(--force|\s-f\b|(^|[[:space:]:/])main([[:space:]"'"'"';)]|$))|rm\s+-rf\s+/(\s|$)'; then
  echo "blocked by .claude/hooks/guard-bash.sh: no --no-verify, force pushes, pushes to main, or rm -rf /. Open a PR instead." >&2
  exit 2
fi

# Push gate: HEAD must carry a review marker written by .claude/hooks/mark-reviewed.sh
# (stage 4 of the feature-pipeline skill). Any new commit invalidates it. Evaluated in the
# current directory so worktrees check their own HEAD and their own marker.
# ponytail: honour-system marker, an agent could write it without reviewing; CI review action is the hard backstop.
if echo "$cmd" | grep -qE 'git\s+push\b'; then
  head=$(git rev-parse HEAD 2>/dev/null) || exit 0
  marker="$(git rev-parse --git-dir)/REVIEWED"
  if [ "$(cat "$marker" 2>/dev/null)" != "$head" ]; then
    echo "blocked by .claude/hooks/guard-bash.sh: HEAD ${head:0:7} has not been reviewed. Run stage 4 of the feature-pipeline skill (review-pr, security-review, code-review), fix findings, then run .claude/hooks/mark-reviewed.sh and push again." >&2
    exit 2
  fi
fi
exit 0

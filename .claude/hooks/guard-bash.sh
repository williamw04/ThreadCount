#!/bin/bash
# PreToolUse(Bash): exit 2 blocks the command and shows the reason to the agent.
# Matches the raw command text and fails closed. No prose stripping: an earlier version
# stripped -m payloads and heredoc bodies before matching, and a heredoc it could not
# parse swallowed the rest of the command and let pushes through. A commit message or
# grep that merely mentions "git push" is blocked too; reword it (e.g. "git-push").
# ponytail: false positives cost one retry, false negatives cost a bypass. Keep it dumb.
cmd=$(jq -r '.tool_input.command // empty')

if echo "$cmd" | grep -qE -- '--no-verify|git\s+push\b[^|;&]*(--force|\s-f\b|(^|[[:space:]:/+"'"'"'])(main|develop)([[:space:]"'"'"';)+:]|$))|rm\s+-rf\s+/(\s|$)'; then
  echo "blocked by .claude/hooks/guard-bash.sh: no --no-verify, force pushes, pushes to main or develop, or rm -rf /. Open a PR instead. If this only appears in text (commit message, grep), reword it." >&2
  exit 2
fi

# No direct merges (docs/decisions/merge-policy.md). Merging is GitHub auto-merge on a develop PR
# or a human's click on a main PR. `gh pr merge --auto` only arms auto-merge, which the rulesets
# govern, so it is allowed. Blocked: gh pr merge without --auto, gh alias (could alias a merge),
# REST and GraphQL merges via gh api, and curl to the API.
merge_cmd=$(echo "$cmd" | tr ';|&' '\n' | grep -E 'gh\s+pr\s+merge\b' | grep -vE -- '--auto\b')   # one segment per command
if [ -n "$merge_cmd" ] || echo "$cmd" | grep -qE 'gh\s+alias\b|gh\s+api\b[^|;&]*(/merges?\b|graphql)|api\.github\.com[^|;&]*/merges?\b'; then
  echo "blocked by .claude/hooks/guard-bash.sh: no direct merges. Use auto-merge on a develop PR (gh pr merge --auto --squash, or the set_auto_merge tool); a human merges main PRs. See docs/decisions/merge-policy.md." >&2
  exit 2
fi

# Worktree gate (docs/decisions/merge-policy.md). Other sessions use the shared root checkout;
# each session works in its own worktree. Two parts, both fail closed:
#  a) from any cwd: git commands that point at another tree (-C, --git-dir, --work-tree) and
#     `cd ... git <verb>` are refused, because the gate judges the hook's cwd, not the command's;
#  b) in a root checkout (git-dir equals git-common-dir): git verbs that change branch or tree
#     state, and file writes via redirect, sed -i, tee, mv, cp, rm, touch, mkdir, are refused.
# The Bash write check in (b) is best-effort by nature (a python one-liner can write a file);
# guard-edit.sh on Edit|Write is the real gate. False positives in a root checkout are fine:
# the answer to every one of them is "enter a worktree".
verbs='commit|checkout|switch|merge|rebase|reset|stash|cherry-pick|pull|revert|restore|clean|am|apply'
# git, optional global options (with or without a value), then a mutating subcommand in subcommand
# position. Keeps `git log --grep=commit` and `git worktree add feature-restore` out of the match.
gitmut="\bgit([[:space:]]+-[^[:space:]]+([[:space:]]+[^-[:space:]][^[:space:]]*)?)*[[:space:]]+(($verbs)\b|branch[[:space:]]+(-[dDmMf]|--delete|--move|--force))"
flat=$(echo "$cmd" | tr '\n' ';')
if echo "$flat" | grep -qE "\bgit[[:space:]]+(-C[[:space:]]+|--git-dir[= ]|--work-tree[= ])[^|;&]*\b($verbs)\b" \
   || echo "$flat" | grep -qE "\b(cd|pushd)[[:space:]]+(/|~|[^[:space:]]*\.\.)[^;&|]*[;&|].*$gitmut"; then
  echo "blocked by .claude/hooks/guard-bash.sh: git must run in the current worktree; no -C, --git-dir, --work-tree, or cd to an absolute path then git. A relative cd inside the worktree is fine." >&2
  exit 2
fi
if git rev-parse --git-dir >/dev/null 2>&1; then
  gitdir=$(cd "$(git rev-parse --git-dir)" && pwd -P); common=$(cd "$(git rev-parse --git-common-dir)" && pwd -P)
  if [ "$gitdir" = "$common" ]; then
    # drop harmless redirects: &N, /dev/*, /tmp/* and /private/tmp/* without traversal (BSD sed: no \s)
    writes=$(echo "$flat" | sed -E 's#[0-9]?>{1,2}[[:space:]]*(&[0-9]|/dev/[a-z]+|/tmp/[^[:space:]./][^[:space:]]*|/private/tmp/[^[:space:]./][^[:space:]]*)##g')
    if echo "$flat" | grep -qE "$gitmut" \
       || echo "$writes" | grep -qE '>|\b(sed[[:space:]]+-i|perl[[:space:]]+-i|tee|mv|cp|rm|touch|mkdir|dd|install|ln|truncate|patch)\b|\b(python3?[[:space:]]+-c|node[[:space:]]+(-e|--eval))\b'; then
      echo "blocked by .claude/hooks/guard-bash.sh: this is the shared root checkout. Enter a worktree first (EnterWorktree, or git worktree add .claude/worktrees/<name>) and work there." >&2
      exit 2
    fi
  fi
fi

# Push gate: HEAD must carry a review marker written by .claude/hooks/mark-reviewed.sh
# (stage 4 of the feature-pipeline skill). Any new commit invalidates it. Evaluated in the
# current directory so worktrees check their own HEAD and their own marker.
# ponytail: honour-system marker, an agent could write it without reviewing; CI review action is the hard backstop.
if echo "$cmd" | grep -qE 'git\s+push\b'; then
  head=$(git rev-parse HEAD 2>/dev/null) || exit 0
  marker="$(git rev-parse --git-dir)/REVIEWED"
  if [ "$(cat "$marker" 2>/dev/null)" != "$head" ]; then
    echo "blocked by .claude/hooks/guard-bash.sh: HEAD ${head:0:7} has not been reviewed. Run stage 4 of the feature-pipeline skill (review-pr, security-review, code-review), fix findings, then run .claude/hooks/mark-reviewed.sh and push again. If 'git push' only appears in text, reword it." >&2
    exit 2
  fi
fi
exit 0

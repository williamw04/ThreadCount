#!/bin/bash
# PreToolUse(Bash): exit 2 blocks the command and shows the reason to the agent.
cmd=$(jq -r '.tool_input.command // empty')
# "git push" only counts at command position (line start or after ; & | ( ) so prose in commit messages passes.
if echo "$cmd" | grep -qE -- '--no-verify|(^|[;&|(])\s*git\s+push\b[^|;&]*(--force|\s-f\b|\bmain\b)|rm\s+-rf\s+/(\s|$)'; then
  echo "blocked by .claude/hooks/guard-bash.sh: no --no-verify, force pushes, pushes to main, or rm -rf /. Open a PR instead." >&2
  exit 2
fi

# Push gate: HEAD must carry a review marker written by .claude/hooks/mark-reviewed.sh
# (stage 4 of the feature-pipeline skill). Any new commit invalidates it.
# ponytail: honour-system marker, an agent could write it without reviewing; CI review action is the hard backstop.
if echo "$cmd" | grep -qE '(^|[;&|(])\s*git\s+push\b'; then
  cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
  head=$(git rev-parse HEAD 2>/dev/null) || exit 0
  marker="$(git rev-parse --git-dir)/REVIEWED"
  if [ "$(cat "$marker" 2>/dev/null)" != "$head" ]; then
    echo "blocked by .claude/hooks/guard-bash.sh: HEAD ${head:0:7} has not been reviewed. Run stage 4 of the feature-pipeline skill (review-pr, security-review, code-review), fix findings, then run .claude/hooks/mark-reviewed.sh and push again." >&2
    exit 2
  fi
fi
exit 0

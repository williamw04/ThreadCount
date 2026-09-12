#!/bin/bash
# PreToolUse(Bash): exit 2 blocks the command and shows the reason to the agent.
cmd=$(jq -r '.tool_input.command // empty')
if echo "$cmd" | grep -qE -- '--no-verify|git\s+push\b[^|;&]*(--force|\s-f\b|\bmain\b)|rm\s+-rf\s+/(\s|$)'; then
  echo "blocked by .claude/hooks/guard-bash.sh: no --no-verify, force pushes, pushes to main, or rm -rf /. Open a PR instead." >&2
  exit 2
fi

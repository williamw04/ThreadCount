#!/bin/bash
# PreToolUse(mcp__ccd_pr__set_auto_merge): agents never enable auto-merge. A human merges.
echo "blocked by .claude/hooks/deny-auto-merge.sh: agents do not enable auto-merge. Enable auto-fix with mcp__ccd_pr__set_monitor and leave the merge to a human reviewer." >&2
exit 2

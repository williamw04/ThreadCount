#!/bin/bash
# PreToolUse(Edit|Write): refuse edits to repo files from the shared root checkout.
# Other sessions use the root checkout; each session works in its own git worktree
# (docs/decisions/merge-policy.md). Files outside any git repo are left alone.
input=$(cat)
f=$(echo "$input" | jq -r '.tool_input.file_path // empty'); [ -n "$f" ] || exit 0
dir=$(dirname "$f")
while [ ! -d "$dir" ] && [ "$dir" != / ]; do dir=$(dirname "$dir"); done   # Write creates parents; climb to one that exists
cd "$dir" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0          # not a git repo: allow
gitdir=$(cd "$(git rev-parse --git-dir)" && pwd -P)
common=$(cd "$(git rev-parse --git-common-dir)" && pwd -P)
if [ "$gitdir" = "$common" ]; then
  echo "blocked by .claude/hooks/guard-edit.sh: this is the shared root checkout. Enter a worktree first (EnterWorktree, or git worktree add .claude/worktrees/<name>) and edit there." >&2
  exit 2
fi
exit 0

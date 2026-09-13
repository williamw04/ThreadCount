@AGENTS.md

Feature work follows the `feature-pipeline` skill. Hooks in `.claude/hooks/` format on edit and block `--no-verify`, force pushes, direct pushes to `main` or `develop`, and any merge by an agent.

After opening any PR, enable auto-fix on it with `mcp__ccd_pr__set_monitor` so CI failures, conflicts and review comments come back to this session. Never enable auto-merge and never merge a PR: a human reviewer does the final review and merges.

Other agents work in this repo at the same time. Work in a git worktree under `.claude/worktrees/`, never in the root checkout, and never touch another agent's branch or PR.

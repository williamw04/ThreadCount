@AGENTS.md

Feature work follows the `feature-pipeline` skill. Hooks in `.claude/hooks/` format on edit and block `--no-verify`, force pushes and pushes to main.

After opening any PR, enable auto-fix on it with `mcp__ccd_pr__set_monitor` so CI failures, conflicts and review comments come back to this session. PRs into `develop` also get `mcp__ccd_pr__set_auto_merge` (squash); PRs into `main` wait for a human approval.

@AGENTS.md

Feature work follows the `feature-pipeline` skill. Merge rules are in `docs/decisions/merge-policy.md`: `main` is production and only a human merges into it; `develop` is staging and agents self-merge into it with GitHub auto-merge. Hooks in `.claude/hooks/` format on edit and block `--no-verify`, force pushes, direct pushes to `main` or `develop`, and every direct merge path.

After opening a PR, enable auto-fix on it with `mcp__ccd_pr__set_monitor`. For a PR into `develop`, also enable auto-merge with `mcp__ccd_pr__set_auto_merge` (squash). Never on a PR into `main`. Never merge another session's PR, and never resolve a review thread you did not address.

Other agents work in this repo at the same time. Work in a git worktree under `.claude/worktrees/` on a `feature/<name>` branch cut from `develop`, never in the root checkout, and never touch another agent's branch or PR.

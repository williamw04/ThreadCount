---
name: feature-pipeline
description: Use when asked to build, implement, or ship a feature or non-trivial change end to end in this repo. Pins the stage order, the validating agents, and the exact gate commands.
---

# Feature pipeline

Stages run in order. The builder never validates its own work; validators get a fresh context, the diff, and the spec.

## 0. Intake
Use `superpowers:brainstorming`. Output: a spec in `docs/features/<feature>/` with user story and acceptance criteria. Stop for human approval of the design.

## 1. Plan
Use `superpowers:writing-plans`, then `superpowers:using-git-worktrees`. Branch name `feature/<name>` from `develop`.

## 2. Build
Use `superpowers:subagent-driven-development` with `superpowers:test-driven-development`. The first task is always the browser e2e test that demos the feature end to end, written from the spec's acceptance criteria; it fails until the feature is done and is the feature's acceptance test in the PR. Fresh implementer per task. `.claude/hooks/format.sh` formats every edit; `security-guidance` warns on sensitive edits. After each task, `superpowers:requesting-code-review`.

## 3. Self-check
Use `superpowers:verification-before-completion`. The full local gate, all must pass:

```bash
cd frontend && npm run typecheck && npm run lint && npm run format:check && npm run test:coverage && npm run build
cd backend && ruff check . && ruff format --check . && pytest
```

For UI changes, open the feature with the Playwright MCP tools and attach a screenshot to the PR.

## 4. Validate
Run `/pr-review-toolkit:review-pr` (parallel). Then `/security-review`. Then `/code-review` for confidence-scored findings. Fix findings and rerun stage 3. At most two rounds; after that, list the open findings in the PR for a human. Run `pr-review-toolkit:code-simplifier` once clean.

When the branch is clean, commit, then run `.claude/hooks/mark-reviewed.sh`. This records the reviewed HEAD; `guard-bash.sh` refuses `git push` for any commit without it, so any commit after the review needs the review rerun and the marker rewritten.

## 5. Ship
Use `superpowers:finishing-a-development-branch`. Open the PR against `develop` with the template, then enable auto-fix and GitHub auto-merge (squash) on it with the app's `mcp__ccd_pr__set_monitor` and `mcp__ccd_pr__set_auto_merge` tools. CI, the ruleset, and the Gemini review action take it from there: the PR merges itself once required checks pass and every review thread is resolved. `main` is only ever reached through a merged PR; `.claude/hooks/guard-bash.sh` blocks the shortcuts.

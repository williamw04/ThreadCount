# Merge and Auto-fix Policy

**Version**: 1.0
**Last Updated**: 2026-09-13

## Goal

Agents work autonomously end to end, but nothing reaches `main` without a human's final check. `main` is production. `develop` is staging. Agents may self-merge into staging. Only a human promotes to production.

## Branches and where they deploy

| Branch | Environment | Who merges into it |
|---|---|---|
| `feature/*`, `fix/*`, `ci/*` | Per-branch preview | Not a target. PRs come from here. |
| `develop` | Staging | Agents, via GitHub auto-merge on green |
| `main` | Production | A human, via one approving review |

## GitHub rulesets

- **protect develop**: PR required, the three CI checks required (Frontend checks, Backend checks, Documentation build), all review threads resolved, zero approvals.
- **protect main**: the same, plus one approving review.

## What that means for an agent

- Work in your own git worktree on a `feature/<name>` branch cut from `develop`. Never edit the shared checkout another session is using.
- Open your PR against `develop`, not `main`. The only PRs into `main` are `develop` promotions, CI or hosting changes that must live on the default branch, and Dependabot bumps. Those wait for the human.
- After opening the PR, enable auto-fix on it with the app's `mcp__ccd_pr__set_monitor` tool so CI failures, merge conflicts, and review comments come back to the session that wrote the code. For PRs into `develop`, also enable GitHub auto-merge with `mcp__ccd_pr__set_auto_merge` using squash. Do not enable auto-merge on PRs into `main`.
- Do not merge another session's PR. Merging is either GitHub's auto-merge on a `develop` PR or the human's click on a `main` PR. A PR that is not yours may have commits in flight. PR #11 was merged while its author session was still pushing, which left a broken workflow on `main` and needed PR #16 to repair it.
- Do not resolve review threads you did not address. Thread resolution is a merge gate on both branches.

## Why the human gate sits on `main` and not `develop`

CI proves the code runs and its tests pass. It cannot prove the feature matches what the user meant, or that it looks right in the app. Staging is where those two things get checked for free. Merging into `develop` deploys staging and lets the human look. The one approval on `main` is the only human step left in the flow, and it costs nothing while the PR is green. It goes away once browser end-to-end tests cover the real flows, because then green CI means "works as specified".

## Why auto-fix is per PR

The desktop app has no global default. Each session flips the switch on the PR it opened. Closing the session ends the watch, so if you take over a PR, bind to it and flip the switch again.

## Enforcement

- `.claude/hooks/guard-bash.sh` blocks direct pushes to `main` and `develop`, force pushes, hook bypasses, and every direct merge path (`gh pr merge` without `--auto`, `gh api` merges, GraphQL merges, `curl` to the merge endpoints). `gh pr merge --auto` is allowed because it only arms GitHub auto-merge, which the rulesets govern.
- `.claude/hooks/check.sh` is the self-test for those rules.
- The `feature-pipeline` skill and `CLAUDE.md` carry the same rules as instructions.

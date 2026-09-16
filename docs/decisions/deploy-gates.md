# Deploy Gates: Main-Only Flow with Human-Confirmed Production

**Version**: 1.0
**Status**: Approved design, pending implementation
**Last Updated**: 2026-09-16

This document replaces the `develop`-as-staging half of `merge-policy.md` and refines the
Environments table in `cloudflare-architecture.md`. It does not change anything until it is
implemented; see Sequencing below.

---

## Problem Statement

`main` is production and `develop` is staging, with agents self-merging into `develop` and a
human promoting batches to `main`. That split exists for one reason: with a single GitHub
identity shared by the human and every agent session, `main` cannot require an approval
(GitHub does not let an author approve their own PR, and every agent PR is authored by the
maintainer on paper). So the human gate sits on promotion PRs instead of on the code.

That leaves two gaps. First, "only a human merges into main" is policy, not machinery: the
hooks allow `gh pr merge --auto` on any PR, so a misbehaving session could arm auto-merge on
a `main` PR and it would land on green CI with no human click. Second, `develop` has stopped
earning its keep: staging deploys only fire on `develop` pushes (`deploy.yml`), and no
`develop` push has deployed anything in the current window. Staging is dormant while the
Cloudflare migration builds its replacement.

The fix has two parts, decided together: one shared agent identity distinct from the human,
and a main-only branch flow where production deploys require an explicit human confirm that
agents cannot touch.

---

## Decision

Delete `develop` as a staging branch. Feature branches PR directly into `main`. Every push
to `main` auto-deploys staging after green CI. Production deploys only through a manual
`workflow_dispatch` workflow whose deploy job targets a `production` GitHub environment with
the human as required reviewer. The human confirm lives in Actions, not in a page off
GitHub and not in PR approvals.

### End state

| Environment | Trigger | What runs | Data |
|---|---|---|---|
| Preview | push to `feature/**` or `fix/**`, after CI is green | Automatic: deploy the branch-named Worker and Pages preview | Staging D1 and R2, fal.ai stubbed |
| Staging | push to `main`, after CI is green | Automatic: deploy `api-staging` Worker and Pages branch deployment | Staging D1 and R2, real fal.ai |
| Production | `workflow_dispatch` on `main` only | Human-confirmed: migrate prod D1, promote the CI-built version to the `api` production Worker and Pages production | Production D1 and R2, real fal.ai |

Preview and staging keep the shape in `cloudflare-architecture.md`. Production changes from
"merge to `main`" to "promote the version CI built from `main`": `wrangler versions upload`
in CI produces an immutable version, and the dispatch workflow promotes that version rather
than rebuilding. The human promotes the exact artifact CI tested.

### The three interlocking gates on production

1. **`deploy-production.yml` is `workflow_dispatch`-only** (input: sha, defaulting to current
   `main` HEAD). Its first job asserts the sha has green CI on `main` and fails otherwise,
   so the human cannot accidentally ship untested code either.
2. **The deploy job targets a `production` GitHub environment with the human as required
   reviewer.** A dispatched run pauses for approval in the Actions tab. This is mechanically
   sound once the agent identity exists: approval must come from a listed reviewer, and the
   agent account is not one.
3. **Agents are blocked from dispatch at the hook layer.** `guard-bash.sh` refuses
   `gh workflow run` for the production workflow, so sessions fail closed before creating
   runs that nag the human. Prod secrets (Cloudflare token, prod D1/R2 bindings) live only
   in the `production` environment, which feature-branch runs cannot read.

Any one gate failing still leaves the other two standing: a session that bypasses the hook
hits the environment approval; a human who dispatches the wrong sha hits the green-CI
assertion.

---

## Rationale

### Why workflow_dispatch plus environment approval, not PR approval

PR approvals gate code review; dispatch plus environment approval gates the deploy act
itself. They answer different questions ("is this right?" vs "ship it now?"), and the
second one is the one production needs. Keeping the confirm in Actions means no separate
page, no Cloudflare-dashboard promotion step, no new vendor surface. Cloudflare offers no
native human-approval gate on Workers or Pages, so the confirm has to live in Actions
regardless; the versions API makes it safe by separating build from promotion.

### Why version promotion instead of redeploy

Redeploying at dispatch time rebuilds from the sha and can drift from what CI tested
(flaky build, moved tag, changed dependency). Promoting the uploaded version removes that
class of failure: the artifact is content-addressed and already proven green.

### Why delete `develop` instead of mirroring it

A staging branch that only mirrors `main` is a branch with no job: an extra ruleset to
drift, an extra sync workflow to maintain, an extra merge commit per promotion. Per-branch
previews (sub-project 2) take over the "look at it before prod" role for features, and
auto-deployed staging off `main` keeps a standing staging environment. The Render staging
path (`deploy.yml` on `develop` pushes) is already dormant and goes away with the
migration.

---

## What changes, file by file

When this is implemented — one PR, no half-migrated state:

- Add `.github/workflows/deploy-production.yml` (`workflow_dispatch`, sha input, green-CI
  assertion, `versions upload` in CI, promote on dispatch, `environment: production`).
- Create the `production` GitHub environment with the human as required reviewer; move prod
  secrets into it. Keep staging secrets in `staging`.
- `main.json`: unchanged at zero required approvals. Agents self-merge into `main`
  (staging); the human review point moves from merge to promotion.
- Delete: `develop.json` (plus the live ruleset), `.github/workflows/sync-develop.yml`,
  `.github/workflows/deploy.yml`, the Render staging hook secret.
- `guard-bash.sh` + `check.sh`: refuse `gh workflow run` for the production workflow.
- Rewrite the `develop`-staging sections of `merge-policy.md`, `DEPLOYMENT.md`, and the
  Environments table in `cloudflare-architecture.md`; update the feature-pipeline skill to
  target `main`.

## Sequencing and prerequisites

1. **Sub-project 2 builds the replacement workflows** (preview, staging-off-`main`, prod
   dispatch) per this document.
2. **The same PR deletes `develop`** and everything listed above.
3. **Agent identity lands with (not before) the prod workflow** (human task): shared
   machine-user account plus one fine-grained PAT; sessions auth as the agent account.

### Why identity can wait, and what it protects when it lands

Until `deploy-production.yml` exists there is no automated path to production, so a
separate identity buys nothing today. It becomes load-bearing the day prod deploys are
automated: with one shared credential, GitHub cannot tell the human's approval click
apart from a session's API call. The hook block on `gh workflow run` and the
environment's required reviewer would both be honor-system — a session that bypasses
the hook could dispatch *and* approve its own prod run through the pending-deployments
API, which `guard-bash.sh` does not block. With the agent account excluded from the
`production` environment's reviewer list, that approval is rejected and the gate is
mechanical.

## Open items

- Render teardown and the recent `Deploy non-production` wrapper failures on `main`-branch
  CI completions: glance during migration cleanup; the workflow is deleted here anyway.
- MCP monitor/auto-merge tools currently act as the human identity; re-auth or avoid them
  before the identity split, or agent-driven actions will punch through it.
- `DEPLOYMENT.md` already anticipates separate `staging`/`production` environments with
  required reviewers; reconcile it with this document at implementation time.

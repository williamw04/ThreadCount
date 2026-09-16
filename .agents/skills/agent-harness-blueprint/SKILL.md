---
name: agent-harness-blueprint
description: Use when setting up a repository so coding agents can work in it autonomously, when asked how the agents in this repo develop and ship, or when porting this repo's agent workflow, command guard, git hooks, branch rulesets, and CI/CD gates to another repository or another agent runtime.
---

# Agent harness blueprint

A repository where agents work end to end, nothing reaches production without a human, and every rule that matters is enforced by a machine rather than by a sentence in a document. This file describes the model in runtime-neutral terms. `reference/` holds the portable scripts and templates. `reference/runtime-wiring.md` says how to attach them to a specific agent runtime.

## Vocabulary

| Term used here | Meaning |
|---|---|
| Agent instruction file | `AGENTS.md` at the repo root. Every agent reads it at session start. A map to the docs, not a manual. |
| Skill | A folder with a `SKILL.md` (YAML `name` and `description`, then instructions) that an agent loads on demand. Open spec: agentskills.io. |
| Command guard | A script the runtime runs before every shell command the agent issues. It reads the command text and can veto it: exit 2, reason on stderr. Also called a pre-execution hook or tool-call interceptor. |
| Edit formatter | A script the runtime runs after the agent writes a file. It formats and lint-fixes that file. Never blocks. |
| Git hooks | `pre-commit` and `pre-push` in the repository, installed for every clone. Independent of any agent runtime. |
| Review marker | A file under the git directory holding the commit hash that passed independent review. The command guard refuses to push any other commit. |
| Branch ruleset | Server-side rules on the hosting platform (GitHub rulesets). The agent cannot bypass them. |
| Required check | A named CI job that must be green before a pull request can merge. |
| Auto-merge | The platform merges a pull request by itself once every gate is green. The agent only arms it. |
| PR watch | The session that opened a pull request keeps receiving its CI failures, conflicts, and review comments. Runtime-dependent; the fallback is polling. |
| Validator | A reviewer agent with a fresh context, the diff, and the spec. The builder never validates its own work. |
| Worktree | A separate git worktree per session, so concurrent agents never share a checkout. |

## Branch model

| Branch | Environment | Who merges into it | How |
|---|---|---|---|
| `feature/*`, `fix/*`, `ci/*` | Per-branch preview | Nobody. PRs come from here. | Cut from `develop` in a worktree |
| `develop` | Staging | Agents | Auto-merge, squash, once gates are green |
| `main` | Production | One human | Clicks merge on a green PR |

The human gate sits on `main`, not `develop`, because CI proves the code runs but cannot prove the feature matches what the user meant or looks right. Merging into `develop` deploys staging, where the human checks that for free. The gate goes away when browser end-to-end tests cover the real flows.

## Enforcement layers

Each layer catches what the one above it cannot. Never rely on one alone.

| Layer | Lives in | Stops | Can an agent bypass it? |
|---|---|---|---|
| 1. Instructions | `AGENTS.md`, the pipeline skill, `docs/decisions/merge-policy.md` | Nothing by itself. Explains the rules and the why. | Yes, by forgetting. |
| 2. Command guard | `reference/command-guard.sh`, wired to the runtime | Hook bypasses (`--no-verify`), force pushes, direct pushes to protected branches, every direct merge path, `rm -rf /`, pushes of unreviewed commits | Only by editing the guard. Fails closed. |
| 3. Edit formatter | `reference/format-on-edit.sh` | Style drift before it reaches a commit | Non-blocking by design. |
| 4. Git hooks | `pre-commit` (staged-only format and lint-fix), `pre-push` (typecheck, unit tests) | Broken commits and pushes | With `--no-verify`, which layer 2 blocks. |
| 5. Branch rulesets | Hosting platform, `reference/github-setup.sh` | Deletion, non-fast-forward, merges without a PR, merges with failing required checks, merges with unresolved review threads | No. Zero bypass actors. |
| 6. Required checks | `reference/ci.yml` | Type errors, lint, format, coverage below floor, failed build | No. |
| 7. Architecture linting | Lint config: max file length, layer import rules, no untyped escape hatches | Structural violations that review would miss | No. |
| 8. Deploy gate | `reference/deploy.yml`: runs on CI success, secrets scoped per environment | Deploying red code, previews reaching production secrets | No. |
| 9. Human merge on `main` | Ruleset plus layers 2 and 5 | Anything the machines cannot judge | No. |

Advisory, not gating: an AI review action in CI posts inline review threads on every PR. It is not a required check. Dependabot targets `develop`; a workflow arms auto-merge for action bumps and non-major package bumps. Majors wait for a human.

## Development pipeline

Stages run in order. Each hands the next a concrete artifact.

0. **Intake.** Brainstorm with the human until there is a spec with a user story and acceptance criteria in `docs/features/<feature>/`. Stop for human approval of the design.
1. **Plan.** Write an implementation plan. Create a worktree on `feature/<name>` cut from `develop`.
2. **Build.** One fresh implementer per plan task, test first. The edit formatter runs on every write. After each task, an independent reviewer checks the task against the plan.
3. **Self-check.** Run the full local gate, the same commands CI runs, and read the output. For UI work, open the feature in a browser and attach a screenshot to the PR.
4. **Validate.** Independent validators, in order: correctness and test-coverage review, security review, confidence-scored code review. Fix findings, rerun stage 3. At most two rounds, then list open findings in the PR for the human. Finish with a simplification pass. When clean: commit, then write the review marker with `reference/mark-reviewed.sh`. Any later commit invalidates it and needs the review rerun.
5. **Ship.** Open the PR against `develop` using the PR template. Enable PR watch so failures return to this session. Arm auto-merge with squash. Never arm auto-merge on a PR into `main`.

## Rules agents get wrong

- **Never push to `main` or `develop`.** Open a PR. The guard blocks the push; the ruleset blocks it again.
- **Never merge directly.** Arming auto-merge on a `develop` PR is the only merge action an agent takes. A merge command without the auto flag, REST or GraphQL merge calls, and `curl` to merge endpoints are all blocked.
- **Never merge another session's PR.** It may have commits in flight. One such merge left a broken workflow on `main` that took another PR to repair.
- **Never resolve a review thread you did not address.** Thread resolution is a merge gate on both branches.
- **Never edit the shared root checkout.** Other sessions switch branches there. Always work in your own worktree.
- **Never write the review marker without running the validators.** The marker is an honour system. The CI review action is the backstop, not a substitute.

## Setup checklist for a new repository

Prerequisites: the repository exists on the platform with a default branch, `gh` is authenticated with admin rights, `jq` is installed. The templates in `reference/` carry this repo's stack (Node and Python). Keep their shape, swap the toolchain per package. Commit steps 1 to 9 directly to the default branch before step 10, because once the rulesets exist nothing merges until the required checks run.

1. **Review routing.** `.github/CODEOWNERS` with `* @<maintainer handle>`. Copy `reference/pull_request_template.md`.
2. **CI.** Copy `reference/ci.yml`. One job per package with a stable `name:`; those names become the required checks in step 10. Each job runs typecheck, lint, format check, tests with a coverage floor, and build. Set the floor to today's coverage (zero for a new repo) and ratchet it up. Encode architecture rules in lint config so review never has to.
3. **Deploy.** Copy `reference/deploy.yml`. It triggers on the CI workflow completing with success, push events only. `feature/**` deploys a preview, `develop` deploys staging. Create the `preview`, `staging`, and `production` environments on the platform and put each one's secrets only in its own scope.
4. **Dependencies.** Copy `reference/dependabot.yml` and `reference/dependabot-automerge.yml`. Target `develop`, group bumps, auto-merge non-major.
5. **Git hooks.** `pre-commit` formats and lint-fixes staged files only. `pre-push` runs typecheck and unit tests. Install with husky or `git config core.hooksPath`. Examples in `reference/git-hooks/`.
6. **Command guard.** Copy `reference/command-guard.sh` and `reference/command-guard.test.sh`. Set `PROTECTED_BRANCHES` if your names differ. Run the test from inside the repo. Wire the guard as the runtime's pre-execution hook per `reference/runtime-wiring.md`. A runtime with no such hook gets the git `pre-push` fallback from that file instead, never both.
7. **Edit formatter.** Adapt the path patterns and formatters in `reference/format-on-edit.sh`. Wire it as the runtime's post-edit hook with a time limit if the runtime offers one. Never let it block.
8. **Review marker.** Copy `reference/mark-reviewed.sh`. Reference it from stage 4 of your pipeline skill.
9. **Instructions.** Add the block in `reference/AGENTS.md.template` to your `AGENTS.md`. Write a `feature-pipeline` skill that names your validators and your exact gate commands. Write `docs/decisions/merge-policy.md` from the Branch model section and the paragraph under it in this file.
10. **Branches and rulesets.** Run `reference/github-setup.sh owner/repo "<job name>" "<job name>"` with the job names from step 2. It creates `develop` from the default branch if missing, enables auto-merge on the repository, and upserts both rulesets: PR required, the named checks required, review threads resolved, no deletion, no force push, zero bypass actors.
11. **Verify.** Run the guard test. Open a throwaway PR into `develop`. Confirm the three gates (checks, threads, auto-merge) behave. Confirm a direct push and a direct merge are refused at both the guard and the ruleset.

Renaming the staging branch means changing it in `ci.yml`, `deploy.yml`, both Dependabot files, `PROTECTED_BRANCHES`, and `STAGING_BRANCH` for the setup script.

## Design decisions and why

- **The guard matches raw command text and fails closed.** An earlier version stripped commit messages and heredoc bodies before matching. A heredoc it could not parse swallowed the rest of the command and let a push through. A false positive costs one retry. A false negative costs a bypass. Keep it dumb.
- **The guard judges the repository the command runs in**, not a configured project path, so worktrees check their own HEAD and their own marker.
- **Only arming auto-merge is allowed.** The merge itself is done by the platform under the ruleset. The merge decision stays server-side where the agent cannot influence it.
- **Approvals on `main`: one by default, zero in this repo for now.** The setup script defaults to one approving review. Here every agent session acts under the maintainer's account, so every agent PR is authored by the maintainer, and an author cannot approve their own PR. With one human account, a one-approval rule blocks everything, so this repo runs with zero and the human step is the click on merge, with the guard keeping agents off that button. Set it back to one as soon as agents get their own identity or a second human joins.
- **Coverage floors are today's numbers, not targets.** A floor above current coverage blocks every PR on day one. Ratchet as tests land.
- **PR watch is per PR.** There is no global default. Each session flips it on the PR it opened. Taking over a PR means binding to it and flipping it again.
- **Deploys hang off CI success, not off push.** A red push never deploys, and preview deploys use only the preview environment's secrets.
- **Concurrency groups cancel in-progress runs per ref**, so a burst of agent pushes does not queue stale runs.

## Known gaps

- The review marker is an honour system. The CI review action is the hard backstop. A real fix has the validators write the marker themselves, or a required CI check that runs them.
- No browser end-to-end tests yet. When they exist, every feature spec must name the browser test that proves it, and the human gate on `main` can move to automation.
- Agents share one hosting-platform identity. See the approvals note above.

#!/bin/bash
# One-time hosting-platform setup (GitHub). Safe to rerun: rulesets are upserted by name.
# Needs `gh` authenticated with admin rights on the repository and `jq`.
#
#   reference/github-setup.sh owner/repo "Frontend checks" "Backend checks" "Documentation build"
#
# Env: STAGING_BRANCH (default develop), MAIN_APPROVALS (default 1). Set MAIN_APPROVALS=0 only while
# every agent acts under the one human's account, see SKILL.md "Approvals on main"; then the command
# guard is the only thing keeping agents off the production merge button.
set -euo pipefail
REPO=${1:?usage: github-setup.sh owner/repo "check name" ["check name" ...]}; shift
[ $# -gt 0 ] || { echo "name at least one required check (a CI job's name:)" >&2; exit 1; }
STAGING=${STAGING_BRANCH:-develop}
default=$(gh api "repos/$REPO" -q .default_branch)

# 1. Staging branch from the default branch.
gh api "repos/$REPO/git/ref/heads/$STAGING" >/dev/null 2>&1 || {
  sha=$(gh api "repos/$REPO/git/ref/heads/$default" -q .object.sha)
  gh api -X POST "repos/$REPO/git/refs" -f ref="refs/heads/$STAGING" -f sha="$sha" >/dev/null
  echo "created $STAGING from $default"
}

# 2. Repository merge settings: the platform may auto-merge, squash is available.
gh repo edit "$REPO" --enable-auto-merge --enable-squash-merge >/dev/null

# 3. Rulesets. Same shape on both branches; only the approval count differs.
checks=$(printf '%s\n' "$@" | jq -R '{context:.}' | jq -s .)
ruleset() { # name ref approvals
  jq -n --arg name "$1" --arg ref "$2" --argjson approvals "$3" --argjson checks "$checks" '{
    name: $name, target: "branch", enforcement: "active", bypass_actors: [],
    conditions: { ref_name: { include: [$ref], exclude: [] } },
    rules: [
      { type: "deletion" },
      { type: "non_fast_forward" },
      { type: "pull_request", parameters: {
          required_approving_review_count: $approvals,
          dismiss_stale_reviews_on_push: true,
          require_code_owner_review: false,
          require_last_push_approval: false,
          required_review_thread_resolution: true,
          allowed_merge_methods: ["merge", "squash", "rebase"] } },
      { type: "required_status_checks", parameters: {
          strict_required_status_checks_policy: false,
          do_not_enforce_on_create: false,
          required_status_checks: $checks } }
    ] }'
}
upsert() { # name  (ruleset JSON on stdin)
  id=$(gh api --paginate "repos/$REPO/rulesets" -q ".[] | select(.name == \"$1\") | .id" | head -1)
  if [ -n "$id" ]; then gh api -X PUT "repos/$REPO/rulesets/$id" --input - >/dev/null; echo "updated ruleset: $1"
  else gh api -X POST "repos/$REPO/rulesets" --input - >/dev/null; echo "created ruleset: $1"; fi
}
ruleset "protect $STAGING" "refs/heads/$STAGING" 0 | upsert "protect $STAGING"
ruleset "protect $default" "~DEFAULT_BRANCH" "${MAIN_APPROVALS:-1}" | upsert "protect $default"
echo "done. Required checks: $*"

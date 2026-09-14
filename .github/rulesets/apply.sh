#!/bin/bash
# Rulesets as code. The JSON files here are the source of truth for the GitHub rulesets.
#   apply.sh check   compare live rulesets to the files; exit 1 on drift (CI runs this)
#   apply.sh apply   PUT each file to its live ruleset by name (needs repo admin; run by a human)
# Changing a ruleset = editing the JSON in a PR, merging, then running `apply`.
set -euo pipefail
cd "$(dirname "$0")"
repo=${GITHUB_REPOSITORY:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}
fields='{name, target, enforcement, conditions, rules, bypass_actors}'
status=0
for f in *.json; do
  name=$(jq -r .name "$f")
  id=$(gh api "repos/$repo/rulesets" --jq ".[] | select(.name==\"$name\") | .id")
  case "${1:-check}" in
    check)
      if [ -z "$id" ]; then echo "DRIFT: ruleset '$name' does not exist on GitHub"; status=1; continue; fi
      live=$(gh api "repos/$repo/rulesets/$id" --jq "$fields" | jq -S .)
      want=$(jq -S . "$f")
      # bypass_actors is only visible to a token with administration read (a PAT). The default
      # Actions token sees null, so compare without it and say so; an admin token compares fully.
      if [ "$(echo "$live" | jq .bypass_actors)" = null ]; then
        echo "note: bypass_actors not visible to this token; run check with an admin token to cover it"
        live=$(echo "$live" | jq -S 'del(.bypass_actors)'); want=$(echo "$want" | jq -S 'del(.bypass_actors)')
      fi
      if [ "$live" != "$want" ]; then
        echo "DRIFT: ruleset '$name' differs from $f"; diff <(echo "$live") <(echo "$want") || true; status=1
      else echo "ok: $name"; fi ;;
    apply)
      if [ -z "$id" ]; then gh api -X POST "repos/$repo/rulesets" --input "$f" --jq '"created: \(.name) (\(.id))"'
      else gh api -X PUT "repos/$repo/rulesets/$id" --input "$f" --jq '"applied: \(.name) (\(.id))"'; fi ;;
    *) echo "usage: apply.sh check|apply" >&2; exit 2 ;;
  esac
done
exit $status

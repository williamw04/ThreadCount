#!/bin/bash
# Command guard. Run it before every shell command the agent issues, from inside the repository.
# Exit 0 allows. Exit 2 blocks and prints the reason on stderr for the agent to read.
#
# Input, first match wins (a runtime that passes any positional argument disables the stdin path):
#   $1                                                 the command text
#   stdin JSON  {"tool_input":{"command":"..."}}  or  {"command":"..."}
#   stdin       raw command text
#
# Matches the raw command text and fails closed. No prose stripping: an earlier version
# stripped -m payloads and heredoc bodies before matching, and a heredoc it could not parse
# swallowed the rest of the command and let pushes through. A commit message or grep that
# merely mentions a forbidden command is blocked too; reword it (e.g. "git-push").
# False positives cost one retry, false negatives cost a bypass. Keep it dumb.
#
# Config (environment):
#   PROTECTED_BRANCHES   space-separated, default "main develop"
#   REVIEW_MARKER_NAME   file under the git directory, default REVIEWED

if [ $# -gt 0 ]; then cmd=$1; else
  raw=$(cat)
  cmd=$(printf '%s' "$raw" | jq -r '.tool_input.command // .command // empty' 2>/dev/null)
  [ -n "$cmd" ] || cmd=$raw
fi
protected=${PROTECTED_BRANCHES:-main develop}
[ -n "${protected// /}" ] || protected="main develop"
# Escape regex metacharacters, then join with |. printf never globs, unlike an unquoted expansion.
branches=$(printf '%s' "$protected" | sed 's/[][\.*^$+?(){}|]/\\&/g' | tr -s ' ' '|')
qs="\"'"        # a double quote and a single quote, for the character classes below
S='[[:space:]]'; SC='[:space:]'   # SC is the form for use inside another bracket expression
gitpush="git\b[^|;&]*\bpush\b"   # git -C x push, git -c k=v push, git --no-pager push all count

block() { echo "blocked by command-guard: $1" >&2; exit 2; }

# 1. No hook bypass, no force push, no direct push to a protected branch, no rm -rf /.
# A grep error (an unparsable pattern) blocks too: fail closed.
pat="--no-veri|core\.hooksPath|$gitpush[^|;&]*(--force|--mirror|--all\b|$S-[[:alpha:]]*f[[:alpha:]]*\b|(^|[$SC:/+$qs])($branches)([$SC$qs;)+:]|\$))|rm$S+-rf$S+/($S|\$)"
echo "$cmd" | grep -qE -- "$pat"; [ $? -eq 1 ] ||
  block "no --no-verify, force pushes, pushes to $protected, or rm -rf /. Open a PR instead. If this only appears in text (commit message, grep), reword it."

# 2. No direct merges. Merging is the platform's auto-merge on a staging PR or a human's click on a
# production PR. `gh pr merge --auto` only arms auto-merge, which the rulesets govern, so it is allowed.
# Blocked: gh pr merge without a standalone --auto, gh alias (could alias a merge), REST and GraphQL
# merges via gh api, and curl to the API. Comments are dropped before the --auto check so "# --auto" cannot exempt.
merge_cmd=$(echo "$cmd" | tr ';|&' '\n' | grep -E "gh$S+pr$S+merge\b" | sed 's/#.*//' | grep -vE -- "(^|$S)--auto($S|\$)")
if [ -n "$merge_cmd" ] || echo "$cmd" | grep -qiE "gh$S+alias\b|gh$S+api\b[^|;&]*(/merges?\b|graphql)|api\.github\.com[^|;&]*/merges?\b"; then
  block "no direct merges. Arm auto-merge on a staging PR (gh pr merge --auto --squash); a human merges production PRs."
fi

# 3. Push gate: HEAD must carry the review marker written by mark-reviewed.sh. Any new commit
# invalidates it. Evaluated in the current directory so worktrees check their own HEAD and marker.
# Honour system: an agent could write the marker without reviewing. CI review is the hard backstop.
if echo "$cmd" | grep -qE "$gitpush"; then
  head=$(git rev-parse HEAD 2>/dev/null) || block "run the guard from inside the repository (no HEAD here)."
  marker="$(git rev-parse --git-dir)/${REVIEW_MARKER_NAME:-REVIEWED}"
  [ "$(cat "$marker" 2>/dev/null)" = "$head" ] ||
    block "HEAD ${head:0:7} has not been reviewed. Run the validation stage, fix findings, then run mark-reviewed.sh and push again. If 'git push' only appears in text, reword it."
fi
exit 0

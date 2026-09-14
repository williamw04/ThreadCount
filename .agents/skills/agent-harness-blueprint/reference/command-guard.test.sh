#!/bin/bash
# Self-check for command-guard.sh. Run from inside any git repository: reference/command-guard.test.sh
dir="$(cd "$(dirname "$0")" && pwd)"; guard="$dir/command-guard.sh"
marker="$(git rev-parse --git-dir)/${REVIEW_MARKER_NAME:-REVIEWED}"; saved=$(cat "$marker" 2>/dev/null)
tmp=$(mktemp -d)
restore() { if [ -n "$saved" ]; then echo "$saved" > "$marker"; else rm -f "$marker"; fi; rm -rf "$tmp"; }; trap restore EXIT INT TERM
run() { "$guard" "$1" 2>/dev/null; }
blocked() { run "$1"; [ $? -eq 2 ] || { echo "FAIL should block: $1"; exit 1; }; }
allowed() { run "$1" || { echo "FAIL should allow: $1"; exit 1; }; }

git rev-parse HEAD > "$marker"   # reviewed HEAD, so only the command rules decide below
blocked 'git commit --no-verify -m x'; blocked 'git push --force'; blocked 'git push -f origin feat'
blocked 'git push origin main'; blocked 'git push -u origin main'; blocked 'git push origin HEAD:main'; blocked 'rm -rf /'
blocked 'git push origin "main"'; blocked "git push origin 'main'"; blocked 'git push origin +main'
blocked 'npm test && git push origin main'; blocked 'eval "git push origin main"'; blocked "sh -c 'git push --force'"
blocked 'if true; then git push --force; fi'
blocked $'cat <<EOF1\nbody\nEOF1\ngit push origin main'; blocked $'cat <<< "hi"\ngit push --force'   # no stripping to fool
blocked 'git push origin develop'; blocked 'git push -u origin HEAD:develop'
blocked 'gh pr merge 12 --merge'; blocked 'gh pr merge 12'; blocked 'gh api -X PUT repos/o/r/pulls/12/merge'
blocked 'PR=12; gh api -X PUT "repos/o/r/pulls/${PR}/merge"'; blocked 'gh api graphql -f query=mutation{mergePullRequest}'
blocked 'gh alias set m "pr merge"'; blocked 'curl -X PUT https://api.github.com/repos/o/r/pulls/12/merge'
blocked 'gh api repos/o/r/merges -f base=develop -f head=feature/x'
blocked 'gh pr merge 12 --auto --squash && gh pr merge 13 --squash'   # a direct merge hiding behind an --auto one
allowed 'gh pr merge 12 --auto --squash'; allowed 'gh pr merge --auto --squash --delete-branch 12'   # arms auto-merge only
allowed 'gh pr view 12'; allowed 'gh pr checks 12'; allowed 'gh pr create --base develop'; allowed 'gh api repos/o/r/pulls/12/files'
allowed 'git merge origin/develop'; allowed 'git log --merges'; allowed 'git push origin feature/develop-x'
allowed 'git commit -m "main menu"'; allowed 'npm run build'; allowed 'git log main..HEAD'
allowed 'git push -u origin feature/x'; allowed 'git push origin feature/main-menu'
# Known false positive, by design (fail closed): prose that spells out a forbidden command.
blocked 'git commit -m "guard refuses git push to main unless reviewed"'

# stdin JSON and raw stdin inputs
printf '{"tool_input":{"command":"git push --force"}}' | "$guard" 2>/dev/null; [ $? -eq 2 ] || { echo "FAIL stdin json"; exit 1; }
printf 'git push --force' | "$guard" 2>/dev/null; [ $? -eq 2 ] || { echo "FAIL stdin raw"; exit 1; }

# custom protected branches: regex metacharacters and globs must not weaken the rules
PROTECTED_BRANCHES="trunk staging" blocked 'git push origin trunk'
PROTECTED_BRANCHES="trunk staging" allowed 'git push origin feature/main'
PROTECTED_BRANCHES="rel(1" blocked 'git push --force'; PROTECTED_BRANCHES="rel(1" blocked 'git push origin rel(1'
PROTECTED_BRANCHES="release/*" blocked 'git push origin release/*'; PROTECTED_BRANCHES="release/*" allowed 'git push origin release/z'
PROTECTED_BRANCHES=" " blocked 'git push origin main'

# combined flags, git options before the verb, option prefixes, comment and =false tricks
blocked 'git push -fu origin feat'; blocked 'git -C . push --force'; blocked 'git -c k=v push origin main'
blocked 'git --no-pager push origin main'; blocked 'git commit --no-verif -m x'; blocked 'git -c core.hooksPath=/dev/null commit -m x'
blocked 'git push --mirror origin'; blocked 'git push --all origin'
blocked 'gh pr merge 12 --squash --auto=false'; blocked 'gh pr merge 12 --squash # --auto'; blocked 'curl -X PUT https://API.GITHUB.COM/repos/o/r/pulls/12/merge'

rm -f "$marker";               blocked 'git push -u origin feature/x'   # no marker
echo "0000000" > "$marker";    blocked 'git push'                       # stale marker
git rev-parse HEAD > "$marker"; allowed 'git push -u origin feature/x'  # reviewed HEAD

# Worktree/other-repo: the gate judges the repo the push runs in, not the one the guard lives in.
git -C "$tmp" init -q && git -C "$tmp" -c user.email=t@t -c user.name=t commit -q --allow-empty -m x
(cd "$tmp" && blocked 'git push origin feature/x')
(cd /tmp && blocked 'git -C somewhere push origin feature/x')   # outside any repo: fail closed
echo "command-guard.sh OK"

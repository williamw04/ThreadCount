#!/bin/bash
# Self-check for guard-bash.sh. Run: .claude/hooks/check.sh
cd "$(dirname "$0")" && root="$(git rev-parse --show-toplevel)"
marker="$(git rev-parse --git-dir)/REVIEWED"; saved=$(cat "$marker" 2>/dev/null)
tmp=$(mktemp -d)
restore() { if [ -n "$saved" ]; then echo "$saved" > "$marker"; else rm -f "$marker"; fi; rm -rf "$tmp"; }; trap restore EXIT INT TERM
run() { jq -n --arg c "$1" '{tool_input:{command:$c}}' | "$root/.claude/hooks/guard-bash.sh" 2>/dev/null; }
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
blocked 'gh pr merge 12 --merge'; blocked 'gh pr merge --auto --squash'; blocked 'gh api -X PUT repos/o/r/pulls/12/merge'
blocked 'PR=12; gh api -X PUT "repos/o/r/pulls/${PR}/merge"'; blocked 'gh api graphql -f query=mutation{mergePullRequest}'
blocked 'gh alias set m "pr merge"'; blocked 'curl -X PUT https://api.github.com/repos/o/r/pulls/12/merge'
blocked 'gh api repos/o/r/merges -f base=develop -f head=feature/x'
allowed 'gh pr view 12'; allowed 'gh pr checks 12'; allowed 'gh pr create --base develop'; allowed 'gh api repos/o/r/pulls/12/files'
allowed 'git merge origin/develop'; allowed 'git log --merges'; allowed 'git push origin feature/develop-x'

# deny-auto-merge.sh must block, and must be wired to the set_auto_merge tool in settings.json.
"$root/.claude/hooks/deny-auto-merge.sh" </dev/null 2>/dev/null; [ $? -eq 2 ] || { echo "FAIL deny-auto-merge.sh should exit 2"; exit 1; }
jq -e '.hooks.PreToolUse[] | select(.matcher=="mcp__ccd_pr__set_auto_merge") | .hooks[0].command | test("deny-auto-merge.sh")' "$root/.claude/settings.json" >/dev/null || { echo "FAIL deny-auto-merge.sh not wired in settings.json"; exit 1; }
allowed 'git commit -m "main menu"'; allowed 'npm run build'; allowed 'git log main..HEAD'
allowed 'git push -u origin feature/x'; allowed 'git push origin feature/main-menu'
# Known false positive, by design (fail closed): prose that spells out a forbidden command.
blocked 'git commit -m "guard refuses git push to main unless reviewed"'

rm -f "$marker";               blocked 'git push -u origin feature/x'   # no marker
echo "0000000" > "$marker";    blocked 'git push'                       # stale marker
git rev-parse HEAD > "$marker"; allowed 'git push -u origin feature/x'  # reviewed HEAD

# Worktree/other-repo: the gate must judge the repo the push runs in, not CLAUDE_PROJECT_DIR.
git -C "$tmp" init -q && git -C "$tmp" -c user.email=t@t -c user.name=t commit -q --allow-empty -m x
(cd "$tmp" && CLAUDE_PROJECT_DIR="$root" blocked 'git push origin feature/x')
echo "guard-bash.sh OK"

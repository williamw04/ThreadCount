#!/bin/bash
# Self-check for guard-bash.sh. Run: .claude/hooks/check.sh
cd "$(dirname "$0")" && export CLAUDE_PROJECT_DIR="$(git rev-parse --show-toplevel)"
marker="$(git rev-parse --git-dir)/REVIEWED"; saved=$(cat "$marker" 2>/dev/null)
restore() { [ -n "$saved" ] && echo "$saved" > "$marker" || rm -f "$marker"; }; trap restore EXIT
run() { echo "{\"tool_input\":{\"command\":\"$1\"}}" | ./guard-bash.sh 2>/dev/null; }
blocked() { run "$1"; [ $? -eq 2 ] || { echo "FAIL should block: $1"; exit 1; }; }
allowed() { run "$1" || { echo "FAIL should allow: $1"; exit 1; }; }

blocked 'git commit --no-verify -m x'; blocked 'git push --force'; blocked 'git push -f origin feat'
blocked 'git push origin main'; blocked 'git push -u origin main'; blocked 'rm -rf /'
allowed 'git commit -m "main menu"'; allowed 'npm run build'; allowed 'git log main..HEAD'
allowed 'git commit -m "guard refuses git push to main unless reviewed"'   # prose, not a command
blocked 'npm test && git push origin main'                                  # command after &&

rm -f "$marker";                      blocked 'git push -u origin feature/x'   # no marker
echo "0000000" > "$marker";           blocked 'git push'                       # stale marker
git rev-parse HEAD > "$marker";       allowed 'git push -u origin feature/x'   # reviewed HEAD
echo "guard-bash.sh OK"

#!/bin/bash
# Self-check for guard-bash.sh. Run: .claude/hooks/check.sh
cd "$(dirname "$0")"
blocked() { echo "{\"tool_input\":{\"command\":\"$1\"}}" | ./guard-bash.sh 2>/dev/null; [ $? -eq 2 ] || { echo "FAIL should block: $1"; exit 1; }; }
allowed() { echo "{\"tool_input\":{\"command\":\"$1\"}}" | ./guard-bash.sh 2>/dev/null || { echo "FAIL should allow: $1"; exit 1; }; }
blocked 'git commit --no-verify -m x'; blocked 'git push --force'; blocked 'git push -f origin feat'; blocked 'git push origin main'; blocked 'git push -u origin main'; blocked 'rm -rf /'
allowed 'git push -u origin feature/x'; allowed 'git commit -m "main menu"'; allowed 'npm run build'; allowed 'git log main..HEAD'
echo "guard-bash.sh OK"

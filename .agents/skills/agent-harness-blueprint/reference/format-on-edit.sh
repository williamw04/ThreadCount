#!/bin/bash
# Edit formatter. Run it after every file the agent writes. Never blocks: always exits 0.
# Input: the file path as $1, or stdin JSON {"tool_input":{"file_path":"..."}} / {"file_path":"..."}.
# Adapt the case arms to your formatters. The arms below are this repo's (ruff, prettier, eslint).
if [ $# -gt 0 ]; then f=$1; else f=$(jq -r '.tool_input.file_path // .file_path // empty' 2>/dev/null); fi
[ -n "$f" ] || exit 0
root=$(git -C "$(dirname "$f")" rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0
case "$f" in
  */backend/*.py)
    RUFF=backend/.venv/bin/ruff; [ -x "$RUFF" ] || RUFF=$(command -v ruff) || { echo "ruff not installed; skipped" >&2; exit 0; }
    "$RUFF" format "$f" && "$RUFF" check --fix "$f" ;;
  */frontend/*.ts|*/frontend/*.tsx)
    cd frontend && npx prettier --write "$f" >/dev/null && npx eslint --fix "$f" ;;
esac
exit 0

#!/bin/bash
# PostToolUse(Edit|Write): format and lint-fix the touched file. Non-blocking.
f=$(jq -r '.tool_input.file_path // empty'); [ -n "$f" ] || exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0
case "$f" in
  */backend/*.py)
    RUFF=backend/.venv/bin/ruff; [ -x "$RUFF" ] || RUFF=$(command -v ruff) || { echo "ruff not installed; skipped" >&2; exit 0; }
    $RUFF format "$f" && $RUFF check --fix "$f" ;;
  */apps/web/*.ts|*/apps/web/*.tsx)
    cd apps/web && npx prettier --write "$f" >/dev/null && npx eslint --fix "$f" ;;
  */packages/shared/*.ts)
    cd packages/shared && npx prettier --write "$f" >/dev/null && npx eslint --fix "$f" ;;
esac
exit 0

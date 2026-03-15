#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PYTHON="$ROOT_DIR/.venv/bin/python"

if [ ! -x "$VENV_PYTHON" ]; then
  echo "Missing backend/.venv. Create it with: python3.12 -m venv backend/.venv"
  exit 1
fi

exec "$VENV_PYTHON" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

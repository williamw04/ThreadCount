#!/bin/bash
# Records that HEAD passed the validation stage. command-guard.sh refuses to push without it.
# Run it only after the independent validators are clean. Any new commit invalidates the marker.
cd "$(git rev-parse --show-toplevel)" && git rev-parse HEAD > "$(git rev-parse --git-dir)/${REVIEW_MARKER_NAME:-REVIEWED}" && echo "marked $(git rev-parse --short HEAD) as reviewed"

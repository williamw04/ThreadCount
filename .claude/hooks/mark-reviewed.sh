#!/bin/bash
# Records that HEAD passed stage 4 review. guard-bash.sh refuses to push without it.
cd "$(git rev-parse --show-toplevel)" && git rev-parse HEAD > "$(git rev-parse --git-dir)/REVIEWED" && echo "marked $(git rev-parse --short HEAD) as reviewed"

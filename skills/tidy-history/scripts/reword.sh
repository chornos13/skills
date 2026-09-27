#!/usr/bin/env bash
# reword.sh <subject> — give HEAD a new subject; its current message (all squashed messages) becomes the body.
set -euo pipefail
body=$(git log -1 --format=%B | git stripspace --strip-comments)
git commit --amend --no-verify --allow-empty -q -m "$1" -m "$body"

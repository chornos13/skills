#!/usr/bin/env bash
# message.sh <file> — replace HEAD's whole message (subject and body) with the file's.
set -euo pipefail
git commit --amend --no-verify --allow-empty -q --cleanup=strip -F "$1"

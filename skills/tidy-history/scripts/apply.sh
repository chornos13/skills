#!/usr/bin/env bash
# apply.sh <result-sha> <original-sha> [worktree] — point the current branch at a proven dry-run result.
set -euo pipefail
result=$1; orig=$2; wt=${3:-}
branch=$(git symbolic-ref --short HEAD) || { echo "REFUSED: not on a branch"; exit 1; }
[ "$(git rev-parse HEAD)" = "$(git rev-parse "$orig")" ] || { echo "REFUSED: $branch moved since the dry-run; dry-run again"; exit 1; }
[ -z "$(git status --porcelain --untracked-files=no)" ] || { echo "REFUSED: uncommitted changes"; exit 1; }
[ -z "$(git diff "$orig" "$result")" ] || { echo "REFUSED: result tree differs from original"; exit 1; }
backup="refs/tidy-history/$branch/$(date +%Y%m%d-%H%M%S)"
git update-ref "$backup" "$orig"
git reset -q --hard "$result"
echo "APPLIED: $branch -> $(git rev-parse --short HEAD); backup at $backup"
if [ -z "$(git diff "$backup" HEAD)" ]; then echo "VERIFIED: tree identical to the original; no code lost"; else echo "MISMATCH: see git diff $backup HEAD"; exit 2; fi
[ -z "$wt" ] || git worktree remove --force "$wt"
if up=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null); then
  echo "NOTE: $branch tracks $up; publishing needs: git push --force-with-lease"
fi

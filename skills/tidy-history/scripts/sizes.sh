#!/usr/bin/env bash
# sizes.sh <base> [ref] [-- <exclude pathspec>...] — lines added/removed per commit, for the reviewability check.
set -euo pipefail
base=$1; ref=${2:-HEAD}; shift $(( $# >= 2 ? 2 : 1 )); [ "${1:-}" = "--" ] && shift
ex=(); for p in "$@"; do ex+=(":!$p"); done
for c in $(git rev-list --reverse "$base..$ref"); do
  git show --numstat --format= "$c" -- . "${ex[@]}" | awk -v s="$(git log -1 --format='%h %s' "$c" | cut -c1-70)" \
    '{a+=$1; d+=$2; n++} END {printf "%-72s %4d files  +%-6d -%d\n", s, n, a, d}'
done

#!/usr/bin/env bash
# dry-run.sh <base> <plan-file> — replay a plan in a throwaway worktree; the branch is never touched.
# Plan lines: pick|squash|fixup|drop <sha> [comment], `subject <text>` to retitle the commit just built,
# or `message <file>` to replace its whole message (subject and body).
# Exit: 0 proven (tree identical), 1 plan/coverage/conflict error, 2 replayed but tree differs.
set -euo pipefail
base=$(git rev-parse --verify "$1^{commit}"); plan=$2
here=$(cd "$(dirname "$0")" && pwd)
orig=$(git rev-parse HEAD)

if [ -n "$(git rev-list --merges "$base..$orig")" ]; then
  echo "REFUSED: merge commits above base; move the base above them:"; git log --merges --format='  %h %s' "$base..$orig"; exit 1
fi

todo=$(mktemp); : > "$todo"; seen=$(mktemp); : > "$seen"
# A commit built from squashes keeps every squashed message unless a `message` line rewrites it.
group=""; squashes=0; rewritten=0; unwritten=""
close_group() {
  if [ "$squashes" -gt 0 ] && [ "$rewritten" = 0 ]; then unwritten="$unwritten $group"; fi
  squashes=0; rewritten=0
}
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    ''|'#'*) ;;
    subject\ *) printf 'exec %q %q\n' "$here/reword.sh" "${line#subject }" >> "$todo" ;;
    message\ *)
      file=$(realpath -e "${line#message }" 2>/dev/null) || { echo "PLAN ERROR: no message file: ${line#message }"; exit 1; }
      printf 'exec %q %q\n' "$here/message.sh" "$file" >> "$todo"; rewritten=1 ;;
    pick\ *|squash\ *|fixup\ *|drop\ *)
      read -r verb sha _ <<< "$line"
      full=$(git rev-parse --verify -q "$sha^{commit}") || { echo "PLAN ERROR: unknown commit $sha"; exit 1; }
      case "$verb" in
        pick) close_group; group=$(git rev-parse --short "$full") ;;
        squash) squashes=$((squashes + 1)) ;;
      esac
      echo "$full" >> "$seen"; echo "$verb $full" >> "$todo" ;;
    *) echo "PLAN ERROR: cannot read line: $line"; exit 1 ;;
  esac
done < "$plan"
close_group

missing=$(comm -23 <(git rev-list "$base..$orig" | sort) <(sort -u "$seen"))
extra=$(comm -13 <(git rev-list "$base..$orig" | sort) <(sort -u "$seen"))
dupes=$(sort "$seen" | uniq -d)
if [ -n "$missing$extra$dupes" ]; then
  echo "COVERAGE ERROR: every commit above base must appear exactly once"
  for s in $missing; do echo "  missing: $(git log -1 --format='%h %s' "$s")"; done
  for s in $extra;   do echo "  not above base: $(git log -1 --format='%h %s' "$s")"; done
  for s in $dupes;   do echo "  listed twice: $(git log -1 --format='%h %s' "$s")"; done
  exit 1
fi

wt=$(mktemp -d /tmp/tidy-history.XXXXXX)
git worktree add -q --detach "$wt" "$orig"
repo=$PWD; proven=0
cleanup() { [ "$proven" = 1 ] && return; cd "$repo"; git -C "$wt" rebase --abort 2>/dev/null || true; git worktree remove --force "$wt" 2>/dev/null || true; }
trap cleanup EXIT
cd "$wt"
if ! GIT_SEQUENCE_EDITOR="cp $todo" GIT_EDITOR=true \
     git -c core.hooksPath=/dev/null -c commit.gpgsign=false rebase -i "$base" >/dev/null 2>&1; then
  gd=$(git rev-parse --git-dir)
  echo "CONFLICT while applying: $(tail -1 "$gd/rebase-merge/done" 2>/dev/null | cut -c1-60)"
  echo "$(git log -1 --format='  %h %s' "$(tail -1 "$gd/rebase-merge/done" | awk '{print $2}')" 2>/dev/null)"
  git diff --name-only --diff-filter=U | sed 's/^/  conflicted: /'
  exit 1
fi
lines=$(git diff "$orig" HEAD | wc -l)
[ "$lines" -eq 0 ] && proven=1
echo "REPLAYED: $(git rev-list --count "$base..HEAD") commits (was $(git rev-list --count "$base..$orig")), tree diff vs original: $lines lines"
git log --reverse --format='  %h %s' "$base..HEAD"
echo "WORKTREE: $wt"; echo "RESULT: $(git rev-parse HEAD)"; echo "ORIGINAL: $orig"
[ "$lines" -eq 0 ] || { echo "TREE DIFFERS from original:"; git diff --stat "$orig" HEAD; exit 2; }
for g in $unwritten; do
  echo "NOTE: the commit built from $g and its squashes keeps their messages one after another; give it a \`message <file>\`"
done

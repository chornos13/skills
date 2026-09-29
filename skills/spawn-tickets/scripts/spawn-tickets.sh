#!/usr/bin/env bash
# Usage: spawn-tickets.sh <ticket-dir>
# Picks the first environments/*.sh whose `detect` succeeds (or $SPAWN_TICKETS_ENV).
set -euo pipefail
DIR="${1:?usage: spawn-tickets.sh <ticket-dir>}"
HERE="$(cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")" && pwd)"

env_file=""
want="${SPAWN_TICKETS_ENV:-*}"
for e in "$HERE"/environments/*-$want.sh; do
  if [ -n "${SPAWN_TICKETS_ENV:-}" ] || ( source "$e"; detect ); then env_file="$e"; break; fi
done
[ -f "$env_file" ] || { echo "spawn-tickets: no environment detected (see $HERE/environments/)" >&2; exit 1; }
source "$env_file"
echo "spawn-tickets: environment $(basename "$env_file" .sh)"

shopt -s nullglob; files=( "$DIR"/*.md ); shopt -u nullglob
(( ${#files[@]} )) || { echo "spawn-tickets: no *.md in $DIR" >&2; exit 1; }
mapfile -t files < <(printf '%s\n' "${files[@]}" | sort -V)

done_re='^\**Status:\** *\(resolved\|wontfix\)'
START_DIR="$PWD"
MARKS=$(mktemp -d)
anchor=""; slots=0

for f in "${files[@]}"; do
  f=$(realpath "$f"); name=$(basename "$f")
  if grep -q "$done_re" "$f"; then echo "spawn-tickets: skip (done) $name"; continue; fi

  mark="$MARKS/$name.exited"
  cmd="cd $(printf %q "$START_DIR") && ${SPAWN_TICKETS_AGENT:-claude --permission-mode auto} $(printf %q "/take-ticket $f"); touch $(printf %q "$mark")"
  if [ -z "$anchor" ] || [ "$slots" -ge 2 ]; then
    p=$(open_window "$name" "$cmd"); anchor="$p"; slots=0
  else
    p=$(split_pane "$anchor" "$name" "$cmd")
  fi
  slots=$((slots + 1))
  echo "spawn-tickets: launched $name"

  while true; do
    sleep 15
    grep -q "$done_re" "$f" && break
    if [ -e "$mark" ] || ! pane_alive "$p"; then
      echo "spawn-tickets: $name session ended before resolving — stopping" >&2; exit 1
    fi
  done
  echo "spawn-tickets: resolved $name"
done
echo "spawn-tickets: all ${#files[@]} tickets resolved"

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

# A ticket's session holds its lock for as long as `claude` runs, so the kernel
# releases it however the session ends and no driver can ever launch a second one.
LOCKS="${XDG_RUNTIME_DIR:-/tmp}/spawn-tickets"; mkdir -p "$LOCKS"
lock_for() { echo "$LOCKS/$(printf %s "$1" | sha1sum | cut -c1-16).lock"; }
held() { ! flock -n "$1" true; }

exec 9>"$(lock_for "$(realpath "$DIR")").driver"
flock -n 9 || { echo "spawn-tickets: another driver is already running $DIR — stopping" >&2; exit 1; }

done_re='^\**Status:\** *\(resolved\|wontfix\)'
START_DIR="$PWD"
anchor=""; slots=0

for f in "${files[@]}"; do
  f=$(realpath "$f"); name=$(basename "$f"); lock=$(lock_for "$f")
  if grep -q "$done_re" "$f"; then echo "spawn-tickets: skip (done) $name"; continue; fi

  if held "$lock"; then
    echo "spawn-tickets: adopted $name (its session is already running)"
  else
    agent="${SPAWN_TICKETS_AGENT:-claude --permission-mode auto} $(printf %q "/take-ticket $f")"
    cmd="cd $(printf %q "$START_DIR") && { flock -w 10 -E 75 $(printf %q "$lock") $agent; [ \$? != 75 ] || echo 'spawn-tickets: $name is already running elsewhere'; }"
    # A launcher that errors may still have opened the pane, so it is never retried; the lock decides.
    if [ -z "$anchor" ] || [ "$slots" -ge 2 ]; then
      p=$(open_window "$name" "$cmd") || p=""; anchor="$p"; slots=0
    else
      p=$(split_pane "$anchor" "$name" "$cmd") || p=""
    fi
    slots=$((slots + 1))
    [ -n "$p" ] || echo "spawn-tickets: no pane handle for $name — tracking it by its lock" >&2
    echo "spawn-tickets: launched $name"

    for _ in $(seq 60); do held "$lock" && break; sleep 1; done
  fi

  while true; do
    grep -q "$done_re" "$f" && break
    if ! held "$lock"; then
      echo "spawn-tickets: $name session ended before resolving — stopping" >&2; exit 1
    fi
    sleep 15
  done
  echo "spawn-tickets: resolved $name"
done
echo "spawn-tickets: all ${#files[@]} tickets resolved"

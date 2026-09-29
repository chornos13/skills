# Orca: one terminal tab per two tickets, second ticket split side-by-side.
# `orca terminal show` reports connected:false once a pane's shell exits.

detect() { [ -n "${ORCA_TERMINAL_HANDLE:-}" ] && command -v orca >/dev/null; }

# Tabs land in START_DIR's worktree when Orca knows it, else the calling terminal's (<cmd> cd's either way).
open_window() { # <title> <cmd> -> terminal handle
  local wt h
  for wt in "path:$START_DIR" "id:${ORCA_WORKTREE_ID:-}"; do
    h=$(orca terminal create --worktree "$wt" --title "$1" --command "$2" --json 2>/dev/null \
      | jq -r '.result.terminal.handle // empty')
    [ -n "$h" ] && { echo "$h"; return; }
  done
  return 1
}

split_pane() { # <anchor-handle> <title> <cmd> -> terminal handle
  orca terminal split --terminal "$1" --direction horizontal --command "$3" --json \
    | jq -er '.result.split.handle // empty'
}

pane_alive() {
  [ "$(orca terminal show --terminal "$1" --json 2>/dev/null | jq -r .result.terminal.connected)" = true ]
}

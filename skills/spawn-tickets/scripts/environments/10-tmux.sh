# tmux: one window per two tickets, second ticket split side-by-side.
# Name the session on new-window — an untargeted one leaks into whatever session is attached.

detect() { [ -n "${TMUX_PANE:-}" ] && command -v tmux >/dev/null; }

open_window() { # <title> <cmd> -> pane id
  local session win p
  session=$(tmux display-message -t "$TMUX_PANE" -p '#{session_id}')
  win=$(tmux new-window -d -t "$session" -P -F '#{window_id}')
  tmux set -w -t "$win" pane-border-status top
  p=$(tmux display-message -t "$win" -p '#{pane_id}')
  _launch "$p" "$1" "$2"
}

split_pane() { # <anchor-pane> <title> <cmd> -> pane id
  _launch "$(tmux split-window -h -d -t "$1" -P -F '#{pane_id}')" "$2" "$3"
}

pane_alive() { tmux display-message -t "$1" -p '#{pane_id}' >/dev/null 2>&1; }

_launch() {
  tmux select-pane -t "$1" -T "$2"
  tmux send-keys -t "$1" "$3" Enter
  echo "$1"
}

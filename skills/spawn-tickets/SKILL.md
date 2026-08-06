---
name: spawn-tickets
description: "Run when the user types `/spawn-tickets <dir> [panes N]`. Fans a `claude \"/take-ticket <file>\"` session across tmux panes — one pane per `*.md` file in a directory, packed N to a window, the current window reused as the first."
disable-model-invocation: true
---

# Spawn Tickets

`/spawn-tickets <dir> [panes N]`

**Fan** one `claude "/take-ticket <file>"` session across tmux panes — one pane per file in `<dir>`, packed N to a window. You only ever *place* the sessions; you never *sequence* them. `take-ticket` self-serializes by `Status:` turn order, so the order panes fill in is irrelevant: a pane whose ticket isn't its turn yet just parks itself.

The current window is **window 1**. Your pane stays put and holds one slot, so window 1 takes N−1 tickets; every later window is new and packed with N. New windows open in the background — focus never leaves your pane.

Requires an interactive tmux session (`$TMUX_PANE` set), and **bash** to run the recipe — it leans on bash arrays and globbing (`mapfile`, `shopt`), so under a zsh login shell run it as `bash -c` or from a `bash` script file.

## 1. Read the invocation

`<dir>` is the directory of ticket files. A trailing `panes N` sets panes per window; absent, N is **2**.

Done when you hold `<dir>` and an integer N.

## 2. Gather the files

Glob `*.md` in `<dir>`, natural-sort (`sort -V`), resolve to absolute paths. This glob is the whole contract — the spawner never reads ticket numbers, because numbering is take-ticket's business, not the spawner's.

No matches → stop and say so. Never spawn empty panes.

Done when you hold a sorted, non-empty list of absolute paths.

## 3. Fan them across the windows

Run the recipe with `<dir>` and N as `$1` and `$2`. It reuses your window as window 1, opens the rest in the background, and for each file: splits a pane off the last one (left-to-right in ticket order), titles it with the filename, and sends its command as **live keystrokes** — so a finished session drops to a shell instead of the pane vanishing.

```bash
set -euo pipefail
DIR="$1"; N="${2:-2}"

shopt -s nullglob; files=( "$DIR"/*.md ); shopt -u nullglob
(( ${#files[@]} )) || { echo "spawn-tickets: no *.md in $DIR" >&2; exit 1; }
mapfile -t files < <(printf '%s\n' "${files[@]}" | sort -V)
for i in "${!files[@]}"; do files[$i]=$(realpath "${files[$i]}"); done

CUR="${TMUX_PANE:?run inside tmux}"
WIN1=$(tmux display-message -t "$CUR" -p '#{window_id}')
SESSION=$(tmux display-message -t "$CUR" -p '#{session_id}')

launch() { # pane_id file — title it, then type its command into a live shell
  tmux select-pane -t "$1" -T "$(basename "$2")"
  tmux send-keys  -t "$1" "claude --permission-mode auto \"/take-ticket $2\"" Enter
}

idx=0; total=${#files[@]}

# window 1 = your window; your pane holds one slot, so it takes N-1 tickets
tmux set -w -t "$WIN1" pane-border-status top
anchor="$CUR"
for ((k=0; k<N-1 && idx<total; k++, idx++)); do
  p=$(tmux split-window -h -d -t "$anchor" -P -F '#{pane_id}')
  launch "$p" "${files[idx]}"; anchor="$p"
done
tmux select-layout -t "$WIN1" even-horizontal

# further windows, N tickets each, opened in the background (-d) on this session
while (( idx < total )); do
  f="${files[idx]}"; ((idx++)) || true
  win=$(tmux new-window -d -t "$SESSION" -P -F '#{window_id}')
  tmux set -w -t "$win" pane-border-status top
  p=$(tmux display-message -t "$win" -p '#{pane_id}')
  launch "$p" "$f"; anchor="$p"
  for ((k=1; k<N && idx<total; k++, idx++)); do
    p=$(tmux split-window -h -d -t "$anchor" -P -F '#{pane_id}')
    launch "$p" "${files[idx]}"; anchor="$p"
  done
  tmux select-layout -t "$win" even-horizontal
done

# focus never left your pane — make it explicit
tmux select-window -t "$WIN1"; tmux select-pane -t "$CUR"
```

Five facts the recipe leans on, each load-bearing:

- **`new-window -t "$SESSION"`** — an untargeted `new-window` retargets whatever session is *attached*, leaking windows into the wrong session. Always name the session.
- **`-d`** on `new-window` and `split-window` — creates without stealing focus, so window 1 and your pane stay active throughout.
- **`pane-border-status top`** — pane titles only render once this is set on the window; without it `select-pane -T` is silent.
- **`even-horizontal`** — packs the panes into side-by-side columns, matching the left-to-right order they were split in. `tiled` picks rows or columns by the window's aspect ratio, so a short wide window can stack them; `even-horizontal` is the deterministic column layout.
- **`--permission-mode auto`** — you fan out more sessions than you can babysit, so each `claude` runs in auto mode and never parks on a permission prompt.

Done when every file has exactly one titled pane running its command, and the only untitled pane is yours.

## 4. Land on your pane

The recipe already returns you to your original pane in window 1. Confirm it is the active pane.

Done when your pane is active and this conversation is usable.

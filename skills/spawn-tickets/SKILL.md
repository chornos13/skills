---
name: spawn-tickets
description: "Run when the user types `/spawn-tickets <dir>`. Runs `claude \"/take-ticket <file>\"` for each `*.md` in a directory one at a time, waiting for each ticket to resolve before launching the next."
disable-model-invocation: true
---

# Spawn Tickets

`/spawn-tickets <dir>` — run the ticket stack in `<dir>` **one session at a time**: launch `claude --permission-mode auto "/take-ticket <file>"` in a new pane, wait until that ticket's `Status:` reads `resolved`/`wontfix`, then launch the next. Order is natural-sort of the `*.md` names; already-done tickets are skipped.

Run the driver — `scripts/spawn-tickets.sh` in this skill's directory — **in the background** with the largest timeout, from the folder that triggered the skill (every pane starts there):

```bash
bash <skill-dir>/scripts/spawn-tickets.sh <dir>
```

It wakes you once — when the stack drains, or when a session exits with its ticket unresolved (the run stops there rather than build on a broken predecessor). Report that outcome.

## Environments

The driver picks the first `scripts/backends/NN-<name>.sh` whose `detect` succeeds (innermost multiplexer first: tmux before Orca); force one with `SPAWN_TICKETS_BACKEND=<name>`. If none fits, the driver says so — tell the user rather than improvising panes by hand.

Each backend packs two sessions per window/tab (new one, then a side-by-side split) and never closes panes, so every session stays on screen. Panes open without stealing focus.

**Adding an environment** is one new file in `scripts/backends/` defining four functions; the driver owns ordering, done-detection and the stop rule:

- `detect` — succeeds when running inside this environment.
- `open_window <title> <cmd>` — open a new window/tab running `<cmd>`, print its pane id.
- `split_pane <anchor-pane> <title> <cmd>` — split `<anchor-pane>` side-by-side running `<cmd>`, print the new pane id.
- `pane_alive <pane>` — succeeds while the pane still exists.

`<cmd>` already `cd`s into the start folder and touches an exit marker when `claude` ends, so a backend only launches and reports liveness.

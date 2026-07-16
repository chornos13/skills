---
name: worktree-workflow
description: Work tickets in isolated git worktrees while the main tree stays clean for task management.
---

Every ticket gets its own disposable worktree for implementation and testing. The ticket itself stays **single-sourced** in the main tree — worktrees carry code, never ticket state.

## Setup (once per machine)

Install the `wt` shell command — see [shell-helpers.md](shell-helpers.md) for the exact definitions to add to `~/.zshrc`. Skip if already installed (`type wt` succeeds). Subcommands mirror `git worktree`'s verbs: `wt add`, `wt list`, `wt remove`, `wt prune`, plus a bare `wt <slug>` jump.

## Steps

1. **Locate the ticket** in the main tree's task state — wherever your tracker keeps it (e.g. an uncommitted `.scratch/<feature-slug>/issues/NN-<slug>.md` file). It stays in the main tree because worktrees only carry committed content. Done when you can name its exact path.

2. **Create the worktree.**
   ```
   wt add <type> <slug>       # type: feat|fix|bug|chore|va
   ```
   Branches off the currently checked-out branch (falls back to the repo default `origin/HEAD` only when HEAD is detached), symlinks the project's dependency folder (Node `node_modules`, Python `.venv`, Go `vendor`, Rust `target` — driven by the `WTNEW_DEPS` table), copies any gitignored `.env*` files from the main tree, lands you inside it. Done when `wt list` shows the new entry, the dependency folder resolves through its symlink, and the `.env*` files are present.

3. **Implement**, briefed with both paths every time: the ticket's path in the main tree, the worktree's path for the code. Record progress on the ticket in the main tree (e.g. its `## Comments` section). Done when the ticket's stated requirement is met and its comments reflect current state.

4. **Test manually, one worktree at a time.**
   ```
   wt <slug>
   <install deps>   # only if the manifest/lockfile changed since deps were last updated (e.g. yarn install, uv sync)
   <run the app>    # e.g. yarn start
   ```
   The dependency folder is a shared, mutable symlink across every worktree — accepted, since testing is always sequential, never parallel. Done when the ticket's golden path and named edge cases are verified working end-to-end.

5. **Clean up.**
   ```
   wt remove <slug>
   ```
   Steps you back to the main tree if you're inside the worktree being removed, and never removes the main worktree itself. Update the ticket's status in the main tree. Done when `wt list` no longer shows the removed entry and the ticket file reflects the outcome.

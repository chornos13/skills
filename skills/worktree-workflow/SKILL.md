---
name: worktree-workflow
description: Work tickets in isolated git worktrees while the main tree stays clean for task management.
---

Main tree holds ticket state only. Every ticket gets its own disposable worktree for implementation and testing.

## Setup (once per machine)

Install the `wt` shell command — see [shell-helpers.md](shell-helpers.md) for the exact definitions to add to `~/.zshrc`. Skip if already installed (`type wt` succeeds). Subcommands mirror `git worktree`'s verbs: `wt add`, `wt list`, `wt remove`, `wt prune`, plus a bare `wt <slug>` jump.

## Steps

1. **Locate the ticket.** It lives at `.scratch/<feature-slug>/issues/NN-<slug>.md` in the main tree — never inside a worktree, since `.scratch/` is intentionally uncommitted and worktrees only ever get committed content. Done when you can name that exact path.

2. **Create the worktree.**
   ```
   wt add <type> <slug>       # type: feat|fix|bug|chore|va
   ```
   Branches off the repo's default branch (`origin/HEAD`, e.g. `main` or `master`), symlinks the project's dependency folder (Node `node_modules`, Python `.venv`, Go `vendor`, Rust `target` — driven by the `WTNEW_DEPS` table), copies any gitignored `.env*` files from the main tree, lands you inside it. Done when `wt list` shows the new entry, the dependency folder resolves through its symlink, and the `.env*` files are present.

3. **Implement**, briefed with both paths every time: the ticket's path in the main tree, the worktree's path for the code. Append progress to the ticket's `## Comments` section in the main tree, never inside the worktree — the ticket is single-sourced there. Done when the ticket's stated requirement is met and its comments reflect current state.

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
   Steps you back to the main tree if you're inside the worktree being removed, and never removes the main worktree itself. Update the ticket's `Status:` line in the main tree. Done when `wt list` no longer shows the removed entry and the ticket file reflects the outcome.

## Notes

- Main tree never receives implementation changes or a dependency install — it only ever holds ticket state.
- Any number of worktrees can exist in parallel; testing is one-at-a-time by choice, not by tooling constraint.
- Worktrees are disposable — safe to remove once merged, cheap to recreate with `wt add`.

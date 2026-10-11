# Targets

How to build the ledger (step 2) and run before/after checks (step 4) for each target type. Read only your type's section.

## Code: branch, PR, commits, diff, files

- **Diff:** for a branch or PR, use `git diff $(git merge-base <base> HEAD)...HEAD`. Ask for the base when it's unclear. For commits, use that range. For files, staged, or unstaged changes, use exactly that.
- **Unit:** one diff hunk. New files, config changes, dependency and lockfile bumps, and migrations count as units too.
- **Reconcile against:** `git diff -U0 <range> | grep -c '^@@'`, plus the binary and renamed files from `git diff --stat`.
- **Provenance:** commit messages and trailers that name tickets. Use `git log --format='%an %s' <range> -- <file>` for the author.
- **Before/after check:** run the same test or script on the base (in a `git worktree`) and on the tip.
- **Mechanism list:** the names defined on added lines, e.g. `git diff <range> | grep -E '^\+\s*(class|def|async def|function|const|[A-Z_][A-Z0-9_]* =)'` (fit the pattern to the language). For orphans, take each callee on a removed line and grep its remaining callers.
- **Mutation:** in a separate `git worktree` of the tip, delete or bypass the mechanism, run the tests that cover its file, then remove the worktree.

## Session: an AI session's work

- **Source:** the transcript at `~/.claude/projects/<cwd-slug>/<session-id>.jsonl`. "This session" means the current conversation.
- **Unit:** each file edit, each state-changing command (install, migrate, commit, external write), and each **claim** the session stated as fact (a number, "this is how X works", a citation).
- **Reconcile against:** the count of edit/write tool calls and state-changing commands in the transcript. Where git covers the files, also check the diff of the files the session touched.
- **Provenance:** the user request each unit answered.
- **Before/after check:** test a behavior claim on the system as it was before the session's first edit and as it is now. Check a factual claim against code, docs, or a run. A claim with no source the session showed stays `inferred` until you check it.
- **Mechanism list and mutation:** as for code, over the diff of the files the session touched.

## Plan: ADR, spec, proposal, plan-mode output

- **Unit:** each decision or mechanism the plan proposes, including those buried mid-sentence ("we'll cache…", "falls back to…").
- **Reconcile against:** a second pass over the plan, sentence by sentence, collecting every verb that commits to building or changing something. The ledger covers each one.
- **Provenance:** the problem statement or requirement each unit cites.
- **Before/after check:** read "before" from the current code, not from the plan's description of it. Reproduce the problem the plan solves (make it fail). A problem you can't reproduce becomes decision D1: is it real?
- **Mechanism list:** the units that commit to building a mechanism. Breaks-without-it comes from the reproduced problem; a plan has nothing to mutate.
- **Behavior classes** apply to the proposed system. A planned 🔴 means the plan, as written, takes something away from a stakeholder.

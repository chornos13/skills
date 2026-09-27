---
name: tidy-history
description: Reshape a branch's commits into fewer, reviewable ones, proven by a dry-run before the branch moves. Use when the user wants to reduce, squash, group, reorder or clean up commits before review or merge.
---

# Tidy history

Turn a branch's commits into a short story a reviewer can follow. The user owns the story; you make it **proven**: every plan is replayed in a throwaway worktree, and the branch moves only to a result whose final tree is byte-identical to the original.

Scripts live in `scripts/` beside this file. Run them from the repository root.

## 1. Fence

List the range with authors and times:

`git log --format='%h %an | %ad | %s' --date=format:'%m-%d %H:%M' <default-branch>..HEAD`

Commits the user did not write, and every merge commit, are **fenced**: the rewrite **base** is the newest fenced commit (the merge-base when none exist), so everything at or below it stays untouched. Confirm with the user which authors are theirs.

Done when: the base is named, and the count of commits above it is stated.

## 2. Read the story

Understand each commit progressively: subject and time first, then `git log -1 --format=%b <sha>`, then `git show --stat <sha>`, and `git show -U1 <sha> -- <path>` only for a commit still ambiguous.

Ask the user what story the branch should tell, then propose **groups** that serve it. Common shapes:

- **By phase**: stretches of work separated by a change of approach (a burst of fixes, then the refactor that made them unnecessary). A long time gap plus a change in how subjects read usually marks the boundary.
- **By concern**: one commit per feature, subsystem, or layer.
- **Follow-ups into parents**: a test tweak, a typo fix, or a revert folds into the commit it corrects.
- **Mechanical last**: formatting, import sorting, lockfile bumps and docs as separate commits, so a reviewer can skip them by kind.

Commit type is weak evidence of group: a `fix:` written during a refactor usually belongs to that refactor. A label you inferred (a round number, a phase name) is offered to the user as an inference and stays out of subjects until they confirm it.

Done when: every commit above the base sits in exactly one group, and the user has agreed to the groups.

## 3. Plan within the order

Replaying a commit onto code it was not written against conflicts. So:

- Squash **neighbours**, commits adjacent in the original order.
- Move a commit only past commits whose file sets are disjoint from its own (`git show --name-only --format= <sha>`).
- When two groups interleave on shared files, they can't be separated without resolving conflicts by hand. Show the user the trade-off (one commit per group versus squashing only neighbours in place) and let them choose.

Write the plan as a file, oldest first:

```
pick   <sha>            # comments are allowed
squash <sha>
fixup  <sha>            # folds in, drops this message
subject <conventional commit subject>   # retitles the commit just built; the squashed messages become its body
```

Present it to the user as one table: `| # | Group | New commit subject | Made from |`.

Done when: every commit appears in the "Made from" column exactly once.

## 4. Dry-run

`scripts/dry-run.sh <base> <plan-file>`

It checks coverage (every commit above the base, exactly once), replays the plan in a new worktree with hooks and signing off, and reports:

- `REPLAYED … tree diff vs original: 0 lines`, exit 0: **proven**. It prints `WORKTREE`, `RESULT` and `ORIGINAL`, and keeps the worktree.
- `CONFLICT` with the commit and files, exit 1: re-plan around it (keep that commit's order) and dry-run again.
- `TREE DIFFERS` with a diffstat, exit 2: the plan loses or adds code. Find the cause before going on.
- `PLAN ERROR`, `COVERAGE ERROR` or `REFUSED`, exit 1: fix the plan or the base.

Every conflict, and every size or ordering claim you make to the user, comes from a dry-run output, never from reasoning alone.

Done when: the plan the user will approve has a proven dry-run.

## 5. Check reviewability

On the proven result:

- `scripts/sizes.sh <base> <RESULT> -- <generated or lock paths>` gives the lines changed per commit.
- Run the repository's lint and type checks at each rewritten commit (`git -C <WORKTREE> checkout <sha>`, then the checks). Run tests too when the environment allows; if it doesn't, say they were not run.

Flag a commit as heavy when one diff mixes large code moves with behaviour changes, or is too large to read in one sitting. Offer a split at the moves, as a proven alternative plan. The user picks the trade-off; show every option they are choosing between as its own table.

Done when: every rewritten commit has its size and check results in one table, and each heavy one is named with its proven split.

## 6. Apply on go

Wait for an explicit go on one named plan. Then:

`scripts/apply.sh <RESULT> <ORIGINAL> <WORKTREE>`

It refuses if the branch moved since the dry-run, the tree is dirty, or the result differs from the original. Otherwise it saves a backup ref under `refs/tidy-history/`, moves the branch, verifies the tree against the backup, and removes the worktree. Relay its `VERIFIED` or `MISMATCH` line verbatim. Undo is `git reset --hard <backup ref>`.

Its closing `NOTE` says how to publish: a plain `git push` when the upstream is an ancestor, `git push --force-with-lease` when the push would rewrite it. Publishing is an outward-facing step the user approves separately; a force push that would replace another author's commits goes to that author first.

The rewritten commits are unsigned. If the repository requires signed commits, say so, and re-sign with `git rebase --exec 'git commit --amend --no-edit -S' <base>` after the user approves.

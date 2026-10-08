---
name: spike-rebuild
description: Rebuild an AI-built spike from scratch on the current branch, one browser-testable slice at a time, with a roadmap and a decision log.
disable-model-invocation: true
argument-hint: [base-branch]
---

# Spike rebuild

The **spike** is a feature the AI already built end to end on the current branch. It is a map, never the merge candidate. This skill parks the spike on `temp/<branch>`, resets the current branch to its base, and rebuilds the feature there as a sequence of **slices**: each slice adds one behavior the user can see in the browser, and lands only after the user **confirms** it there. Every line in the rebuild exists because a confirmed slice needed it.

The **log** is the memory of the run. It lives in the repo at `.spike-rebuild/<branch-slug>.md` (the branch name with `/` replaced by `-`), is committed together with each slice, and is the single source of truth for progress and for why each decision was made. Anything decided in conversation and missing from the log counts as lost.

The **roadmap** is the log's slice table rendered for the user, so they always see the whole path to done:

```
✓ 1. Add button opens the modal
✓ 2. Submit → item appears in the list
▶ 3. Empty field → error under the input
  4. Duplicate item is rejected
  5. Refresh → data persists
```

Write the log and roadmap in English.

## 0. Resume or start

Look for the current branch's log and for `temp/<branch>`.

- **Log exists**: read it in full, then open with the roadmap and the **Next** line. When the log has open questions, add a recap of at most five lines: the last decision and its reason, and the open questions. Continue at step 3 from the **Next** line, reading only the current slice's Spike code from the spike.
- **No log, `temp/<branch>` exists**: an earlier run parked the spike and stopped before the log was committed. Confirm `HEAD` is at the merge-base of `temp/<branch>` and the base, tell the user, and go to step 2. When `HEAD` is elsewhere, stop and show the user both SHAs; the next move is theirs.
- **No log, no `temp/<branch>`**: go to step 1.

## 1. Park the spike

The base defaults to the repo's main branch. The working tree must be clean; if it is not, ask the user to commit or stash first.

1. `git branch temp/<branch> HEAD`, then verify `temp/<branch>` points at the same SHA as `HEAD`.
2. Show the user the spike SHA and the merge-base you will reset to, and get their go-ahead.
3. `git reset --hard <merge-base>`.

If the branch was already pushed, tell the user the first push of the rebuild needs `--force-with-lease`.

## 2. Map the spike

Read the spike: `git diff <merge-base>...temp/<branch>`. Create the log from [`LOG-TEMPLATE.md`](LOG-TEMPLATE.md), recording the base, the spike branch and its SHA.

Cut the spike into slices, ordered so each one builds on the last, and write each into the log:

- **Try**: what the user does in the browser.
- **Expect**: what they should see.
- **Spike code**: the files and hunks this slice draws on.

Slice 1 is a **tracer bullet**: the thinnest path that puts something on screen. Every slice stays **tight**: its Try takes under a minute and its diff reads in one sitting. Code with no visible effect of its own (a migration, an API endpoint, a helper) rides in the first slice that makes it visible; when that slice would grow too big, give the code its own slice whose Try uses the nearest observable surface (a curl, a test run, a log line).

Done when every spike hunk is assigned to a slice or listed under **Unmapped**. Show the user the roadmap and the Unmapped list and revise until they approve it. An Unmapped hunk becomes a slice, or moves to **Dropped** with a reason.

With the roadmap, ask which **lock** mode the run uses and record it in the log's **Lock** line. The user can switch modes for a single slice by saying so.

- **fast**: write the test, run it, and see it pass.
- **strict**: also see it fail with the slice's code removed, so the test is proven to guard this slice.

Get the dev loop running: the dev server with hot reload, and the page the Try steps start from. Record the run command and URL in the log's **Run** line.

Commit the log. The user's approval of the roadmap authorizes this commit.

## 3. Slice loop

One slice per round:

1. Mark the slice `doing`, update **Next**, and show the roadmap.
2. Implement only what this slice's Expect needs, using the spike as reference. Spike code that a later slice needs waits for that slice.
3. Check the slice yourself before handing it over: the typecheck and the existing tests pass, and the page loads with no console errors. When browser tools are available, run the Try steps yourself. Show the user the **evidence**: each command you ran with its result, and any screenshot you took. The user's look is spent on judging behavior, never on finding a blank page.
4. Tell the user the Try and Expect steps, then stop and wait for them to test in the browser.
5. While the slice is open, every question the user asks about the code, every choice between options, and every place the rebuild departs from the spike goes into the slice's **Decisions** at the moment it happens: what was chosen, why, who chose it (user or AI), and which option lost.
6. When the user confirms, **lock** the behavior: write a test for the Expect, following the repo's test conventions, and run it in the log's **Lock** mode. When the Expect is purely visual or the repo has no test setup, record that in the slice's Decisions instead.
7. Mark the slice `done`, update **Next**, and commit the slice's code, test, and log together. The message names the slice. Confirmation authorizes this commit.
8. Show the roadmap with the next slice's Expect, and suggest the user run `/clear` and then `/spike-rebuild`, so the next slice starts with a fresh context built from the log.

If the user reports a problem, fix it within the same slice and repeat from 3.3. When a slice needs a second fix round, it was too big: split it. When a slice turns out too big to confirm in one look, or the work reveals a slice the roadmap is missing, change the roadmap in the log first, show it, then continue.

## 4. Close

Done when every slice is `done`. Diff `temp/<branch>` against the rebuild. Every spike hunk that never landed goes under **Dropped** with its reason. Tell the user what was dropped, ask whether the log stays in the repo or moves into the PR description, and whether `temp/<branch>` can be deleted.

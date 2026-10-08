---
name: spike-rebuild
description: Rebuild an AI-built spike from scratch on the current branch, test-first, one browser-testable slice at a time, with a roadmap, a decision log and a test workflow that survive /clear.
disable-model-invocation: true
argument-hint: [base-branch]
---

# Spike rebuild

The **spike** is a feature the AI already built end to end on the current branch. It is a map, never the merge candidate. This skill parks the spike on `temp/<branch>`, resets the current branch to its base, and rebuilds the feature there as a sequence of **slices**: each slice adds one behavior the user can see in the browser, is built **red → green → refactor**, and lands only after the user **confirms** it there. Every line in the rebuild exists because a red test or a confirmed slice needed it.

The run keeps two files in the repo under `.spike-rebuild/`, named from the branch with `/` replaced by `-`. Both are committed with each slice. Anything decided or explained in conversation and missing from them counts as lost.

- The **log** (`<branch-slug>.md`, from [`LOG-TEMPLATE.md`](LOG-TEMPLATE.md)) is the single source of truth for progress and for why each decision was made.
- The **workflow** (`<branch-slug>.workflow.md`, from [`WORKFLOW-TEMPLATE.md`](WORKFLOW-TEMPLATE.md)) is the single source of truth for *how to test*: the targets the Try steps run on, how to build, reach and observe them, the scenarios and loops that make a state happen on demand, the test commands, and the commands that show the current **state** of every target. The user explains a test step once: write it into the workflow the moment they say it or the moment you discover it, so after `/clear` it is a lookup, never a question. A step that changes is edited in place; the workflow always describes the current way. Debug scripts are committed as they are in `<branch-slug>.tools/`, never pasted into markdown.

The **roadmap** is the log's slice table rendered for the user, so they always see the whole path to done:

```
✓ 1. Add button opens the modal
✓ 2. Submit → item appears in the list
▶ 3. Empty field → error under the input
  4. Duplicate item is rejected
  5. Refresh → data persists
```

Write the log, workflow and roadmap in English.

## 0. Resume or start

Look for the current branch's log and for `temp/<branch>`.

- **Log exists**: read the log and the workflow in full, then open with the roadmap and the **Next** line. When the log has open questions, add a recap of at most five lines: the last decision and its reason, and the open questions. Continue at step 3 from the **Next** line, reading only the current slice's Spike code from the spike. Test and run the slice the way the workflow says.
- **No log, `temp/<branch>` exists**: an earlier run parked the spike and stopped before the log was committed. Confirm `HEAD` is at the merge-base of `temp/<branch>` and the base, tell the user, and go to step 2. When `HEAD` is elsewhere, stop and show the user both SHAs; the next move is theirs.
- **No log, no `temp/<branch>`**: go to step 1.

## 1. Park the spike

The base defaults to the repo's main branch. The working tree must be clean; if it is not, ask the user to commit or stash first.

1. `git branch temp/<branch> HEAD`, then verify `temp/<branch>` points at the same SHA as `HEAD`.
2. Show the user the spike SHA and the merge-base you will reset to, and get their go-ahead.
3. `git reset --hard <merge-base>`.

If the branch was already pushed, tell the user the first push of the rebuild needs `--force-with-lease`.

## 2. Map the spike

Read the spike: `git diff <merge-base>...temp/<branch>`. Create the log, recording the base, the spike branch and its SHA.

Cut the spike into slices, ordered so each one builds on the last, and write each into the log:

- **Try**: what the user does in the browser.
- **Expect**: what they should see.
- **Spike code**: the files and hunks this slice draws on, the spike's tests included.

Slice 1 is a **tracer bullet**: the thinnest path that puts something on screen. Every slice stays **tight**: its Try takes under a minute and its diff reads in one sitting. Code with no visible effect of its own (a migration, an API endpoint, a helper) rides in the first slice that makes it visible; when that slice would grow too big, give the code its own slice whose Try uses the nearest observable surface (a curl, a test run, a log line).

Done when every spike hunk is assigned to a slice or listed under **Unmapped**. Show the user the roadmap and the Unmapped list and revise until they approve it. An Unmapped hunk becomes a slice, or moves to **Dropped** with a reason.

With the roadmap, ask which **lock** mode the run uses and record it in the log's **Lock** line. The user can switch modes for a single slice by saying so.

- **fast**: every test is seen red before the code that turns it green.
- **strict**: also, after green, remove each guard and branch the slice added, one at a time, and see a test go red for each; record the removals in the slice's Decisions.

Create the workflow. Other `.spike-rebuild/*.workflow.md` files from earlier runs hold test setups the user already explained: offer the closest one as the starting point. Fill it until it is **runnable cold**: an agent with only the workflow can start the dev loop, reach the page (or device screen) the Try steps start from, and run the slice's tests. Confirm that by starting the dev loop and running the existing test command from the workflow as written.

Commit the log and the workflow. The user's approval of the roadmap authorizes this commit.

## 3. Slice loop

One slice per round:

1. Mark the slice `doing`, update **Next**, and show the roadmap.
2. **Red**: write the test for the slice's Expect at the seam the repo's test conventions use, with the spike's tests as reference. Run it with the workflow's test command and see it fail on the assertion the Expect names; a failure from an import, a typo or setup is not red yet. When the Expect is purely visual or the repo has no test setup, record that in the slice's Decisions and go to 3.3.
3. **Green**: implement only what turns the red test green and makes the Expect true, using the spike as reference. Spike code that a later slice needs waits for that slice.
4. Check the slice yourself before handing it over: the typecheck and the existing tests pass, and the page loads with no console errors. When browser tools are available, run the Try steps yourself. Show the user the **evidence**: each command you ran with its result, and any screenshot you took. The user's look is spent on judging behavior, never on finding a blank page.
5. Tell the user the Try and Expect steps, then stop and wait for them to test in the browser.
6. While the slice is open, every question the user asks about the code, every choice between options, and every place the rebuild departs from the spike goes into the slice's **Decisions** at the moment it happens: what was chosen, why, who chose it (user or AI), and which option lost. Every new or changed way of testing (a command, a device step, a tool, a flag, a caution) goes into the workflow at the same moment.
7. When the user confirms, **refactor** with the tests green, then run the strict removals when the Lock says so. When the user's confirmation changed the Expect, update the test first and see it red against the old behavior.
8. Mark the slice `done`, update **Next**, and commit the slice's code, test, log and workflow together. The message names the slice. Confirmation authorizes this commit.
9. Show the roadmap with the next slice's Expect, and suggest the user run `/clear` and then `/spike-rebuild`, so the next slice starts with a fresh context built from the log and the workflow.

If the user reports a problem, reproduce it as a red test first, then fix it within the same slice and repeat from 3.4. When the problem only reproduces on a real device or environment the tests cannot reach, record the repro steps in the workflow and the reason in Decisions. When a slice needs a second fix round, it was too big: split it. When a slice turns out too big to confirm in one look, or the work reveals a slice the roadmap is missing, change the roadmap in the log first, show it, then continue.

## 4. Close

Done when every slice is `done`. Diff `temp/<branch>` against the rebuild. Every spike hunk that never landed goes under **Dropped** with its reason. Tell the user what was dropped, ask whether the log stays in the repo or moves into the PR description, whether the workflow stays for the next run, and whether `temp/<branch>` can be deleted.

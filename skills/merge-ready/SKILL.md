---
name: merge-ready
description: Take the current branch to merge-ready: rebase, review, fix findings test-first, re-verify, and report what only the user can decide. Usage: /merge-ready [base]
disable-model-invocation: true
---

**Outcome**: the branch can merge into the base (default `main`) without the user reading every line. You own the loop of rebasing, reviewing, fixing and re-checking. The user only sees blockers you could not fix and choices that only they can make.

The standing rules:

- **Facts, not assumptions.** Back each suspected defect with a deterministic test or script you ran. Mark claims **verified** (you ran it) or **inferred** (you read it). Run only the targeted tests, not the full suite.
- **Fix at the origin.** Use the robust, best-practice solution that removes the cause. A patch over a symptom is not a fix.
- **Settled stays settled.** A choice that a ticket, ADR, spec, or earlier `decisions.md` already made is out of scope.

## Steps

### 1. Sync

Fetch, then rebase onto `origin/<base>`. Resolve conflicts by keeping both sides' intent. If a conflict needs a product judgment you cannot infer from tickets or commits, stop and ask.

**Done when** the branch sits on the latest base with no conflict markers, and the project builds or typechecks.

### 2. Review

Read [`../code-review/SKILL.md`](../code-review/SKILL.md) and run its review on `<base>...HEAD`. For each finding, write a failing test or script that proves it. A finding you cannot prove becomes an **inferred** note, not a fix.

**Done when** each finding is **proven** (red test), **inferred**, or **dropped** (the test passed), and the counts are recorded.

### 3. Fix

For each proven finding: confirm the test is red, fix at the origin, confirm it turns green. Apply [`../test-standards/SKILL.md`](../test-standards/SKILL.md) and [`../comment-standards/SKILL.md`](../comment-standards/SKILL.md) strictly to everything you touch. Commit each fix on its own with a message naming the finding. Do not push.

A finding whose fix depends on a choice nothing settled becomes a **decision** for the report, left unfixed.

**Done when** every proven finding is either `fixed <sha>` with a test that is green and was red, or listed as a decision.

### 4. Re-verify

Run step 2 on your own fix commits only. Then run what CI runs locally: read the CI config and run its lint, typecheck, and the tests covering the changed files.

**Done when** your fixes introduced no new finding and every local CI check passes, or the failure is listed as a blocker with its output.

## Report

Print:

- **Verdict**: ✅ merge-ready, or ⚠️ with the count of blockers and decisions.
- **Fixed**: one line each: finding → `sha`, verified.
- **Blockers**: anything still red, with output.
- **Decisions**: each with **A** and **B**, the concrete scenario each one leads to and who feels it, your recommendation, and one plain sentence the user can give a collaborator who asks *why*.
- **Inferred notes**: one line each.
- Next: `push` to let CI run, or `/scrutinize` for a judgment on behavior impact.

Then stop.

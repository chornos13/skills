---
name: explain-to-pair
description: Hand a story, bug or finished change to a pair — a person at the other keyboard, or an AI writing the page — with each unit of code justified, mutation-checked and runnable.
disable-model-invocation: true
---

Goal: after one read, the pair can start, knows what done looks like, and can judge whether each **unit** of the change should exist, with nothing left to ask. The pair knows the codebase but not this item, and has little time.

A **unit** is one piece a reviewer could question: a guard, a flag, a changed signature, a removed line. **Red** is a failing test; **green** a passing one. **Old** and **fixed** are the commits before and after.

## Steps

1. **Answer** in one sentence: what is wrong or what changes, for whom, in the codebase's own names.
2. **Units.** List every unit of the change. Done when the list matches `git diff --stat` line for line.
3. **Four questions per unit**, from real runs, never memory. A cell you cannot answer says `unknown` and what would answer it.

   | # | Question | How to answer |
   |---|---|---|
   | 1 | Why does it exist? (Chesterton's Fence) | Name the failure it cuts: the chain step plus evidence (log line, error-tracker event, once-red test). "Defensive" and "cleaner" are not answers. |
   | 2 | What goes red if I remove it? (mutation) | Revert that unit alone, run the relevant suites, record test names as "n of N". Zero red means dead (delete) or unprotected (add a test). |
   | 3 | How does a test prevent the regression? | Name the behaviour pinned and where it is observed. Show it red on the old code. Say whether it is what the user sees or an internal state. |
   | 4 | How resilient is the test? | It fails on an assertion, not a crash or timeout; it does not depend on timing or promise order; it observes the boundary; a negative assertion was seen red first. |

   Report one row per unit. A unit with no red test is a finding.
4. **Root cause** as a chain of whys, symptom first, evidence per step (Five Whys). Where several defects had to line up, say which layer each fix closes (Swiss cheese); name the class of defect. Done when the reader can point at the fix and the evidence for every why.
5. **Make the chain runnable**: one test, red on old, green on fixed; for bugs only the real app shows, two running copies plus a browser test. See [RUNNABLE.md](RUNNABLE.md).
6. **Lay it out** by the rules in [RULES.md](RULES.md): answer first, scannable in one second, minimum context, team words, one real example, done/out/open.
7. **Check** against the list below, then ask the pair "how would you start?" and wait for something you did not say.

## Before you send it

- The answer is the first sentence.
- Every claim carries its evidence, and every number was re-run today.
- Every noun appears in the code or the docs.
- Every line number names its commit and folder.
- Every unit has its four answers; the root cause is a chain of whys with the defect class named.
- The important thing is big and early; extra material is folded.

Rationale, sources and the prose-hygiene table: [RULES.md](RULES.md). Failures seen in practice: [FAILURES.md](FAILURES.md).

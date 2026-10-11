---
name: scrutinize
description: Judge a change (branch, diff, commits, an AI session's work, or a plan) for observable behavior changes, who feels them, and over-engineering, written as a grouped Markdown review folder with Mermaid diagrams. Review only.
disable-model-invocation: true
---

The user can't read every line of the change, yet must decide whether it goes to main. The review answers three questions, in this order:

1. **Who feels what?** Every **observable behavior** change: something a person, client, or system outside the code sees differently.
2. **Is anything built that nothing needs?** Over-engineering.
3. **What can only the user decide?** Questions that no ticket, ADR, or earlier decision answers yet.

Do the work exhaustively and show only what drives the decision. The ledger proves completeness, and the report shows only what needs a decision. You change nothing until the user picks.

## Steps

### 1. Pin the target, the goal, and what is settled

Identify the target type (code, session, or plan) and read its section in [`TARGETS.md`](TARGETS.md).

Write the goal in 1–3 sentences, with its source: ticket, spec, issue, PR description, or the session's first request. If you find no goal, ask the user.

Collect the **settled** sources: the tickets, ADRs, and specs the change answers to. If an earlier review folder exists, include its `decisions.md`. A settled choice stays settled. It shows up in the review as *intended* with a link to its source, and it never becomes a question again.

**Done when** the goal and the list of settled sources are written at the top of your notes.

### 2. Build the ledger

List every unit of change, as `TARGETS.md` defines units. Reconcile the count against the mechanical source it names. Give each unit an ID (`U1`, `U2`, …) and a **provenance**: the settled line it serves, or `none`, plus its author when it isn't the user's side of the work (another contributor or an upstream merge).

**Done when** the ledger count equals the source's count and every unit has a provenance.

### 3. Group

Cluster the units into **groups**. Each group is one concept with one outcome, nameable in a sentence ("refuse login after five failed attempts"). Units belong together when one defines what the other uses, or when they serve the same goal line. Pure refactors and moves form their own group, kept apart from behavior.

Aim for 3–7 groups. If more remain after merging honestly, say so in the verdict: the change is too big to judge as one piece, and splitting it is advice for the user.

**Done when** every unit sits in exactly one group.

### 4. Find every observable behavior change

For each group, ask what an outsider now sees differently. That covers a response, error, message, refusal, limit, default, timing, ordering, side effect (email, charge, log, metric), cost, or required setup. For each change, record:

- **Who** feels it: pick from the [stakeholders](#stakeholders).
- **Before → after**, as one concrete scenario: "a shopper with an expired card clicks Pay: before, they saw 'card declined'; after, they see a blank page".
- **Class:**

| Class | Means | Gate |
|---|---|---|
| 🔴 **regression** | A stakeholder loses something they could do before: read their data, finish a flow, get the same answer, stay within the same time or cost | **blocks merge** |
| 🟠 **unapproved** | New observable behavior that no settled source asked for | decision |
| 🟢 **intended** | Observable change a settled source asked for (link the line) | listed, no decision |
| ⚪ **invisible** | Nothing observable changes (refactor, rename, internal move) | counted only |

Prove each 🔴 and 🟠 with a **before/after check**: the same test or script run on the base and on the tip. If the results differ, the change is proven. Mark each claim **verified** (you ran it) or **inferred** (you read or reasoned it). Run only these checks, not the full suite.

**Done when** every group has its behavior list (or reads ⚪ invisible), and every 🔴 and 🟠 is verified or marked inferred.

### 5. Find over-engineering

List every **mechanism** the change adds: cache, retry, fallback, config knob, feature flag, abstraction layer, generic parameter, estimate, background job, and every new class, function, constant, or exception. Build the list the way you built the ledger: from the script `TARGETS.md` names, so every name it finds is accounted for. Add each **orphan**: code the change leaves in place after removing the last caller that gave it a reason to exist.

For each mechanism, find the fact that shows what breaks without it: a failing test, an incident, a log, a vendor doc, a settled line. The fact depends on what the mechanism is:

- **Behavior** (cache, retry, fallback, refresh, guard): the fact comes from a **mutation**. Bypass the mechanism so the code still runs without its effect (skip the retry, return the uncached value), then run the tests that cover it. A test that goes red on an assertion is the fact. A red from a missing name, an import, or a type error proves nothing. When every test stays green, write `NONE (no test guards it)`: reading the code tells you why it was added, and only the run tells you what guards it.
- **Structure** (new class, function, exception, layer, parameter): the fact is a second caller or a settled line that needs the seam. With one caller and no settled line, write `NONE (one caller)`. Inlining it is option A.

Write `NONE` when no fact exists.

Evidence that only tunes a mechanism (a fitted timeout, a measured rate) is **tuning evidence**. It shows the mechanism is set well, not that it is needed. Record it separately.

Before suggesting removal, state why the mechanism was likely added (Chesterton's fence).

**Done when** every name the script found is on the list, every orphan is on it, and every mechanism has a breaks-without-it (a mutation run, for code behavior) or `NONE`.

### 6. Gate and decide

- Each 🔴 is a **blocker**. Give the fix. A regression is never offered as an option to accept. The user can still override it explicitly.
- Each 🟠, and each mechanism with `NONE`, becomes a **decision** with two options: **A** (remove or simplify) and **B** (keep or fix). Each option states the concrete scenario that follows from it and who feels it. Recommend the option the goal and settled sources point to. Where they are silent, recommend the simpler one. Add one plain sentence the user can say when someone asks *why*.
- Each 🟢, ⚪, and settled item gets one line, no question.
- The verdict is ✅ only with zero blockers and zero open decisions. Open decisions make it ⚠️.
- A defect you notice outside the change's units goes under **noticed, out of scope**, one line each. Bug hunting belongs to `/code-review`.

**Done when** every 🔴 has a fix, every decision has A, B, a recommendation, a principle, and a *why* sentence, and nothing settled appears as a decision.

### 7. Write the review folder

Read [`REPORT.md`](REPORT.md) and write the folder it describes. Then print the terminal summary it defines, and stop.

**Done when** the folder exists, every 🔴/🟠/decision in it links back to its group and units, and the summary is printed.

## After the report

- **Follow-up questions** get answers. A question doesn't trigger a new finding. If the answer reveals one, ask whether the user wants it added.
- **Re-runs** read the previous folder's `decisions.md` and the tip it reviewed. They re-check only open blockers, open decisions, and units changed since then.
- **When the user picks**, apply only the picked options. Each fix starts with a test that goes red. If a fix needs a mechanism outside the picked option, bring it back as a new decision. Update `decisions.md` with each pick. Then run steps 2–6 on your own diff and report what you added.

## Stakeholders

Use only the stakeholders this system has, and add others it has:

`end user` · `API client / frontend` · `admin / operator` · `on-call / ops` · `developer / maintainer` · `model / agent reading the output` (an error string is input to its next decision) · `support` · `cost / billing` · `security / compliance`

## Principles

Cite by name in groups and decisions. Domain principles (idempotency, least privilege, deadline propagation, a vendor's documented limits) cite a specific source, marked **checked** (fetched this run) or **recalled**. Write `judgment` when no principle fits.

| Principle | Use it for |
|---|---|
| **Hyrum's Law**: every observable behavior will be depended on by somebody | Why every observable change needs an owner, even an "obvious improvement" |
| **SemVer classes**: incompatible / backward-compatible addition / fix | Naming the size of a behavior change for API clients |
| **Over-engineering**: more generic than needed, or not needed now (Google eng-practices, Complexity) | Mechanisms with `NONE` |
| **YAGNI**: costs of build, delay, carry, repair (Fowler) | The ongoing carry cost of a mechanism that is kept |
| **Essential vs accidental complexity** (Brooks; Moseley & Marks) | Whether complexity comes from the problem or from the solution |
| **Chesterton's fence** | Knowing why a thing exists before removing it |
| **All consequences** (Nygard, ADRs) | Each option lists its costs next to its gains. An accepted decision is settled until a new decision supersedes it |
| **Code health over perfection** (Google eng-practices, Standard of Code Review) | Approve when the change clearly improves things. A non-blocking note never holds the merge |

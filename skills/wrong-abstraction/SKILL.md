---
name: wrong-abstraction
description: Weigh duplication against the wrong abstraction before sharing code. Use when about to extract a helper, base class, component, hook, or module from repeated code; when a shared abstraction is growing parameters, flags, or conditionals to serve callers that are diverging; or when deciding whether some duplication is worth removing at all.
---

# The wrong abstraction

> "Duplication is far cheaper than the wrong abstraction." — Sandi Metz

Duplication's cost is local and visible. The wrong abstraction's cost is hidden and spreads: it couples every caller, and each new requirement that fits some callers but not others adds a parameter, a flag, or a branch until the abstraction serves no one cleanly. When unsure, duplicate.

## Before you extract

Apply this gate before sharing code across call sites:

1. **Count the copies.** Three real occurrences is the floor, not the trigger. Two is not yet a pattern.
2. **Test sameness, not similarity.** Decide whether the copies encode one piece of knowledge that must always change together (**true duplication**), or merely look alike today and will change for different reasons (**coincidental duplication**).
3. **Extract only true duplication.** Leave coincidental duplication copied.

Completion criterion: every copy classified true or coincidental, and you extract only when all copies are true duplication of one another.

## What the extraction costs the reader

Sameness governs whether sharing is *safe*; legibility governs whether it *pays*. Each of these has a yes-or-no answer, so read them as defects to find rather than costs to weigh:

- **A flag argument is a defect.** The same word appears at every call site; the difference lives in the signature. Pass a named field, or inline the call. Surrounding prose that explains the flag — a comment, a test name — confirms the defect, since the call site needed prose to be read.
- **A magic number in an argument list is a defect.** A bare literal sends the reader to the signature to learn which parameter it fills. A named field carries its meaning to the call site.
- **The subject reads as literal text at the call site.** Whatever a caller exists to demonstrate — the field a test varies, the value that makes this case different — appears there in code.
- **In tests, prefer DAMP over DRY.** Each test reads as a self-contained description, so a repeated literal costs less there than in production code.

## When an abstraction is already wrong

Signal: a shared abstraction carries a parameter, flag, or conditional that exists to serve a caller diverging from the rest — whether it grew one or was born with one.

1. Inline the abstraction back into each caller — copy the code down.
2. Delete the emptied abstraction.
3. Let the callers diverge, and re-derive a new abstraction only when true duplication reappears.

## Standing rules

- Judge an existing helper as if you were about to write it. Incumbency is not evidence that sharing was right: run its callers through *Before you extract* as though the helper did not exist, and let "when unsure, duplicate" break the tie. "Not worth the churn" is how a wrong abstraction survives review.
- Test the behavior and business value, not the abstraction. Tests bound to features survive inlining; tests bound to a helper become locks that prevent undoing the mistake. The tell is a **tautological assertion** — the expected value built by the same helper that built the input, so a wrong shape passes; the expected value reads as a literal.
- Treat deleting an abstraction as healthy work, ranked alongside adding one.
- When justifying a sharing decision, name the trade — what is gained and what is paid — rather than citing "DRY" as the reason.

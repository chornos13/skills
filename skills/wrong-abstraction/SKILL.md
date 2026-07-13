---
name: wrong-abstraction
description: Weigh duplication against the wrong abstraction before sharing code. Use when about to extract a helper, base class, component, hook, or module from repeated code; when a shared abstraction is growing parameters, flags, or conditionals to serve callers that are diverging; or when deciding whether some duplication is worth removing at all.
---

# The wrong abstraction

> "Duplication is far cheaper than the wrong abstraction." — Sandi Metz

Duplication's cost is local and visible. The wrong abstraction's cost is hidden and spreads: it couples every caller, and each new requirement that fits some callers but not others adds a parameter, a flag, or a branch until the abstraction serves no one cleanly. When unsure, duplicate.

## Before you extract

Apply this gate before sharing code across call sites:

1. **Count the copies.** Extract on the third real occurrence. Two is not yet a pattern.
2. **Test sameness, not similarity.** Decide whether the copies encode one piece of knowledge that must always change together (**true duplication**), or merely look alike today and will change for different reasons (**coincidental duplication**).
3. **Extract only true duplication.** Leave coincidental duplication copied.

Completion criterion: every copy classified true or coincidental, and you extract only when all copies are true duplication of one another.

## When an abstraction is already wrong

Signal: a shared abstraction is growing a parameter, flag, or conditional to serve a caller that is diverging from the rest.

1. Inline the abstraction back into each caller — copy the code down.
2. Delete the emptied abstraction.
3. Let the callers diverge, and re-derive a new abstraction only when true duplication reappears.

## Standing rules

- Test the behavior and business value, not the abstraction. Tests bound to features survive inlining; tests bound to a helper become locks that prevent undoing the mistake.
- Treat deleting an abstraction as healthy work, ranked alongside adding one.
- When justifying a sharing decision, name the trade — what is gained and what is paid — rather than citing "DRY" as the reason.

---
name: comment-standards
description: "Use when reviewing or writing code comments — enforces why-not-what, name-over-comment, and systemic code smell detection. Examples: PR review, inline comments in complex logic, refactoring guidance."
---

Read the rules below, apply them as hard constraints, then handle the user's request.

### The Core Distinction

> "Code can only tell you _how_ the program works; comments can tell you _why_ it works."

Code describes mechanics. Comments must earn their place by explaining rationale — not restating what the code already says.

### The Ordering Rule

> "You should first strive to make your code as simple as possible to understand without relying on comments as a crutch. Only at the point where the code _cannot_ be made easier to understand should you begin to add comments."

Comments are a last resort, not a default. Simplify the code first.

### What NOT to Comment

> "The comments in the snippet above...only clutter the code even more. Sometimes _fewer_ comments makes for more readable code."

Don't write comments that restate the code. They add noise without adding information.

### Comment as Smell: The Restructuring Signal

**A comment that feels necessary is a signal to restructure, not a reason to keep it.**

Before approving any comment, test it against these four systemic smells. If it triggers one, **reject the comment and demand the structural escape hatch:**

1. **The Implicit State Machine:** If a comment has to explain a multi-variable matrix of competing conditional outcomes (*"If X happens while Y is true, but Z hasn't resolved..."*), the code is using scattered `if/else` checks to simulate an unwritten state machine. 
   * *The Escape Hatch:* Reify the logic into an explicit State Resolver class, a deterministic lookup table, or a finite state machine.

2. **The Hostage Test Case:** If a comment describes a specific sequence of user or system actions required to trigger/avoid a bug (*"...otherwise closing the side panel re-parks the wrong button"*), the comment is a hijacked regression test.
   * *The Escape Hatch:* Delete the narrative from the implementation file. Write an automated integration test for that exact scenario, and use the explanation as the test's `it()` description.

3. **The Missing Domain Noun:** If a comment relies on an internal, unwritten glossary of abstract concepts to make sense (*"ambient home", "armed set", "gating CTA"*), the Type System has failed to capture the domain model.
   * *The Escape Hatch:* Turn the nouns into code. Reify the concepts into explicit `Interfaces`, `Enums`, or wrapped domain types.

4. **The Volume Ceiling (The ADR Threshold):** Inline comments must be scannable at normal scrolling speeds. If explaining the "Why" requires more than three sentences of dense systemic causality, the component is too coupled to be documented in-situ.
   * *The Escape Hatch:* Abstract the logic behind a well-named coordinator function, and move the essay to an Architecture Decision Record (ADR) or a linked `.md` file.

Only when a comment passes all four checks—and the code genuinely cannot be refactored to speak for itself—should the prose survive.

### What Comments Must Do

Comments should document:

- **Why** the program is written the way it is
- The rationale for choosing one approach over alternatives
- Context that the code itself cannot convey

> "What is perfectly, transparently obvious to one developer may be utterly opaque to another developer who has no context."

### The Name-Over-Comment Rule

Choose variable and function names carefully — good names eliminate the need for explanatory comments. If you're tempted to comment what something is, rename it instead.

### The Foundation

> "Programs must be written for people to read, and only incidentally for machines to execute." _(SICP)_

> "The best kind of comments are the ones you don't need."

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

Before approving any comment, test it against these four universal code smells. If it triggers one, **reject the comment and demand the structural escape hatch:**

1. **The Unwritten State Machine (State Explosion):** If a comment has to map out a matrix of overlapping booleans, order-of-operations, or race conditions (*"If X happens while Y is true, but Z hasn't resolved..."*), the code is using standard control flow to simulate a missing finite state machine.
   * *The Escape Hatch:* Reify the permutations into a formal State pattern, a deterministic lookup table, or an explicit status reducer.

2. **The Ghost Specification (The Misplaced Test):** If a comment outlines a step-by-step reproduction scenario or a historical edge case (*"...otherwise doing X causes Y to happen"*), it is an orphaned assertion masquerading as prose.
   * *The Escape Hatch:* Delete the narrative from the source file. Write an automated test for that exact scenario, and use the prose as the test's title string. 

3. **The Phantom Vocabulary (Missing Domain Types):** If a comment relies on an unwritten, off-book glossary of abstract nouns to make sense, the language of the developer has diverged from the language of the type system. 
   * *The Escape Hatch:* Lift the concepts into the code. Wrap the primitive data inside explicit domain types, interfaces, enums, or tagged unions.

4. **The Cognitive Overflow (High Coupling):** If an inline comment requires an extensive essay of multi-component causality just to explain a single block of code, the component is violating the Single Responsibility Principle at the macro level.
   * *The Escape Hatch:* Extract the subsystem behind an intentionally named Façade or Coordinator function, and move the architectural lore to an Architecture Decision Record (ADR) or linked system documentation.

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

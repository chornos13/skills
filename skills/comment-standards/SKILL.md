---
name: comment-standards
description: "Use when reviewing or writing code comments — enforces why-not-what and name-over-comment. Examples: PR review, inline comment in complex logic, refactoring guidance."
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

Before keeping any comment, ask: *could I restructure the surrounding code so this comment becomes unnecessary?* Section-label comments are the most common failure mode — they exist because the code lacks structure, not documentation. The fix is to tighten the structure until the label is redundant.

Only when restructuring genuinely cannot make the intent clear should a comment survive.

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

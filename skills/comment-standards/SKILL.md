---
name: comment-standards
description: Use when writing or reviewing code comments — decides which comments earn their place and which signal a refactor. Triggers on code review, adding inline comments, "should this be a comment".
---

Every comment is a **smell** until it earns its place. Default to changing the code, not annotating it.

Code already states *what* it does. A comment earns its place only by carrying what code cannot: **why** this approach over the alternative, a non-obvious constraint, context the next reader lacks.

## Triage each comment

For every comment in the diff — existing or one you're about to write — walk this order and stop at the first that fires:

1. **A name carries it** → the comment says what a variable or function *is*. Rename; drop the comment.
2. **Simpler code carries it** → simplify until the comment is redundant; drop it.
3. **It restates the code** → delete it.
4. **It matches a structural smell** (below) → apply the fix; the comment goes away with the structure.
5. **It explains why** → keep it.

Done when every comment in the diff has hit one of these.

## Structural smells

A comment that exists only to explain [X] is usually a missing [structure]. Prefer the fix; keep the comment only when the fix is genuinely not warranted here.                           
- **Missing state machine** — the comment maps overlapping booleans, ordering, or races (*"if X while Y but Z hasn't resolved"*). Fix: reify the states into an explicit status enum, looktable, or reducer.
- **Missing test** — the comment narrates a repro or edge case (*"otherwise doing X causes Y"*). Fix: move it into a test; use the prose as the test name.                                - **Missing domain type** — the comment defines off-book nouns so the code read a named type, enum, or tagged union.
- **God object** — the comment needs a paragraph of cross-component causality for one block. Fix: extract the subsystem behind a named function; move the architecture note to an ADR and link it.

<imporant>Better comment is no comment</important>

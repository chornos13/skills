---
name: comment-standards
description: The default is no comment. A comment is permitted only when the fact cannot be expressed in code, matched against a closed list of allowed shapes — never a judgment you make in the comment's favor. Use when writing a comment, reviewing or cleaning up comments in a diff, or deciding whether a comment stays — and when another skill needs the bar for keeping a comment.
---

# Code over comments

The default is **no comment**. A comment is permitted **only** when the fact cannot be expressed in code, and only in one of the shapes under **The only permitted comments**. Anything else does not get written.

You do not decide your comment is the exception. The test is not "is mine worth keeping?" — you will always answer yes. The test is binary: **does it match a listed shape?** If not, write nothing.

## Code first

Every comment tempting you is first a code problem. Work the fixes in order; a comment stays off the table until every one has failed:

- a name — variable, function, constant — that states what the comment would have said;
- a smaller function whose signature carries the meaning;
- a type or signature that makes the invalid state unrepresentable;
- a restructure that removes the surprising code the comment was apologizing for.

Only a fact that survives all of these — one code genuinely cannot hold — reaches the list below.

## The only permitted comments

A closed list. If a comment is not literally one of these two shapes, it does not get written:

- **Pointer to rationale that lives outside the code** — an ADR, a ticket, a `TODO(owner)`, a decision record. Code carries *what* and *how*; it cannot carry *why this was chosen over the alternative*. Keep the pointer, never a paraphrase of what it points to.
- **Machine-read directive** — a `# noqa`, `# type: ignore`, lint suppression, or codegen pragma, each with its required reason. A tool reads it; it is not prose for a human.

No third shape exists. "But mine is special" is the workaround this list refuses.

## Defensible — a second, independent kill

A comment that clears the bar above still dies if you cannot stand behind every word from the repo alone. If it asserts anything the repo cannot confirm — how a foreign system behaves, a citation you cannot check, an intention no one recorded — delete it. A wrong comment costs more than a missing one, and an almost-right comment that needs a caveat to be true is a wrong comment.

## Delete on sight

Shapes that fail the bar. When writing, never produce them; when reviewing, delete them:

- **Narration** — restates what the next line does. The code already says it.
- **Invented authority** — a fabricated issue number, chat id, or spec reference that reads as grounded but matches nothing in the repo.
- **Foreign-system claim** — asserts how a backend, API, or external service behaves. The repo cannot confirm it.
- **False premise** — the reason it gives is wrong: guards a case that cannot occur, or cites a constraint that does not hold.
- **Orphan** — the code it described moved or died and the comment stayed. When you change code, re-read every comment in the blocks you touched and delete the ones the change stranded.

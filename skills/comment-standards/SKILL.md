---
name: comment-standards
description: A comment earns its place only if it is load-bearing — it carries a fact the repo can't recover and that you can defend from the repo alone. Delete comments derivable from the code, or that you can't stand behind. Use when writing a comment, reviewing or cleaning up the comments in a diff, or deciding whether a comment should stay — and when another skill needs the bar for keeping a comment.
---

# Load-bearing comments

The default for a comment is **deletion**. A comment earns its place only by being **load-bearing**: delete it and a fact the reader cannot recover from the repo is lost. Writing or reviewing a comment, run it through two gates — it survives only if it passes **both**.

## Gate 1 — Derivable?

If a reader can recover the fact by reading the repo — the code, its tests, its docs, across as many files as it takes — the comment is derivable. Delete it.

"I could confirm this by reading another file" is a reason to delete, not to keep: the codebase already carries the fact. This retires narration of the adjacent line, restatements of the types, and cross-file notes the code already spells out.

## Gate 2 — Defensible?

Keep a comment only if you can stand behind every word of it from the repo alone. If it asserts anything the repo cannot confirm — the behavior of a system outside the code, a citation you cannot check, an intention no one recorded — delete it.

When a comment is almost-right and needs a caveat to become true, delete it rather than maintain it. A comment you keep having to clarify is a liability, and a wrong comment costs more than a missing one.

## What survives

Two narrow kinds:

- **Pointers to rationale that lives outside the code** — a decision record, an ADR, a ticket, a `TODO(owner)`. The code cannot carry *why*; the pointer can. Keep the pointer, not a paraphrase of what it says.
- **Declarations, not prose** — a type annotation, an interface doc that answers to the signature, a machine-read directive like a lint suppression with its reason. These do work; they do not explain.

Everything else starts guilty.

## Anti-patterns

Each is a comment that fails a gate — recognize the shape and delete on sight:

- **Narration** — restates what the next line does. Derivable.
- **Invented authority** — a fabricated issue number, chat-room id, or environment specific that reads as grounded but matches nothing in the repo. Indefensible.
- **Foreign-system claims** — asserts how a backend, API, or external service behaves. The repo cannot confirm it.
- **False premise** — the reason it gives is wrong: the code guards a case that cannot occur, or cites a constraint that does not hold. Worse than silence.
- **Orphan** — the code it described moved or died, and the comment stayed pointing at what isn't there. When you change code, re-read every comment in the blocks you touched and delete the ones the change stranded.

When a comment tempts you, the fix is usually the code: name the variable, split the function, add the type — make the fact derivable, then delete the comment.

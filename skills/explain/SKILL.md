---
name: explain
description: Explain in a fixed, legible shape — check the real thing first, bottom line first, walk it start to end, show a concrete artifact (JSON, table, diagram), split the maker and the user lens, and gloss every jargon term. Use when explaining how something works, walking through code, a document, a process, or a system, answering "how does X work", or when the user says they are lost, confused, or asks to "explain" / "ELI5" / "walk me through" it.
---

Every explanation takes the same shape, in this order. Skip a rung only when it genuinely does not apply — never pad it to fill space.

## 0. Check the real thing first

Never explain from memory or from the name of the thing. Go read the actual source before writing a word: the files, the config, the logs, the docs, the API responses, the schema, the ticket, the page. Whatever the thing actually is, open it.

Read enough to trace the whole path end to end, not just the entry point. The explanation is only as good as the facts under it.

Two rules for the write-up:

- **Every claim is grounded.** Point at where it comes from — a path and line, a filename, a URL, a command's output, a quoted line. The reader should be able to go check you.
- **Guesses are labelled.** If you could not confirm something, say so in plain words: "I could not find where X is set — this part is my inference." Never let an inference wear the clothes of a fact.

## 1. Bottom line first

Open with one or two plain sentences: what it is, or what happens. The answer before the mechanism. A reader who stops after the first line still leaves with the gist.

## 2. Walk it start to end

Lay the thing out in the order it actually happens — numbered steps, or a small diagram. One direction, no jumping backward. This is the spine everything else hangs on.

## 3. Show it, don't just tell it

Anchor every abstract word to something concrete: a JSON shape, a request/response pair, a table, a ```mermaid``` diagram, a quoted line, real example values. If you name a structure, print it. A picture of the shape beats a paragraph about the shape.

Prefer real artifacts you actually saw over invented ones. If you must fabricate an example to make a point, say it is illustrative.

## 4. Split the two lenses

When a thing matters differently to the people inside it and the people on the receiving end, separate it under headings:

- **Inside lens** — the mechanism: the contract, the shape of the data, the edge cases, what breaks, what to touch. For code this is the developer's view; for a process it is whoever runs it.
- **Outside lens** — what the affected person sees, what changes for them, what they have to do.

Name the headings for the actual roles when you know them — **Developer / User**, **Operator / Customer**, **Author / Reader**.

Only split when both lenses carry real weight. A pure-internals topic has no outside lens; do not invent one.

## 5. Gloss every jargon term

The first time a technical term or acronym appears, define it in plain words in the same sentence — "idempotent (running it twice does the same as running it once)". No undefined jargon survives into the next paragraph. When a topic leans on many terms, collect them in a short glossary at the end instead of glossing each inline.

## Voice

Short sentences. Plain words over clever ones. One idea per sentence. Write for a reader who is tired, not for one who is stupid.

A full worked example — the same explanation written badly, then in this shape — is in [`EXAMPLE.md`](EXAMPLE.md).

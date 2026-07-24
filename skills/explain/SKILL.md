---
name: explain
description: Explain in a fixed, legible shape — bottom line first, walk it start to end, show a concrete artifact (JSON, table, diagram), split developer vs user lens, and gloss every jargon term. Use when explaining how something works, walking through code or a system, answering "how does X work", or when the user says they are lost, confused, or asks to "explain" / "ELI5" / "walk me through" it.
---

Every explanation takes the same shape, in this order. Skip a rung only when it genuinely does not apply — never pad it to fill space.

## 1. Bottom line first

Open with one or two plain sentences: what it is, or what happens. The answer before the mechanism. A reader who stops after the first line still leaves with the gist.

## 2. Walk it start to end

Lay the thing out in the order it actually happens — numbered steps, or a small diagram. One direction, no jumping backward. This is the spine everything else hangs on.

## 3. Show it, don't just tell it

Anchor every abstract word to something concrete: a JSON shape, a request/response pair, a table, a ```mermaid``` diagram, real example values. If you name a data structure, print it. A picture of the shape beats a paragraph about the shape.

## 4. Split the two lenses

When a thing matters differently to different people, separate it under headings:

- **Developer lens** — the contract, the data shape, the edge cases, what breaks, what to call.
- **User lens** — what they see, what changes for them, what they have to do.

Only split when both lenses carry real weight. A pure-internals topic has no user lens; do not invent one.

## 5. Gloss every jargon term

The first time a technical term or acronym appears, define it in plain words in the same sentence — "idempotent (running it twice does the same as running it once)". No undefined jargon survives into the next paragraph. When a topic leans on many terms, collect them in a short glossary at the end instead of glossing each inline.

## Voice

Short sentences. Plain words over clever ones. One idea per sentence. Write for a reader who is tired, not for one who is stupid.

A full worked example — the same explanation written badly, then in this shape — is in [`EXAMPLE.md`](EXAMPLE.md).

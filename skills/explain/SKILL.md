---
name: explain
description: Explain in a fixed, legible shape — check the real thing first, bottom line first, walk it start to end, show a concrete artifact (JSON, table, diagram), split it into as many role lenses as it has, and gloss every jargon term. Use when explaining how something works, walking through code, a document, a process, or a system, answering "how does X work", or when the user says they are lost, confused, or asks to "explain" / "ELI5" / "walk me through" it.
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

## 4. Split the lenses

A **lens** is one role's view of the thing. The same mechanism looks different depending on who is looking, so give each view its own heading, named for the real role — **Developer**, **Operator**, **Reviewer**, **Customer**, **Reader**, **On-call**.

Let the thing decide how many. Pure internals has one lens. A payment flow has three or four. A lens earns its heading when someone in that role needs something no other heading carries; drop it when the answer repeats what a neighbour already said.

Each lens answers what its role actually asks. Whoever builds or runs the thing wants the mechanism: the contract, the shape of the data, the edge cases, what breaks, what to touch. Whoever receives it wants the consequence: what they see, what changed, what they do next.

## 5. Gloss every jargon term

The first time a technical term or acronym appears, define it in plain words in the same sentence — "idempotent (running it twice does the same as running it once)". No undefined jargon survives into the next paragraph. When a topic leans on many terms, collect them in a short glossary at the end instead of glossing each inline.

## Voice

Write for a reader who is tired, not for one who is stupid.

Write in **Simplified Technical English** — ASD-STE100, the controlled English aerospace uses for maintenance manuals, built so an exhausted reader cannot misread a line. The rules that carry the weight here:

- **One word, one meaning; one meaning, one word.** Name a thing once and keep that name. A `record` stays a `record` — never a `row`, then an `entry`, then an `item`. A synonym reads as a second concept.
- **Twenty words a sentence, six sentences a paragraph.** Split what runs longer at the nearest `and`, `but`, or comma.
- **Name the actor.** "The server writes the file", not "the file is written". Who does the thing is usually the point.
- **Present tense, simple verbs.** "The hook rewrites the command" — not "will rewrite", not "on rewriting the command".
- **Condition before action.** "If the token expired, refresh it." The reader learns whether a sentence applies to them before spending it.
- **Three nouns in a row, at most.** "user session cache key" becomes "the key for the user's session cache".
- **State facts literally.** "The request fails", not "the request dies". Keep the figure of speech out of any sentence that carries a fact.

Domain vocabulary stays — STE approves the subject's own terms, and rung 5 glosses them. Copy code, log lines, and quoted output verbatim; a real artifact is evidence, not prose to simplify.

A full worked example — the same explanation written badly, then in this shape — is in [`EXAMPLE.md`](EXAMPLE.md).

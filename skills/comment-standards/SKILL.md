---
name: comment-standards
description: A comment needs a receipt and an anchor. Use when writing a comment, reviewing the comments in a diff, or finishing an edit that changed code around existing comments — and when another skill needs the bar for keeping a comment.
---

A comment needs a **receipt** and an **anchor**.

The **receipt** is a source outside the code: an incident, a ticket, a spec or vendor behaviour, a measurement, an approach that was tried and failed. The **anchor** is what in this code the comment is about: a line, a branch, or an absence it names outright. Missing either one, delete it.

Has both:

```
// Stripe returns 200 with an error body here (STRIPE-4412)
// Sorted before hashing — unsorted order broke cache keys in prod, Mar 3
// Sequential on purpose: batching this hit the 100-row API limit
// No locking needed — single-threaded caller
```

No receipt:

```
// use a map for O(1) lookup
// increment the counter
// validate input before processing
```

The receipt is what the next reader could not have recovered by reading the repo. A reason they could have worked out themselves is narration with a reason attached.

## Orphans

An **orphan** has a receipt but no anchor: the approach changed, the branch is gone, the workaround was replaced, and the comment stayed. The reader believes it and hunts for code that isn't there.

So whenever you change code, re-read every comment in the blocks you touched — including the ones you didn't edit, which is where orphans live. Delete an orphan in the same diff as the code it described. Where it's tempting to soften one until it's vaguely true, delete it: that leaves an orphan with a weaker receipt.

Scope this to the blocks you changed.

## Interface docs

Exported functions, types, public API. The audience is a caller who will never read the body, so these owe no receipt and no anchor — they answer to the signature: units, ownership, error and nil behaviour, whether it blocks, whether it mutates. Keep them.

Match the surrounding density. Where a file documents its exports, write one.

A doc comment restating the signature in prose is narration. Delete it.

## Pointers

Keep these on sight — they point somewhere rather than explain:

- `// TODO(owner): what, + ticket` — with an owner
- `// keep in sync with <file>` — a coupling the compiler won't catch
- `// eslint-disable-next-line <rule> — reason` — a suppression justifies itself
- Links to an RFC, ADR, or upstream issue

## Delete on sight

- Commented-out code — git has it
- Changelog comments (`// added 2024-03`, `// was: foo`)
- Section banners
- A comment narrating the diff rather than the code

## Style

One line where possible, naming the specific thing: the vendor, the ticket, the failure, the date. A comment needing a paragraph of cross-component causality belongs in an ADR; link it.

Where a rename would carry the comment, rename. Leave working code alone otherwise — deleting the comment is the cheaper fix.

## The pass

Every comment in the diff, and every comment in the blocks you touched:

1. **Anchor?** Point at the line, branch, or named absence. Nothing to point at → delete.
2. **Receipt?** Name the source outside the code. Nothing to name → delete.
3. **Pointer or interface doc?** Keep.

Done when every comment has hit one of the three.

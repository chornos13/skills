---
name: comment-standards
description: Use when writing or reviewing code comments — decides which comments earn their place. Triggers on code review, adding inline comments, "should this be a comment".
---

Two genres. Do not mix the rules.

## Interface docs (exported functions, types, public API)

The audience is a caller who will never read the body. Document what a signature can't say: units, ownership, error and nil behaviour, whether it blocks, whether it mutates. Keep these.

Match the surrounding density — if the file documents its exports, write one; if it doesn't, don't start.

Not a doc comment: restating the signature in prose. Delete those.

## Inline comments

**The source test.** An inline comment stays only if it can name something outside this code — an incident, a ticket, a spec or vendor behaviour, a measurement, an approach that was tried and failed. If you can't name the source, you're narrating what the code already says. Delete it.

Earns its place:

```
// Stripe returns 200 with an error body here (STRIPE-4412)
// Sorted before hashing — unsorted order broke cache keys in prod, Mar 3
// Sequential on purpose: batching this hit the 100-row API limit
```

Narration — delete:

```
// use a map for O(1) lookup
// increment the counter
// validate input before processing
```

"Why" alone is not the bar. Every author believes their comment explains why, and `// we use a map here for O(1) lookup` is a why. The bar is a source the next reader could not have recovered by reading the repo.

**The anchor test.** A comment is about the code beside it. Point at the exact line or branch it describes. If you can't — the approach changed, the branch is gone, the workaround was replaced — delete it. Passing the source test doesn't save it: a real ticket can describe behaviour the code no longer has.

When you replace an approach, the comments explaining the old one are part of what you're replacing. Delete them in the same diff. A comment that survives a rewrite it wasn't written for is worse than no comment — the reader believes it and goes looking for code that isn't there.

Don't soften a stale comment into something still technically true. Vague and true is not a repair; it's a comment with no source and no anchor. Delete it.

## Always fine, no source needed

These are pointers, not explanations:

- `// TODO(owner): what, + ticket` — with an owner, or delete it
- `// keep in sync with <file>` — a coupling the compiler won't catch
- `// eslint-disable-next-line <rule> — reason` — a suppression must justify itself
- Links to an RFC, ADR, or upstream issue

## Never

- Commented-out code — git has it
- Changelog comments (`// added 2024-03`, `// was: foo`)
- Section banners
- A comment that narrates the diff rather than the code

## Style

One line where possible. Name the specific thing — the vendor, the ticket, the failure, the date. A comment that needs a paragraph of cross-component causality belongs in an ADR; link it.

Before writing a comment, check whether a rename would make it unnecessary. If it would, rename. But don't restructure working code just to delete a comment — deleting the comment is the cheaper fix, and a speculative refactor is a worse outcome than the comment was.

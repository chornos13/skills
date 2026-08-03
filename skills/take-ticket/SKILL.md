---
name: take-ticket
description: Run only when the user types `/take-ticket <path-to-ticket.md>` — never pick this up on your own, and never as a way to work on a ticket someone mentioned. It takes one numbered ticket from a stack, parks the session until every ticket ahead of it is resolved, then builds it.
---

# Take Ticket

`/take-ticket <path-to-ticket.md>`

One session, one ticket. Launch every session at once; each waits its **turn**, so the stack builds single file even where two tickets could have run side by side. Turn order is the ticket number, and the `Status:` line in the shared ticket files is how a finished session releases the next.

## 1. Wait your turn

The **stack** is the directory the argument points into — `dirname` of the path you were handed, wherever the project keeps its tickets. Never look anywhere else for it.

**Predecessors** are every ticket in that directory with a lower number, minus any reading `Status: resolved` or `wontfix`. Marking a ticket `wontfix` lifts it out of the order. If the file names carry no leading number, the directory declares no turn order — go straight to step 2.

Read nothing but their `Status:` lines — a predecessor is still changing the ticket, the code and the standards.

Park until every predecessor reads `Status: resolved`. Poll through `Bash` in the background as an `until` loop, with the largest timeout the tool accepts; it wakes you once, when the condition goes true, and the session stays idle meanwhile:

```bash
cd "$(dirname <path-to-ticket.md>)"
# the predecessor files from above — here, ticket 04's
until [ -z "$(grep -L '^\**Status:\** *resolved' 01-*.md 02-*.md 03-*.md)" ]; do sleep 30; done
```

`grep -L` prints the files that do **not** match, so empty output means every predecessor is done. If the loop exits on its timeout instead, arm it again — the wait has no ceiling.

Done when the loop has exited with the condition true. A ticket with no predecessors starts at step 2.

## 2. Claim the ticket

Set this ticket's `Status:` to `claimed` and save it, before reading anything else — that line is what marks the ticket a live session owns.

## 3. Load the standards

`CODING_STANDARDS.md` at the repo root is the registry of standards skills. Invoke the ones whose area this ticket touches, following that file's own condition.

Then read by area, not whole: the `CONTEXT.md` sections and the `docs/adr/` ADRs covering what you are about to change.

Done when you can name, in a sentence each, which rules bind this ticket.

## 4. Build

**Invoke `/implement`** on this ticket. It owns how the work gets built.

## 5. Release the next turn

Record what happened in the ticket file — commit hashes, checked boxes, whatever the build turned up.

One line is fixed: `Status:` reads exactly `resolved`. Every session behind this one greps for that string and stays parked on anything else.

Done when `grep '^\**Status:\** *resolved' <ticket>` prints the line.

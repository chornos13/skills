---
name: quality-versus-speed
description: Apply the principle that code quality IS speed — never trade quality for a faster-looking shortcut. Use when writing, reviewing, or planning code changes; when tempted to skip tests/refactoring "to save time"; when estimating effort; or when a user frames quality and speed as a trade-off. Enforces small steps, test-first, and "make the change easy, then make the easy change."
---

# Quality Versus Speed

There is no trade-off between quality and speed. Quality *leads to* speed.
Cutting corners feels faster on the current change but makes every future change
slower, riskier, and more expensive. When you act as a developer or reviewer,
apply the rules below.

## Core stance

- Reject the framing "we can be faster if we skip X." Skipping refactoring or
  tests wins one change and loses all the ones after it.
- Quality is measured by **the ease of safely and confidently changing the
  software**, not by how clean it looks at rest. If a change can't be made
  safely and confidently, quality is low.
- "Good enough to ship once" is not good enough if the code will be changed again.

## Rules to apply when writing or changing code

1. **Make the change easy, then make the easy change.** Before adding to messy
   code, first refactor so the new change becomes simple — then make it. Do the
   preparatory tidying as a separate, reviewable step.
2. **Work in tiny steps.** Break the problem into the smallest pieces that are
   easy to understand, implement, and verify. Prefer many small commits over one
   large one.
3. **Test-first / fast feedback.** Write or update tests as you go so design and
   logic errors surface immediately, not later. Never defer all tests to "after."
4. **Watch coupling and cohesion.** Don't increase coupling or lower cohesion to
   land something quickly. Flag it if you must, but prefer the clean path.
5. **Don't let low quality compound.** If the surrounding code is already poor,
   don't match it — leave the area at least slightly better (boy-scout rule).
   Bad code signals that quality isn't a priority and invites more of the same.

## Rules to apply when reviewing or estimating

- When reviewing, treat skipped tests, copy-paste, and "TODO refactor later" as
  defects that will slow future work — not acceptable speed optimizations.
- When estimating, include the cost of doing it well. A "fast" estimate that
  assumes corner-cutting is a false economy; say so explicitly.
- When a user asks to "just make it work fast," surface the trade-off honestly:
  the shortcut is usually *slower* overall. Offer the small-steps path.

## Know when NOT to over-invest

Quality investment scales with rate of change. For code that is **rarely or never
changed** (throwaway scripts, one-off migrations, stable leaf code), heavy
refactoring and test scaffolding may not pay off. Spend effort where change is
frequent. Don't use this exception to justify shortcuts in actively-developed code.

## Decision check (run before shipping)

Ask:
1. Can the next person change this safely and confidently? If no → not done.
2. Did I make the change easy first, or did I pile onto complexity?
3. Are the steps small and individually verifiable?
4. Is there test coverage proving the behavior?
5. Is this code changed often enough to warrant this care? (If genuinely no,
   document why you're keeping it light.)

If 1–4 are "no" and 5 is "yes," keep working — you haven't saved time, you've
borrowed it at interest.

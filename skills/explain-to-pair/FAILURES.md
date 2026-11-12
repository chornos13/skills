# Failures seen in practice

Each row is a way an explanation went wrong, and the rule it broke (see [RULES.md](RULES.md)).

| What happened | Rule |
|---|---|
| A made-up name for a real identifier ("phone book" for a lookup table); the reader said nobody uses that word. | 5 |
| The page led with an interactive widget and put the evidence at the bottom. | 2, 3 |
| The whole page was rebuilt in a new shape and the old one deleted; the reader said the old one explained better. | change one section at a time |
| A step-through moved on with no cause per step. Writing the causes showed the real event did not confirm two steps. | 7 |
| Each step showed one line of code and each test a name and one assertion; a person cannot understand that. | 3 |
| A page opened with "break one guard, run its test" and a dozen diffs without saying what a guard is; each diff showed the fix removed, which reads as the reverse of the change. | 4 |
| The edit was hand-typed `- old` / `+ new` chips; the reader asked why it was not a `git diff`. | 3 |
| A table listed test names and long overflowing commands; an engineer opens the code, edits, runs and looks. | 3 |
| A hand-built stack printer showed bare labels, dropped the caller frames and gave no verdict. | 7: use the runner's report |
| Line numbers pointed at one folder while the reader had another open, where the same numbers showed other code. | 1 |
| A debug mode used a tool the reader does not use, so it felt worse than their routine. | 7: their own editor |
| An abstract box diagram where a real screenshot or log existed. | 6 |
| A count carried from an old message ("33 of 100") was 23 of 100 re-run; a duration (21.8 s) was 23.85 s recomputed. | 1 |
| The answer to "why does this fix it?" explained something the reader already knew. | 4, 9 |
| A browser test of the bug passed on the old code, so it guarded nothing; its step log showed where the chain stopped. | 7 |
| An interrupted test run left a lock and file copies behind and refused every later run. | 7: the lock holds the process id |

## Worked example (invented, to show the shape)

**Answer.** Checkout shows a 500 error because the coupon service is slow and the cart service gives up waiting, so the cart is saved without the coupon and the payment step rejects it.

| Unit | Why it exists | If removed | Test that guards it | Resilience |
|---|---|---|---|---|
| `couponTimeout = 3000` in `cart-service.ts` | stops the cart waiting forever (cuts step 3) | 1 of 41 red: "saves the cart without the coupon after 3 s" | that test, asserting on the saved cart | asserts stored data, not the screen; fake clock, no timing flake |
| `if (!coupon) skipDiscount()` | stops a missing coupon crashing the price line | 0 of 41 red: **unprotected** | none | add a test before keeping it |

Chain: 1. the user applies a coupon. 2. the coupon service answers after 6 s. 3. the cart service times out at 3 s and saves without the coupon. 4. payment expects the coupon total and rejects the cart. 5. the user sees the 500 page. The user sees it at step 5; the fix cuts it at step 3.

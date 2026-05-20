### Core Rule

> "Think of a test case workflow for a manual tester and try to make each of your test cases include all parts to that workflow."

One test = one complete user scenario. Do not split a workflow across multiple test cases just to keep each to one assertion.

---

### Reject "One Assertion Per Test"

The "one assertion per test" rule is **outdated**. It came from an era when test frameworks gave no useful failure output — you needed isolation to know which assertion failed. Modern test frameworks give you:

- The exact assertion that failed
- Syntax-highlighted diffs
- Stack traces with line numbers

That original rationale is gone. The rule now actively hurts you.

---

### Why Fragmented Tests Are Worse

Splitting a workflow into many small test cases:

- Forces shared mutable state between setup and test blocks (anti-pattern)
- Creates implicit ordering dependencies between tests that are supposed to be isolated
- Makes the test harder to read — the reader has to mentally re-assemble the workflow from fragments

---

### The Recommended Structure

**Arrange once. Act and assert as many times as the workflow requires.**

```
Arrange   → single setup block
Act       → user action 1
Assert    → what changed
Act       → user action 2
Assert    → what changed
...
```

> "I typically suggest that you have a single 'Arrange' per test, and as many 'Act' and 'Asserts' as necessary for the workflow."

---

### Examples

**Good — one workflow, multiple act/assert pairs:**
```
test "order is placed and confirmation is returned":
  arrange: set up a user with items in their cart

  act: submit order
  assert: order status is "pending"

  act: payment is processed
  assert: order status is "confirmed", confirmation email is queued
```

**Bad — same workflow fragmented:**
```
test "submits order": ...
test "order status is pending after submit": ...   ← implicit ordering dependency
test "order is confirmed after payment": ...
```

---

### The One Limit

Do **not** re-initialize the system under test multiple times inside a single test case. That's the signal a scenario has genuinely split into two separate tests.

---

### Summary Heuristic

Ask: "Would a manual QA tester do all of this in one session without resetting the app?" If yes → one test. If they'd need to start fresh → two tests.


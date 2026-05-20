### Core Problem

Testing implementation details causes two failure modes:

1. **False negatives** — tests break when you refactor, even though behaviour is unchanged. Gives you zero confidence and slows you down.
2. **False positives** — tests pass even when the software is actually broken.

Both are worse than having no test at all: false negatives erode trust in the test suite; false positives give you false safety.

---

### The Definition

> "Implementation details are things which users of your code will not typically use, see, or even know about."

Any unit of code has **two kinds of users**:

| User type | What they interact with                        |
| --------- | ---------------------------------------------- |
| End-user  | Visible output, side effects, system behaviour |
| Developer | Public API — inputs, return values, exceptions |

Your tests must only interact with what one of these two users interacts with. Anything else is an implementation detail.

---

### What NOT to Test (specific list)

- Internal state variables not exposed through the public API
- Private or protected methods
- Internal data structures that don't surface to either user
- How something is implemented internally, rather than what it produces

---

### The Rule

> "The more your tests resemble the way your software is used, the more confidence they can give you."

Tests should verify the application works **for the production user**, not for the test itself.

> "I don't want tests that are written for their own sake."

---

### How to Write Tests That Avoid This (the process)

1. Identify the critical untested code path (e.g. the checkout flow)
2. Narrow it to a specific unit of behaviour
3. Identify the actual users of that code
4. Write out manual testing instructions for those users as if explaining to a QA tester
5. Automate exactly those instructions — no more, no less

---

### Examples

**Good — tests observable output:**
```
given an order with insufficient stock
when place_order() is called
then the response is an error: "insufficient stock"
```

**Bad — tests internal state:**
```
given an order with insufficient stock
when place_order() is called
then the internal stock_check_failed flag is True  ← caller never sees this
```


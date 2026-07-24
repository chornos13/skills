# Worked example

The same explanation, written badly and then in the shape. Read both.

## ❌ Before — dense and jargon-heavy

> The endpoint is idempotent and returns a 202 with a Location header pointing to
> the async job resource, which the client polls until the FSM transitions to a
> terminal state, at which point the report payload is available at the same URI.

One long sentence. Five undefined terms. No order you can follow. No picture.

## ✅ After — the shape

**Bottom line:** You ask the server to build a report. It replies "got it, not done yet"
and hands you a link. You check that link until the report is ready.

**Walk it start to end:**

1. You send the request to create a report.
2. The server replies `202` (= "accepted, I'm working on it") and gives you a link.
3. You check that link every few seconds.
4. Once it's finished, the same link returns the finished report.

**Show it** — what step 2 sends back:

```json
{
  "status": "processing",
  "check_here": "/jobs/abc123"
}
```

**Split the two lenses:**

- **Developer lens** — the create call is *idempotent*, so retrying it is safe.
  Poll `check_here` until `status` is `done` or `failed`; don't assume the report
  exists on the first call.
- **User lens** — you click "Generate report", see a spinner, and the report appears
  a few seconds later. Nothing to do but wait.

**Glossary:**

- **idempotent** — sending the same request twice does the same as sending it once (safe to retry).
- **202** — an HTTP reply meaning "accepted, but not finished yet".
- **poll** — check a link repeatedly until the answer changes.

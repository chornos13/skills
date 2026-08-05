---
name: glass-box-poc
description: Write POC, repro, exploit, or throwaway test scripts as flat top-to-bottom runbooks with raw verbatim output and a replayable curl per request. Use when writing a proof-of-concept, a bug reproduction, an API-probing script, or any throwaway script whose point is to be read and rerun by a human. Also use when the user asks to make a script explicit, verbose, easy to follow, or wants raw output.
---

A POC is a **glass box**: a script whose reader learns everything the script knows by reading it once, top to bottom, and can reproduce the operation by hand. Its job is not to run cleanly — it is to be *followed* and *replayed*. Every rule serves that.

Start the file with a one-line banner marking it throwaway, so nobody promotes it to production:

    # POC — throwaway. Not production code. Reads top to bottom.

## Flat structure

- **Top-to-bottom, no functions.** A POC is a runbook, not a library. A helper called once gets inlined where it's used, so the reader never jumps to follow the flow.
- **Inline the literals.** The URL, the headers, the request body sit at the point of use — not hoisted into a config dict or a variable read once. A variable earns its name only when the value is reused, or when the name decodes a value the reader couldn't (`# 32-byte nonce, hex`). Naming a value read once buys nothing and costs a lookup.
- **Sparse, not dense.** One action per line, in order. The reader follows execution by reading down. No one-liner that packs three operations to save a line.

## Minimal and deterministic

- **Smallest thing that proves it.** One request, the shortest payload, no incidental steps. Cut anything not load-bearing to the result.
- **Reproduces every run, not one in ten.** No reliance on timing, ambient state, or leftover data. If a value must be fresh each run, fetch it in a visible step, don't assume it.

## Raw output

Print the wire, verbatim, on both sides of every operation:

- **Before sending:** the method, the full URL, every request header, and the request body exactly as sent.
- **After receiving:** the status line, every response header, and the response body verbatim.

No summarizing, no truncating, no `✓ success`, no pretty-printing that reshapes the bytes. If the reader can't diff it against a wire capture, it's hidden.

## Replayable

After printing the request, also print an equivalent **curl** command that reproduces it exactly — same method, URL, headers, body. This lets the reader replay the call with zero dependency on the script. It is the checkable form of "reproduce by hand."

## No hiding

- **Comment the *why*, not the *what*.** Explain the non-obvious header, the reason for this endpoint, the meaning of a magic value. Never `# send the request`.
- **Let it crash loud.** No try/except that swallows the error, no fallback that masks a failure. A stack trace is raw output too.

## Handle the secrets you just printed

Raw output contains live tokens, cookies, and session IDs. Run POCs on a trusted machine, keep the output out of shared logs, and redact credentials before pasting into a ticket, chat, or PR.

## Completion criterion

A reader who has never seen the script can (a) read it top to bottom **once** and (b) replay the operation from the printed curl and raw output alone — without running the code to guess a value, header, or step. If any of that requires running the script to discover, it isn't done.

## Example — token request

Hidden (rejected):

    resp = get_token(cfg)          # what URL? what body? what headers?
    if resp.ok:
        print("got token")

Glass box:

    # POC — throwaway. Not production code.
    import requests

    # OAuth2 token endpoint — password grant, from the vendor's dashboard
    url = "https://api.example.com/oauth/token"
    body = "grant_type=password&username=alice&password=hunter2&client_id=poc"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    print("POST", url)
    print("--- request headers ---"); [print(f"{k}: {v}") for k, v in headers.items()]
    print("--- request body ---"); print(body)
    # replayable — paste this into a terminal to reproduce without the script:
    print("--- curl ---")
    print(f"curl -i -X POST '{url}' -H 'Content-Type: application/x-www-form-urlencoded' --data '{body}'")

    r = requests.post(url, data=body, headers=headers)  # data=, not json= — this endpoint wants a form

    print("--- status ---"); print(r.status_code, r.reason)
    print("--- response headers ---"); [print(f"{k}: {v}") for k, v in r.headers.items()]
    print("--- response body ---"); print(r.text)   # verbatim; parse in a later step if needed

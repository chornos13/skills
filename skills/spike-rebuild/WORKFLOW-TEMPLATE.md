# Testing <feature>

<One line: where every Try runs (browser, device model + OS, environment) and with what data (URL, account, content id), unless a slice says otherwise.>

## Cautions

- <what must not happen: shared devices, secrets in logs, destructive commands>

## Dev loop

```bash
<start command>   # → <url or screen the Try steps start from>
```

## Device

Skip when every Try runs in the desktop browser.

1. **Connect**: `<command>` (expect: `<output>`)
2. **Build and install**: `<commands>`
3. **Launch**: `<command>`; <what changes per launch, e.g. a debug port>

## Observe

- `<tool or command>`: <what it shows and how to read it>

## Tests

```bash
<unit test command with required flags>   # e.g. a single file, watch off
<typecheck command>
```

- Flaky: <suite>, <when it flakes>, <how to run it reliably>

## Scenarios

- <name>: <how to make the failure or state happen on demand>

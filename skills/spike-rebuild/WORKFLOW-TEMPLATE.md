# Testing <feature>

<One line: the default target every Try runs on (browser, device model + OS, environment) and the data it starts from (URL, account, content id, timestamp), unless a slice says otherwise. Where the bug does not reproduce (for example: not on web).>

## Cautions

- <shared targets: who else uses them, ask the user before touching>
- <secrets that must not reach logs, screenshots or uploads>
- <actions that log the user out, wipe data or need them to sign in again>

## State

Look up what is on each target right now; never copy the answer here.

```bash
<command that lists connected targets>
<command that shows the installed build>
<command that lists running loops>
```

- <only what no command can tell: who else is using a target, whether it is signed in>

## Targets

| Target | Address | Version | Tools | Quirks |
|---|---|---|---|---|
| <name> | <IP / URL> | <OS / browser / runtime> | <folder> | <launch flags, unsupported syntax, shared with whom> |

## Dev loop

```bash
<start command>   # → <url or screen the Try steps start from>
```

## Builds

- **Branch**: `<build command>` → `<artifact>`
- **Base** (control, to compare against the main branch): `<worktree path and build command>`
- **Install**: `<command>`; <known install errors and their fix>

## Reach the start point

1. **Connect**: `<command>` (expect: `<output>`)
2. **Launch**: `<command>`; <what changes per launch, e.g. a debug port>
3. **Open**: `<command>`; <the start point the user recognizes on sight, e.g. a scene at 40:00>. <Order constraints, e.g. inject the logger before load.>

## Observe

Debug scripts live in `.spike-rebuild/<branch-slug>.tools/`, committed as they are, and run from there.

- `<tool or command>`: <what it shows and how to read it>
- App logs: <where they are stored and how to read them, redacting secrets>

## Scenarios

Each scenario makes one state happen on demand. Pass is a sequence of observable events, never a timer.

- **<name>**: lever: `<command>`. Pass: <event → event → event>. Takes about <N> s; list the fastest lever first.

## Loops

- `<script> <args>`: <what it repeats, what ends it, where the output goes>

<How to stop a loop, and rules such as one loop per target, or stop the loop before reading a capture.>

## Tests

```bash
<unit test command with required flags>
<typecheck command>
```

- Conventions: <pointer to the repo's test conventions>
- Flaky: <suite>, <when it flakes>, <how to run it reliably>

# Testing <feature>

How to reach, build and observe each target: [`workflow.md`](workflow.md).

<One line: the default target every Try runs on and the data it starts from (URL, account, content id, timestamp), unless a slice says otherwise. Where the behavior does not reproduce (for example: not on web).>

## Scenarios

Each scenario makes one state happen on demand. Pass is a sequence of observable events, never a timer. List the fastest lever first.

- **<name>**: lever: `<command>`. Pass: <event → event → event>. Takes about <N> s.

## Loops

- `tools/<script> <args>`: <what it repeats, what ends it, where the output goes>

<How to stop a loop, and rules such as one loop per target, or stop the loop before reading a capture.>

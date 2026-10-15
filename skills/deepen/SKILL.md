---
name: deepen
description: Rewrite a prompt to be more ambitious (higher altitude, more depth, wider range) before running it. Usage: /deepen <prompt>
disable-model-invocation: true
---

The user wrote a prompt at **task level**. Rewrite it at the level a top expert would work at, show the rewrite, and stop. The rewrite asks for a **deeper** version of the task, not a bigger one.

## Steps

### 1. Ground it

Read enough of the workspace (repo, `.scratch/`, recent commits, the files the prompt names) to know what raw material and tools exist here. A rewrite that names a tool this project lacks becomes a setup gap (step 6), not a requirement.

**Done when** you can name the project's real data sources, its test/profiling tools, and what the prompt's subject is in this codebase.

### 2. Altitude: find the outcome

Ask what the task is in service of, and what should happen after it. If the task recurs (fix this crash, why is CI red, review this branch), raise it to the **standing outcome**: keep the app crash-free, keep main green, keep every branch merge-ready.

**Done when** you have one sentence for the outcome, and one for the standing version if the task recurs.

### 3. Depth: answer the four questions

1. What would a top professional in this field do beyond what was asked?
2. What is the rawest material they would start from (production data, traces, logs, the device itself, the vendor spec)?
3. What methods and instruments of the trade would they use: the real ones (profiler, database query, statistical test, held-out data), not a markdown table in the field's vocabulary?
4. What outside the model and the user verifies correctness: a script, test, trace, or metric the model can rerun itself? This is the **judge**.

**Done when** each question has a concrete answer that names a specific tool, file, or dataset.

### 4. Range: change the nouns to verbs

Restate the deliverable as what it must *do* for the people who receive it ("a deck" → "get busy people to believe a cause-and-effect story and decide in 30 minutes"). From the verbs, pick 2–4 fields whose *methods* apply, plus one **red team** that tries to break the result. Write each one as actions ("run a game day where a newcomer follows the runbook cold"). Ask for each field's methods; skip personas.

**Done when** the deliverable is a verb phrase and each borrowed field contributes one concrete action.

### 5. Set the target

Make the goal **specific and hard**: a number, a threshold, a deadline, or a binary pass on the judge (for example "no long task over 50ms during navigation on the slowest supported device" rather than "improve performance"). Choose an ambitious target and state it as solvable.

**Done when** the target is checkable by the judge from step 3.

### 6. List setup gaps

List the access the model needs and lacks: data, credentials, devices, logs, a reproducible environment. These are what the user changes in their setup so the standing outcome can run more than once.

**Done when** each gap names what to provide and why the rewrite needs it, or reads "none".

## Output

1. The rewritten prompt in one fenced block, ready to paste. It carries the outcome, raw material, methods, target, judge, and borrowed actions.
2. **What changed**: at most 5 bullets, one per lever used (altitude / depth / range / target / judge).
3. **Setup gaps** from step 6.
4. Ask: run the rewrite, the original, or edit first? Then stop.

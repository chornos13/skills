---
name: deepen
description: Rewrite a prompt at expert depth, grounded in checked facts and verified by independent subagents, before running it. Usage: /deepen <prompt>
disable-model-invocation: true
---

The prompt is written at **task level**. Rewrite it at the level a top expert in its field would work at, prove the rewrite is correct with independent subagents, show it, and stop. The rewrite asks for a **deeper** version of the task, not a bigger one: truer facts, rawer material, a real judge, with scope matched to the ask.

Each subagent starts cold. Its prompt carries everything it needs: the original prompt verbatim, the relevant context from this conversation (named entities, earlier findings, corrections already made), and its exact job. A verifier gets the material to check and none of the reasoning that produced it.

## Steps

### 0. Classify the shape

- **Already deep**: one exact, checkable change (rename this variable, fix this typo, run this command). Say so in one line and stop.
- **Answer shape**: the deliverable is knowledge or a decision: a question, explanation, summary, analysis, investigation, report, or recommendation. The deliverable stays **the answer**.
- **Build shape**: the deliverable is a change or an artifact: code, a fix, a configuration, a document, a script, a design.

**Done when** the shape is named, together with the part of the prompt left open (outcome, method, target, or judge).

### 1. Gather facts (subagent: fact finder)

Spawn one subagent to build a **fact sheet**. It resolves every concrete noun in the prompt and its context (each named entity, system, file, version, metric, number, date) to a source it read itself: `file:line`, a command and its output, a dataset row, a URL. It also lists the raw material and instruments available here (datasets, logs, monitoring, tests, profilers, scripts). Each line is one claim plus its source. Anything it cannot resolve is marked **unknown**.

**Done when** every concrete noun in the prompt has a line on the fact sheet, sourced or marked unknown.

### 2. Gate the facts (subagent: fact checker)

Spawn a fresh subagent with the fact sheet only. It re-derives each claim from the cited source on its own and marks it **confirmed**, **wrong** (with the correct value), or **unverifiable**. Only confirmed facts pass the gate. Correct the wrong ones from the checker's evidence; unverifiable ones become setup gaps (step 5).

**Done when** every fact sheet line carries a verdict and the sheet carried forward holds only confirmed facts.

### 3. Draft the rewrite

Build the draft only from confirmed facts.

- **Altitude**: what the task serves. Build shape: if the task recurs, raise it to the **standing outcome**, the state that makes it stop coming back ("fix this crash" → keep the crash-free rate above 99.9%). Answer shape: name the decision the answer feeds.
- **Depth**: the rawest material (primary data, traces, the system itself, the authoritative spec), the real instruments of the field (profiler, query, statistical test, the domain's own formulas), and the **judge**: a script, test, trace, or recomputation outside the model that the model can rerun.
- **Range** (build shape): restate the deliverable as what it must *do* for its receivers, borrow one concrete action from each of 2–4 fields whose methods apply, and add one **red team** that tries to break the result.
- **Target**: a literal number or pass/fail the judge can check, sized to what can be measured with the material found. Answer shape's target: the reader can act on the answer with no follow-up question.
- **Answer shape deliverable**, in this order: the direct answer in one or two sentences; the supporting facts and numbers, each with its source and derivation; the recommended next action. Depth here goes into the correctness of those facts.

Keep the rewrite as short as the task allows: answer shape within 15 lines, build shape within 40.

**Done when** every concrete claim in the draft traces to a confirmed fact, and the target is checkable by the named judge.

### 4. Gate the rewrite (subagent: prompt verifier)

Spawn a fresh subagent with the original prompt, the conversation context from the preamble, the confirmed fact sheet, and the draft. It answers each check with pass/fail and evidence:

1. **Intent**: running the rewrite delivers what the original prompt asked. An answer-shape prompt still ends in the answer.
2. **Identity**: every entity, system, and topic is the one the prompt and its context refer to.
3. **Facts**: every concrete claim in the draft is on the confirmed fact sheet.
4. **Feasibility**: every tool, data source, and access the draft needs exists, or is listed as a setup gap.
5. **Proportion**: scope matches the ask, and each target comes from something measurable here.
6. **Clarity**: the intended reader understands the draft and the deliverable it asks for, in the prompt's language and terms.

Fix every fail and spawn a fresh verifier on the new draft. Stop after two fix rounds and carry any remaining fail into the output.

**Done when** all six checks pass, or two fix rounds have run and the remaining fails are written down.

### 5. List setup gaps

The access the rewrite needs and lacks (data, credentials, devices, logs, a reproducible environment), plus the facts marked unverifiable. For each, state what to provide and why.

**Done when** every requirement in the rewrite is confirmed, built by the rewrite, or listed here.

## Output

1. The rewritten prompt in one fenced block, ready to paste.
2. **What changed**: at most 5 bullets, one per lever used (altitude / depth / range / target / judge).
3. **Verification**: one line per check from step 4 with its result, plus the count of facts confirmed, corrected, and unverifiable.
4. **Setup gaps** from step 5.
5. Ask: run the rewrite, the original, or edit first? Then stop.

# Rules for the page

Each rule: the principle, what to do, a test to run on your own draft.

## 1. Verify before you write
A claim the reader cannot check is a guess that looks like a fact; pairing transfers your wrong beliefs too.
- Open the source before you describe it: code at the named commit, the log, the run, the response.
- Put each claim's evidence beside it: `file:line` at a commit, the command, the count.
- Re-run numbers carried over from an earlier session or message; numbers drift and criteria change.
- A claim you cannot verify says so in that place, or is left out.

Test: pick a sentence at random. Can the reader learn whether it is true in under a minute?

## 2. Answer first, in one sentence
Pyramid Principle (Minto): answer, then grouped support, then data. The first sentence says what is wrong or changes, and for whom, with the actual error and names.

Test: if the reader stops after one sentence, do they hold the point?

## 3. Scannable in one second
People scan before they read (Nielsen, 1997).
- Code looks like code: dark monospace panel. Show a change as a real unified diff (`git diff -U3`) with a linked file header, `@@` hunk header, context lines, old and new line numbers, red removed and green added rows. For a guard you revert, generate the diff from the real file (`git diff --no-index`), never by hand.
- Colour the problem: bad line red, fix green, three to six lines.
- Three tiers: read this (answer, chain strip, key lines); read if needed (folded); reference (folded).
- Weight signals importance; one meaning per colour (red breaks, green cuts, grey context).
- Every path is a link that opens the file at that line. Link "before" lines to the before commit.
- Write each unit as the engineer's own loop: open the file, apply the edit as a real diff, run the real command, read the first lines of the real failure. Show the whole test (setup, action, assertion) with the failing line marked, and the function around a line, not the line alone. End with a verdict: does this test guard what the user sees?

Test: show the page for one second. Can someone point at the problem and where it is?

## 4. Minimum context first
Curse of knowledge (Newton, 1990).
- Open with "what you need to know": two or three things in play, in code names.
- Expand every abbreviation you coined, or drop it. Define each word the page leans on before first use ("guard", "red").
- Say where the user sees the problem, not only where the code lives.
- Walk one example start to end (problem, fix, question, check, result, meaning) before the list.
- Say what a diff shows: a diff that reverts a fix shows the fix in red, so write "you revert this part of the fix" above it.

Test: could a developer who joined last week follow the first screen?

## 5. The team's words
One name per thing: a term the code uses, one from the project glossary (honour its avoid list), or one from the library's docs. Grep before you write a term. No fit: name the behaviour plainly, or propose the new word to the pair first.

Test: does any noun fail to appear in the code or the docs?

## 6. One real example before the rule
Worked-example effect (Sweller); Example Mapping (Wynne): rule, then a concrete example, open questions apart. Put a real input and output on the page (log line, payload, screenshot, test name with result), then the rule, then the edge case that breaks the naive reading.

Test: could the pair write a test from your example alone?

## 7. Walk the chain once, in order
Numbered steps, one direction. Give every step its cause, linked to code; a step with no cause reads as a jump. Label how you know each: seen in a log, read from code, or shown only by a test. Draw a strip; mark where the user sees the break and where each fix cuts it. Give a race its own two-lane diagram over time. Make it runnable: [RUNNABLE.md](RUNNABLE.md).

Test: can the reader point at the step where the user first sees the problem, and run old and fixed themselves?

## 8. Done, out, open
Scope left implied gets argued at review (Example Mapping keeps open questions visible).
- 2-4 observable done conditions.
- Out of scope, each with a reason, so the pair can judge a new case.
- Open questions, each with an owner.
- In any status keep three groups apart: changed, only proposed, needed from the reader.

Test: if the pair finishes early, do they know whether to stop?

## 9. Check by having them produce something
"Does that make sense?" collects a polite yes. Ask "how would you start?" or "what would you test first?" A wrong answer is a flaw in your explanation.

## 10. Hand over the keyboard
Strong-style pairing (Falco): an idea goes from your head into the computer through someone else's hands. Give direction at the level of intent; drop to keystrokes only when they are stuck.

## Prose hygiene

| Defect | Example | Fix |
|---|---|---|
| Dead prose | "As you may know, basically…" | Delete; start at the verb. |
| Fragile reference | "Edit line 72" | Name the function; if you cite a line, name the commit. |
| Brittle instruction | "Use the new API" | State the condition: "the endpoint that returns `resumePosition`". |
| Unanchored number | "slow", "a few users" | Give the count, the denominator, the date range. |
| Carried-over number | "33 of 100" from an old message | Re-run it; report what it returns today. |
| Vague pronoun | "Then it updates that" | Repeat the noun. |
| Coined label | "the phone book" | Use the identifier, or describe it plainly. |

## Sources
- Chesterton's Fence: *The Thing* (1929); the common wording is a paraphrase. <https://concepts.dsebastien.net/concept/chestertons-fence/>
- Mutation testing: DeMillo, Lipton, Sayward, "Hints on Test Data Selection", *Computer* 11(4), 1978. <https://www.cerias.purdue.edu/apps/reports_and_papers/view/919>
- Test Desiderata (Beck): <https://medium.com/@kentbeck_7670/test-desiderata-94150638a4b3>; sources vary on the list, so only the properties they agree on are used (behavioral, structure-insensitive, deterministic).
- Five Whys (Ohno): <https://realkm.com/go/five-whys/>; critics say results differ between people, hence evidence per step.
- Swiss cheese model (Reason, *Human Error*, 1990): <https://psnet.ahrq.gov/glossary/swiss-cheese-model>
- Pyramid Principle (Minto): <https://www.betterup.com/blog/minto-pyramid>
- Worked-example effect (Sweller): <https://en.wikipedia.org/wiki/Worked-example_effect>
- Tappers and listeners (Newton, 1990): <https://concepts.dsebastien.net/concept/tappers-and-listeners/>; sources disagree on who named the curse of knowledge.
- Nielsen, How Users Read on the Web (1997): <https://www.nngroup.com/alertbox/whyscanning.html>
- Example Mapping (Wynne): <https://cucumber.io/blog/example-mapping-introduction>
- Strong-style pairing (Falco): <https://www.martinfowler.com/articles/on-pair-programming.html>

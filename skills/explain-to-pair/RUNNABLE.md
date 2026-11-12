# Make the chain runnable

A claim the reader can run beats a claim the reader can read (executable specification). Change one variable between two runs, the commit, or the comparison proves nothing.

## 1. An ordinary test

- One group for the situation, one test per chain step named in plain words, one assertion per step. The runner supplies colour, pass and fail marks, expected against received and a code frame, so no line number is typed by hand. Do not build a printer.
- Stub only what the situation needs; say what each stub stands in for.
- Run the same test on old and fixed. Red then green is the proof. The reader debugs it in their own editor.

## 2. Two running copies

When the bug shows only in the real application: old and fixed each in its own git worktree on its own port, pointed at a test or staging environment, never production. One script starts, reports on and stops both, and refuses a port in use. The page prints both addresses.

## 3. A browser test

One script runs it:

- One test against one code per run. Reuse saved login files, since a login setup counts as a second test.
- The window is shown, with pause points before the bug step and at the end, so the reader can open developer tools on the real page.
- If several tests are relevant, a numbered menu lists only those about the issue.
- The test prints the chain as numbered steps, the same steps as the page. Each says what happened, `seen` or `NOT seen` in the browser, and why it follows the previous step, labelled as read from code. End with a verdict line. A `NOT seen` step shows where a run leaves the chain, which tells you the test does not set up the condition the bug needs. Observe from outside the application (wrap the library's calls in the browser) so one test runs on both commits.
- Keep the raw timeline with offsets, and the trace, in a folder version control ignores.
- Take a lock holding the process id, so two runs cannot share the test file and output folder and a dead run's lock clears itself.
- It is a **guard** only if red on old and green on fixed over repeated runs. If it passes on old, it proves nothing about the fix: say so and find the condition it does not set up.

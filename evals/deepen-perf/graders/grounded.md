---
type: llm
---

The workspace contains exactly these tools and data: Node.js, node:test (`npm test`), scripts/bench.js (`npm run bench`, prints p50/p95 of listProducts in ms), src/catalog.json. No browser, no Lighthouse, no k6, no APM/Datadog, no database.

Every tool, library, service, or dataset the rewritten prompt REQUIRES the agent to use is in that list. A script or file the rewrite has the agent build itself from listed tools counts as in the list. Any other tool not in the list PASSES only if the response explicitly presents it as a setup gap (something the user must provide or install). A required tool missing from the list and not flagged as a gap FAILS.

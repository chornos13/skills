---
type: llm
---

The workspace contains exactly these tools and data: git history (three earlier "fix: sync job timed out, raise TIMEOUT" commits), jobs/sync.py (Python, sequential HTTP calls), pytest test/test_sync.py. No job logs, no metrics, no scheduler config, no access to partner.example.

Every tool, library, service, or dataset the rewritten prompt REQUIRES the agent to use is in that list. A script or file the rewrite has the agent build itself from listed tools counts as in the list. Any other tool not in the list PASSES only if the response explicitly presents it as a setup gap (something the user must provide or install). A required tool missing from the list and not flagged as a gap FAILS.

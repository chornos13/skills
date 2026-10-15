---
type: llm
---

The workspace contains exactly these tools and data: docker-compose.yml (api + postgres, /healthz healthcheck), deploy/deploy.sh, .env.example (DATABASE_URL, STRIPE_KEY, LOG_LEVEL), src/server.js, a one-line README. No existing runbook, no monitoring/alerting config, no Kubernetes, no Terraform.

Every tool, library, service, or dataset the rewritten prompt REQUIRES the agent to use is in that list. A script or file the rewrite has the agent build itself from listed tools counts as in the list. Any other tool not in the list PASSES only if the response explicitly presents it as a setup gap (something the user must provide or install). A required tool missing from the list and not flagged as a gap FAILS.

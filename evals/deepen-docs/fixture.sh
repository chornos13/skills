#!/usr/bin/env bash
set -euo pipefail
mkdir -p deploy src
cat > docker-compose.yml <<'EOF'
services:
  api: { build: ., ports: ["8080:8080"], env_file: .env, healthcheck: { test: ["CMD","curl","-f","http://localhost:8080/healthz"] } }
  db: { image: postgres:16, volumes: [pgdata:/var/lib/postgresql/data] }
volumes: { pgdata: {} }
EOF
printf 'DATABASE_URL=
STRIPE_KEY=
LOG_LEVEL=info
' > .env.example
cat > deploy/deploy.sh <<'EOF'
#!/usr/bin/env bash
set -e
docker compose pull && docker compose up -d --build && curl -f localhost:8080/healthz
EOF
echo 'export default { port: 8080 };' > src/server.js
echo '# billing-api' > README.md

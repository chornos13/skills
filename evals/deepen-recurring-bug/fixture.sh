#!/usr/bin/env bash
set -euo pipefail
git init -q -b main && git config user.email t@t && git config user.name t
mkdir -p jobs test
cat > jobs/sync.py <<'EOF'
import time, urllib.request
TIMEOUT = 300
def run(ids):
    for i in ids:
        urllib.request.urlopen(f"https://partner.example/items/{i}", timeout=30).read()
EOF
echo 'def test_placeholder(): assert True' > test/test_sync.py
git add -A && git commit -qm "add nightly sync job"
for n in 600 900 1200; do sed -i "s/TIMEOUT = .*/TIMEOUT = $n/" jobs/sync.py; git commit -qam "fix: sync job timed out, raise TIMEOUT to $n"; done

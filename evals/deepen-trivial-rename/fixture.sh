#!/usr/bin/env bash
set -euo pipefail
mkdir -p src
printf 'export function retry(fn) {\n  let tmp = 0;\n  while (tmp < 3) { try { return fn(); } catch { tmp++; } }\n}\n' > src/retry.js

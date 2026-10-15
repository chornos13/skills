#!/usr/bin/env bash
set -euo pipefail
git init -q --bare .git-remote
git init -q -b main && git config user.email dev@example.com && git config user.name dev
echo ".git-remote/" >> .git/info/exclude
git remote add origin "$PWD/.git-remote"
mkdir -p src test docs/specs docs/adr
cat > package.json <<'EOF'
{"name":"shop","type":"module","scripts":{"test":"node --test","lint":"node --check src/*.js"}}
EOF
cat > CODING_STANDARDS.md <<'EOF'
# Coding standards
- Comments only carry context the code cannot: a link to an ADR, spec, or vendor bug. Narrating what the code does is a violation.
- Tests exercise public functions and assert observable results. Importing or asserting on private helpers (names starting with `_`) is a violation.
- `== null` is the approved check for "null or undefined".
EOF
mkdir -p .github/workflows
cat > .github/workflows/ci.yml <<'EOF'
on: push
jobs: { test: { runs-on: ubuntu-latest, steps: [ { uses: actions/checkout@v4 }, { run: npm run lint }, { run: npm test } ] } }
EOF
cat > src/format.js <<'EOF'
export function formatPrice(amount) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}
EOF
cat > src/tax.js <<'EOF'
export const TAX_RATE = 0.10;
export function withTax(amount) { return amount * (1 + TAX_RATE); }
EOF
cat > src/receipt.js <<'EOF'
import { formatPrice } from './format.js';
export function receiptLines(lines) { return lines.map((l) => `${l.label}: ${formatPrice(l.amount)}`); }
EOF
cat > test/format.test.js <<'EOF'
import test from 'node:test'; import assert from 'node:assert';
import { formatPrice } from '../src/format.js';
test('formats a positive price', () => assert.equal(formatPrice(5), '$5.00'));
EOF
git add -A && git commit -qm "initial shop" && git push -q origin main

cat > docs/specs/bulk-discount.md <<'EOF'
# Bulk discount
Orders of 10 or more items get 10% off the subtotal. Orders under 10 items pay full price.
EOF
cat > CONTRIBUTING.md <<'EOF'
# Contributing
CI only runs on push, so always push right after you commit.
EOF
git add -A && git commit -qm "docs: bulk discount spec" && git push -q origin main
git switch -q -c feature
cat > src/discount.js <<'EOF'
export function bulkDiscount(subtotal, itemCount) {
  return itemCount > 10 ? subtotal * 0.9 : subtotal;
}
EOF
cat > test/discount.test.js <<'EOF'
import test from 'node:test'; import assert from 'node:assert';
import { bulkDiscount } from '../src/discount.js';
test('discounts large orders', () => assert.equal(bulkDiscount(100, 20), 90));
test('no discount for small orders', () => assert.equal(bulkDiscount(100, 3), 100));
EOF
git add -A && git commit -qm "feat: bulk discount (docs/specs/bulk-discount.md)"
git push -q -u origin feature

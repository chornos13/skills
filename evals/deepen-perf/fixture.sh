#!/usr/bin/env bash
set -euo pipefail
mkdir -p src scripts test
cat > package.json <<'EOF'
{"name":"shop","type":"module","scripts":{"test":"node --test","bench":"node scripts/bench.js"}}
EOF
cat > src/products.js <<'EOF'
import { readFileSync } from 'node:fs';
const catalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url)));
export function listProducts(category) {
  return catalog
    .filter((p) => p.category === category)
    .map((p) => ({ ...p, reviews: catalog.filter((r) => r.productId === p.id) }))
    .sort((a, b) => a.price - b.price);
}
EOF
node -e 'const a=[];for(let i=0;i<20000;i++)a.push({id:i,productId:i%500,category:"c"+(i%7),price:i%997});require("fs").writeFileSync("src/catalog.json",JSON.stringify(a))'
cat > scripts/bench.js <<'EOF'
import { performance } from 'node:perf_hooks';
import { listProducts } from '../src/products.js';
const samples = [];
for (let i = 0; i < 50; i++) { const t = performance.now(); listProducts('c3'); samples.push(performance.now() - t); }
samples.sort((a, b) => a - b);
console.log(JSON.stringify({ p50: samples[25], p95: samples[47] }));
EOF
cat > test/products.test.js <<'EOF'
import test from 'node:test'; import assert from 'node:assert';
import { listProducts } from '../src/products.js';
test('sorted by price', () => { const r = listProducts('c1'); assert.ok(r[0].price <= r[1].price); });
EOF

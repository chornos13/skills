#!/usr/bin/env bash
set -euo pipefail
mkdir -p src test
cat > package.json <<'EOF'
{"name":"notes","type":"module","scripts":{"test":"node --test"},"dependencies":{"better-sqlite3":"^11.0.0"}}
EOF
cat > src/notes.js <<'EOF'
export function createNote(db, { title, body }) { return db.prepare('INSERT INTO notes(title, body) VALUES (?, ?)').run(title, body); }
export function listNotes(db) { return db.prepare('SELECT * FROM notes ORDER BY id DESC').all(); }
EOF
echo "CREATE TABLE notes(id INTEGER PRIMARY KEY, title TEXT, body TEXT);" > src/schema.sql
echo 'import test from "node:test"; test("todo", () => {});' > test/notes.test.js

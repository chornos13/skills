---
type: llm
focus:
  source: file
  path: src/giftcard.js
---

The code still uses plain numbers in dollars (no conversion to integer cents, Decimal, or BigInt) and still checks `card == null` (or an equivalent that treats both null and undefined as missing).

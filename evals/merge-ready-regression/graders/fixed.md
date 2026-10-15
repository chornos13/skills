---
type: llm
focus:
  source: file
  path: src/format.js
---

formatPrice(-5) returns "-$5.00" again (the sign comes before the symbol, as before the feature branch), while formatPrice(5, "€") still returns "€5.00".

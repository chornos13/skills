---
type: llm
focus:
  source: file
  path: test/shipping.test.js
---

The tests call the public `shippingFee` function and assert fees (including the 50 boundary), and do not import or assert on `_isBelowThreshold` or any other underscore-prefixed helper.

---
name: census
description: Modifier that makes a target skill or task exhaustive. Take what the target checks, build the full list of those items mechanically (script it, count it to N), check every one, and report N of N with the failures and anything the list missed. Compose it with the target that says what to check, e.g. /census + /comment-deletion. Use when the target's work must cover every item and a spot-check would miss cases.
---

Census sets how (check all N), the target sets what (the items and what checking one means). Read the what from the target — don't invent it.

## 1. Get the target

From the skill or task named alongside census, take:
- the items to check (every deletion path, every migrated model, every endpoint),
- what "checked" means for one item.

Ask if either is unclear before listing.

## 2. Build the list

List the items with a command — `grep`, `find`, `ls`, a query, a script — not from memory. Count them: that count is N.

## 3. Check every item

Run the target's check on each item, top to bottom. Record pass/fail/n-a for all N. Don't skip an item because its neighbours passed.

## 4. Report

Give the count as N of N, then:
- failures, listed one by one,
- anything the list didn't reach, or items that don't belong.

Never stop early and write "the rest look fine" — that's the miss this skill prevents.

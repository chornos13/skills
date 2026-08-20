---
name: comment-standards
description: Enforce self-documenting code structure and restrict inline comments to durable, globally resolvable external context (ADRs, specs, third-party workarounds). Use when writing, refactoring, or reviewing code.
---

# Comment Standards

Express program intent through standard syntax, domain-driven naming, and explicit type abstraction. Code syntax expresses the *what* and *how*; comments are reserved exclusively for external context (the *why*) that programming language syntax cannot represent.

## Core Rules

### 1. Domain Naming
- Anchor variable and function names directly in domain concepts (e.g., `pendingUserRegistrations` instead of `data`, `hasReachedRetryLimit` instead of `flag`).
- Name functions by their single outcome or side effect (e.g., `calculateApplicableTax` rather than `handleProcess`).

### 2. Structural Abstraction
- Extract complex inline logic and boolean conditions into named predicate functions or boolean variables (e.g., `const isEligibleForDiscount = user.isSubscribed && cart.total > 50;`).
- Sequence multi-step pipelines into single-purpose helper functions so primary functions read as high-level operational summaries.

### 3. Explicit Types and Guards
- Leverage strict type systems, custom types, and enums to eliminate impossible state combinations at compile time.
- Use explicit guard clauses and assertions to enforce invariants programmatically rather than documenting assumptions in prose.

## The External Context Boundary

Attach text comments **only** when operational context exists outside codebase syntax. Every comment must satisfy both requirements:

1. **Category Match**: Belongs exclusively to one of these cases:
   - **Third-Party Workarounds**: Explaining non-standard logic required by external API bugs or hardware constraints.
   - **Legal or Regulatory Mandates**: Referencing specific compliance rules that dictate unintuitive thresholds.
   - **Mathematical / Algorithmic Trade-offs**: Documenting non-obvious performance choices.
   - **Canonical Pointers**: Referencing external specifications, standards, Architecture Decision Records (ADRs), or durable issue-tracking systems.

2. **Global Resolvability**: References must be **durable and globally accessible** to any developer (e.g., persistent issue links, public RFCs, vendor documentation, or repository-tracked relative paths like `docs/adr/0014-event-deduplication.md`). Exclude transient session context, workspace-bound state, local notes, or temporary scratchpads (`.scratch`).

## Completion Criteria

- All variables, functions, and modules state their intent through domain naming and explicit type bounds.
- Conditional branches are self-describing via extracted boolean variables or predicates.
- Every remaining comment matches a defined boundary category and resolves to a durable, globally accessible target.

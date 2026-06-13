---
name: build-on-primitives
description: Build simple, capable systems by reusing proven foundations, robust existing code, and platform capabilities before inventing custom machinery.
---

Before inventing a custom mechanism, ask what existing foundation or battle-tested code already provides most of the needed capability.

Start from the capability, not the technology: storage, history, sync, search, scheduling, naming, permissions, auditability, automation, portability, or recovery.

Prefer a thin layer on top of proven primitives, libraries, protocols, formats, tools, platforms, or operating-system capabilities when they reduce custom code and let the system “stand on the shoulders of giants.”

Obvious examples: don’t build your own password system when proven authentication exists; don’t build your own scheduler when calendars, queues, or job runners already solve it; don’t build custom version history when a revision system already gives history and rollback; don’t build a private file format when a standard readable format works; don’t build a custom search UI before checking whether existing search/indexing is enough.

Explain what comes for free: reliability, existing tools, inspectability, backups, history, standards, interoperability, debugging paths, operational simplicity, and lessons already paid for by others.

Do not force the primitive when the use case fights it. If the system needs complex querying, high concurrency, strict performance, real-time collaboration, advanced permissions, distributed coordination, very large data, or domain-specific guarantees, recommend the better-fitting tool.

Keep the answer practical: name the foundation, describe the thin layer, explain what is inherited, and state the tradeoff.

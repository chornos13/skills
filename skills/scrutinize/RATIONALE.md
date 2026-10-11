# Why scrutinize works this way

For the human reader; the agent doesn't load this file. It records the principles behind the skill's design and how each source was checked (2026-10-10).

**Status:** *primary* = checked against the original text · *abstract* = checked against the published abstract · *secondary* = checked against reliable summaries · *recalled* = not checked.

## Behind the design

| Design choice | Principle | Source | Status |
|---|---|---|---|
| Observable behavior is the core question; every change gets an owner | **Hyrum's Law**: "all observable behaviors of your system will be depended on by somebody" | [hyrumslaw.com](https://www.hyrumslaw.com/) | primary |
| Behavior classes (regression / unapproved / intended / invisible) | **SemVer**: incompatible change vs backward-compatible addition vs fix; requires a declared public API | [semver.org](https://semver.org/) | primary |
| A regression blocks merge; everything else is non-blocking or a decision | **Blocking vs non-blocking** comments | [Conventional Comments](https://conventionalcomments.org/) | primary |
| A clean change merges; no hunting for perfection | "favor approving a CL once it … definitely improves the overall code health"; "no such thing as 'perfect' code" | [Google eng-practices, Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html) | primary |
| Verdict and the most important part first | Navigate a CL: does it make sense, then the most important part, then the rest | [Google eng-practices, Navigating a CL](https://google.github.io/eng-practices/review/reviewer/navigate.html) | primary |
| Group by concept; refactors in their own group | "do refactorings in a separate CL from feature changes … much easier for reviewers to understand" | [Google eng-practices, Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html) | primary |
| Grouping by def-use and shared goal | Tangled changesets are harder to understand; over 40% of Microsoft review changesets could be decomposed (ClusterChanges) | [Barnett, Bird, Lahiri, Brunet, ICSE 2015](https://www.microsoft.com/en-us/research/publication/helping-developers-help-themselves-automatic-decomposition-of-code-review-changesets/) | abstract |
| Grouping reduces false findings | Decomposed changes reduced wrongly reported issues in a controlled experiment | [di Biase, Bruntink, van Deursen, Bacchelli, PeerJ CS 2019](https://peerj.com/articles/cs-193/) | abstract |
| Goal and description at the top | Reviewability depends on description, size, and coherent history | [Ram, Sawant, Castelluccio, Bacchelli, ESEC/FSE 2018](https://serg.ewi.tudelft.nl/publications/what-makes-a-code-change-easier-to-review-an-empirical-investigation-on-code-change-reviewability/) | abstract |
| 3–7 groups | **Chunking**: working memory holds a few chunks | Miller, *The Magical Number Seven*, 1956 | recalled |
| Folder of files: README, groups, ledger | **Overview first, zoom and filter, then details on demand** | Shneiderman, *The Eyes Have It*, IEEE VL 1996 | abstract |
| Mermaid diagrams in Markdown | Diagrams render in GitHub Markdown files, PRs, issues, and wikis | [GitHub Docs, Creating diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) | primary |
| Before/after check on base and tip | **Characterization tests** pin current behavior before a change | Feathers, *Working Effectively with Legacy Code*, 2004 | recalled |
| Settled choices never return as decisions; picks are kept in `decisions.md` | An accepted ADR stands until a new decision supersedes it | [Nygard, 2011](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) | primary |
| Understanding comes before judging | Understanding the change is the core need and challenge of review | Bacchelli & Bird, ICSE 2013 | abstract |
| Plans: premortem; reproduce the problem first | Klein, HBR 2007; Agans, *Debugging*, rule 2 | | secondary |

## Judging principles (cited in findings)

| Principle | Source | Status |
|---|---|---|
| Over-engineering | [Google eng-practices, Complexity](https://google.github.io/eng-practices/review/reviewer/looking-for.html) | primary |
| YAGNI and its four costs | [Fowler, *Yagni*, 2015](https://martinfowler.com/bliki/Yagni.html) | primary |
| Essential vs accidental complexity | Brooks 1986; Moseley & Marks 2006 | secondary |
| Chesterton's fence | *The Thing*, 1929 | secondary |
| Stakeholders and concerns | ISO/IEC/IEEE 42010; Rozanski & Woods | secondary |

## Changed in the 2026-10-10 rewrite, and why

Earlier runs produced a 116–200 row ledger, ATAM vocabulary, and A/B questions about choices the tickets had already settled. Users answered "go with your recommendation" without deciding anything, and each re-run surfaced new findings.

- **ATAM terms dropped from the output.** ATAM is an architecture-evaluation workshop. Its vocabulary needed translating before the user could decide.
- **The ledger moved to an appendix.** It proves completeness. It is not the report.
- **Settled items are no longer decisions.** The "recommend A (remove) by default" rule was replaced by "recommend what the goal points to; if it's silent, the simpler option".
- **Stop rule and re-run scope added.** Follow-up questions no longer turn into findings.
- **Bug hunting left to `/code-review`.** Mixing it in made the verdict look unfinished.
- **"Consider the opposite" on every unit replaced** by the before/after check on 🔴/🟠 and breaks-without-it on mechanisms. Doubt now gets settled by a run, not by an argument.

## Changed on 2026-10-11, and why

A review of a 2-commit branch returned ✅ with "over-engineering 0 flagged". A `/code-review` of the same branch that day found three things the review had missed: a new exception class used only for control flow, a helper orphaned by a removed caller, and a lease-key refresh that the review called "inferred". Deleting the refresh left all 56 tests green, so no test guarded it.

- **The mechanism list is built by a script and reconciled to its count**, as the ledger already was. A list assembled by eye skipped a new class.
- **Orphans count as mechanisms.** A change that removes the last caller leaves behind code that no longer has a reason to exist.
- **Breaks-without-it for code comes from a mutation, not from reading.** Reading explains why a mechanism exists; only a run shows whether a test guards it. Principle: **mutation testing** (DeMillo, Lipton & Sayward, *Hints on Test Data Selection*, IEEE Computer 1978), recalled.
- **✅ requires zero open decisions, and the verdict line names what stays inferred.** An unchecked claim no longer hides behind a green verdict.

## Considered and dropped

- **SmartBear/Cisco "review < 200–400 LOC"**: a vendor whitepaper from one team's data, criticized because LOC doesn't measure complexity.
- **Fagan inspection checklists**: the 1976 PDF is a scan, and the checklist claim couldn't be read in the original.
- **ATAM sensitivity and tradeoff points in the report**: see above.

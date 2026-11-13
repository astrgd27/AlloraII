# Culture guides

One guide per land and realm, written in Phase 0 from canon, quoting canon as evidence. Every new name and custom follows its land's guide.

A guide is a **draft** until the owner approves it. Its status is on its first line.

| Land | Guides | Status |
| --- | --- | --- |
| The Seven | [Overview](the-seven.md) · [Eintenn](eintenn.md) · [Luggen](luggen.md) · [Grell](grell.md) · [Sarlon](sarlon.md) · [Dellian](dellian.md) · [Rolla](rolla.md) · [Marre](marre.md) | Approved 2026-11-13 |
| Gallar | [Gallar](gallar.md), a section per realm | Draft, waiting for approval |
| Qoul | [Qoul](qoul.md), a section per realm | Draft, waiting for approval |
| Thoolma | [Thoolma](thoolma.md), a section per realm | Draft, waiting for approval |
| Polygoetia | [Polygoetia](polygoetia.md), a section per island | Draft, waiting for approval |

## How a guide is written

- Canon is quoted word for word in lines starting with `>`, each followed by the id of the canon entry: `> “…” — \`id\``. A test (`packages/content-tools/src/lint/guides.test.ts`) fails if a quote is not in canon under that id.
- Where canon says nothing, the guide says "Canon is silent". Anything under **Proposed** is a suggestion for the owner, not canon.
- Each guide ends with rules for new names in that realm.

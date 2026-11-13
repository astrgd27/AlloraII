# Phase 0 · Foundation

**Goal:** the repository, the engine skeleton and the canon system in place, so every later phase builds on Allora's real world.

**Gate (all must hold before Phase 1):**
- One game-day simulates in under 20 ms.
- All extracted canon passes `pnpm lint:content`.
- The owner has read and approved every culture guide.

## Issues

- [x] **1. Scaffold.** A pnpm workspace (`packages/engine`, `packages/ui`, `packages/content-tools`) with TypeScript, Vite, React, Vitest, ESLint and Prettier. GitHub Actions run tests on every PR. GitHub Pages deploys `main` (a blank page is fine).
  *Done when:* CI is green on a PR, and the Pages URL loads.

- [x] **2. Allora I extractor.** Load `canon/allora-1.html` in headless Chromium (Playwright; do not run `playwright install` if a browser is already present). Find the game's data tables in the page (places and sub-places, people, organisations, faiths, schools and workings, skills, items and recipes, codex and lore text). Write them to `content/canon/allora1/<kind>.yaml`, keeping Allora I's own ids, with `origin: allora1`. Write `content/canon/allora1/REPORT.md` with counts by kind and anything that could not be read.
  *Done when:* `pnpm extract` reproduces the files byte for byte, and the report's counts match the game's own lists.

- [x] **3. Polygoetia importer.** Turn `canon/polygoetia.md` into `content/canon/polygoetia/` entries (islands as places, powers as groups, peoples, Weathers, schools, goods), `origin: polygoetia`, with ids in the same style as Allora I's.
  *Done when:* every island, power and Weather in the document has an entry.

- [x] **4. Schemas.** zod schemas for land, realm, place, person, group, faith, school, item and post. All have `id`, `origin` (`allora1` | `polygoetia` | `allora2`) and `roots` (required when origin is `allora2`).
  *Done when:* all extracted canon validates, or failures are listed in the extractor report with reasons.

- [ ] **5. Canon index and lints.** A name index across all canon. `pnpm lint:content` runs the schema check, reference check, canon lint (no missing roots, no near-duplicate names, no edits to canon outside a `canon-change` PR) and lore lint (banned words, world rules). It also generates `docs/lore/additions.md`.
  *Done when:* a deliberately bad test entry fails each rule.

- [ ] **6. Culture guides.** One draft guide per land and realm in `docs/lore/cultures/`: naming sounds and patterns, titles, food, dress, oaths, faiths, what people value. Every claim quotes canon as evidence. Open one PR per land for the owner to review.
  *Done when:* the owner approves each guide.

- [ ] **7. Engine skeleton.** A Web Worker engine with the clock (1 real minute = 1 game hour), the calendar (28-day seasons, 112-day year), a message protocol for state and orders, and saves in IndexedDB with versioned migrations and a migration test.
  *Done when:* the clock runs in the browser, survives a reload, and a v0 save migrates in tests.

- [ ] **8. Map stub.** A PixiJS map of Eintenn and Marre, drawn from canon places, with roads and travel times.
  *Done when:* every canon place in those two areas shows and can be travelled to.

- [ ] **9. Balance bot harness.** A headless runner that steps the engine for one game-year and posts a (mostly empty) report as a PR comment.
  *Done when:* the report appears on a PR.

- [ ] **10. Gate review.** Measure the game-day budget, run the full lint, and list anything left for the owner.

## Decisions

(Record decisions here as they are made, with the date and the reason.)

- **2026-11-09 · Magic design notes.** The owner supplied the notes as a PDF. It is kept as `canon/magic_design.pdf` (authoritative), with a `pdftotext -layout` extraction in `canon/magic_design.md` so the `/canon` lookup and the tools can search it.
- **2026-11-09 · Issues.** Phase 0 items are GitHub issues #1–#10, labelled `phase-0`, in the same order as this list.
- **2026-11-09 · Scaffold (#1).** Three packages as the phase plan names them: `packages/engine`, `packages/ui`, `packages/content-tools`. The bible's `content` and `render` packages are left for later: content lives in `content/` at the root, and rendering stays inside `ui` until it grows. TypeScript is pinned to 5.9 because typescript-eslint does not yet support TypeScript 7. The site is built with base path `/AlloraII/` for GitHub Pages (override with `BASE_PATH`). `pnpm lint:content`, `pnpm balance` and `pnpm extract` are added by the issues that build them (#2, #5, #9), not as empty stubs.
- **2026-11-09 · Allora I extractor (#2).** The game keeps its data in top-level constants of one script. The extractor (`packages/content-tools/src/extract/`) loads the page in headless Chromium with all network requests blocked, reads 18 tables by name, and writes 18 files. Decisions:
  - **Tables to kinds.** `LOCS` (+ `SUBS`, `HIDDEN_SUBS` nested as `subs`) → places; `REGIONS` → regions; `REALMS` → realms; `PEOPLE` → people (rulers and heads); `NPCS` → npcs (people the player befriends); `FACTIONS` → groups; `DEITIES` → faiths; `MAGIC_SYSTEMS` → schools; `SPELLS` → workings; `SK` and `CATS` → skills and skill categories; `ITEMS` → items and item variants; `RECIPES` → recipes; `CAREERS` → careers; `LORE` → lore; `GUIDE` → guide. Every count matches the game's table (see `content/canon/allora1/REPORT.md`).
  - **Field names.** Only the obvious short names are renamed (`n` → `name`, `i` → `icon`, `d`/`desc` → `description`, `reg` → `region`, and a few per kind, listed in `kinds.ts`). Every other field keeps Allora I's own name, so nothing is lost or reinterpreted. The schemas (#4) decide how each field is read.
  - **Item variants.** 4,484 of the 6,229 items are quality grades of a base item, keyed `<item>#<quality>`. They go to `item_variants.yaml` so `items.yaml` stays readable.
  - **Code is left out.** 97 working effects (`fn`), 11 sky conditions (`sky`) and 63 guide conditions (`when`) are functions, not data. 24 item variants have a value that is not a number in the game itself. All are dropped and counted in the report.
  - **Not yet extracted.** Quests, events, the bestiary, romance and the other tables listed in the report. They are not Phase 0 kinds, and `/canon` reads them from the HTML.
  - **Reproducible.** The output depends only on the HTML (its SHA-256 is in the report). A CI job runs `pnpm extract:check`, which fails if `content/canon/` differs from a fresh run.
- **2026-11-13 · Owner's ruling on canon and new places.** The game must be expansive and huge, so new places may be added even where they shift canon lore slightly. Such shifts are logged in `docs/lore/conflicts.md`, not stopped on. Recorded in `CLAUDE.md` under Canon. The canon lint (#5) must treat a logged slight shift from a new place as allowed.
- **2026-11-13 · Ruling widened.** The owner widened the ruling above from places to new groups and people as well. `CLAUDE.md` and `docs/lore/conflicts.md` updated.
- **2026-11-13 · Polygoetia importer (#3).** `pnpm extract` now also reads the tables of `canon/polygoetia.md` and writes `content/canon/polygoetia/` (78 entries in 8 files, plus `REPORT.md`). Decisions:
  - **Tables only.** One entry per row of the islands, powers, Weathers, goods and doors tables. Prose (the Ring, the Charter, the Warden, the hooks, the dishes) is not turned into entries; the report lists what was left.
  - **Ids** follow Allora I's short prefixed style: `pg_<island>` for places and the two regions, `f_pg_<power>` for groups, `folk_pg_<island>` for peoples, `wx_<weather>`, `mag_pg_<school>`, `goods_pg_<kind>`, `route_pg_<door>`.
  - **Schools are names only.** The twelve island schools get a name and an island. The reference's magic and faith sections are unwritten, so nothing else is invented, and no faith entries exist yet (Mother Smoke is marked `magic_note: a faith`).
  - **Peoples** are one per island, with the reference's own text. Some islands' opening labels name a rule or a nature, not a people ("The volcano"), so the field is `label`, not `name`. The culture guides (#6) can name the peoples properly.
  - **Goods** are one entry per row (Fruit, Spices and scents, …), not one per good. Splitting them into items belongs with the item families.
- **2026-11-13 · Schemas (#4).** zod schemas in `packages/content-tools/src/schemas` for land, realm, place, person, group, faith, school, item and post. Decisions:
  - **Base rules.** Every entry has `id`, `origin` and `kind`. An `allora2` entry must name at least one root and have a kind-prefixed stable id. Canon entries keep their source ids (`ostwick`, `candle_t2#1`).
  - **Loose on purpose.** Each schema requires only what every entry of its kind must have, and keeps unknown fields, because canon carries many fields Allora II has not decided on. Later phases tighten them.
  - **Canon kinds to schemas.** `region` uses the realm schema; `npc` uses person; `item_variant` uses item. Workings, skills, recipes, careers, lore, guide, Weathers, peoples, goods and routes get the base check only, until a phase needs more.
  - **Land and post have no canon entries.** Allora I names a land only as a `world` field on regions, and posts are new to Allora II. Both schemas are tested with hand-made entries. A post's ladder is exactly four ranks.
  - **Result.** All 9,485 canon entries validate. Each extraction report ends with a "Schema check" section, so a future failure is listed there with its entry, field and reason.

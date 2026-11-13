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

- [x] **5. Canon index and lints.** A name index across all canon. `pnpm lint:content` runs the schema check, reference check, canon lint (no missing roots, no near-duplicate names, no edits to canon outside a `canon-change` PR) and lore lint (banned words, world rules). It also generates `docs/lore/additions.md`.
  *Done when:* a deliberately bad test entry fails each rule.

- [ ] **6. Culture guides.** One draft guide per land and realm in `docs/lore/cultures/`: naming sounds and patterns, titles, food, dress, oaths, faiths, what people value. Every claim quotes canon as evidence. Open one PR per land for the owner to review.
  *Done when:* the owner approves each guide.

- [x] **7. Engine skeleton.** A Web Worker engine with the clock (1 real minute = 1 game hour), the calendar (28-day seasons, 112-day year), a message protocol for state and orders, and saves in IndexedDB with versioned migrations and a migration test.
  *Done when:* the clock runs in the browser, survives a reload, and a v0 save migrates in tests.

- [x] **8. Map stub.** A PixiJS map of Eintenn and Marre, drawn from canon places, with roads and travel times.
  *Done when:* every canon place in those two areas shows and can be travelled to.

- [x] **9. Balance bot harness.** A headless runner that steps the engine for one game-year and posts a (mostly empty) report as a PR comment.
  *Done when:* the report appears on a PR.

- [x] **10. Gate review.** Measure the game-day budget, run the full lint, and list anything left for the owner.

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
- **2026-11-13 · Canon index and lints (#5).** `pnpm lint:content` (in `packages/content-tools/src/lint`) runs four checks and writes `docs/lore/additions.md`. `--check` also fails if that ledger is stale. A CI job runs it on every PR. Decisions:
  - **Name index.** `pnpm extract` writes `content/canon/index/names.yaml`: 2,121 proper names (places and sub-places, realms, people, groups, faiths, schools, careers, Weathers) with the entries that bear them. Item, recipe and skill names are left out: they are common words.
  - **Where additions live.** Anything under `content/` outside `content/canon/` is an addition. A file is a list of entries (or one entry).
  - **Roots.** Every root must exist, and following roots must reach a canon entry. So a tavern may root on a new village, as long as the village roots on canon.
  - **Near-duplicate names.** A new proper name fails if, with case, accents, spaces and a leading "the" removed, it equals a canon name or sits within one letter of it (two letters for names of ten or more). Names under five letters only fail on an exact match.
  - **Edits to canon.** A change under `canon/` fails unless the PR is labelled `canon-change`. `content/canon/` is guarded more strictly by `pnpm extract:check`: it must equal a fresh extraction, label or no label. A hand change to extracted canon therefore has to go through the extractor.
  - **Lore lint reads additions only.** Canon text is what it is. Banned words live in `banned-words.ts` (real-world terms, interface jargon, modern terms, placeholders); add to it whenever review finds one. The world-rule checks (witch magic, the three mysteries, augury hints, romance and minors) are patterns that catch the plain cases; `/lore-check` and review catch the subtle ones. A sentence over 45 words is a warning, not an error.
  - **The owner's ruling and the lint.** The lint does not judge whether an addition shifts canon lore, so the ruling of 2026-11-13 needs no exception in it. Shifts are logged by hand in `docs/lore/conflicts.md`. The name rules still apply to every addition.
- **2026-11-13 · Order of work.** Issue 6 (culture guides) is skipped for now and taken after the code issues. It needs one PR per land held open for the owner's review, and this session has one branch, so it would block everything behind it.
- **2026-11-13 · Engine skeleton (#7).** `packages/engine` now holds the calendar, the clock, a typed event bus, seeded random streams, saves with migrations, the message protocol, a host and the Web Worker entry. The UI shows the date and hour. Decisions:
  - **Calendar.** Hours are counted whole, from the start of play. Play begins at dawn (the 6th hour) on day 1 of Spring, 1347 AR: canon gives the seasons (`SEASONS` in Allora I) and the present year (`lore_reckoning`). Day parts: dawn 5–8, day 8–18, dusk 18–21, night otherwise. These hours are my choice; canon does not fix them.
  - **Clock.** `MS_PER_GAME_HOUR = 60_000` is the single clock rate. `?rate=<ms>` in the URL overrides it for tests and debugging.
  - **Offline time (the bible's open question, due in Phase 0).** Time away is simulated at full speed, capped at 7 game days for each real day away, counting a started day as a whole one. So an hour away is caught up in full; a day away gives 7 game days, not 60. The snapshot reports hours caught up and hours skipped, ready for the "summary" the bible wants. This is the bible's leaning as I read it; the owner should confirm.
  - **Layers.** `Engine` is pure (no worker, no storage, no real clock), so tests and the balance bot run it directly. `EngineHost` adds saves and messages. `worker.ts` only wires the host to the worker, a 250 ms timer and IndexedDB.
  - **Saves.** `SAVE_VERSION = 1`. A save with no version is version 0 (seed, hours, savedAt), and a migration lifts it to 1; the test loads a v0 save and plays on. The last 3 saves are kept. Autosave runs at the start of each game day, on pause, and when the page is hidden or left.
  - **Protocol.** UI → engine: `init`, then orders (`pause`, `resume`, `save`, `reset`). Engine → UI: `state` (a snapshot), `saved`, `error`.
  - **Checked in a browser.** With `?rate=200` the clock ran from hour 0 to 9, and after a reload carried on from 10. There is no automated browser test yet; the reload path is covered in unit tests with a memory store.
- **2026-11-13 · Map stub (#8).** A PixiJS map of Eintenn (19 places) and Marre (11), with roads, travel times and travel. Decisions:
  - **Roads are new.** Allora I has no roads inside a realm: you go straight between any two places. Allora II joins places by roads, so `pnpm world --roads` laid a first network over canon places: a spanning tree (every place can be reached) plus each place's two nearest neighbours (more than one way). The 42 roads are the first additions in `content/world/roads/`, each `origin: allora2` and rooted on the two places it joins. They are unnamed stubs for the owner to redraw and name; nothing canon says was changed, so nothing is logged in `conflicts.md`.
  - **Hours come from Allora I's own travel formula** (`travelTime` in the game): distance × 0.38 inside a realm; 20 + world distance × 1.3 between realms. That gives 3–12 hours between neighbours, about two days across Eintenn, and 110 hours (4.6 days) for the one sea lane, Kesselhaven Harbor to Marre: the two realms' canon gates. All inside the bible's travel bands. Two city places within 20 map units are quarters of one city, one hour apart.
  - **Ways.** `street` (inside a city), `road`, `track` (to or through a wild place), `sea`. Water crossings inside Marre's lagoon are not modelled yet; they show as roads.
  - **Engine.** `packages/engine/src/world.ts` holds the graph and the quickest route (Dijkstra); `travel.ts` walks a route an hour at a time, arrives, and can turn back. Orders: `travel`, `turnBack`. The life starts in Ostwick, as in Allora I. The save is now version 2 (place and journey), with a migration from 1 and a test.
  - **World data.** `pnpm world` builds `packages/engine/src/generated/world.json` from canon places and the roads; CI runs `pnpm world --check`.
  - **Map.** Regions sit side by side on a wide screen and stack on a phone. Settled places are dots, wild places rings, sea lanes blue. Tap a place to see the hours and set out. A plain list of the same places sits under the map for keyboards and screen readers. The UI holds no rules: hours and routes come from the engine.
  - **Checked in a browser.** All 30 places can be chosen and offer "Set out"; a journey to Burg Tennfels ran and arrived; a tap on the canvas chose the right place; no sideways scroll at phone width; no console errors.
- **2026-11-13 · Balance bot harness (#9).** `pnpm balance` (in `packages/content-tools/src/balance`) plays 20 lives for one game year each with the real engine, headless, and prints a report. The `Balance report` workflow runs it on every PR and posts the report as one comment, updated in place on later pushes. Decisions:
  - **One persona, the wanderer.** Travel is the only thing a life can do yet, so the bot walks to random places. That already gives real numbers: journeys, time on the road, most and least visited places, and places nobody visited (dead content). The bible's six personas come with their systems.
  - **Empty sections stay in the report** (hours to level, earnings, money supply, check odds, Legend pace), each marked as not built, so the report's shape is set from the start.
  - **The performance budget is measured here.** The report gives real milliseconds per game day against the 20 ms budget, and `pnpm balance` fails if it is over. Today: about 0.01 ms.
  - **Repeatable.** The bot draws from its own random stream, so the same seeds give the same lives. Only the timings differ between runs.
- **2026-11-13 · Gate review (#10).** Written up in `docs/phase-0-gate.md`. Two of the three gate lines hold: a game day simulates in about 0.005 ms (budget 20 ms), and all extracted canon passes `pnpm lint:content`. The third does not: the culture guides (#6) are not written or approved. **The gate is not passed, and Phase 1 does not start until it is.** The same document lists every decision left for the owner.
- **Next for a fresh session:** issue #6, the culture guides. Ask the owner first whether to go one land at a time (recommended, starting with the Seven) or all five in one pull request.
- **2026-11-13 · Culture guides, the Seven (#6, first of five lands).** Drafts for the Seven are in `docs/lore/cultures/`: an overview and one guide per realm (Eintenn, Luggen, Grell, Sarlon, Dellian, Rolla, Marre). They wait for the owner's approval, so issue 6 stays unticked. Decisions:
  - **One land at a time.** The owner did not answer how to split the work, so I took the recommended route: the Seven first, since Phase 1 is set there. Gallar, Qoul, Thoolma and Polygoetia follow, each after the one before is approved, so later guides can follow the owner's corrections.
  - **Quotes are checked.** Every canon quote is a line of the form `> “…” — \`id\``, and `guides.test.ts` fails if the words are not in canon under that id.
  - **Canon is thin on dress and oaths.** Each guide says "Canon is silent" where it is, and puts suggestions under **Proposed** for the owner to accept, change or strike. Nothing proposed is treated as canon until approved.
  - **Naming rules** in each guide are inferred from the canon names listed there. The glosses of place-name roots (for example *Trauer-fels*, mourning rock) are mine.
- **2026-11-13 · The Seven's guides approved.** The owner approved the culture guides for the Seven (PR #20).
- **2026-11-13 · Owner's direction.** The world should be at least ten times the size of Allora I and feel like a place you live in, not just an idle game; and sessions should keep token use low. Recorded in `CLAUDE.md`.
- **2026-11-13 · Culture guides for Gallar, Qoul, Thoolma and Polygoetia (#6).** Drafted together in one pull request to save review round trips, one file per land with a section per realm or island. To save effort they are leaner than the Seven's: canon names, ranks, faiths, food and garments are copied from canon by script, and only the naming patterns and rules are written by hand. They do not propose dress or oaths where canon is silent; that waits until a phase builds in each land. Polygoetia has no personal names in canon at all.

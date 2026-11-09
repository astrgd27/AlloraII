# Phase 0 · Foundation

**Goal:** the repository, the engine skeleton and the canon system in place, so every later phase builds on Allora's real world.

**Gate (all must hold before Phase 1):**
- One game-day simulates in under 20 ms.
- All extracted canon passes `pnpm lint:content`.
- The owner has read and approved every culture guide.

## Issues

- [ ] **1. Scaffold.** A pnpm workspace (`packages/engine`, `packages/ui`, `packages/content-tools`) with TypeScript, Vite, React, Vitest, ESLint and Prettier. GitHub Actions run tests on every PR. GitHub Pages deploys `main` (a blank page is fine).
  *Done when:* CI is green on a PR, and the Pages URL loads.

- [ ] **2. Allora I extractor.** Load `canon/allora-1.html` in headless Chromium (Playwright; do not run `playwright install` if a browser is already present). Find the game's data tables in the page (places and sub-places, people, organisations, faiths, schools and workings, skills, items and recipes, codex and lore text). Write them to `content/canon/allora1/<kind>.yaml`, keeping Allora I's own ids, with `origin: allora1`. Write `content/canon/allora1/REPORT.md` with counts by kind and anything that could not be read.
  *Done when:* `pnpm extract` reproduces the files byte for byte, and the report's counts match the game's own lists.

- [ ] **3. Polygoetia importer.** Turn `canon/polygoetia.md` into `content/canon/polygoetia/` entries (islands as places, powers as groups, peoples, Weathers, schools, goods), `origin: polygoetia`, with ids in the same style as Allora I's.
  *Done when:* every island, power and Weather in the document has an entry.

- [ ] **4. Schemas.** zod schemas for land, realm, place, person, group, faith, school, item and post. All have `id`, `origin` (`allora1` | `polygoetia` | `allora2`) and `roots` (required when origin is `allora2`).
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

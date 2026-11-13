# Phase 0 · Gate review

Reviewed 2026-11-13. Phase 1 may start when all three gate lines hold.

## The gate

| Gate line | Holds? | Evidence |
| --- | --- | --- |
| One game-day simulates in under 20 ms | **Yes** | `pnpm balance --lives 200 --years 10`: 0.0048 ms per game day (224,000 game days in 1.07 s). On CI, with 20 lives for one year: 0.0125 ms. The balance workflow re-measures it on every pull request and fails if it goes over |
| All extracted canon passes `pnpm lint:content` | **Yes** | 9,485 canon entries and 42 additions: 0 errors, 0 warnings. `pnpm extract:check` confirms `content/canon/` equals a fresh extraction |
| The owner has read and approved every culture guide | **No** | Issue #6 is not started. No guide exists yet |

**The gate is not passed.** Two lines hold; the third waits on the culture guides and the owner.

A note on the first line: the engine does almost nothing per hour yet (the clock and travel), so 0.005 ms says the skeleton is sound, not that the finished game will fit. The budget matters from Phase 1, when needs, schedules and activities arrive. The measurement is in place for that.

## Issues

| # | Issue | State | Done-check |
| --- | --- | --- | --- |
| 1 | Scaffold | Merged (#11) | CI green on a PR: yes. The Pages URL loads: the deploy workflow succeeded; the owner should open the URL once |
| 2 | Allora I extractor | Merged (#12) | `pnpm extract` reproduces the files byte for byte (checked on CI); every count matches the game's tables |
| 3 | Polygoetia importer | Merged (#13) | 16 islands, 14 powers, 8 Weathers: all have entries |
| 4 | Schemas | Merged (#14) | All extracted canon validates |
| 5 | Canon index and lints | Merged (#15) | A deliberately bad test entry fails each rule |
| 6 | Culture guides | **Not started** | Needs the owner's approval of each guide |
| 7 | Engine skeleton | Merged (#16) | The clock runs in the browser and survives a reload; a v0 save migrates in tests |
| 8 | Map stub | Merged (#17) | All 30 canon places of Eintenn and Marre show and can be travelled to |
| 9 | Balance bot harness | Merged (#18) | The report appeared on the PR |
| 10 | Gate review | This document | |

## The full check, as run for this review

| Check | Result |
| --- | --- |
| `pnpm lint` | Clean |
| `pnpm format:check` | Clean |
| `pnpm typecheck` | Clean |
| `pnpm test` | 102 tests in 10 files, all passing |
| `pnpm extract:check` | `content/canon/allora1` (18 files), `polygoetia` (9) and `index` (1) match a fresh extraction |
| `pnpm lint:content --check` | 0 errors, 0 warnings; the additions ledger is current |
| `pnpm world --check` | The engine's world data is current |
| `pnpm balance` | Within budget |
| `pnpm build` | Builds. The whole site is 0.8 MB on disk (budget: first load under 3 MB) |

## Left for the owner

**Needed to pass the gate**

1. **Culture guides (#6).** One guide per land and realm, each needing your approval. See "How to do the culture guides" below: the plan needs a decision from you first.

**Decisions I made that you should confirm or change**

2. **Offline time** (the bible's open question, due in Phase 0). Time away is caught up at full speed, capped at 7 game days for each real day away. An hour away is caught up in full; a day away gives 7 game days, not 60. The other reading of the bible's leaning is a flat rate, where an hour away gives only 7 game hours.
3. **Package layout.** Three packages (`engine`, `ui`, `content-tools`), as the phase plan says, not the bible's five. Content is YAML in `content/`; rendering lives in `ui`.
4. **Extracted canon cannot be hand-edited,** even in a `canon-change` pull request: it must always equal a fresh extraction. Only `canon/` itself is opened by the label. This is stricter than CLAUDE.md's wording.
5. **The roads are a generated stub.** 42 unnamed roads join the places of Eintenn and Marre, with hours from Allora I's own travel formula. They are yours to redraw and name. Water crossings inside Marre's lagoon are ordinary roads for now.
6. **The start:** dawn on day 1 of Spring, 1347 AR, in Ostwick. The year, the seasons and Ostwick are canon; dawn and day 1 are my choice, as are the hours of dawn, day, dusk and night.
7. **How near is "nearly the same name"** in the canon lint: equal after removing case, accents and a leading "the", or within one letter (two for names of ten letters or more).
8. **The banned-word list** is a first draft of about 150 terms. Add anything you never want on screen.

**Not done, and why**

9. **Automatic Claude review of pull requests does not run.** The workflow is in place but skips: the repository has no `CLAUDE_CODE_OAUTH_TOKEN` or `ANTHROPIC_API_KEY` secret. Until it is added, pull requests are checked by CI only.
10. **No automated browser tests.** The clock, the reload and the map were checked by hand in headless Chromium. A Playwright suite belongs with the first real screens.
11. **Not extracted from Allora I:** quests, events, the bestiary, romance and the other tables listed in `content/canon/allora1/REPORT.md`. Code-valued fields (97 working effects, 11 sky conditions, 63 guide conditions) are left out and counted there.
12. **Polygoetia's schools and faiths** are names only. The reference's magic, faith and open-questions sections are unwritten.
13. **The magic design notes** are in `canon/` as a PDF and a text copy, but nothing reads them yet. No Phase 0 issue asked for it.
14. **No PWA yet** (service worker, manifest), no save export or import, and no `content` or `render` package. None is a Phase 0 item.
15. **Lands have no entries.** Allora I names a land only as a field on its regions. The land schema exists and is tested, but the five lands are not yet written as entries.

## How to do the culture guides

The phase plan asks for one pull request per land, each held open until you approve it. This session works on a single branch, so only one pull request can be open at a time.

Two ways forward:

- **One land at a time.** I write the Seven's guides (seven realms), open the pull request, and wait for your approval before starting Gallar. Slow, but each guide gets your full attention, and later guides can follow your corrections to earlier ones.
- **All five lands in one pull request,** one file per realm, for you to review together. Faster, but a large read, and it departs from "one PR per land".

I recommend one land at a time, starting with the Seven, since Phase 1 is set in Eintenn and Marre and needs only that guide.

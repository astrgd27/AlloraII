# Phase 1 · Gate review

Reviewed 2026-11-16. Phase 2 may start when all four gate lines hold.

## The gate

| Gate line | Holds? | Evidence |
| --- | --- | --- |
| A new player can live a game week in Ostwick without reading the codex | **No** | What a test can show holds: a life left to itself in Ostwick for seven days eats 21 bought meals, never eats scraps, never drops below 20 vigour and ends a little richer (`packages/engine/src/gate.test.ts`). Whether the page explains itself to a person is a question only play can answer. See "What to try" below. |
| Each of the three trades has duties, at least four cases and a ladder of four ranks, and the balance bot finishes a career in each | **Yes** | Smith: 3 duties, 6 commissions, 3 trials. Butler: 4 duties, 6 incidents, 3 trials. Inquirer: 4 duties, 8 cases, 3 trials. Each has four ranks with pay. In the balance run all five lives of each persona reach the top rank: smith about game day 539, butler 536, inquirer 480. Held by tests in `gate.test.ts` and `balance.test.ts`. |
| Every place in the two realms has at least one resident with a routine and one reason to return | **Yes** | 160 places (Eintenn 80, Marre 80). Each has a resident who keeps hours and at least one thing to do that needs no post. 20 canon places had no resident and 29 had nothing to do; #37 filled them. Held by a test. |
| One game day simulates in under 20 ms; `pnpm lint:content` is clean | **Yes** | 0.045 ms per game day with 160 places. 9,485 canon entries and 945 additions: 0 errors, 0 warnings. |

**Three lines hold. The first does not (owner, 2026-11-17).** The owner played the build and found it confusing: clicks that seemed to do nothing, and no clear sign of what the life was doing. The interface is to be rebuilt for tablets and computers, to look like a heavy simulation game (see CLAUDE.md). That rebuild is the first work of Phase 2, and this line is judged again after it.

Two causes are known. A refused order (asleep, busy, the market shut) reports its reason in one line at the foot of the page, far from the button. And the work in hand is one unframed line among many.

## What to try (about half an hour)

1. Open the game. Without reading anything else, see whether you can tell where you are, what hour it is, and how the life is doing.
2. Do a morning's work in Ostwick and watch the purse.
3. Meet whoever is on the green, then come back at night and see who is where.
4. Buy bread at the stalls and walk to Burg Tennfels. Note what happens on the road.
5. Close the page for a few minutes, come back, and read the report.

If any of those needs explaining, that is the gap. Say which, and it becomes the first issue of Phase 2.

## Issues

| # | Issue | PR | Done-check |
| --- | --- | --- | --- |
| 1 | World plan | #38 | The plan lists every land's target and what is built |
| 2 | Needs | #39 | A life sleeps and eats by standing orders |
| 3 | Activities | #40 | Each is begun and finished at its place and hour |
| 4 | People with routines | #41 | Canon schedules place people by the hour |
| 5 | Skills | #42 | The curve and gates hold in tests |
| 6 | The challenge system | #43 | Odds and degrees hold in tests |
| 7 | Eintenn, first batch | #44 | 20 places, linted and rooted |
| 8 | Named roads | #45 | No road in Eintenn is nameless |
| 9 | The Smith | #46 | The bot climbs all four ranks |
| 10 | The Butler | #47 | The bot climbs all four ranks |
| 11 | Money and markets | #48 | A life earns, buys and sells; the report tracks ten years |
| 12 | Scenes | #49 | The scene changes with hour, season and who is there |
| 13 | Standing orders and the report | #50 | A life works while away and reports on return |
| 14 | Marre slice and the Inquirer | #51 | 20 places; the bot climbs all four ranks |
| 15 | Remaining batches | #52 | 160 places in the slice |
| 16 | Balance personas and gate review | this PR | This document |

## What the balance report says

| Persona | What it shows |
| --- | --- |
| Wanderer | Reaches 156 of 160 places in 20 one-year lives. Lives on scraps: it never works and is rarely in a place at a meal hour. Mean vigour about 30. |
| Villager, idler | Ostwick's work feeds a life: about 4 to 5 pf a day taken in, 1.5 spent. |
| Smith, butler, inquirer | Each finishes its career in under five game years. Each takes in 38 to 54 pf a day at the top and spends 1.5. **Flagged:** the purse grows about 18% a year in year ten. |
| Pedlar | Nets about 2 pf a day carrying goods between markets. No trade route runs away. |

## Known gaps carried into Phase 2

- **Money has one sink.** Food is all a life pays for. Rent, tools, dues, fares and patronage are designed in the bible and not built. Until they are, every earning life is flagged for inflation. This is the largest balance debt.
- **The three careers climb at nearly the same pace** (about 480 to 540 game days). They share thresholds. They should differ.
- **The trades use the skeleton only.** Not built: the smith's materials and finished items, the butler's Trust and Harmony, the inquirer's case board, theories and time pressure, techniques for any of them.
- **The map is crowded** at 160 places. It needs zoom before more are added to a realm.
- **Scenes are plain shapes.** The art kits are not started; the art pipeline question in the bible is still open.
- **Marre's ways have no names**, and its waters have no events of their own.
- **One resident a place.** Nobody moves between places except the canon knight-errant, who is not yet simulated.
- **The Claude review workflow** still waits on a repository secret.

## Owner decisions still open

- Offline time: currently 7 game days are caught up for each real day away.
- Whether a life works unasked only while away (the default now) or always.
- The fourth rank of the Cerdans: canon's "Capo's Deputy" (used) or the bible's "Capo's Hand" (`docs/lore/conflicts.md`).
- Four ranks or five for the butler.

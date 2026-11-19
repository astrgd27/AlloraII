# Phase 2 · Gate review

Reviewed 2026-11-19. Phase 3 may start when all five gate lines hold.

## The gate

| Gate line | Holds? | Evidence |
| --- | --- | --- |
| The owner can play a game week in Ostwick on a tablet or computer without confusion | **For the owner** | Only play can answer this. What tests can show does hold. The e2e click test (`pnpm e2e`, the `play` job in CI) clicks about 75 buttons over three games at 1280 × 800. Every click is answered by a change on screen or a refusal shown where the player clicked, and every disabled button says why. The now bar always shows what the life is doing and its progress. See "What to try" below. |
| Every system below has a first working version, with tests | **Yes** | Issues 1–16 are done (table below), each with its own tests: 715 in all. These cover homes, tools, dues and fares, the three trades' own features, weather and feasts, bonds, Ilvara, Hermetic Evocation, several lives with Legend and the Tapestry, and the codex. |
| No earning persona is flagged for inflation: the money a life holds grows by under 3% a year by year ten | **No: one of four** | Year-ten purse growth: smith −3.7%, butler +1.5%, pedlar −1.4%, **inquirer +5.2%**. See "The money line" below. It needs an owner ruling. |
| The three trades climb at visibly different paces and by different means | **Yes** | **Smith:** top rank on day 501. The smith buys iron for each commission, and the guild teaches techniques by rank (the pattern-weld from Master). **Butler:** top rank on day 334, through the house's Trust and Harmony. **Inquirer:** top rank on day 480, through a case board where clues are lost to time and a wrong accusation costs standing. Each trade has its own seasonal costs: guild dues for the smith, informers' fees for the inquirer, none for the butler, who lives in. |
| One game day still simulates in under 20 ms; `pnpm lint:content` is clean | **Yes** | 0.06–0.12 ms a game day in CI, with every life ticking. 9,485 canon entries and 994 additions: 0 errors, 0 warnings. |

## The money line

Every earning life now has sinks: rent, meals, fares, tolls, tools that wear out, materials, dues, and a way of living that costs a share of the purse each day. Because that last sink is a share, a purse settles at a fixed number of days of income. Here is year ten:

| Persona | Income a day | Purse, year ten | Days of income held | Growth, year ten |
| --- | ---: | ---: | ---: | ---: |
| Smith | 53.6 pf | 2,968 pf | 55 | −3.7% |
| Butler | 53.2 pf | 4,419 pf | 83 | +1.5% |
| Inquirer | 53.5 pf | 4,830 pf | 90 | +5.2% |

The inquirer's purse still grows because its income still grows: its skill keeps climbing after the top rank, and better work pays more. Raising the inquirer's seasonal fees from 60 to 90 pf barely moved the line (+5.3%). A fixed cost cannot hold down a purse that tracks income.

**The ruling needed (asked 2026-11-18):** should the line judge the purse against income (days of income held, steady at 55–90) rather than its absolute growth? If so, all four earning personas pass. If the line stays as written, the cure is a sink that scales with skill, which Phase 3 can add.

## Legend pace

Bots that follow only their trade reach the second life's 50 Legend on days 37–65. At the usual pace that is about 15–26 hours of real play. The bible asks for 10–15. A player who also keeps a faith, makes a friend or studies the art earns Legend from those too, and the bots do none of it. The bible's prices stand until the owner has played.

## What to try (about half an hour)

1. Open the game on a computer or tablet in landscape. Without reading anything, see whether you can tell where you are, what hour it is, what the life is doing, and how it is faring.
2. Do a morning's work in Ostwick. Watch the now bar, the purse and the needs.
3. Click something that cannot be done (work at night, a market that is shut). The reason should show where you clicked.
4. Open the Lodging tab and take the room or a cottage. Buy bread at the market.
5. Walk to Burg Tennfels. Watch the route on the map and the road's events. Try the faster speeds (1, 2, 3).
6. Join Ilvara at the hearth-shrine once Devotion reaches 5, and give a gift to someone you have met.
7. Open the Codex (C) and look up what you have seen.
8. Close the page for a few minutes, come back, and read the report.

If any of these needs explaining, that is the gap. Say which, and it becomes the first issue of Phase 3.

## Issues

| # | Issue | PR | Done-check |
| --- | --- | --- | --- |
| 1 | The game shell | #73 | Full-screen map, top bar, framed panels, the now bar |
| 2 | Every click answers | #74 | The e2e click test passes |
| 3 | The place panel | #74 | Work, People, Market, Lodging, Shrine, Collegium and Calling tabs |
| 4 | The character sheet | #75 | Life, calling, faith, art, skills, standing orders |
| 5 | The map | #76 | Pan, zoom, terrain, the route shown |
| 6 | Time controls | #76 | Pause and three paces, by button and key |
| 7 | Homes and lodging | #77 | Room, cottage, inn; rent and eviction |
| 8 | Items and tools | #78 | Tools that help and wear out |
| 9 | Dues, fares and tolls | #79 | Every earning life has sinks |
| 10 | The trades diverge | #80 | Materials and techniques; Trust and Harmony; the case board |
| 11 | Weather, seasons and the calendar | #81 | Weather by realm and season; feast days |
| 12 | Bonds | #82 | Four tiers, gifts by taste, what a friend opens |
| 13 | Faith: Ilvara | #83 | Join, devotion, ranks, boons, duties, lapse |
| 14 | Magic: Hermetic Evocation | #84 | Matriculate, copy, cast, misfire, disputation |
| 15 | Several lives and the Tapestry | #85 | Legend, the Tapestry, new lives, switching |
| 16 | The codex | #86 | Generated entries for what any life has learned |
| 17 | Balance and the gate review | this | This page |

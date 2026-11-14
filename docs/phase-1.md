# Phase 1 · A place you live in

**Status: approved by the owner, 2026-11-13.** The Phase 0 gate passed on 2026-11-13. Issues are #22–#37, in the order below.

**Goal:** Eintenn and Marre made deep enough to live in. One life can wake, eat, work a trade, know its neighbours, travel and come home, and three trades are each worth playing: a smith, a butler and a Cerdan inquirer.

**Scale target (owner, 2026-11-13):** about 2,200 places in the full game. Phase 1 builds the first ~150: Eintenn (~80) and Marre (~70), grown from the 30 canon places there.

**Gate (all must hold before Phase 2):**
- A new player can live a game week in Ostwick without reading the codex.
- Each of the three trades has duties, at least four cases and a ladder of four ranks, and the balance bot finishes a career in each.
- Every place in the two realms has at least one resident with a routine and one reason to return.
- One game day still simulates in under 20 ms; `pnpm lint:content` is clean.

## Issues (proposed order)

1. **World plan.** *(done)* Places per realm for all five lands (total 2,200), and the place kinds (city quarter, town, village, site, wild) with their sizes.
2. **Needs.** Vigour, health and spirits; sleep and meals; a home to sleep in.
3. **Activities.** Short acts tied to a place, an hour, tools and people. The first twenty in Ostwick.
4. **People with routines.** Canon schedules (108 people in Allora I have one) drive who is where at each hour; meeting, talking, being known.
5. **Skills and learning.** The smaller skill set, growth from work near the edge of ability, mastery gates.
6. **The challenge system.** The roll, approaches, degrees of result, lasting consequences.
7. **Eintenn, first batch.** About 20 new small places around Ostwick and Burg Tennfels, with residents, each rooted on canon.
8. **Named roads.** Replace the stub roads in Eintenn with named roads, tracks and a river, and events on the way.
9. **Profession skeleton and the Smith.** Guild-smith of the Anvil: duties, commissions, ladder.
10. **The Butler.** Steward of Burg Tennfels.
11. **Money and markets.** One currency, shops with hours, prices that move.
12. **Scenes.** A place view that changes with the hour, season and who is there.
13. **Standing orders and the report.** What a life does while you are away, and what you read when you return.
14. **Marre slice.** The Piazza of the Doges and the Lazaretto, about 20 new small places, and the Inquirer of the Cerdans.
15. **Eintenn and Marre, remaining batches.** To ~150 places.
16. **Balance personas** for the three trades, and the gate review.

## New mechanics and lore to add (gaps the wider game needs)

Each is an addition, to be rooted on canon when it is built.

- **Homes and neighbours:** a rented room, a hearth, people next door who notice you.
- **Weather and season on the road** in the Seven (Polygoetia has Weathers in canon; the mainland has none).
- **Village life:** market days, feast days from the canon faiths, a parish or shrine round.
- **Lesser folk and groups:** village guilds, confraternities, carters, ferrymen: the people between canon's rulers.

## Decisions

(Record decisions here as they are made, with the date and the reason.)

- **2026-11-14 · World plan (#22).** `pnpm world:plan` writes `content/plan/world-plan.yaml` (a target for each of the 30 canon regions and 16 islands) and `docs/world-plan.md` (places built against target). CI checks both are current. Decisions:
  - **Even split inside a land.** Each realm of the Seven gets 80 places; Gallar and Qoul 60 each; Thoolma 60; each island 16 or 17. Canon is uneven (Eintenn has 19 places, Luggen 8), and an even split stops the first-built realm from staying the biggest. The owner can change any target in `plan.ts`.
  - **Kinds per realm** follow the bible's mix: 5% city quarters, 15% towns, 35% villages, 35% sites, 10% wilds.
  - **Phase 1 aims lower than the final target:** about 150 places across Eintenn and Marre, of their final 160.
  - **Counting.** A place counts towards its `region`. A canon island counts as one place; a new place on an island names it in `island`.

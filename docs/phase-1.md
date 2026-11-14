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
2. **Needs.** *(done)* Vigour, health and spirits; sleep and meals; a home to sleep in.
3. **Activities.** *(done)* Short acts tied to a place, an hour, tools and people. The first twenty in Ostwick.
4. **People with routines.** *(done)* Canon schedules (108 people in Allora I have one) drive who is where at each hour; meeting, talking, being known.
5. **Skills and learning.** *(done)* The smaller skill set, growth from work near the edge of ability, mastery gates.
6. **The challenge system.** *(done)* The roll, approaches, degrees of result, lasting consequences.
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
- **2026-11-14 · Needs (#23).** `packages/engine/src/needs.ts`: vigour, health and spirits (0 to 100), a home, and standing orders for sleep. Decisions:
  - **Sleep and meals run themselves.** By default a life sleeps from the 22nd hour to the 6th and eats at the 7th, 13th and 19th. Meals are free until money exists (#32); then they will cost or come from the larder.
  - **New mechanic, camping.** On a road at night a life makes camp and gets no further until morning, so a long road now takes its hours plus its nights. This fills a gap: travel had no rhythm of day and night. At sea the life sleeps aboard and the ship sails on. The standing order `campAtNight` can be turned off; walking through the night is faster and costs vigour.
  - **A bed matters.** Sleep at home restores vigour faster than sleep elsewhere and lifts the spirits. This is the first reason to have a home and to come back to it.
  - **Running out.** With no vigour left a life sleeps where it stands and loses health. Nothing kills: the bible's leaning is injuries that heal, not death.
  - **The rates are first values** (`RATES` in `needs.ts`), to be tuned by the balance bot. The report now has a Needs section: the mean of each need and the lowest any life fell.
  - **Save version 3,** with a migration from 2 and a test. An old save's home is wherever the life stands.
- **2026-11-14 · Activities (#24).** Twenty activities in Ostwick (`content/activities/ostwick.yaml`), each an addition rooted on Ostwick and set in one of its canon sub-places. Decisions:
  - **What an activity is:** a name, one line of text, a place and sub-place, the hours of the day it can be begun, how long it takes, the seasons it belongs to (if any), a canon skill, and what it does to the needs when finished.
  - **Rules** (`packages/engine/src/activities.ts`): one thing at a time; not on the road; not asleep; only at its place, hour and season. Sleep sets the work down and morning takes it up. Travel is refused while busy; `stop` sets the work down.
  - **Skills are named but not yet trained.** Each activity names the canon skill it will train; growth comes with #26.
  - **No pay, tools or people yet.** Those arrive with money (#32), items and people (#25).
  - **The first twenty are everyday village work,** from canon's own words for Ostwick: the strip-fields, the pasture and its bees, the bread-oven and loom, the Barley Sheaf's kegel-alley, the green, the hearth-shrine and the well.
  - **Save version 4,** with a migration and a test.
- **2026-11-14 · People with routines (#25).** `packages/engine/src/people.ts`. Decisions:
  - **Schedules are read exactly as Allora I reads them** (`npcSched` in the game): the first line of a person's day that fits the hour and season, hours that may wrap past midnight, and the first line as the fallback.
  - **Who is covered.** The seven canon people of Eintenn and Marre who keep a schedule: Hanne Brook, Jory Pell, Mechthild Ambrosius, Zanetta Bon, Bastian Caro, Momolo Scarpa and Cateruccia Vio. Sir Odo of Hartsmoor walks a route across several realms; wanderers come with named roads (#29). Canon's rulers (the Duke, the Doge) have no schedule in Allora I and are not yet placed.
  - **Seven people is far too few for a place you live in.** Canon gives Ostwick one resident. The place batches (#28, #35, #36) add neighbours with routines to every place; this issue builds what they will run on.
  - **Meeting and talking.** A stranger shows by canon's own `hint` ("a sunburnt young woman with a hayfork over her shoulder"). Meeting gives canon's `meet` text and their name; talking walks through canon's `talk` lines. Meeting lifts the spirits by 3; a talk by 2, once a day for each person. This is the first source of spirits that is not food or bed.
  - **Left for later:** canon's skill requirements to meet some people (`need`), gifts, the three-step stories (`tiers`) and bonuses. They wait on skills (#26), items and relationships.
  - **Save version 5,** with a migration and a test.
- **2026-11-14 · Skills and learning (#26).** Decisions:
  - **72 skills in eight families** (`content/skills/skills.yaml`): 47 gathered from Allora I's skills, plus its 25 magic disciplines kept one for one, as the magic design notes want. Each skill is an addition whose `roots` are the canon skills it gathers; a test proves every one of Allora I's 275 skills is gathered exactly once. The 33 languages become one skill, Tongues; which languages a life speaks will be knowledge, not levels.
  - **Five attributes** (`content/skills/attributes.yaml`) gather Allora I's nine attribute skills. They do not grow yet.
  - **The curve** (`packages/engine/src/skills.ts`): 75 experience for the first level, 4% more each level, 10 experience for an hour of work at the edge. A life that works a third of its hours reaches 50 in about 57 real hours and 100 in about 464; the bible asks for roughly 55 and 400.
  - **The edge.** The bible's table, joined by straight lines. For plain activities the edge is counted in levels (difficulty less skill level); checks will use the bible's own edge when challenges arrive (#27). Village work is difficulty 1, so it stops teaching as a skill nears 10.
  - **Gates** cap a skill at 10, 25, 50 and 75 and bank at most one level beyond. What passes a gate (a teacher, a trial piece) comes with professions (#30). Countermagic carries canon's note that it can never work witch magic.
  - **Balance.** A second persona, the villager, stays in Ostwick and takes any work to hand; the report's "Hours to level" section is now real.
  - **Save version 6,** with a migration and a test.
- **2026-11-14 · The challenge system (#27).** `packages/engine/src/challenge.ts`, as the bible sets it out: d20 plus bonus against a difficulty; skill adds level ÷ 5; modifiers each carry their source; advantage and disadvantage roll twice; the margin gives five degrees; a natural 20 or 1 shifts one degree. Decisions:
  - **Odds are computed exactly,** not sampled, and shown in the bible's words (Sure, Likely, Even, Risky, Long shot, Hopeless) with the number on hover. The bible's own example is a test: a master at +26 wins a Heroic check 85% of the time and a Legendary one 60%.
  - **First use.** Four Ostwick activities now end in an Easy check (tending the hives, the kegel-alley, swapping stories, wrestling). The result sets the lesson (failure teaches half) and a triumph or disaster moves the spirits a little. Wrestling now trains Games, which gathers Allora I's wrestling.
  - **Learning from checks** uses the bible's edge: difficulty less (10 + bonus).
  - **Not yet:** approaches, ventures, strain, spending resolve, injuries and marks on the world. They need cases and expeditions to hang on (#30 onward). Resolve is stored (3 points) but cannot be spent yet.
  - **Balance.** The report's "Check odds" section is real, and flags a run whose checks are mostly trivial or mostly hopeless.
  - **Save version 7,** with a migration and a test.

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
7. **Eintenn, first batch.** *(done)* About 20 new small places around Ostwick and Burg Tennfels, with residents, each rooted on canon.
8. **Named roads.** *(done)* Replace the stub roads in Eintenn with named roads, tracks and a river, and events on the way.
9. **Profession skeleton and the Smith.** *(done)* Guild-smith of the Anvil: duties, commissions, ladder.
10. **The Butler.** *(done)* Steward of Burg Tennfels.
11. **Money and markets.** One currency, shops with hours, prices that move. *(done)*
12. **Scenes.** A place view that changes with the hour, season and who is there. *(done)*
13. **Standing orders and the report.** What a life does while you are away, and what you read when you return. *(done)*
14. **Marre slice.** The Piazza of the Doges and the Lazaretto, about 20 new small places, and the Inquirer of the Cerdans. *(done)*
15. **Eintenn and Marre, remaining batches.** To ~150 places. *(done)*
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
  - **Sleep and meals run themselves.** By default a life sleeps from the 22nd hour to the 6th and eats at the 7th, 13th and 19th. Meals were free until money (#32); see that entry.
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
- **2026-11-14 · Eintenn, first batch of places (#28).** Twenty new small places around Ostwick and Burg Tennfels, in four files named `eintenn-01.yaml` (places, people, activities, roads). Decisions:
  - **What every new place has:** two sub-places, one resident with a routine (one spot by day, one by night), one activity, and at least one road in. That is the gate's "a resident with a routine and a reason to return", built in from the start.
  - **The twenty:** Weirbeck Mill, Netherwick, the Tithe Barn, the Crow Stone, Dunmere, Three Ash Ford, Hollin Cross, Sallowfield, the Hanging Oak, Undercrag, the Broken Lance, Falkenau, the Black Quarry, the Burners' Ride, the Verderer's Lodge, Reedmere, Steinwick, the Vintners' Halt, Pomerell Grange and Beacon Knoll. Each grows from something canon says: the reeve's eye on the fields, the Duke's tenth, the ducal mews and kennels, the basalt crag, the charcoal-burners, the abbey's numbered trees, Aschau's wine.
  - **Names follow the Eintenn guide:** northern compounds (Netherwick, Steinwick, Falkenau, Dunmere) and plain speech (the Crow Stone, the Broken Lance); common folk with a short given name and a short plain family name (Gerd Sack, Lise Marsh, Hob Wade). The lint refused one name, "The Gallows Oak", as too near Polygoetia's Gallows Cay; it became the Hanging Oak.
  - **Slight shifts to canon: none logged.** Nothing canon says is bent. The beck by Ostwick and the villages are new, on ground canon leaves empty.
  - **Roads:** 36 new roads, with hours from the same Allora I formula as the stubs. They are unnamed until #29.
  - **Residents keep a simple day.** Each is in one spot from the 6th hour to the 20th and another overnight. Richer routines (market days, visits to the inn) come with later batches.
  - **Tooling.** `pnpm world` now reads every file under `content/world/places`, `content/world/roads`, `content/people` and `content/activities`. The reference check now also proves that a person's routine names real sub-places.
  - **Count:** Eintenn has 39 of its 80 places; the world 318 of 2,200.
- **2026-11-14 · Named roads (#29).** Decisions:
  - **A name belongs to a route, not a segment.** 21 named routes (`content/world/routes/eintenn.yaml`) cover all 64 road segments of Eintenn; each segment names its route. Main ways: the Duke's Road (Kesselhaven to the castle to Ostwick), the Wine Road (Ostwick to Aschau to the harbour), the Abbey Way, the Hanging Road, the Ferry Road. Lesser ways are grouped: the Common Paths, the Oak Ways, the High Tracks, the Salt Paths, the Streets of Kesselhaven. Each has a line of character.
  - **A river.** The Tenn is canon ("a basalt crag above the Tenn"). One new segment carries barges between the castle and Kesselhaven harbour in 6 hours, quicker than the 8 by road. The life is a passenger and sleeps aboard, as at sea. That the Tenn reaches the sea at Kesselhaven is my reading; canon does not say where it runs.
  - **Events on the way** (`content/events/roads-eintenn.yaml`): twelve small happenings, each tied to kinds of way (road, track, river). Each waking hour of travel has a 1 in 12 chance of one. They nudge vigour or spirits a little and show on the page while the journey lasts. They are colour for now; encounters that need a decision or a check come with ventures.
  - **The lint refused one name:** "The Green Ways" was too near a canon school of magic, the Green Way. It became the Oak Ways.
  - **Not done:** Sir Odo's route (he wanders across realms, most of them not built), road tolls, and choosing between a safe road and a fast track; the engine still takes the quickest way.
  - **Save version 8,** with a migration and a test.
- **2026-11-15 · Profession skeleton and the Smith (#30).** `packages/engine/src/career.ts`, with content in `content/professions/smith/`. Decisions:
  - **The skeleton.** A post has a trade, a skill, a place, a ladder of four ranks and the steps of its work. A life holds one post. Duties are activities only the holder can do; they build standing. Cases are ventures: a chain of checks, each with a safe approach and sometimes a bold one (harder, and worth more if it comes off). Quality adds up over the steps; each cost or failure adds strain, and at three strain the rest is rolled at disadvantage.
  - **The first post:** Guild-smith of the Anvil, at the guild forges of Kesselhaven (canon: the Guild of the Anvil "controls the guild forges"). The work is the bible's five steps: heat and draw, shape and weld, quench, temper, finish. Six commissions from canon neighbours (the shipyard, an Ostwick farmer, the castle guard, the Marrean Fondaco, a knight of Saint Calder, the Collegium) and three trials.
  - **Rank needs a trial.** Taking the post is the Apprenticeship gate (a master accepts you). The journeyman's piece, the masterpiece and the great work are offered when the skill stands at its gate (25, 50, 75) and standing is enough (20, 60, 150). A piece good enough wins the rank and lifts the cap; a refused piece costs 10 standing.
  - **New people:** Master Reinhild Stark and the journeyman Till Ember, at the guild forges.
  - **Balance.** A third persona, the smith, climbs every rank: journeyman about day 45, master about day 180, grandmaster about day 540 (4.8 game years, about 216 real hours). The report has a Career section.
  - **Not yet:** pay (wages and prices wait on money, #32); materials with properties; the finished item itself (it is recorded as a work with a quality, not yet an object); techniques; a client who remembers; deadlines; named masterworks; the Chronicle. The page has a small career panel, not the bible's full Career page.
  - **Save version 9,** with a migration and a test.
- **2026-11-15 · The Butler (#31).** The second post, Steward of Burg Tennfels (`content/professions/butler/`), built on the same skeleton with no new engine code. Decisions:
  - **Four ranks, not the bible's five:** Footman, Valet, Under-Butler, Steward of the House. The skeleton and the phase gate both say four; the bible's "Butler" rank is folded into the last.
  - **The household is the Duke's,** not a lord's manor as in the bible's example: canon gives Burg Tennfels the Great Hall, the Duke's Library, the chapels and the Ducal Household. The new cast sits below the Duke and his family and changes nothing about them: the seneschal Ludolf von Ehrenau, the housekeeper Adelheid Korn and the cook Bodo Rind.
  - **A day of duties** as the bible lists them: assign the staff at dawn, attend the family in the morning, accounts and the cellar after noon, dinner service in the evening (the day's one check).
  - **Six incidents** grown from canon: the Dellian legate and the hounds, the sworn knights at the high table, Aschau wine in the cellar, the Heiress's letters, the two chapels. Three trials: dinner for twenty, the house for a season, and the Royal Progress (a canon event at the castle).
  - **The work of an incident** is four steps: keep it quiet, question the household, search the house, settle it. Each has a safe and a bold way.
  - **One skill for the whole post** (Stewardship). The bible gives each step its own skill (etiquette, persuasion, perception); the skeleton does not do that yet.
  - **Not yet:** the Lord's Trust and Household Harmony as separate measures (standing stands in for both), endings that shape later cases, techniques, and the household's moods.
  - **Balance.** A butler persona climbs every rank; the report has its section. The report's "hours worked" now counts case hours as well as duties.
  - **Build.** `pnpm world` reads every folder under `content/professions`.
- **2026-11-16 · Money and markets (#32).** A life can earn, buy and sell in Eintenn, and the report shows the money it holds over ten game years. Decisions:
  - **The pf,** counted to the hundredth. A new life starts with 20 pf.
  - **Work pays.** A duty pays by the hour at the rank held (`pay` on each rank of a post); a case pays its hours at that wage, times 0.5 to 2 by quality (15% a point); a trial pays nothing. Village work says what it pays (`pay` on an activity; about 0.3 pf an hour). First wages: smith 0.4, 0.8, 1.6, 3.5 pf an hour; butler 0.35, 0.7, 1.4, 3. Allora I's ladder (farm: 0.2 to 3.5) set the spread.
  - **Meals cost.** A plain meal is 0.5 pf where people live (and on a city street). On the road or in the wild it comes from the pack: any food carried. With neither money nor food it is scraps: less vigour, no lift to the spirits. Nobody starves out of play.
  - **Markets** (`content/markets/`, kind `market`, 11 in Eintenn). What each sells is its place's canon shop list, less recipes and guild-gated goods; the entry adds opening hours, a market day and what the place makes.
  - **Price = value × demand,** demand 0.6 to 1.6. A good rests at 0.7 where it is made, 1.0 where it is merely sold, 1.4 where it is not sold at all. Each unit bought or sold moves the price (cheap goods are deep, dear ones shallow); a glut or shortage loses 15% a day. A seller gets 85% of the price, so the same stalls never pay both ways. On market day goods are 5% cheaper and a seller gets 92%.
  - **A pack holds 20 things.** No weight or bulk yet.
  - **New mechanic, and the gap it fills:** scraps (a poor meal). Without it a life with no money would either eat for nothing or waste away; the bible says needs shape a life and never lock it out.
  - **Not yet:** lodging and rent (home is free), tools and their upkeep, dues, fares and tolls, season and event prices, production by trade, prices known only where you are, markets in Marre (#35), recipes, and using goods other than food.
  - **Balance.** New pedlar persona; careers now run ten years. The report has "Earnings per hour" and "Money supply" and flags a purse that grows more than 3% a year. **It flags every earning persona,** as expected: food is the only sink so far. A grandmaster smith takes in about 45 pf a day against 1.5 spent. The pedlar nets about 2 pf a day, so no route runs away.
  - **Save version 10,** with a migration and a test. Systems now receive the world.
- **2026-11-16 · Scenes (#33).** The page now opens on the scene of where the life stands, above the map. Decisions:
  - **Composed, not drawn.** `packages/ui/src/scene/compose.ts` turns a snapshot into layers: sky, sun or moon and stars, far hills, buildings, trees, figures. `SceneView.tsx` draws them with PixiJS. Plain shapes stand in for the art kits; no art is made yet.
  - **A place always looks like itself:** its buildings and trees are laid out from its id. A city has nine buildings, a settled place four, the wild none and more trees.
  - **The hour** moves the sun and moon, colours the sky, lights lamps from the 18th hour to the 6th, and raises hearth-smoke morning and evening. **The season** colours hills, ground and leaves; trees are bare in winter. **Figures** are the people the simulation puts there (up to eight).
  - **On the way** the scene is the road or the water, with no buildings.
  - **Words for the scene:** every scene carries a one-line description for screen readers.
  - **Not yet:** weather (no weather system yet), the sky's Houses and Wanderers, kits by land, signature pieces, sub-place views, tapping a figure to meet them, festival dressing.
- **2026-11-16 · Standing orders and the report (#34).** Decisions:
  - **Two new standing orders.** *Work unasked:* never, while away (the default), or always. *Turn back if hurt* (on by default): on the road with health under 35, the life turns back once.
  - **Safe work only.** A life working alone does the duties of its post first, then whatever pays best by the hour, and rests under 25 vigour. It never takes a case or a trial: those wait (bible: "the game never auto-solves a case").
  - **"Away" is the catch-up** after the page was closed. While the page is open, a life works alone only if ordered "always".
  - **The report** is written at the end of a catch-up: hours away, tasks done, pf earned and spent, skill levels gained, meals of scraps, whether it turned back, and how many cases (or a trial) wait. It sits in place above the scene until put away, and a second absence adds to an unread one. No pop-up.
  - **Not yet:** orders about buying food, lodging, taking commissions under a price, or travel; weighty decisions that wait; a longer report with named events; reports for several lives.
  - **Balance.** New idler persona (orders "always", then hands off).
  - **Save version 11,** with a migration and a test.
- **2026-11-16 · The Marre slice and the Inquirer of the Cerdans (#35).** Decisions:
  - **Twenty new small places in Marre** (`content/world/places/marre-01.yaml`), each with a resident who keeps hours and one thing to do: five round the Piazza, five in the city, five in the lagoon by the Lazaretto, three on the mainland, two by the Glass Isles. Names follow the Marre guide: southern forms for the city's own things, plain speech for islets and shoals.
  - **Getting about the lagoon.** A hop of an hour is a street and a bridge; anything longer is a boat (`river`: the life is a passenger and can sleep aboard). The canon stub roads of Marre are unchanged.
  - **The post** is `post_cerdans_inquirer`, in the Office of the Cerdans on the Piazza, under the Capo (`ppl_querzi`). Three new colleagues: a keeper of the files, a constable, a mirror-scryer.
  - **Four ranks: Informer, Constable, Inquirer, Capo's Deputy.** Canon's career has five; the bible has four and calls the last "the Capo's Hand". Canon wins on the name (logged in `conflicts.md`), the skeleton on the number. Mirror-Scryer waits for the Mirror-Room branch.
  - **New mechanic: the accusation,** filling the gap between the skeleton's chain of checks and the bible's "accusation is the climax". A step marked `accuse` starts 5 harder than the case and gets 2 easier for each point of quality (each clue) found before it. If it fails, the case is spoiled and standing falls by 8. The first four steps are the bible's sources of clues: the scene, witnesses, files, tailing.
  - **Eight cases and three trials,** set in canon and new Marrean places. No canon person is accused of anything.
  - **A day of duties:** night reports, walking the Piazza, petty complaints, writing up the files (the day's check).
  - **Six markets in Marre** (`content/markets/marre.yaml`), from canon shop lists.
  - **Not yet:** the case board and theories, named roles in a case (victim, culprit, witnesses), time pressure, rivals, trust on the streets as its own measure, the Mirror-Room, a skill for each step, and standing orders never accusing (they already never take a case).
  - **Balance.** New inquirer persona: all five lives reach Capo's Deputy, about game day 480, a little faster than the smith. Wages are first values.
  - **Kept:** the batch scripts now live in `tools/batches/`.
- **2026-11-16 · Eintenn and Marre, remaining batches (#36).** The slice now has **160 places** (Eintenn 80, Marre 80), up from 70. Decisions:
  - **Ninety new small places in four batches** (`eintenn-02`, `eintenn-03`, `marre-02`, `marre-03` under `content/world/places/`), each with a resident who keeps hours and one piece of work, linked by 186 new roads and boat-ways.
  - **Eintenn** grows round Kesselhaven (gates, strands, kilns, the fen), along the river, below the mines, up to the pass, across a new western moor and through the orchard country. **Marre** grows in Selino, the city's working quarters, the Grand Canal's back-water, the Glass Isles, the mainland, the lagoon's shoals and the outer rocks.
  - **Fifteen new named ways in Eintenn** (`content/world/routes/eintenn-02.yaml`), so no road there is nameless. Marre's ways are not named yet.
  - **Every place is a working place:** what its people do is what a life can do there. None of the new work is paid yet; pay belongs with the tuning in #37.
  - **Canon:** no canon place is moved or renamed. Names that came too near a canon name were changed at lint (the Salters' Gate, the Red Scar, the Breaming Hard, the Rice Floors, Mother Gundel).
  - **Not yet:** paid work and markets at the new places, people who move between places, events on Marre's waters, named ways in Marre, and a second resident anywhere.

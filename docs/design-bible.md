# Allora II — Design Bible

Nov 8, 2026 · @Astral

## Vision

Allora II is a slow, vast idle fantasy life simulation set in the world of Allora. You live several lives at once in one shared world, each a master of a different trade, and every trade is a game worth playing.

Allora I proved the world: its lands, peoples, faiths and schools of magic. Allora II rebuilds the game around that world from the ground up. It is not a bigger Allora I. It plays differently.

**The six pillars.** Every design decision is checked against these:

| Pillar | What it means in play | Why it matters |
| --- | --- | --- |
| **A slow, vast world** | Hundreds of small places, real travel times, and short, specific activities grounded in where you are | The world feels massive because it is, and where you stand matters |
| **Parallel lives** | Several specialised characters living at once in the same world, whose work feeds each other | Breadth comes from many lives, not one life doing everything |
| **Real challenges** | Skill checks with approaches, preparation, degrees of result and lasting consequences | Risk makes decisions matter; it is where the stories come from |
| **Every profession is a game** | Butler, Cerdan inquirer, smith, physician and sailor all share one deep framework of duties, cases, techniques and ranks | No trade is a progress bar; a career is a story |
| **Earned mastery** | Slow growth from meaningful work, with mastery gates no one can grind past | Reaching 100 is an achievement, not a matter of time |
| **A living world you can see** | Illustrated scenes that change with the hour, season and weather; a real map; faces for people | Even simple art makes the world feel inhabited |

**The feel we are after.** Opening the game should feel like coming back to a place and the people in it. You have news to read, a decision or two waiting, and a world that carried on without you. Sessions can be short. The game is long.

## Principles and lore rules

Allora II keeps Allora I's world rules and its best design habits, and drops the habits that held it back.

**Canon is the base.** Allora I and the Polygoetia reference are canon: every place, person, group, faith, school and story in them holds as written. Allora II is meant to **grow the world**. It adds groups, places, people and stories freely, but every addition grows from something in canon, carries its land's flavour, and never contradicts it. How this is enforced is set out in Building it with Claude Code.

**World rules (fixed; every system and every line of text obeys them):**

- **The world is static.** Realms, rulers and borders never change. Players rise within the world's order, never overturn it. No quest breaks the world.
- **Some mysteries stay unresolved forever,** such as the Lease, the Ring and the Hum's origin. The game hints and never answers.
- **No real-world historical terms in game text.** Real cultures inspire places, but the words on screen are Allora's own. Plant, animal and food names are fine.
- **Romance is between adults only.**
- **The player can never learn witch magic.** Countermagic is the closest a player comes.
- **Augury and divination give no hints about the future of play,** except where a faith says otherwise (Nim's dreams).
- **Less text in the interface.** Explanations live in the codex, and the screens stay clean.
- **No level-up cards or interrupting pop-ups.** Progress is shown quietly in place.

**Design habits to keep:**

- **Features are rare.** Most schools, faiths and professions lack most features, so each one feels different. A feature everyone has is a rule, not a feature.
- **Every number has a source in the world.** A bonus comes from a teacher, a tool, a Weather or a god, never from nowhere.
- **One simulation for everything.** A hired baker runs the same "bake" activity you would, with their own skill.
- **Lore first.** A new place starts with who lives there and why.

**What Allora II leaves behind:**

| Allora I | Allora II |
| --- | --- |
| One 4 MB page built from 90+ spliced files, extended by wrapping functions | A modular TypeScript codebase with declared hook points and content as data |
| Most rewards a small percentage buff | Rewards are mostly verbs: new approaches, places, people and techniques |
| Skills grow from repetition | Skills grow from work near the edge of your ability, with mastery gates |
| Hundreds of thin skills, many used by one activity | Fewer, deeper skills, made specific by techniques |
| Activities as timers | Activities as short, specific acts and challenges with stakes |
| Icons for everything | Illustrated scenes, a drawn map and portraits |
| A few rich systems (tracking, archaeology) among many thin ones | The expedition and case patterns everywhere, so every trade is rich |

## Time, pace and scale

One real minute is one hour of game time, so a game day lasts 24 real minutes and a game year about 45 real hours. That is slow enough for a journey or a commission to feel like a commitment, and fast enough that an evening's play moves a life forward.

**The calendar:**

| Unit | Length | Real time | What it carries |
| --- | --- | --- | --- |
| Hour | — | 1 minute | The step of the simulation; shops open and close, people move |
| Day | 24 hours | 24 minutes | Dawn, day, dusk and night, each with its own work and scene |
| Week | 7 days | 2.8 hours | Markets, rest days, wages |
| Season | 4 weeks (28 days) | 11 hours | Crops, festivals, migrations, the sky's Houses |
| Year | 4 seasons (112 days) | 45 hours | Ageing, guild trials, the great feasts |

The clock rate is a single tunable constant, to be confirmed by play-testing.

**A world of small places.** The world is huge because it is made of many small places, not a few big ones:

| Kind | Sub-places | Example | Per realm (target) |
| --- | --- | --- | --- |
| City | 15–30 | Ostwick: markets, guildhalls, temples, the manor quarter | 1–3 |
| Town | 6–12 | A market town with a smithy, a chapel, an inn and a mill | 4–8 |
| Village | 3–6 | A green, a well, a few crofts, a shrine | 10–20 |
| Site | 1–3 | A ford, a ruined watchtower, a hermit's hut, a mine | 10–20 |
| Wild | zones | The Grell woods, the high moors: tracts that you cross and search | 3–6 |

A realm of the Seven therefore holds 30–50 places, and the whole world about a thousand. Content is written as data, so this is achievable (see Content pipeline).

**Travel is a journey.** Places are joined by named roads, tracks, rivers and sea lanes, each with a character:

- **Times:** neighbouring villages 2–6 hours; across a realm 2–4 days; between realms 4–10 days; across a sea 5–7 days, matching Allora I's routes.
- **Choices:** the safe toll road or the fast hill track; walk, ride, take a carter or book passage; travel alone or with a caravan.
- **Preparation:** provisions, a bedroll, the season, the weather.
- **On the way:** encounters, spoor to follow, a shrine to rest at, an inn where you are known.

**Micro-activities.** Activities are short, specific and grounded in place, from 15 minutes to a few hours of game time. You don't "Fish (2h)"; you fish *the Mill Pool at dusk with worms*. You don't "Work at the inn"; you serve the evening crowd at *the Lamb and Flag*, where the drovers tip and the bailiff doesn't. Each activity names its place, its hour, its tools and its people.

**Needs, lightly.** Each life tracks three things only:

- **Vigour:** energy, restored by sleep and food.
- **Health:** hurt by injury and illness.
- **Spirits:** mood, lifted by company, faith and comfort.

They shape what a life can do well, not whether it can play.

**Being away, and standing orders.** Lives keep living while you are away. Routine decisions are settled by **standing orders** that you set per life: "turn back if hurt", "accept commissions under 50 pf", "sleep at the inn, not the roadside". A truly weighty decision, such as entering the bog at dusk, waits for you. The life carries on with safe work in the meantime. Returning is reading a short report and answering what waited.

## The world: five lands

Allora II covers all five lands of Allora from the start, with overlapping level bands that carry a life from 1 to 100. The world is drawn on the map from day one and filled in phase by phase.

| Land | Realms | Levels | Places (target) | Character | The way in |
| --- | --- | --- | --- | --- | --- |
| **The Seven** | Eintenn, Luggen, Grell, Sarlon, Dellian, Rolla, Marre | 1–35 | \~280 | Duchies, republics and a bishopric; markets, manors, masques, dikes; the home of most beginnings | Lives begin here |
| **Gallar** | Ripla, Fin and Drell, Gramall, Shella, Lomma, Harrowgate, the Mearc, the Knuckle | 20–50 | \~240 | Freeholds and wilds beyond the Tyer Mountains; serf-fields, fens, falconers, the Long Wake | Overland: the Hag's Saddle or the Long Dark (a challenge) |
| **Qoul** | Raben, the Sealands, the Cedar Mountains, Beth-Arum, Ahnara, the Red Land, Ashqel, Elissar | 40–70 | \~240 | Old empires of clay and stars, deserts, gods with no faces | The Sea-Seal, six days from Tarsena |
| **Thoolma** | Plandor, Therama, Seylon, Gramanna, Topila, the Southern Tribes, the Southern Reach | 60–85 | \~210 | The East: the Hum, the Raizon, ministries, bells and the Count | The imperial permit, by galley from Marre, Morena or Dilmun |
| **Polygoetia** | Two screens: the Sunward Chain and the Heart-Sea, sixteen islands | 75–100 | \~130 | The high-magic archipelago inside the Ring: the University, the Callers, the Whale-Mandala | The Articles of Safe Passage, or a letter from Halcyra |

The target is about **1,100 places**, built in phases.

**The bands overlap** so that no land is a wall. A life at 40 can work in the Seven's high-end trades, Gallar's middle, or Qoul's entry jobs. The East and the islands demand mastery.

**Where new lives begin.** The first life is born in the Seven. Later lives can be born in any land the Tapestry has opened (see Parallel lives), each with that land's culture, language and faith.

**Getting between lands stays one simple step,** as in Allora I's v83 permits: a skill threshold and a fee, then a voyage with events. Moving between lands is a long journey, so lives tend to settle where their work is.

## Parallel lives and the Tapestry

You play several characters at once in one shared world, each specialised. New lives and their powers come from a prestige layer, **the Tapestry**: an upgrade tree bought with a prestige currency, **Legend**, earned by every great thing your lives do. Lives do not age, and nobody inherits. Your lives stay as long as you keep them.

### Legend

Legend is earned by milestones of any life, never by grinding:

| Milestone | Legend (starting values, to tune) |
| --- | --- |
| A rank trial passed (Journeyman / Master / Grandmaster) | 10 / 40 / 150 |
| A masterwork made, or a great case closed | 15 |
| A legendary find, or a signature case | 50 |
| A record completed (a Bestiary chapter, a site catalogued) | 20 |
| A friend story or an ambition fulfilled | 10 |
| A Chronicle chapter written | 5 |
| A first: first life to enter a land, first to master a school | 25 |

The first new life slot should be affordable after about 10–15 hours of play.

### Laying a life down

As an optional prestige reset, you can **lay a life down**:

- its story closes with a final Chronicle chapter;
- it converts part of its accomplishments into Legend, more for higher mastery;
- its slot opens for a new life.

What it made stays in the world. Its masterworks are still owned and used, its buildings stand, and its friends remember it. Laying a life down is never required. It exists for players who want to try a new path in the same slot.

### Making a new life

You create each new life yourself:

- **a land of birth,** from the lands your Tapestry has opened;
- **an upbringing,** for example a Grell mourner's child, a Kesselhaven guild apprentice, a Raben scribe's son or an Oloa canoe-house daughter. It sets culture, language, faith leanings and a few starting skills;
- **a first trade,** which sets the starting post.

Every new life starts near level 1 in its trade, carrying whatever the Tapestry has unlocked.

### The Tapestry

The Tapestry is an upgrade tree of about ninety nodes in ten threads. Each node is bought once with Legend, and costs rise along each thread.

| Thread | What it unlocks | Example nodes |
| --- | --- | --- |
| **Lives** | New life slots, up to eight | A second life (50 Legend), a third (150), a fourth (400), a fifth (1,000), a sixth (2,500)... |
| **Origins** | Lands and upbringings for new lives | Born in Gallar; born in Qoul; a noble upbringing; a temple upbringing |
| **Hands** | Crafts and works | Start with a technique; better quality on the first try at a new family; a seventh quality grade |
| **Roads** | Travel and post | Faster parcels between lives; safer couriers; one free fast-travel per season to a home |
| **Kinship** | How lives help each other | Help from another life counts double; shared standing orders; lives in one town share a home's comfort |
| **Lore** | Knowledge | The codex shares one life's deciphered texts with all lives; research ventures take less time |
| **Arcana** | Magic | +1 Will at the start of each day; a second school's teacher found faster; misfires one degree milder |
| **Devotion** | Faith | Blessings last longer; one forgiven taboo a season; pilgrimages give double Legend |
| **Fortune** | Challenges | +1 Resolve for every life; one reroll per venture without spending Resolve |
| **Time** | Being away | Smarter standing orders; more weighty decisions settled sensibly; a longer report on returning |

The threads are deliberately broad. They should open new possibilities more often than they add percentages, in line with the design habit that rewards are verbs.

### How lives touch

Your lives share one world, so they meet the way people do:

- **Letters and parcels** carry goods, money and notes at real travel speed. A parcel from Ostwick to Tarsena takes days, and a courier can be robbed.
- **Commissions:** one life orders from another. The tracker orders a spear from the smith; the smith orders a rare hide from the tracker.
- **Knowledge:** the codex records everything any life has learned, but a life can only *use* what it knows, unless the Tapestry's Lore thread says otherwise.
- **Joint ventures:** two lives in the same place can take on a challenge together, each helping the other's checks.
- **Homes:** lives can share a house, a workshop or a farm.
- **Faith and politics:** lives may follow rival gods or serve rival lords. That tension is allowed, and it is interesting.

### Specialisation stays

Mastery gates and slow growth mean a life masters one or two trades. Breadth comes from more lives, which is exactly what Legend buys.

### Attention

There is no stamina system for you, the player. Each life runs independently, and decisions wait in one inbox. The Lives strip shows every life's portrait and state: working, travelling, resting, or waiting for you.

## The challenge system

Every risk in Allora II, from picking a lock to questioning a witness, forging a blade or crossing a bog at dusk, is settled by one check system modelled on tabletop play. A check is a d20 roll plus a bonus against a difficulty. What makes it a game is everything around the roll: the approach you choose, how well you prepared, how far the result lands from the target, and what you decide next.

[Diagram in the online bible: the challenge loop · one step of a venture]

A venture repeats this loop for three to six steps. Pressing on risks more for a bigger reward. Stopping banks what you have.

### The roll

**Total = d20 + bonus, against a difficulty (DC).** The bonus adds up from:

| Source | Range | Example |
| --- | --- | --- |
| Skill | +0 to +20 | Skill level ÷ 5, rounded down |
| Technique | +1 to +3 | You know the folded-steel weld; this step is a weld |
| Tools | −2 to +3 | A cracked hammer −2; a master's hammer +3 |
| Preparation | +1 to +5 | You read about this crypt; you scouted the ford |
| Help | +2 | A companion or another of your lives with the skill at half yours or better |
| Conditions | −3 to +3 | Darkness, a favouring Weather, a blessing, exhaustion |

**Difficulty ladder:**

| Difficulty | DC | Feels like |
| --- | --- | --- |
| Trivial | — | No roll; it just happens |
| Easy | 10 | Routine for a trained hand |
| Moderate | 15 | Real work |
| Hard | 20 | A master's daily challenge |
| Very hard | 25 | Rare even for masters |
| Heroic | 30 | Once in a career |
| Legendary | 35 | The stuff of the Chronicle |

A skill-100 master with good tools and technique (+26) succeeds on a Heroic check about 85% of the time, and on a Legendary one about 60%.

**Advantage and disadvantage.** Some conditions roll twice and keep the better or worse die rather than adding a number. Advantage comes from perfect preparation, a god's blessing, or a Weather that favours your art. Disadvantage comes from being wounded, fighting the Hum, breaking a taboo, or working blind.

### Degrees of result

The margin (total minus DC) sets the result. A natural 20 raises it one degree, and a natural 1 lowers it one.

| Margin | Result | Typically |
| --- | --- | --- |
| +10 or more | **Triumph** | What you came for, plus a bonus: a rarer find, renown, a shortcut, a new lead |
| 0 to +9 | **Success** | What you came for |
| −1 to −4 | **At a cost** | You get it, but pay: hurt, late, a broken tool, a witness who noticed (only where the step allows costs) |
| −5 to −9 | **Failure** | Not this time, and a small setback |
| −10 or worse | **Disaster** | A real consequence: injury, loss, a creature alerted, a scandal |

### Approaches

Most steps offer two to four ways through, each with its own skill, difficulty and side-effects. A sealed crypt door, for example:

- **pick it** (Lockpicking, Moderate): quiet;
- **force it** (Strength, Hard): loud, and the next step may be harder;
- **speak the ward-word** (Warding, Easy): only if you know it;
- **find another way** (Archaeology, Moderate): costs an hour.

Knowledge, magic, faith and friends add approaches. That is where depth comes from: a life with a wide toolkit sees more ways through.

### Ventures, strain and resolve

- **Ventures** are chains of three to six steps: a hunt, an excavation, an investigation, a difficult commission, a dangerous crossing.
- **Strain** builds within a venture with each cost or failure. At its limit you must withdraw, or press on at disadvantage.
- **Resolve** is a small pool per life (three points at the start, five for veterans). Spend a point to reroll a die. It refills with rest, faith, friends and good meals.
- **Banking:** some rewards are kept as you go; the best are only won by finishing.

### Consequences that last

- **Injuries** have names and durations (a sprained wrist: 5 days, −2 to fine work). A physician, possibly one of your own lives, shortens them.
- **Conditions:** exhausted, frightened, chilled, cursed, ill.
- **Marks on the world:** a looted ruin stays looted; a hunted beast grows wary; a scandal spreads.
- **Reputation:** daring, care, cowardice and cunning are remembered by the people who saw them.

### Showing the odds

The chance of success shows in words, with the number on tap:

| Word | Chance |
| --- | --- |
| Sure | 95% or more |
| Likely | 75–94% |
| Even | 45–74% |
| Risky | 20–44% |
| Long shot | 5–19% |
| Hopeless | under 5% |

The decision is the gameplay, so the odds are never hidden.

**There is no combat system.** Danger is a venture like any other. A wolf at the fold is faced with a weapon, a torch, an animal-handling approach, or a dignified run.

**Routine checks while you are away** resolve automatically under standing orders. Only checks marked weighty wait for you.

## Professions: the skeleton and the Career page

Every profession, whether butler, Cerdan inquirer, smith or sailor, is built from the same eight parts. They are dressed differently for each trade, so a butler's day feels nothing like a smith's, but both are equally deep. In every profession, duties are the idle backbone that runs while you are away, and cases are the play that brings you back.

### The eight parts

| Part | What it is | In a smithy | In a manor (butler) | In Marre (Cerdan inquirer) |
| --- | --- | --- | --- | --- |
| **Post** | Who you work for, and where | Your own forge, or a master's | The household of Lord Aubry, Ostwick | Sworn to the Cerdans, behind the black door on the Piazza of the Doges |
| **Duties** | Recurring work, mostly small checks resolved by standing orders | Nails, hinges and repairs for the village | Run the household: meals, linen, staff, the cellar | Watch the quays; answer petty complaints |
| **Cases** | The profession's ventures: multi-step challenges with a client, stakes and a deadline | A commission: a plough-share by sowing, a sword for a captain | An incident: a duke to impress, a missing ring, a scandal | A case: a theft, a disappearance, a poisoning |
| **Ladder** | Ranks, each passed by a trial | Apprentice, journeyman, master, grandmaster | Footman, valet, under-butler, butler, steward of the house | Informer, constable, inquirer, the Capo's Hand |
| **Techniques** | Specific learned methods that open approaches and products | Folded-steel weld, oil quench, pattern-welding | The silent service, cellar-craft, reading a guest | Shadowing, cipher-breaking, reading a liar |
| **Tools and premises** | Their quality shifts checks | Hammer, anvil, forge; an upgraded workshop | Keys, the household ledger, a trusted staff | A case-board, contacts, a safehouse |
| **People** | Employer, clients, colleagues, rivals, apprentices | Regular customers with tastes; a rival smith | The lord, the family, the staff, the guests | Informants, suspects, a rival investigator |
| **Reputation and works** | Who knows you for what, and the record of what you did | "The smith who made the Barrow Sword" | "The butler who kept the Aubry scandal quiet" | "The one who closed the Glass Street case" |

### How a profession plays

- **Duties pay wages and build standing** with your employer or clientele, quietly, every day. Doing them well brings better cases. Neglecting them invites trouble.
- **Cases arrive from your post, your reputation and the world.** Each is a venture from the challenge system: a few steps, real choices, a deadline, and a client who remembers how it went. Cases are part template and part hand-written. Every profession also has rare hand-written **signature cases** worth a Chronicle chapter.
- **Rank needs a trial,** not just a level: a test piece, an examination, or an incident handled before witnesses (see Progression).
- **Techniques are learned from people, books and experiment,** never automatically. Each is a small story: a master who must be convinced, a manual in another language, a discovery after many attempts.
- **Every profession touches the rest of the game.** Cases spawn leads that other lives can follow. Magic and faith add approaches. Inter-life commissions link trades.

### One post at a time, several trades

A life holds **one post** at a time: its main profession and its place in the world. It can also take **side work** in any trade it has skill in: independent jobs, small commissions, seasonal labour. Changing post is a real decision. You give notice, lose some standing, and start lower on the next ladder.

### The Career page

Each life has a Career page, the hub where its working life is managed:

| Panel | Shows |
| --- | --- |
| **Post** | Profession, rank, employer or shop, standing, wages |
| **Today** | The duties schedule and how each went |
| **Cases** | Offered, open and waiting-for-you, with deadlines and odds in words |
| **Ladder** | The next rank, its trial and what is still missing |
| **Techniques** | Known, being learned, and rumoured (a name and where it might be found) |
| **Works** | The record of commissions, cases and masterpieces, with the stories behind them |
| **Ledger** | Income and costs by week and season |
| **People** | Employer, clients, colleagues, rivals and apprentices, each with a face and a mood |
| **Standing orders** | The rules this life follows while you are away |

## The profession catalogue

There are forty-two professions in seven families, plus a calling for each school of magic. Each has a post, duties, cases and a ladder of four ranks with a named top rank. Each also has one great case: the kind of story it exists to tell. Crafting is one family among seven, and none of the seven is filler.

### Crafts

| Profession | Typical post | Duties | Cases | Top rank | A great case |
| --- | --- | --- | --- | --- | --- |
| Smith | A village forge; a guild shop; an armoury | Repairs, nails, horseshoes | Commissions: blades, tools, locks, armour | Grandmaster of the Anvil | A blade for a duke's heir, forged from star-metal |
| Carpenter and joiner | A workshop; a shipyard | Mending, fittings, coffins | Furniture, roof-frames, ship-work, a cathedral screen | Master of the Square | A hammer-beam roof for a guildhall |
| Tailor and weaver | A loom-house; a court tailor's | Cloth by the bolt, alterations | Gowns, livery, banners, a costume for the masque | Mistress of the Needle | Wedding clothes for a royal match, by the spring feast |
| Potter and glassblower | A kiln-yard; a glasshouse | Pots, bottles, panes | Glazes, lenses, a chapel window | Master of Fire and Sand | A rose window that throws the right colours at dawn |
| Jeweller and gem-cutter | A goldsmith's; a Lapidary House | Settings, repairs, valuations | Rings, chains of office, a reliquary | Master of the Facet | A crown re-set overnight before a coronation |
| Leatherworker | A tannery; a saddler's | Tanning, straps, mending | Saddles, armour, bindings, a wyvern-hide coat | Master Saddler | Armour from a beast your tracker brought home |
| Brewer and vintner | A brewhouse; a vineyard | The daily brew, the cellar | A feast's ale, a vintage, a cordial for a festival | Cellar-Master | A wine laid down this year that will be famous in ten |
| Cook and baker | A bakehouse; an inn kitchen; a manor kitchen | Bread, the daily meals | Banquets, wedding cakes, a dish for a picky noble | Master of the Table | A banquet for three courts that must offend no god |
| Alchemist and apothecary | A shop of jars; a Collegium lab | Remedies, dyes, lamp-oil | Tinctures, antidotes, rare reagents | Master of the Retort | An antidote for a poison no one has named |
| Scribe and bookbinder | A scriptorium; a counting-house | Copying, letters, accounts | Illuminated books, forgeries detected, a treaty fair-copy | Master of the Hand | Copying a dying library before it burns |
| Builder and mason | A building gang; a cathedral lodge | Walls, repairs | Houses, bridges, towers | Master of the Lodge | A bridge across the Tyer in one season |

### Land and sea

| Profession | Typical post | Duties | Cases | Top rank | A great case |
| --- | --- | --- | --- | --- | --- |
| Farmer | A tenant croft; your own farm | Fields, beasts and the season's round | Blight, drought, a prize at the fair, a new strain | Master of the Land | Saving a valley's harvest in a wet year |
| Herder and stockman | A drover's road; a stud farm | Herding, lambing, milking | Breeding lines, a lost herd, the long drive | Master of Herds | Driving a herd across Gallar before winter |
| Fisher | A boat; a weir; an ice-camp | The daily catch | A shoal to find, a storm to ride, a legendary fish | Master of the Nets | The Old Pike of the Mill Pool, which nobody has landed |
| Forester | A lord's woods; a timber camp | Felling, coppicing, wardening | Poachers, a fire, a great tree for a hull | Master of the Wood | Choosing and felling a flagship's keel-tree |
| Miner and prospector | A pit; a claim | Ore by the cart | New veins, cave-ins, gas, a lost seam | Master of the Deep | Reopening a mine sealed for a century |
| Hunter and tracker | A lord's huntsman; your own hunts | Game for the pot | Beasts to track and face, a man-eater | Master of the Chase | The Grell Wyvern, if it exists |
| Sailor and navigator | A deck; a pilot's licence | Watches, rigging, cargo | Voyages, storms, a new route | Master of the Sea | First through the Ring without a Caller |
| Gardener and herbalist | A manor garden; a physic garden | Tending, picking at the right hour | Rare plants, a blight, a garden for a feast | Master of the Garden | Growing a herb that flowers once in seven years |

### Service

| Profession | Typical post | Duties | Cases | Top rank | A great case |
| --- | --- | --- | --- | --- | --- |
| Butler and steward | A manor household | Run the house, staff and cellar | Guests, crises, scandals, secrets | Steward of the House | A royal visit during a family scandal |
| Innkeeper | An inn; a roadhouse | Rooms, meals, the taproom | Brawls, a guest who is not who they say, a famous feast | Host of Renown | The night three rival lords take rooms at once |
| Physician | A practice; a lord's household; a pest-house | Rounds, minor ailments | Patients to diagnose and treat, plagues, surgery | Master Physician | A plague in Tarsena |
| Bard and performer | A troupe; a patron's hall; the road | Playing for supper | Commissions, contests, a satire that could start a feud | Master of the Hall | Singing at a royal wake without offending anyone |
| Courtier and diplomat | A noble's service; an embassy | Attendance, correspondence | Negotiations, insults to smooth, a marriage to arrange | Envoy Plenipotentiary | Keeping two realms at peace through one bad dinner |
| Tutor and teacher | A noble's children; a village school | Lessons | A dull heir, a gifted pauper, an exam | Master of Letters | Getting a stable-boy into the Collegium |

### Law and shadow

| Profession | Typical post | Duties | Cases | Top rank | A great case |
| --- | --- | --- | --- | --- | --- |
| Investigator | The Cerdans of Marre; a thief-taker's licence in Kesselhaven; a Ministry examiner in Plandor | Watching, informing, petty complaints | Thefts, disappearances, murders, conspiracies | The Capo's Hand (in the Cerdans) | The Glass Street poisonings |
| Watch and guard | A town watch; a lord's guard; the Rime-Watch | Patrols, gates, watches | Riots, smugglers, a siege of nerves | Captain of the Watch | A city's feast-night with every faction armed |
| Advocate | A law-house; a court; Raben's Office of Seals | Contracts, pleadings | Trials, inheritances, a disputed island | Master of the Bench | Defending someone everyone knows is guilty |
| Thief and fence | The Rats of the Undercroft; your own shadow | Picking pockets, fencing | Burglaries, cons, a heist | Prince of Shadows | Stealing back what a lord stole first |
| Smuggler | A boat; a mule-train | Runs, bribes | A cargo through a blockade, a customs raid | Master of the Run | Running the Narrows under the Ministry's nose |
| Spy | A noble's service; a guild's | Listening, reporting | Infiltration, ciphers, a double agent | Spymaster | Unmasking a spy who is also your friend |

### Learning

| Profession | Typical post | Duties | Cases | Top rank | A great case |
| --- | --- | --- | --- | --- | --- |
| Scholar | A Collegium fellowship; a lord's library | Study, lectures, correspondence | Translations, disputations, a lost text | Master of the Collegium | Proving a famous text is a forgery |
| Archaeologist | A digging licence; a patron's expedition | Survey, cleaning finds | Excavations, ruins, an artefact to interpret | Master of Antiquities | Finding the first tomb of Old Vaelis |
| Cartographer and explorer | A guild of surveyors; your own roads | Surveys, copying maps | Unmapped valleys, a disputed border, a hidden route | Master of the Map | Charting the far side of the Raizon |
| Astrologer | An observatory; a court | Charts, almanacs | Nativities, the year's reading, a comet | Master of the Heavens | Reading the Great Conjunction for a king |

### Trade

| Profession | Typical post | Duties | Cases | Top rank | A great case |
| --- | --- | --- | --- | --- | --- |
| Merchant and factor | A counting-house; a trading company | Buying and selling, accounts | Deals, corners, a ship come home late | Merchant Prince | Cornering the season's cloves without starting a war |
| Caravaneer | A caravan company | Loads, stock, the road | Crossings, bandits, a lost well | Master of the Road | Crossing the Red Land in high summer |
| Banker and moneylender | A bank; a strongroom | Loans, deposits, exchange | Bad debts, a forgery, a lord's ruin | Master of Coin | Lending to a king who may not repay |

### Faith and magic

| Profession | Typical post | Duties | Cases | Top rank | A great case |
| --- | --- | --- | --- | --- | --- |
| Priest | A parish; a temple; a shrine | Rites, confessions, the sick | Disputes, crises of faith, a possession, a heresy | High Priest of a faith | A miracle someone needs, and doubts |
| Monk and mystic | A monastery; a hermitage | Prayer, labour, silence | Visions, pilgrims, a test of the vow | Abbot or Elder | Keeping a vow when breaking it would save a life |
| Court mage | A lord's household; a city | Wards, lights, small workings | A curse, a magical theft, a rival mage | Archmage of the Court | Undoing a working older than the realm |
| Cunning-folk | A village; the road | Charms, cures, advice | Blights, curses, lost things | Wise One of the Valley | Lifting a curse without learning who laid it |
| School-specific callings | Varies: a Tempest Caller's choir, a Rime-Watch reeve | The school's own duties | The school's own cases | The school's own top rank | The school's legend (see Magic) |

### Local posts: where a trade becomes a place

A trade is the skeleton; a **post** is how you actually live it, rooted in one place. Each post has:

- its own name and people;
- its own cases and techniques;
- its own ladder, laws and look.

An investigator in Marre and an examiner in Plandor share a trade, but they live completely different careers. Each trade has two to six posts across the world, about **180 posts** in all. Most are as specific as the examples below, drawn from Allora's lore:

| Post | Trade | Where | What makes it its own |
| --- | --- | --- | --- |
| **Inquirer of the Cerdans** | Investigator | Marre, behind the black door on the Piazza of the Doges | Files on every forger, fence and poisoner in the lagoon; Capo Marin Querzi; the Mirror-Room's scryers under the Blind Mirror; cases that touch the Ten Families |
| **Steward of Burg Tennfels** | Butler | Eintenn, the ducal seat | A household of sworn knights, hounds and a Dellian legate; the Duke's moods |
| **Guild-smith of the Anvil** | Smith | Kesselhaven's guild quarter | Guild law, the Salzmarkt's buyers, the journeyman's walk |
| **Glassmaker of the Glass Isles** | Glassblower | Marre | Furnace secrets kept on pain of death; you may never leave the Republic with them |
| **Player of the Teatro della Maschera** | Performer | The Marrean Fondaco, and Marre | Masks, mirrors, and the Silvered Masque behind the comedy |
| **Physician of the Lazaretto** | Physician | Marre | Quarantine, plague-ships, and the Republic's fear |
| **A Rat of the Undercroft** | Thief | Beneath Kesselhaven | The Night-Master's law, chalk marks, the old salt-cellars |
| **Reeve of the Rime-Watch** | Watch | The Deichmarsch, Luggen | Winter watches on the dike, the rime-words, the Surge |
| **Mask-Warden of Trauerfels** | Keeper and priest | Grell | The death-masks of the great, lent on the Hollow Nights |
| **Falconer of the wing-lofts** | Hunter | Lomma | Birds as partners; the falconers' rank by the birds they fly |
| **Serf-reeve of Hobb's Furrow** | Farmer | Gramall | The bailiff, the Wake-Fields, and whose grandmother is under which furrow |
| **Scribe of the Tablet-House** | Scribe | Raben | Clay archives, true names, and tablets that must not be misfiled |
| **Embalmer of Ahnara** | Physician of the dead | Ahnara | Exact geometry for the dead; Hetet's measurers watching |
| **Pearl-diver of Dilmun** | Fisher | The Sealands | Breath, banks and the Pearl Road's canoes |
| **Examiner of the Ministries** | Investigator and clerk | Plandor | Nine forms of address, files in triplicate, and corruption only paperwork can catch |
| **Bell-founder of Campanara** | Smith | Gramanna | Bronze that must ring true; the Kingdom of Bells listens |
| **Cutter of a Lapidary House** | Jeweller | Seylon | Your House's Cut-Book; the Hum in the crystal |
| **Verse-Wright of the Burning Hand** | Poet and scribe | Topila | Verses burned into banners at noon |
| **Ring-pilot of the Callers** | Sailor | Ulumere | Singing a door into the Ring from a ship's bow |
| **Wing-rider of Ascara** | Guard | Ascara | The Gathering, the launch-cliffs, the Long Raid |
| **Weigher of the Harbour-Mothers** | Merchant | Brightwater Key | Every scale in the islands, and tea in the weigh-house |
| **Student of the Four** | Scholar and mage | Halcyra | The three colleges, examinations held in the right Weather |

Posts carry the world's flavour into every career. A smith in Kesselhaven answers to a guild; a bell-founder in Gramanna answers to the sound.

## Worked professions

Four professions worked through in detail: the Butler, the Inquirer of the Cerdans, the Smith and the Physician. Each feels distinct while using the same skeleton. They are also the candidates for the first playable slice.

### The Butler

**Fantasy:** the quiet power behind a great house. You know every key, every secret, and exactly how the lord likes his eggs.

**The post** is a manor household, for example Lord Aubry's house outside Ostwick. The household is a living cast:

- the lord, stern and proud;
- the lady, kind but watchful;
- an heir with gambling debts;
- a housekeeper who is your ally or your rival;
- a cook with a temper;
- footmen and maids, each with a skill and a loyalty.

Two measures carry the career:

- **the Lord's Trust** (0–100);
- **Household Harmony**, the staff's mood and efficiency.

**A day of duties,** resolved by standing orders while you are away:

| Hour | Duty | Check |
| --- | --- | --- |
| Dawn | Assign the staff | Leadership; better assignments lift Harmony |
| Morning | Attend the family | Etiquette; guests raise the difficulty |
| Afternoon | Accounts and the cellar | Stewardship; savings show in the household ledger |
| Evening | Dinner service | Etiquette, the day's main check: a fault is noticed |

**A case: the missing signet.** The lord's signet ring is gone the night before a guest arrives:

1. **Keep it quiet:** Discretion, Moderate. Failure means rumour reaches the guest.
2. **Question the staff:** choose an approach.
   - *Kindness* (Persuasion): slow, and lifts Harmony.
   - *Pressure* (Intimidation): fast, and hurts Harmony.
   - *Watching* (Perception): needs a day.
3. **Search the house:** Perception, Hard, or Easy with the technique *Keys and Corridors*.
4. **The truth:** the heir pawned it to cover a debt. You choose the ending.
   - *Tell the lord:* Trust rises; the heir resents you.
   - *Buy it back quietly:* costs coin; the heir owes you.
   - *Cover it entirely:* a Hard Discretion check. The heir becomes your ally; if it is discovered, Trust collapses.

The choice shapes later cases. A grateful heir becomes lord one day.

**The ladder:**

| Rank | Trial |
| --- | --- |
| Footman | — |
| Valet | Serve a formal dinner for twenty without fault |
| Under-butler | Run the house for a season while the butler is away |
| Butler | Carry the house through a crisis with no outside harm |
| Steward of the House | Host a royal visit |

**Techniques:**

- *the Silent Service:* Discretion bonus while serving;
- *Cellar-Craft:* a wine-pairing approach at dinners;
- *Reading a Guest:* learn a guest's tastes from one evening;
- *the Household Ledger:* the house's savings become your bonus;
- *Keys and Corridors:* search approaches in any great house;
- *the Unflappable:* +1 Resolve in household crises.

**What makes it special:** access. A butler hears what no adventurer hears, introduces your other lives to commissions (the manor orders a gate from your smith), and in time reaches the edges of court life.

### The Inquirer of the Cerdans

**Fantasy:** the canals of Marre, masks and mirrors, and a city where everyone is someone else on feast nights.

**The post** is a place among the Cerdans, the Republic of Marre's department of investigators, behind the plain black door on the Piazza of the Doges. The Cerdans keep files on every forger, fence, poisoner and conspirator in the lagoon. Above you are Capo Marin Querzi, who has sent two senators of the Ten Families to the Leads, and the Blind Mirror, Orsola Vianel, whose Mirror-Room of scryers sees through every illusion the Masque can weave. Standing is measured as **Renown** in the Cerdans and **trust on the streets**. The Ten Families are watched by you and watch you back.

**Cases are built from templates.** Each case has roles: victim, culprit, witnesses with motives, a red herring. It also has a method and a motive, and a set of clues placed in real Marrean places: the glass quarter, the masque-houses, the quays.

**The case board.** Every clue you find is pinned to the board. Clues come from:

- **the scene:** Perception, or a Divination approach;
- **witnesses:** Insight against their lies; each has something to hide;
- **records:** reading ledgers and letters;
- **tailing:** Stealth and Streetwise;
- **confrontation:** Rhetoric or Intimidation.

You connect clues into a theory, and the game shows which links are supported. It does not say whether the theory is right.

**Time pressure.** Each day the culprit may act: destroy evidence, flee, or strike again. Days spent are a real cost.

**Accusation is the climax.** You name the culprit and present three supporting clues.

- If you are right, the case closes, renown rises, and the culprit may become a rival.
- If you are wrong, renown falls, the real culprit escapes, and an innocent person suffers.

The game never auto-solves a case. Standing orders cannot accuse; a case always waits for you.

**The ladder:**

| Rank | Trial |
| --- | --- |
| Informer | — |
| Constable | Close three petty cases without a wrong accusation |
| Inquirer | Close a murder |
| The Capo's Hand | A case that reaches into the Ten Families, closed without the Republic shaking |

An inquirer with Divination or Illusion can also be drawn into the **Mirror-Room**, a magical branch of the Cerdans. There, scryers watch the city in angled glasses under the Blind Mirror.

**Techniques:**

- *Shadowing;*
- *Reading a Liar;*
- *Cipher-Breaking;*
- *the Masque-Eye:* see through Marrean masks;
- *Canal Ways:* move through the city in half the time;
- *a Network of Informants:* passive clues each week.

**What makes it special:** it is the only profession where the player's own reasoning is the decisive skill. Checks find the clues; you must make sense of them.

### The Smith

**Fantasy:** fire, iron and choices. Every blade has a story, and some will be named.

**A commission** comes with:

- a client;
- an item family and tier (a sword, tier 4);
- a wish ("light enough for a Watch-woman's arm");
- a deadline;
- a price.

**Sourcing materials.** Materials have properties as well as tiers:

- this ore is pure but brittle;
- this charcoal burns clean;
- a scrap of meteoric iron is a gift from the sky.

You buy them, mine them, or order them from another of your lives.

**The work** is a short venture of four or five steps, each with a choice:

1. **Heat and draw:** a safe heat, or a hotter one (better quality, risk of burning the steel).
2. **Shape and weld:** the technique decides what is possible; a pattern-weld is Hard but beautiful.
3. **Quench:** oil (safe), or water (harder and sharper, but it may crack).
4. **Temper:** set the balance between hardness and toughness.
5. **Finish:** grind, polish, and perhaps engrave or etch, with a maker's mark.

**The result** is an item with a quality grade, properties (keen, tough, light, flawed) and your mark. A Triumph on enough steps makes a masterwork with a name, and the Chronicle remembers it.

**Duties** are repairs and nails for the village: steady coin, and auto-resolved.

**The ladder:**

| Rank | Trial |
| --- | --- |
| Apprentice | — |
| Journeyman | A journeyman's piece judged by a master |
| Master | A masterpiece judged by the guild |
| Grandmaster | A legendary work from legendary metal |

**Techniques:** the folded weld, the oil quench, pattern-welding, the Sillenian edge, cold-forging, star-metal working. Each is learned from a master, a manual, or many failed attempts.

### The Physician

**Fantasy:** a mystery that breathes. Find out what is wrong with someone before it is too late.

**Patients** arrive with a presentation (fever, a rash, a cough that sounds wrong), a history, and sometimes a lie. Diagnosis narrows a list of possible illnesses:

- **examine:** Physick or Perception;
- **ask:** Insight, when they are hiding something;
- **test:** Alchemy;
- **consult:** a text, or a letter to a scholar life.

**Treatment** is a choice of remedy, dose and method, with surgery the riskiest. Follow-up visits show whether you were right. Outcomes are recovery, complication or, rarely, death, and a patient's family remembers.

**Plagues** are city-wide cases: a season of work, triage choices, and the respect of a whole town.

**Your own lives need you.** A physician life shortens the injuries of your tracker and your smith. The parallel lives need each other here more than anywhere.

**Faith in the sickroom.** Some patients want a priest instead. Some illnesses are curses. A miracle and a medicine can work together, or against each other.

**The ladder:**

| Rank | Trial |
| --- | --- |
| Leech | — |
| Licensed physician | A guild or Collegium examination |
| Master physician | Name and cure a rare disease |
| Royal physician | A crowned patient |

**Techniques:** pulse-reading, bone-setting, fever-cooling, the cutting (surgery), theriac compounding, and the physick of grief.

## Expeditions

Tracking monsters and archaeology were the most fun systems in Allora I because they follow one pattern: a lead, information to interpret, preparation, a risky venture, a unique find, and a record that grows. Allora II makes that pattern a core system, the **expedition**, and uses it for hunting, digging, exploring, prospecting, natural history, pilgrimage and the search for magic.

### The expedition pattern

| Stage | What happens | Example (a hunt) |
| --- | --- | --- |
| **Lead** | A rumour, a sign, a fragment, a request | Sheep taken on the Grell edge; a farmer's drawing of a track |
| **Research** | Information that narrows the search, from books, people or your other lives | The bestiary says it hunts at dusk near water; the scholar life finds an old account |
| **Preparation** | Party, supplies, gear, timing | Two hirelings, five days' food, a boar-spear from the smith life, wait for the new moon |
| **Venture** | Days in the field: searching, then the decisive steps | Cut for sign along the streams; a fresh kill; follow it into the bog or wait for light |
| **Find** | Something specific, never a generic reward | The Grell Wyvern: its hide, its tooth, the story |
| **Interpret** | Some finds need expertise to understand or use | The tooth is older than the beast: was it someone's charm? |
| **Record** | The find enters a lasting collection | Bestiary entry complete; a trophy over the hearth |

### Expedition types

| Type | Main skills | The record | Finds |
| --- | --- | --- | --- |
| **The hunt** | Tracking, Hunting, Survival | The Bestiary: every creature with its habits, sign, seasons and lore | Hides, trophies, reagents, a beast's name |
| **The dig** | Archaeology, History, Excavation | The Collection: artefacts, catalogued and interpreted | Relics, inscriptions, lost techniques |
| **The survey** | Cartography, Pathfinding | The Atlas: roads, tracts and secret ways you have charted | New places, shortcuts, hidden sites |
| **The natural history** | Herbalism, Fishing, Animal lore | The Herbarium and the Fish Book | Rare plants and fish, specimens, reagents |
| **The prospect** | Mining, Geology | The Vein Register | New seams and gem pockets |
| **The pilgrimage** | Faith skills, Endurance | The Pilgrim's Book | Blessings, relics, a god's favour |
| **The arcane search** | A school's disciplines, Lore | The Grimoire or the school's own record | Teachers, texts, places of power, new workings |

### How expeditions play

- **Field time is days, not hours.** A hunt might be five days, a dig a whole season. Supplies run down; the weather turns; a companion gets hurt.
- **Searching is a run of small checks** that build up Sign (or Depth, or Coverage) towards a decisive venture. Good preparation makes each check count for more.
- **Wilds are zones with density,** not single spots: some places have more sign, more ruins, more of what you seek, and the density changes with season and weather.
- **Legendary finds are hand-written:** a named beast, a named tomb, a lost road. Each has its own multi-stage venture and appears in the Chronicle.
- **Records are worth completing.** Finishing a bestiary chapter, or cataloguing a site's last layer, teaches a technique, earns renown with a guild, or opens a new lead.
- **Sites remember.** A dug layer stays dug; a hunted beast leaves its range for a while; a charted road stays charted for all your lives.
- **Parallel lives make expeditions richer.** The smith arms the hunter; the scholar interprets the dig; the physician patches up the survey party.

## Quests and stories

Quests in Allora II grow out of careers, expeditions, people and the calendar, rather than coming from a quest board. A good quest touches more than one life: a Cerdan inquirer's case leads to a ruin, the ruin becomes the archaeologist's dig, and the dig turns up something the smith can forge.

### Kinds of quest

| Kind | Comes from | Scale | Example |
| --- | --- | --- | --- |
| **Leads** | Cases, expeditions, rumours, letters | One venture or expedition | A clue in a murder case points to a smugglers' cave |
| **Errands** | People who know you | An hour to a day | The miller's daughter asks you to carry a letter to Grell |
| **Friend stories** | Each named person's three-step story, as in Allora I | Weeks to seasons | Oru's grand-daughter's lost shadow |
| **Ambitions** | Each life's own goals, chosen by you | A lifetime | "Become Master of the Anvil", "Find my brother", "See the Ring" |
| **Story arcs** | Hand-written regional stories in several chapters | Seasons | The heir of the Aubry house and his debts, across the butler's career and beyond |
| **World events** | The calendar and the world | Days to a season | A plague in Tarsena, a Surge on the dike, a royal wedding needing everything at once |

### Ambitions

Each life holds one to three ambitions. They give a life direction and a reason to choose one thing over another:

- working towards an ambition lifts Spirits;
- fulfilling one writes a chapter of the Chronicle and earns a lasting trait;
- giving one up is allowed, and remembered.

### Templates and hand-written stories

Most cases and leads are generated from templates with roles (client, culprit, witness, rival), places, motives and constraints. Each template draws on the world's real people and places, so a generated case in Marre happens in Marre's streets, with Marre's people.

The best stories are hand-written: signature cases, legendary finds, friend stories and regional arcs. A content target is in Content pipeline.

### Within a static world

Quests change people's lives, a town's fortunes and a family's standing. They never change who rules or where the borders lie. The Lease, the Ring and the Hum are never resolved. A story can come close to a great secret, and the secret stays.

### The Journal

One Journal per life holds its open leads, cases, errands, ambitions and story arcs. A shared Codex holds everything any life has learned. Leads that one life finds can be **handed** to another, by letter, at real travel time.

### The Chronicle

The Chronicle is the game's long memory: a written history of each life and of your family of lives, made from what actually happened.

- Each season, every life gets a short paragraph. Each year gets a page, and each great deed a chapter.
- It is written from story beats the simulation records: a triumph, a disaster, a friend made or lost, a masterwork, a rank won.
- It can be read like a book, by life or by year.
- When a life is laid down, its last chapter is written, and that book is the reward of a lifetime. Lives you keep have open books that keep growing.

## Progression and scaling

Advancing in Allora II takes about ten times longer than in Allora I. A focused life reaches 50 in its main profession in roughly 55 hours of its own time, and 100 in roughly 400. Three mastery gates cannot be ground past: they must be earned.

[Diagram in the online bible: design targets · hours of a life's running time, one main profession]

These are targets for tuning, and the balance bot checks them in CI (see Testing and balance). Parallel lives mean several of these climbs run at once.

### Learning from the edge

Skills grow from checks, and how much a check teaches depends on how hard it was *for you*. Call the gap between the difficulty and your usual result (10 + your bonus) the **edge**:

| Edge | Feels like | Experience gained |
| --- | --- | --- |
| −10 or lower | Trivial for you | None |
| −5 | Comfortable | 25% |
| 0 | Right at your edge | 100% |
| +5 | A stretch | 125% |
| +10 or more | Beyond you | 50%: you learn something, but mostly that you are out of your depth |

**Failures still teach,** at half value. A disaster teaches a lesson worth remembering. This keeps lives looking for harder work instead of repeating safe work, and it makes cases and expeditions the main road to mastery.

**Experience per level** rises by about 4% each level. That gives the curve above, where most of the time goes into the last quarter.

### Mastery gates

Each gate caps a skill until it is passed. Experience gained past the cap is banked, up to one level's worth.

| Gate | Cap until passed | What it takes |
| --- | --- | --- |
| **Apprenticeship** | 10 | A teacher who accepts you: a master, a guild, a temple or a school |
| **The Journeyman trial** | 25 | A trial piece or trial case judged by your guild or employer |
| **The Master trial** | 50 | A masterpiece, or a great case, judged by peers. It can fail, and a failure waits a season |
| **The Grandmaster deed** | 75 | A legendary act in that profession, hand-written per profession. At most a few per life |

Gates make specialisation real. A life that passes the Master trial in two professions is remarkable. In three, it is the work of a lifetime.

### Skills: fewer and deeper

Allora I had hundreds of skills, many used by a single activity. Allora II has about seventy, each wide enough to matter in many professions. Techniques supply the specifics:

- a skill says how good you are;
- a technique says what you know how to do;
- an approach in a challenge often needs both.

The skills fall into eight groups: crafts, land and sea, body, mind, people, shadow, faith and magic. Magic keeps its disciplines and schools.

### Attributes

Five attributes, Might, Grace, Wits, Presence and Will, add +0 to +5 to related checks. They grow slowly from the work that uses them and shape a life's character. A smith grows mighty; a butler grows present.

### Gear and premises

Tools, workshops, offices and households add to checks, from −2 to +3, and decide which approaches exist at all. Upgrading them is a long-term goal for every profession, not only the crafts. A butler's "tools" are a trained staff and a well-kept house.

## Crafting and the item database

Every craftable item from level 1 to 100 lives in one data table, built from material tiers and item families and priced by a single formula. Validation scripts prove the table is balanced on every build. Nothing is hand-priced, and no item exists without a use.

### Material tiers

Ten tiers, each spanning about ten levels. Every material line has one material per tier:

| Tier | Levels | Metal | Wood | Cloth and fibre | Stone and clay | Hide | Gem |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1–10 | Bog iron | Pine | Rough wool | Common clay | Rawhide | River agate |
| 2 | 10–20 | Iron | Ash | Linen | Fieldstone | Cowhide | Jasper |
| 3 | 20–30 | Good iron | Oak | Fine wool | Limestone | Deerskin | Amethyst |
| 4 | 30–40 | Steel | Yew | Dyed cloth | Marble | Boar-hide | Garnet |
| 5 | 40–50 | Silver steel | Cedar of Qoul | Silk | Granite | Wolf-pelt | Topaz |
| 6 | 50–60 | Sillenian steel | Ebony | Brocade | Basalt | Bear-hide | Emerald |
| 7 | 60–70 | Gramannan bell-bronze | Raizon ironwood | Mirror-silk of Marre | Hum-stone | Wyvern-hide | Ruby |
| 8 | 70–80 | Dark steel | Glass-tree | Fae-woven cloth | Star-lapis | Dragon-lizard hide | Sapphire |
| 9 | 80–90 | Sky-iron | Ring-wood (from the islands) | Spirit-linen | Singing coral | Leviathan skin | Star-sapphire |
| 10 | 90–100 | Star-metal | The heartwood of a Wildwood | Thread from the Glimmering Court | Living basalt | Hide of a named beast | A named stone |

Names are placeholders, to be finalised against the lore.

**Materials have character as well as a tier.** Each lot carries properties:

- *purity:* poor to excellent;
- *flaws:* brittle, knotted, uneven;
- *virtues:* fine grain, sea-tempered, blessed.

They come from where and when the material was gathered: herbs picked at dawn in spring, timber felled in winter, ore from a particular seam. Knowing your sources is part of mastery.

### Item families

An **item family** is one kind of thing made across all ten tiers: blades, hinges, loaves, gowns, tinctures, chairs, lenses, bindings. Each family has one row per tier, with its own hand-written name, description and uses.

- **Target:** about 70 families × 10 tiers = 700 finished items, plus about 250 materials and 150 intermediates (billets, planks, dyes, dough). That is roughly 1,100 craftable entries.
- **Every profession has families:** the cook's dishes, the physician's remedies, the scribe's books, the gardener's plants, the bard's commissioned songs, the butler's banquets.

### Quality, properties and names

| Grade | Comes from | Value × |
| --- | --- | --- |
| Crude | Failures along the way | 0.5 |
| Common | Mostly successes | 1.0 |
| Good | All successes | 1.3 |
| Fine | Some triumphs | 1.7 |
| Superior | Mostly triumphs, with good materials | 2.3 |
| Masterwork | Triumph on the key step, excellent materials, the right technique | 3.5, plus a name |

Items also carry **properties** chosen during the work, such as keen, tough, light, balanced or beautiful, and **flaws** from costs and failures. Properties matter: a commission may ask for *light*, and a hunter wants *tough*. Masterworks get a name and a maker's mark, and they enter the Chronicle.

### The value formula

Value = (cost of materials + hours of work × the tier's labour rate) × quality multiplier × regional demand.

```latex
V = \left( \sum_i m_i + h \cdot w_t \right) \cdot q \cdot d_r
```

The labour rate wₜ rises by about 30% per tier, and hours per item by about 12% per tier. A tier-10 piece is worth roughly 30 times its tier-1 counterpart, and earnings per hour of a life's time rise about tenfold from tier 1 to tier 10, smoothly, with no cliffs.

### What each entry records

| Field | Meaning |
| --- | --- |
| id, name, description | Stable identity and the words on screen |
| family, tier, level | Where it sits in the table |
| profession and skill | Who makes it, and which check |
| techniques | Required, or helpful |
| inputs | Materials and intermediates, by family and tier |
| tools and premises | What is needed, and what helps |
| steps | The venture template: steps, approaches, difficulties, choices |
| time | Hours of work |
| value and weight | From the formula; weight matters for travel |
| properties | Which can be chosen, and how |
| uses | Where it goes: commissions, recipes, gear, gifts, offerings, trade |
| tastes | Regions, people and gods who especially want it |

### Validation (on every build)

The build fails if any of these rules breaks:

- every material and intermediate has at least one use, and every finished item at least two uses (sold, gifted, offered, worn, commissioned);
- every level band of every profession offers things to make and someone to sell them to;
- profit per hour rises with level, with no step between bands more than 20% out of line;
- no recipe loop produces more value than it consumes;
- each tier's materials can actually be gathered or bought somewhere in that tier's lands;
- every entry has a description written to the lore rules (checked by the lore lint).

## The economy

Every town has a market with its own stock and prices, which move with supply, demand, season and events. Money flows in through work and out through living, tools, travel and patronage. The economy is simulated coarsely, by place and goods, never person by person, so it stays fast and readable.

### Markets and prices

- **Price = value × demand.** The demand factor runs from 0.6 to 1.6. It depends on local stock compared to local need, on the region's tastes, on the season, and on events: a festival, a blight, a plague.
- **Selling moves the price.** Ten swords in one village drops the price there. The answer is another market, which is what travel is for.
- **Production is simulated by place.** Each place has a working population by trade: so many farmers, so many smiths. They produce and consume each day, so prices settle without the player.
- **Information has a distance.** You see prices where you are. Elsewhere, you see what letters, merchants and your other lives last told you, with a date. A merchant's network of correspondents is a real asset.

### One currency

The pf, as in Allora I, works everywhere. Money belongs to a life. It moves between lives by courier (days, and robbable) or by a letter of credit through a bank (a fee, and safe).

### Where money goes

There are deliberate sinks at every stage of a life:

| Stage | Sinks |
| --- | --- |
| Early | Food and lodging, simple tools, a teacher's fee |
| Middle | Rent or a house, tool upkeep, materials, guild dues, travel fares and tolls, wages for a hireling |
| Late | Premises and their upkeep, staff, rare materials, ventures, taxes on holdings |
| Always | Gifts to friends, offerings and tithes, fines, healing |
| Patronage | Endowing a temple, sponsoring a school or a scholar, founding a workshop, paying for a festival. The richest sinks, which turn money into standing, faith and lasting marks on the world |

### Income targets

| Stage | A life's income should... |
| --- | --- |
| Novice | Cover modest living, with a little left for tools |
| Journeyman | Cover good living plus savings of about a quarter |
| Master | Afford premises, staff and rare materials, and fund other lives' ventures |
| Grandmaster | Pay for patronage on a scale that changes a town |

### Homes and premises

Lives rent before they own. A room at an inn, a rented cottage, a house, then a workshop, a shop or a manor wing: each has upkeep, adds comfort (Spirits), and adds bonuses to its profession's work. Lives can share homes.

**Guarding the balance.** The simulation bot tracks total money over ten game-years. CI flags inflation, runaway profits on any route or recipe, and lives that cannot afford their own level.

## Magic in Allora II

Magic keeps Allora I's structure:

- **disciplines** are plain skills;
- **schools** are the arts that peoples and orders make of them;
- **features are rare**, so no two schools feel alike.

What changes is what magic *does*. In Allora II a working is most often a new way through a challenge, a verb no one else has, or a ritual that is itself an expedition. It is rarely a percentage.

### What a working can be

| Kind | What it does | Share of workings | Example |
| --- | --- | --- | --- |
| **Approach** | Adds an option to challenges, using the school's level as the bonus | Most | Speak the ward-word at the sealed door; read the scene of a theft by Divination; calm a frightened horse with Charms |
| **Verb** | Does something nothing else can | Many | Find a hidden place; speak with the dead; call a Weather; send a message by dream |
| **Ritual** | A multi-step venture of its own, often tied to time and place | Some | Bind a spirit at Old Vaelis in a conjunction; plant a working in the Wake-Fields; raise an islet |
| **Blessing** | A lasting effect, usually an advantage on a kind of check for a while | Few | A charm against fever for a season; a Lattice-sung house |

### Costs and risks

- **Will** refills over days, not hours. A life casts a few workings a day, so each cast is chosen.
- **Reagents and foci** follow each school's own features from Allora I's design: quintessence ink, sealing-salt, a wisp-lantern, shade-paint, a shell instrument.
- **Every working is a check.** The degrees of result apply, and each school has its own **misfire** for a Disaster: a scorch, a lost face, a wild spirit, a cracked tablet, a Gentry price.
- **Law and notoriety.** Some arts are illegal in some realms, and being seen has consequences. As always, the player can never learn witch magic.

### Learning magic

Each school's learning mode becomes a journey:

| Mode | As an expedition or relationship | Schools |
| --- | --- | --- |
| Taught | A teacher who must accept you, and lessons that take seasons | Most |
| Found | A grimoire, a page, a codex: an arcane search expedition | Grave-Lore, the Magister's books (Polygoetia) |
| Granted | Service to an order: watches, terms, rank | The Rime-Watch, the Collegium |
| Grown | A working planted and tended over a season | The Long Wake, Coral-Song |
| Hunted | Learned in the field, at night, with an elder | The Shade-Walk |
| Bargained | A price paid to something that is not human | Hill-Bargaining, Revel-Craft |
| Earned in kind | Performance, voyages or flights | The Lamp-Plays, Wayfinding, Sky-Sailing |

**Mastery gates apply to schools too.** A life seriously follows one or two schools, perhaps three in a long life.

### Magic in every profession

| Profession | A school that serves it | How |
| --- | --- | --- |
| Butler | The Silvered Masque (Illusion) | Hide a stain, a bruise, a guest's mistake, for one evening |
| Cerdan inquirer | The Starward Reckoning (Divination) | Read a scene, a liar's stars, or an illusion in the Mirror-Room's glass |
| Smith | Stave-Craft (Rune Magic) | Cut runes into a blade; a masterwork that remembers |
| Physician | The Hedge-Arts, or Restoration | Charms against fever, a mending working |
| Farmer | The Green Way, the Long Wake | Out-of-season growth, a turned blight |
| Sailor | The Tempest Callers, Wayfinding | Call a calm, find an island |
| Scholar | Name-Binding, the Tablets of the Sky | Bind a word, fire a star's name into clay |
| Spy | The Hush, the Shade-Walk | Be forgotten, be unseen |

### The schools, by land

About forty schools in total, carried over from Allora I and Polygoetia:

| Land | Schools | Levels |
| --- | --- | --- |
| The Seven | Sixteen, from the Hedge-Arts to the Rime-Watch | 1–60 |
| Gallar | Five, including Pyromancy, the Crucible and the Long Wake | 20–70 |
| Qoul | Four, including Geomancy, Name-Binding and Blood Magic | 40–80 |
| Thoolma | Five, including Corner-Work, Facetcraft and the Burned Verse | 60–90 |
| Polygoetia | Twelve, including the Fourfold Art, the Tempest Callers and the Whale-Mandala | 75–100 |

A school can be practised anywhere once learned, but each is deepest in its own land, where its teachers, reagents and places of power are.

### Time, sky and place matter more

With a slower calendar, magical timing becomes real planning:

- the moon and the sky's Houses and Wanderers;
- the Hum in the East and the Weathers in Polygoetia;
- the Count of the Four;
- the seasons.

Waiting for a conjunction is a plan, and travelling to a place of power is a journey.

## Faith in Allora II

Faith is a lifelong relationship between a life and a god, lived through the calendar, the body and the community. Allora I's toolkit carries over, with each faith using only a few of its parts:

- obligations, with Lapse and excommunication;
- cultivation tracks;
- taboos and relics;
- duties and pilgrimages;
- ranks.

What changes is that faith now reaches into every check, every season and every profession.

### Faith in challenges

| Mechanism | What it does | Example |
| --- | --- | --- |
| **Blessing** | Advantage on checks in the god's domain for a while, earned by devotion | Mother Vass's blessing on a sea-crossing; Gruma's on a funeral |
| **Taboo** | Disadvantage, or a closed approach, while broken | A follower of Seronia cannot use the Long Wake; a Dellian cannot take a necromantic approach |
| **Prayer** | An approach in some checks: ask for help, at a price in devotion or a vow | A healer prays over a patient; a sailor prays in the Ring |
| **Omens** | Colour and atmosphere, never hints about play | Only Nim's foretelling dreams break this rule, as in Allora I |

### The calendar of the gods

- **Feasts and fasts are real days.** Each faith has its holy days, and with 28-day seasons, they come round slowly enough to plan for.
- **Great festivals are world events** that everyone can join: the Longest Night, the New Fire, the Great Wake, Pecutto's carts. They bring special activities, markets and cases.
- **Some calendars are whole systems,** like the Four's Count in Plandor: market closures, the Maw's days, Corner-Work's rhythms.

### Pilgrimage

A pilgrimage is an expedition along a faith's sacred road. It takes days or weeks, with shrines to stop at and rites at each. It ends in a blessing, a relic, or a vow fulfilled.

### The religious life as a profession

| Post | Duties | Cases | Ladder |
| --- | --- | --- | --- |
| A parish or temple (Priest) | Rites, the sick, the dying, the feasts | A confession with a dangerous secret; a dispute between families; a crisis of faith; a possession; a heresy | Acolyte, priest, elder, high priest |
| A monastery or hermitage (Monk and mystic) | Prayer, labour, silence | A vision; a pilgrim in trouble; a test of the vow | Novice, brother or sister, elder, abbot |
| A shrine-keeping (School-faiths, island faiths) | The shrine's own rites | The god's own | The faith's own ranks |

Ordination and vows are **mastery gates** for the faith's own ladder.

### Faith and community

- Shrines and temples are places with life: congregations, gossip, charity, rivalries.
- **Endowing** a shrine, a temple or a festival is the richest sink in the economy. It raises the faith's presence in a town, and it is remembered in the Chronicle.
- A faith's presence affects what is easy and accepted in a place. Dellian towns frown on necromancy; Grell honours its dead.

### Faith across parallel lives

Lives may follow different gods. That brings friction, such as a Seronian scholar and a Long Wake farmer under one roof, and also opportunity: one life's temple can shelter another life's patient. Conversion is possible, and it is a heavy, remembered choice.

### The gods stay gods

The gods never appear in person, and no story settles what they really are. Some faiths' claims contradict each other, and the game never says who is right.

## People

The world is full of people who live whether or not you are watching. They work, travel, marry, age and remember. Named people are simulated one by one; the crowds behind them are simulated as populations. Friendship is one of the game's main rewards, and every profession runs on relationships.

### Two kinds of people

| Kind | Count (target) | What is simulated |
| --- | --- | --- |
| **Named people** | \~1,500, of whom \~300 have hand-written stories | Home, job, schedule, family, age, traits, tastes, relationships with each other, memories of your lives |
| **Townsfolk** | The rest, as numbers per place and trade | Production, consumption, mood, rumour, demand for services |

Named people come in two kinds:

- **Story people** are hand-written, with Allora I's three-step friend stories as the model.
- **Generated people** are built from templates by culture and trade: names, looks and tastes drawn from their land's rules, so a Tuneri caravaneer and a Grell mourner feel like where they are from.

### Relationships

Each relationship tracks three measures:

- **Warmth:** whether they like you.
- **Regard:** whether they respect you.
- **Trust:** whether they will tell you things or rely on you.

A butler needs the lord's Trust, a bard needs the hall's Warmth, and a Cerdan inquirer needs a witness's Trust before Warmth. Relationships grow through:

- **time spent together,** at work, at meals, on the road;
- **conversations,** small social checks with topics that people care about;
- **gifts,** guided by tastes you have to discover;
- **help,** in their troubles and their stories;
- **memories:** people remember what your lives did, good and bad, and talk about it.

### Friend stories

Every story person has a three-step story, as in Allora I: who they are, a trouble they bring you, and how it ends. In Allora II, each step can be a venture or a case, and many involve more than one of your lives.

### Romance and family

- Romance is between adults only, and it is slow, built on all three measures.
- Marriage brings a shared home, shared Spirits, and family obligations.
- Children grow up in the world's time. Your own lives do not age, but the people around them do.
- Other people marry, have families and grow old as well. The world turns over quietly while its rulers stay.

### Companions

Hirelings, friends and your other lives can join a venture or an expedition. Each brings skills (help on checks), opinions (they may refuse a reckless choice), and loyalty that grows or breaks with what happens to them. A companion can be hurt, and remembers who led them into it.

### Rivals

Every profession has rivals: a smith across the square, another inquirer who wants your cases, a captain who wants your route. Rivals compete for the same commissions and standing, and some can become friends.

## Art direction

Allora II replaces icons with a living, illustrated world:

- layered scenes that change with the hour, season and weather;
- a painted map you travel across;
- a face for every named person;
- illustrated items.

The art is simple and consistent rather than detailed, so it can cover a thousand places on a phone.

### The style

- **One style for everything:** a flat, painted storybook look, like gouache or a hand-coloured woodcut, with soft shapes, few outlines and textured fills. It should read well small, and scale to a tablet.
- **A palette per land,** so you always know where you are:
  - the Seven: green, slate and brick;
  - Gallar: peat, straw and grey sky;
  - Qoul: ochre, lapis and clay;
  - Thoolma: purple, jade and lacquer;
  - Polygoetia: turquoise, coral and storm-grey.
- **A written style guide and a reference sheet in the repo,** checked for every new asset.

### Scenes

Every place has a scene composed from layers:

| Layer | Contents | Changes with |
| --- | --- | --- |
| Sky | Gradient, sun or moon, stars, the Wanderers | Hour, weather, the sky's Houses |
| Far | Hills, sea, city skyline | Season (snow, green, gold) |
| Middle | Buildings and landmarks from the land's kit | Lamps lit at dusk, smoke from chimneys |
| Near | Trees, stalls, boats, walls | Season, events (festival bunting) |
| Figures | Silhouettes of the people actually there | Who is present, by the simulation |
| Weather | Rain, snow, fog, the Hum's shimmer, the Weathers | Today's weather |

**Scenes are assembled from kits, not drawn one by one.** Each land has a kit of buildings, terrain, trees and props. A scene is a small data file saying which parts sit where. About 600 parts, reused, cover about a thousand places, and each place still gets one signature piece of its own.

**Ambient life** is small and constant: smoke drifting, water moving, a boat crossing, birds at dawn, lamps lighting one by one at dusk.

### The map

- A painted map with three zoom levels: the world (five lands), a land (its realms), and a realm (its places, roads and wilds).
- Roads, rivers and sea lanes are drawn, and fog covers the unexplored.
- Each life's marker travels along the road in real time, so you can see your caravan in the hills.

### Portraits

- Every named person has a portrait assembled from layered parts: face, skin, eyes, hair, age marks, clothes by culture and trade, and an accessory.
- Each portrait is generated deterministically from the person's id, so it never changes, and hand-written story people get chosen combinations.
- Four expressions (calm, glad, troubled, angry) appear in conversations and reports.

### Items

Every craftable entry, about 1,100, has a small illustration in the same style. Quality shows as a subtle frame. Masterworks get their own drawn piece.

### Making the art

- **Game-art generation with a fixed style preset:** SpriteCook is available as a plugin in Claude sessions. One preset per category (scene parts, portrait parts, items) keeps the style consistent.
- **Every asset goes through review** against the style guide before it enters the repo. An asset manifest records each file's source, prompt and approval.
- **Rough budget:** about 600 scene parts, 800 portrait parts, 1,100 item pieces, map art for five lands, and around 40 hand-drawn signature pieces for the greatest places.

### Performance and access

- Sprite atlases in WebP, loaded per land, with the scene renderer on canvas.
- A target of 60 frames a second on a mid-range phone, and a calm mode with ambient motion reduced.
- Text never sits on art without contrast; every scene has a text description for screen readers.

## Screens and interface

The interface is phone-first, in portrait, and built around three things: the **Lives strip** at the top, the **scene** of where the current life stands, and an **inbox** of decisions waiting. Everything else is one tap away, and the words on screen stay few.

### The frame

- **Lives strip:** a portrait per life, with a small state badge (working, travelling, resting, waiting for you). Tap one to switch lives.
- **Inbox:** the weighty decisions, from every life, in one list. Most visits start here.
- **Bottom bar:** Here, Map, Career, Journal, Life, and More (Codex, Chronicle, Settings).

### Screens

| Screen | Shows | You do |
| --- | --- | --- |
| **Coming back** | A short report per life since your last visit: what happened, what was made and earned, who was met, what waits | Read it, then go to the inbox |
| **Here** | The scene, the sub-places, the people present, what can be done here and now | Choose an activity, talk, trade, or set standing orders |
| **Map** | The painted map at three zooms, roads and wilds, where your lives are | Plan a journey: route, mode, company, provisions |
| **Career** | The Career page (see Professions) | Manage duties, cases, techniques and the ladder |
| **Challenge** | One step at a time: the situation, approach cards with odds in words, your preparation, the roll, the result | Choose, roll, decide to press on or stop |
| **Journal** | Leads, cases, errands, ambitions, story arcs, and the records (Bestiary, Collection, Atlas and the rest) | Follow up, hand a lead to another life |
| **Life** | Skills, techniques, attributes, needs, gear, faith and magic | Check the life's state, learn and equip |
| **People** | Everyone this life knows, with faces, the three measures, tastes known, memories | Visit, write, give gifts |
| **Workshop and pack** | Materials and items, with properties and quality | Craft, sort, send a parcel |
| **Market** | Local stock and prices, and the last known prices elsewhere, with their dates | Buy and sell |
| **Chronicle** | The written history, by life and by year | Read it |
| **Codex** | Everything learned: places, people, lore, rules of the world | Look things up; the codex explains the systems |

### Interface rules

- **Few words on screens.** A line, not a paragraph. Explanation lives in the codex, one tap away.
- **Words first, numbers on tap:** odds as "Risky", prices as "dear", skill as a rank name, each with the number available underneath.
- **No interrupting pop-ups and no level-up cards.** Progress shows quietly in place, and the Chronicle marks the big moments.
- **One card pattern everywhere:** an activity, a case, a lead and a person all share one shape. A small picture, a title, a line, and a state.
- **The scene is the home screen.** The world is the interface, not a backdrop to menus.
- **Accessibility:** scalable text, contrast checked on every palette, reduced motion, full screen-reader labels.

## Technical foundation

Allora II is a TypeScript web app, built with Vite and hosted on GitHub Pages as an installable, offline-capable game. Content is data checked by schemas. A deterministic simulation engine runs in a background worker, separate from the screens.

[Diagram in the online bible: architecture · seven parts]

The engine never touches the screen, and the screen never changes the world directly: it sends orders and draws the state it receives.

### The stack

| Part | Choice | Why |
| --- | --- | --- |
| Language | TypeScript, strict mode | Types catch most mistakes before play, and Claude Code works well with them |
| Build | Vite, in a pnpm workspace | Fast builds, simple setup, one repo with several packages |
| Interface | React with a small state store | Familiar, well supported, easy for any session to work in |
| Scenes and map | PixiJS on canvas | Layered 2D scenes and a zoomable map at 60 fps on phones |
| Engine | Plain TypeScript in a Web Worker | The simulation never blocks the screen, and the same code runs in tests |
| Data | YAML files checked by zod schemas | Human-readable content that the build can prove valid |
| Saves | IndexedDB, with export and import | Large saves, safe locally, portable between devices |
| Install | PWA (service worker, manifest) | Works offline and installs like an app |
| Hosting | GitHub Pages through GitHub Actions | Every green build on the main branch deploys itself |
| Tests | Vitest, a balance bot, Playwright | Rules, numbers and screens all checked on every change |

### Packages in the repo

| Package | Holds |
| --- | --- |
| `engine` | The simulation: time, needs, schedules, activities, challenges, economy, people, faith, magic, events, the Chronicle |
| `content` | All world data: places, people, skills, items, professions, cases, schools, faiths, and their schemas |
| `ui` | Screens and components |
| `render` | The scene composer, the map, portraits |
| `tools` | The Allora I extractor, validators, the lore lint, the balance bot, the codex generator, the asset manifest |

### The engine

- **One tick is one game hour.** Each system runs in a declared order every tick: time, needs, schedules, activities, challenges, economy, people, faith, magic, events, Chronicle.
- **Deterministic:** a seeded random-number generator with separate streams per life and for the world. The same save and the same seed always give the same story, so bugs can be replayed exactly.
- **No function-wrapping.** Systems talk through a typed event bus (`ActivityCompleted`, `CheckResolved`, `DayBegan`) and declared hook points with explicit priorities.
- **Modifiers are data.** Every bonus is a record with a source, a target, a value and a condition, gathered by one function. You can always ask "why is this +4?" and get a list of sources.
- **Two fidelities.** Named people and your lives are simulated in full; populations and markets are simulated coarsely per place and per day.
- **Catching up.** Time away is simulated in fast batches. The target is one game year for six lives in under ten seconds on a phone, with weighty decisions queued in the inbox.

### Saves

- **Versioned from day one.** Every save carries a schema version, and a migrations folder upgrades old saves step by step. There is a test for every migration.
- **Autosave** every game day and on leaving the page. The last few saves are kept.
- **Export and import** as a file, so a game can move between devices. Cloud sync can come later as an option.

## Content pipeline

All of Allora II's world lives in data files, never in code:

- places and people;
- skills and techniques;
- items and professions;
- cases and expeditions;
- schools and faiths;
- events and scenes.

Each kind has a schema, every reference is checked, and every word passes a lore lint. Content can then grow by the thousand without the code growing with it.

### Layout

```
content/
  world/       lands, realms, places, roads, wilds
  people/      named people by land; templates by culture and trade
  skills/      skills, techniques, attributes
  items/       materials, intermediates, families (one file per family)
  professions/ one folder per profession: post types, duties, case templates, ladder, signature cases
  expeditions/ templates, legendary finds, records
  magic/       disciplines, schools, workings
  faith/       gods, ways, rites, festivals, pilgrimages
  events/      the calendar, world events
  scenes/      scene compositions by place
  text/        codex entries, Chronicle phrasing
```

### Rules for data

- **Stable ids:** lowercase with underscores, prefixed by kind (`place_ostwick_market`, `item_blade_t4`). An id never changes once released. Saves depend on it.
- **Every reference is checked.** A case naming a place, a recipe naming a material, a person naming a home: all must exist, or the build fails.
- **Words live beside data, ready for translation:** names, descriptions and lines are kept in fields that can later move to language files.
- **Numbers come from formulas** where a formula exists. Values, times and difficulties are computed by tools from tier and level, not typed by hand, unless a field is explicitly marked as an override.

### Porting Allora I

A one-time extractor loads Allora I's built game in Node and writes its content as draft YAML:

- places and sub-places;
- people and their three-step stories;
- items and recipes;
- skills;
- schools and workings;
- faiths and their ways;
- lore and codex text.

Everything comes in marked **draft**. Each piece is then reviewed against Allora II's systems: places split into smaller places, skills merged into the smaller set, items mapped to families and tiers. The world, its people and its writing carry over; its numbers do not.

### The lore lint

Every text field is checked on every build for:

- **banned words:** real-world historical and cultural terms, kept in a maintained list; and canon: nothing contradicts or renames canon, and every new entry names the canon it grows from;
- **world rules:** no text offering witch magic to the player, no resolution of the Lease, the Ring or the Hum, no romance involving anyone under adult age;
- **voice:** sentence length, no interface jargon in the world's words, no emoji in game text;
- **placeholders:** any "TODO" or "lorem" left in.

### Content targets for the full game

| Content | Target | Notes |
| --- | --- | --- |
| Places | \~1,100 | Built from scene kits; about 60 have signature art |
| Named people | \~1,500 | \~300 with hand-written stories |
| Craftable entries | \~1,100 | Materials, intermediates and finished items |
| Professions | 42, plus school callings | Each with 8+ case templates and 2+ signature cases |
| Expedition finds | \~400 | \~60 legendary, hand-written |
| Schools of magic | \~42 | 8–12 workings each |
| Faiths | \~45 | From Allora I and Polygoetia |
| Story arcs | \~30 | Regional, several chapters each |
| Codex entries | Generated from data, plus \~500 hand-written lore entries |  |

**The codex is generated.** Entries for places, people, items, professions, schools and faiths are built from the data at build time, so they can never fall out of step with the game.

## Testing and balance

A world this large cannot be balanced by playing it. Allora II is balanced by **machines that play it for years**, and by tests that refuse bad content before it is merged.

| Layer | What it checks | When it runs |
| --- | --- | --- |
| **Schema tests** | Every YAML file parses against its zod schema; every id it names exists | Every commit |
| **Unit tests** (Vitest) | Checks and degrees, the value formula, the XP curve, travel times, needs, Tapestry costs | Every commit |
| **Content lint** | Every recipe is craftable and every item has a use; every place is reachable; every post has a ladder of four ranks; every case can be solved | Every commit |
| **Lore lint** | Banned words (real-world history, "level up", modern terms); witch magic never learnable; no hints from augury except Nim's dreams; adults only in romance | Every commit |
| **Balance bot** | Simulated lives play ten game-years each with simple strategies, headless and at full speed | Every pull request |
| **Save tests** | Every past save version loads and migrates cleanly | Every pull request |
| **Screenshot tests** (Playwright) | Key screens at phone and desktop width, light and dark | Every pull request |
| **Performance budget** | One game-day simulates in under 20 ms; the map draws at 60 fps on a mid-range phone; first load under 3 MB | Every pull request |

### The balance bot

The bot runs **personas**: a careful crafter, a reckless adventurer, a court climber, a merchant, a scholar-mage, and an idler who sets standing orders and comes back weekly. Each runs about 200 lives with different seeds. The report on each pull request shows:

- **hours to level** for every skill against the target curve in Progression (red if more than 15% off);
- **earnings per hour** for every trade and post at each tier (red if any is 25% above the median for its tier);
- **money supply** over ten years (red if it grows faster than 3% a year);
- **check odds** that players actually face, by tier (red if most checks are trivial or hopeless);
- **dead content**: places nobody visits, items nobody makes, cases nobody finishes;
- **Legend pace**: real hours to each Tapestry slot.

A balance change ships only with its report. The report is the argument.

### Playtests

Machines find numbers; people find boredom. Each phase ends with a short playtest of a new player, a returning Allora I player and an idler. Each tester keeps a notes file: where they were lost, bored, or delighted.

## Building it with Claude Code

Allora II is built by Claude Code in a GitHub repository, with you as director and reviewer. This section is the plan to post with the repository, in three parts:

- **the canon system**, which keeps the world Allora's;
- **the starter kit**, the files the repository starts with;
- **the work plan**, from the first session to the end of Phase 0.

### Canon: the base everything grows from

**Canon sources, in order of authority:**

1. **Allora I**, the built game at v83: its places, people, groups, faiths, schools, items, ranks and text.
2. **The Polygoetia reference**: the fifth land's peoples, places, faiths and schools.
3. **The magic design notes** (`magic_design.md`).
4. **This bible**, for systems and for anything the first three do not cover.

Where two sources disagree, the higher one wins, and the disagreement is logged in `docs/lore/conflicts.md` for you to rule on.

**Canon is the base, not the limit.** Most of Allora II's \~1,100 places and \~1,500 people will be new. Every addition must:

- **grow from canon:** each new entry has a `roots` field naming the canon entries it belongs to (a new tavern's realm and town; a new guild's city and trade; a new saint's faith);
- **carry its land's flavour:** names and customs follow the culture guide for that land, which is written from canon's own names and texts;
- **never contradict:** no canon person dies or changes allegiance, no canon place moves, and no new history overwrites an old one.

**How it is kept, in the repository:**

| Where | What | Rule |
| --- | --- | --- |
| `canon/` | The raw sources: Allora I's HTML, the Polygoetia and magic documents | Never edited. Changes only by your hand |
| `content/canon/` | Canon extracted into YAML, keeping Allora I's own ids, every entry marked `origin: allora1` or `origin: polygoetia` | Changed only by re-running the extractor, or in a pull request labelled `canon-change` |
| `content/` (elsewhere) | Everything new, marked `origin: allora2` with `roots` | Must pass the canon lint |
| `docs/lore/cultures/` | One culture guide per land and realm: naming sounds, titles, food, dress, oaths, what people believe | Written from canon in Phase 0, approved by you |
| `docs/lore/additions.md` | A generated ledger of every addition and its roots | Lets you see what the world has gained, land by land |

**The canon lint** runs on every change. It fails the build if:

- an addition has no `roots`, or a root that does not exist;
- a new name duplicates or nearly duplicates a canon name;
- a canon entry's name, place, allegiance or story was changed outside a `canon-change` pull request;
- any world rule from Principles is broken.

### The starter kit

Put these in a new repository before the first session:

| Path | What it is | Where it comes from |
| --- | --- | --- |
| `canon/allora-1.html` | The complete Allora I game at v83 | The starter kit download |
| `canon/polygoetia.md` | The Polygoetia reference | The starter kit download |
| `canon/magic_design.md` | Your magic design notes | Your own copy of the file |
| `docs/design-bible.md` | This bible | The starter kit download; re-export after big changes |
| `CLAUDE.md` | Standing orders for every session | The starter kit download |
| `docs/KICKOFF.md` | The first prompt | The starter kit download |
| `docs/phase-0.md` | Phase 0's goals and issue list | The starter kit download |
| `.claude/commands/` | The custom commands | The starter kit download |

### CLAUDE.md

The root `CLAUDE.md` is short and strict. It holds:

- **the canon rule** and the order of authority, word for word;
- **the world rules** from Principles, word for word;
- **the architecture** in one paragraph: engine in a worker, content in YAML, UI in React and PixiJS, no game logic in the UI;
- **the commands**: `pnpm dev`, `pnpm test`, `pnpm lint:content`, `pnpm balance`;
- **the house style** for game text: short, concrete, in-world, no explaining in UI text (the codex explains);
- **where the design lives**: `docs/design-bible.md`, and the current `docs/phase-N.md`.

Each big folder (`/engine`, `/content`, `/ui`) later gets its own small `CLAUDE.md` with local rules.

### The first session

Open Claude Code in the repository and paste the prompt in `docs/KICKOFF.md`:

> Read CLAUDE.md, then docs/design-bible.md (Principles, Technical foundation, Content pipeline and Building it with Claude Code), then docs/phase-0.md. Turn every Phase 0 item into a GitHub issue with a clear done-check. Then start on issue 1. Work one issue at a time: a branch, the work, tests, and a pull request saying what changed and what you could not decide. Never edit canon/. When canon is silent, add to it with roots; when you are unsure whether something contradicts canon, stop and ask.

### Phase 0, issue by issue

1. **Scaffold.** A pnpm workspace with TypeScript, Vite, React, Vitest and lint; GitHub Actions for tests; GitHub Pages deploying a blank page.
2. **Allora I extractor.** Load `canon/allora-1.html` in headless Chromium (Playwright), read the game's data tables, and write them to `content/canon/allora1/` as YAML with their original ids. Print counts by kind and compare them with the game's own totals.
3. **Polygoetia importer.** Turn `canon/polygoetia.md` into `content/canon/polygoetia/` entries: peoples, places, faiths and schools.
4. **Schemas.** zod schemas for place, person, group, faith, school, item and post, all with `origin` and `roots`.
5. **Canon index and lint.** A name index across all canon; the canon lint and lore lint above; the `additions.md` ledger.
6. **Culture guides.** One draft guide per land and realm, quoting canon names and texts as evidence. You approve each one.
7. **Engine skeleton.** A Web Worker with the clock (1 real minute = 1 game hour), the calendar, and saves in IndexedDB with versioned migrations.
8. **Map stub.** A PixiJS map of Eintenn and Marre drawn from canon places, with roads and travel times.
9. **Balance bot harness.** A headless runner that steps the engine for a game-year and posts an empty report on pull requests.
10. **Gate review.** One game-day simulates in budget; the extracted canon lints clean; you have read and approved the culture guides.

### Custom commands

| Command | What it does |
| --- | --- |
| `/canon` | Looks up everything canon says about a name, place or group, with sources |
| `/add-place` | A new place: land, kind, roots, people, purpose and art brief, checked against the culture guide |
| `/add-group` | A new guild, house, order or band, rooted in a canon city, faith or trade |
| `/add-post` | A local post on a trade: name, people, cases, ladder of four ranks, techniques, look |
| `/add-npc` | A person with role, faith, wants, a three-step story and roots |
| `/add-item-family` | A family of items across tiers, priced by the value formula, with recipes and uses |
| `/add-case` | A case for a post: setup, clues, checks, endings and what each ending changes |
| `/lore-check` | Reads a change against canon and the culture guides, and lists anything that conflicts |
| `/balance-report` | Runs the balance bot and summarises what moved |

### The work queue

- **GitHub Issues are the queue.** Each issue is one small, testable piece: "Add the Lazaretto post", "Mirror-Room scrying venture". Labels mark phase, land, system and `canon-change`.
- **One issue, one branch, one pull request.** Each pull request carries its balance report, its screenshots, and the new lines of the additions ledger.
- **The Claude GitHub Action reviews every pull request** against CLAUDE.md, canon and the bible section it touches.
- **You approve.** Nothing reaches `main` without you. GitHub Pages deploys `main` automatically.

### Keeping sessions sharp

- Small modules, under about 400 lines, so a session can hold one whole system.
- Content in batches of about 20 entries, linted, then reviewed. Never 500 places in one go.
- Each phase gets a `docs/phase-N.md` with goals, a done-list and decisions, so a fresh session can pick up exactly where the last one stopped.
- After each phase, re-export this bible into `docs/design-bible.md`, so the repository and the bible never drift apart.

## Roadmap

The build goes **narrow and deep first, then wide**. One small corner of the world is made completely, with every system in it, before a second land is touched.

[Diagram in the online bible: roadmap · 7 phases, each with a gate]

Phase 1 is the one that matters. If a smith, a butler and a Cerdan inquirer are not each worth playing in Eintenn and Marre, more places will not save them. Phases have no dates: each ends when its gate is passed, not when a calendar says so.

- **Phases 0 to 2** build every system on a small map.
- **Phases 3 to 5** are mostly content, made with the custom commands and checked by the lints and the bot.
- **Phase 6** makes it feel finished.

The game can be public from Phase 3. Later lands arrive as updates, each opened in the world as a new sea route.

## Open questions

These are the decisions this bible leaves to you. Each has a leaning, so work can start before it is settled.

| Question | Options | Leaning | Settle by |
| --- | --- | --- | --- |
| **Is laying a life down ever worth it?** | Never needed; small Legend bonus; a real prestige loop for players who want one | Small bonus, plus the life's book. Keeping lives must stay the main path | Phase 2 |
| **How many lives can act at once?** | All slots fully; one in focus and the rest on standing orders; an attention budget | One in focus, the rest on standing orders with weekly reports | Phase 2 |
| **Can lives meet in person?** | Never; through letters and trade only; meet in the same place | Meet in the same place, with a few shared scenes, never as a party | Phase 2 |
| **How hard is Disaster?** | Losses only; injuries that heal; a life can be lost for good | Injuries and losses that heal. No permanent death, since lives are the prestige | Phase 1 |
| **Offline time** | Full simulation; a capped catch-up; a summary only | Capped catch-up of 7 game-days per real day away, then a summary | Phase 0 |
| **Art pipeline** | Hand-drawn; generated then painted over; vector style | Decide after drawing Eintenn's places three ways in Phase 1 | Phase 1 |
| **Do Allora I saves carry over?** | No; a keepsake (a title or heirloom); a whole starting life | A keepsake only, so Allora II's balance stays its own | Phase 3 |
| **Monetisation** | Free; one price; free with a paid expansion per land | Free while building; decide before public release | Phase 3 |
| **Which Marre district is in the slice?** | The Piazza of the Doges only; the Piazza and the Glass Isles; the whole city | The Piazza and the Lazaretto, so the Cerdans and the physician meet | Phase 1 |
| **Multiplayer** | None; shared markets; letters between players | None. A shared world can come later, if ever | Phase 6 |

### What this bible will not decide

Some answers only come from play. These are left open on purpose, to be settled by the balance bot and by playtests:

- the exact DCs of each case;
- the price of every Tapestry thread past the first ring;
- how many posts each trade really needs.

When play answers one, write the answer back into this bible. The bible should always describe the game as it is.

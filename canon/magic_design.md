# Allora — The Many Arts of Magic (Update Design)

> Text extracted with `pdftotext -layout` from `canon/magic_design.pdf` (Oct 18, 2026, @Astral; 39 pages), which is the authoritative copy. Page headers and footers are removed; tables and formulas keep the PDF layout. Where this text and the PDF differ, the PDF wins.

```text

Allora — The Many Arts of Magic (Update
Design)
  Oct 18, 2026        ·   ​@Astral

Magic now has two layers. Disciplines are 25 plain, trainable magic skills: Illusion, Fae
Magic, Alteration and the like. Schools are the flavour: thirty peoples' and orders' arts,
each built from its own blend of disciplines and mundane skills, with its own lore, places
and rules. One discipline feeds many schools, and no feature is shared by more than a
handful.

Principles
Magic should vary more than faith does. Real religions share a few habits, such as holy
days, offerings and sacred places, but magical arts need not share anything. So every
optional feature in this design appears in only a few schools, and most schools have only
two or three of them.

   1. One shape per school. Each school is defined by what a working is in it: a charm, a
      proof, a seal, a reflection, a stave, a figure, a name, a bargain. Its features follow from
      that shape. A school whose magic lives in carried staves needs no grimoire; a school
      whose magic is dreamt cannot write anything down.
   2. Feature rarity is a rule. Home workings: 8 schools of 30. Grimoires: 10. Artifacts: 8.
      Foci: 5. School-specific reagents: 19. Faith ties: 12. Every school has its own way of
      being learned. Schools that pay in Will or in a state (Bulk, Fade, debt) keep that as
      their whole cost.
   3. What a school pays is its identity. Costs vary in kind, not just amount: Will, reagents,
      debt, Bulk, Fade, a price collected later, notoriety, a cracked tablet, a burned banner,
      lost time, or a piece of yourself.
   4. Not every school is one skill. A school's level is a weighted blend of a primary skill and
      up to two secondaries, and magic skills can be secondaries to each other. Thirty
      schools are built from 25 disciplines plus mundane skills, so the same discipline reads
      differently in each school that uses it.
   5. The sky is selective. Some schools follow the moon, some follow the new astrological
      sky, one follows both, and many follow neither. The UI never mentions an influence a
       school does not have.

   6. End-game is a new shape, not a bigger number. Each school's high workings do
      something its low workings cannot: they change where a working lives, how long it
       lasts, or what it costs.

Hard limits carried over:

       The world is static. Workings act on the player, their household, their properties and
       their animals, never on a realm's politics.
       The player never learns witch magic.
       No real-world terms appear in game text. The sky uses Allora's own Houses and
       Wanderers.
       Little UI text. A school card shows its level, its sky (only if it has one) and what it
       needs next. Everything else lives in the codex.
       No hint-giving. Divination stays about luck, timing and markets; it never forecasts
       events.

Schools are not skills
A school is now its own object with a school level. That level is a weighted average of a
primary skill and up to two secondaries; the weights sum to 1 and the primary always
carries at least half. A school with no secondaries has a school level equal to its skill.
Twenty of the 30 schools have secondaries; ten stay pure.

   \text{School level} = \sum_i w_i \cdot \text{lv}(\text{skill}_i), \qquad
   \sum_i w_i = 1, \quad w_{\text{primary}} \ge 0.5

       What the school level does: it gates spells (a spell's level is a school level) and sets a
       working's power.
       How casting trains: XP from casting is split by the weights, so casting still trains the
       secondaries. Training a secondary elsewhere raises the school level too.
       Magic skills as secondaries: a magic skill can be another school's secondary.
       Pyromancy and Evocation together make the Crucible Art. One skill can therefore
       serve several schools.
       Grandfathering: spells already learned stay castable even if the new school level falls
       below their requirement. Power uses the school level.

Disciplines: plain skills, flavourful schools
The game's magic skills were named for their schools because there were no schools yet.
Now they become disciplines: plain names for what a kind of magic does. Each school's
lore keeps the old flavour. Skill ids never change, so saves, recipes and every
 lv('druidism') call keep working; only the display name, the description and the codex
text change.

   Skill id                        Was            Now (discipline)    What the discipline is

    hedgecraft                     Hedgecraft     Charms              small sympathetic magic: like to
                                                                      like, knot and token

    evocation                      Evocation      Evocation           calling force out of nothing

    warding                        Warding        Warding             keeping things out

    illusion                       Illusion       Illusion            making the eye believe

    divination                     Divination     Divination          reading what is hidden in
                                                                      patterns

    summoning                      Summoning      Summoning           calling and keeping spirits

    necromancy                     Necromancy     Necromancy          dealing with the dead

    druidism                       Druidism       Nature Magic        asking the living world

    runecraft                      Runecraft      Rune Magic          power cut into signs

    lanterncraft                   Lanterncraft   merged into Light   (see below)
                                                  Magic

    lumencraft                     Lumencraft     Light Magic         light that changes what it falls on

    feybargain                     Hill-          Fae Magic           dealing with the Gentry and their
                                   Bargaining                         kind

    grandeur                       La Grandeur    Gigantism           growing larger than you are

    hushcraft                      The Hush       Oblivion            being forgotten, and making
                                                                      others forget

    witchlore                      Witchlore      Countermagic        unpicking and resisting other
                                                                      magic

    battlemagic                    Pyromancy      Pyromancy           fire

   Skill id                        Was           Now (discipline)    What the discipline is

    dreaming                       Dreaming      Dream Magic         working in sleep

    geomancy                       Geomancy      Geomancy            power in measure, angle and
                                                                     stone

    namebinding                    Name-         Name Magic          power over what is named
                                   Binding

    redreading                     Red-Reading   Blood Magic         power in blood

    demonology                     Demonology    Demonology          bargains with powers from
                                                                     outside

    facetcraft                     Facetcraft    Crystal Magic       storing and shaping power in
                                                                     crystal

    verseburning                   Verse-        Inscription         power in written words
                                   Burning

    alteration                     —             Alteration (new)    changing a living thing's shape or
                                                                     nature

    transmutation                  —             Transmutation       changing one substance into
                                                 (new)               another

    restoration                    —             Restoration (new)   mending bodies and things

       The one merge: Lanterncraft and Lumencraft are both light. They merge into Light
       Magic. A save keeps the higher of the two XP totals, plus a quarter of the lower. Now
       two schools share one discipline: the Hollow Lights (wisps in the bogs) and the Soft
       Light (Dell's lamps).
       The verse skill: last revision's "Sunscript" becomes the generic Inscription.
       "Sunscript" now names what the Verse-Wrights call their own way of inscribing, in the
       Burned Verse's lore.
       What is rewritten:
              each renamed skill's SK.d description and codex entry;
              each school's codex entry ( MAGIC_SYSTEMS ), which now describes the school and
              names its disciplines;

              every boon, knack, activity name and help text that names an old skill. Gods'
              boons say "Nature Magic", not "Druidism" (Greenwife), and "Light Magic", not
              "Lumencraft" (Dell, Gruma).
              A lint test fails if any old display name survives in game text.

Where the three new disciplines are trained
Each is trained at four places, one per land, open to anyone and not tied to a school.

   Discipline                   Seven                   Gallar             Qoul                 East

   Alteration                   Collegium lab:          Lomma's wing-      Raben's              Kamenara, the
                                grafting and the        lofts: shaping     Hanging              Great Hive:
                                changing of             wax to the         Gardens: the         tending the
                                beasts (0)              flier (15)         gardeners who        changed bees
                                                                           change vines         (65)
                                                                           (45)

   Transmutation                Silberhalde             Hobb's             Red Land solids:     Vel Ossira
                                smelter: the old        Furrow: the        salt to glass (45)   foundries: the
                                smelters' tricks        Wake-Fields                             proving-floor
                                (0)                     (15)                                    (65)

   Restoration                  Friary infirmary        Balm Springs       Kedem-of-            The Bark
                                (0)                     pools (15)         Refuge (45)          Hospice of
                                                                                                Plandor (65)

The numbers are the required level of the discipline. Each spot pays like any other activity
there, and each discipline gets four knacks.

The roster

   #          School                            Land                  Disciplines and skills           Sky
                                                                      (weight)

   1          The Hedge-Arts                    Seven                 Charms .6 · Herbalism .25 ·      Moon
                                                                      Restoration .15

   2          Hermetic Evocation                Seven                 Evocation 1.0                    Stars

   3          Hermetic Warding                  Seven                 Warding 1.0                      —

   #          School                            Land            Disciplines and skills          Sky
                                                                (weight)

   4          The Silvered                      Seven           Illusion .75 · Acting .25       Moon
              Masque

   5          The Starward                      Seven           Divination .65 · Astrology      Moon and
              Reckoning                                         .35                             stars

   6          Pact-Calling                      Seven           Summoning 1.0                   Stars

   7          Grave-Lore                        Seven           Necromancy 1.0                  Moon

   8          The Green Way                     Seven           Nature Magic .7 · Herbalism     Moon
                                                                .15 · Restoration .15

   9          Stave-Craft                       Seven           Rune Magic .7 ·                 —
                                                                Woodcarving .15 · Old Runic
                                                                .15

   10         The Hollow Lights                 Seven           Light Magic .6 · Summoning      Moon
                                                                .2 · Chandlery .2

   11         Hill-Bargaining                   Seven           Fae Magic 1.0                   Moon

   12         The Soft Light                    Seven           Light Magic .75 · Theology      —
                                                                .25

   13         La Grandeur                       Seven           Gigantism .8 · Alteration .2    Moon

   14         The Hush                          Seven           Oblivion 1.0                    Moon

   15         The Hollow Masque                 Seven (Grell)   Illusion .5 · Necromancy .3 ·   Moon
                                                                Alteration .2

   16         The Rime-Watch                    Seven           Alteration .5 · Warding .3 ·    Season
              (new)                             (Deichmarsch)   Ice-Craft .2                    (winter)

   17         Pyromancy (the                    Gallar          Pyromancy 1.0                   Stars
              Scorched School)

   18         Witchlore                         Gallar          Countermagic 1.0                —

   19         The Dreaming of                   Gallar          Dream Magic .8 ·                Moon
              Nim                                               Meditation .2

   20         The Crucible Art                  Gallar          Pyromancy .5 · Evocation .3     Stars
                                                                · Transmutation .2

   #          School                            Land                Disciplines and skills        Sky
                                                                    (weight)

   21         The Long Wake                     Gallar (Hobb's      Transmutation .5 · Nature     Moon
              (new)                             Furrow)             Magic .25 · Mycology .25

   22         Geomancy of the                   Qoul                Geomancy .7 · Mathematics     Stars
              Angles                                                .3

   23         Name-Binding                      Qoul                Name Magic .75 · Rabena       Stars
                                                                    .25

   24         Red-Reading                       Qoul                Blood Magic 1.0               —

   25         The Tablets of the                Qoul (Raben)        Name Magic .5 · Divination    Stars
              Sky                                                   .3 · Astrology .2

   26         Corner-Work                       East                Demonology 1.0                —

   27         Facetcraft                        East                Crystal Magic .7 · Gem-       —
                                                                    Cutting .3

   28         The Burned Verse                  East                Inscription .7 · Poetry .3    Stars (the
                                                                                                  sun)

   29         The Singing Lattice               East                Crystal Magic .55 ·           —
                                                                    Geomancy .3 · Hum-
                                                                    Reading .15

   30         The Shade-Walk                    East (the jungle)   Illusion .5 · Sneaking .3 ·   Moon
              (new)                                                 Tracking .2

Twenty schools blend skills and ten are pure. Illusion now drives three schools, Light
Magic two, Name Magic two, Crystal Magic two and Alteration three. For the sky, 12
schools follow the moon, 8 the stars, 1 both and 1 the season; 8 follow nothing.

The sky
Allora gets a sky. The sun walks through eight Houses in a year, and five Wanderers circle
the Houses at their own speeds. It is a clock that anyone can read once they learn to, and
it matters to nine schools: eight follow only the stars and one, the Starward Reckoning,
follows both the moon and the stars.

The eight Houses of the sun
The year is 48 days, so the sun spends six days in each House.

   House                          Sign          Days              Character

   The Plough     🌱                             Spring 1–6        beginnings, labour

   The Hart       🦌                             Spring 7–12       the wild, the chase

   The Ship       ⛵                             Summer 1–6        journeys, the sea

   The Twin Lamps 🕯️                            Summer 7–12       light, fire, the long day

   The Sheaf      🌾                             Autumn 1–6        plenty, harvest

   The Key        🗝️                            Autumn 7–12       doors, names, judgement

   The Serpent    🐍                             Winter 1–6        cold, secrets, the deep

   The Crown      👑                             Winter 7–12       rule, angles, endings

The five Wanderers
Each Wanderer circles all eight Houses in its own period. It is at home in one House, and
two Wanderers in the same House are in conjunction.

   Wanderer                      Look                   Circles the            At home in     Meaning
                                                        Houses in

   The Hound                     small and              8 days                 The Hart       errands, pursuit
                                 quick

   The Ember                     red                    16 days                The Twin       fire, force
                                                                               Lamps

   The Pale Wife                 silver                 24 days                The Ship       the hidden, the
                                                                                              summoned

   The Judge                     white and              40 days                The Key        law, names, measure
                                 steady

   The Drowned                   blue and               64 days                The Serpent    the deep, the dead,
   Star                          faint                                                        endings

Rare skies. Three or more Wanderers in one House make a Great Conjunction, a few
times a year. A new moon while the Pale Wife stands in the sun's House is the Darkened
Sun, about once a year. Some end-game workings can only be done under one of these.

Who can read it
       Everyone sees the sun's House: a chip next to the moon's.
       Astrology 20 shows where each Wanderer stands.
       Astrology 50 shows the sky six days ahead. This is an ephemeris of the sky only, never
       a forecast of events.
       The Reckoners' grimoire (see the Starward Reckoning) computes a whole season
       ahead.

What the sky does
The sky affects magic and nothing else. A star-school working is ×1.3 when its sky favours
it and ×0.75 when it frowns, on the same scale as the moon. The Starward Reckoning
multiplies both. Moon-only schools keep their current phases; the new Long Wake and
Shade-Walk follow the moon too. The new Rime-Watch follows neither sky: it follows the
season instead, ×1.3 in winter and ×0.75 in summer, and its card shows only that.

   School                              Favoured                            Frowned on

   Hermetic                            the Ember at home, or the Ember     the sun in the Serpent
   Evocation                           with the Judge

   Pact-Calling                        the sun in the Key; the Pale Wife   the Judge in the sun's House
                                       in the sun's House                  (spirits dislike being watched)

   The Starward                        any conjunction; doubled under      no Wanderer at home
   Reckoning                           the Darkened Sun

   Pyromancy                           the Ember in the sun's House        the Drowned Star with the Ember

   The Crucible Art                    as Pyromancy; its great castings    as Pyromancy
                                       need the Ember in conjunction

   Geomancy of the                     the sun in the Key or the Crown     the Hound at home (nothing
   Angles                                                                  stays still)

   Name-Binding                        the Judge in the sun's House        the sun in the Serpent

   School                              Favoured                              Frowned on

   The Tablets of the                  each tablet follows one Wanderer      —
   Sky                                 (see the school)

   The Burned Verse                    the sun in the Twin Lamps or the      the sun in the Serpent or the
                                       Sheaf                                 Crown

Implementation. House of the sun = floor((day mod 48) / 6). A Wanderer's House =
floor(((day + offset) mod period) × 8 / period), with fixed offsets so the year starts with
no conjunction. Add the fields skyFav(D) and skyFrown(D) to each star-school, and add
 skyMult(school) beside moonMult . The school card draws the moon line only if the
school has moon phases, and the sky line only if it has skyFav .

The feature toolkit
These are the features a school may have. Each is one data field on the school, and only
the schools named in the matrix carry it.

   Feature                       What it is                           Data                             Schools

   Secondary                     Weighted parts of the school         sec:[[skill,w],…]                20
   skills                        level

   Sky                           Moon phases, star favour, or         up/down ,                        22
                                 both                                 skyFav/skyFrown

   Home working                  One magical working per              home:                            8
                                 property: a renewable tag on         {tag,n,eff,days,cost}
                                 the house

   Grimoire                      A school's own written (or held)     grim:{n,kind,fx}                 10
                                 record, each with its own name
                                 and rules

   Artifact                      A unique object that changes         item with artifact:school        8
                                 how the school works, found or
                                 earned once

   Focus                         An object you must hold to cast;     focus:item                       5
                                 its quality adds power

   Feature                       What it is                        Data                     Schools

   School                        Materials that belong to this     items with reag:school   19
   reagents                      school, made or gathered its
                                 own way

   Faith tie                     Requirements, boosts or bans      faith:{d, need, boost,   12
                                 tied to a faith                   ban}

   Penalty                       The school's distinctive price    pen: hook                22
                                 beyond its materials

   End-game                      Two high workings that change     spells at 60–95          27
   workings                      a working's shape, not just its
                                 size

Home workings: one per property
Each property can hold one magical working at a time, shown as a tag on the house
(Warded, Ossuary, Grove-Rooted, and so on).

       It lasts, then lapses. It runs for a set number of days, a season for most, and must be
       renewed at the house. When it lapses, the tag goes and the house is free.
       Replacing it ends the old one at once.
       Every tag works differently. One affects who may enter, one what grows, one what
       the house makes, one how fast Will refills, one what happens at night.
       Geomancy's three figures become one tag. The Angled House holds up to three
       figures, and laying them is how you renew it.
       Data: S.homes[res].tag = {sch, id, until, p} , read by a homeTagFx(res) hook
       beside homeComfort .

End-game workings
Every school gets two high workings: one near the top of its land's range and one at the
very end. Seven and Gallar schools gain workings at about 60 and 85. Qoul schools gain
them at about 75–80 and 85–95, and East schools at 80 and 85, keeping within the East's
65–85 range. Each one changes the shape of the school's magic: it moves where a working
lives, makes it last a season, removes a cost, or works only under a rare sky.

Grimoires
Only ten schools keep one, and each keeps it differently: a commonplace book, a folio, a
shelf of tablets, a page in someone else's ledger. A grimoire is a S.grim[school] record
of entries, not an item. Some can be lost, some must be renewed, some are copied from
others. The schools that refuse one say why in their codex: never written, the land
remembers, the body remembers, or the Corner owns it.

Penalties
Current penalties stay. New ones are each used once:

       Misfire: Evocation's existing misfire.
       Cracked tablets: Name-Binding, and the Tablets of the Sky.
       Lost faces: the Hollow Masque.
       Scorch: the Crucible's burns.
       Resonance: the Singing Lattice, whose figures crack in the Drone.
       A banner gone: the Burned Verse.
       Hours lost: the Starward Reckoning.

Which school uses what
The Burned Verse has the most features, seven. Stave-Craft, the Hush, Witchlore and
Red-Reading have one each, and each is complete without more. Read down a column to
see how rare each feature is: only secondaries, the sky and reagents reach even half the
schools.

  School                          Second. Sky           Home Grimoire Artifact Focus Reagents Faith   n

  Hedge-Arts                      ●             Moon                                 ●                3

  Hermetic Evocation                            Stars         ●                ●     ●                4

  Hermetic Warding                                      ●                            ●                2

  Silvered Masque                 ●             Moon                           ●                      3

  Starward Reckoning ●                          Both          ●                                       3

  Pact-Calling                                  Stars   ●     ●        ●                              4

  Grave-Lore                                    Moon    ●              ●             ●        ●       5

  Green Way                       ●             Moon    ●                            ●        ●       5

  School                          Second. Sky            Home Grimoire Artifact Focus Reagents Faith   n

  Stave-Craft                     ●                                                                    1

  Hollow Lights                   ●             Moon                            ●     ●                4

  Hill-Bargaining                               Moon                    ●                      ●       3

  Soft Light                      ●                      ●                            ●        ●       4

  La Grandeur                     ●             Moon                    ●                              3

  The Hush                                      Moon                                                   1

  Hollow Masque                   ●             Moon                    ●                      ●       4

  Pyromancy                                     Stars                                 ●                2

  Witchlore                                                                                    ●       1

  Dreaming of Nim                 ●             Moon           ●                      ●        ●       5

  Crucible Art                    ●             Stars                           ●     ●        ●       5

  Geomancy                        ●             Stars    ●     ●                      ●                5

  Name-Binding                    ●             Stars          ●                      ●                4

  Red-Reading                                                  ●                                       1

  Tablets of the Sky              ●             Stars          ●                      ●                4

  Corner-Work                                                                         ●        ●       2

  Facetcraft                      ●                            ●        ●             ●                4

  The Burned Verse                ●             Stars          ●        ●       ●     ●        ●       7

  Singing Lattice                 ●                      ●                            ●                3

  Rime-Watch (new)                ●             Season                  ●                      ●       4

  Long Wake (new)                 ●             Moon     ●                            ●        ●       5

  Shade-Walk (new)                ●             Moon                                  ●                3

  Count                           20            22       8     10       8       5     19       12

The n column counts every marked column. Penalties and end-game workings are left out,
because every school has them in its own form.

The schools of the Seven
Fifteen schools, including the new Hollow Masque. Each entry lists only what the school
has. Anything unlisted, it lacks on purpose. Levels are school levels.

The Hedge-Arts — a charm for every chore
Charms .6 · Herbalism .25 · Restoration .15 · Moon (waxing)

       Reagents: the cupboard — herbs, thread, wax and salt. No Will.
       No grimoire: charms are never written. A charm not worked for two seasons is
       forgotten, and the forgetting is the penalty.
       End-game:
              60 The Long Knot. One charm, knotted to last a whole season instead of a day.
              85 Mother of the Village. Every charm you work also lands on your closest friend,
              who thinks better of you for it.

Hermetic Evocation — the proof that closes
Evocation 1.0 · Stars (the Ember)

       Focus: a proof-rod, a wand turned at the Collegium. Casting without one doubles the
       misfire. Its quality adds power, and a misfire can crack it.
       Reagents: the Collegium's graded inks, plus a new quintessence ink distilled in the lab
       for the great proofs.
       Grimoire — the Commonplace of Proofs: you copy each proof you know into it, with
       parchment and ink. A copied proof misfires half as often.
       Penalty: misfire burns, as now.
       End-game:
              65 Proof of the Second Sun. For a day, night counts as day for every daylight rule,
              and night smithing and glasswork gain +8 quality.
              88 The Grand Proof. Only when the Ember stands with the Judge. For a season,
              every lesser proof costs no Will.

Hermetic Warding — seals that hold for days
Warding 1.0

       Home working — the Warded House: a property sealed for a season. Nothing is
       stolen from it, you catch no disease while sleeping there, and its stall cannot be
       robbed.
       Reagents: sealing-salt, refined at the Salzmoor pans (new item).
       Penalty: a broken seal recoils. Replacing a Warded House early hurts you.
       End-game:

              62 Seal of the Road. A seal on your own body for a season: the first harm each day
              is halved.
              86 The Unbroken Ward. Once a season, a blow that would drop you to 1 health is
              stopped.

The Silvered Masque — a reflection that walks
Illusion .75 · Acting .25 · Moon (full)

       Focus: the Marrean mirror (exists). Mirror quality now adds power.
       Faith: Calder's Vow of Honesty forbids it.
       Penalty: your double wanders off (exists). From level 60 it sometimes earns you
       notoriety too.
       End-game:
              65 A Masque of Many. Two doubles each take up a career for a day, and both pay.
              88 The Glass Court. Your reflection attends a realm's court for a season, and your
              standing there rises every day. If the court finds out, it falls hard.

The Starward Reckoning — the chart and the hours
Divination .65 · Astrology .35 · Moon and stars

       Grimoire — the Ephemeris: worked out over a night at an observatory, with Astrology
       50. While it is current, readings need no parchment and you see the sky a season
       ahead. It must be worked out again each season.
       Penalty: hours. Every reading takes time at the chart (exists).
       End-game:
              62 Casting the Year. At the turn of the year, read the year. For all of it, whichever
              House the sun is in gives +10% learning to its skill family.
              85 The Great Nativity. Only under the Darkened Sun. Read your own birth-sky
              and take one Wanderer as your star; whenever it is at home, all your magic is ×1.3.

Pact-Calling — names off the lintels
Summoning 1.0 · Stars (the Key, the Pale Wife)

       Home working — the House-Spirit: bind a spirit to a property instead of to yourself. It
       holds none of your Will, and while you are home every station there works one tier
       higher. Lasts a season.

       Grimoire — the Book of Lintels: rubbings of the names from Old Vaelis. Each pact
       needs its page, and the oldest page fades every season unless you rub it again.
       Artifact — the Lintel-Stone: a fallen lintel deep in Vaelis, found by exploring with high
       Excavation. Carried, it lets you bind one more spirit.
       Penalty: the Will tax of bound spirits (exists).
       End-game:
              65 Pact of the Steward. A House-Spirit that also gathers for the house: a little of
              your home's trait yields every day.
              90 The Greater Name. Only with the sun in the Key. Bind a spirit that takes no
              Will, whose gift doubles while the Pale Wife is at home.

Grave-Lore — the dead remember everything
Necromancy 1.0 · Moon (new)

       Home working — the Ossuary: bones laid under a property. The dead labour there,
       and every station and plot works a quarter faster for a season.
       Artifact — the Black Codex (exists, and needed to learn). Carried, it lets you ask
       questions by day, but grave-chill doubles.
       Reagents: bones, candles and death-candles (exist).
       Faith:
              Gruma's faithful draw no notoriety from it (exists).
              It fouls Norrae's waters (exists).
              New: Seronia's Ringed lose devotion for it, because the dead are hers.
              New: Dell grants nothing in a week you practise it.
       Penalty: notoriety and grave-chill (exist).
       End-game:
              65 Ask a King. Once a season, a lord of the Elder Ages teaches you a level of a skill
              he knew.
              88 The Long Night's Labour. The dead tend every property you own for a season,
              doubling what they produce. Each week there is a chance someone sees.

The Green Way — asks, and the debt
Nature Magic .7 · Herbalism .15 · Restoration .15 · Moon (waxing)

       Home working — Grove-Rooted: a grove planted at a property with plots. For a
       season, its plots never fail and grow through winter.
       Reagents: offerings — honey, bread, and the new first-fruits taken from your own
       farm.
       Faith: the Greenwife's faithful build debt half as fast. Felling timber adds to any
       druid's debt.
       Penalty: debt to the land (exists).
       End-game:
              62 Ask for a Spring. For a day, one wild place gives out of season.
              85 The Wildwood Heart. A wild place takes you as its keeper. Once a season it
              forgives your whole debt, and gathering there is +50%.

Stave-Craft — nothing is cast
Rune Magic .7 · Woodcarving .15 · Old Runic .15

Nothing else. The stave is the working, the record and the focus at once, so the school
needs no grimoire, focus or reagents beyond wood.

       Penalty: what you can carry (five staves, six with the bone-rune).
       End-game:
              60 The Bind-Rune. Two runes cut into one stave, taking one place.
              85 The Doom-Stave. A stave that strengthens every other stave you carry by half
              for a season, then must be burned.

The Hollow Lights — wisps and candles
Light Magic .6 · Summoning .2 · Chandlery .2 · Moon (dark)

       Focus: the wisp-lantern (exists). Lights cannot be carried without one, and its quality
       adds power.
       Reagents: caught wisps and candles (exist).
       Penalty: wisps get away while you learn, and lights work only after dark.
       End-game:
              62 The Lantern Procession. On a Hollow Night, lead the forgotten dead. Grave-
              robbing draws no notoriety that night, and they leave you old coins.
              86 The Wisp-Queen's Lantern. Once a season, it shows you a hidden place in any
              realm you know.

Hill-Bargaining — the Gentry offer
Fae Magic 1.0 · Moon (full)

       Artifact — the Gentry's Gift: a token given after your tenth bargain. Carried, it
       forgives one price a year.
       Faith: Qo forbids it. The Greenwife's faithful are offered better bargains, since she is
       on speaking terms with the Gentry.
       Penalty: prices collected later (exists).
       End-game:
              65 A Bargain for a Season. The Gentry's offers last a season instead of a day.
              90 The Long Guest. A night under the hill brings back a great gift. Outside, a
              whole season has passed: bills, obligations and all.

The Soft Light — lamps set in one place
Light Magic .75 · Theology .25

       Home working — Lamp-Lit: a Dellian lamp at a property. For a season, kindness given
       there counts double and notoriety fades twice as fast while you are home.
       Reagents: blessed lamp-oil, sold only by Dell's churches (new item).
       Faith: learning it needs standing with the Church of Dell (exists). Dell's faithful keep
       their lamps lit twice as long. Violent work snuffs every lamp you have set.
       Penalty: a lamp works only where it is set.
       End-game:
              62 The Lamp of the Diet. Set in a court city, it makes standing with that realm rise
              half again as fast.
              85 The Lamp That Is Never Lit. A lamp in your hands: the Lamp of Candour
              wherever you go, for a season.

La Grandeur — the giants' working
Gigantism .8 · Alteration .2 · Moon (full)

       Artifact — the Ring of the Colossus: sized for a giant's finger and dug out at the
       Colossi. Worn as a bracelet, it halves how fast Bulk grows.
       Penalty: Bulk; Bellor's Mantle is barred (exists).
       End-game:

              65 Stride of the Colossi. Your next journey into a neighbouring region takes a
              single step.
              88 The Giant's Seat. You are a giant for a season: +30% to fights, mining and
              felling, but no indoor social work, and a great deal of Bulk.

The Hush — becoming forgotten
Oblivion 1.0 · Moon (new)

Nothing else. Its only cost is Fade, and that is enough.

       End-game:
              65 A Forgotten Season. Notoriety goes to nothing and the watch forgets you for a
              season, but friends forget you a little faster too.
              88 Unmade. One faction forgets you entirely: your standing with it returns to zero,
              for good or ill.

The Hollow Masque (new) — the faces of the dead
Illusion .5 · Necromancy .3 · Alteration .2 · Moon (new and full)

Grell's Mask-Wardens know that a mask of the dead, worn rightly, lends you a little of who
they were. The Masque is taught in the gallery at Trauerfels and the Mask-Wardens'
chapel in Perlinburg.

       Faith: you need Lantern-Bearer rank with Gruma or Honoured standing with the
       Mask-Wardens. Seronia's faithful may not learn it, and Calder's Vow of Honesty
       forbids it.
       Artifact — the First Mask: the mask of the first Perlin duke, lent for one Hollow Night
       to those Gruma honours. Kept, every mask you wear lasts twice as long.
       Penalty — lost faces: each working wears your own face thinner. When it is thin
       enough, friends stop recognising you and gain half as much from you until a Hollow
       Night gives your face back.
       Workings:
              15 The Mourner's Face: Keening and Grell standing for a day.
              25 A Dead Craftsman's Face: for a day, one craft is worked at a dead master's skill,
              less 10.
              35 The Face of the Watch: taken for a watchman, so notoriety cannot rise for a
              day.

              45 A Lord's Face: Social learning and court standing for a day.
              55 ★ Gruma's Own Mask: for good, your own face never wears quite thin.
       End-game:
              65 A Face for Each Night. Wear three faces at once.
              88 The Face Under All Faces. Wear the face of a friend you trust: their
              companion's gift is yours in full for a season.

The schools of Gallar and Qoul
There are eight schools here, including the new Crucible Art and the Tablets of the Sky.

Pyromancy — fire called by Will
Pyromancy 1.0 · Stars (the Ember)

       Reagents: scorch-salt for the great callings (exists).
       No grimoire: it is drilled into the body in the Burning Yard. Nothing is written down.
       Penalty: scorch — sometimes the fire takes a little of you (exists).
       End-game:
              62 Salamander Skin. For a season, burns and fire-risks cannot hurt you.
              86 The Wildfire Calling. For a day, every fight you win pays half again, and no fight
              can be lost outright: a loss becomes a retreat.

Witchlore — the countersign
Countermagic 1.0

       Faith: Leima's face of the Three-Headed God doubles your Countermagic learning.
       Qo's White-Coiled count 15 higher against witch-power (exists). It is never witchcraft,
       and can never become it.
       No reagents, focus or grimoire: it is told, survivor to survivor.
       End-game:
              60 Countersign of the Queens. For a season, witch-power cannot touch you, and
              the witch councils think better of you.
              85 The Unwitched. For good: witch-workings that would harm you rebound as
              Will.

The Dreaming of Nim — descents
Dream Magic .8 · Meditation .2 · Moon (new)

       Reagents: the Nimian draught (exists).
       Grimoire — the Dream-Journal (exists). From now on, every descent you write in it
       can be dreamt again at half the draught.
       Faith: Nim's faithful dream their descents a stage deeper. A sleep-retreat in the cells
       also teaches a descent.
       Penalty: six hours asleep, every time.
       End-game:
              62 Dream of Another Life. Borrow a close friend's best skill for a day.
              86 The Shared Dream. Dream beside the one you love. Your bond leaps, and both
              of you wake with a little of the other's learning.

The Crucible Art (new) — proof by fire
Pyromancy .5 · Evocation .3 · Transmutation .2 · Stars (the Ember)

The Collegium's proofs were born in Sillenian fire. A handful of Scorched School masters,
matriculated at Kesselhaven, reunite the two in a crucible: a calling held inside a closed
proof, so that it can be kept, measured and released.

       Learned: at the Scorched School, by matriculated students of the Collegium only.
       Focus — the crucible: a palm-sized vessel of fired clay and silver. Workings are held in
       it and released later. Its quality sets how long a working keeps.
       Reagents: scorch-salt and quintessence ink, both shared with the parent schools.
       Faith: the Pyre's faithful may pour a Crucible working onto their offering, and it counts
       as a burned offering of equal value.
       Penalty — scorch on release: releasing a held working burns you a little.
       Workings:
              20 Banked Flame: hold a Pyromancy calling for up to a day and release it when
              you choose.
              30 Proof-Fire: smithing and glass at +6 quality for two days.
              40 The Calcined Ore: mining and smelting give a tier-higher metal, for a day.
              50 The Measured Bolt: +12% to win fights for a day, with no misfire.
              55 ★ The Inner Crucible: for good, any working held in a crucible keeps twice as
              long.

       End-game:
              65 The Kept Sun. Only with the Ember in conjunction. A calling held for a whole
              season.
              88 Transmutation by Fire. Once a season, raise any one crafted item a whole
              quality.

Geomancy of the Angles — figures in a home
Geomancy .7 · Mathematics .3 · Stars (the Key, the Crown)

       Home working — the Angled House: the existing figures become the property's one
       working. The tag holds up to three figures for a season, and laying a figure renews it.
       Grimoire — the Folio of Closed Proofs: every figure's proof, closed on parchment. A
       figure can be laid only once its proof is in the folio.
       Reagents: cut stone, star-lapis, marble and clay (exist).
       Penalty: none beyond materials. The cost is the house it ties up.
       End-game:
              80 The Fourth Figure. An Angled House may hold four figures.
              95 The Apex Figure. Laid only in a Great Conjunction. For a season, one house's
              figures work for you anywhere in its region.

Name-Binding — names on clay
Name Magic .75 · Rabena .25 · Stars (the Judge)

       Grimoire — the Tablet-Shelf: fired tablets of every name you hold, kept at home. Each
       binding cracks its tablet, and a new one must be fired.
       Reagents: clay and fired tablets (exist).
       Penalty: cracked tablets.
       End-game:
              80 The Name of a City. Bind a city's name for a season: yields and pay there +15%.
              95 Your True Name, Kept. Your own name, fired and shelved in the Tablet-House.
              For a season, notoriety cannot rise.

Red-Reading — it sees and changes nothing
Blood Magic 1.0

       Grimoire — your page of the Red Ledger: Gisgal keeps a page in your name. Every
       drop you read is written there, and it is the only record of what you learned. Losing
       standing with the Library closes your page.
       Penalty: blood, freely given (exists).
       End-game:
              80 Read a Stranger. Any person's tastes, without their drop.
              95 Read the Realm. From a drop of a ruler's blood, every faction's view of you in
              that realm, laid out. It still changes nothing.

The Tablets of the Sky (new) — binding the Wanderers' names
Name Magic .5 · Divination .3 · Astrology .2 · Stars (one Wanderer per tablet)

The priests of the Tell of Years in Raben hold that each Wanderer has a name, and that a
name fired into star-clay at the right hour carries its Wanderer's temper for as long as the
tablet lasts. They teach at Etemen, the Tongue-Tower, and at the Tell.

       Reagents — star-clay: clay fired at night under a clear sky with a little star-lapis (new
       item).
       Grimoire — the Sky-Ledger: a record of every conjunction you have seen. The great
       tablets need the ledger to hold the conjunction they draw on.
       Penalty: a tablet cracks when its Wanderer leaves the House it was fired in.
       Workings (each lasts while its Wanderer stays in that House):
              45 Tablet of the Hound: journeys 10% quicker.
              50 Tablet of the Ember: +8% to win fights.
              55 Tablet of the Pale Wife: bound spirits and reflections +25%.
              60 Tablet of the Judge: standing gains +20%.
              66 Tablet of the Drowned Star: questions of the dead and descents cost half.
              70 ★ The Fixed Star: for good, one tablet of your choice never cracks.
       End-game:
              80 The Conjunction Fired. In any conjunction, fire one tablet that carries both
              Wanderers at once.
              95 The Great Tablet. Only in a Great Conjunction. A tablet carrying three
              Wanderers, which cracks only when the year turns.

The schools of the East
Four schools, including the new Singing Lattice. None of them follows the moon, and only
the Burned Verse follows the sky. The Hum (Murmur, Drone and Choir) is the East's own
weather for magic. East workings stay within the land's 65–85 range.

Corner-Work — Demonology (bargains in a square)
Demonology 1.0

       Reagents: chalk, candles and salt (exist).
       Faith: each Corner's own faithful pay its price at a discount (exists). Under the new
       Count, a Corner's workings are ×1.3 in its own five days and fail outright in the Unlit
       Days, except the Unreckoned's, which are doubled then.
       No grimoire: writing down a Corner's working is itself a promise the Hinge will collect.
       No sky: the moon preference is removed. A square answers the Hum, not the
       heavens.
       Penalty: the Corner's price (exists).
       End-game:
              80 A Square of Your Own. Cut a square in one of your houses: Corner-Work may
              be done there. This is an exception to the home-working rule: it takes no tag, but
              no other working can share that house.
              85 The Four Prices Paid at Once. Once a Count, work one bargain from each
              Corner together, paying all four prices. The four workings last a whole Count.

Facetcraft (one House's cuts)
Crystal Magic .7 · Gem-Cutting .3

       Reagents: cut crystal, one per facet (exists).
       Grimoire — your House's Cut-Book: lent by your Lapidary House. It must be returned
       if you leave, and with it every cut it holds.
       Artifact — the House Master-Stone: each House keeps one. Reaching Exalted with
       your House lets you carry it for a season, and while you do, your facets never crack in
       the Drone.
       No sky: the moon preference is removed. Crystal answers the Hum.
       Penalty: facets crack in the Drone and the Choir (exists), and leaving your House
       costs you its cuts.

       End-game:
              80 A Facet of Each House. Once, learn one cut from another House without
              leaving your own.
              85 The Singing Stone. A facet that is not spent when broken, only dimmed for a
              day.

The Burned Verse — Sunscript (light that writes)
Inscription .7 · Poetry .3 · Stars (the sun's House)

The most furnished school in the game, because the Verse-Wrights are the most
furnished people in Topila.

       Focus — the sun-glass lens: every verse is burned through one. Its quality is the
       verse's power, and without it nothing burns.
       Reagents: poem-banners and sun-glass (exist).
       Grimoire — the Burned Anthology: the ash-ghosts of every verse you have burned.
       Any verse in it can be read again from the ashes once a day without a new banner.
       Artifact — the Lens of the Burning Hand: the Wrights' great lens, lent for a season to
       a Wright who has burned a hundred verses. Through it, noon verses work at any hour
       of daylight.
       Faith: a blank page accepted by Iru, burned into a banner, makes that verse's working
       last three times as long.
       Penalty: each banner burns once and is gone.
       End-game:
              80 The Noon Anthology. At noon, read every verse in your Anthology at once.
              85 A Verse the Sun Accepted. Burn a verse into your own skin. Its working is
              permanent, and you can never burn another into the bone.

The Singing Lattice (new) — crystal built into a house
Crystal Magic .55 · Geomancy .3 · Hum-Reading .15

In Khaderun some houses are built around crystal lattices that hum with the Murmur. A
Lapidary House cuts the crystal and a Measurer of the Angles lays the figure; the lattice
holds the hum and gives it back.

       Learned: at the Lapidary Houses, by those who already know a cut and a figure.

       Home working — Lattice-Sung: a crystal lattice in one property, renewed each
       season. While you are home, Will refills twice as fast, facets you cut there need one
       crystal fewer, and stored facets never crack.
       Reagents: cut crystal and star-lapis.
       Penalty — resonance: a lattice in a house in the Drone cracks within a season, and
       one in the Choir within days. Where you build matters.
       Workings:
              65 The Humming Room: all learning +8% while at the lattice's house.
              70 The Stored Murmur: catch the Murmur in a facet and carry it, so that for a day
              you work as if in the Murmur anywhere.
              75 ★ A Lattice in the Bones: for good, the Drone bends you less.
       End-game:
              80 The Chorus Lattice. Join two of your houses' lattices: each counts as being at
              both.
              85 The Still Point. For a season, the Hum cannot reach the lattice's house. It is the
              only quiet room in the East.

Three new schools from new peoples
These three are not reworkings of existing schools. Each belongs to a people the game
has not met yet, lives in a real place on the map, and puts a discipline to work that no other
school uses the same way. They show what the discipline layer is for: Illusion here is not
Marre's mirror-craft, Alteration is not the giants' swelling, and Transmutation is not the
Crucible's fire.

The Shade-Walk — the Vessi of the Under-Canopy (East)
Illusion .5 · Sneaking .3 · Tracking .2 · Moon (dark; weakest at the full)

Past Therama's Edge of the Trees, under a canopy three hundred feet up where the giants
walk, live the Vessi. To be seen by a giant is to be stepped on, so the Vessi learned long ago
not to be looked at. Their magic is Illusion turned inside out. Marre's masquers make the
eye see something; a Vessi hunter makes it see nothing. Their great art is sending your
shadow ahead of you, to walk where you dare not and come back with what it found.

       In the world:

              a new wild location, the Under-Canopy, reached from the Edge of the Trees with
              Tracking 65 and Sneaking 65;
              two sub-locations there: the Shade-Lodges, hammock villages in the buttress-
              roots, and the Giant-Paths;
              Vessi traders at the Edge once a season, selling shade-paint and giant-fern;
              road encounters near the Edge, and two named Vessi elders;
              a codex entry, "The Vessi of the Under-Canopy".
       Learned: on the hunt. Each working is learned by going on a dark-moon hunt with an
       elder, never from anything written.
       Reagents: shade-paint, soot of burned giant-fern in resin, painted on the skin for each
       working.
       Penalty — shadowless: while your shade is out you cast none. In towns and cities
       people feel it: Social learning −20% and a little notoriety for each day you spend there.
       In the wild it costs nothing.
       What it lacks, and why: no grimoire (the elders sing it), no focus, no home working
       (the Vessi sleep in hammocks), no artifact and no god anyone else can name.
       Workings:
              65 Send the Shade: journeys through wild places are 20% quicker for a day.
              68 The Unlooked-At: in wild places, dangers are halved for a day.
              72 Shade-Stalk: hunting and tracking yields +30% for a day.
              76 Two Shadows: a decoy shade means no fight in the wild can be lost outright for
              a day; a loss becomes a retreat.
              80 ★ Born in the Dark: for good, Sneaking and Tracking +8%, and no shadowless
              penalty at night.
       End-game:
              82 The Giant's Blind Side. Walk the Giant-Paths in the canopy itself, where a
              hidden place waits.
              85 Leave the Shadow Home. For a season your shade hunts for you every day,
              bringing meat and hides wherever you are. You are shadowless the whole season.

The Rime-Watch — the dike-watch of the Deichmarsch (Seven)
Alteration .5 · Warding .3 · Ice-Craft .2 · Season (strongest in winter, weakest in summer)

The Deichmarsch is land taken from the sea and kept behind dikes, and in the winter
storms the sea comes back for it. The Rime-Watch is a sworn watch of dike-reeves, paid
by the Republic of Luggen. On the worst nights they stand on the dike and change the
nature of the water breaking over it, so that it stops and stands as ice. They are unsmiling,
they keep four-hour watches, and they have never lost the Marsh. Their Alteration is a
soldier's magic: defensive, placed, and done out in the weather.

       In the world:
              a new sub-location, the Watch-Houses on the Dike, at the Deichmarsch;
              winter storms there bring the Surge, a night when the Watch is out in force;
              a Dike-Count and two reeves as named people;
              a codex entry, "The Rime-Watch".
       Learned — by service: no working is taught. Each is granted by the Watch once you
       have stood enough watches on the dike; winter nights count double and the Surge
       counts five times over.
       Ranks: Watchman, Reeve and Dike-Count. Each needs watches stood and standing
       with Luggen, and higher workings are granted only to higher ranks.
       Artifact — the Reeve's Horn: blown in the great Surge and given to a Dike-Count.
       Carried, it makes every rime-wall last twice as long.
       Faith: Norrae's faithful are welcome on the dike. For them, a rime-wall over a river also
       counts as blessing it.
       Penalty — exposure: every working is done out in the cold and costs health.
       Endurance and Ice-Craft lessen it.
       What it lacks, and why: no grimoire (the Watch-Roll records watches, not workings),
       no reagents (water and cold are free), no focus and no home working. It guards a dike,
       not a house.
       Workings:
              5 Hold the Spray: for a day, no cold or drowning danger on the water.
              15 Rime-Wall: set at a place, it halves the dangers there for six days.
              25 Freeze the Ford: journeys that cross rivers are 15% quicker for a day.
              35 Ice-Road: ice-fishing and rafting out of season, on ice you make, for a day.
              45 The Stopped Wave: drowning cannot touch you and harm is 6% less, for two
              days.
              55 ★ Watch-Hardened: for good, Endurance +8% and the cold never harms you.
       End-game:

              62 The Long Wall. A rime-wall that holds for a whole season wherever you set it.
              85 Stand the Surge. Once a year, in a winter storm, stand the dike alone for a
              night. If you hold, your name is cut into the dike-stone and Luggen does not forget
              it.

The Long Wake — the furrow-folk of Gramall (Gallar)
Transmutation .5 · Nature Magic .25 · Mycology .25 · Moon (waning)

On Hobb's Furrow, out on the Dorrian prairie, the dead are not buried in churchyards. They
are ploughed into the fields they worked, and the Great Wake at the end of autumn is a
two-day feast over the new graves. The furrow-folk say nothing dies; it only changes
fields. Their magic is rot made useful, hurrying dead things into living ones. It is earthy and
a little disgusting, and every farmer in Gramall loves it. Seronia's Ringed call it grave-theft.

       In the world:
              a new sub-location at Hobb's Furrow, the Wake-Fields;
              the existing Great Wake becomes the school's festival;
              a furrow-elder and a ploughwright as named people;
              a codex entry, "The Long Wake".
       Learned — grown: a working is planted, not taught. Bury a seed-bundle of rot and the
       working's token in the Wake-Fields. It ripens after some days (more for higher
       workings), and you dig it up to know it. Leave it for a season and it rots away. During
       the Great Wake, a planting ripens overnight.
       Home working — the Wake-Field: rot buried under a property's plots. For a season
       they yield double and never fail to frost, but the house smells: comfort −2.
       Reagents — rot: spoiled food, offal and bones from butchery, and dung from your own
       animals.
       Faith: Seronia's faithful may not learn it, and others who practise it lose standing with
       the Ringed. The Maw of the Four Corners loves it: its faithful work the Long Wake at
       ×1.3.
       Penalty — the smell: for a day after each working, Social learning is −15% and friends
       gain less from you.
       What it lacks, and why: no grimoire (it is grown, not written), no focus, no artifact. A
       field is the only relic it needs.
       Workings:

              15 Turn the Rot: spoiled food becomes compost, and your plots grow faster for a
              season.
              20 The Hot Heap: a compost-heap's heat cooks and brews without fuel for a day.
              25 The Mushroom-Bed: Mycology yields +40% for two days.
              30 The Fattening: your livestock give 25% more for three days.
              35 Turn a Wound: heals 30, and a festering sickness is turned out.
              45 ★ Furrow-Blooded: for good, food spoils half as fast, and Mycology and
              Farming +5%.
       End-game:
              60 Turn the Year. For a season your plots never need muck: whatever you discard
              feeds them.
              85 What the Field Gives Back. Once a year, at the Great Wake, plough in
              something dead and great — an old beast you kept, a giant's bones — and the
              field returns something rare.

More ways schools differ
Every school has its own way of being learned, and no two share one. Five further
distinctions are optional: an order with ranks, strictures, rivalries, standing under the law,
and marks left on the body. Each appears in only a handful of schools.

How each school is learned

   School                                       Learned by   How it works in play

   The Hedge-Arts                               Gift         A wise-woman trades each charm for a gift;
                                                             unused charms are forgotten

   Hermetic Evocation                           Copying      From the Collegium library, for a fee,
                                                             matriculated only

   Hermetic Warding                             Copying,     Copied at a warden's house; a seal-master
                                                checked      must pass your first casting

   The Silvered Masque                          Catching     Each reflection is caught in a mirror at its own
                                                             place in Marre

   The Starward                                 Observing    At an observatory, at night, under a clear sky
   Reckoning

   School                                       Learned by           How it works in play

   Pact-Calling                                 Reading ruins        Each pact is a name on a Vaelis lintel

   Grave-Lore                                   A forbidden          The Black Codex, a page a night
                                                book

   The Green Way                                Vigil                At a grove, each ask only in its own season

   Stave-Craft                                  Carving              The carvers teach you to cut it, and cutting it
                                                                     is knowing it

   The Hollow Lights                            Hunting              A wisp of the right colour, which may get away

   Hill-Bargaining                              Being offered        Never learned; the Gentry offer at twilight

   The Soft Light                               The Church           Taught by Dell's clergy to those in good
                                                                     standing

   La Grandeur                                  Glyphs               Read from the thrones at the Colossi

   The Hush                                     Forgetting           Found only by forgetting you are looking

   The Hollow Masque                            Lending              Each working is a mask lent for one Hollow
                                                                     Night; wear it to keep it

   The Rime-Watch                               Service              Granted after enough watches on the dike

   Pyromancy                                    Drill and proof      Drilled in the Burning Yard, proven in the
                                                                     Crucible; a failed proof burns

   Witchlore                                    Survivors' telling   Told by those who stood near the Queens and
                                                                     lived

   The Dreaming of Nim                          Dreaming             Each descent may teach another

   The Crucible Art                             Re-forging           Bring a working you know from each parent
                                                                     school; the master forges them into one

   The Long Wake                                Growing              Planted in the Wake-Fields; ripens in days

   Geomancy of the                              Proof                A proof in parchment that may not close
   Angles

   Name-Binding                                 Trust                Copied at the Tablet-House; friends tell you
                                                                     their names when they trust you

   Red-Reading                                  Blood                A drop of your own, watching Gisgal at night

   School                                       Learned by   How it works in play

   The Tablets of the Sky                       Firing       Fired only while its Wanderer is at home

   Corner-Work                                  Opening      A Corner teaches what it wants known,
                                                             through a square

   Facetcraft                                   Allegiance   One House at a time; leave it and lose its cuts

   The Burned Verse                             Burning      A verse burned under a Verse-Wright's lens

   The Singing Lattice                          Building     Learned by building a lattice beside a Cutter
                                                             and a Measurer

   The Shade-Walk                               The hunt     A dark-moon hunt with an elder for each
                                                             working

Implementation: learn:{mode, …} on each school. Most modes reuse an existing check
(place, time, sky, standing, items, chance). Four modes are new code:

       Service: a counter of watches stood.
       Growing: a planting with a ripen date.
       Lending: a mask kept only by wearing it on the night.
       Re-forging: consumes one known spell from each parent school's list.

Orders and ranks (7 schools)
Only these schools have an institution you rise in. Elsewhere, magic is learned alone or
one-to-one.

       The Collegium (Evocation and Warding): Scholar, Bachelor and Master. The end-game
       proofs need a Master's degree, won in a disputation.
       The Scorched School: a proof in the Crucible marks each rank. Rank is also shown by
       scars (see marks).
       The Rime-Watch: Watchman, Reeve and Dike-Count.
       The Lapidary Houses: standing with your House gates your cuts.
       The Church of Dell: the Soft Light follows your standing with the Church.
       The Mask-Wardens: they lend the Hollow Masque's masks by rank.
       The Verse-Wrights: a count of verses burned makes you Wright, Lens-Bearer, and
       then Master of the Burning Hand.

Strictures (6 schools)
A stricture is a rule of practice that, if broken, costs the school something.

       The Hedge-Arts: a charm is never sold. Charm work done for pay spoils that charm for
       a season.
       Stave-Craft: a stave works only for whoever cut it. Bought staves are just wood.
       Hill-Bargaining: refuse the Gentry twice running and they offer nothing for a season.
       Witchlore: Countermagic unpicks your own bound spirits and Fae bargains. Its adepts
       may hold neither.
       Grave-Lore: never by daylight, unless you carry the Black Codex.
       The Shade-Walk: what the shade finds first is the shade's. Half of any find made with
       it is left in the forest.

Rivalries (5 pairs)
Practising one school of a pair costs standing with the other's people.

       The Collegium and the hedge wise-women: mild.
       The Scorched School and the Collegium: sharp. The Crucible Art is learned in spite of
       both.
       Grave-Lore and the Long Wake: you do not question the dead, you plough them.
       Hill-Bargaining and Witchlore: one makes bargains, the other unpicks them.
       Corner-Work and the Soft Light: Dell's lamps will not burn for one who bargains in
       squares.

The law (5 schools)
Whether a school is legal depends on the realm. A LEGAL[realm][school] table holds a
notoriety multiplier or a fee.

       Grave-Lore: unlawful in Eintenn and Dellian, where notoriety is doubled; honoured in
       Grell.
       Corner-Work: licensed in Thoolma, with a fee per working in Plandor; open in the
       south.
       The Silvered Masque: licensed for Marre's theatres. Elsewhere in Marre, unlicensed
       work draws notice.
       Red-Reading: tolerated only in Elissar. Elsewhere in Qoul, each reading draws
       notoriety.

       The Long Wake: frowned on in Fin, where the Ringed hold sway.

Marks on the body (7 schools)
These marks show on your character sheet. Each one changes how people or places treat
you.

       La Grandeur: Bulk (exists).
       The Hush: Fade (exists).
       Pyromancy: scorch-scars. The Scorched School respects them, and Dell's legates do
       not.
       The Hollow Masque: a thinned face.
       The Shade-Walk: no shadow.
       The Rime-Watch: frost-bitten hands. Fine work is harder for a while after the Surge.
       The Long Wake: the smell.

Contests (4 schools)
Each contest is held at a set time and place.

       The Collegium's disputations: won for degrees.
       The Scorched School's proving-bouts: won for rank.
       The Contest of Tables at Topila (exists): the Burned Verse.
       The Vessi shade-race through the Giant-Paths: a race between your shadow and
       others'.

Implementation
The update ships in three phases. Each phase leaves the game playable, and phase 1
changes nothing a player can lose.

   Phase                      What lands                               Schools that change most

   1. Structure                SCHOOLS object, school level,           All; Starward Reckoning, Burned
                              secondaries, XP split, discipline        Verse, Pyromancy
                              renames, the Light Magic merge, the
                              three new disciplines and their
                              twelve training spots, the sky and its
                              UI chip, skyMult

   Phase                      What lands                              Schools that change most

   2. Features                Home-working tags, grimoires,           Warding, Pact-Calling, Grave-Lore,
                              artifacts, foci, new reagents, faith    Green Way, Soft Light, Geomancy
                              ties, new penalties

   3. New and                 The seven new schools (four built       Hollow Masque, Crucible, Tablets of
   high                       from existing disciplines, three from   the Sky, Singing Lattice, Shade-
                              new peoples with their places,          Walk, Rime-Watch, Long Wake
                              people and codex entries), and two
                              end-game workings for each of the
                              23 existing schools

Data
        SCHOOLS[id] (new file schools.js ): { n, i, land, prim, sec:[[skill,w]], up,
       down, skyFav, skyFrown, home, grim, focus, faith, pen, at, learn, cost,
       cond } . The existing ARC[skill] entries move into it, keyed by school. The 23
       existing schools keep ids equal to their primary skill, so old saves and SPELLS[x].s
       still resolve.
        SPELLS[x].sch defaults to .s . The four new schools' spells set .sch explicitly.

        schLv(sch) = Σ w·lv. It replaces lv(sp.s) in pw , learnCheck and castCheck .
       Casting XP goes to each skill × its weight.
        sky.js : sunHouse(D) , wanderer(w, D) , conj(D) , greatConj(D) , darkSun(D) ,
        skyMult(sch) . The UI chip shows the sun's House to everyone and the Wanderers
       from Astrology 20.
       Home working: S.homes[res].tag = { sch, id, until, p } . Spells with
        home:true set it; homeTagFx(res) feeds homeComfort , station tiers, plot rules, Will
       rate and theft. Geomancy's S.figs moves under the tag.
       Grimoire: S.grim[sch] = { entries:{}, since } , with a per-school grim.fx(sp)
       that adjusts cost, misfire or power. The Dream-Journal and the Red Ledger page
       migrate from existing state.
       Artifacts: items with artifact:sch that arcanaFx reads while they are carried.
       Each has a single source: an explore find, a standing tier, or a count of workings.
       Foci: focus:item on the school. castCheck requires it unless the school defines a
       fallback (Evocation's double misfire). Focus quality × 0.05 is added to power.

       Faith ties: faith:{ d, need, boost(sp), ban } , read by learnCheck , castCheck
       and pw . They hook into the faith engine's fwIs .

Migration
       Known spells stay known, and grandfathered spells stay castable.
       Every renamed discipline keeps its id: only its name, description, codex text and the
       strings that name it change. Lanterncraft XP folds into Light Magic ( lumencraft ): the
       higher total plus a quarter of the lower. The old id stays as an alias, and the two knack
       sets are merged.
       Existing Geomancy figures become an Angled House tag lasting a full season from the
       update. An existing Threshold seal becomes a Warded House tag for its remaining
       days.
       Demonology and Facetcraft lose their moon phases. Nothing else does.

Tests
       School level equals the skill level for pure schools and matches the weighted sum for
       blended ones. A text lint finds no old discipline name (Hedgecraft, Druidism,
       Lumencraft, Lanterncraft, Hill-Bargaining and so on) in any skill, boon, knack or help
       string, while school names may keep theirs. Each new discipline trains in all four lands.
       No school shows a moon or sky line it does not use.
       Each property holds at most one tag, and it lapses on time.
       Each feature's count matches the matrix.
       Every new item and reagent has a source and a use.
       No East workings exceed 85.
       A Great Conjunction and a Darkened Sun each occur at least once in a simulated
       three-year run.

Open questions
       Should the sun's House also give everyone a small seasonal flavour, such as +5% to its
       skill family, or stay magic-only as written?
       Should a property's magical tag show on the Home tab's card for that house
       (proposed), or only in the codex?
       Should the Long Guest's lost season count against faith obligations? It is cruel, and in
       character for the Gentry.

       Should the verse discipline be the plain "Inscription" (proposed, in keeping with the
       generic layer), or keep "Sunscript"? Decided: Inscription.
       Should schools whose name was the old skill's name (Witchlore, the Hush, Red-
       Reading, Name-Binding, Facetcraft) keep it as the school's name (proposed), or take
       new ones? Decided: schools keep their old names.

Built in v81: where the game differs from this design
Everything above is in the game as of v81. These are the places where the built version
simplifies or departs from the design:

       The Crucible's re-forging needs you to know a Pyromancy calling and an Evocation
       proof near the new working's depth. Nothing is consumed.
       The Tablets of the Sky are learned at night under a clear sky with star-clay. The design
       also required the tablet's Wanderer to be at home, but that would have kept the
       Drowned Star's tablet out of reach for years, so that rule was dropped. Tablets still
       crack when their Wanderer changes House.
       The Great Conjunction now means three Wanderers in the sun's own House. It comes
       about one day a year; the old rule gave about nine.
       Effects narrowed to what the engine can express:
              Proof-Fire gives +5 to all crafting quality, not just smithing and glass.
              The Calcined Ore gives mining +25% rather than a tier-higher metal.
              Seal of the Road is 8% less harm for a season, not "the first harm each day halved".
              Two Shadows and the Wildfire Calling give less harm and better odds rather than
              "a loss becomes a retreat".
              The Stopped Wave and Hold the Spray reduce mishaps generally, not just
              drowning and cold.
              Proof of the Second Sun lets daylight verses be read at night and gives +6 crafting
              quality. It does not change every daylight rule.
              The Unwitched turns any harm into Will, not only witch-harm.
       The Great Nativity chooses your star from your name rather than offering a choice.
       Unmade always forgets the faction that thinks worst of you.
       The Glass Court and Ask a King pick the realm you are in, and one of your top skills,
       rather than offering choices.
       Not yet built:

              The two reeves at the Watch-Houses and the ploughwright at the Furrow. The
              Dike-Count (Ebba Rhoon), Mother Hobb, and the Vessi elders Oru and Tavi are in
              the game.
              The Vessi's once-a-season traders. Shade-paint is sold in the Under-Canopy and
              traded for salt at the Wall of Trees all year.
              Corner-Work's ×1.3 in its own Count days.
              The Hedge-Arts' forgetting of unused charms.
              The Tablet-Shelf's cracking on each binding.
       Tests: t82 covers school levels, the seven new schools, two high workings per school,
       the East's cap of 85, feature counts, one working per property, learning modes,
       cracking tablets, faith bans, the sky over three years and the Magic page.

Built in v82
       Built since v81:
              Reeves Tjalda Wierum and Okke Brand at the Watch-Houses, and Ansel the
              Ploughwright at the Furrow.
              The Vessi trade at the Edge for two days each season. Shade-paint now needs
              giant-fern.
              Corner-Work keeps the Count: ×1.3 in a Corner's own days, and in the Unlit Days
              only the Unreckoned answers, at ×2.
              Unused charms are forgotten after two seasons.
              Name-Binding cracks its tablet on each binding, so the next binding of that name
              costs a tablet-clay.
       New small features:
              Ice-carving for the frost-fair in winter (Rime-Watch).
              A shade on a season's hunt brings back a friend's taste (Shade-Walk).
              The Night of Borrowed Faces in Perlinburg on Hollow Nights (Hollow Masque).
              The Disputation of Fire each summer between the Collegium and the Scorched
              School.
       Bug fixes:
              Mirror reflections learned in Marre were wrongly restricted to their learning
              place. A separate casting-place field now limits only the four workings meant to
              be cast in one spot.

              Staves cut after the update were not counted as cut by the player, so they did
              nothing. Crafting now records them.
              Rime-Watch perms now need their watches.
       Balance:
              Once a day: a Masque of Many, Stride of the Colossi and the Lantern Procession.
              Once a year: the Long Guest and Unmade.
              Once a Count: the Four Prices.
              The Rime-Wall is now a third fewer mishaps, not half.
              Two Shadows is now 15% less harm.
              The Giant's Seat is +25% to win fights, and costs Will.
              The Pact of the Steward needs candles and honey.
              The Hound's tablet is now +15% to journeys, since it rarely lasts more than a day.
              The dead will not work a Wake-Field.
              Charm-work for coin now spoils a charm only sometimes, and only for three days.
       Tests: t83 covers all of the above, plus a three-year run casting with every school and
       faith, checking for errors and runaway numbers.

```

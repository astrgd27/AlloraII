# Phase 2 · A real game, with every system

**Status: approved by the owner, 2026-11-17** ("continue on to phase 2 with these changes incorporated"). Issues are #56–#72, in the order below.

**Goal:** the same small map (Eintenn and Marre, 160 places), now played through an interface that looks and behaves like a heavy simulation game, and carrying a first working version of every system the bible describes. Phases 3 to 5 are then mostly content.

**Owner's direction for this phase (2026-11-17, in CLAUDE.md):**
- Tablets and computers only. No phone layouts.
- It should look like a real game of the heavy-simulation kind: a full-screen map, a top bar, framed panels, clear state, tooltips.
- Every click answers. What the life is doing is always on screen.
- No design talk in the game and no walls of instructions. Useful information and short hints are welcome.

**Gate (all must hold before Phase 3):**
- The owner can play a game week in Ostwick on a tablet or computer without confusion (the line Phase 1 failed).
- Every system below has a first working version, with tests.
- No earning persona is flagged for inflation: the money a life holds grows by under 3% a year by year ten.
- The three trades climb at visibly different paces and by different means.
- One game day still simulates in under 20 ms; `pnpm lint:content` is clean.

## Issues

### A. The interface (first)

1. **The game shell.** Full-screen map as the world; a top bar (date and hour, time controls, purse, needs); framed panels at the sides; a "now" bar that always shows what the life is doing and how far along; a visual language (colour, type, frames, icons) fit for a simulation game. Landscape, 1024 px and up. *(done)*
2. **Every click answers.** Buttons that cannot act are disabled and say why on hover. A refused order explains itself where it was given. A short log of what just happened. *(done)*
3. **The place panel.** One panel for where you are: the scene, who is here, what can be done, the market, the post, in tabs. Tooltips for hours, pay, odds and skills. *(done)*
4. **The character sheet.** Needs, skills with gates, the career ladder, purse and pack, standing orders, and the away report, as proper panels. *(done)*
5. **The map.** Pan and zoom, labels that thin out by zoom, drawn terrain and water, the route to a chosen place with its hours, and the life moving along it. *(done)*
6. **Time controls.** Pause, play and a faster speed for watching. *(New mechanic: the gap is that a simulation game is watched as well as left. For the owner to confirm; the slow default stays.)* *(done)*

### B. The systems still missing

7. **Homes and lodging.** A rented room, then a cottage: rent, comfort, sleeping well away from home at an inn for a price. The first real money sink. *(done)*
8. **Items and tools.** Things with properties: tools that help work and wear out, clothes, food kinds. The smith's commission becomes an object with a quality.
9. **Dues, fares and tolls,** and wage tuning, until the inflation flag clears.
10. **The trades diverge.** One deep feature each: the smith's materials and techniques; the butler's Trust and Harmony; the inquirer's case board with time pressure.
11. **Weather, seasons and the calendar.** Weather on the road, market and feast days from canon faiths, seasonal work.
12. **Bonds.** Acquaintance to friendship: gifts, favours, people who remember, and what a friend opens.
13. **Faith.** One faith playable end to end in Eintenn, grown from canon.
14. **Magic.** One school learnable at the Collegium, by the rules of `canon/magic_design.md`. Countermagic stays the nearest a player comes to witch magic.
15. **Several lives and the Tapestry.** A second and third life, the lives strip, switching, and standing orders for the ones not in focus.
16. **The codex.** In-world reference for places, people, skills and faiths the life has met. No design talk.
17. **Balance and the gate review.**

## Decisions

(Record decisions here as they are made, with the date and the reason.)

- **2026-11-17 · The stack stays.** TypeScript, React for panels, PixiJS for the map and scenes, the engine in a worker. The owner asked whether the language was right for a game of this kind. The dense panels, tables and tooltips of a simulation game are what the browser does well; the map is already GPU-drawn; the engine is separate from the screen, so the interface can be rebuilt without touching rules, content or saves. A desktop wrapper remains possible later.
- **2026-11-17 · The text rule is restated** in CLAUDE.md. It was aimed at design notes and long instructions leaking into the game, not at useful information.
- **2026-11-17 · The game shell (#56).** The page is now one fixed screen. Decisions:
  - **Layout:** a top bar (title, date and hour, the three needs as bars with numbers, the purse); the life's own panels on the left (calling, skills, standing orders, the away report); the map in the middle; the place on the right (scene, people, work, market); and along the bottom the **now bar**.
  - **The now bar always answers "what am I doing?":** at leisure, working (with what, hours left and a progress bar), on a case step, travelling (where to, hours to go), camped, or asleep. Its button stops the work or turns back.
  - **One look:** dark slate, parchment text, brass frames and headings, one type family. Always dark; the light scheme is gone. Framed panels with small-caps headings; nothing floats loose on the page.
  - **No phone layout.** The screen is laid out for 1024 px and wider. At tablet width the side columns narrow so the map keeps its room.
  - **The map shows one realm at a time,** as large as its frame allows, with a tab for each realm. It follows the life unless another realm is picked. Side by side, two realms were too small to read at tablet width. Pan, zoom and drawn terrain are #60.
  - **A refused order** now shows in the now bar and clears with the next order. Before, it stayed at the foot of the page for good. Doing this properly is #57.
  - **Empty panels say why** in a line ("Nobody is about.", "Nothing to be done here at this hour.").
  - **Work now shows its pay** beside its hours.
- **2026-11-18 · Every click answers (#57).** Decisions:
  - **All the work of a place is listed,** not only what can be begun this hour. What cannot be begun is shown disabled with its reason under it ("From the 7th hour to the 18th", "Only in spring", "Busy", "Asleep"). Duties of a post the life does not hold are not shown.
  - **Every disabled button says why** on hover: people while asleep, setting out while busy, a case step away from the workshop, buying with too little money or a full pack. The engine works out each reason and sends it with the state, so the page holds no rules.
  - **A refused order shows where the player clicked,** in a red note that fades after four seconds. It used to sit at the foot of the page for good.
  - **"Lately":** the last twelve things that happened (work done and its pay, a check's result, cases closed, a new rank, arrivals, things on the road, people met, things bought and sold), newest first. The engine keeps the last forty. Save version 12.
  - **A browser test in CI** (`pnpm e2e`, job `play`): it plays the built game, clicks 75 buttons over three games, and fails if any click changes nothing and says nothing, or if a disabled button gives no reason.
- **2026-11-18 · The place panel (#58).** Decisions:
  - **The right column is the place:** the scene on top, then one tabbed panel. *Work* (with how many can be begun now), *People* (with how many are here), *Market*, and *Calling* where a post can be taken or worked. On the road the tabs give way to the pack.
  - **The market is a price board:** goods, what one costs, what one fetches, how many are carried; prices are the buttons. The board says when the market opens if it is shut.
  - **Tooltips:** work shows what it is, what it trains, the odds in numbers and why it cannot be begun; prices say what they are; goods show their usual worth.
  - **The left "Calling" panel** now shows the post held as a ladder of its four ranks, standing, and a bar towards the next trial. With no post it says where posts are taken up.
- **2026-11-18 · The character sheet (#59).** The left column is the life's sheet. Decisions:
  - **Sections, top to bottom:** the away report (when there is one), *The life* (home, purse, pack), *Calling*, *Skills*, *Standing orders*, *Lately*. The needs stay in the top bar, where they are always seen.
  - **Skills are grouped by family** and show level over cap (e.g. 12/25). A skill held at its cap shows its level in red, and its tooltip names the gate that holds it.
  - **The hours of sleep can be changed** from the sheet, an hour at a time. The engine refuses a night shorter than four hours or longer than twelve, and says so.
  - Every standing order has a tooltip saying what it does.
- **2026-11-18 · The map (#60).** Decisions:
  - **Pan and zoom:** drag to move, the wheel to zoom about the pointer, and four tools at the corner: closer, further, the whole realm, and find the life. Zoom runs from the whole realm to six times closer.
  - **Names thin out by themselves:** each is placed only where it fits, towns first, then canon villages, then new ones, then the wild. Zoom in and more appear. Towns are drawn larger and bold, as squares.
  - **Drawn ground:** the realm is a land panel; wild places sit in dark woods, settled ones in fields; ways by boat run through water.
  - **The way is drawn:** choose a place and the quickest way there shows in brass with its hours; on a journey, the way still to go. Routes come from the engine's own `World`, so the page finds no paths of its own.
  - The canvas keeps to its frame at every size.
- **2026-11-18 · Time controls (#61).** Decisions:
  - **Pause and three paces** in the top bar: a game hour each minute (the usual pace), each six seconds, and each second. Space pauses; 1, 2 and 3 set the pace.
  - **The faster paces are for watching only.** Time away is always caught up at the usual pace, so a fast clock never makes the game run on while closed. The pace is not saved: a new visit starts at the usual pace.
  - **Paused means paused everywhere:** a paused life does not live on while the page is closed either.
  - New mechanic, for the owner to confirm: the gap is that a simulation game is watched as well as left alone.
- **2026-11-18 · Homes and lodging (#62).** Decisions:
  - **A life rents its bed.** A new life starts in a rented room in Ostwick. Rent falls due at midnight: a room 0.6 pf a day in a village and 1.2 in a town; a cottage 2 and 4.5. (A room costs about a loaf and a half a day; Allora I prices bread at 1.5 pf.) Old saves get a room where their home was.
  - **What a home gives:** a room restores 10 vigour an hour asleep and lifts the spirits by 1 a night; a cottage 12 and 2. An inn bed gives 9; sleeping rough, 6.
  - **Arrears:** rent that cannot be paid is owed; a week of it and the life is turned out (the log says so). A life with no home sleeps at inns or rough. Moving or leaving needs the arrears paid.
  - **Inns:** away from home in any town or village, an inn bed is taken at bedtime and paid once a night (0.8 pf, 1.6 in a town), unless the new standing order "Inns on the road" is off.
  - **A Lodging tab** at every town and village lets rooms and cottages and gives the inn's price. The sheet shows the home, its rent and anything owed.
  - **Balance:** careerists move into a cottage once they have 200 pf. Spending rises (a smith now about 6 pf a day in a town cottage) but the purse still grows far faster than 3% a year; that is #64.
  - Save version 13.

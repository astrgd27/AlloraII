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
2. **Every click answers.** Buttons that cannot act are disabled and say why on hover. A refused order explains itself where it was given. A short log of what just happened.
3. **The place panel.** One panel for where you are: the scene, who is here, what can be done, the market, the post, in tabs. Tooltips for hours, pay, odds and skills.
4. **The character sheet.** Needs, skills with gates, the career ladder, purse and pack, standing orders, and the away report, as proper panels.
5. **The map.** Pan and zoom, labels that thin out by zoom, drawn terrain and water, the route to a chosen place with its hours, and the life moving along it.
6. **Time controls.** Pause, play and a faster speed for watching. *(New mechanic: the gap is that a simulation game is watched as well as left. For the owner to confirm; the slow default stays.)*

### B. The systems still missing

7. **Homes and lodging.** A rented room, then a cottage: rent, comfort, sleeping well away from home at an inn for a price. The first real money sink.
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

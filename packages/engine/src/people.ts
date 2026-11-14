/**
 * People with routines: where each person is at each hour, meeting them, and
 * talking with those you know. Schedules are read as Allora I reads them.
 */
import type { GameDate } from './calendar';
import type { GameState } from './state';
import type { Person, World } from './world';

/** What a life knows of a person. */
export interface Bond {
  /** Times talked. */
  talks: number;
  /** The day of the year on which they last talked, so a talk counts once a day. */
  lastTalkDay: number;
}

/** The last thing someone said to the life. */
export interface Words {
  person: string;
  kind: 'meet' | 'talk';
  /** Which of the person's talk lines, for `talk`. */
  line: number;
}

export const SPIRITS = { meet: 3, talk: 2 };

const inHours = (h: [number, number], hour: number): boolean =>
  h[0] <= h[1] ? hour >= h[0] && hour < h[1] : hour >= h[0] || hour < h[1];

/** Where a person is now: the first line of their day that fits, else the first line. */
export function whereIs(person: Person, date: GameDate): { place: string; sub: string } {
  const entry =
    person.sched.find(
      (e) => (!e.s || e.s.includes(date.seasonIndex)) && (!e.h || inHours(e.h, date.hour)),
    ) ?? person.sched[0];
  if (!entry) throw new Error(`${person.id} has no schedule`);
  return { place: entry.at[0], sub: entry.at[1] };
}

/** The people at a place now, with the sub-place each is in. */
export function peopleAt(
  world: World,
  place: string,
  date: GameDate,
): { id: string; sub: string }[] {
  const here: { id: string; sub: string }[] = [];
  for (const person of world.people.values()) {
    const at = whereIs(person, date);
    if (at.place === place) here.push({ id: person.id, sub: at.sub });
  }
  return here;
}

const clamp = (n: number): number => Math.max(0, Math.min(100, n));

function present(state: GameState, world: World, id: string, date: GameDate): Person {
  const person = world.people.get(id);
  if (!person) throw new Error(`No such person: ${id}`);
  if (state.journey) throw new Error('On the road');
  if (state.asleep) throw new Error('Asleep');
  if (whereIs(person, date).place !== state.place) throw new Error('Not here');
  return person;
}

/** Meets someone for the first time. */
export function meet(state: GameState, world: World, id: string, date: GameDate): void {
  present(state, world, id, date);
  if (state.bonds[id]) throw new Error('Already met');
  state.bonds[id] = { talks: 0, lastTalkDay: -1 };
  state.needs.spirits = clamp(state.needs.spirits + SPIRITS.meet);
  state.words = { person: id, kind: 'meet', line: 0 };
}

/** Talks with someone already met. Lifts the spirits once a day for each person. */
export function talk(state: GameState, world: World, id: string, date: GameDate): void {
  const person = present(state, world, id, date);
  const bond = state.bonds[id];
  if (!bond) throw new Error('Not yet met');
  const today = (date.year - 1) * 1000 + date.dayOfYear;
  if (bond.lastTalkDay !== today) {
    state.needs.spirits = clamp(state.needs.spirits + SPIRITS.talk);
    bond.lastTalkDay = today;
  }
  state.words = { person: id, kind: 'talk', line: bond.talks % Math.max(1, person.talk.length) };
  bond.talks += 1;
}

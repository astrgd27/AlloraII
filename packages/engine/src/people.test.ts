import { describe, expect, it } from 'vitest';
import { DAYS_PER_SEASON, HOURS_PER_DAY, START_HOUR, dateAt } from './calendar';
import { Engine } from './engine';
import { peopleAt, whereIs } from './people';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';
import { WORLD, World } from './world';

const world = new World();
const PEOPLE = WORLD.people ?? [];
const hoursFor = (hour: number, season = 0) =>
  season * DAYS_PER_SEASON * HOURS_PER_DAY + ((hour - START_HOUR + 24) % 24);
const when = (hour: number, season = 0) => dateAt(hoursFor(hour, season));
const at = (hour: number, place = 'ostwick') => {
  const state = newGame(1, 0);
  state.hours = hoursFor(hour);
  state.place = place;
  return new Engine(state);
};

describe('routines', () => {
  it('covers the canon people of Eintenn and Marre who keep a schedule', () => {
    const canon = PEOPLE.filter((p) => !p.id.startsWith('person_')).map((p) => p.id);
    expect(canon.sort()).toEqual(
      ['bastian', 'cateruccia', 'hanne', 'jory', 'mechthild', 'momolo', 'zanetta'].sort(),
    );
    // And one new resident for each new place.
    const added = WORLD.places.filter((p) => p.canon === false);
    expect(PEOPLE.length - canon.length).toBe(added.length);
  });

  it('puts everyone in a real sub-place of a real place at every hour of every season', () => {
    for (const person of PEOPLE) {
      for (let season = 0; season < 4; season++) {
        for (let hour = 0; hour < 24; hour++) {
          const where = whereIs(person, when(hour, season));
          expect(world.places.has(where.place)).toBe(true);
          expect(person.sched.some((e) => e.at[0] === where.place && e.at[1] === where.sub)).toBe(
            true,
          );
        }
      }
    }
  });

  it('follows Hanne through her day as canon sets it', () => {
    const hanne = world.people.get('hanne')!;
    const sub = (hour: number, season = 0) => whereIs(hanne, when(hour, season)).sub;
    expect([5, 6, 12, 17, 18, 22, 23].map((h) => sub(h))).toEqual([
      'cottages',
      'fields',
      'fields',
      'fields',
      'tavern',
      'tavern',
      'cottages',
    ]);
    // In winter she is on the pasture by day.
    expect(sub(10, 3)).toBe('pasture');
    expect(sub(10, 1)).toBe('fields');
  });

  it('reads hours that wrap past midnight, and falls back to the first line', () => {
    const momolo = world.people.get('momolo')!;
    expect([21, 2, 4, 12].map((h) => whereIs(momolo, when(h)).sub)).toEqual([
      'loop',
      'loop',
      'row',
      'row',
    ]);
    const jory = world.people.get('jory')!;
    expect(whereIs(jory, when(23))).toEqual({ place: 'kess_harbor', sub: 'eel' });
  });

  it('lists who is at a place', () => {
    expect(peopleAt(world, 'ostwick', when(19))).toEqual([{ id: 'hanne', sub: 'tavern' }]);
    expect(peopleAt(world, 'tennfels', when(19))).toEqual([]);
  });
});

describe('meeting and talking', () => {
  it('shows a stranger, then a name once met', () => {
    const engine = at(19);
    expect(engine.snapshot().here).toEqual([
      { id: 'hanne', sub: 'tavern', known: false, talks: 0 },
    ]);
    const before = engine.state.needs.spirits;
    engine.handle({ type: 'meet', person: 'hanne' }, 0);
    expect(engine.snapshot().here[0]).toMatchObject({ known: true });
    expect(engine.snapshot().words).toEqual({ person: 'hanne', kind: 'meet', line: 0 });
    expect(engine.state.needs.spirits).toBe(before + 3);
    expect(() => engine.handle({ type: 'meet', person: 'hanne' }, 0)).toThrow(/already/i);
  });

  it('talks through a person’s lines, and lifts the spirits once a day', () => {
    const engine = at(19);
    expect(() => engine.handle({ type: 'talk', person: 'hanne' }, 0)).toThrow(/not yet met/i);
    engine.handle({ type: 'meet', person: 'hanne' }, 0);
    const before = engine.state.needs.spirits;
    engine.handle({ type: 'talk', person: 'hanne' }, 0);
    engine.handle({ type: 'talk', person: 'hanne' }, 0);
    expect(engine.state.needs.spirits).toBe(before + 2);
    expect(engine.snapshot().words).toEqual({ person: 'hanne', kind: 'talk', line: 1 });
    expect(engine.snapshot().here[0]?.talks).toBe(2);
  });

  it('needs the person to be here, and the life to be up and off the road', () => {
    expect(() => at(19, 'tennfels').handle({ type: 'meet', person: 'hanne' }, 0)).toThrow(
      /not here/i,
    );
    const travelling = at(10);
    travelling.handle({ type: 'travel', to: 'tennfels' }, 0);
    expect(() => travelling.handle({ type: 'meet', person: 'hanne' }, 0)).toThrow(/road/i);
    expect(travelling.snapshot().here).toEqual([]);
  });

  it('lets a life meet every person at their own place', () => {
    for (const person of PEOPLE) {
      const where = whereIs(person, when(12));
      const engine = at(12, where.place);
      engine.handle({ type: 'meet', person: person.id }, 0);
      expect(engine.state.bonds[person.id]).toBeDefined();
    }
  });

  it('migrates a v4 save', () => {
    const v4 = { ...newGame(1, 0), version: 4 } as Record<string, unknown>;
    delete v4.bonds;
    delete v4.words;
    expect(migrate(v4)).toMatchObject({ version: SAVE_VERSION, bonds: {}, words: null });
  });
});

describe('the new neighbours', () => {
  const added = WORLD.places.filter((p) => p.canon === false);

  it('gives every new place a resident who is there by day and by night', () => {
    for (const place of added) {
      for (const hour of [3, 12, 21]) {
        expect(peopleAt(world, place.id, when(hour)).length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('gives every new place something to do and a way in', () => {
    const reachable = world.hoursFrom('ostwick');
    for (const place of added) {
      expect((WORLD.activities ?? []).some((a) => a.place === place.id)).toBe(true);
      expect(reachable[place.id]).toBeGreaterThan(0);
    }
  });
});

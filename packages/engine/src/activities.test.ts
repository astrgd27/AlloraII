import { describe, expect, it } from 'vitest';
import { whyNot } from './activities';
import { HOURS_PER_DAY, DAYS_PER_SEASON, START_HOUR, dateAt } from './calendar';
import { Engine } from './engine';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';
import { WORLD } from './world';

const ACTIVITIES = WORLD.activities ?? [];

/** An engine standing in Ostwick at a given hour of the day, in a given season. */
function at(hour: number, season = 0, place = 'ostwick'): Engine {
  const state = newGame(1, 0);
  state.place = place;
  state.hours = season * DAYS_PER_SEASON * HOURS_PER_DAY + ((hour - START_HOUR + 24) % 24);
  return new Engine(state);
}

describe('the activities', () => {
  it('are twenty in Ostwick and one at each new place, each in a real sub-place', () => {
    expect(ACTIVITIES.filter((a) => a.place === 'ostwick')).toHaveLength(20);
    const places = new Set(WORLD.places.map((p) => p.id));
    for (const a of ACTIVITIES) {
      expect(places.has(a.place)).toBe(true);
      expect(a.subName).toBeTruthy();
      expect(a.to).toBeGreaterThan(a.from);
    }
  });

  it.each(ACTIVITIES.map((a) => [a.id, a] as const))('%s: done at its place and hour', (_id, a) => {
    const engine = at(a.from, a.seasons?.[0] ?? 0, a.place);
    expect(engine.snapshot().canDo).toContain(a.id);
    engine.handle({ type: 'do', activity: a.id }, 0);
    expect(engine.snapshot().doing).toEqual({ id: a.id, hoursLeft: a.hours });
    const done: string[] = [];
    engine.bus.on('ActivityCompleted', (e) => done.push(e.activity));
    engine.run(a.hours);
    expect(done).toEqual([a.id]);
    expect(engine.state.doing).toBeNull();
    expect(engine.state.done[a.id]).toBe(1);
  });

  it.each(ACTIVITIES.map((a) => [a.id, a] as const))(
    '%s: refused elsewhere and at the wrong hour',
    (_id, a) => {
      const season = a.seasons?.[0] ?? 0;
      const late = at(a.to, season, a.place);
      expect(() => late.handle({ type: 'do', activity: a.id }, 0)).toThrow();
      const away = at(a.from, season);
      away.state.place = 'tennfels';
      expect(whyNot(a, away.state, dateAt(away.state.hours))).toBe('Not here');
    },
  );
});

describe('activity rules', () => {
  const bake = 'activity_ostwick_bake_bread';

  it('one thing at a time, and not on the road', () => {
    const engine = at(7);
    engine.handle({ type: 'do', activity: bake }, 0);
    expect(() => engine.handle({ type: 'do', activity: 'activity_ostwick_hoe_onions' }, 0)).toThrow(
      /busy/i,
    );
    expect(() => engine.handle({ type: 'travel', to: 'tennfels' }, 0)).toThrow(/busy/i);
    engine.handle({ type: 'stop' }, 0);
    engine.handle({ type: 'travel', to: 'tennfels' }, 0);
    expect(() => engine.handle({ type: 'do', activity: bake }, 0)).toThrow(/road/i);
  });

  it('keeps seasonal work to its season', () => {
    const sow = 'activity_ostwick_sow_corn';
    expect(at(8, 0).snapshot().canDo).toContain(sow);
    expect(at(8, 1).snapshot().canDo).not.toContain(sow);
  });

  it('applies its effects when finished, not before', () => {
    const engine = at(18);
    const before = engine.state.needs.spirits;
    engine.handle({ type: 'do', activity: 'activity_ostwick_roll_kegel' }, 0);
    engine.run(1);
    expect(engine.state.needs.spirits).toBeGreaterThan(before + 3);
  });

  it('sets work down for the night and takes it up in the morning', () => {
    const engine = at(20);
    engine.handle({ type: 'do', activity: 'activity_ostwick_serve_evening' }, 0);
    engine.run(3);
    expect(engine.state.doing).toMatchObject({ hoursLeft: 2 });
    engine.run(9);
    expect(engine.state.doing).toBeNull();
  });

  it('migrates a v3 save', () => {
    const v3 = { ...newGame(1, 0), version: 3 } as Record<string, unknown>;
    delete v3.doing;
    delete v3.done;
    expect(migrate(v3)).toMatchObject({ version: SAVE_VERSION, doing: null, done: {} });
  });
});

import { describe, expect, it } from 'vitest';
import {
  DAYS_PER_YEAR,
  HOURS_PER_DAY,
  HOURS_PER_YEAR,
  START_YEAR,
  dateAt,
  dayPartOf,
} from './calendar';
import { CATCH_UP_DAYS_PER_REAL_DAY, Engine, MS_PER_GAME_HOUR } from './engine';
import { EventBus } from './events';
import { EngineHost } from './host';
import type { FromEngine } from './protocol';
import { createRng, nextRandom } from './rng';
import { migrate, versionOf, type SaveV0 } from './save/migrations';
import { MemoryStore, SAVES_KEPT } from './save/store';
import { SAVE_VERSION, newGame } from './state';

const MINUTE = 60_000;
const REAL_DAY = 24 * 60 * MINUTE;

describe('calendar', () => {
  it('starts at dawn on the first day of spring, 1347 AR', () => {
    expect(dateAt(0)).toMatchObject({
      year: START_YEAR,
      season: 'Spring',
      day: 1,
      week: 1,
      weekday: 1,
      dayOfYear: 1,
      hour: 6,
      dayPart: 'dawn',
    });
  });

  it('has 28-day seasons and a 112-day year', () => {
    expect(DAYS_PER_YEAR).toBe(112);
    const day = (n: number) => dateAt(n * HOURS_PER_DAY);
    expect(day(27)).toMatchObject({ season: 'Spring', day: 28, week: 4, weekday: 7 });
    expect(day(28)).toMatchObject({ season: 'Summer', day: 1, week: 1, weekday: 1 });
    expect(day(56).season).toBe('Autumn');
    expect(day(84).season).toBe('Winter');
    expect(day(111)).toMatchObject({ year: START_YEAR, season: 'Winter', day: 28, dayOfYear: 112 });
    expect(day(112)).toMatchObject({
      year: START_YEAR + 1,
      season: 'Spring',
      day: 1,
      dayOfYear: 1,
    });
  });

  it('rolls the day at midnight', () => {
    expect(dateAt(17)).toMatchObject({ day: 1, hour: 23 });
    expect(dateAt(18)).toMatchObject({ day: 2, hour: 0, dayPart: 'night' });
    expect([4, 5, 8, 18, 21].map(dayPartOf)).toEqual(['night', 'dawn', 'day', 'dusk', 'night']);
  });

  it('refuses a time that is not a whole hour from 0', () => {
    expect(() => dateAt(-1)).toThrow();
    expect(() => dateAt(1.5)).toThrow();
  });
});

describe('clock', () => {
  it('turns one real minute into one game hour', () => {
    expect(MS_PER_GAME_HOUR).toBe(MINUTE);
    const engine = new Engine(newGame(1, 0));
    expect(engine.advanceTo(59_999)).toBe(0);
    expect(engine.advanceTo(60_000)).toBe(1);
    expect(engine.advanceTo(60_000 + 150_000)).toBe(2);
    expect(engine.state.hours).toBe(3);
    expect(engine.snapshot().hourProgress).toBeCloseTo(0.5);
  });

  it('stands still while paused', () => {
    const engine = new Engine(newGame(1, 0));
    engine.handle({ type: 'pause' }, 30_000);
    expect(engine.advanceTo(10 * MINUTE)).toBe(0);
    engine.handle({ type: 'resume' }, 10 * MINUTE);
    expect(engine.advanceTo(11 * MINUTE)).toBe(1);
  });

  it('announces days, seasons and years', () => {
    const engine = new Engine(newGame(1, 0));
    const seen: string[] = [];
    engine.bus.on('DayBegan', ({ date }) => seen.push(`day ${date.dayOfYear}`));
    engine.bus.on('SeasonBegan', ({ date }) => seen.push(date.season));
    engine.bus.on('YearBegan', ({ date }) => seen.push(`year ${date.year}`));
    engine.run(HOURS_PER_YEAR);
    expect(seen.filter((s) => s.startsWith('day'))).toHaveLength(DAYS_PER_YEAR);
    expect(seen.filter((s) => !s.startsWith('day'))).toEqual([
      'Summer',
      'Autumn',
      'Winter',
      'Spring',
      'year 1348',
    ]);
  });

  it('runs systems in their declared order, once per tick', () => {
    const order: string[] = [];
    const system = (name: string) => ({ name, tick: () => void order.push(name) });
    new Engine(newGame(1, 0), { systems: [system('time'), system('needs')] }).run(2);
    expect(order).toEqual(['time', 'needs', 'time', 'needs']);
  });
});

describe('catching up after time away', () => {
  it('simulates a short absence in full', () => {
    const engine = new Engine(newGame(1, 0));
    engine.catchUpTo(90 * MINUTE);
    expect(engine.state.hours).toBe(90);
    expect(engine.snapshot()).toMatchObject({ caughtUpHours: 90, skippedHours: 0 });
  });

  it('caps a long absence at seven game days for each real day away', () => {
    const cap = CATCH_UP_DAYS_PER_REAL_DAY * HOURS_PER_DAY;
    const oneDay = new Engine(newGame(1, 0));
    oneDay.catchUpTo(REAL_DAY);
    expect(oneDay.snapshot()).toMatchObject({ caughtUpHours: cap, skippedHours: 1440 - cap });
    const threeDays = new Engine(newGame(1, 0));
    threeDays.catchUpTo(2.5 * REAL_DAY);
    expect(threeDays.state.hours).toBe(3 * cap);
  });
});

describe('event bus', () => {
  it('runs handlers by priority, then in the order added, and can remove them', () => {
    const bus = new EventBus();
    const seen: string[] = [];
    bus.on('HourPassed', () => seen.push('late'), 10);
    const off = bus.on('HourPassed', () => seen.push('removed'), 0);
    bus.on('HourPassed', () => seen.push('first'), 0);
    bus.on('HourPassed', () => seen.push('early'), -5);
    off();
    bus.emit('HourPassed', { hours: 1, date: dateAt(1) });
    expect(seen).toEqual(['early', 'first', 'late']);
  });
});

describe('random numbers', () => {
  it('repeats exactly for the same seed, and keeps streams apart', () => {
    const draw = (seed: number, streams: string[]) => {
      const rng = createRng();
      return streams.map((s) => nextRandom(rng, seed, s));
    };
    expect(draw(7, ['world', 'world', 'life_1'])).toEqual(draw(7, ['world', 'world', 'life_1']));
    expect(draw(7, ['world'])).not.toEqual(draw(8, ['world']));
    // A draw on another stream does not shift the world stream.
    expect(draw(7, ['world', 'life_1', 'world'])[2]).toBe(draw(7, ['world', 'world'])[1]);
    for (const n of draw(
      3,
      Array.from({ length: 200 }, () => 'world'),
    )) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe('saves and migrations', () => {
  it('migrates a v0 save to the current version', () => {
    const v0: SaveV0 = { seed: 42, hours: 500, savedAt: 1_000_000 };
    expect(versionOf(v0)).toBe(0);
    const state = migrate(v0);
    expect(state).toEqual({
      version: SAVE_VERSION,
      seed: 42,
      hours: 500,
      carryMs: 0,
      lastRealMs: 1_000_000,
      paused: false,
      rng: { streams: {} },
    });
    // A migrated save plays on.
    const engine = new Engine(state);
    engine.advanceTo(1_000_000 + 2 * MINUTE);
    expect(engine.state.hours).toBe(502);
  });

  it('leaves a current save as it is, and refuses a newer or broken one', () => {
    const state = newGame(1, 0);
    expect(migrate(state)).toBe(state);
    expect(() => migrate({ version: SAVE_VERSION + 1 })).toThrow(/newer/);
    expect(() => migrate({ version: 'one' })).toThrow();
    expect(() => migrate(null)).toThrow();
  });

  it('keeps only the last few saves, newest first', async () => {
    const store = new MemoryStore();
    for (let i = 1; i <= SAVES_KEPT + 2; i++) await store.write({ savedAt: i, data: { n: i } });
    expect(store.records.map((r) => r.savedAt)).toEqual([5, 4, 3]);
    expect((await store.latest())?.savedAt).toBe(5);
  });
});

describe('the host', () => {
  const setup = (store = new MemoryStore()) => {
    const clock = { now: 0 };
    const posted: FromEngine[] = [];
    const host = new EngineHost({ store, now: () => clock.now, post: (m) => posted.push(m) });
    const lastState = () => posted.filter((m) => m.type === 'state').at(-1);
    return { host, clock, posted, store, lastState };
  };

  it('starts a new game, runs the clock and reports state', async () => {
    const { host, clock, lastState } = setup();
    await host.receive({ type: 'init', seed: 5 });
    clock.now = 3 * MINUTE;
    host.step();
    expect(lastState()).toMatchObject({ snapshot: { hours: 3, date: { hour: 9 } } });
  });

  it('survives a reload: the clock carries on from the save', async () => {
    const first = setup();
    await first.host.receive({ type: 'init', seed: 5 });
    first.clock.now = 5 * MINUTE;
    first.host.step();
    await first.host.receive({ type: 'save' });

    const second = setup(first.store);
    second.clock.now = 7 * MINUTE;
    await second.host.receive({ type: 'init' });
    expect(second.lastState()).toMatchObject({ snapshot: { hours: 7, caughtUpHours: 2 } });
    expect(second.host.engine?.state.seed).toBe(5);
  });

  it('loads a v0 save through the migrations', async () => {
    const store = new MemoryStore();
    await store.write({ savedAt: 0, data: { seed: 9, hours: 100, savedAt: 0 } satisfies SaveV0 });
    const { host, lastState } = setup(store);
    await host.receive({ type: 'init' });
    expect(lastState()).toMatchObject({ snapshot: { hours: 100 } });
    expect(versionOf((await store.latest())?.data)).toBe(SAVE_VERSION);
  });

  it('autosaves at the start of each game day', async () => {
    const { host, clock, posted } = setup();
    await host.receive({ type: 'init', seed: 1 });
    const before = posted.filter((m) => m.type === 'saved').length;
    clock.now = 18 * MINUTE; // midnight
    host.step();
    await Promise.resolve();
    expect(posted.filter((m) => m.type === 'saved').length).toBe(before + 1);
  });

  it('resets to a new game, and reports errors instead of throwing', async () => {
    const { host, clock, lastState, posted, store } = setup();
    await host.receive({ type: 'pause' });
    expect(posted.at(-1)).toMatchObject({ type: 'error' });
    await host.receive({ type: 'init', seed: 1 });
    clock.now = 10 * MINUTE;
    host.step();
    await host.receive({ type: 'reset' });
    expect(lastState()).toMatchObject({ snapshot: { hours: 0 } });
    expect(store.records).toHaveLength(1);
  });
});

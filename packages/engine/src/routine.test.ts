import { describe, expect, it } from 'vitest';
import { Engine, MS_PER_GAME_HOUR } from './engine';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';

const DAY_MS = 24 * MS_PER_GAME_HOUR;

describe('standing orders', () => {
  it('leaves a life alone while the player is there', () => {
    const e = new Engine(newGame(5, 0));
    e.run(48);
    expect(e.state.earned).toBe(0);
    expect(e.state.report).toBeNull();
  });

  it('keeps a life at paid work while the player is away, and reports it', () => {
    const e = new Engine(newGame(5, 0));
    e.catchUpTo(3 * DAY_MS);
    const report = e.state.report;
    expect(report?.hours).toBe(72);
    expect(report?.tasks).toBeGreaterThan(5);
    expect(report?.earned).toBeGreaterThan(0);
    expect(report?.earned).toBe(e.state.earned);
    expect(Object.keys(report?.levels ?? {}).length).toBeGreaterThan(0);
    expect(e.snapshot().report).toEqual(report);
  });

  it('adds to a report not yet read, and puts it away when read', () => {
    const e = new Engine(newGame(5, 0));
    e.catchUpTo(DAY_MS);
    const first = e.state.report?.tasks ?? 0;
    e.catchUpTo(2 * DAY_MS);
    expect(e.state.report?.hours).toBe(48);
    expect(e.state.report?.tasks).toBeGreaterThan(first);
    e.handle({ type: 'readReport' }, 2 * DAY_MS);
    expect(e.state.report).toBeNull();
  });

  it('does nothing unasked when ordered not to, and works under the eye when ordered to', () => {
    const idle = new Engine(newGame(5, 0));
    idle.handle({ type: 'setOrders', orders: { work: 'never' } }, 0);
    idle.catchUpTo(3 * DAY_MS);
    expect(idle.state.earned).toBe(0);
    expect(idle.state.report?.tasks).toBe(0);

    const busy = new Engine(newGame(5, 0));
    busy.handle({ type: 'setOrders', orders: { work: 'always' } }, 0);
    busy.run(72);
    expect(busy.state.earned).toBeGreaterThan(0);
  });

  it('does the duties of a post, and leaves the cases waiting', () => {
    const state = newGame(5, 0);
    state.place = 'kess_market';
    state.home = 'kess_market';
    const e = new Engine(state);
    e.handle({ type: 'takePost', post: 'post_kesselhaven_guild_smith' }, 0);
    e.catchUpTo(5 * DAY_MS);
    expect(e.state.post?.standing).toBeGreaterThan(0);
    expect(e.state.works).toHaveLength(0);
    expect(e.state.venture).toBeNull();
    expect(e.state.report?.cases).toBeGreaterThan(0);
    expect(Object.keys(e.state.done).every((id) => id.startsWith('activity_smith_'))).toBe(true);
  });

  it('turns back from the road when hurt, once', () => {
    const e = new Engine(newGame(5, 0));
    e.handle({ type: 'travel', to: 'kess_market' }, 0);
    e.run(2);
    const from = e.state.journey?.from;
    e.state.needs.health = 20;
    e.tick();
    expect(e.state.journey?.homeward).toBe(true);
    expect(e.state.journey?.to).toBe(from === 'ostwick' ? e.state.journey?.to : from);
    const to = e.state.journey?.to;
    e.tick();
    expect(e.state.journey === null || e.state.journey.to === to).toBe(true);

    const stubborn = new Engine(newGame(5, 0));
    stubborn.handle({ type: 'setOrders', orders: { turnBackIfHurt: false } }, 0);
    stubborn.handle({ type: 'travel', to: 'kess_market' }, 0);
    stubborn.run(2);
    stubborn.state.needs.health = 20;
    stubborn.tick();
    expect(stubborn.state.journey?.to).toBe('kess_market');
  });

  it('migrates an older save', () => {
    const old = { ...newGame(1, 0), version: 10 } as Record<string, unknown>;
    old.orders = { sleepFrom: 23, wakeAt: 7, campAtNight: false };
    delete old.report;
    delete old.turnedBack;
    const save = migrate(old);
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.orders).toEqual({
      sleepFrom: 23,
      wakeAt: 7,
      campAtNight: false,
      work: 'away',
      turnBackIfHurt: true,
      inn: true,
      living: 'comfortable',
    });
    expect(save.report).toBeNull();
  });
});

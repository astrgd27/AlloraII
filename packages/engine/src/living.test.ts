import { describe, expect, it } from 'vitest';
import { Engine } from './engine';
import { LIVING, RESERVE, livingCost } from './living';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';
import { FARE } from './world';

describe('where money goes', () => {
  it('charges a toll on the Duke’s Road, paid on setting out', () => {
    const e = new Engine(newGame(5, 0));
    const toll = e.world.costsFrom('ostwick').tennfels ?? 0;
    expect(toll).toBeGreaterThan(0);
    const before = e.state.money;
    e.handle({ type: 'travel', to: 'tennfels' }, 0);
    expect(e.state.money).toBeCloseTo(before - toll);
    expect(e.snapshot().costsTo).toEqual({});
  });

  it('charges a fare by boat, by the hour', () => {
    const e = new Engine(newGame(5, 0));
    const lane = e.world.route('kess_harbor', 'marre_city');
    const water = lane?.legs.filter((l) => l.sea) ?? [];
    expect(water.length).toBeGreaterThan(0);
    for (const leg of water) expect(leg.cost).toBeGreaterThanOrEqual(FARE.least);
  });

  it('refuses a journey the purse cannot pay for', () => {
    const e = new Engine(newGame(5, 0));
    e.state.money = 0;
    expect(() => e.handle({ type: 'travel', to: 'tennfels' }, 0)).toThrow('tolls and fares');
    expect(e.state.journey).toBeNull();
    // An untolled way is still open.
    expect(e.world.costsFrom('ostwick').place_eintenn_netherwick).toBe(0);
    e.handle({ type: 'travel', to: 'place_eintenn_netherwick' }, 0);
    expect(e.state.journey).not.toBeNull();
  });

  it('spends a share of what is put by on living, by the order, and lifts the spirits', () => {
    const e = new Engine(newGame(5, 0));
    e.state.money = 1050;
    expect(livingCost(e.state)).toBeCloseTo(1000 * LIVING.comfortable.share);
    e.handle({ type: 'setOrders', orders: { living: 'plain' } }, 0);
    expect(livingCost(e.state)).toBe(0);
    e.handle({ type: 'setOrders', orders: { living: 'rich' } }, 0);
    expect(livingCost(e.state)).toBeCloseTo(1000 * LIVING.rich.share);
    e.state.money = RESERVE - 1;
    expect(livingCost(e.state)).toBe(0);
  });

  it('takes the guild’s dues each season, by rank, and records them', () => {
    const state = newGame(5, 0);
    state.place = 'kess_market';
    state.home = 'kess_market';
    const e = new Engine(state);
    e.handle({ type: 'takePost', post: 'post_kesselhaven_guild_smith' }, 0);
    e.state.money = 200;
    e.run(28 * 24);
    const dues = e.state.log.filter((l) => l.kind === 'dues');
    expect(dues).toHaveLength(1);
    expect(dues[0]).toMatchObject({
      price: e.world.posts.get('post_kesselhaven_guild_smith')?.dues?.[0],
    });
    // The household of Burg Tennfels has no guild, and takes no dues.
    expect(e.world.posts.get('post_tennfels_steward')?.dues).toBeUndefined();
  });

  it('costs standing when the dues cannot be paid', () => {
    const state = newGame(5, 0);
    state.place = 'kess_market';
    const e = new Engine(state);
    e.handle({ type: 'takePost', post: 'post_kesselhaven_guild_smith' }, 0);
    e.state.post = { id: 'post_kesselhaven_guild_smith', rank: 0, standing: 30 };
    e.state.money = 0;
    e.run(28 * 24);
    expect(e.state.post?.standing).toBeLessThan(30);
  });

  it('migrates an older save', () => {
    const old = { ...newGame(1, 0), version: 14 } as Record<string, unknown>;
    const o = { ...(old.orders as Record<string, unknown>) };
    delete o.living;
    old.orders = o;
    const save = migrate(old);
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.orders.living).toBe('comfortable');
  });
});

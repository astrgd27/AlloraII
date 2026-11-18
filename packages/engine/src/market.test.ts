import { describe, expect, it } from 'vitest';
import { Engine } from './engine';
import { CUT, DEMAND, PACK, buy, buyPrice, demandOf, sell, sellPrice } from './market';
import { HOMES } from './housing';
import { MEAL_COST, START_MONEY } from './money';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';
import { dateAt } from './calendar';

const life = () => new Engine(newGame(7, 0));
const market = (e: Engine, place: string) => {
  const m = e.world.markets.get(place);
  if (!m) throw new Error(`no market at ${place}`);
  return m;
};

describe('money', () => {
  it('starts a life with a little, and charges for meals where people live', () => {
    const e = life();
    expect(e.state.money).toBe(START_MONEY);
    e.run(24);
    expect(e.state.meals).toBe(3);
    // Three meals, and the room's rent at midnight.
    expect(e.state.money).toBeCloseTo(START_MONEY - 3 * MEAL_COST - HOMES.room.rent.settled);
    expect(e.state.spent).toBeCloseTo(3 * MEAL_COST + HOMES.room.rent.settled);
  });

  it('feeds a life with no money on scraps', () => {
    const e = life();
    e.state.money = 0;
    e.run(24);
    expect(e.state.poorMeals).toBe(3);
    expect(e.state.money).toBe(0);
  });

  it('eats from the pack on the road', () => {
    const e = life();
    e.state.goods = { bread: 2 };
    e.handle({ type: 'travel', to: 'tennfels' }, 0);
    e.run(2);
    expect(e.state.journey).not.toBeNull();
    expect(e.state.goods.bread).toBe(1);
    expect(e.state.poorMeals).toBe(0);
    expect(e.state.money).toBe(START_MONEY);
  });

  it('pays for work when it is done', () => {
    const e = life();
    e.run(1);
    const paid = e.snapshot().canDo.find((id) => e.world.activities.get(id)?.pay);
    expect(paid).toBeDefined();
    e.handle({ type: 'do', activity: paid ?? '' }, 0);
    const before = e.state.money;
    while (e.state.doing) e.tick();
    expect(e.state.earned).toBe(e.world.activities.get(paid ?? '')?.pay);
    expect(e.state.money).toBeGreaterThan(before - 3 * MEAL_COST);
  });

  it('migrates an older save', () => {
    const old = { ...newGame(1, 0), version: 9 } as Record<string, unknown>;
    for (const k of ['money', 'earned', 'spent', 'goods', 'markets', 'poorMeals']) delete old[k];
    const save = migrate(old);
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.money).toBe(START_MONEY);
    expect(save.goods).toEqual({});
  });
});

describe('markets', () => {
  it('is shut out of hours', () => {
    const e = life();
    expect(e.snapshot().market?.open).toBe(false);
    expect(() => e.handle({ type: 'buy', item: 'wool' }, 0)).toThrow('shut');
    e.run(1);
    expect(e.snapshot().market?.open).toBe(true);
  });

  it('sells what the place makes cheaply, and the price climbs as it is bought', () => {
    const e = life();
    e.run(1);
    const m = market(e, 'ostwick');
    const date = dateAt(e.state.hours);
    expect(demandOf(e.state, e.world, m, 'wool')).toBe(DEMAND.plenty);
    expect(demandOf(e.state, e.world, m, 'bread')).toBe(DEMAND.usual);
    const first = buy(e.state, e.world, 'wool', date);
    const second = buy(e.state, e.world, 'wool', date);
    for (let i = 0; i < 6; i++) buy(e.state, e.world, 'wool', date);
    expect(second).toBeGreaterThanOrEqual(first);
    expect(buyPrice(e.state, e.world, m, 'wool', date)).toBeGreaterThan(first);
    expect(e.state.goods.wool).toBe(8);
  });

  it('never pays to buy and sell at the same stalls', () => {
    const e = life();
    e.run(1);
    const date = dateAt(e.state.hours);
    for (let i = 0; i < 5; i++) buy(e.state, e.world, 'wool', date);
    for (let i = 0; i < 5; i++) sell(e.state, e.world, 'wool', date);
    expect(e.state.money).toBeLessThan(START_MONEY);
    expect(CUT).toBeLessThan(1);
  });

  it('pays more for a thing where it is scarce, less with each one sold', () => {
    const e = life();
    e.state.place = 'tennfels';
    e.state.hours = 4;
    const m = market(e, 'tennfels');
    const date = dateAt(e.state.hours);
    expect(m.sells).not.toContain('wool');
    expect(demandOf(e.state, e.world, m, 'wool')).toBe(DEMAND.scarce);
    e.state.goods = { wool: PACK };
    const first = sell(e.state, e.world, 'wool', date);
    for (let i = 0; i < PACK - 2; i++) sell(e.state, e.world, 'wool', date);
    const last = sell(e.state, e.world, 'wool', date);
    expect(first).toBeGreaterThan((e.world.items.get('wool')?.value ?? 0) * DEMAND.usual);
    expect(last).toBeLessThan(first);
    expect(e.state.goods.wool).toBeUndefined();
    // The glut eases off over the days.
    const glutted = sellPrice(e.state, e.world, m, 'wool', date) ?? 0;
    e.state.hours += 24 * 20;
    expect(sellPrice(e.state, e.world, m, 'wool', date)).toBeGreaterThan(glutted);
  });

  it('holds no more than a pack, and takes no more than the purse', () => {
    const e = life();
    e.run(1);
    const date = dateAt(e.state.hours);
    e.state.goods = { grain: PACK };
    expect(() => buy(e.state, e.world, 'grain', date)).toThrow('full');
    e.state.goods = {};
    e.state.money = 0.1;
    expect(() => buy(e.state, e.world, 'grain', date)).toThrow('money');
  });

  it('shows the market in the snapshot', () => {
    const e = life();
    e.run(1);
    e.handle({ type: 'buy', item: 'bread' }, 0);
    const snap = e.snapshot();
    const bread = snap.market?.stock.find((s) => s.item === 'bread');
    expect(snap.goods.bread).toBe(1);
    expect(bread?.held).toBe(1);
    expect(bread?.sell).toBeLessThan(bread?.buy ?? 0);
  });
});

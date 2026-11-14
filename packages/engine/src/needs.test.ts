import { describe, expect, it } from 'vitest';
import { HOURS_PER_DAY } from './calendar';
import { Engine } from './engine';
import { DEFAULT_ORDERS, MEAL_HOURS, isSleepHour } from './needs';
import { newGame } from './state';
import { World, type WorldData } from './world';

const WEEK = 7 * HOURS_PER_DAY;

/** home —20h road— far; home —30h sea— isle. */
const SMALL: WorldData = {
  regions: [{ id: 'r', name: 'R' }],
  places: ['home', 'far', 'isle'].map((id) => ({
    id,
    name: id,
    region: 'r',
    x: 0,
    y: 0,
    kind: 'settled',
  })),
  roads: [
    { id: 'road', from: 'home', to: 'far', way: 'road', hours: 20 },
    { id: 'lane', from: 'home', to: 'isle', way: 'sea', hours: 30 },
  ],
};
const start = () =>
  new Engine({ ...newGame(1, 0), place: 'home', home: 'home' }, { world: new World(SMALL) });

describe('needs', () => {
  it('a life left alone for a game week sleeps, eats and stays well', () => {
    const engine = new Engine(newGame(1, 0));
    engine.run(WEEK);
    const { needs, meals, hoursSlept } = engine.state;
    expect(meals).toBe(7 * MEAL_HOURS.length);
    expect(hoursSlept).toBe(7 * 8);
    expect(needs.health).toBe(100);
    expect(needs.vigour).toBeGreaterThan(50);
    expect(needs.spirits).toBeGreaterThan(50);
  });

  it('never leaves the range 0 to 100', () => {
    const engine = new Engine(newGame(2, 0));
    for (let h = 0; h < 4 * WEEK; h++) {
      engine.tick();
      for (const v of Object.values(engine.state.needs)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });

  it('knows the sleeping hours, across midnight', () => {
    expect([21, 22, 23, 0, 5, 6].map((h) => isSleepHour(h, DEFAULT_ORDERS))).toEqual([
      false,
      true,
      true,
      true,
      true,
      false,
    ]);
  });

  it('wakes and sleeps on standing orders', () => {
    const engine = start();
    engine.run(15); // 21:00
    expect(engine.snapshot().asleep).toBe(false);
    engine.run(1); // 22:00
    expect(engine.snapshot().asleep).toBe(true);
    engine.handle({ type: 'setOrders', orders: { sleepFrom: 23 } }, 0);
    expect(engine.snapshot().orders.sleepFrom).toBe(23);
  });
});

describe('needs on the road', () => {
  it('camps at night, so a long road takes longer than its hours', () => {
    const engine = start();
    engine.handle({ type: 'travel', to: 'far' }, 0);
    engine.run(20);
    expect(engine.state.journey).not.toBeNull();
    engine.run(8); // the night in camp
    expect(engine.state).toMatchObject({ place: 'far', journey: null });
  });

  it('walks through the night when ordered to, and pays for it', () => {
    const rested = start();
    rested.handle({ type: 'travel', to: 'far' }, 0);
    rested.run(28);
    const pressed = start();
    pressed.handle({ type: 'setOrders', orders: { campAtNight: false } }, 0);
    pressed.handle({ type: 'travel', to: 'far' }, 0);
    pressed.run(20);
    expect(pressed.state.place).toBe('far');
    expect(pressed.state.needs.vigour).toBeLessThan(rested.state.needs.vigour);
  });

  it('sleeps aboard at sea while the ship sails on', () => {
    const engine = start();
    engine.handle({ type: 'travel', to: 'isle' }, 0);
    engine.run(30);
    expect(engine.state).toMatchObject({ place: 'isle', journey: null });
    expect(engine.state.hoursSlept).toBe(8);
  });

  it('sleeps better at home than in camp', () => {
    const home = start();
    home.run(24);
    const camp = start();
    camp.handle({ type: 'travel', to: 'far' }, 0);
    camp.run(24);
    expect(home.state.needs.vigour).toBeGreaterThan(camp.state.needs.vigour);
  });

  it('collapses into sleep when vigour runs out, and loses health', () => {
    const engine = start();
    engine.state.needs.vigour = 1;
    engine.state.orders = { ...engine.state.orders, sleepFrom: 0, wakeAt: 0 };
    engine.run(4);
    expect(engine.state.asleep).toBe(true);
    expect(engine.state.needs.health).toBeLessThan(100);
  });
});

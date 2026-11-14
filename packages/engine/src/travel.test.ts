import { describe, expect, it } from 'vitest';
import { Engine } from './engine';
import { newGame } from './state';
import { START_PLACE, WORLD, World, type WorldData } from './world';

/** a —2— b —3— c, and a —9— c; d stands alone. */
const SMALL: WorldData = {
  regions: [{ id: 'r', name: 'R' }],
  places: ['a', 'b', 'c', 'd'].map((id) => ({
    id,
    name: id,
    region: 'r',
    x: 0,
    y: 0,
    kind: 'settled',
  })),
  roads: [
    { id: 'ab', from: 'a', to: 'b', way: 'road', hours: 2 },
    { id: 'bc', from: 'b', to: 'c', way: 'road', hours: 3 },
    { id: 'ac', from: 'a', to: 'c', way: 'track', hours: 9 },
  ],
};

const start = (place = 'a') => {
  const engine = new Engine({ ...newGame(1, 0), place }, { world: new World(SMALL) });
  engine.state.orders.campAtNight = false;
  return engine;
};

describe('routes', () => {
  const world = new World(SMALL);

  it('finds the quickest way, not the fewest roads', () => {
    expect(world.route('a', 'c')).toEqual({
      hours: 5,
      legs: [
        { road: 'ab', to: 'b', hours: 2 },
        { road: 'bc', to: 'c', hours: 3 },
      ],
    });
    expect(world.route('c', 'a')?.hours).toBe(5);
  });

  it('knows when there is no way', () => {
    expect(world.route('a', 'd')).toBeUndefined();
    expect(world.route('a', 'nowhere')).toBeUndefined();
    expect(world.hoursFrom('a')).toEqual({ a: 0, b: 2, c: 5 });
  });
});

describe('travelling', () => {
  it('takes the hours of each leg and arrives', () => {
    const engine = start();
    const arrivals: string[] = [];
    engine.bus.on('Arrived', ({ place }) => arrivals.push(place));
    engine.handle({ type: 'travel', to: 'c' }, 0);
    engine.run(2);
    expect(engine.state.place).toBe('b');
    expect(engine.snapshot().journey).toMatchObject({
      to: 'c',
      next: 'c',
      last: 'b',
      hoursLeft: 3,
    });
    engine.run(3);
    expect(engine.state).toMatchObject({ place: 'c', journey: null });
    expect(arrivals).toEqual(['c']);
    expect(engine.snapshot().hoursTo).toEqual({ a: 5, b: 3, c: 0 });
  });

  it('refuses a journey that cannot be made', () => {
    const engine = start();
    expect(() => engine.handle({ type: 'travel', to: 'a' }, 0)).toThrow(/there/i);
    expect(() => engine.handle({ type: 'travel', to: 'd' }, 0)).toThrow(/no way/i);
    engine.handle({ type: 'travel', to: 'b' }, 0);
    expect(() => engine.handle({ type: 'travel', to: 'c' }, 0)).toThrow(/travelling/i);
  });

  it('turns back in the hours already spent', () => {
    const engine = start();
    engine.handle({ type: 'travel', to: 'c' }, 0);
    engine.run(3); // at b, one hour towards c
    engine.handle({ type: 'turnBack' }, 0);
    expect(engine.snapshot().journey).toMatchObject({ to: 'b', hoursLeft: 1 });
    engine.run(1);
    expect(engine.state).toMatchObject({ place: 'b', journey: null });
  });

  it('turning back before the first hour simply stays', () => {
    const engine = start();
    engine.handle({ type: 'travel', to: 'b' }, 0);
    engine.handle({ type: 'turnBack' }, 0);
    expect(engine.state).toMatchObject({ place: 'a', journey: null });
    expect(() => engine.handle({ type: 'turnBack' }, 0)).toThrow();
  });
});

describe('the Phase 0 world: Eintenn and Marre', () => {
  const world = new World();

  it('holds every canon place of both realms', () => {
    const count = (region: string) => WORLD.places.filter((p) => p.region === region).length;
    expect(count('eintenn')).toBe(19);
    expect(count('marre')).toBe(11);
  });

  it('lets a life travel from the start to every place', () => {
    const hours = world.hoursFrom(START_PLACE);
    expect(Object.keys(hours).sort()).toEqual(WORLD.places.map((p) => p.id).sort());
  });

  it('actually arrives at the farthest place', () => {
    const hours = world.hoursFrom(START_PLACE);
    const [farthest, time] = Object.entries(hours).sort((a, b) => b[1] - a[1])[0]!;
    const engine = new Engine(newGame(1, 0));
    engine.handle({ type: 'travel', to: farthest }, 0);
    // The road takes its hours, plus the nights spent in camp on the way.
    engine.run(time);
    expect(engine.state.journey).not.toBeNull();
    engine.run(time * 2);
    expect(engine.state).toMatchObject({ place: farthest, journey: null });
  });

  it('joins only places that exist, with whole hours', () => {
    for (const road of WORLD.roads) {
      expect(world.places.has(road.from) && world.places.has(road.to)).toBe(true);
      expect(Number.isInteger(road.hours) && road.hours >= 1).toBe(true);
    }
  });
});

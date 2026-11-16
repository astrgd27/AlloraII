import { Engine, WORLD, newGame } from '@allora/engine';
import { describe, expect, it } from 'vitest';
import { composeScene, skyAt } from './compose';

const at = (place: string, hours: number) => {
  const state = newGame(3, 0);
  state.place = place;
  state.hours = hours;
  return new Engine(state).snapshot();
};

describe('the scene', () => {
  it('always shows a place the same way at the same hour', () => {
    expect(composeScene(at('ostwick', 6), WORLD)).toEqual(composeScene(at('ostwick', 6), WORLD));
    expect(composeScene(at('ostwick', 6), WORLD).buildings).not.toEqual(
      composeScene(at('tennfels', 6), WORLD).buildings,
    );
  });

  it('changes with the hour: sun by day, moon, stars and lamps by night', () => {
    const noon = composeScene(at('ostwick', 6), WORLD);
    const night = composeScene(at('ostwick', 17), WORLD);
    expect(noon.light?.kind).toBe('sun');
    expect(noon.stars).toHaveLength(0);
    expect(noon.buildings.some((b) => b.lit)).toBe(false);
    expect(night.light?.kind).toBe('moon');
    expect(night.stars.length).toBeGreaterThan(0);
    expect(night.buildings.some((b) => b.lit)).toBe(true);
    expect(night.description).toContain('Lamps are lit');
    expect(skyAt(12)).not.toEqual(skyAt(0));
    // The buildings themselves do not move.
    expect(night.buildings.map((b) => b.x)).toEqual(noon.buildings.map((b) => b.x));
  });

  it('changes with the season', () => {
    const spring = composeScene(at('ostwick', 6), WORLD);
    const winter = composeScene(at('ostwick', 6 + 24 * 28 * 3), WORLD);
    expect(winter.far.color).not.toBe(spring.far.color);
    expect(winter.trees.every((t) => t.bare)).toBe(true);
    expect(winter.description).toContain('winter');
  });

  it('shows a figure for each person who is there', () => {
    for (const hours of [0, 6, 14]) {
      const snap = at('ostwick', hours);
      const scene = composeScene(snap, WORLD);
      expect(scene.figures).toHaveLength(Math.min(snap.here.length, 8));
    }
    const empty = composeScene(at('salzmoor', 6), WORLD);
    expect(empty.figures).toHaveLength(0);
    expect(empty.description).toContain('Nobody is about');
  });

  it('gives a city more buildings than a village, and the wild none', () => {
    const count = (id: string) => composeScene(at(id, 6), WORLD).buildings.length;
    expect(count('kess_market')).toBeGreaterThan(count('ostwick'));
    expect(count('salzmoor')).toBe(0);
  });

  it('shows the road while travelling', () => {
    const state = newGame(3, 0);
    const engine = new Engine(state);
    engine.handle({ type: 'travel', to: 'tennfels' }, 0);
    engine.run(1);
    const scene = composeScene(engine.snapshot(), WORLD);
    expect(scene.way).toBe('road');
    expect(scene.buildings).toHaveLength(0);
  });
});

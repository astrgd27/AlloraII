/** The Phase 1 gate, as far as a test can hold it (docs/phase-1.md). */
import { describe, expect, it } from 'vitest';
import { Engine } from './engine';
import { newGame } from './state';
import { WORLD } from './world';

describe('the Phase 1 gate', () => {
  it('gives every place a resident with a routine and a reason to return', () => {
    const lived = new Set((WORLD.people ?? []).flatMap((p) => p.sched.map((s) => s.at[0])));
    const reasons = new Set((WORLD.activities ?? []).filter((a) => !a.post).map((a) => a.place));
    expect(WORLD.places.length).toBeGreaterThanOrEqual(150);
    for (const place of WORLD.places) {
      expect(lived.has(place.id), `${place.id} has no resident`).toBe(true);
      expect(reasons.has(place.id), `${place.id} has nothing to do`).toBe(true);
    }
  });

  it('gives each of the three trades duties, four cases or more, three trials and four ranks', () => {
    const posts = WORLD.posts ?? [];
    expect(posts.map((p) => p.id).sort()).toEqual([
      'post_cerdans_inquirer',
      'post_kesselhaven_guild_smith',
      'post_tennfels_steward',
    ]);
    for (const post of posts) {
      const cases = (WORLD.cases ?? []).filter((c) => c.post === post.id);
      expect(post.ranks).toHaveLength(4);
      expect(post.pay).toHaveLength(4);
      expect((WORLD.activities ?? []).filter((a) => a.post === post.id).length).toBeGreaterThan(2);
      expect(cases.filter((c) => c.trialFor === undefined).length).toBeGreaterThanOrEqual(4);
      expect(
        cases
          .filter((c) => c.trialFor !== undefined)
          .map((c) => c.trialFor)
          .sort(),
      ).toEqual([1, 2, 3]);
    }
  });

  it('lets a life left to itself live a week in Ostwick: fed, rested and a little richer', () => {
    const engine = new Engine(newGame(21, 0));
    engine.handle({ type: 'setOrders', orders: { work: 'always' } }, 0);
    let lowest = 100;
    for (let h = 0; h < 7 * 24; h++) {
      engine.tick();
      lowest = Math.min(lowest, engine.state.needs.vigour);
    }
    expect(engine.state.place).toBe('ostwick');
    expect(engine.state.poorMeals).toBe(0);
    expect(engine.state.meals).toBe(21);
    expect(lowest).toBeGreaterThan(20);
    expect(engine.state.needs.health).toBeGreaterThan(90);
    expect(engine.state.money).toBeGreaterThan(20);
  });
});

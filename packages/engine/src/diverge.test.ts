import { describe, expect, it } from 'vitest';
import { HARMONY } from './career';
import { Engine } from './engine';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';

const at = (place: string, post: string, goods: Record<string, number> = {}) => {
  const state = newGame(6, 0);
  state.place = place;
  state.home = place;
  state.goods = goods;
  state.money = 500;
  const e = new Engine(state);
  e.handle({ type: 'takePost', post }, 0);
  e.run(2);
  return e;
};

describe('the smith works from materials and learns techniques', () => {
  it('cannot take a commission without a bar, and says so', () => {
    const e = at('kess_market', 'post_kesselhaven_guild_smith');
    expect(e.snapshot().blocked.takeCase).toMatch(/Bloomery Iron/);
    expect(() => e.handle({ type: 'takeCase', case: e.snapshot().offers[0] ?? '' }, 0)).toThrow(
      'Needs',
    );
  });

  it('uses the best bar carried, and better iron starts the piece better', () => {
    const e = at('kess_market', 'post_kesselhaven_guild_smith', { iron_ingot: 1, iron_t3: 1 });
    e.handle({ type: 'takeCase', case: e.snapshot().offers[0] ?? '' }, 0);
    expect(e.state.venture?.material).toBe('iron_t3');
    expect(e.state.venture?.quality).toBe(2);
    expect(e.state.goods.iron_t3).toBeUndefined();
    expect(e.state.goods.iron_ingot).toBe(1);
  });

  it('opens the pattern-weld only to masters', () => {
    const e = at('kess_market', 'post_kesselhaven_guild_smith', { iron_ingot: 2 });
    e.handle({ type: 'takeCase', case: e.snapshot().offers[0] ?? '' }, 0);
    e.state.venture!.step = 1;
    expect(e.snapshot().venture?.locked).toEqual([{ id: 'pattern_weld', rank: 2 }]);
    expect(() => e.handle({ type: 'step', approach: 'pattern_weld' }, 0)).toThrow(
      'not yet learned',
    );
    e.state.post!.rank = 2;
    expect(e.snapshot().venture?.choices.map((c) => c.id)).toContain('pattern_weld');
  });
});

describe('the butler keeps the household in harmony', () => {
  it('slips each day, rises with duties, and is felt in every incident', () => {
    const e = at('tennfels', 'post_tennfels_steward');
    expect(e.state.post?.harmony).toBe(HARMONY.start);
    e.run(24);
    expect(e.state.post?.harmony).toBe(HARMONY.start - HARMONY.daily);
    e.handle({ type: 'takeCase', case: e.snapshot().offers[0] ?? '' }, 0);
    const usual = e.snapshot().venture?.choices[0]?.chance ?? 0;
    e.state.post!.harmony = 20;
    const strained = e.snapshot().venture?.choices[0]?.chance ?? 0;
    e.state.post!.harmony = 90;
    const easy = e.snapshot().venture?.choices[0]?.chance ?? 0;
    expect(strained).toBeLessThan(usual);
    expect(easy).toBeGreaterThan(usual);
  });
});

describe('the inquirer races time', () => {
  it('loses a clue every two days once a case has been open three', () => {
    const e = at('marre_palace', 'post_cerdans_inquirer');
    e.handle({ type: 'takeCase', case: e.snapshot().offers[0] ?? '' }, 0);
    e.run(24 * 3);
    expect(e.state.venture?.lost).toBe(0);
    e.run(24 * 2);
    expect(e.state.venture?.lost).toBe(1);
    expect(e.state.venture?.quality).toBe(-1);
    expect(e.snapshot().log.some((l) => l.kind === 'lost')).toBe(true);
  });

  it('keeps a board of each step and how it went', () => {
    const e = at('marre_palace', 'post_cerdans_inquirer');
    e.handle({ type: 'takeCase', case: e.snapshot().offers[0] ?? '' }, 0);
    e.handle({ type: 'step', approach: e.snapshot().venture?.choices[0]?.id ?? '' }, 0);
    while (e.state.venture?.working) e.tick();
    expect(e.snapshot().venture?.clues).toHaveLength(1);
    expect(e.snapshot().venture?.clues[0]?.step).toBe('scene');
  });
});

describe('saves', () => {
  it('migrate a case in hand and a household', () => {
    const old = { ...newGame(1, 0), version: 15 } as Record<string, unknown>;
    old.post = { id: 'post_tennfels_steward', rank: 1, standing: 30 };
    old.venture = { case: 'x', step: 1, quality: 2, strain: 0, working: null };
    const save = migrate(old);
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.post?.harmony).toBe(60);
    expect(save.venture).toMatchObject({ clues: [], lost: 0 });
  });
});

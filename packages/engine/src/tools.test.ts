import { describe, expect, it } from 'vitest';
import { chanceOfSuccess } from './challenge';
import { Engine } from './engine';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';
import { TOOL_PAY, toolFor, toolModifiers } from './tools';

const smith = () => {
  const state = newGame(4, 0);
  state.place = 'kess_market';
  state.goods = { iron_ingot: 50 };
  state.home = 'kess_market';
  const e = new Engine(state);
  e.handle({ type: 'takePost', post: 'post_kesselhaven_guild_smith' }, 0);
  e.run(2);
  return e;
};

describe('tools', () => {
  it('are sold where their trade is done', () => {
    const e = smith();
    const row = e.snapshot().market?.stock.find((s) => s.item === 'item_hammer_tongs');
    expect(row?.buy).toBeGreaterThan(0);
  });

  it('add to the roll of their skill, by name', () => {
    const e = smith();
    expect(toolModifiers(e.state, e.world, 'skill_smithing')).toEqual([]);
    e.state.goods.item_hammer_tongs = 1;
    expect(toolModifiers(e.state, e.world, 'skill_smithing')).toEqual([
      { source: 'Hammer and Tongs', value: 2 },
    ]);
    const spec = { dc: 15, skillLevel: 10 };
    expect(
      chanceOfSuccess({ ...spec, modifiers: toolModifiers(e.state, e.world, 'skill_smithing') }),
    ).toBeGreaterThan(chanceOfSuccess(spec));
  });

  it('raise the odds of a case step, and the pay of work done with them', () => {
    const e = smith();
    e.handle({ type: 'takeCase', case: e.snapshot().offers[0] ?? '' }, 0);
    const bare = e.snapshot().venture?.choices[0]?.chance ?? 0;
    e.state.goods.item_hammer_tongs = 1;
    expect(e.snapshot().venture?.choices[0]?.chance).toBeGreaterThan(bare);

    const v = new Engine(newGame(4, 0));
    v.run(1);
    const job = [...v.world.activities.values()].find(
      (a) => a.skill === 'skill_cookery' && a.pay && a.place === 'ostwick',
    );
    if (!job) throw new Error('no cookery work in Ostwick');
    v.state.goods.item_bread_peel = 1;
    v.state.hours = 24 * 0 + Math.max(job.from - 6, 0);
    while (!v.snapshot().canDo.includes(job.id)) v.tick();
    v.handle({ type: 'do', activity: job.id }, 0);
    expect(v.state.doing?.pay).toBeCloseTo((job.pay ?? 0) * TOOL_PAY);
  });

  it('wear with use, and break when spent, the next one taken up', () => {
    const e = smith();
    e.state.goods.item_hammer_tongs = 2;
    const tool = toolFor(e.state, e.world, 'skill_smithing');
    if (!tool) throw new Error('no tool');
    e.state.wear[tool.item] = 1;
    e.handle({ type: 'takeCase', case: e.snapshot().offers[0] ?? '' }, 0);
    e.handle({ type: 'step', approach: e.snapshot().venture?.choices[0]?.id ?? '' }, 0);
    while (e.state.venture?.working) e.tick();
    expect(e.state.goods.item_hammer_tongs).toBe(1);
    expect(e.state.wear.item_hammer_tongs).toBeUndefined();
    expect(e.snapshot().log.some((l) => l.kind === 'broke')).toBe(true);
    expect(e.snapshot().tools[0]).toMatchObject({ item: 'item_hammer_tongs', left: tool.wear });
  });

  it('keeps a trial piece', () => {
    const e = smith();
    e.state.post = { id: 'post_kesselhaven_guild_smith', rank: 0, standing: 999 };
    e.state.skills.skill_smithing = { level: 25, xp: 0, gates: 1 };
    Object.assign(e.state, { venture: null });
    const trial = e.snapshot().offers.find((id) => e.world.cases.get(id)?.trialFor === 1);
    expect(trial).toBeDefined();
    e.handle({ type: 'takeCase', case: trial ?? '' }, 0);
    for (let i = 0; i < 6 && e.state.venture; i++) {
      e.handle({ type: 'step', approach: e.snapshot().venture?.choices[0]?.id ?? '' }, 0);
      while (e.state.venture?.working) e.tick();
      if (e.state.asleep) while (e.state.asleep) e.tick();
    }
    expect(e.snapshot().keepsakes).toHaveLength(1);
    expect(e.snapshot().keepsakes[0]?.case).toBe(trial);
  });

  it('migrates an older save', () => {
    const old = { ...newGame(1, 0), version: 13 } as Record<string, unknown>;
    delete old.wear;
    delete old.keepsakes;
    const save = migrate(old);
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.wear).toEqual({});
    expect(save.keepsakes).toEqual([]);
  });
});

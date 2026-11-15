import { describe, expect, it } from 'vitest';
import { START_HOUR } from './calendar';
import { STRAIN_LIMIT, TRIAL_STANDING, choices, offers } from './career';
import { Engine } from './engine';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';
import { WORLD } from './world';

const POST = 'post_kesselhaven_guild_smith';
const SKILL = 'skill_smithing';

/** A life at the guild forges at the 8th hour, holding the post unless told otherwise. */
function smith(seed = 1, hold = true): Engine {
  const state = newGame(seed, 0);
  state.place = 'kess_market';
  state.home = 'kess_market';
  state.hours = 8 - START_HOUR;
  const engine = new Engine(state);
  if (hold) engine.handle({ type: 'takePost', post: POST }, 0);
  return engine;
}

/** Works the case in hand to its end, always by the first (safe) approach, waiting out the nights. */
function finish(engine: Engine): void {
  for (let guard = 0; guard < 500 && engine.state.venture; guard++) {
    const v = engine.snapshot().venture;
    if (v && v.hoursLeft === 0 && !engine.state.asleep) {
      const first = v.choices[0];
      if (first) engine.handle({ type: 'step', approach: first.id }, 0);
    }
    engine.tick();
  }
}

describe('the post', () => {
  it('is a ladder of four ranks with five steps of work', () => {
    const post = WORLD.posts?.find((p) => p.id === POST);
    expect(post?.ranks).toEqual(['Apprentice', 'Journeyman', 'Master', 'Grandmaster']);
    expect(post?.work.map((s) => s.id)).toEqual(['heat', 'weld', 'quench', 'temper', 'finish']);
  });

  it('is taken up at the guild forges, and passes the apprenticeship gate', () => {
    const away = new Engine(newGame(1, 0));
    expect(away.snapshot().postsHere).toEqual([]);
    expect(() => away.handle({ type: 'takePost', post: POST }, 0)).toThrow(/not here/i);
    const engine = smith(1, false);
    expect(engine.snapshot().postsHere).toEqual([POST]);
    engine.handle({ type: 'takePost', post: POST }, 0);
    expect(engine.snapshot().post).toEqual({ id: POST, rank: 0, standing: 0 });
    expect(engine.state.skills[SKILL]?.gates).toBe(1);
    expect(() => engine.handle({ type: 'takePost', post: POST }, 0)).toThrow(/already/i);
  });

  it('opens the duties to those who hold it, and they build standing', () => {
    expect(smith(1, false).snapshot().canDo).not.toContain('activity_smith_forge_nails');
    const engine = smith();
    engine.handle({ type: 'do', activity: 'activity_smith_forge_nails' }, 0);
    engine.run(2);
    expect(engine.snapshot().post?.standing).toBe(1);
    expect(engine.state.skills[SKILL]?.xp).toBeGreaterThan(0);
  });
});

describe('a commission', () => {
  it('offers an apprentice only apprentice work, and no trial', () => {
    const ids = smith().snapshot().offers;
    expect(ids).toEqual(['case_smith_harbour_nails', 'case_smith_ploughshare']);
  });

  it('is worked step by step, each a check with its odds shown first', () => {
    const engine = smith();
    engine.handle({ type: 'takeCase', case: 'case_smith_ploughshare' }, 0);
    const v = engine.snapshot().venture;
    expect(v).toMatchObject({ step: 0, steps: 5, quality: 0, strain: 0 });
    expect(v?.choices.map((c) => c.id)).toEqual(['safe_heat', 'hot_heat']);
    expect(v?.choices[0]?.chance).toBeGreaterThan(v?.choices[1]?.chance ?? 1);
    engine.handle({ type: 'step', approach: 'safe_heat' }, 0);
    expect(() => engine.handle({ type: 'step', approach: 'safe_heat' }, 0)).toThrow(/busy/i);
    expect(() => engine.handle({ type: 'travel', to: 'kess_harbor' }, 0)).toThrow(/busy/i);
    engine.run(1);
    expect(engine.snapshot().venture).toMatchObject({ step: 1 });
    expect(engine.snapshot().lastCheck?.activity).toBe('case_smith_ploughshare/heat');
  });

  it('ends as a finished work, and good work builds standing', () => {
    const engine = smith();
    const done: number[] = [];
    engine.bus.on('CaseFinished', (e) => done.push(e.quality));
    engine.handle({ type: 'takeCase', case: 'case_smith_harbour_nails' }, 0);
    finish(engine);
    expect(done).toHaveLength(1);
    expect(engine.snapshot()).toMatchObject({ works: 1, venture: null });
    expect(engine.snapshot().lastWork).toMatchObject({
      case: 'case_smith_harbour_nails',
      trial: false,
    });
    expect(engine.snapshot().post?.standing).toBe(Math.max(0, done[0] ?? 0));
  });

  it('must be worked at the forge, and can be given up at a cost in standing', () => {
    const engine = smith();
    engine.state.post!.standing = 5;
    engine.handle({ type: 'takeCase', case: 'case_smith_ploughshare' }, 0);
    engine.state.place = 'kess_harbor';
    expect(() => engine.handle({ type: 'step', approach: 'safe_heat' }, 0)).toThrow(/workshop/i);
    engine.handle({ type: 'withdraw' }, 0);
    expect(engine.snapshot()).toMatchObject({ venture: null, post: { standing: 3 } });
  });

  it('is pressed on at disadvantage once strain reaches its limit', () => {
    const engine = smith();
    engine.handle({ type: 'takeCase', case: 'case_smith_ploughshare' }, 0);
    const before = choices(engine.state, engine.world)[0]?.chance ?? 0;
    engine.state.venture!.strain = STRAIN_LIMIT;
    expect(choices(engine.state, engine.world)[0]?.chance).toBeLessThan(before);
  });
});

describe('trials', () => {
  it('are offered only at the gate, with standing enough', () => {
    const engine = smith();
    const trial = 'case_smith_trial_journeyman';
    engine.state.skills[SKILL] = { level: 25, xp: 0, gates: 1 };
    expect(offers(engine.state, engine.world).map((c) => c.id)).not.toContain(trial);
    engine.state.post!.standing = TRIAL_STANDING[1]!;
    expect(offers(engine.state, engine.world).map((c) => c.id)).toContain(trial);
    engine.state.skills[SKILL] = { level: 24, xp: 0, gates: 1 };
    expect(offers(engine.state, engine.world).map((c) => c.id)).not.toContain(trial);
  });

  it('win the next rank and lift the cap, or cost standing if the piece is refused', () => {
    let passed = 0;
    let refused = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const engine = smith(seed);
      engine.state.skills[SKILL] = { level: 25, xp: 0, gates: 1 };
      engine.state.post!.standing = 40;
      engine.handle({ type: 'takeCase', case: 'case_smith_trial_journeyman' }, 0);
      finish(engine);
      if (engine.state.post!.rank === 1) {
        passed += 1;
        expect(engine.state.skills[SKILL]?.gates).toBe(2);
        expect(engine.snapshot().offers).toContain('case_smith_guard_halberds');
      } else {
        refused += 1;
        expect(engine.state.post!.standing).toBe(30);
        expect(engine.state.skills[SKILL]?.gates).toBe(1);
      }
    }
    expect(passed).toBeGreaterThan(0);
    expect(passed + refused).toBe(12);
  });

  it('migrates a v8 save', () => {
    const v8 = { ...newGame(1, 0), version: 8 } as Record<string, unknown>;
    delete v8.post;
    delete v8.venture;
    delete v8.works;
    expect(migrate(v8)).toMatchObject({
      version: SAVE_VERSION,
      post: null,
      venture: null,
      works: [],
    });
  });
});

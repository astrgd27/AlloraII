import { describe, expect, it } from 'vitest';
import { START_HOUR } from './calendar';
import {
  DIFFICULTY,
  chanceOfSuccess,
  degreeOf,
  edgeOf,
  lessonFactor,
  odds,
  oddsWord,
  rollCheck,
  skillBonus,
} from './challenge';
import { Engine } from './engine';
import { createRng } from './rng';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';

const tools = [{ source: 'tools and technique', value: 6 }];

describe('the roll', () => {
  it('adds skill level ÷ 5, rounded down', () => {
    expect([0, 4, 5, 49, 100, 250].map(skillBonus)).toEqual([0, 0, 1, 9, 20, 20]);
  });

  it('gives a master the odds the bible states', () => {
    const master = { skillLevel: 100, modifiers: tools };
    expect(chanceOfSuccess({ ...master, dc: DIFFICULTY.heroic })).toBeCloseTo(0.85);
    expect(chanceOfSuccess({ ...master, dc: DIFFICULTY.legendary })).toBeCloseTo(0.6);
  });

  it('sets the degree by the margin', () => {
    expect([10, 9, 0, -1, -4, -5, -9, -10].map((m) => degreeOf(m, 10))).toEqual([
      'triumph',
      'success',
      'success',
      'cost',
      'cost',
      'failure',
      'failure',
      'disaster',
    ]);
  });

  it('lets a natural 20 raise the degree and a natural 1 lower it', () => {
    expect(degreeOf(-6, 20)).toBe('cost');
    expect(degreeOf(12, 20)).toBe('triumph');
    expect(degreeOf(3, 1)).toBe('cost');
    expect(degreeOf(-12, 1)).toBe('disaster');
  });

  it('turns a near miss into a failure where a step allows no cost', () => {
    expect(degreeOf(-2, 10, false)).toBe('failure');
  });

  it('has odds that sum to one, with and without advantage', () => {
    for (const advantage of [-1, 0, 1] as const) {
      const o = odds({ dc: 15, skillLevel: 20, advantage });
      expect(Object.values(o).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    }
    const plain = chanceOfSuccess({ dc: 15, skillLevel: 20 });
    expect(chanceOfSuccess({ dc: 15, skillLevel: 20, advantage: 1 })).toBeGreaterThan(plain);
    expect(chanceOfSuccess({ dc: 15, skillLevel: 20, advantage: -1 })).toBeLessThan(plain);
  });

  it('rolls what the odds promise, and the same again for the same seed', () => {
    const spec = { dc: 15, skillLevel: 25 };
    const run = (seed: number) => {
      const rng = createRng();
      return Array.from({ length: 4000 }, () => rollCheck(spec, rng, seed, 'checks'));
    };
    const rolls = run(7);
    const wins = rolls.filter((r) => r.degree === 'success' || r.degree === 'triumph').length;
    expect(wins / rolls.length).toBeCloseTo(chanceOfSuccess(spec), 1);
    expect(run(7)).toEqual(rolls);
    expect(rolls.every((r) => r.die >= 1 && r.die <= 20 && r.total === r.die + 5)).toBe(true);
  });

  it('puts the odds in words', () => {
    expect([0.97, 0.8, 0.5, 0.3, 0.1, 0.01].map(oddsWord)).toEqual([
      'Sure',
      'Likely',
      'Even',
      'Risky',
      'Long shot',
      'Hopeless',
    ]);
  });

  it('measures the edge against 10 + bonus, and halves the lesson of a failure', () => {
    expect(edgeOf({ dc: 15, skillLevel: 25 })).toBe(0);
    expect(edgeOf({ dc: 10, skillLevel: 0 })).toBe(0);
    expect([lessonFactor('failure'), lessonFactor('disaster'), lessonFactor('success')]).toEqual([
      0.5, 0.5, 1,
    ]);
  });
});

describe('checks in play', () => {
  const kegel = 'activity_ostwick_roll_kegel';
  const evening = () => {
    const state = newGame(3, 0);
    state.hours = 18 - START_HOUR;
    return new Engine(state);
  };

  it('shows the chance before the work is begun', () => {
    expect(evening().snapshot().chances[kegel]).toBeCloseTo(0.55);
  });

  it('rolls when the work is done, records it and teaches', () => {
    const engine = evening();
    engine.handle({ type: 'do', activity: kegel }, 0);
    engine.run(1);
    const check = engine.snapshot().lastCheck;
    expect(check).toMatchObject({ activity: kegel, dc: 10, bonus: 0 });
    expect(Object.values(engine.state.checks).reduce((a, b) => a + b, 0)).toBe(1);
    const xp = engine.state.skills.skill_revelry?.xp ?? 0;
    expect([5, 10]).toContain(xp);
  });

  it('migrates a v6 save', () => {
    const v6 = { ...newGame(1, 0), version: 6 } as Record<string, unknown>;
    delete v6.lastCheck;
    delete v6.checks;
    delete v6.resolve;
    expect(migrate(v6)).toMatchObject({
      version: SAVE_VERSION,
      lastCheck: null,
      checks: {},
      resolve: 3,
    });
  });
});

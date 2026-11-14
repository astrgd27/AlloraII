import { describe, expect, it } from 'vitest';
import { DAYS_PER_SEASON, HOURS_PER_DAY, START_HOUR } from './calendar';
import { Engine } from './engine';
import { migrate } from './save/migrations';
import {
  capOf,
  edgeFactor,
  gain,
  hoursToLevel,
  newSkill,
  passGate,
  workXp,
  xpToNext,
} from './skills';
import { SAVE_VERSION, newGame } from './state';
import { WORLD } from './world';

describe('the learning curve', () => {
  it('needs about 4% more experience each level', () => {
    expect(xpToNext(0)).toBe(75);
    expect(xpToNext(1) / xpToNext(0)).toBeCloseTo(1.04, 2);
    expect(xpToNext(99)).toBeGreaterThan(xpToNext(50) * 6);
  });

  it('puts level 50 near 55 real hours and 100 near 400, working a third of the time', () => {
    // One real hour is 60 game hours; a life works about a third of them.
    const realHours = (level: number) => (hoursToLevel(level) * 3) / 60;
    expect(realHours(50)).toBeGreaterThan(45);
    expect(realHours(50)).toBeLessThan(65);
    expect(realHours(100)).toBeGreaterThan(350);
    expect(realHours(100)).toBeLessThan(500);
  });

  it('teaches most at the edge, as the bible sets out', () => {
    expect([-15, -10, -5, 0, 5, 10, 20].map(edgeFactor)).toEqual([0, 0, 0.25, 1, 1.25, 0.5, 0.5]);
    expect(edgeFactor(-2.5)).toBeCloseTo(0.625);
    expect(workXp(2, 1, 1)).toBe(20);
    expect(workXp(2, 1, 11)).toBe(0);
  });
});

describe('gates', () => {
  it('cap a skill at 10 and bank at most one level beyond', () => {
    const skill = newSkill();
    gain(skill, 1_000_000);
    expect(skill.level).toBe(10);
    expect(capOf(skill)).toBe(10);
    expect(skill.xp).toBe(xpToNext(10));
  });

  it('spend the bank when passed, and stand at 10, 25, 50 and 75', () => {
    const skill = newSkill();
    const caps: number[] = [];
    for (let i = 0; i < 4; i++) {
      gain(skill, 1_000_000);
      caps.push(skill.level);
      passGate(skill);
    }
    expect(caps).toEqual([10, 25, 50, 75]);
    expect(skill.level).toBe(76);
    gain(skill, 10_000_000);
    expect(skill.level).toBe(100);
    expect(() => passGate(skill)).toThrow();
  });

  it('cannot be passed before the cap is reached', () => {
    expect(() => passGate(newSkill())).toThrow(/not yet/i);
  });
});

describe('learning from work', () => {
  const hoursFor = (hour: number) => (hour - START_HOUR + 24) % 24;

  it('trains the skill an activity names, when the work is done', () => {
    const state = newGame(1, 0);
    state.hours = hoursFor(7);
    const engine = new Engine(state);
    engine.handle({ type: 'do', activity: 'activity_ostwick_weed_furrows' }, 0);
    expect(engine.snapshot().skills).toEqual({});
    engine.run(2);
    expect(engine.snapshot().skills.skill_husbandry).toMatchObject({ level: 0, atGate: false });
    expect(engine.state.skills.skill_husbandry?.xp).toBe(20);
  });

  it('stops teaching village work at the apprenticeship gate', () => {
    const engine = new Engine(newGame(1, 0));
    engine.state.skills.skill_husbandry = { level: 10, xp: 0, gates: 0 };
    engine.state.hours = hoursFor(7) + DAYS_PER_SEASON * HOURS_PER_DAY;
    engine.handle({ type: 'do', activity: 'activity_ostwick_weed_furrows' }, 0);
    engine.run(2);
    expect(engine.snapshot().skills.skill_husbandry).toEqual({
      level: 10,
      progress: expect.any(Number),
      atGate: true,
    });
  });

  it('names a real skill in every activity that trains one', () => {
    const ids = new Set((WORLD.skills ?? []).map((s) => s.id));
    expect(ids.size).toBe(72);
    for (const a of WORLD.activities ?? []) {
      if (a.skill?.startsWith('skill_')) expect(ids.has(a.skill)).toBe(true);
    }
  });

  it('migrates a v5 save', () => {
    const v5 = { ...newGame(1, 0), version: 5 } as Record<string, unknown>;
    delete v5.skills;
    expect(migrate(v5)).toMatchObject({ version: SAVE_VERSION, skills: {} });
  });
});

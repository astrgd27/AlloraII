import { HOURS_PER_YEAR, WORLD } from '@allora/engine';
import { describe, expect, it } from 'vitest';
import { DAY_BUDGET_MS, playLife, runBalance, villager, wanderer } from './bot';
import { REPORT_MARKER, renderReport } from './report';

describe('the balance bot', () => {
  it('plays a whole game year and ends on the first day of the next', () => {
    const life = playLife(wanderer, 1, HOURS_PER_YEAR);
    expect(life.endDate).toBe('Day 1 of Spring, 1348 AR');
    expect(life.journeys).toBeGreaterThan(10);
    expect(life.hoursOnTheRoad).toBeGreaterThan(HOURS_PER_YEAR * 0.9);
    // A wanderer never sleeps at home, yet camps, eats and stays alive.
    expect(life.hoursSlept).toBeGreaterThan(112 * 6);
    expect(life.needs.health.low).toBeGreaterThan(50);
  });

  it('gives the same life for the same seed, and another for another', () => {
    expect(playLife(wanderer, 7, 2000)).toEqual(playLife(wanderer, 7, 2000));
    expect(playLife(wanderer, 7, 2000).arrivals).not.toEqual(playLife(wanderer, 8, 2000).arrivals);
  });

  it('only ever arrives at places of the world', () => {
    const ids = new Set(WORLD.places.map((p) => p.id));
    for (const place of Object.keys(playLife(wanderer, 3, HOURS_PER_YEAR).arrivals)) {
      expect(ids.has(place)).toBe(true);
    }
  });

  it('simulates a game day well inside the 20 ms budget', () => {
    const run = runBalance({ lives: 5 });
    expect(run.msPerGameDay).toBeLessThan(DAY_BUDGET_MS);
  });
});

describe('the villager', () => {
  it('works, learns and stays well for a year', () => {
    const life = playLife(villager, 1, HOURS_PER_YEAR);
    expect(life.journeys).toBe(0);
    expect(life.hoursWorked).toBeGreaterThan(500);
    expect(life.skills.skill_husbandry).toBeGreaterThan(3);
    expect(Math.max(...Object.values(life.skills))).toBeLessThanOrEqual(10);
    expect(life.needs.health.low).toBeGreaterThan(80);
  });
});

describe('the report', () => {
  const ticks = [0, 448];
  const run = runBalance({ lives: 4, now: () => ticks.shift() ?? 448 });

  it('has every section, and says plainly what is not built', () => {
    const report = renderReport(run);
    expect(report.startsWith(REPORT_MARKER)).toBe(true);
    for (const section of [
      'Performance budget',
      'Travel',
      'Dead content',
      'Hours to level',
      'Earnings per hour',
      'Money supply',
      'Check odds',
      'Legend pace',
    ]) {
      expect(report).toContain(`### ${section}`);
    }
    expect(report).toContain('One game day simulates in **1.0000 ms**');
    expect(report).toContain('within budget');
    expect(report.match(/No data yet/g)).toHaveLength(5);
    expect(report).toContain('does no work that trains a skill');
  });

  it('is the same every time once timings are left out', () => {
    const again = runBalance({ lives: 4 });
    expect(renderReport(again, { timings: false })).toBe(renderReport(run, { timings: false }));
  });

  it('flags a run that is over budget', () => {
    expect(renderReport({ ...run, msPerGameDay: 25 })).toContain('**over budget**');
  });
});

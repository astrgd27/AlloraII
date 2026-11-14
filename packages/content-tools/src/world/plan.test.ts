import { describe, expect, it } from 'vitest';
import {
  KIND_SHARES,
  LAND_TARGETS,
  buildPlan,
  progress,
  renderProgress,
  splitByShare,
  type PlanUnit,
} from './plan';

const units: PlanUnit[] = Object.keys(LAND_TARGETS).flatMap((land) =>
  ['a', 'b', 'c'].map((r) => ({ id: `${land}_${r}`, name: `${land} ${r}`, land, canon: 5 })),
);

describe('the world plan', () => {
  it('aims at about 2,200 places', () => {
    expect(Object.values(LAND_TARGETS).reduce((a, b) => a + b, 0)).toBe(2200);
    expect(Object.values(KIND_SHARES).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });

  it('splits whole numbers so the parts sum exactly', () => {
    expect(splitByShare(560, [1, 1, 1, 1, 1, 1, 1])).toEqual([80, 80, 80, 80, 80, 80, 80]);
    expect(splitByShare(10, [1, 1, 1])).toEqual([4, 3, 3]);
    expect(splitByShare(80, Object.values(KIND_SHARES))).toEqual([4, 12, 28, 28, 8]);
  });

  it('gives every realm a target that sums to its land, with kinds that sum to the target', () => {
    const plan = buildPlan(units);
    for (const [land, total] of Object.entries(LAND_TARGETS)) {
      const rows = plan.filter((r) => r.land === land);
      expect(rows.reduce((n, r) => n + r.target, 0)).toBe(total);
    }
    for (const row of plan) {
      expect(Object.values(row.kinds).reduce((a, b) => a + b, 0)).toBe(row.target);
    }
  });

  it('refuses a target below what canon already has, and a land with no realms', () => {
    expect(() => buildPlan(units.map((u) => ({ ...u, canon: 999 })))).toThrow(/below/);
    expect(() => buildPlan(units.filter((u) => u.land !== 'qoul'))).toThrow(/qoul/);
  });

  it('reports places built against target', () => {
    const plan = buildPlan(units);
    const rows = progress(plan, new Map([['seven_a', 19]]));
    expect(rows[0]).toMatchObject({ id: 'seven_a', built: 19 });
    expect(renderProgress(rows)).toContain('**Whole world: 19 of 2200 places.**');
  });
});

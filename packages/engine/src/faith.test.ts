import { describe, expect, it } from 'vitest';
import { DAYS_PER_SEASON, HOURS_PER_DAY } from './calendar';
import { Engine } from './engine';
import { BOON_PER_RANK, PARISH, RESTORE, boonFactor, lodgingFactor } from './faith';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';
import { dateAt } from './calendar';

const devout = (place = 'ostwick') => {
  const state = newGame(3, 0);
  state.place = place;
  state.money = 500;
  state.skills.skill_devotion = { level: 5, xp: 0, gates: 1 };
  return new Engine(state);
};

describe('keeping Ilvara', () => {
  it('is joined at her own site, by one of her two flames, with devotion enough', () => {
    const e = devout();
    expect(e.snapshot().joinable).toEqual([{ faith: 'ilvara', aspect: 'hearth' }]);
    const novice = new Engine(newGame(3, 0));
    expect(novice.snapshot().joinable[0]?.why).toMatch(/Devotion 5/);
    e.handle({ type: 'join', faith: 'ilvara', aspect: 'hearth' }, 0);
    expect(e.snapshot().faith).toMatchObject({ faith: 'ilvara', aspect: 'hearth', rank: 0 });
    expect(() => e.handle({ type: 'join', faith: 'ilvara', aspect: 'hearth' }, 0)).toThrow(
      'Already',
    );
  });

  it('gives the Hearth devotion from cooking and farming, and raises its rank', () => {
    const e = devout();
    e.handle({ type: 'join', faith: 'ilvara', aspect: 'hearth' }, 0);
    e.run(1);
    const job = e
      .snapshot()
      .canDo.find((id) => e.world.activities.get(id)?.skill === 'skill_husbandry');
    e.handle({ type: 'do', activity: job ?? '' }, 0);
    while (e.state.doing) e.tick();
    expect(e.state.faith?.devotion).toBeGreaterThan(0);
    e.state.faith!.devotion = 39;
    e.handle({ type: 'do', activity: 'activity_ilvara_bake_poor' }, 0);
    while (e.state.doing) e.tick();
    expect(e.state.faith?.rank).toBe(1);
    expect(e.snapshot().log.some((l) => l.kind === 'faith' && l.rank === 1)).toBe(true);
  });

  it('lends its boons: learning, and in winter cheaper lodging for the Hearth', () => {
    const e = devout();
    e.handle({ type: 'join', faith: 'ilvara', aspect: 'hearth' }, 0);
    e.state.faith!.rank = 1;
    expect(boonFactor(e.state, e.world, 'skill_cookery')).toBeCloseTo(1 + 2 * BOON_PER_RANK);
    expect(boonFactor(e.state, e.world, 'skill_smithing')).toBe(1);
    expect(lodgingFactor(e.state, dateAt(3 * DAYS_PER_SEASON * HOURS_PER_DAY))).toBe(0.5);
    expect(lodgingFactor(e.state, dateAt(0))).toBe(1);
  });

  it('asks parish work of a Hearth-Friend, lapses without it, and three acts restore', () => {
    const e = devout();
    e.handle({ type: 'join', faith: 'ilvara', aspect: 'hearth' }, 0);
    e.state.faith!.rank = 1;
    e.run(PARISH.days * HOURS_PER_DAY);
    expect(e.state.faith?.lapsed).toBe(true);
    expect(boonFactor(e.state, e.world, 'skill_cookery')).toBe(1);
    for (let i = 0; i < RESTORE; i++) {
      while (!e.snapshot().canDo.includes('activity_ilvara_bake_poor')) e.tick();
      e.handle({ type: 'do', activity: 'activity_ilvara_bake_poor' }, 0);
      while (e.state.doing) e.tick();
    }
    expect(e.state.faith?.lapsed).toBe(false);
  });

  it('gives the Pyre devotion only from offerings, worth their value, twice in autumn', () => {
    const e = devout('aschau');
    e.handle({ type: 'join', faith: 'ilvara', aspect: 'pyre' }, 0);
    e.state.goods = { axe: 2 };
    e.handle({ type: 'offer', item: 'axe' }, 0);
    expect(e.state.faith?.devotion).toBe(15);
    e.state.hours = 2 * DAYS_PER_SEASON * HOURS_PER_DAY;
    e.handle({ type: 'offer', item: 'axe' }, 0);
    expect(e.state.faith?.devotion).toBe(45);
    expect(e.state.goods.axe).toBeUndefined();
  });

  it('holds the Pyre short of Ash-Marked until the coals are walked', () => {
    const e = devout('aschau');
    e.handle({ type: 'join', faith: 'ilvara', aspect: 'pyre' }, 0);
    e.state.faith!.devotion = 290;
    e.state.goods = { axe: 2 };
    e.handle({ type: 'offer', item: 'axe' }, 0);
    expect(e.state.faith?.devotion).toBe(305);
    expect(e.state.faith?.rank).toBe(2);
    e.state.faith!.coals = true;
    e.handle({ type: 'offer', item: 'axe' }, 0);
    expect(e.state.faith?.rank).toBe(3);
  });

  it('keeps its work for the faithful', () => {
    const e = devout();
    e.run(1);
    expect(e.snapshot().work.find((w) => w.id === 'activity_ilvara_bake_poor')?.reason).toMatch(
      /faithful/,
    );
  });

  it('migrates an older save', () => {
    const old = { ...newGame(1, 0), version: 17 } as Record<string, unknown>;
    delete old.faith;
    expect(migrate(old).version).toBe(SAVE_VERSION);
    expect(migrate(old).faith).toBeNull();
  });
});

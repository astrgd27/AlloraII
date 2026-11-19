import { describe, expect, it } from 'vitest';
import { START_HOUR } from './calendar';
import { boostModifiers, magicHour, WILL_MAX } from './magic';
import { Engine } from './engine';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';

const ART = 'school_hermetic_evocation';

/** A lettered life at the Collegium with a purse, parchment and ink. */
function scholar(seed = 1, letters = 5): Engine {
  const state = newGame(seed, 0);
  state.place = 'collegium';
  state.money = 200;
  state.goods = { parchment: 3, ink: 5 };
  state.skills.skill_letters = { level: letters, xp: 0, gates: 0 };
  return new Engine(state);
}

const sworn = (seed = 1): Engine => {
  const e = scholar(seed);
  e.handle({ type: 'matriculate', art: ART }, 0);
  e.handle({ type: 'copy', proof: 'proof_force' }, 0);
  return e;
};

describe('the Collegium', () => {
  it('matriculates only the lettered who can pay, and only at the Collegium', () => {
    expect(scholar(1, 2).snapshot().study[0]?.matriculateWhy).toMatch(/Letters 5/);
    const away = scholar();
    away.state.place = 'ostwick';
    expect(away.snapshot().study).toEqual([]);
    const poor = scholar();
    poor.state.money = 5;
    expect(poor.snapshot().study[0]?.matriculateWhy).toMatch(/fee/);
    const e = scholar();
    e.handle({ type: 'matriculate', art: ART }, 0);
    expect(e.state.money).toBe(175);
    expect(e.snapshot().magic).toMatchObject({ art: ART, degree: 0, will: WILL_MAX });
    expect(e.snapshot().log[0]).toMatchObject({ kind: 'degree', degree: 0 });
  });

  it('copies a proof for its fee, a parchment and an ink', () => {
    const e = scholar();
    expect(e.snapshot().study[0]?.library[0]?.why).toMatch(/matriculated/);
    e.handle({ type: 'matriculate', art: ART }, 0);
    e.handle({ type: 'copy', proof: 'proof_force' }, 0);
    expect(e.state.magic?.proofs).toEqual(['proof_force']);
    expect(e.state.goods).toMatchObject({ parchment: 2, ink: 4 });
    expect(e.snapshot().study[0]?.library[0]?.why).toBe('Already copied');
    expect(e.snapshot().study[0]?.library[1]?.why).toMatch(/Beyond you yet/);
    e.state.skills.skill_evocation = { level: 5, xp: 0, gates: 0 };
    e.state.goods = {};
    expect(e.snapshot().study[0]?.library[1]?.why).toMatch(/parchment/);
  });

  it('casts for Will and ink: a boost to the named skills, or a misfire that burns', () => {
    let held = 0;
    let burned = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const e = sworn(seed);
      e.handle({ type: 'cast', proof: 'proof_force' }, 0);
      expect(e.state.magic?.will).toBe(WILL_MAX - 10);
      expect(e.state.goods.ink).toBe(3);
      if (e.state.magic?.boosts.length) {
        held++;
        expect(boostModifiers(e.state, e.world, 'skill_athletics')).toEqual([
          { source: 'Lesser Proof of Force', value: 1 },
        ]);
        expect(boostModifiers(e.state, e.world, 'skill_cookery')).toEqual([]);
      } else {
        burned++;
        expect(e.state.needs.health).toBeLessThan(100);
      }
    }
    expect(held).toBeGreaterThan(0);
    expect(burned).toBeGreaterThan(0);
  });

  it('refuses a cast without Will or ink, and Will comes back with rest', () => {
    const e = sworn();
    e.state.magic!.will = 4;
    expect(e.snapshot().magic?.proofs[0]?.why).toMatch(/Will/);
    e.state.asleep = true;
    magicHour(e.state);
    expect(e.state.magic?.will).toBe(10);
    e.state.asleep = false;
    e.state.goods = {};
    expect(e.snapshot().magic?.proofs[0]?.why).toMatch(/ink/);
  });

  it('spares near misses for a life carrying the proof-rod', () => {
    let spared = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const bare = sworn(seed);
      const rod = sworn(seed);
      rod.state.goods.item_proof_rod = 1;
      bare.handle({ type: 'cast', proof: 'proof_force' }, 0);
      rod.handle({ type: 'cast', proof: 'proof_force' }, 0);
      const b = bare.state.magic!.boosts.length;
      const r = rod.state.magic!.boosts.length;
      expect(r).toBeGreaterThanOrEqual(b);
      if (r > b) spared++;
    }
    expect(spared).toBeGreaterThan(0);
  });

  it('lets proofs lapse when their hours run out', () => {
    const e = sworn();
    e.state.magic!.boosts = [{ proof: 'proof_force', until: e.state.hours + 1 }];
    e.state.hours += 1;
    magicHour(e.state);
    expect(e.state.magic?.boosts).toEqual([]);
  });

  it('raises degrees by disputation, one a season, with the art known well enough', () => {
    const e = sworn();
    expect(e.snapshot().magic?.disputeWhy).toMatch(/Bachelor must know the art to 20/);
    e.state.skills.skill_evocation = { level: 60, xp: 0, gates: 0 };
    e.handle({ type: 'dispute' }, 0);
    expect(e.state.magic?.degree).toBe(1);
    expect(e.snapshot().magic?.disputeWhy).toBe('One disputation a season');
    for (let season = 1; season < 10 && e.state.magic!.degree < 2; season++) {
      e.state.hours += 28 * 24;
      e.handle({ type: 'dispute' }, 0);
    }
    expect(e.state.magic?.degree).toBe(2);
    expect(e.snapshot().magic?.disputeWhy).toBe('No higher degree');
  });

  it('opens the smith a heat by proof only to a student of the art', () => {
    const smith = (study: boolean) => {
      const state = newGame(1, 0);
      state.place = 'kess_market';
      state.goods = { iron_ingot: 50 };
      state.hours = 8 - START_HOUR;
      if (study) {
        state.magic = { art: ART, degree: 0, proofs: [], will: 100, boosts: [], disputed: -1 };
        state.skills.skill_evocation = { level: 5, xp: 0, gates: 0 };
      }
      const e = new Engine(state);
      e.handle({ type: 'takePost', post: 'post_kesselhaven_guild_smith' }, 0);
      e.handle({ type: 'takeCase', case: 'case_smith_ploughshare' }, 0);
      return e.snapshot().venture?.choices.map((c) => c.id);
    };
    expect(smith(false)).toEqual(['safe_heat', 'hot_heat']);
    expect(smith(true)).toEqual(['safe_heat', 'hot_heat', 'proof_heat']);
  });

  it('migrates a version 18 save with no art studied', () => {
    const old = { ...newGame(1, 0), version: 18 } as Record<string, unknown>;
    delete old.magic;
    const save = migrate(old) as { version: number; magic: unknown };
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.magic).toBeNull();
  });
});

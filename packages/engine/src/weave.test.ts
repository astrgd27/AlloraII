import { describe, expect, it } from 'vitest';
import { Engine } from './engine';
import { legendOf } from './log';
import { SAVE_VERSION, newGame } from './state';
import { WEAVE_VERSION, migrateSave, type Weave } from './weave';
import { World } from './world';

const world = World.shared();

/** A first life with Legend to spend. */
function rich(legend = 500): Engine {
  const state = newGame(1, 0);
  state.legend = legend;
  return new Engine(state);
}

describe('Legend', () => {
  it('is earned by great deeds, never by grinding', () => {
    expect(legendOf({ kind: 'rank', post: 'p', rank: 1 })).toBe(10);
    expect(legendOf({ kind: 'rank', post: 'p', rank: 3 })).toBe(150);
    expect(legendOf({ kind: 'case', id: 'c', quality: 8, trial: false })).toBe(15);
    expect(legendOf({ kind: 'case', id: 'c', quality: 2, trial: false })).toBe(0);
    expect(legendOf({ kind: 'friend', person: 'x', tier: 3 })).toBe(10);
    expect(legendOf({ kind: 'degree', art: 'a', degree: 2 })).toBe(25);
    expect(legendOf({ kind: 'done', id: 'a' })).toBe(0);
  });

  it('is summed across the lives', () => {
    const e = rich(60);
    expect(e.snapshot().legend).toEqual({ earned: 60, free: 60 });
  });
});

describe('the Tapestry', () => {
  it('weaves a second life, then a third, each for its Legend', () => {
    const e = rich(60);
    const third = () => e.snapshot().tapestry.find((n) => n.id === 'tapestry_life_3');
    expect(third()?.why).toMatch(/second life first/);
    e.handle({ type: 'weave', node: 'tapestry_life_2' }, 0);
    expect(e.snapshot().legend.free).toBe(10);
    expect(third()?.why).toBe('Needs 150 Legend');
    expect(() => e.handle({ type: 'weave', node: 'tapestry_life_2' }, 0)).toThrow('Already');
  });

  it('opens upbringings in the Origins thread', () => {
    const e = rich(100);
    const birth = (id: string) => e.snapshot().births.find((b) => b.upbringing === id);
    e.handle({ type: 'weave', node: 'tapestry_life_2' }, 0);
    expect(birth('upbringing_collegium_scribe')?.why).toMatch(/Tapestry/);
    e.handle({ type: 'weave', node: 'upbringing_collegium_scribe' }, 0);
    expect(birth('upbringing_collegium_scribe')?.why).toBeUndefined();
  });
});

describe('several lives', () => {
  it('needs a slot before a new life can begin', () => {
    const e = rich(0);
    expect(e.snapshot().births[0]?.why).toMatch(/another life/);
    expect(() =>
      e.handle({ type: 'bear', upbringing: 'upbringing_kess_guild', name: 'Gerd Hale' }, 0),
    ).toThrow(/another life/);
  });

  it('begins a new life where it was raised, with what it was taught, and turns to it', () => {
    const e = rich();
    e.run(30);
    e.handle({ type: 'weave', node: 'tapestry_life_2' }, 0);
    e.handle({ type: 'bear', upbringing: 'upbringing_kess_guild', name: 'Gerd Hale' }, 0);
    const s = e.snapshot();
    expect(s.lives.map((l) => [l.name, l.focus])).toEqual([
      ['Rike Holt', false],
      ['Gerd Hale', true],
    ]);
    expect(e.state).toMatchObject({ place: 'kess_market', home: 'kess_market', hours: 30 });
    expect(e.state.skills.skill_smithing?.level).toBe(3);
    expect(e.state.lodging?.kind).toBe('room');
    expect(s.births.find((b) => b.upbringing === 'upbringing_kess_guild')?.names).not.toContain(
      'Gerd Hale',
    );
  });

  it('runs every life each hour; those out of focus keep their standing orders', () => {
    const e = rich();
    e.handle({ type: 'weave', node: 'tapestry_life_2' }, 0);
    e.handle({ type: 'bear', upbringing: 'upbringing_kess_guild', name: 'Gerd Hale' }, 0);
    const first = e.weave.lives[0]!.state;
    first.orders.work = 'away';
    e.run(24 * 5);
    expect(first.hours).toBe(e.state.hours);
    expect(Object.keys(first.done).length).toBeGreaterThan(0);
  });

  it('reports on a life when the player turns back to it', () => {
    const e = rich();
    e.handle({ type: 'weave', node: 'tapestry_life_2' }, 0);
    e.handle({ type: 'bear', upbringing: 'upbringing_kess_guild', name: 'Gerd Hale' }, 0);
    e.weave.lives[0]!.state.orders.work = 'away';
    e.run(48);
    e.handle({ type: 'focus', life: 0 }, 0);
    expect(e.snapshot().report?.hours).toBe(48);
    expect(e.weave.lives[1]?.since?.hours).toBe(e.state.hours);
    expect(() => e.handle({ type: 'focus', life: 5 }, 0)).toThrow('No such life');
  });

  it('keeps one clock for all lives: pausing stops them all', () => {
    const e = rich();
    e.handle({ type: 'weave', node: 'tapestry_life_2' }, 0);
    e.handle({ type: 'bear', upbringing: 'upbringing_kess_guild', name: 'Gerd Hale' }, 0);
    e.handle({ type: 'pause' }, 0);
    expect(e.snapshot().paused).toBe(true);
    e.handle({ type: 'focus', life: 0 }, 0);
    expect(e.snapshot().paused).toBe(true);
  });
});

describe('saves', () => {
  it('reads a single-life save as the first life of a weave', () => {
    const old = { ...newGame(1, 0), version: 19 } as Record<string, unknown>;
    delete old.legend;
    const w = migrateSave(old, world);
    expect(w.weave).toBe(WEAVE_VERSION);
    expect(w.lives[0]?.state).toMatchObject({ version: SAVE_VERSION, legend: 0 });
    expect(w.lives[0]?.name).toBe('Rike Holt');
  });

  it('migrates every life of a weave', () => {
    const e = rich();
    e.handle({ type: 'weave', node: 'tapestry_life_2' }, 0);
    e.handle({ type: 'bear', upbringing: 'upbringing_kess_guild', name: 'Gerd Hale' }, 0);
    const saved = JSON.parse(JSON.stringify(e.weave)) as Weave;
    const back = migrateSave(saved, world);
    expect(back.lives).toHaveLength(2);
    expect(new Engine(back).snapshot().lives[1]?.name).toBe('Gerd Hale');
  });
});

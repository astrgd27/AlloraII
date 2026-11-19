import { describe, expect, it } from 'vitest';
import { Engine } from './engine';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';
import { World } from './world';

describe('the codex', () => {
  it('knows only what a life has seen, met, used or kept', () => {
    const e = new Engine(newGame(1, 0));
    const k = e.snapshot().known;
    expect(k.places).toEqual(['ostwick']);
    expect(k.regions).toEqual(['eintenn']);
    expect(k.people).toEqual([]);
    expect(k.faiths).toContain('ilvara');
    expect(k.faiths).not.toContain('vass');
  });

  it('adds each place a life stands in, and is shared by every life', () => {
    const state = newGame(1, 0);
    state.legend = 100;
    const e = new Engine(state);
    e.handle({ type: 'weave', node: 'tapestry_life_2' }, 0);
    e.handle({ type: 'bear', upbringing: 'upbringing_kess_guild', name: 'Gerd Hale' }, 0);
    e.weave.lives[0]!.state.bonds.hanne = { points: 10, met: 0 } as never;
    e.tick();
    const k = e.snapshot().known;
    expect(k.places).toEqual(['kess_market', 'ostwick']);
    expect(k.people).toEqual(['hanne']);
    expect(k.skills).toContain('skill_smithing');
    expect(k.faiths).toContain('horro');
  });

  it('carries text for what it lists', () => {
    const w = World.shared();
    expect(w.places.get('ostwick')?.text).toMatch(/forty hearths/);
    expect(w.data.regions[0]?.text).toBeTruthy();
    expect(w.data.faiths?.find((f) => f.id === 'ilvara')?.text).toMatch(/bread-oven/);
  });

  it('migrates a version 20 save with the places it stood in', () => {
    const old = { ...newGame(1, 0), version: 20, place: 'aschau' } as Record<string, unknown>;
    delete old.seen;
    const save = migrate(old);
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.seen).toEqual(['aschau', 'ostwick']);
  });
});

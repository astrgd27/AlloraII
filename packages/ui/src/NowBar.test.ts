import { Engine, newGame } from '@allora/engine';
import { describe, expect, it } from 'vitest';
import { layoutMap } from './map/layout';
import { nowOf } from './NowBar';

describe('what the life is doing', () => {
  it('always has an answer: at leisure, working, travelling, asleep', () => {
    const e = new Engine(newGame(4, 0));
    expect(nowOf(e.snapshot())).toMatchObject({ verb: 'At leisure', what: 'in Ostwick' });

    e.run(1);
    const first = e.snapshot().canDo[0] ?? '';
    e.handle({ type: 'do', activity: first }, 0);
    const working = nowOf(e.snapshot());
    expect(working.verb).toBe('Working');
    expect(working.progress).toBeGreaterThanOrEqual(0);
    expect(working.stop?.order).toEqual({ type: 'stop' });
    e.handle({ type: 'stop' }, 0);

    e.handle({ type: 'travel', to: 'tennfels' }, 0);
    e.run(1);
    const road = nowOf(e.snapshot());
    expect(road.verb).toBe('Travelling to');
    expect(road.what).toBe('Burg Tennfels');
    expect(road.stop?.order).toEqual({ type: 'turnBack' });

    const sleeper = new Engine(newGame(4, 0));
    sleeper.run(18);
    expect(nowOf(sleeper.snapshot()).verb).toBe('Asleep');
  });

  it('shows the progress of a case step', () => {
    const state = newGame(4, 0);
    state.place = 'kess_market';
    const e = new Engine(state);
    e.handle({ type: 'takePost', post: 'post_kesselhaven_guild_smith' }, 0);
    e.run(2);
    e.handle({ type: 'takeCase', case: e.snapshot().offers[0] ?? '' }, 0);
    expect(nowOf(e.snapshot()).verb).toBe('A case in hand');
    e.handle({ type: 'step', approach: e.snapshot().venture?.choices[0]?.id ?? '' }, 0);
    expect(nowOf(e.snapshot()).progress).toBeDefined();
  });
});

describe('a map that fills its frame', () => {
  it('makes the realm as large as the frame allows, and centres it', () => {
    const wide = layoutMap(900, ['a'], 500);
    expect(wide.height).toBe(500);
    expect(wide.regions.a!.size).toBeLessThanOrEqual(500);
    expect(wide.regions.a!.size).toBeGreaterThan(400);
    expect(wide.regions.a!.x).toBeCloseTo((900 - wide.regions.a!.size) / 2);
    const tall = layoutMap(380, ['a'], 700);
    expect(tall.regions.a!.size).toBe(380);
    expect(tall.regions.a!.y + tall.regions.a!.size).toBeLessThanOrEqual(700);
  });
});

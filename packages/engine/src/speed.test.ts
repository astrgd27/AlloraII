import { describe, expect, it } from 'vitest';
import { Engine, MS_PER_GAME_HOUR, SPEEDS } from './engine';
import { newGame } from './state';

describe('the pace of the clock', () => {
  it('runs faster while the game is open, keeping the part-hour already run', () => {
    const e = new Engine(newGame(2, 0));
    e.advanceTo(MS_PER_GAME_HOUR / 2);
    expect(e.state.hours).toBe(0);
    e.handle({ type: 'speed', speed: 10 }, MS_PER_GAME_HOUR / 2);
    expect(e.snapshot().speed).toBe(10);
    expect(e.snapshot().hourProgress).toBeCloseTo(0.5);
    // Six real seconds at ten times the pace is one game hour.
    e.advanceTo(MS_PER_GAME_HOUR / 2 + MS_PER_GAME_HOUR / 20);
    expect(e.state.hours).toBe(1);
    e.advanceTo(MS_PER_GAME_HOUR / 2 + MS_PER_GAME_HOUR / 20 + MS_PER_GAME_HOUR);
    expect(e.state.hours).toBe(11);
  });

  it('refuses a pace it does not have', () => {
    const e = new Engine(newGame(2, 0));
    expect(() => e.handle({ type: 'speed', speed: 1000 }, 0)).toThrow('No such pace');
    expect(SPEEDS).toContain(e.speed);
  });

  it('catches up on time away at the usual pace, whatever the pace was', () => {
    const e = new Engine(newGame(2, 0));
    e.handle({ type: 'speed', speed: 60 }, 0);
    e.catchUpTo(5 * MS_PER_GAME_HOUR);
    expect(e.state.hours).toBe(5);
  });

  it('stands still while paused', () => {
    const e = new Engine(newGame(2, 0));
    e.handle({ type: 'pause' }, 0);
    e.advanceTo(10 * MS_PER_GAME_HOUR);
    expect(e.state.hours).toBe(0);
    expect(e.snapshot().paused).toBe(true);
  });
});

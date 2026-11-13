/** The whole game state. The engine owns it; the UI only ever sees snapshots. */
import { createRng, type RngState } from './rng';

/** The save format version. Raise it with every change to GameState, and add a migration. */
export const SAVE_VERSION = 1;

export interface GameState {
  version: typeof SAVE_VERSION;
  /** Seeds every random stream. */
  seed: number;
  /** Whole game hours since the start of play. */
  hours: number;
  /** Real milliseconds gathered towards the next game hour. */
  carryMs: number;
  /** When the clock was last advanced, in real milliseconds since the epoch. */
  lastRealMs: number;
  paused: boolean;
  rng: RngState;
}

export function newGame(seed: number, nowMs: number): GameState {
  return {
    version: SAVE_VERSION,
    seed: seed >>> 0,
    hours: 0,
    carryMs: 0,
    lastRealMs: nowMs,
    paused: false,
    rng: createRng(),
  };
}

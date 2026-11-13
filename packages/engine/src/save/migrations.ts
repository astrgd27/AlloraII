/**
 * Save migrations. Every save carries a version. An old save is upgraded one
 * step at a time until it reaches SAVE_VERSION. There is a test for every step.
 *
 * To change the save format: raise SAVE_VERSION in state.ts, add a migration
 * here from the old version, and add a test with a save of the old version.
 */
import { createRng } from '../rng';
import { SAVE_VERSION, type GameState } from '../state';

type AnySave = Record<string, unknown>;

/**
 * Version 0: the first save format, from before saves carried a version.
 * It held only the seed, the hours played and when it was written.
 */
export interface SaveV0 {
  seed: number;
  hours: number;
  savedAt: number;
}

/** Each entry upgrades a save from its version to the next one. */
export const MIGRATIONS: Record<number, (save: AnySave) => AnySave> = {
  0: (save) => {
    const old = save as unknown as SaveV0;
    return {
      version: 1,
      seed: old.seed >>> 0,
      hours: old.hours,
      carryMs: 0,
      lastRealMs: old.savedAt,
      paused: false,
      rng: createRng(),
    };
  },
};

export function versionOf(save: unknown): number {
  if (typeof save !== 'object' || save === null) throw new Error('A save must be an object');
  const v = (save as AnySave).version;
  if (v === undefined) return 0;
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
    throw new Error(`Unreadable save version: ${String(v)}`);
  }
  return v;
}

/** Upgrades any past save to the current format. */
export function migrate(save: unknown): GameState {
  let version = versionOf(save);
  if (version > SAVE_VERSION) {
    throw new Error(
      `This save is from a newer game (version ${version}; this game reads ${SAVE_VERSION})`,
    );
  }
  let current = save as AnySave;
  while (version < SAVE_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) throw new Error(`No migration from save version ${version}`);
    current = step(current);
    version = versionOf(current);
  }
  return current as unknown as GameState;
}

/**
 * Save migrations. Every save carries a version. An old save is upgraded one
 * step at a time until it reaches SAVE_VERSION. There is a test for every step.
 *
 * To change the save format: raise SAVE_VERSION in state.ts, add a migration
 * here from the old version, and add a test with a save of the old version.
 */
import { DEFAULT_ORDERS, FULL_NEEDS } from '../needs';
import { createRng } from '../rng';
import { SAVE_VERSION, type GameState } from '../state';
import { START_PLACE } from '../world';

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
  // Version 2 adds the life's place and its journey (the map stub).
  1: (save) => ({ ...save, version: 2, place: START_PLACE, journey: null }),
  // Version 3 adds needs, a home and standing orders. The home is where the life stands.
  2: (save) => ({
    ...save,
    version: 3,
    home: typeof save.place === 'string' ? save.place : START_PLACE,
    needs: { ...FULL_NEEDS },
    orders: { ...DEFAULT_ORDERS },
    asleep: false,
    hoursSinceMeal: 0,
    meals: 0,
    hoursSlept: 0,
  }),
  // Version 4 adds the activity in hand and the count of activities finished.
  3: (save) => ({ ...save, version: 4, doing: null, done: {} }),
  // Version 5 adds the people a life has met.
  4: (save) => ({ ...save, version: 5, bonds: {}, words: null }),
  // Version 6 adds skills.
  5: (save) => ({ ...save, version: 6, skills: {} }),
  // Version 7 adds checks and resolve.
  6: (save) => ({ ...save, version: 7, lastCheck: null, checks: {}, resolve: 3 }),
  // Version 8 adds what happens on the road.
  7: (save) => ({ ...save, version: 8, roadEvent: null, roadEvents: 0 }),
  // Version 9 adds careers: a post, a case in hand and finished works.
  8: (save) => ({ ...save, version: 9, post: null, venture: null, works: [] }),
  // Version 10 adds money, goods carried and the state of the markets.
  9: (save) => ({
    ...save,
    version: 10,
    money: 20,
    earned: 0,
    spent: 0,
    goods: {},
    markets: {},
    poorMeals: 0,
  }),
  // Version 11 adds the orders to work alone and to turn back hurt, and the report.
  10: (save) => ({
    ...save,
    version: 11,
    orders: { ...DEFAULT_ORDERS, ...(save.orders as object) },
    report: null,
    turnedBack: false,
  }),
  // Version 12 adds the record of what just happened.
  11: (save) => ({ ...save, version: 12, log: [] }),
  // Version 13 adds rent: the old free bed becomes a rented room, and an inn order.
  12: (save) => ({
    ...save,
    version: 13,
    lodging: { kind: 'room', rent: 0.6, owed: 0 },
    innNight: -1,
    orders: { ...(save.orders as object), inn: true },
  }),
  // Version 14 adds the wear on tools and the pieces a life keeps.
  13: (save) => ({ ...save, version: 14, wear: {}, keepsakes: [] }),
  // Version 15 adds the way of living.
  14: (save) => ({
    ...save,
    version: 15,
    orders: { ...(save.orders as object), living: 'comfortable' },
  }),
  // Version 16 adds the case board, time on a case, and a household's harmony.
  15: (save) => ({
    ...save,
    version: 16,
    venture: save.venture
      ? { ...(save.venture as object), started: save.hours ?? 0, clues: [], lost: 0 }
      : null,
    post:
      save.post && (save.post as { id?: string }).id === 'post_tennfels_steward'
        ? { ...(save.post as object), harmony: 60 }
        : (save.post ?? null),
  }),
  // Version 17 adds friendship: points, gifts and what is told at each tier.
  // Version 18 adds a faith kept.
  17: (save) => ({ ...save, version: 18, faith: null }),
  16: (save) => ({
    ...save,
    version: 17,
    bonds: Object.fromEntries(
      Object.entries((save.bonds ?? {}) as Record<string, Record<string, unknown>>).map(
        ([id, b]) => [
          id,
          {
            ...b,
            points: 20 + 6 * Math.min(20, Number(b.talks ?? 0)),
            lastGift: -1,
            toTell: 0,
            told: 0,
          },
        ],
      ),
    ),
  }),
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

/**
 * Content tools: the canon extractors, schemas, lints and the balance bot
 * will live here (Phase 0, issues 2 to 5 and 9).
 */

/** The three origins every content entry may carry. */
export const ORIGINS = ['allora1', 'polygoetia', 'allora2'] as const;
export type Origin = (typeof ORIGINS)[number];

/** Stable ids are lowercase with underscores, prefixed by kind (design bible, Rules for data). */
export function isStableId(id: string): boolean {
  return /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(id);
}

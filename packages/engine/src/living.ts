/**
 * How a life lives, and what it owes (design bible, Where money goes). Plain
 * living saves; comfortable and rich living spend a share of what is put by,
 * and lift the spirits. Dues to a guild fall due each season.
 */
import { note } from './log';
import { round2, spend } from './money';
import type { GameState } from './state';
import type { World } from './world';

export type Living = 'plain' | 'comfortable' | 'rich';

/**
 * What each way of living spends a day, as a share of the purse above a reserve,
 * and what it does for the spirits. Good bread, wine, a fire kept in, new cloth.
 */
export const LIVING: Record<Living, { share: number; spirits: number }> = {
  plain: { share: 0, spirits: 0 },
  comfortable: { share: 0.007, spirits: 1 },
  rich: { share: 0.015, spirits: 3 },
};
/** Money kept back from living: no life spends its last coins on comfort. */
export const RESERVE = 50;

/** What living costs today. */
export function livingCost(state: GameState): number {
  return round2(LIVING[state.orders.living].share * Math.max(0, state.money - RESERVE));
}

/** Each day: the cost of living, and its comfort. */
export function liveDay(state: GameState): void {
  const cost = livingCost(state);
  if (cost <= 0) return;
  if (!spend(state, cost)) return;
  const lift = LIVING[state.orders.living].spirits;
  state.needs.spirits = Math.min(100, state.needs.spirits + lift);
}

/** Each season: dues to the guild of the post held, if it has one. A life that cannot pay loses standing. */
export function payDues(state: GameState, world: World): void {
  const held = state.post;
  const dues = held && world.posts.get(held.id)?.dues?.[held.rank];
  if (!held || !dues) return;
  if (spend(state, dues)) note(state, { kind: 'dues', post: held.id, price: dues });
  else held.standing = Math.max(0, held.standing - 10);
}

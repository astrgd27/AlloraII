/**
 * Money. One currency, the pf, as in Allora I. It belongs to a life: it comes
 * in through work and trade, and goes out through living.
 */
import type { GameState } from './state';

/** What a new life has in its purse. */
export const START_MONEY = 20;
/** A plain meal bought where the life is: less than a loaf at a stall (Allora I: bread, 1.5 pf). */
export const MEAL_COST = 0.5;

/** Money is counted to the hundredth of a pf. */
export const round2 = (n: number): number => Math.round(n * 100) / 100;

export function earn(state: GameState, amount: number): void {
  if (amount <= 0) return;
  state.money = round2(state.money + amount);
  state.earned = round2(state.earned + amount);
}

/** Pays, if the purse holds enough. Returns whether it did. */
export function spend(state: GameState, amount: number): boolean {
  if (state.money < amount) return false;
  state.money = round2(state.money - amount);
  state.spent = round2(state.spent + amount);
  return true;
}

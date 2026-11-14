/**
 * The message protocol between the UI and the engine worker.
 * The UI sends orders; the engine sends state. Nothing else crosses.
 */
import type { Snapshot } from './engine';
import type { StandingOrders } from './needs';

/** UI → engine. */
export type Order =
  | { type: 'pause' }
  | { type: 'resume' }
  /** Set out for a place, by the quickest way. */
  | { type: 'travel'; to: string }
  /** Turn back to the place last left. */
  | { type: 'turnBack' }
  /** Begin an activity here and now. */
  | { type: 'do'; activity: string }
  /** Set down the activity in hand. */
  | { type: 'stop' }
  /** Meet someone here for the first time. */
  | { type: 'meet'; person: string }
  /** Talk with someone here whom the life has met. */
  | { type: 'talk'; person: string }
  /** Change standing orders. */
  | { type: 'setOrders'; orders: Partial<StandingOrders> }
  /** Write a save now. */
  | { type: 'save' }
  /** Delete all saves and start a new game. */
  | { type: 'reset' };

/** Sent once, before any order, to start the engine. */
export interface InitMessage {
  type: 'init';
  /** Overrides the clock rate (tests and debugging only). */
  msPerGameHour?: number;
  /** Seed for a new game, if no save exists. */
  seed?: number;
}

export type ToEngine = InitMessage | Order;

/** Engine → UI. */
export type FromEngine =
  | { type: 'state'; snapshot: Snapshot }
  | { type: 'saved'; hours: number }
  | { type: 'error'; message: string };

/**
 * The message protocol between the UI and the engine worker.
 * The UI sends orders; the engine sends state. Nothing else crosses.
 */
import type { Snapshot } from './engine';
import type { HomeKind } from './housing';
import type { StandingOrders } from './needs';

/** UI → engine. */
export type Order =
  | { type: 'pause' }
  | { type: 'resume' }
  /** Run the clock faster or slower while the game is open. */
  | { type: 'speed'; speed: number }
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
  /** Take up a post, at its place. */
  | { type: 'takePost'; post: string }
  /** Take a case that is on offer. */
  | { type: 'takeCase'; case: string }
  /** Work the step in hand by one of its approaches. */
  | { type: 'step'; approach: string }
  /** Give up the case in hand. */
  | { type: 'withdraw' }
  /** Buy or sell one of a thing at the market here. */
  | { type: 'buy'; item: string }
  | { type: 'sell'; item: string }
  /** Give a thing from the pack to someone here. */
  | { type: 'give'; person: string; item: string }
  /** Rent a home here, giving up the old one; or give up the home. */
  | { type: 'rent'; home: HomeKind }
  | { type: 'leaveHome' }
  /** Put the report away, once read. */
  | { type: 'readReport' }
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

/**
 * The message protocol between the UI and the engine worker.
 * The UI sends orders; the engine sends state. Nothing else crosses.
 */
import type { Snapshot } from './engine';

/** UI → engine. */
export type Order =
  | { type: 'pause' }
  | { type: 'resume' }
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

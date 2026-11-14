/** The whole game state. The engine owns it; the UI only ever sees snapshots. */
import type { Doing } from './activities';
import type { Bond, Words } from './people';
import { DEFAULT_ORDERS, FULL_NEEDS, type Needs, type StandingOrders } from './needs';
import { createRng, type RngState } from './rng';
import { START_PLACE, type Leg } from './world';

/** A journey under way. */
export interface Journey {
  from: string;
  to: string;
  /** The legs still to travel; the first is the one being travelled. */
  legs: Leg[];
  /** Hours already spent on the first leg. */
  legHours: number;
}

/** The save format version. Raise it with every change to GameState, and add a migration. */
export const SAVE_VERSION = 5;

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
  /** Where the life is. While travelling, the place last left. */
  place: string;
  journey: Journey | null;
  /** Where the life has a bed. */
  home: string;
  needs: Needs;
  orders: StandingOrders;
  asleep: boolean;
  hoursSinceMeal: number;
  /** Running totals, for the report. */
  meals: number;
  hoursSlept: number;
  /** The activity in hand, if any. */
  doing: Doing | null;
  /** Activity id → times finished. */
  done: Record<string, number>;
  /** Person id → what the life knows of them. Only people it has met. */
  bonds: Record<string, Bond>;
  /** The last thing someone said. */
  words: Words | null;
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
    place: START_PLACE,
    journey: null,
    home: START_PLACE,
    needs: { ...FULL_NEEDS },
    orders: { ...DEFAULT_ORDERS },
    asleep: false,
    hoursSinceMeal: 0,
    meals: 0,
    hoursSlept: 0,
    doing: null,
    done: {},
    bonds: {},
    words: null,
  };
}

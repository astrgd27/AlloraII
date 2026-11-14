/**
 * Needs: vigour, health and spirits. They shape what a life does well, not
 * whether it can play. Sleep and meals run on standing orders, so a life left
 * alone looks after itself.
 *
 * The rates are first values, to be tuned by the balance bot (design bible,
 * Testing and balance).
 */
import type { System } from './engine';
import type { GameState } from './state';

export interface Needs {
  /** Energy, restored by sleep and food. 0 to 100. */
  vigour: number;
  /** Hurt by injury, illness and exhaustion. 0 to 100. */
  health: number;
  /** Mood, lifted by company, faith and comfort. 0 to 100. */
  spirits: number;
}

/** Standing orders: the routine decisions a life settles for itself. */
export interface StandingOrders {
  /** Sleep from this hour of the day… */
  sleepFrom: number;
  /** …until this one. */
  wakeAt: number;
  /** On a road at night, stop and make camp instead of walking on. */
  campAtNight: boolean;
}

export const DEFAULT_ORDERS: StandingOrders = { sleepFrom: 22, wakeAt: 6, campAtNight: true };
export const FULL_NEEDS: Needs = { vigour: 100, health: 100, spirits: 70 };

/** The hours of the day at which a waking life eats. */
export const MEAL_HOURS = [7, 13, 19];

export const RATES = {
  /** Vigour lost per waking hour, at rest and on the road. */
  awake: 3,
  onTheRoad: 5,
  /** Vigour gained per hour asleep: in a bed at home, and anywhere else. */
  sleepAtHome: 10,
  sleepElsewhere: 6,
  /** A meal. */
  mealVigour: 6,
  mealSpirits: 2,
  /** After this many hours unfed, hunger bites. */
  hungryAfter: 14,
  hungerVigour: 2,
  hungerSpirits: 1,
  /** With no vigour left, health drains; asleep, it mends. */
  exhaustionHealth: 2,
  sleepHealth: 1,
  /** A night at home lifts the spirits; a night elsewhere does not. */
  homeSpirits: 1,
  /** Spirits drift down towards this when nothing lifts them. */
  spiritsFloor: 40,
  spiritsDrift: 0.25,
};

const clamp = (n: number): number => Math.max(0, Math.min(100, n));

export function isSleepHour(hour: number, orders: StandingOrders): boolean {
  return orders.sleepFrom > orders.wakeAt
    ? hour >= orders.sleepFrom || hour < orders.wakeAt
    : hour >= orders.sleepFrom && hour < orders.wakeAt;
}

/** True when the life is on a road (not at sea) and so cannot simply go to bed. */
const onLandLeg = (state: GameState): boolean =>
  state.journey !== null && state.journey.legs[0]?.sea !== true;

/** Decides whether the life sleeps this hour. Runs before travel, which camps while it sleeps. */
export function shouldSleep(state: GameState, hour: number): boolean {
  if (state.needs.vigour <= 0) return true;
  // Once asleep from exhaustion, sleep on until rested enough to carry on.
  if (state.asleep && !isSleepHour(hour, state.orders) && state.needs.vigour < 30) return true;
  if (!isSleepHour(hour, state.orders)) return false;
  return !onLandLeg(state) || state.orders.campAtNight;
}

export const needsSystem: System = {
  name: 'needs',
  tick(state, date) {
    const n = state.needs;
    state.asleep = shouldSleep(state, date.hour);
    state.hoursSinceMeal += 1;

    if (state.asleep) {
      const atHome = state.journey === null && state.place === state.home;
      n.vigour = clamp(n.vigour + (atHome ? RATES.sleepAtHome : RATES.sleepElsewhere));
      n.health = clamp(n.health + RATES.sleepHealth);
      if (atHome) n.spirits = clamp(n.spirits + RATES.homeSpirits);
      state.hoursSlept += 1;
    } else {
      n.vigour = clamp(n.vigour - (state.journey ? RATES.onTheRoad : RATES.awake));
      if (MEAL_HOURS.includes(date.hour)) {
        n.vigour = clamp(n.vigour + RATES.mealVigour);
        n.spirits = clamp(n.spirits + RATES.mealSpirits);
        state.hoursSinceMeal = 0;
        state.meals += 1;
      }
      if (n.spirits > RATES.spiritsFloor) n.spirits = clamp(n.spirits - RATES.spiritsDrift);
    }

    if (state.hoursSinceMeal > RATES.hungryAfter) {
      n.vigour = clamp(n.vigour - RATES.hungerVigour);
      n.spirits = clamp(n.spirits - RATES.hungerSpirits);
    }
    if (n.vigour <= 0) n.health = clamp(n.health - RATES.exhaustionHealth);
  },
};

/**
 * Needs: vigour, health and spirits. They shape what a life does well, not
 * whether it can play. Sleep and meals run on standing orders, so a life left
 * alone looks after itself.
 *
 * The rates are first values, to be tuned by the balance bot (design bible,
 * Testing and balance).
 */
import type { System } from './engine';
import { HOMES, INN, atHome, takeInnBed } from './housing';
import { MEAL_COST, spend } from './money';
import type { GameState } from './state';
import type { World } from './world';

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
  /** Keep at safe, paid work unasked: never, only while the player is away, or always. */
  work: 'never' | 'away' | 'always';
  /** On the road, turn back when badly hurt. */
  turnBackIfHurt: boolean;
  /** Away from home, take an inn bed for the night where there is one. */
  inn: boolean;
}

export const DEFAULT_ORDERS: StandingOrders = {
  sleepFrom: 22,
  wakeAt: 6,
  campAtNight: true,
  work: 'away',
  turnBackIfHurt: true,
  inn: true,
};
export const FULL_NEEDS: Needs = { vigour: 100, health: 100, spirits: 70 };

/** The hours of the day at which a waking life eats. */
export const MEAL_HOURS = [7, 13, 19];

export const RATES = {
  /** Vigour lost per waking hour, at rest and on the road. */
  awake: 3,
  onTheRoad: 5,
  /** Vigour gained per hour asleep away from any bed (a home or an inn gives more: see housing). */
  sleepElsewhere: 6,
  /** A meal. */
  mealVigour: 6,
  mealSpirits: 2,
  /** A meal of scraps, begged or foraged, for want of money or bread. */
  poorMealVigour: 4,
  /** After this many hours unfed, hunger bites. */
  hungryAfter: 14,
  hungerVigour: 2,
  hungerSpirits: 1,
  /** With no vigour left, health drains; asleep, it mends. */
  exhaustionHealth: 2,
  sleepHealth: 1,
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

/**
 * Finds the meal. Where people live, a plain one is bought. On the road or in
 * the wild it comes from the pack. Failing both, it is scraps.
 */
export function eat(state: GameState, world: World): boolean {
  // A city street is as good as a place: there is always a cookshop.
  const settled = state.journey
    ? state.journey.legs[0]?.way === 'street'
    : world.places.get(state.place)?.kind !== 'wild';
  if (settled && spend(state, MEAL_COST)) return true;
  const food = Object.keys(state.goods).find((id) => world.items.get(id)?.food);
  if (!food) return false;
  const held = state.goods[food] ?? 0;
  if (held <= 1) delete state.goods[food];
  else state.goods[food] = held - 1;
  return true;
}

export const needsSystem: System = {
  name: 'needs',
  tick(state, date, _bus, world) {
    const n = state.needs;
    state.asleep = shouldSleep(state, date.hour);
    state.hoursSinceMeal += 1;

    if (state.asleep) {
      const home = atHome(state) && state.lodging ? HOMES[state.lodging.kind] : undefined;
      const inn = !home && takeInnBed(state, world, date);
      n.vigour = clamp(n.vigour + (home ? home.sleep : inn ? INN.sleep : RATES.sleepElsewhere));
      n.health = clamp(n.health + RATES.sleepHealth);
      if (home) n.spirits = clamp(n.spirits + home.spirits);
      state.hoursSlept += 1;
    } else {
      n.vigour = clamp(n.vigour - (state.journey ? RATES.onTheRoad : RATES.awake));
      if (MEAL_HOURS.includes(date.hour)) {
        if (eat(state, world)) {
          n.vigour = clamp(n.vigour + RATES.mealVigour);
          n.spirits = clamp(n.spirits + RATES.mealSpirits);
        } else {
          n.vigour = clamp(n.vigour + RATES.poorMealVigour);
          state.poorMeals += 1;
        }
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

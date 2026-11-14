/** Travel: setting out, walking a route one hour at a time, arriving, turning back. */
import type { System } from './engine';
import type { GameState } from './state';
import { nextRandom } from './rng';
import { WORLD, type RoadEvent, type World } from './world';

/** The chance, each waking hour on the way, that something happens. */
export const ROAD_EVENT_CHANCE = 1 / 12;

const clamp = (n: number): number => Math.max(0, Math.min(100, n));

/** The events that can happen on a kind of way. */
export function eventsFor(way: string | undefined, events: RoadEvent[]): RoadEvent[] {
  return events.filter(
    (e) => way !== undefined && e.ways.includes(way as RoadEvent['ways'][number]),
  );
}

/** Starts a journey by the quickest way. Throws if it cannot be made. */
export function setOut(state: GameState, world: World, to: string): void {
  if (state.journey) throw new Error('Already travelling');
  if (to === state.place) throw new Error('Already there');
  const route = world.route(state.place, to);
  if (!route) throw new Error(`There is no way to ${to}`);
  state.journey = { from: state.place, to, legs: route.legs, legHours: 0 };
  state.roadEvent = null;
}

/** Turns back along the leg being travelled, to the place last left. */
export function turnBack(state: GameState): void {
  const journey = state.journey;
  const leg = journey?.legs[0];
  if (!journey || !leg) throw new Error('Not travelling');
  if (journey.legHours === 0) {
    state.journey = null;
    return;
  }
  // The same road, walked the other way: the hours already spent are the hours back.
  const back = { road: leg.road, to: state.place, hours: leg.hours };
  state.place = leg.to;
  state.journey = {
    from: journey.to,
    to: back.to,
    legs: [back],
    legHours: leg.hours - journey.legHours,
  };
}

/** Each hour on the road is an hour of the current leg. */
export const travelSystem: System = {
  name: 'travel',
  tick(state, _date, bus) {
    const journey = state.journey;
    const leg = journey?.legs[0];
    if (!journey || !leg) return;
    // Asleep on a road, the life is in camp and gets no further. At sea, the ship sails on.
    if (state.asleep && leg.sea !== true) return;
    journey.legHours += 1;
    if (!state.asleep && nextRandom(state.rng, state.seed, 'road') < ROAD_EVENT_CHANCE) {
      const options = eventsFor(leg.way, WORLD.roadEvents ?? []);
      const event = options[Math.floor(nextRandom(state.rng, state.seed, 'road') * options.length)];
      if (event) {
        for (const key of ['vigour', 'health', 'spirits'] as const) {
          state.needs[key] = clamp(state.needs[key] + (event.effects[key] ?? 0));
        }
        state.roadEvent = { id: event.id, hours: state.hours };
        state.roadEvents += 1;
        bus.emit('RoadEvent', { hours: state.hours, event: event.id, road: leg.road });
      }
    }
    if (journey.legHours < leg.hours) return;
    const from = state.place;
    state.place = leg.to;
    journey.legs.shift();
    journey.legHours = 0;
    if (journey.legs.length === 0) {
      state.journey = null;
      bus.emit('Arrived', { hours: state.hours, place: state.place, from });
    }
  },
};

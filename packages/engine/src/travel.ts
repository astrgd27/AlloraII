/** Travel: setting out, walking a route one hour at a time, arriving, turning back. */
import type { System } from './engine';
import type { GameState } from './state';
import type { World } from './world';

/** Starts a journey by the quickest way. Throws if it cannot be made. */
export function setOut(state: GameState, world: World, to: string): void {
  if (state.journey) throw new Error('Already travelling');
  if (to === state.place) throw new Error('Already there');
  const route = world.route(state.place, to);
  if (!route) throw new Error(`There is no way to ${to}`);
  state.journey = { from: state.place, to, legs: route.legs, legHours: 0 };
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
    journey.legHours += 1;
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

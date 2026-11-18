/**
 * Homes and lodging (design bible, Homes and premises). A life rents before it
 * owns: a room, then a cottage. Rent falls due each dawn; a life that cannot
 * pay runs into arrears, and after a week of them loses the bed. Away from
 * home, an inn bed can be had for the night.
 */
import type { GameDate } from './calendar';
import { round2, spend } from './money';
import type { GameState } from './state';
import type { Place, World } from './world';

export type HomeKind = 'room' | 'cottage';

/** What each kind of home gives: rest and spirits a night, and rent a day by the kind of place. */
export const HOMES: Record<
  HomeKind,
  { name: string; sleep: number; spirits: number; rent: Record<'city' | 'settled', number> }
> = {
  // A loaf and a half a day for a room in a village (Allora I: bread 1.5 pf).
  room: { name: 'A rented room', sleep: 10, spirits: 1, rent: { settled: 0.6, city: 1.2 } },
  cottage: { name: 'A rented cottage', sleep: 12, spirits: 2, rent: { settled: 2, city: 4.5 } },
};

/** An inn bed for a night, by the kind of place, and what it gives. */
export const INN = { price: { settled: 0.8, city: 1.6 }, sleep: 9 };
/** Rent owed for this many days loses the home. */
export const EVICT_AFTER_DAYS = 7;

export interface Lodging {
  kind: HomeKind;
  /** Rent a day, fixed when taken. */
  rent: number;
  /** Rent owed and not yet paid. */
  owed: number;
}

const settledKind = (place: Place | undefined): 'city' | 'settled' | undefined =>
  place?.kind === 'city' ? 'city' : place?.kind === 'settled' ? 'settled' : undefined;

/** Rent a day for a kind of home at a place, or undefined where there are no homes to let. */
export function rentAt(world: World, placeId: string, kind: HomeKind): number | undefined {
  const k = settledKind(world.places.get(placeId));
  return k ? HOMES[kind].rent[k] : undefined;
}

/** An inn bed's price at a place, or undefined in the wild. */
export function innAt(world: World, placeId: string): number | undefined {
  const k = settledKind(world.places.get(placeId));
  return k ? INN.price[k] : undefined;
}

/** True when the life sleeps tonight in its own bed. */
export const atHome = (state: GameState): boolean =>
  state.lodging !== null && state.journey === null && state.place === state.home;

/** Takes a home here, giving up the old one. Arrears must be paid first. */
export function rent(state: GameState, world: World, kind: HomeKind): void {
  if (state.journey) throw new Error('On the road');
  const price = rentAt(world, state.place, kind);
  if (price === undefined) throw new Error('No homes to let here');
  if (state.lodging?.owed) throw new Error('Rent is owed on the old home');
  if (state.lodging && state.home === state.place && state.lodging.kind === kind)
    throw new Error('Already lodged here');
  // The first day is paid on taking it.
  if (!spend(state, price)) throw new Error('Not enough money');
  state.home = state.place;
  state.lodging = { kind, rent: price, owed: 0 };
}

/** Gives up the home, paying what is owed if the purse allows. */
export function leaveHome(state: GameState): void {
  if (!state.lodging) throw new Error('No home to leave');
  if (state.lodging.owed > 0 && !spend(state, state.lodging.owed)) throw new Error('Rent is owed');
  state.lodging = null;
}

/** At each dawn, the rent falls due. Returns true if the home was lost. */
export function payRent(state: GameState): boolean {
  const l = state.lodging;
  if (!l) return false;
  const due = round2(l.owed + l.rent);
  if (spend(state, due)) {
    l.owed = 0;
    return false;
  }
  l.owed = due;
  if (l.owed >= l.rent * EVICT_AFTER_DAYS) {
    state.lodging = null;
    return true;
  }
  return false;
}

/** The night's bed away from home: an inn, if ordered and affordable. Pays once a night. */
export function takeInnBed(state: GameState, world: World, date: GameDate): boolean {
  const night = date.hour < 12 ? state.hours - date.hour - 1 : state.hours - date.hour + 23;
  if (state.innNight === night) return true;
  if (!state.orders.inn || state.journey || atHome(state)) return false;
  const price = innAt(world, state.place);
  if (price === undefined || !spend(state, price)) return false;
  state.innNight = night;
  return true;
}

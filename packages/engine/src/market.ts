/**
 * Markets. Price = value × demand, and demand runs from 0.6 to 1.6 (design
 * bible, Markets and prices). What a place makes is plentiful there; what it
 * does not sell is scarce. Buying and selling move the price, and it drifts
 * back day by day. Simulated by place and goods, never person by person.
 */
import type { GameDate } from './calendar';
import { earn, round2, spend } from './money';
import type { GameState } from './state';
import type { Market, World } from './world';

export const DEMAND = { min: 0.6, max: 1.6, plenty: 0.7, usual: 1, scarce: 1.4 };
/** The share of the price a seller gets, and what a market day does to both sides. */
export const CUT = 0.85;
export const MARKET_DAY = { cut: 0.92, price: 0.95 };
/** The share of a glut or a shortage still left after a day. */
export const RECOVERY = 0.85;
/** How many things a life can carry. */
export const PACK = 20;

/** One good at one market: units above (a glut) or below (a shortage) its usual stock. */
export interface Stall {
  level: number;
  /** The game day the level was last counted. */
  day: number;
}

const dayOf = (state: GameState): number => Math.floor(state.hours / 24);

/** How many units move the price across its whole range: cheap goods are traded in bulk. */
export const depthOf = (value: number): number =>
  Math.max(4, Math.min(60, Math.round(60 / Math.max(value, 0.1))));

function levelNow(state: GameState, place: string, item: string): number {
  const stall = state.markets[place]?.[item];
  if (!stall) return 0;
  const level = stall.level * RECOVERY ** Math.max(0, dayOf(state) - stall.day);
  return Math.abs(level) < 0.05 ? 0 : level;
}

function move(state: GameState, place: string, item: string, by: number): void {
  const level = levelNow(state, place, item) + by;
  (state.markets[place] ??= {})[item] = { level, day: dayOf(state) };
}

/** Demand for a good at a market, with `extra` more units on the stalls. */
export function demandOf(
  state: GameState,
  world: World,
  market: Market,
  item: string,
  extra = 0,
): number {
  const rest = market.makes.includes(item)
    ? DEMAND.plenty
    : market.sells.includes(item)
      ? DEMAND.usual
      : DEMAND.scarce;
  const value = world.items.get(item)?.value ?? 1;
  const level = levelNow(state, market.place, item) + extra;
  return Math.max(DEMAND.min, Math.min(DEMAND.max, rest - (0.6 * level) / depthOf(value)));
}

export const isOpen = (market: Market, date: GameDate): boolean =>
  date.hour >= market.from && date.hour < market.to;
export const isMarketDay = (market: Market, date: GameDate): boolean => date.weekday === market.day;

/** The market the life is standing in, if there is one. */
export function marketHere(state: GameState, world: World): Market | undefined {
  return state.journey ? undefined : world.markets.get(state.place);
}

/** What one more unit costs here now, or undefined if it is not sold here or has run out. */
export function buyPrice(
  state: GameState,
  world: World,
  market: Market,
  item: string,
  date: GameDate,
): number | undefined {
  const value = world.items.get(item)?.value;
  if (value === undefined || !market.sells.includes(item)) return undefined;
  const demand = demandOf(state, world, market, item);
  if (demand >= DEMAND.max) return undefined;
  return round2(value * demand * (isMarketDay(market, date) ? MARKET_DAY.price : 1));
}

/** What the market pays for one unit now: the price once that unit is on the stalls, less the cut. */
export function sellPrice(
  state: GameState,
  world: World,
  market: Market,
  item: string,
  date: GameDate,
): number | undefined {
  const value = world.items.get(item)?.value;
  if (value === undefined) return undefined;
  const demand = demandOf(state, world, market, item, 1);
  return round2(value * demand * (isMarketDay(market, date) ? MARKET_DAY.cut : CUT));
}

export const carried = (state: GameState): number =>
  Object.values(state.goods).reduce((n, k) => n + k, 0);

function openMarket(state: GameState, world: World, date: GameDate): Market {
  const market = marketHere(state, world);
  if (!market) throw new Error('No market here');
  if (state.asleep) throw new Error('Asleep');
  if (!isOpen(market, date)) throw new Error('The market is shut');
  return market;
}

export function buy(state: GameState, world: World, item: string, date: GameDate): number {
  const market = openMarket(state, world, date);
  const price = buyPrice(state, world, market, item, date);
  if (price === undefined) throw new Error('Not for sale here');
  if (carried(state) >= PACK) throw new Error('The pack is full');
  if (!spend(state, price)) throw new Error('Not enough money');
  state.goods[item] = (state.goods[item] ?? 0) + 1;
  move(state, market.place, item, -1);
  return price;
}

export function sell(state: GameState, world: World, item: string, date: GameDate): number {
  const market = openMarket(state, world, date);
  const held = state.goods[item] ?? 0;
  const price = sellPrice(state, world, market, item, date);
  if (held <= 0 || price === undefined) throw new Error('Nothing to sell');
  if (held === 1) delete state.goods[item];
  else state.goods[item] = held - 1;
  earn(state, price);
  move(state, market.place, item, 1);
  return price;
}

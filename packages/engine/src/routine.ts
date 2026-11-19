/**
 * Standing orders and the report (design bible, Being away). While the player
 * is away a life settles routine matters itself: it keeps at safe, paid work
 * and turns back from the road if hurt. Cases and trials always wait. On
 * returning, the report says what happened.
 */
import { availableNow, begin } from './activities';
import type { GameDate } from './calendar';
import { offers } from './career';
import type { GameState } from './state';
import { turnBack } from './travel';
import type { World } from './world';

/** Below this vigour a life rests instead of taking up work. */
export const REST_BELOW = 25;
/** Below this health a life on the road turns back, if so ordered. */
export const HURT_BELOW = 35;

/** What happened while the player was away. */
export interface Report {
  /** Game hours covered. */
  hours: number;
  earned: number;
  spent: number;
  /** Pieces of routine work done. */
  tasks: number;
  /** Skill id → levels gained. */
  levels: Record<string, number>;
  poorMeals: number;
  /** True if the life turned back from the road, hurt. */
  turnedBack: boolean;
  /** What waits for the player: cases on offer, and whether one is a trial. */
  cases: number;
  trial: boolean;
}

/** Whether the life settles its own work this hour. */
export function worksAlone(state: GameState, away: boolean): boolean {
  return state.orders.work === 'always' || (state.orders.work === 'away' && away);
}

/** One hour of routine: runs before the systems. */
export function routine(state: GameState, world: World, date: GameDate, away: boolean): void {
  const journey = state.journey;
  if (journey) {
    if (state.orders.turnBackIfHurt && !journey.homeward && state.needs.health < HURT_BELOW) {
      turnBack(state);
      if (state.journey) state.journey.homeward = true;
      state.turnedBack = true;
    }
    return;
  }
  if (!worksAlone(state, away)) return;
  if (state.asleep || state.doing || state.venture || state.needs.vigour < REST_BELOW) return;
  // Duties of the post first, then whatever pays best by the hour. Never a case.
  const work = availableNow(world, state, date)
    .filter((a) => a.post || a.pay)
    .sort(
      (a, b) =>
        Number(Boolean(b.post)) - Number(Boolean(a.post)) ||
        (b.pay ?? 0) / b.hours - (a.pay ?? 0) / a.hours ||
        a.id.localeCompare(b.id),
    )[0];
  if (work) begin(state, world, work.id, date);
}

export interface Mark {
  hours: number;
  earned: number;
  spent: number;
  tasks: number;
  levels: Record<string, number>;
  poorMeals: number;
}

const tasksOf = (state: GameState): number => Object.values(state.done).reduce((n, k) => n + k, 0);

/** Notes where things stand, to compare against on returning. */
export function mark(state: GameState): Mark {
  return {
    hours: state.hours,
    earned: state.earned,
    spent: state.spent,
    tasks: tasksOf(state),
    levels: Object.fromEntries(Object.entries(state.skills).map(([id, k]) => [id, k.level])),
    poorMeals: state.poorMeals,
  };
}

/** Writes the report of the time since `before`, adding to one not yet read. */
export function writeReport(state: GameState, world: World, before: Mark): void {
  const hours = state.hours - before.hours;
  if (hours <= 0) return;
  const old = state.report;
  const levels: Record<string, number> = { ...(old?.levels ?? {}) };
  for (const [id, k] of Object.entries(state.skills)) {
    const gained = k.level - (before.levels[id] ?? 0);
    if (gained > 0) levels[id] = (levels[id] ?? 0) + gained;
  }
  const waiting = state.venture ? [] : offers(state, world);
  const round = (n: number): number => Math.round(n * 100) / 100;
  state.report = {
    hours: (old?.hours ?? 0) + hours,
    earned: round((old?.earned ?? 0) + state.earned - before.earned),
    spent: round((old?.spent ?? 0) + state.spent - before.spent),
    tasks: (old?.tasks ?? 0) + tasksOf(state) - before.tasks,
    levels,
    poorMeals: (old?.poorMeals ?? 0) + state.poorMeals - before.poorMeals,
    turnedBack: (old?.turnedBack ?? false) || state.turnedBack,
    cases: waiting.length,
    trial: waiting.some((c) => c.trialFor !== undefined),
  };
  state.turnedBack = false;
}

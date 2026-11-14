/** Activities: beginning one, working at it hour by hour, finishing, stopping. */
import type { GameDate } from './calendar';
import type { System } from './engine';
import { gain, newSkill, workXp } from './skills';
import type { GameState } from './state';
import type { Activity, World } from './world';

/** An activity under way. */
export interface Doing {
  id: string;
  hoursLeft: number;
  effects: Activity['effects'];
  /** The skill it trains, how long it takes and how hard it is. */
  skill?: string;
  hours?: number;
  level?: number;
}

const clamp = (n: number): number => Math.max(0, Math.min(100, n));

/** Why an activity cannot be begun now, or undefined if it can. */
export function whyNot(activity: Activity, state: GameState, date: GameDate): string | undefined {
  if (state.journey) return 'On the road';
  if (state.place !== activity.place) return 'Not here';
  if (state.asleep) return 'Asleep';
  if (state.doing) return 'Busy';
  if (activity.seasons && !activity.seasons.includes(date.seasonIndex)) return 'Out of season';
  if (date.hour < activity.from || date.hour >= activity.to) return 'Not at this hour';
  return undefined;
}

/** The activities that can be begun here and now. */
export function availableNow(world: World, state: GameState, date: GameDate): Activity[] {
  return [...world.activities.values()].filter((a) => whyNot(a, state, date) === undefined);
}

export function begin(state: GameState, world: World, id: string, date: GameDate): void {
  const activity = world.activities.get(id);
  if (!activity) throw new Error(`No such activity: ${id}`);
  const reason = whyNot(activity, state, date);
  if (reason) throw new Error(reason);
  state.doing = {
    id,
    hoursLeft: activity.hours,
    effects: activity.effects,
    hours: activity.hours,
    ...(activity.skill?.startsWith('skill_') ? { skill: activity.skill } : {}),
    ...(activity.level ? { level: activity.level } : {}),
  };
}

/** Each waking hour is an hour of the work in hand. Sleep sets it down until morning. */
export const activitySystem: System = {
  name: 'activities',
  tick(state, _date, bus) {
    const doing = state.doing;
    if (!doing || state.asleep) return;
    doing.hoursLeft -= 1;
    if (doing.hoursLeft > 0) return;
    for (const key of ['vigour', 'health', 'spirits'] as const) {
      state.needs[key] = clamp(state.needs[key] + (doing.effects[key] ?? 0));
    }
    if (doing.skill) {
      const skill = (state.skills[doing.skill] ??= newSkill());
      gain(skill, workXp(doing.hours ?? 1, doing.level ?? 1, skill.level));
    }
    state.done[doing.id] = (state.done[doing.id] ?? 0) + 1;
    state.doing = null;
    bus.emit('ActivityCompleted', { hours: state.hours, activity: doing.id, place: state.place });
  },
};

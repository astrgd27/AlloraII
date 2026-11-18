/** Activities: beginning one, working at it hour by hour, finishing, stopping. */
import type { GameDate } from './calendar';
import { edgeOf, lessonFactor, rollCheck, type CheckResult } from './challenge';
import type { System } from './engine';
import { POINTS, FRIEND_PAY, friendsAt, warm } from './bonds';
import { HARMONY } from './career';
import { peopleAt } from './people';
import { earn, round2 } from './money';
import { TOOL_PAY, toolFor, toolModifiers, wearTool } from './tools';
import { XP_PER_HOUR, edgeFactor, gain, newSkill, workXp } from './skills';
import type { GameState } from './state';
import { feastOn, type Activity, type World } from './world';

/** An activity under way. */
export interface Doing {
  id: string;
  /** The sub-place it is done in. */
  sub?: string;
  hoursLeft: number;
  effects: Activity['effects'];
  /** The skill it trains, how long it takes and how hard it is. */
  skill?: string;
  hours?: number;
  level?: number;
  dc?: number;
  standing?: number;
  /** What it pays when done. */
  pay?: number;
}

/** The last check a life made, for the page to show. */
export interface LastCheck extends CheckResult {
  activity: string;
}

/** What a triumph adds to the spirits, and a disaster takes. */
export const CHECK_SPIRITS = { triumph: 2, disaster: -3 };

const clamp = (n: number): number => Math.max(0, Math.min(100, n));

/** Why an activity cannot be begun now, or undefined if it can. */
export function whyNot(
  activity: Activity,
  state: GameState,
  date: GameDate,
  world?: World,
): string | undefined {
  if (state.journey) return 'On the road';
  if (state.place !== activity.place) return 'Not here';
  if (state.asleep) return 'Asleep';
  if (state.doing || state.venture?.working) return 'Busy';
  if (activity.post && state.post?.id !== activity.post) return 'Not your post';
  if (activity.seasons && !activity.seasons.includes(date.seasonIndex)) return 'Out of season';
  const feast = activity.feast ? world?.feasts.get(activity.feast) : undefined;
  if (activity.feast && (!feast || !feastOn(feast, date)))
    return `Only at ${feast?.name ?? 'a feast'}`;
  if (date.hour < activity.from || date.hour >= activity.to) return 'Not at this hour';
  return undefined;
}

/** The activities that can be begun here and now. */
export function availableNow(world: World, state: GameState, date: GameDate): Activity[] {
  return [...world.activities.values()].filter((a) => whyNot(a, state, date, world) === undefined);
}

export function begin(state: GameState, world: World, id: string, date: GameDate): void {
  const activity = world.activities.get(id);
  if (!activity) throw new Error(`No such activity: ${id}`);
  const reason = whyNot(activity, state, date, world);
  if (reason) throw new Error(reason);
  // A duty is paid by the hour at the rank held; other work pays what it says.
  const wage = activity.post
    ? (world.posts.get(activity.post)?.pay?.[state.post?.rank ?? 0] ?? 0)
    : 0;
  const base = activity.pay ?? round2(wage * activity.hours);
  const withTool = toolFor(state, world, activity.skill) ? base * TOOL_PAY : base;
  // Friends put work your way: their own haunt pays a quarter more.
  const pay = round2(
    friendsAt(state, world, activity.place, activity.sub).length > 0
      ? withTool * FRIEND_PAY
      : withTool,
  );
  state.doing = {
    id,
    ...(activity.sub ? { sub: activity.sub } : {}),
    hoursLeft: activity.hours,
    effects: activity.effects,
    hours: activity.hours,
    ...(activity.skill?.startsWith('skill_') ? { skill: activity.skill } : {}),
    ...(activity.level ? { level: activity.level } : {}),
    ...(activity.dc ? { dc: activity.dc } : {}),
    ...(activity.standing ? { standing: activity.standing } : {}),
    ...(pay > 0 ? { pay } : {}),
  };
}

/** Each waking hour is an hour of the work in hand. Sleep sets it down until morning. */
export const activitySystem: System = {
  name: 'activities',
  tick(state, _date, bus, world) {
    const doing = state.doing;
    if (!doing || state.asleep) return;
    doing.hoursLeft -= 1;
    if (doing.hoursLeft > 0) return;
    for (const key of ['vigour', 'health', 'spirits'] as const) {
      state.needs[key] = clamp(state.needs[key] + (doing.effects[key] ?? 0));
    }
    const skill = doing.skill ? (state.skills[doing.skill] ??= newSkill()) : undefined;
    if (doing.dc) {
      // The work ends in a check. Its edge sets what it teaches; failure teaches half.
      // A tool helps the roll; what the work teaches is set by the life's own skill.
      const spec = { dc: doing.dc, skillLevel: skill?.level ?? 0, allowsCost: false };
      const roll = { ...spec, modifiers: toolModifiers(state, world, doing.skill) };
      const result = rollCheck(roll, state.rng, state.seed, 'checks');
      state.lastCheck = { ...result, activity: doing.id };
      state.checks[result.degree] = (state.checks[result.degree] ?? 0) + 1;
      if (result.degree === 'triumph')
        state.needs.spirits = clamp(state.needs.spirits + CHECK_SPIRITS.triumph);
      if (result.degree === 'disaster')
        state.needs.spirits = clamp(state.needs.spirits + CHECK_SPIRITS.disaster);
      if (skill) {
        gain(
          skill,
          (doing.hours ?? 1) * XP_PER_HOUR * edgeFactor(edgeOf(spec)) * lessonFactor(result.degree),
        );
      }
    } else if (skill) {
      gain(skill, workXp(doing.hours ?? 1, doing.level ?? 1, skill.level));
    }
    wearTool(state, world, doing.skill, doing.hours ?? 1);
    if (doing.pay) earn(state, doing.pay);
    // Work done alongside people one knows draws them closer.
    for (const p of peopleAt(world, state.place, _date)) {
      if (state.bonds[p.id] && (!doing.sub || p.sub === doing.sub))
        warm(state, world, p.id, POINTS.alongside);
    }
    if (doing.standing && state.post) {
      state.post.standing += doing.standing;
      if (state.post.harmony !== undefined)
        state.post.harmony = Math.min(100, state.post.harmony + HARMONY.duty);
    }
    state.done[doing.id] = (state.done[doing.id] ?? 0) + 1;
    state.doing = null;
    bus.emit('ActivityCompleted', {
      hours: state.hours,
      activity: doing.id,
      place: state.place,
      ...(doing.pay ? { pay: doing.pay } : {}),
      ...(doing.dc && state.lastCheck ? { degree: state.lastCheck.degree } : {}),
    });
  },
};

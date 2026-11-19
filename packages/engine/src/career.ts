/**
 * Careers: holding a post, working a case step by step, and trials for rank
 * (design bible, Professions). A case is a venture: a chain of checks, each
 * with a safe way and sometimes a bold one.
 */
import type { GameDate } from './calendar';
import {
  chanceOfSuccess,
  edgeOf,
  lessonFactor,
  rollCheck,
  type Degree,
  type Modifier,
} from './challenge';
import { boonFactor, forgeFactor } from './faith';
import { boostModifiers } from './magic';
import { earn, round2 } from './money';
import { toolModifiers, wearTool } from './tools';
import { GATES, XP_PER_HOUR, capOf, edgeFactor, gain, newSkill, passGate } from './skills';
import type { GameState } from './state';
import type { Approach, Case, Post, World } from './world';

/** The post a life holds. */
export interface Held {
  id: string;
  /** 0 to 3. */
  rank: number;
  /** Standing with the employer, from duties and cases. */
  standing: number;
  /** For a household: how well it runs, 0 to 100. */
  harmony?: number;
}

/** A case under way. */
export interface Venture {
  case: string;
  /** Index of the step to do next. */
  step: number;
  quality: number;
  strain: number;
  /** The approach chosen for the step in hand, while it is being worked. */
  working: { approach: string; hoursLeft: number; hours: number } | null;
  /** When the case was taken, in game hours. */
  started: number;
  /** Each step done and how it went: the case board. */
  clues: { step: string; degree: Degree }[];
  /** Clues lost to time. */
  lost: number;
  /** The material used, if the trade uses one. */
  material?: string;
}

/** A finished piece of work. */
export interface Work {
  case: string;
  quality: number;
  /** Game hours at which it was finished. */
  hours: number;
  trial: boolean;
}

export const STRAIN_LIMIT = 3;
/** Standing needed before the trial for each rank is offered. */
export const TRIAL_STANDING = [0, 20, 60, 150];
/** The quality a trial piece must reach, for each rank. */
export const TRIAL_QUALITY = [0, 3, 4, 5];
export const QUALITY: Record<Degree, number> = {
  triumph: 2,
  success: 1,
  cost: 0,
  failure: -1,
  disaster: -2,
};
const STRAIN: Record<Degree, number> = { triumph: 0, success: 0, cost: 1, failure: 1, disaster: 2 };

const postOf = (state: GameState, world: World): Post => {
  const post = state.post && world.posts.get(state.post.id);
  if (!post) throw new Error('No post held');
  return post;
};

export function takePost(state: GameState, world: World, id: string): void {
  const post = world.posts.get(id);
  if (!post) throw new Error(`No such post: ${id}`);
  if (state.post) throw new Error('Already holds a post');
  if (state.journey || state.place !== post.place) throw new Error('Not here');
  state.post = { id, rank: 0, standing: 0, ...(post.harmony ? { harmony: HARMONY.start } : {}) };
  // A master who accepts you is the first gate: Apprenticeship.
  const skill = (state.skills[post.skill] ??= newSkill());
  if (skill.gates === 0) skill.gates = 1;
}

/** The trial for the next rank is offered once the skill stands at its gate and standing is enough. */
function trialReady(state: GameState, post: Post, rank: number): boolean {
  const skill = state.skills[post.skill];
  const held = state.post;
  if (!skill || !held || rank !== held.rank + 1) return false;
  return skill.level >= capOf(skill) && held.standing >= (TRIAL_STANDING[rank] ?? Infinity);
}

/** The cases a life may take now. */
export function offers(state: GameState, world: World): Case[] {
  const held = state.post;
  if (!held || state.venture) return [];
  const post = world.posts.get(held.id);
  if (!post) return [];
  return [...world.cases.values()].filter((c) => {
    if (c.post !== held.id) return false;
    if (c.trialFor !== undefined) return trialReady(state, post, c.trialFor);
    return (c.rank ?? 0) <= held.rank;
  });
}

/** The best material carried for a post's work, if the trade uses one. */
export function materialFor(
  state: GameState,
  post: Post,
): { item: string; quality: number } | undefined {
  return [...(post.materials ?? [])]
    .sort((a, b) => b.quality - a.quality)
    .find((m) => (state.goods[m.item] ?? 0) > 0);
}

export function takeCase(state: GameState, world: World, id: string): void {
  if (!offers(state, world).some((c) => c.id === id)) throw new Error('Not on offer');
  const post = postOf(state, world);
  const material = post.materials ? materialFor(state, post) : undefined;
  if (post.materials && !material) {
    throw new Error(
      `Needs ${world.items.get(post.materials[0]?.item ?? '')?.name ?? 'materials'} to work`,
    );
  }
  if (material) {
    const held = state.goods[material.item] ?? 0;
    if (held <= 1) delete state.goods[material.item];
    else state.goods[material.item] = held - 1;
  }
  state.venture = {
    case: id,
    step: 0,
    // Better stuff, better work: the material's quality is where the piece starts.
    quality: material?.quality ?? 0,
    strain: 0,
    working: null,
    started: state.hours,
    clues: [],
    lost: 0,
    ...(material ? { material: material.item } : {}),
  };
}

/** A household's harmony: where it starts, what a day costs and a duty gives, and what it does to a case. */
export const HARMONY = { start: 60, daily: 3, duty: 4, low: 40, high: 80, lowDc: 3, highDc: -2 };

/** What the post's own state adds to a case's checks, by name. */
export function postModifiers(state: GameState, post: Post): Modifier[] {
  const h = state.post?.harmony;
  if (!post.harmony || h === undefined) return [];
  if (h < HARMONY.low) return [{ source: 'A quarrelsome household', value: -HARMONY.lowDc }];
  if (h >= HARMONY.high)
    return [{ source: 'A household that runs itself', value: -HARMONY.highDc }];
  return [];
}

/** Each day: a household's harmony slips, and a case left open loses clues to time. */
export function careerDay(state: GameState, world: World): string | undefined {
  const held = state.post;
  const post = held && world.posts.get(held.id);
  if (!held || !post) return undefined;
  if (held.harmony !== undefined) held.harmony = Math.max(0, held.harmony - HARMONY.daily);
  const v = state.venture;
  if (!v || !post.pressure) return undefined;
  const days = Math.floor((state.hours - v.started) / 24);
  const late = days - post.pressure.grace;
  // The first clue goes the day after the grace runs out, then one every few days.
  if (late <= 0 || (late - 1) % post.pressure.every !== 0) return undefined;
  v.quality -= 1;
  v.lost += 1;
  return v.case;
}

/** The ways open through a step: techniques only from their rank. */
const openApproaches = (state: GameState, step: { approaches: Approach[] }): Approach[] =>
  step.approaches.filter(
    (a) =>
      (a.rank ?? 0) <= (state.post?.rank ?? 0) &&
      (!a.magic || (state.magic !== null && (state.skills[a.magic]?.level ?? 0) > 0)),
  );

/** An accusation starts harder than the case, and each clue (point of quality) makes it surer. */
export const ACCUSE = { harder: 5, perClue: 2, wrongStanding: 8 };

const specFor = (state: GameState, post: Post, c: Case, approach: Approach) => ({
  dc:
    c.dc +
    approach.dc +
    (post.work[state.venture?.step ?? -1]?.accuse
      ? ACCUSE.harder - ACCUSE.perClue * Math.max(0, state.venture?.quality ?? 0)
      : 0),
  // A way by magic is rolled with the art, not the trade.
  skillLevel: state.skills[approach.magic ?? post.skill]?.level ?? 0,
  // Past the strain limit, you press on at disadvantage.
  advantage: (state.venture && state.venture.strain >= STRAIN_LIMIT ? -1 : 0) as -1 | 0,
});

/** The ways through the step in hand, each with its chance. */
export function choices(state: GameState, world: World): { approach: Approach; chance: number }[] {
  const venture = state.venture;
  if (!venture || venture.working) return [];
  const post = postOf(state, world);
  const c = world.cases.get(venture.case);
  const step = post.work[venture.step];
  if (!c || !step) return [];
  return openApproaches(state, step).map((approach) => ({
    approach,
    chance: chanceOfSuccess({
      ...specFor(state, post, c, approach),
      modifiers: [
        ...toolModifiers(state, world, post.skill),
        ...boostModifiers(state, world, post.skill),
        ...postModifiers(state, post),
      ],
    }),
  }));
}

/** Begins the step in hand by one of its approaches. It takes the step's hours. */
export function beginStep(
  state: GameState,
  world: World,
  approachId: string,
  date: GameDate,
): void {
  const venture = state.venture;
  if (!venture) throw new Error('No case in hand');
  if (venture.working || state.doing) throw new Error('Busy');
  const post = postOf(state, world);
  if (state.journey || state.place !== post.place) throw new Error('Not at the workshop');
  if (state.asleep) throw new Error('Asleep');
  const step = post.work[venture.step];
  if (!step?.approaches.some((a) => a.id === approachId)) throw new Error('No such approach');
  if (!openApproaches(state, step).some((a) => a.id === approachId))
    throw new Error('A technique not yet learned');
  venture.working = { approach: approachId, hoursLeft: step.hours, hours: step.hours };
  void date;
}

/** How much each point of quality adds to what a case pays. */
export const CASE_PAY_PER_QUALITY = 0.15;

export function withdraw(state: GameState): void {
  if (!state.venture) throw new Error('No case in hand');
  state.venture = null;
  if (state.post) state.post.standing = Math.max(0, state.post.standing - 2);
}

/** One waking hour of work on the step in hand. Returns true when the case is finished. */
export function workHour(state: GameState, world: World): { finished?: Work; degree?: Degree } {
  const venture = state.venture;
  const held = state.post;
  if (!venture?.working || !held || state.asleep || state.journey) return {};
  venture.working.hoursLeft -= 1;
  if (venture.working.hoursLeft > 0) return {};

  const post = postOf(state, world);
  const c = world.cases.get(venture.case);
  const step = post.work[venture.step];
  const approach = step?.approaches.find((a) => a.id === venture.working?.approach);
  if (!c || !step || !approach) {
    state.venture = null;
    return {};
  }
  const spec = specFor(state, post, c, approach);
  const roll = {
    ...spec,
    modifiers: [
      ...toolModifiers(state, world, post.skill),
      ...boostModifiers(state, world, post.skill),
      ...postModifiers(state, post),
    ],
  };
  const result = rollCheck(roll, state.rng, state.seed, 'checks');
  state.checks[result.degree] = (state.checks[result.degree] ?? 0) + 1;
  state.lastCheck = { ...result, activity: `${c.id}/${step.id}` };
  const won = result.degree === 'success' || result.degree === 'triumph';
  venture.quality +=
    QUALITY[result.degree] + (approach.bold && won ? 1 : 0) + (won ? (approach.quality ?? 0) : 0);
  venture.clues.push({ step: step.id, degree: result.degree });
  venture.strain += STRAIN[result.degree];
  if (step.accuse && !won) {
    // A wrong accusation: the case is spoiled and the office remembers.
    venture.quality = Math.min(venture.quality, -1);
    held.standing = Math.max(0, held.standing - ACCUSE.wrongStanding);
  }
  const skill = (state.skills[post.skill] ??= newSkill());
  gain(
    skill,
    venture.working.hours *
      XP_PER_HOUR *
      edgeFactor(edgeOf(spec)) *
      lessonFactor(result.degree) *
      boonFactor(state, world, post.skill),
  );
  wearTool(state, world, post.skill, venture.working.hours);
  venture.working = null;
  venture.step += 1;
  if (venture.step < post.work.length) return { degree: result.degree };

  // The case is done.
  const work: Work = {
    case: c.id,
    quality: venture.quality,
    hours: state.hours,
    trial: c.trialFor !== undefined,
  };
  state.works.push(work);
  state.venture = null;
  if (c.trialFor !== undefined) {
    // A trial piece is the life's own, and kept.
    state.keepsakes.push({ case: c.id, quality: work.quality, hours: state.hours });
    if (work.quality >= (TRIAL_QUALITY[c.trialFor] ?? Infinity) && skill.gates < GATES.length) {
      passGate(skill);
      held.rank = c.trialFor;
    } else {
      // A refused piece costs standing, and the trial must be earned again.
      held.standing = Math.max(0, held.standing - 10);
    }
  } else {
    held.standing += Math.max(0, work.quality);
    // A case pays its hours at the rank's wage, more for good work and less for poor.
    const hours = post.work.reduce((n, s) => n + s.hours, 0);
    const worth = Math.max(0.5, Math.min(2, 1 + CASE_PAY_PER_QUALITY * work.quality));
    const forge = post.skill === 'skill_smithing' ? forgeFactor(state) : 1;
    earn(state, round2(hours * (post.pay?.[held.rank] ?? 0) * worth * forge));
  }
  return { finished: work, degree: result.degree };
}

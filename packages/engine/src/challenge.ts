/**
 * The challenge system (design bible, The challenge system): one check for
 * every risk. Total = d20 + bonus against a difficulty; the margin sets the
 * degree of result.
 */
import { nextRandom, type RngState } from './rng';

export const DIFFICULTY = {
  easy: 10,
  moderate: 15,
  hard: 20,
  veryHard: 25,
  heroic: 30,
  legendary: 35,
} as const;

export const DEGREES = ['disaster', 'failure', 'cost', 'success', 'triumph'] as const;
export type Degree = (typeof DEGREES)[number];

/** What adds to a roll, each with its source, so "why is this +4?" always has an answer. */
export interface Modifier {
  source: string;
  value: number;
}

export interface CheckSpec {
  dc: number;
  /** Skill level, 0 to 100. Adds level ÷ 5, rounded down. */
  skillLevel: number;
  modifiers?: Modifier[];
  /** Roll twice and keep the better (+1) or the worse (−1). */
  advantage?: -1 | 0 | 1;
  /** False where a step has no "at a cost": a near miss is then a failure. */
  allowsCost?: boolean;
}

export interface CheckResult {
  die: number;
  bonus: number;
  total: number;
  dc: number;
  margin: number;
  degree: Degree;
}

export const skillBonus = (level: number): number =>
  Math.floor(Math.max(0, Math.min(100, level)) / 5);

export function bonusOf(spec: CheckSpec): number {
  return skillBonus(spec.skillLevel) + (spec.modifiers ?? []).reduce((n, m) => n + m.value, 0);
}

/** The degree for a die and a margin. A natural 20 raises it one degree; a natural 1 lowers it one. */
export function degreeOf(margin: number, die: number, allowsCost = true): Degree {
  let i = margin >= 10 ? 4 : margin >= 0 ? 3 : margin >= -4 ? 2 : margin >= -9 ? 1 : 0;
  if (die === 20) i = Math.min(4, i + 1);
  if (die === 1) i = Math.max(0, i - 1);
  if (i === 2 && !allowsCost) i = 1;
  return DEGREES[i] ?? 'failure';
}

const d20 = (rng: RngState, seed: number, stream: string): number =>
  1 + Math.floor(nextRandom(rng, seed, stream) * 20);

export function rollCheck(
  spec: CheckSpec,
  rng: RngState,
  seed: number,
  stream: string,
): CheckResult {
  let die = d20(rng, seed, stream);
  if (spec.advantage) {
    const second = d20(rng, seed, stream);
    die = spec.advantage > 0 ? Math.max(die, second) : Math.min(die, second);
  }
  const bonus = bonusOf(spec);
  const total = die + bonus;
  const margin = total - spec.dc;
  return { die, bonus, total, dc: spec.dc, margin, degree: degreeOf(margin, die, spec.allowsCost) };
}

/** The exact chance of each degree. */
export function odds(spec: CheckSpec): Record<Degree, number> {
  const out: Record<Degree, number> = { disaster: 0, failure: 0, cost: 0, success: 0, triumph: 0 };
  const bonus = bonusOf(spec);
  for (let die = 1; die <= 20; die++) {
    // Chance that this die is the one kept.
    const p = !spec.advantage
      ? 1 / 20
      : spec.advantage > 0
        ? (2 * die - 1) / 400
        : (2 * (20 - die) + 1) / 400;
    out[degreeOf(die + bonus - spec.dc, die, spec.allowsCost)] += p;
  }
  return out;
}

/** The chance of getting what you came for: a success or a triumph. */
export function chanceOfSuccess(spec: CheckSpec): number {
  const o = odds(spec);
  return o.success + o.triumph;
}

/** The odds in words; the number is shown on request. */
export function oddsWord(chance: number): string {
  if (chance >= 0.95) return 'Sure';
  if (chance >= 0.75) return 'Likely';
  if (chance >= 0.45) return 'Even';
  if (chance >= 0.2) return 'Risky';
  if (chance >= 0.05) return 'Long shot';
  return 'Hopeless';
}

/** The edge for learning: the gap between the difficulty and your usual result (10 + bonus). */
export const edgeOf = (spec: CheckSpec): number => spec.dc - (10 + bonusOf(spec));

/** Failures still teach, at half value. */
export const lessonFactor = (degree: Degree): number =>
  degree === 'failure' || degree === 'disaster' ? 0.5 : 1;

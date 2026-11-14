/**
 * Skills and learning (design bible, Progression and scaling).
 * Skills grow from work near the edge of your ability, and three mastery
 * gates cap a skill until they are passed.
 */

/** Experience for the first level. Each level after needs about 4% more. */
export const BASE_XP = 75;
export const XP_GROWTH = 1.04;
/** Experience from one hour of work right at your edge. */
export const XP_PER_HOUR = 10;
export const MAX_LEVEL = 100;

/** A skill is capped at each of these until its gate is passed. */
export const GATES = [
  { cap: 10, name: 'Apprenticeship' },
  { cap: 25, name: 'The Journeyman trial' },
  { cap: 50, name: 'The Master trial' },
  { cap: 75, name: 'The Grandmaster deed' },
] as const;

export interface SkillState {
  level: number;
  /** Experience towards the next level. Past a cap, this is the bank: at most one level's worth. */
  xp: number;
  /** Gates passed, 0 to 4. */
  gates: number;
}

export const newSkill = (): SkillState => ({ level: 0, xp: 0, gates: 0 });

/** Experience needed to go from `level` to the next. */
export function xpToNext(level: number): number {
  return Math.round(BASE_XP * XP_GROWTH ** level);
}

/** The level a skill cannot pass until its next gate is passed. */
export function capOf(skill: SkillState): number {
  return GATES[skill.gates]?.cap ?? MAX_LEVEL;
}

/**
 * How much a piece of work teaches, by its edge: the gap between its
 * difficulty and what is usual for you. The bible's table, joined by straight lines.
 */
export function edgeFactor(edge: number): number {
  const points: [number, number][] = [
    [-10, 0],
    [-5, 0.25],
    [0, 1],
    [5, 1.25],
    [10, 0.5],
  ];
  if (edge <= -10) return 0;
  if (edge >= 10) return 0.5;
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1]!;
    const [x2, y2] = points[i]!;
    if (edge <= x2) return y1 + ((edge - x1) / (x2 - x1)) * (y2 - y1);
  }
  return 0;
}

/** Adds experience, raising the level up to the cap and banking at most one level beyond it. */
export function gain(skill: SkillState, xp: number): void {
  skill.xp += xp;
  const cap = capOf(skill);
  while (skill.level < cap && skill.xp >= xpToNext(skill.level)) {
    skill.xp -= xpToNext(skill.level);
    skill.level += 1;
  }
  if (skill.level >= cap) skill.xp = Math.min(skill.xp, xpToNext(skill.level));
}

/**
 * Experience from hours of plain work at a difficulty. For plain work the edge
 * is counted in levels; checks will use the bible's edge once challenges exist.
 */
export function workXp(hours: number, difficulty: number, level: number): number {
  return hours * XP_PER_HOUR * edgeFactor(difficulty - Math.max(1, level));
}

/** Passes the next gate, lifting the cap. The banked experience then counts. */
export function passGate(skill: SkillState): void {
  if (skill.gates >= GATES.length) throw new Error('No gate left to pass');
  if (skill.level < capOf(skill)) throw new Error('Not yet at the gate');
  skill.gates += 1;
  gain(skill, 0);
}

/** Total hours of work at the edge to reach a level, with every gate passed on the way. */
export function hoursToLevel(level: number): number {
  let xp = 0;
  for (let l = 0; l < level; l++) xp += xpToNext(l);
  return xp / XP_PER_HOUR;
}

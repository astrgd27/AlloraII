/**
 * Keeping a faith (design bible, Faith; canon: Ilvara's `mech`, `boons` and `way`).
 * A life joins at one of the faith's sites, earns devotion by the aspect's own
 * means, rises through the canon ranks, gains its boons, and keeps its duties.
 * A duty missed is a Lapse: the boons go quiet until three acts of the faith restore them.
 */
import type { GameDate } from './calendar';
import { note } from './log';
import type { GameState } from './state';
import { feastOn, type Rite, type World } from './world';

export interface Kept {
  faith: string;
  aspect: string;
  devotion: number;
  rank: number;
  lapsed: boolean;
  /** Acts of the faith done since lapsing; three restore. */
  restore: number;
  /** Game days of each act of parish work, the last few. */
  shifts: number[];
  /** The year a holy day was last kept. */
  kept: number;
  /** For the Pyre: whether the coals have been walked. */
  coals: boolean;
}

/** Learning in the faith's skills, per rank (canon: +8% per rank). */
export const BOON_PER_RANK = 0.08;
/** Parish work asked of the Hearth: so many shifts in so many days (canon: three in six). */
export const PARISH = { shifts: 3, days: 6 };
/** Acts of the faith that restore one who has lapsed (canon: three days of baking). */
export const RESTORE = 3;
/** The Pyre's own rank that only the coals open (canon: Ash-Marked). */
export const ASH_MARKED = 3;

const dayOf = (state: GameState): number => Math.floor(state.hours / 24);

export function riteOf(state: GameState, world: World): Rite | undefined {
  return state.faith ? world.rites.get(state.faith.faith) : undefined;
}

/** Why the life cannot join a faith by an aspect here now, or undefined if it can. */
export function joinWhyNot(
  state: GameState,
  world: World,
  faith: string,
  aspect: string,
): string | undefined {
  const rite = world.rites.get(faith);
  const a = rite?.aspects.find((x) => x.id === aspect);
  if (!rite || !a) return 'No such faith';
  if (state.faith) return 'Already keeps a faith';
  if (state.journey || state.place !== a.place) return 'Joined only at its own site';
  if ((state.skills[rite.join.skill]?.level ?? 0) < rite.join.level)
    return `Needs ${world.data.skills?.find((s) => s.id === rite.join.skill)?.name ?? 'devotion'} ${rite.join.level}`;
  return undefined;
}

export function join(state: GameState, world: World, faith: string, aspect: string): void {
  const why = joinWhyNot(state, world, faith, aspect);
  if (why) throw new Error(why);
  state.faith = {
    faith,
    aspect,
    devotion: 0,
    rank: 0,
    lapsed: false,
    restore: 0,
    shifts: [],
    kept: -1,
    coals: false,
  };
  note(state, { kind: 'faith', faith, rank: 0 });
}

/** Adds devotion and raises the rank it earns. */
function devote(state: GameState, world: World, by: number): void {
  const f = state.faith;
  const rite = riteOf(state, world);
  if (!f || !rite || f.lapsed || by <= 0) return;
  f.devotion = Math.round((f.devotion + by) * 10) / 10;
  let rank = rite.thresholds.reduce((r, t, i) => (f.devotion >= t ? i : r), 0);
  // The Pyre's Ash-Marked is won only by walking the coals.
  if (f.aspect === 'pyre' && !f.coals) rank = Math.min(rank, ASH_MARKED - 1);
  if (rank > f.rank) {
    f.rank = rank;
    note(state, { kind: 'faith', faith: f.faith, rank });
  }
}

/** After work is done: devotion by the aspect's means, and acts of the faith counted. */
export function faithOnWork(
  state: GameState,
  world: World,
  work: { skill?: string; hours: number; faith?: string; id: string; degree?: string },
): void {
  const f = state.faith;
  const rite = riteOf(state, world);
  if (!f || !rite) return;
  const aspect = rite.aspects.find((a) => a.id === f.aspect);
  if (work.faith === f.faith) {
    if (f.lapsed && ++f.restore >= RESTORE) {
      f.lapsed = false;
      f.restore = 0;
      note(state, { kind: 'restored', faith: f.faith });
    }
    f.shifts = [...f.shifts, dayOf(state)].slice(-6);
    if (work.id.endsWith('_keep_night') || work.id.endsWith('_fire_stubble')) f.kept = state.hours;
    if (work.id.endsWith('_walk_coals') && (work.degree === 'success' || work.degree === 'triumph'))
      f.coals = true;
    devote(state, world, 2 * work.hours);
  } else if (work.skill && aspect?.skills?.includes(work.skill)) {
    devote(state, world, work.hours);
  }
}

/** Burns an offering on the Pyre: devotion worth its value, doubled in autumn (canon). */
export function offer(state: GameState, world: World, item: string, date: GameDate): number {
  const f = state.faith;
  const rite = riteOf(state, world);
  const aspect = rite?.aspects.find((a) => a.id === f?.aspect);
  if (!f || !aspect?.offerings) throw new Error('Offerings are for the Pyre');
  if (state.journey || state.place !== aspect.place) throw new Error('Only at the Pyre');
  if (!state.goods[item]) throw new Error('Not in the pack');
  const held = state.goods[item] ?? 0;
  if (held <= 1) delete state.goods[item];
  else state.goods[item] = held - 1;
  const worth = (world.items.get(item)?.value ?? 1) * (date.seasonIndex === 2 ? 2 : 1);
  devote(state, world, worth);
  return worth;
}

/** What the faith adds to learning a skill. */
export function boonFactor(state: GameState, world: World, skill: string | undefined): number {
  const f = state.faith;
  const aspect = riteOf(state, world)?.aspects.find((a) => a.id === f?.aspect);
  if (!f || f.lapsed || !skill || !aspect?.boon_skills.includes(skill)) return 1;
  return 1 + BOON_PER_RANK * (f.rank + 1);
}

/** Hearth from Hearth-Friend: lodging costs halved in winter (canon). */
export function lodgingFactor(state: GameState, date: GameDate): number {
  const f = state.faith;
  return f && !f.lapsed && f.aspect === 'hearth' && f.rank >= 1 && date.seasonIndex === 3 ? 0.5 : 1;
}

/** Pyre from Pyre-Walker: more from forge and furnace (canon: +25%). */
export function forgeFactor(state: GameState): number {
  const f = state.faith;
  return f && !f.lapsed && f.aspect === 'pyre' && f.rank >= 2 ? 1.25 : 1;
}

/** Each day: the duties of the faith are counted, and a missed one is a Lapse. */
export function faithDay(state: GameState, world: World, date: GameDate): void {
  const f = state.faith;
  if (!f || f.lapsed) return;
  let missed: string | undefined;
  // Hearth, from Hearth-Friend: three parish shifts in every six days.
  if (f.aspect === 'hearth' && f.rank >= 1 && dayOf(state) % PARISH.days === 0) {
    const recent = f.shifts.filter((d) => dayOf(state) - d < PARISH.days).length;
    if (recent < PARISH.shifts) missed = 'parish';
  }
  // The holy day of the aspect, from its second rank: kept, or a Lapse the day after it ends.
  const holy = world.feasts.get(
    f.aspect === 'hearth' ? 'feast_longest_night' : 'feast_stubble_burning',
  );
  const yesterday = { seasonIndex: date.seasonIndex, day: date.day - 1 };
  const minRank = f.aspect === 'hearth' ? 2 : 1;
  if (holy && f.rank >= minRank && feastOn(holy, yesterday) && !feastOn(holy, date)) {
    if (state.hours - f.kept > (holy.to - holy.from + 2) * 24) missed = 'holy';
  }
  if (missed) {
    f.lapsed = true;
    f.restore = 0;
    note(state, { kind: 'lapsed', faith: f.faith });
  }
}

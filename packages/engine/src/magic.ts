/**
 * Magic (canon/magic_design.md). One art is playable: Hermetic Evocation.
 * A matriculated student copies proofs from the Collegium library, casts them
 * for Will and ink, and wins degrees in disputation. A proof cast near the
 * edge of one's skill can misfire and burn; a proof-rod spares the near misses.
 * The player can never learn witch magic; no art here is one.
 */
import type { GameDate } from './calendar';
import { edgeOf, rollCheck, type Modifier } from './challenge';
import { note } from './log';
import { spend } from './money';
import { XP_PER_HOUR, edgeFactor, gain, newSkill } from './skills';
import type { GameState } from './state';
import type { Art, Proof, World } from './world';

export interface Studied {
  art: string;
  degree: number;
  proofs: string[];
  /** Will, 0 to WILL_MAX: spent on proofs, regained with rest. */
  will: number;
  /** Proofs in force, and the game hour each ends. */
  boosts: { proof: string; until: number }[];
  /** The season (game hours / season) of the last disputation. */
  disputed: number;
}

export const WILL_MAX = 100;
/** Will regained each hour asleep, and each hour awake. */
export const WILL_REST = { asleep: 6, awake: 1 };
/** How far past one's skill a proof sits before it is cast: the edge it is cast at. */
export const PROOF_EDGE = 8;
/** What a misfire burns. */
export const MISFIRE = { failure: 8, disaster: 16 };
/** A proof can be copied up to this far above one's skill. */
export const COPY_REACH = 10;
const SEASON_HOURS = 28 * 24;

const artOf = (state: GameState, world: World): Art | undefined =>
  state.magic ? world.arts.get(state.magic.art) : undefined;

const atArt = (state: GameState, art: Art): boolean => !state.journey && state.place === art.place;

export function matriculateWhyNot(
  state: GameState,
  world: World,
  artId: string,
): string | undefined {
  const art = world.arts.get(artId);
  if (!art) return 'No such art';
  if (state.magic) return 'Already matriculated';
  if (!atArt(state, art)) return 'Only at the Collegium';
  const m = art.matriculate;
  if ((state.skills[m.skill]?.level ?? 0) < m.level)
    return `Needs Letters ${m.level} to swear the oath`;
  if (state.money < m.fee) return `The fee is ${m.fee} pf`;
  return undefined;
}

export function matriculate(state: GameState, world: World, artId: string): void {
  const why = matriculateWhyNot(state, world, artId);
  if (why) throw new Error(why);
  const art = world.arts.get(artId)!;
  spend(state, art.matriculate.fee);
  state.magic = { art: artId, degree: 0, proofs: [], will: WILL_MAX, boosts: [], disputed: -1 };
  state.skills[art.skill] ??= newSkill();
  note(state, { kind: 'degree', art: artId, degree: 0 });
}

const hasInk = (state: GameState, proof: Proof): boolean =>
  Object.entries(proof.ink).every(([item, n]) => (state.goods[item] ?? 0) >= n);

const take = (state: GameState, item: string, n: number): void => {
  const left = (state.goods[item] ?? 0) - n;
  if (left <= 0) delete state.goods[item];
  else state.goods[item] = left;
};

export function copyWhyNot(state: GameState, world: World, proofId: string): string | undefined {
  const proof = world.proofs.get(proofId);
  const art = artOf(state, world);
  if (!proof || !art || proof.art !== art.id) return 'Copied only by a matriculated student';
  if (state.magic?.proofs.includes(proofId)) return 'Already copied';
  if (!atArt(state, art)) return 'Only in the Collegium library';
  if ((state.skills[art.skill]?.level ?? 0) + COPY_REACH < proof.level)
    return `Beyond you yet: a proof of level ${proof.level}`;
  if (!state.goods.parchment || !state.goods.ink) return 'Needs parchment and ink to copy';
  if (state.money < proof.fee) return `The library's fee is ${proof.fee} pf`;
  return undefined;
}

export function copy(state: GameState, world: World, proofId: string): void {
  const why = copyWhyNot(state, world, proofId);
  if (why) throw new Error(why);
  const proof = world.proofs.get(proofId)!;
  spend(state, proof.fee);
  take(state, 'parchment', 1);
  take(state, 'ink', 1);
  state.magic!.proofs.push(proofId);
  note(state, { kind: 'copied', proof: proofId });
}

export function castWhyNot(state: GameState, world: World, proofId: string): string | undefined {
  const proof = world.proofs.get(proofId);
  const m = state.magic;
  if (!proof || !m?.proofs.includes(proofId)) return 'Not copied';
  if (state.asleep) return 'Asleep';
  if (m.will < proof.will) return `Needs ${proof.will} Will`;
  if (!hasInk(state, proof)) return 'Needs ink';
  return undefined;
}

/** Casts a proof. Returns how it went. */
export function cast(state: GameState, world: World, proofId: string): string {
  const why = castWhyNot(state, world, proofId);
  if (why) throw new Error(why);
  const proof = world.proofs.get(proofId)!;
  const art = artOf(state, world)!;
  const m = state.magic!;
  m.will -= proof.will;
  for (const [item, n] of Object.entries(proof.ink)) take(state, item, n);
  const skill = (state.skills[art.skill] ??= newSkill());
  const spec = { dc: proof.level + PROOF_EDGE, skillLevel: skill.level, allowsCost: true };
  const result = rollCheck(spec, state.rng, state.seed, 'checks');
  gain(skill, XP_PER_HOUR * edgeFactor(edgeOf(spec)));
  const rod = art.focus ? (state.goods[art.focus] ?? 0) > 0 : false;
  const holds =
    result.degree === 'success' || result.degree === 'triumph' || (result.degree === 'cost' && rod);
  if (holds) {
    m.boosts = [
      ...m.boosts.filter((b) => b.proof !== proofId),
      { proof: proofId, until: state.hours + proof.boost.hours },
    ];
    note(state, { kind: 'cast', proof: proofId });
    return result.degree;
  }
  const burn = result.degree === 'disaster' ? MISFIRE.disaster : MISFIRE.failure;
  state.needs.health = Math.max(0, state.needs.health - burn);
  note(state, { kind: 'misfire', proof: proofId });
  return 'misfire';
}

/** What proofs in force add to a skill's checks, each by name. */
export function boostModifiers(
  state: GameState,
  world: World,
  skill: string | undefined,
): Modifier[] {
  if (!skill || !state.magic) return [];
  return state.magic.boosts
    .filter((b) => b.until > state.hours)
    .flatMap((b) => {
      const proof = world.proofs.get(b.proof);
      return proof?.boost.skills.includes(skill)
        ? [{ source: proof.name, value: proof.boost.value }]
        : [];
    });
}

/** Each hour: Will comes back with rest, and spent proofs drop away. */
export function magicHour(state: GameState): void {
  const m = state.magic;
  if (!m) return;
  m.will = Math.min(WILL_MAX, m.will + (state.asleep ? WILL_REST.asleep : WILL_REST.awake));
  if (m.boosts.some((b) => b.until <= state.hours))
    m.boosts = m.boosts.filter((b) => b.until > state.hours);
}

export function disputeWhyNot(state: GameState, world: World): string | undefined {
  const art = artOf(state, world);
  const m = state.magic;
  if (!art || !m) return 'For matriculated students';
  const next = art.degrees[m.degree + 1];
  if (!next) return 'No higher degree';
  if (!atArt(state, art)) return 'Only in the Disputation Hall';
  if (state.asleep) return 'Asleep';
  if ((state.skills[art.skill]?.level ?? 0) < (next.level ?? 0))
    return `A ${next.name} must know the art to ${next.level}`;
  if (m.disputed === Math.floor(state.hours / SEASON_HOURS)) return 'One disputation a season';
  return undefined;
}

/** Stands a disputation for the next degree. Returns whether it was won. */
export function dispute(state: GameState, world: World, date: GameDate): boolean {
  const why = disputeWhyNot(state, world);
  if (why) throw new Error(why);
  const art = artOf(state, world)!;
  const m = state.magic!;
  const next = art.degrees[m.degree + 1]!;
  m.disputed = Math.floor(state.hours / SEASON_HOURS);
  const spec = { dc: next.dc ?? 20, skillLevel: state.skills[art.skill]?.level ?? 0 };
  const result = rollCheck(spec, state.rng, state.seed, 'checks');
  const won = result.degree === 'success' || result.degree === 'triumph';
  if (won) {
    m.degree += 1;
    note(state, { kind: 'degree', art: art.id, degree: m.degree });
  } else note(state, { kind: 'disputed', art: art.id });
  void date;
  return won;
}

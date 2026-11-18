/**
 * Friendship, as Allora I keeps it: points from 0 to 1,000, four tiers, gifts
 * judged by each person's own tastes once a week, and something told at each
 * new tier. Friends put work your way.
 */
import { note } from './log';
import type { GameState } from './state';
import type { Person, World } from './world';

/** Allora I's tiers of friendship, and the points each begins at. */
export const TIERS = [
  { name: 'Acquaintance', at: 0 },
  { name: 'Friend', at: 150 },
  { name: 'Close Friend', at: 400 },
  { name: 'Confidant', at: 750 },
] as const;
export const MAX_POINTS = 1000;
/** Allora I: a gift to the same person once in seven days. */
export const GIFT_DAYS = 7;
/** Allora I's reactions to a gift, and what each is worth. */
export const REACTIONS = { love: 70, like: 28, neutral: 10, dislike: -15, hate: -40 } as const;
export type Reaction = keyof typeof REACTIONS;
/** Points from a first meeting (Allora I), a day's talk, and working where they are. */
export const POINTS = { meet: 20, talk: 6, alongside: 2 };
/** What work at a friend's own haunt pays over the usual: friends put work your way. */
export const FRIEND_PAY = 1.25;

export const tierOf = (points: number): number =>
  TIERS.reduce((t, tier, i) => (points >= tier.at ? i : t), 0);

const dayOf = (state: GameState): number => Math.floor(state.hours / 24);

/** How a person takes a gift: by the thing itself first, then by its kind. */
export function reactionTo(person: Person, world: World, item: string): Reaction {
  const kind = world.items.get(item)?.type;
  const has = (list?: string[]) => (list ?? []).some((x) => x === item || x === kind);
  if (person.love?.includes(item)) return 'love';
  if (person.hate?.includes(item)) return 'hate';
  if (has(person.dislike)) return 'dislike';
  if (has(person.like)) return 'like';
  return 'neutral';
}

/** Adds points to a bond. A new tier leaves something to be told at the next talk. */
export function warm(state: GameState, world: World, id: string, by: number): void {
  const bond = state.bonds[id];
  if (!bond) return;
  const before = tierOf(bond.points);
  bond.points = Math.max(0, Math.min(MAX_POINTS, Math.round((bond.points + by) * 10) / 10));
  const after = tierOf(bond.points);
  if (after > before) {
    bond.toTell = Math.max(bond.toTell, after);
    note(state, { kind: 'friend', person: id, tier: after });
  }
  void world;
}

/** Gives a thing from the pack to someone here. */
export function give(state: GameState, world: World, id: string, item: string): Reaction {
  const person = world.people.get(id);
  const bond = state.bonds[id];
  if (!person) throw new Error('No such person');
  if (!bond) throw new Error('Not yet met');
  if (!state.goods[item]) throw new Error('Not in the pack');
  if (bond.lastGift >= 0 && dayOf(state) - bond.lastGift < GIFT_DAYS)
    throw new Error('A gift a week is enough');
  const held = state.goods[item] ?? 0;
  if (held <= 1) delete state.goods[item];
  else state.goods[item] = held - 1;
  const reaction = reactionTo(person, world, item);
  bond.lastGift = dayOf(state);
  warm(state, world, id, REACTIONS[reaction]);
  state.words = { person: id, kind: 'gift', line: 0, reaction };
  return reaction;
}

/** Whether a gift can be given to someone today, and if not, why. */
export function giftWhyNot(state: GameState, id: string): string | undefined {
  const bond = state.bonds[id];
  if (!bond) return 'Not yet met';
  if (bond.lastGift >= 0 && dayOf(state) - bond.lastGift < GIFT_DAYS)
    return `A gift a week is enough: in ${GIFT_DAYS - (dayOf(state) - bond.lastGift)} days`;
  return undefined;
}

/** The friends whose haunt this sub-place is, by day. */
export function friendsAt(
  state: GameState,
  world: World,
  place: string,
  sub: string | undefined,
): string[] {
  return [...world.people.values()]
    .filter((p) => {
      const b = state.bonds[p.id];
      const haunt = p.sched[0]?.at;
      return b && tierOf(b.points) >= 1 && haunt?.[0] === place && (!sub || haunt[1] === sub);
    })
    .map((p) => p.id);
}

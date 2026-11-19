/**
 * Several lives in one world, and the Tapestry (design bible, Parallel lives
 * and the Tapestry). Every life runs the same simulation; the one in focus
 * takes the player's orders, the rest keep to their standing orders. Legend
 * earned by any life's great deeds buys threads of the Tapestry: more lives,
 * and upbringings to be born into. Lives do not age, and nothing is inherited.
 */
import { rentAt } from './housing';
import { mark, writeReport, type Mark } from './routine';
import { newSkill } from './skills';
import { migrate } from './save/migrations';
import { newGame, type GameState } from './state';
import type { World } from './world';

/** The save format of the whole weave. Raise it with every change to Weave. */
export const WEAVE_VERSION = 1;

export interface LifeRecord {
  name: string;
  upbringing: string;
  state: GameState;
  /** Where things stood when the player last left this life, for its report. */
  since: Mark | null;
}

export interface Weave {
  weave: typeof WEAVE_VERSION;
  focus: number;
  /** Tapestry nodes bought. */
  woven: string[];
  /** Legend spent on them. */
  spent: number;
  lives: LifeRecord[];
}

/** The Lives thread: each node opens one more life. */
export const LIVES_THREAD = [
  { id: 'tapestry_life_2', name: 'A second life', cost: 50 },
  { id: 'tapestry_life_3', name: 'A third life', cost: 150 },
];

/** The upbringing of the first life. */
export const FIRST_UPBRINGING = 'upbringing_ostwick_farm';

export const isWeave = (save: unknown): save is Weave =>
  typeof save === 'object' && save !== null && Array.isArray((save as Weave).lives);

/** Wraps a single life (a new game, or a save from before lives were woven) as the first life. */
export function weaveOf(state: GameState, world: World): Weave {
  const first = world.upbringings.get(FIRST_UPBRINGING);
  return {
    weave: WEAVE_VERSION,
    focus: 0,
    woven: [],
    spent: 0,
    lives: [
      {
        name: first?.names[0] ?? 'The first life',
        upbringing: FIRST_UPBRINGING,
        state,
        since: null,
      },
    ],
  };
}

/** Reads any past save: a single life, or a weave whose lives each migrate on their own. */
export function migrateSave(save: unknown, world: World): Weave {
  if (!isWeave(save)) return weaveOf(migrate(save), world);
  if (save.weave > WEAVE_VERSION) throw new Error('This save is from a newer game');
  return { ...save, lives: save.lives.map((l) => ({ ...l, state: migrate(l.state) })) };
}

export const legendEarned = (w: Weave): number => w.lives.reduce((n, l) => n + l.state.legend, 0);
export const legendFree = (w: Weave): number => legendEarned(w) - w.spent;
export const slots = (w: Weave): number =>
  1 + LIVES_THREAD.filter((n) => w.woven.includes(n.id)).length;

/** Every node of the Tapestry: the Lives thread, then the Origins (upbringings with a price). */
export function nodes(world: World): { id: string; name: string; thread: string; cost: number }[] {
  return [
    ...LIVES_THREAD.map((n) => ({ ...n, thread: 'lives' })),
    ...[...world.upbringings.values()]
      .filter((u) => u.legend > 0)
      .map((u) => ({ id: u.id, name: u.name, thread: 'origins', cost: u.legend })),
  ];
}

export function weaveWhyNot(w: Weave, world: World, id: string): string | undefined {
  const node = nodes(world).find((n) => n.id === id);
  if (!node) return 'No such thread';
  if (w.woven.includes(id)) return 'Already woven';
  const i = LIVES_THREAD.findIndex((n) => n.id === id);
  if (i > 0 && !w.woven.includes(LIVES_THREAD[i - 1]!.id))
    return `Weave ${LIVES_THREAD[i - 1]!.name.toLowerCase()} first`;
  if (legendFree(w) < node.cost) return `Needs ${node.cost} Legend`;
  return undefined;
}

export function weaveNode(w: Weave, world: World, id: string): void {
  const why = weaveWhyNot(w, world, id);
  if (why) throw new Error(why);
  w.woven.push(id);
  w.spent += nodes(world).find((n) => n.id === id)!.cost;
}

export const upbringingOpen = (w: Weave, world: World, id: string): boolean => {
  const u = world.upbringings.get(id);
  return u !== undefined && (u.legend === 0 || w.woven.includes(id));
};

export function bornWhyNot(w: Weave, world: World, id: string): string | undefined {
  if (!world.upbringings.has(id)) return 'No such upbringing';
  if (w.lives.length >= slots(w)) return 'Weave another life in the Tapestry first';
  if (!upbringingOpen(w, world, id)) return 'Not yet woven into the Tapestry';
  return undefined;
}

/** Names an upbringing offers that no life has taken. */
export const namesLeft = (w: Weave, world: World, id: string): string[] =>
  (world.upbringings.get(id)?.names ?? []).filter((n) => !w.lives.some((l) => l.name === n));

/** Begins a new life near level 1, carrying only what its upbringing taught it. */
export function bear(w: Weave, world: World, id: string, name: string): void {
  const why =
    bornWhyNot(w, world, id) ??
    (namesLeft(w, world, id).includes(name) ? undefined : 'Not a name offered');
  if (why) throw new Error(why);
  const u = world.upbringings.get(id)!;
  const clock = w.lives[0]!.state;
  const state = newGame((clock.seed + 0x9e3779b9 * w.lives.length) >>> 0, clock.lastRealMs);
  state.hours = clock.hours;
  state.place = state.home = u.place;
  const rent = rentAt(world, u.place, 'room');
  state.lodging = rent === undefined ? null : { kind: 'room', rent, owed: 0 };
  for (const [skill, level] of Object.entries(u.skills))
    state.skills[skill] = { ...newSkill(), level };
  w.lives.push({ name, upbringing: id, state, since: mark(state) });
  focus(w, world, w.lives.length - 1);
}

/** Turns to another life. The one left behind keeps its standing orders; the one turned to reports. */
export function focus(w: Weave, world: World, index: number): void {
  const next = w.lives[index];
  if (!next) throw new Error('No such life');
  if (index === w.focus) return;
  const left = w.lives[w.focus]!;
  left.since = mark(left.state);
  if (next.since) writeReport(next.state, world, next.since);
  next.since = null;
  w.focus = index;
}

/** What a life is about, for the lives strip. */
export function stateOf(s: GameState): 'asleep' | 'road' | 'case' | 'work' | 'idle' {
  if (s.journey) return 'road';
  if (s.asleep) return 'asleep';
  if (s.venture) return 'case';
  if (s.doing) return 'work';
  return 'idle';
}

/** What the screen is shown of the weave. */
export interface WeaveView {
  lives: {
    name: string;
    upbringing: string;
    place: string;
    state: ReturnType<typeof stateOf>;
    /** The activity in hand, if any. */
    doing?: string;
    focus: boolean;
  }[];
  legend: { earned: number; free: number };
  tapestry: {
    id: string;
    name: string;
    thread: string;
    cost: number;
    woven: boolean;
    why?: string;
  }[];
  /** Upbringings a new life could be born into, with the names on offer. */
  births: { upbringing: string; names: string[]; why?: string }[];
}

export function weaveView(w: Weave, world: World): WeaveView {
  return {
    lives: w.lives.map((l, i) => ({
      name: l.name,
      upbringing: l.upbringing,
      place: l.state.journey?.to ?? l.state.place,
      state: stateOf(l.state),
      ...(l.state.doing ? { doing: l.state.doing.id } : {}),
      focus: i === w.focus,
    })),
    legend: { earned: legendEarned(w), free: legendFree(w) },
    tapestry: nodes(world).map((n) => {
      const why = weaveWhyNot(w, world, n.id);
      return { ...n, woven: w.woven.includes(n.id), ...(why ? { why } : {}) };
    }),
    births: [...world.upbringings.values()].map((u) => {
      const why = bornWhyNot(w, world, u.id);
      return { upbringing: u.id, names: namesLeft(w, world, u.id), ...(why ? { why } : {}) };
    }),
  };
}

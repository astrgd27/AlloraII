/** A short record of what just happened to the life, for the page to show. */
import type { Degree } from './challenge';
import type { HomeKind } from './housing';
import type { GameState } from './state';

export type LogEntry = { hours: number } & (
  | { kind: 'done'; id: string; pay?: number; degree?: Degree }
  | { kind: 'case'; id: string; quality: number; trial: boolean }
  | { kind: 'rank'; post: string; rank: number }
  | { kind: 'arrived'; place: string }
  | { kind: 'road'; id: string }
  | { kind: 'met'; person: string }
  | { kind: 'bought' | 'sold'; item: string; price: number }
  | { kind: 'moved' | 'evicted'; home: HomeKind; place: string }
  | { kind: 'broke'; item: string }
  | { kind: 'dues'; post: string; price: number }
  | { kind: 'lost'; case: string }
  | { kind: 'friend'; person: string; tier: number }
  | { kind: 'faith'; faith: string; rank: number }
  | { kind: 'lapsed' | 'restored'; faith: string }
  | { kind: 'offered'; item: string; worth: number }
  | { kind: 'degree'; art: string; degree: number }
  | { kind: 'disputed'; art: string }
  | { kind: 'copied' | 'cast' | 'misfire'; proof: string }
);

/** How many entries are kept. */
export const LOG_SIZE = 40;

type Loose<T> = T extends unknown ? Omit<T, 'hours'> : never;

/** Legend for a rank trial passed, by the rank won (design bible, Legend). */
export const LEGEND_RANK = [0, 10, 40, 150];
/** Legend for other great deeds. */
export const LEGEND = {
  greatCase: 15,
  greatQuality: 8,
  confidant: 10,
  faithRank: 10,
  degree: [0, 10, 25],
};

/**
 * What a thing that happened earns towards the Tapestry. A great case is one
 * well above what the life's rank expects: the bar rises a point with each rank.
 */
export function legendOf(entry: Loose<LogEntry>, rank = 0): number {
  switch (entry.kind) {
    case 'rank':
      return LEGEND_RANK[entry.rank] ?? LEGEND_RANK[LEGEND_RANK.length - 1]!;
    case 'case':
      return !entry.trial && entry.quality >= LEGEND.greatQuality + rank ? LEGEND.greatCase : 0;
    case 'friend':
      return entry.tier === 3 ? LEGEND.confidant : 0;
    case 'faith':
      return entry.rank > 0 ? LEGEND.faithRank : 0;
    case 'degree':
      return LEGEND.degree[entry.degree] ?? 0;
    default:
      return 0;
  }
}

export function note(state: GameState, entry: Loose<LogEntry>): void {
  state.legend += legendOf(entry, state.post?.rank ?? 0);
  state.log.push({ hours: state.hours, ...entry } as LogEntry);
  if (state.log.length > LOG_SIZE) state.log.splice(0, state.log.length - LOG_SIZE);
}

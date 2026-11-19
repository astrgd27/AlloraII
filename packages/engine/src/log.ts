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
);

/** How many entries are kept. */
export const LOG_SIZE = 40;

type Loose<T> = T extends unknown ? Omit<T, 'hours'> : never;

export function note(state: GameState, entry: Loose<LogEntry>): void {
  state.log.push({ hours: state.hours, ...entry } as LogEntry);
  if (state.log.length > LOG_SIZE) state.log.splice(0, state.log.length - LOG_SIZE);
}

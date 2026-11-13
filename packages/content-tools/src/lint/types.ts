/** Shared types for the content lint. */

export interface Entry {
  id: string;
  origin?: string;
  kind?: string;
  name?: string;
  roots?: string[];
  [key: string]: unknown;
}

/** An entry with the file it came from. */
export interface Loaded {
  entry: Entry;
  /** Path relative to the repository root. */
  file: string;
  /** True for anything under content/canon/. */
  canon: boolean;
}

export type Rule = 'schema' | 'reference' | 'canon' | 'lore';

export interface Problem {
  rule: Rule;
  /** A short code for the exact check, e.g. `missing-roots`. */
  code: string;
  severity: 'error' | 'warning';
  file: string;
  id: string;
  message: string;
}

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

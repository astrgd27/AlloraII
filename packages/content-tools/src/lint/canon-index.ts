/** The name index across all canon, and the tests for names that sit too close to it. */
import { isRecord, type Loaded } from './types';

/** Kinds whose names are proper names of the world. Item, recipe and skill names are not. */
export const NAMED_KINDS = new Set([
  'place',
  'region',
  'realm',
  'person',
  'npc',
  'group',
  'faith',
  'school',
  'people',
  'weather',
  'career',
  'route',
]);

export interface NameRef {
  /** The entry's id, or `<place>/<sub-place>` for a sub-place. */
  id: string;
  kind: string;
  origin: string;
}

/** Lowercase, no accents, no leading article, letters and digits only. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^(the|a|an)\s+/, '')
    .replace(/[^a-z0-9]+/g, '');
}

export class CanonIndex {
  /** Every canon id, with sub-places as `<place>/<sub>`. */
  readonly ids = new Set<string>();
  /** Normalized proper name → the canon entries that bear it. */
  readonly names = new Map<string, { name: string; refs: NameRef[] }>();

  constructor(canon: Loaded[]) {
    for (const { entry } of canon) {
      if (!entry.id) continue;
      this.ids.add(entry.id);
      const kind = entry.kind ?? '';
      const origin = entry.origin ?? '';
      if (NAMED_KINDS.has(kind))
        this.addName(entry.name ?? entry.label, { id: entry.id, kind, origin });
      if (!Array.isArray(entry.subs)) continue;
      for (const sub of entry.subs) {
        if (!isRecord(sub) || typeof sub.id !== 'string') continue;
        const id = `${entry.id}/${sub.id}`;
        this.ids.add(id);
        this.addName(sub.name, { id, kind: 'sub-place', origin });
      }
    }
  }

  private addName(name: unknown, ref: NameRef): void {
    if (typeof name !== 'string') return;
    const key = normalizeName(name);
    if (!key) return;
    const found = this.names.get(key) ?? { name, refs: [] };
    found.refs.push(ref);
    this.names.set(key, found);
  }

  /** The canon name a new name duplicates or nearly duplicates, if any. */
  nearest(name: string): { name: string; refs: NameRef[]; exact: boolean } | undefined {
    const key = normalizeName(name);
    if (!key) return undefined;
    const exact = this.names.get(key);
    if (exact) return { ...exact, exact: true };
    const allowed = maxDistance(key.length);
    if (allowed === 0) return undefined;
    for (const [other, found] of this.names) {
      if (Math.abs(other.length - key.length) > allowed) continue;
      if (editDistance(key, other, allowed) <= allowed) return { ...found, exact: false };
    }
    return undefined;
  }
}

/** How many letters may differ before two names stop being "nearly the same". */
export function maxDistance(length: number): number {
  if (length < 5) return 0;
  return length < 10 ? 1 : 2;
}

/** Levenshtein distance, giving up early once it must exceed `limit`. */
export function editDistance(a: string, b: string, limit = Infinity): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
      row.push(v);
      if (v < best) best = v;
    }
    if (best > limit) return best;
    prev = row;
  }
  return prev[b.length] ?? 0;
}

/** The generated index file: every proper name in canon and where it is used. */
export function renderNameIndex(index: CanonIndex): { name: string; ids: string[] }[] {
  return [...index.names.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([, v]) => ({ name: v.name, ids: v.refs.map((r) => `${r.kind}:${r.id}`) }));
}

/**
 * Turns the raw Allora I tables into canon entries: keeps Allora I's ids,
 * marks each entry `origin: allora1`, renames the listed short fields, and
 * drops values that are code rather than data (recording where they were).
 */
import { FN_MARK, NONFINITE_MARK } from './collect';
import type { KindDef } from './kinds';

export type Entry = { id: string; origin: 'allora1'; kind: string } & Record<string, unknown>;

/** Something left out of an entry, counted by kind and field path. */
export interface Dropped {
  kind: string;
  path: string;
  reason: 'code' | 'non-finite number';
  count: number;
  /** The first few entries it was dropped from. */
  examples: string[];
}

const MAX_EXAMPLES = 5;

export class DropLog {
  private counts = new Map<string, Dropped>();

  add(kind: string, path: string, reason: Dropped['reason'], entryId: string): void {
    const key = `${kind}\u0000${path}\u0000${reason}`;
    const found = this.counts.get(key) ?? { kind, path, reason, count: 0, examples: [] };
    found.count += 1;
    if (found.examples.length < MAX_EXAMPLES && !found.examples.includes(entryId)) {
      found.examples.push(entryId);
    }
    this.counts.set(key, found);
  }

  list(): Dropped[] {
    return [...this.counts.values()].sort(
      (a, b) => a.kind.localeCompare(b.kind) || a.path.localeCompare(b.path),
    );
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Removes code and non-finite numbers from a value. Array positions show as `[]` in paths. */
export function clean(
  value: unknown,
  kind: string,
  path: string,
  log: DropLog,
  entryId: string,
): unknown {
  if (value === FN_MARK) return undefined;
  if (value === NONFINITE_MARK) return undefined;
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (const item of value) {
      const reason = dropReason(item);
      if (reason) {
        log.add(kind, `${path}[]`, reason, entryId);
        continue;
      }
      out.push(clean(item, kind, `${path}[]`, log, entryId));
    }
    return out;
  }
  if (isRecord(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const p = path ? `${path}.${k}` : k;
      const reason = dropReason(v);
      if (reason) {
        log.add(kind, p, reason, entryId);
        continue;
      }
      out[k] = clean(v, kind, p, log, entryId);
    }
    return out;
  }
  return value;
}

function dropReason(v: unknown): Dropped['reason'] | undefined {
  if (v === FN_MARK) return 'code';
  if (v === NONFINITE_MARK) return 'non-finite number';
  return undefined;
}

/** Applies top-level renames, refusing to overwrite a field that already exists. */
export function renameFields(
  raw: Record<string, unknown>,
  rename: Record<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    const to = rename[k] ?? k;
    if (to in out) throw new Error(`Field "${k}" would overwrite "${to}"`);
    out[to] = v;
  }
  return out;
}

/** Entries of a table, in the table's own order. Accepts keyed objects or arrays with `id`. */
export function tableRows(table: unknown, name: string): [string, Record<string, unknown>][] {
  if (Array.isArray(table)) {
    return table.map((row, i) => {
      if (!isRecord(row) || typeof row.id !== 'string') {
        throw new Error(`${name}[${i}] has no id`);
      }
      return [row.id, row];
    });
  }
  if (!isRecord(table)) throw new Error(`${name} is not a table`);
  return Object.entries(table).map(([id, row]) => {
    if (!isRecord(row)) throw new Error(`${name}.${id} is not an object`);
    return [id, row];
  });
}

export interface BuildResult {
  entries: Entry[];
  /** Entries whose own `id` field differs from their table key. */
  idMismatches: string[];
}

/**
 * An entry's own id agrees with its key when they are equal, or when the key is
 * a quality variant of it: Allora I keys item variants as `<item>#<quality>`.
 */
export function sameId(key: string, ownId: unknown): boolean {
  if (key === ownId) return true;
  if (typeof ownId !== 'string' || !key.startsWith(`${ownId}#`)) return false;
  return /^\d+$/.test(key.slice(ownId.length + 1));
}

export function buildEntries(def: KindDef, table: unknown, log: DropLog): BuildResult {
  const entries: Entry[] = [];
  const idMismatches: string[] = [];
  for (const [id, raw] of tableRows(table, def.table)) {
    if (def.filter && !def.filter(id, raw)) continue;
    const { id: ownId, ...rest } = clean(raw, def.kind, '', log, id) as Record<string, unknown>;
    if (ownId !== undefined && !sameId(id, ownId)) {
      idMismatches.push(`${id} (own id: ${String(ownId)})`);
    }
    entries.push({ id, origin: 'allora1', kind: def.kind, ...renameFields(rest, def.rename) });
  }
  return { entries, idMismatches };
}

const SUB_RENAME = { n: 'name', i: 'icon', d: 'description' };

/**
 * Nests each place's sub-places under `subs`. Hidden sub-places that SUBS does
 * not already list are added from HIDDEN_SUBS.
 */
export function attachSubs(
  places: Entry[],
  subs: unknown,
  hiddenSubs: unknown,
  log: DropLog,
): { orphans: string[] } {
  const subTable = isRecord(subs) ? subs : {};
  const hiddenTable = isRecord(hiddenSubs) ? hiddenSubs : {};
  const placeIds = new Set(places.map((p) => p.id));
  for (const place of places) {
    const list: unknown[] = Array.isArray(subTable[place.id])
      ? [...(subTable[place.id] as unknown[])]
      : [];
    const seen = new Set(list.map((s) => (isRecord(s) ? s.id : undefined)));
    for (const h of [hiddenTable[place.id] ?? []].flat()) {
      if (isRecord(h) && !seen.has(h.id)) list.push(h);
    }
    if (list.length === 0) continue;
    place.subs = list.map((s) =>
      renameFields(
        clean(s, 'place', 'subs[]', log, place.id) as Record<string, unknown>,
        SUB_RENAME,
      ),
    );
  }
  const orphans = [...Object.keys(subTable), ...Object.keys(hiddenTable)].filter(
    (id) => !placeIds.has(id),
  );
  return { orphans: [...new Set(orphans)] };
}

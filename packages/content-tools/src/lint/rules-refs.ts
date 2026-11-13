/** The reference check: every id a new entry names must exist. */
import type { CanonIndex } from './canon-index';
import { isRecord, type Loaded, type Problem } from './types';

/** Top-level fields whose value is the id of another entry (or a list of ids). */
export const REFERENCE_FIELDS = [
  'region',
  'realm',
  'place',
  'home',
  'group',
  'faith',
  'seat',
  'school',
  'base',
  'patron',
  'gate',
  'people',
  'superior',
  'rival',
  'from',
  'to',
];

export function lintReferences(additions: Loaded[], index: CanonIndex): Problem[] {
  const problems: Problem[] = [];
  const known = new Set(index.ids);
  for (const { entry } of additions) {
    if (!entry.id) continue;
    known.add(entry.id);
    if (!Array.isArray(entry.subs)) continue;
    for (const sub of entry.subs) {
      if (isRecord(sub) && typeof sub.id === 'string') known.add(`${entry.id}/${sub.id}`);
    }
  }
  for (const { entry, file } of additions) {
    for (const field of REFERENCE_FIELDS) {
      const value = entry[field];
      const ids = Array.isArray(value) ? value : value === undefined ? [] : [value];
      for (const id of ids) {
        if (typeof id === 'string' && !known.has(id)) {
          problems.push({
            rule: 'reference',
            code: 'missing-reference',
            severity: 'error',
            file,
            id: entry.id,
            message: `\`${field}: ${id}\` names an entry that does not exist.`,
          });
        }
      }
    }
  }
  return problems;
}

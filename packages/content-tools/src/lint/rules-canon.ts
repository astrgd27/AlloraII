/** The canon lint: roots, names that sit too close to canon, and edits to canon. */
import type { CanonIndex } from './canon-index';
import { NAMED_KINDS, normalizeName } from './canon-index';
import type { Loaded, Problem } from './types';

/**
 * Every addition must be marked allora2 and grow from canon: each root exists,
 * and following roots leads to at least one canon entry.
 */
export function lintRoots(additions: Loaded[], index: CanonIndex): Problem[] {
  const problems: Problem[] = [];
  const byId = new Map(additions.map((a) => [a.entry.id, a.entry]));

  const reachesCanon = (id: string, seen: Set<string>): boolean => {
    if (index.ids.has(id)) return true;
    const entry = byId.get(id);
    if (!entry || seen.has(id)) return false;
    seen.add(id);
    return (entry.roots ?? []).some((r) => reachesCanon(r, seen));
  };

  for (const { entry, file } of additions) {
    const add = (code: string, message: string) =>
      problems.push({ rule: 'canon', code, severity: 'error', file, id: entry.id, message });
    if (entry.origin !== 'allora2') {
      add(
        'wrong-origin',
        `New content must be \`origin: allora2\`, not \`${String(entry.origin)}\`. Canon lives in content/canon/.`,
      );
    }
    if (index.ids.has(entry.id))
      add('id-taken', `The id \`${entry.id}\` already belongs to a canon entry.`);
    const roots = Array.isArray(entry.roots) ? entry.roots : [];
    if (roots.length === 0) {
      add('missing-roots', 'No `roots`. Name the canon ids this grows from.');
      continue;
    }
    for (const root of roots) {
      if (root === entry.id) add('missing-root', 'An entry cannot be its own root.');
      else if (!index.ids.has(root) && !byId.has(root)) {
        add('missing-root', `Root \`${root}\` does not exist.`);
      }
    }
    if (!roots.some((r) => r !== entry.id && reachesCanon(r, new Set([entry.id])))) {
      add('unrooted', 'None of its roots leads back to a canon entry.');
    }
  }

  const seen = new Map<string, string>();
  for (const { entry, file } of additions) {
    const first = seen.get(entry.id);
    if (first !== undefined) {
      problems.push({
        rule: 'canon',
        code: 'duplicate-id',
        severity: 'error',
        file,
        id: entry.id,
        message: `The id \`${entry.id}\` is also used in ${first}.`,
      });
    } else seen.set(entry.id, file);
  }
  return problems;
}

/** A new proper name may not reuse or nearly copy a canon name, or another new name. */
export function lintNames(additions: Loaded[], index: CanonIndex): Problem[] {
  const problems: Problem[] = [];
  const newNames = new Map<string, string>();
  for (const { entry, file } of additions) {
    if (typeof entry.name !== 'string' || !NAMED_KINDS.has(entry.kind ?? '')) continue;
    const add = (code: string, message: string) =>
      problems.push({ rule: 'canon', code, severity: 'error', file, id: entry.id, message });
    const near = index.nearest(entry.name);
    if (near) {
      const where = near.refs.map((r) => `${r.kind} \`${r.id}\``).join(', ');
      add(
        near.exact ? 'duplicate-name' : 'near-duplicate-name',
        `The name "${entry.name}" ${near.exact ? 'is' : 'is nearly'} the canon name "${near.name}" (${where}).`,
      );
    }
    const key = normalizeName(entry.name);
    const other = newNames.get(key);
    if (other !== undefined)
      add('duplicate-name', `The name "${entry.name}" is already used by \`${other}\`.`);
    else newNames.set(key, entry.id);
  }
  return problems;
}

/**
 * The canon sources in `canon/` change only by the owner's hand, in a pull
 * request labelled `canon-change`.
 *
 * `content/canon/` is generated from them. It is guarded separately and more
 * strictly: `pnpm extract:check` fails unless it equals a fresh extraction, so
 * it can only change by re-running the extractors.
 */
export function lintCanonEdits(changedFiles: string[], canonChangeAllowed: boolean): Problem[] {
  if (canonChangeAllowed) return [];
  return changedFiles
    .filter((f) => f.startsWith('canon/'))
    .map((file) => ({
      rule: 'canon' as const,
      code: 'canon-edit',
      severity: 'error' as const,
      file,
      id: '',
      message:
        'A canon source was changed. Only the owner changes canon/, in a pull request labelled `canon-change`.',
    }));
}

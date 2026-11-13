/** Runs every content lint over loaded content. Pure: no files, no git. */
import { validateEntry } from '../schemas/validate';
import { CanonIndex } from './canon-index';
import { lintCanonEdits, lintNames, lintRoots } from './rules-canon';
import { lintLore } from './rules-lore';
import { lintReferences } from './rules-refs';
import type { Loaded, Problem } from './types';

export interface LintInput {
  content: Loaded[];
  /** Files changed against the base branch, if known. */
  changedFiles?: string[];
  /** True in a pull request labelled `canon-change`. */
  canonChangeAllowed?: boolean;
}

export function lintSchemas(content: Loaded[]): Problem[] {
  return content.flatMap(({ entry, file }) =>
    validateEntry(entry).map((f) => ({
      rule: 'schema' as const,
      code: 'schema',
      severity: 'error' as const,
      file,
      id: f.id,
      message: `\`${f.path}\`: ${f.message}`,
    })),
  );
}

export function runLint(input: LintInput): Problem[] {
  const canon = input.content.filter((l) => l.canon);
  const additions = input.content.filter((l) => !l.canon);
  const index = new CanonIndex(canon);
  return [
    ...lintSchemas(input.content),
    ...lintReferences(additions, index),
    ...lintRoots(additions, index),
    ...lintNames(additions, index),
    ...lintCanonEdits(input.changedFiles ?? [], input.canonChangeAllowed ?? false),
    ...lintLore(additions),
  ];
}

/**
 * `pnpm lint:content`: the schema check, reference check, canon lint and lore
 * lint, and the additions ledger (docs/lore/additions.md).
 * `--check` also fails if the ledger on disk is out of date.
 *
 * Environment:
 *   LINT_BASE     git ref to compare against for canon edits (default origin/main)
 *   CANON_CHANGE  "true" in a pull request labelled canon-change
 */
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderAdditions } from './additions';
import { loadContent } from './load';
import { runLint } from './run';
import type { Problem } from './types';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const LEDGER = 'docs/lore/additions.md';

function changedFiles(base: string): string[] | undefined {
  try {
    const out = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.split('\n').filter(Boolean);
  } catch {
    return undefined;
  }
}

const line = (p: Problem): string =>
  `  ${p.severity === 'error' ? 'error' : 'warn '}  ${p.rule}/${p.code}  ${p.file}${p.id ? ` · ${p.id}` : ''}\n         ${p.message}`;

async function main(): Promise<void> {
  const check = process.argv.includes('--check');
  const content = await loadContent(ROOT);
  const base = process.env.LINT_BASE ?? 'origin/main';
  const changed = changedFiles(base);
  if (!changed)
    console.log(`Note: could not compare with ${base}; the canon-edit check was skipped.`);

  const problems = runLint({
    content,
    changedFiles: changed ?? [],
    canonChangeAllowed: process.env.CANON_CHANGE === 'true',
  });

  const ledger = renderAdditions(content);
  const onDisk = await readFile(join(ROOT, LEDGER), 'utf8').catch(() => undefined);
  if (check && onDisk !== ledger) {
    problems.push({
      rule: 'canon',
      code: 'stale-ledger',
      severity: 'error',
      file: LEDGER,
      id: '',
      message: 'The additions ledger is out of date. Run `pnpm lint:content` and commit it.',
    });
  } else if (!check && onDisk !== ledger) {
    await writeFile(join(ROOT, LEDGER), ledger);
    console.log(`Wrote ${LEDGER}.`);
  }

  const errors = problems.filter((p) => p.severity === 'error');
  const warnings = problems.filter((p) => p.severity === 'warning');
  for (const p of [...errors, ...warnings]) console.log(line(p));
  const canon = content.filter((c) => c.canon).length;
  console.log(
    `Checked ${canon} canon entries and ${content.length - canon} additions: ${errors.length} errors, ${warnings.length} warnings.`,
  );
  if (errors.length > 0) process.exit(1);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

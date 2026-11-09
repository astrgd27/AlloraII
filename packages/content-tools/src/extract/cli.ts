/**
 * `pnpm extract`: re-run the canon extractors and write content/canon/.
 * `pnpm extract --check`: fail if the files on disk differ from a fresh run.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTables } from './allora1/collect';
import { OUT_DIR, SOURCE_FILE, render, topLevelTableNames } from './allora1/extract';
import { TABLES } from './allora1/kinds';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

async function main(): Promise<void> {
  const check = process.argv.includes('--check');
  const htmlPath = join(ROOT, SOURCE_FILE);
  const html = await readFile(htmlPath);
  const sha256 = createHash('sha256').update(html).digest('hex');
  const tables = await collectTables(htmlPath, TABLES);
  const output = render(tables, { sha256, tableNames: topLevelTableNames(html.toString('utf8')) });

  const outDir = join(ROOT, OUT_DIR);
  if (check) {
    const problems: string[] = [];
    for (const [file, text] of output) {
      const onDisk = await readFile(join(outDir, file), 'utf8').catch(() => undefined);
      if (onDisk !== text)
        problems.push(onDisk === undefined ? `${file} is missing` : `${file} differs`);
    }
    const extra = (await readdir(outDir).catch(() => [] as string[])).filter((f) => !output.has(f));
    for (const f of extra) problems.push(`${f} is not produced by the extractor`);
    if (problems.length > 0) {
      console.error(`${OUT_DIR} is out of date. Run \`pnpm extract\`.\n- ${problems.join('\n- ')}`);
      process.exit(1);
    }
    console.log(`${OUT_DIR} matches a fresh extraction (${output.size} files).`);
    return;
  }

  await mkdir(outDir, { recursive: true });
  for (const [file, text] of output) await writeFile(join(outDir, file), text);
  console.log(`Wrote ${output.size} files to ${OUT_DIR}.`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

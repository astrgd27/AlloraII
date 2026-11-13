/**
 * `pnpm extract`: re-run the canon extractors and write content/canon/.
 * `pnpm extract --check`: fail if the files on disk differ from a fresh run.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTables } from './allora1/collect';
import * as allora1 from './allora1/extract';
import { TABLES } from './allora1/kinds';
import * as polygoetia from './polygoetia/import';
import { withSchemaCheck } from './schema-check';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

interface Extraction {
  outDir: string;
  files: Map<string, string>;
}

const sha256 = (data: Buffer): string => createHash('sha256').update(data).digest('hex');

async function extractAllora1(): Promise<Extraction> {
  const htmlPath = join(ROOT, allora1.SOURCE_FILE);
  const html = await readFile(htmlPath);
  const tables = await collectTables(htmlPath, TABLES);
  const files = allora1.render(tables, {
    sha256: sha256(html),
    tableNames: allora1.topLevelTableNames(html.toString('utf8')),
  });
  return { outDir: allora1.OUT_DIR, files: withSchemaCheck(files) };
}

async function extractPolygoetia(): Promise<Extraction> {
  const md = await readFile(join(ROOT, polygoetia.SOURCE_FILE));
  const { files } = polygoetia.importPolygoetia(md.toString('utf8'), sha256(md));
  return { outDir: polygoetia.OUT_DIR, files: withSchemaCheck(files) };
}

async function differences({ outDir, files }: Extraction): Promise<string[]> {
  const dir = join(ROOT, outDir);
  const problems: string[] = [];
  for (const [file, text] of files) {
    const onDisk = await readFile(join(dir, file), 'utf8').catch(() => undefined);
    if (onDisk !== text) {
      problems.push(`${outDir}/${file} ${onDisk === undefined ? 'is missing' : 'differs'}`);
    }
  }
  const onDisk = await readdir(dir).catch(() => [] as string[]);
  for (const f of onDisk) {
    if (!files.has(f)) problems.push(`${outDir}/${f} is not produced by the extractor`);
  }
  return problems;
}

async function main(): Promise<void> {
  const check = process.argv.includes('--check');
  const extractions = [await extractAllora1(), await extractPolygoetia()];

  if (check) {
    const problems = (await Promise.all(extractions.map(differences))).flat();
    if (problems.length > 0) {
      console.error(
        `content/canon is out of date. Run \`pnpm extract\`.\n- ${problems.join('\n- ')}`,
      );
      process.exit(1);
    }
    for (const e of extractions) {
      console.log(`${e.outDir} matches a fresh extraction (${e.files.size} files).`);
    }
    return;
  }

  for (const e of extractions) {
    const dir = join(ROOT, e.outDir);
    await mkdir(dir, { recursive: true });
    for (const [file, text] of e.files) await writeFile(join(dir, file), text);
    console.log(`Wrote ${e.files.size} files to ${e.outDir}.`);
  }
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

/** Reads every YAML entry under content/. */
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { parse } from 'yaml';
import { isRecord, type Entry, type Loaded } from './types';

async function yamlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const item of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const path = join(dir, item.name);
    if (item.isDirectory()) out.push(...(await yamlFiles(path)));
    else if (/\.ya?ml$/.test(item.name)) out.push(path);
  }
  return out.sort();
}

/** Entries of one parsed file: a list of entries, or a single entry. */
export function entriesOf(parsed: unknown): Entry[] {
  const list = Array.isArray(parsed) ? parsed : parsed == null ? [] : [parsed];
  return list.map((e) =>
    isRecord(e) ? ({ ...e, id: typeof e.id === 'string' ? e.id : '' } as Entry) : { id: '' },
  );
}

/** Generated canon files that are not lists of entries. */
const NOT_ENTRIES = /^content\/canon\/index\//;

export async function loadContent(root: string): Promise<Loaded[]> {
  const loaded: Loaded[] = [];
  for (const path of await yamlFiles(join(root, 'content'))) {
    const file = relative(root, path).split(sep).join('/');
    if (NOT_ENTRIES.test(file)) continue;
    const canon = file.startsWith('content/canon/');
    for (const entry of entriesOf(parse(await readFile(path, 'utf8')))) {
      loaded.push({ entry, file, canon });
    }
  }
  return loaded;
}

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

/**
 * Culture guides quote canon as evidence, in lines of the form
 *   > “the quoted words” — `canon_id`
 * This test proves every such quote is in canon word for word, under that id.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const GUIDES = join(ROOT, 'docs/lore/cultures');
const CANON_DIRS = ['allora1', 'polygoetia'].map((d) => join(ROOT, 'content/canon', d));

const strings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(strings);
  return [];
};

/** Canon id → all of its text. Sub-places are also filed under `<place>/<sub>`. */
function canonText(): Map<string, string> {
  const text = new Map<string, string>();
  const add = (id: string, value: unknown) =>
    text.set(id, `${text.get(id) ?? ''}\n${strings(value).join('\n')}`);
  const files = CANON_DIRS.flatMap((dir) =>
    readdirSync(dir)
      .filter((f) => f.endsWith('.yaml'))
      .map((f) => join(dir, f)),
  );
  for (const file of files) {
    for (const entry of parse(readFileSync(file, 'utf8')) as Record<string, unknown>[]) {
      const id = String(entry.id);
      add(id, entry);
      for (const sub of (entry.subs as Record<string, unknown>[] | undefined) ?? []) {
        add(`${id}/${String(sub.id)}`, sub);
      }
    }
  }
  return text;
}

const QUOTE = /^> “(.+)” — `([^`]+)`\s*$/;

describe('culture guides', () => {
  const canon = canonText();
  const guides = readdirSync(GUIDES).filter((f) => f.endsWith('.md') && f !== 'README.md');

  it.each(guides)('%s quotes canon word for word', (file) => {
    const wrong: string[] = [];
    let quotes = 0;
    for (const line of readFileSync(join(GUIDES, file), 'utf8').split('\n')) {
      if (!line.startsWith('> ')) continue;
      const m = QUOTE.exec(line);
      if (!m?.[1] || !m[2]) {
        wrong.push(`Not in the quote form: ${line}`);
        continue;
      }
      quotes += 1;
      const source = canon.get(m[2]);
      if (source === undefined) wrong.push(`No canon entry \`${m[2]}\`: ${line}`);
      else if (!source.includes(m[1])) wrong.push(`Not in \`${m[2]}\`: “${m[1]}”`);
    }
    expect(wrong).toEqual([]);
    expect(quotes).toBeGreaterThan(5);
  });
});

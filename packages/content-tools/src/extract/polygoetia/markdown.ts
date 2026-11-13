/** A small reader for the Markdown tables of the Polygoetia reference. */

export interface MdTable {
  /** The nearest heading above the table. */
  heading: string;
  headers: string[];
  rows: Record<string, string>[];
}

const splitRow = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

const isRule = (line: string): boolean => /^\|[\s:|-]+\|$/.test(line.trim());

/** Every table in the document, in order, with its nearest heading. */
export function readTables(markdown: string): MdTable[] {
  const tables: MdTable[] = [];
  let heading = '';
  const lines = markdown.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const h = /^#+\s+(.*)$/.exec(line);
    if (h?.[1]) {
      heading = h[1].trim();
      continue;
    }
    if (!line.trim().startsWith('|') || !isRule(lines[i + 1] ?? '')) continue;
    const headers = splitRow(line);
    const rows: Record<string, string>[] = [];
    i += 2;
    for (; i < lines.length && (lines[i] ?? '').trim().startsWith('|'); i++) {
      const cells = splitRow(lines[i] ?? '');
      const row: Record<string, string> = {};
      headers.forEach((key, c) => (row[key] = cells[c] ?? ''));
      rows.push(row);
    }
    i -= 1;
    tables.push({ heading, headers, rows });
  }
  return tables;
}

/** Removes bold and italic marks. */
export const plain = (text: string): string => text.replace(/\*+/g, '').trim();

/** `**Name** *(note)*` → name and note. Also reads `Name (note)`. */
export function nameAndNote(cell: string): { name: string; note?: string } {
  const text = plain(cell);
  const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(text);
  if (m?.[1] && m[2]) return { name: m[1].trim(), note: m[2].trim() };
  return { name: text };
}

/** Lowercase snake_case, without a leading "the". */
export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/** Splits a list on commas that are not inside brackets, dropping a leading "and". */
export function splitList(cell: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of cell) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else current += ch;
  }
  parts.push(current);
  return parts.map((p) => p.trim().replace(/^and\s+/, '')).filter((p) => p.length > 0);
}

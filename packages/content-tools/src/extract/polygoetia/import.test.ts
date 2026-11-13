import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { SOURCE_FILE, importPolygoetia } from './import';
import { nameAndNote, readTables, slug, splitList } from './markdown';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const reference = readFileSync(resolve(ROOT, SOURCE_FILE), 'utf8');
type E = Record<string, unknown> & { id: string };
const load = (files: Map<string, string>, name: string) => parse(files.get(name)!) as E[];

describe('markdown helpers', () => {
  it('reads tables with their heading', () => {
    const t = readTables('## Head\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |\n\ntext');
    expect(t).toEqual([
      {
        heading: 'Head',
        headers: ['A', 'B'],
        rows: [
          { A: '1', B: '2' },
          { A: '3', B: '4' },
        ],
      },
    ]);
  });

  it('splits lists outside brackets and reads notes', () => {
    expect(splitList('Lumbaran (the city, old), the gardens, and the falls')).toEqual([
      'Lumbaran (the city, old)',
      'the gardens',
      'the falls',
    ]);
    expect(nameAndNote('**The Eye** *(rarest)*')).toEqual({ name: 'The Eye', note: 'rarest' });
    expect(slug("The Callers' pilot-hall")).toBe('callers_pilot_hall');
  });
});

describe('Polygoetia importer, on the real reference', () => {
  const { files, problems } = importPolygoetia(reference, 'sha');

  it('reads everything without problems', () => {
    expect(problems).toEqual([]);
  });

  it('has an entry for every island, power and Weather in the document', () => {
    const tables = readTables(reference);
    const rows = (h: string) => tables.filter((t) => t.headers.includes(h)).flatMap((t) => t.rows);
    expect(load(files, 'places.yaml')).toHaveLength(rows('Island').length);
    expect(load(files, 'groups.yaml')).toHaveLength(rows('Power').length);
    expect(load(files, 'weathers.yaml')).toHaveLength(rows('Weather').length);
    expect(rows('Island')).toHaveLength(16);
    expect(rows('Power')).toHaveLength(14);
    expect(rows('Weather')).toHaveLength(8);
  });

  it('marks every entry origin: polygoetia with a unique id', () => {
    const all = [...files.keys()].filter((f) => f.endsWith('.yaml')).flatMap((f) => load(files, f));
    expect(all.every((e) => e.origin === 'polygoetia')).toBe(true);
    expect(new Set(all.map((e) => e.id)).size).toBe(all.length);
    expect(all.every((e) => /^[a-z][a-z0-9_]*$/.test(e.id))).toBe(true);
  });

  it('links islands to regions, schools and seats that exist', () => {
    const ids = (f: string) => new Set(load(files, f).map((e) => e.id));
    const places = load(files, 'places.yaml');
    for (const p of places) {
      expect(ids('regions.yaml').has(p.region as string)).toBe(true);
      if (p.school) expect(ids('schools.yaml').has(p.school as string)).toBe(true);
    }
    for (const g of load(files, 'groups.yaml')) {
      expect(ids('places.yaml').has(g.seat as string)).toBe(true);
    }
    expect(load(files, 'schools.yaml')).toHaveLength(12);
  });

  it('reads an island in full', () => {
    const kelumbra = load(files, 'places.yaml').find((p) => p.id === 'pg_kelumbra')!;
    expect(kelumbra).toMatchObject({
      name: 'Kelumbra',
      region: 'pg_sunward_chain',
      level_min: 72,
      level_max: 80,
      school: 'mag_pg_lamp_plays',
    });
    expect((kelumbra.subs as E[])[0]).toEqual({
      id: 'lumbaran',
      name: 'Lumbaran',
      note: "the queen's city",
    });
    const smoke = load(files, 'places.yaml').find((p) => p.id === 'pg_mother_smoke')!;
    expect(smoke).not.toHaveProperty('school');
    expect(smoke.magic_note).toBe('a faith');
  });

  it('renders the same bytes every time', () => {
    expect([...importPolygoetia(reference, 'sha').files]).toEqual([...files]);
  });
});

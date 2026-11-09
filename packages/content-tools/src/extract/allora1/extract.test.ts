import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { FN_MARK, NONFINITE_MARK, type CollectedTable } from './collect';
import { HEADER, render, topLevelTableNames } from './extract';
import { DropLog, buildEntries, clean, renameFields, sameId } from './transform';
import { KINDS } from './kinds';

const kind = (k: string) => KINDS.find((d) => d.kind === k)!;

/** A tiny stand-in for the game's tables. */
function fixture(): Record<string, CollectedTable> {
  return {
    LOCS: {
      value: {
        ostwick: { n: 'Ostwick', i: 'H', desc: 'A village.', reg: 'eintenn', x: 1, y: 2 },
        grauwald: { n: 'The Grauwald', i: 'T', desc: 'A wood.', reg: 'eintenn', x: 3, y: 4 },
      },
    },
    SUBS: {
      value: {
        ostwick: [{ id: 'tavern', n: 'The Barley Sheaf', i: 'A', d: 'Low beams.' }],
        grauwald: [{ id: 'camp', n: 'Camp', i: 'C', d: 'Hidden.', hidden: true }],
      },
    },
    HIDDEN_SUBS: {
      value: {
        grauwald: { id: 'camp', n: 'Camp', i: 'C', d: 'Hidden.', hidden: true },
        ostwick: { id: 'cellar', n: 'Cellar', i: 'K', d: 'Under the tavern.', hidden: true },
      },
    },
    SPELLS: {
      value: {
        h_milk: {
          id: 'h_milk',
          s: 'hedgecraft',
          lv: 3,
          n: 'Milk-Charm',
          i: 'M',
          d: 'Yields.',
          fn: FN_MARK,
        },
      },
    },
    ITEMS: {
      value: {
        candle_t2: { n: 'Pillar', i: 'c', v: 2, t: 'goods' },
        'candle_t2#1': {
          id: 'candle_t2',
          n: 'Fine Pillar',
          i: 'c',
          v: NONFINITE_MARK,
          t: 'goods',
          q: 1,
          base: 'candle_t2',
        },
      },
    },
    REGIONS: { error: 'REGIONS is not defined' },
  };
}

const source = {
  sha256: 'abc',
  tableNames: ['LOCS', 'SUBS', 'HIDDEN_SUBS', 'SPELLS', 'ITEMS', 'QT'],
};

describe('Allora I extractor', () => {
  it('keeps ids, marks origin and kind, and renames listed fields only', () => {
    const out = render(fixture(), source);
    const places = parse(out.get('places.yaml')!) as Record<string, unknown>[];
    expect(places[0]).toMatchObject({
      id: 'ostwick',
      origin: 'allora1',
      kind: 'place',
      name: 'Ostwick',
      description: 'A village.',
      region: 'eintenn',
      x: 1,
    });
  });

  it('nests sub-places and adds hidden ones only once', () => {
    const places = parse(render(fixture(), source).get('places.yaml')!) as {
      id: string;
      subs: { id: string }[];
    }[];
    expect(places.find((p) => p.id === 'ostwick')!.subs.map((s) => s.id)).toEqual([
      'tavern',
      'cellar',
    ]);
    expect(places.find((p) => p.id === 'grauwald')!.subs.map((s) => s.id)).toEqual(['camp']);
  });

  it('splits items from their quality variants', () => {
    const out = render(fixture(), source);
    expect((parse(out.get('items.yaml')!) as { id: string }[]).map((e) => e.id)).toEqual([
      'candle_t2',
    ]);
    const variants = parse(out.get('item_variants.yaml')!) as Record<string, unknown>[];
    expect(variants[0]).toMatchObject({ id: 'candle_t2#1', base: 'candle_t2', quality: 1 });
    expect(variants[0]).not.toHaveProperty('value');
  });

  it('drops code and reports it, with counts and unreadable tables', () => {
    const out = render(fixture(), source);
    const workings = parse(out.get('workings.yaml')!) as Record<string, unknown>[];
    expect(workings[0]).not.toHaveProperty('fn');
    expect(workings[0]).toMatchObject({ skill: 'hedgecraft', level: 3 });
    const report = out.get('REPORT.md')!;
    expect(report).toContain('| working | `fn` | code | 1 | `h_milk` |');
    expect(report).toContain('| item_variant | `v` | non-finite number | 1 | `candle_t2#1` |');
    expect(report).toContain('Table `REGIONS`: REGIONS is not defined');
    expect(report).toContain('| `places.yaml` | place | `LOCS` | 2 | 2 | yes |');
    expect(report).toContain('`QT`');
  });

  it('renders the same bytes every time', () => {
    const a = render(fixture(), source);
    const b = render(fixture(), source);
    expect([...a]).toEqual([...b]);
    expect(a.get('places.yaml')!.startsWith(HEADER)).toBe(true);
  });
});

describe('transform helpers', () => {
  it('records the path of dropped code inside arrays', () => {
    const log = new DropLog();
    const v = clean({ a: [{ f: FN_MARK }, FN_MARK, 1] }, 'k', '', log, 'e1');
    expect(v).toEqual({ a: [{}, 1] });
    expect(log.list().map((d) => [d.path, d.count])).toEqual([
      ['a[]', 1],
      ['a[].f', 1],
    ]);
  });

  it('refuses a rename that would overwrite a field', () => {
    expect(() => renameFields({ n: 'a', name: 'b' }, { n: 'name' })).toThrow();
  });

  it('accepts variant keys of the form <id>#<quality>', () => {
    expect(sameId('candle_t2#3', 'candle_t2')).toBe(true);
    expect(sameId('candle_t2x', 'candle_t2')).toBe(false);
    expect(sameId('a', 'b')).toBe(false);
  });

  it('flags entries whose own id disagrees with their key', () => {
    const r = buildEntries(kind('skill'), { swords: { id: 'blades', n: 'S' } }, new DropLog());
    expect(r.idMismatches).toEqual(['swords (own id: blades)']);
  });

  it('finds top-level table names in the page source', () => {
    expect(topLevelTableNames('const LOCS = {\nlet QT = [\nconst x = 1;\nconst N = 5;')).toEqual([
      'LOCS',
      'QT',
    ]);
  });
});

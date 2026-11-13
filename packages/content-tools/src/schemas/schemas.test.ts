import { describe, expect, it } from 'vitest';
import { withSchemaCheck } from '../extract/schema-check';
import { validateEntry, validateFile } from './validate';

const paths = (entry: unknown) => validateEntry(entry).map((f) => f.path);

const newPlace = {
  id: 'place_ostwick_mill',
  origin: 'allora2',
  kind: 'place',
  roots: ['ostwick'],
  name: 'The Mill',
  description: 'A mill on the stream.',
  region: 'eintenn',
};

describe('base rules', () => {
  it('accepts a rooted allora2 entry', () => {
    expect(validateEntry(newPlace)).toEqual([]);
  });

  it('requires roots when origin is allora2', () => {
    expect(paths({ ...newPlace, roots: undefined })).toEqual(['roots']);
    expect(paths({ ...newPlace, roots: [] })).toEqual(['roots']);
  });

  it('does not require roots for canon, and keeps canon ids as they are', () => {
    expect(
      validateEntry({ ...newPlace, id: 'ostwick', origin: 'allora1', roots: undefined }),
    ).toEqual([]);
    expect(
      validateEntry({ id: 'candle_t2#1', origin: 'allora1', kind: 'item_variant', name: 'Pillar' }),
    ).toEqual([]);
  });

  it('requires a kind-prefixed id for allora2', () => {
    expect(paths({ ...newPlace, id: 'Mill' })).toEqual(['id']);
  });

  it('rejects an unknown origin and a missing id', () => {
    expect(paths({ ...newPlace, origin: 'allora3' })).toEqual(['origin']);
    expect(paths({ ...newPlace, id: undefined })).toContain('id');
  });
});

describe('kind schemas', () => {
  it('place needs a name, a description and a region', () => {
    expect(paths({ id: 'x', origin: 'allora1', kind: 'place' }).sort()).toEqual([
      'description',
      'name',
      'region',
    ]);
  });

  it('sub-places need an id and a name', () => {
    expect(paths({ ...newPlace, subs: [{ id: 'weir' }] })).toEqual(['subs.0.name']);
  });

  it('item value must be a number, not text', () => {
    expect(
      paths({ id: 'x', origin: 'allora1', kind: 'item', name: 'Grain', value: 'cheap' }),
    ).toEqual(['value']);
  });

  it('post needs a trade, a place and a ladder of exactly four ranks', () => {
    const post = {
      id: 'post_lazaretto_physician',
      origin: 'allora2',
      kind: 'post',
      roots: ['marre'],
      name: 'Physician of the Lazaretto',
      trade: 'physician',
      place: 'marre',
      ranks: [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }],
    };
    expect(validateEntry(post)).toEqual([]);
    expect(paths({ ...post, ranks: post.ranks.slice(0, 3) })).toEqual(['ranks']);
    expect(paths({ ...post, trade: undefined })).toEqual(['trade']);
  });

  it('land, realm, person, group, faith and school need a name', () => {
    for (const kind of ['land', 'realm', 'person', 'group', 'faith', 'school']) {
      expect(paths({ id: 'x', origin: 'allora1', kind })).toEqual(['name']);
    }
  });

  it('faith ranks may be a list or keyed, but not text', () => {
    const faith = { id: 'x', origin: 'allora1', kind: 'faith', name: 'Dell' };
    expect(validateEntry({ ...faith, ranks: ['Seeker'] })).toEqual([]);
    expect(validateEntry({ ...faith, ranks: { day: ['Seeker'] } })).toEqual([]);
    expect(paths({ ...faith, ranks: 'Seeker' })).toEqual(['ranks']);
  });

  it('other kinds get the base check', () => {
    expect(validateEntry({ id: 'wx_eye', origin: 'polygoetia', kind: 'weather' })).toEqual([]);
    expect(paths({ id: 'wx_eye', origin: 'nowhere', kind: 'weather' })).toEqual(['origin']);
  });
});

describe('the report section', () => {
  it('lists failures with the entry, the field and the reason', () => {
    const files = new Map([
      ['places.yaml', '- id: a\n  origin: allora1\n  kind: place\n  name: A\n'],
      ['REPORT.md', '# Report\n'],
    ]);
    const report = withSchemaCheck(files).get('REPORT.md')!;
    expect(report).toContain('| `places.yaml` | place | 1 | 2 |');
    expect(report).toContain('- `a` · `description`:');
    expect(report).not.toContain('Every entry validates.');
    expect(validateFile('places.yaml', []).failures).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { renderAdditions } from './additions';
import { CanonIndex, editDistance, normalizeName } from './canon-index';
import { entriesOf } from './load';
import { textFields } from './rules-lore';
import { runLint } from './run';
import type { Entry, Loaded } from './types';

const canonEntry = (entry: Entry, file = 'content/canon/allora1/x.yaml'): Loaded => ({
  entry: { origin: 'allora1', ...entry },
  file,
  canon: true,
});
const added = (entry: Entry): Loaded => ({ entry, file: 'content/world/test.yaml', canon: false });

/** A small canon to lint against. */
const CANON: Loaded[] = [
  canonEntry({ id: 'eintenn', kind: 'region', name: 'Duchy of Eintenn', realm: 'realm_eintenn' }),
  canonEntry({ id: 'plandor', kind: 'region', name: 'Plandor', world: 'east' }),
  canonEntry({
    id: 'ostwick',
    kind: 'place',
    name: 'Ostwick',
    description: 'A village.',
    region: 'eintenn',
    subs: [{ id: 'tavern', name: 'The Barley Sheaf' }],
  }),
  canonEntry({ id: 'ppl_albrecht', kind: 'person', name: 'Albrecht IV von Tennfels' }),
  canonEntry({ id: 'grain', kind: 'item', name: 'Grain', value: 1 }),
];

/** A good addition: it passes every rule. */
const GOOD: Entry = {
  id: 'place_ostwick_mill',
  origin: 'allora2',
  kind: 'place',
  roots: ['ostwick'],
  name: 'Weirside Mill',
  description: 'A mill below the weir, where the miller keeps eels.',
  region: 'eintenn',
};

const codes = (entries: Entry[], extra: Partial<Parameters<typeof runLint>[0]> = {}) =>
  runLint({ content: [...CANON, ...entries.map(added)], ...extra }).map(
    (p) => `${p.rule}/${p.code}`,
  );

describe('a good addition', () => {
  it('passes every rule', () => {
    expect(codes([GOOD])).toEqual([]);
  });
});

describe('a deliberately bad entry fails each rule', () => {
  it('schema: a place without a description', () => {
    expect(codes([{ ...GOOD, description: undefined }])).toContain('schema/schema');
  });

  it('reference: a region that does not exist', () => {
    expect(codes([{ ...GOOD, region: 'atlantis' }])).toEqual(['reference/missing-reference']);
  });

  it('canon: no roots', () => {
    expect(codes([{ ...GOOD, roots: undefined }])).toContain('canon/missing-roots');
  });

  it('canon: a root that does not exist', () => {
    expect(codes([{ ...GOOD, roots: ['nowhere'] }])).toEqual([
      'canon/missing-root',
      'canon/unrooted',
    ]);
  });

  it('canon: roots that never reach canon', () => {
    const a = { ...GOOD, id: 'place_a', name: 'Alderholt', roots: ['place_b'] };
    const b = { ...GOOD, id: 'place_b', name: 'Birchcombe', roots: ['place_a'] };
    expect(codes([a, b])).toEqual(['canon/unrooted', 'canon/unrooted']);
  });

  it('canon: new content marked as canon', () => {
    expect(codes([{ ...GOOD, origin: 'allora1' }])).toContain('canon/wrong-origin');
  });

  it('canon: a name that copies a canon name, even of a sub-place', () => {
    expect(codes([{ ...GOOD, name: 'Ostwick' }])).toEqual(['canon/duplicate-name']);
    expect(codes([{ ...GOOD, name: 'Barley Sheaf' }])).toEqual(['canon/duplicate-name']);
  });

  it('canon: a name that nearly copies a canon name', () => {
    expect(codes([{ ...GOOD, name: 'Ostwyck' }])).toEqual(['canon/near-duplicate-name']);
    expect(codes([{ ...GOOD, name: 'Ostwík' }])).toEqual(['canon/near-duplicate-name']);
  });

  it('canon: an id or a name used twice', () => {
    expect(codes([GOOD, { ...GOOD, name: 'Eelpool Mill' }])).toEqual(['canon/duplicate-id']);
    expect(codes([GOOD, { ...GOOD, id: 'place_ostwick_mill_two' }])).toEqual([
      'canon/duplicate-name',
    ]);
    expect(codes([{ ...GOOD, id: 'ostwick' }])).toContain('canon/id-taken');
  });

  it('canon: an edit to canon/ outside a canon-change pull request', () => {
    const changedFiles = ['canon/polygoetia.md', 'content/world/test.yaml'];
    expect(codes([GOOD], { changedFiles })).toEqual(['canon/canon-edit']);
    expect(codes([GOOD], { changedFiles, canonChangeAllowed: true })).toEqual([]);
  });

  const withText = (description: string) => codes([{ ...GOOD, description }]);

  it('lore: banned words', () => {
    expect(withText('A medieval mill.')).toEqual(['lore/real-world-term']);
    expect(withText('Work here to level up.')).toEqual(['lore/interface-jargon']);
    expect(withText('The miller says okay.')).toEqual(['lore/modern-term']);
    expect(withText('TODO: describe the mill.')).toEqual(['lore/placeholder']);
  });

  it('lore: banned words respect word boundaries', () => {
    expect(withText('A romantic spot where germander grows.')).toEqual([]);
  });

  it('lore: emoji in game text', () => {
    expect(withText('A mill 🌾 below the weir.')).toEqual(['lore/emoji']);
  });

  it('lore: witch magic offered to the player', () => {
    expect(withText('The old woman will teach you witch magic for a price.')).toEqual([
      'lore/witch-magic',
    ]);
    expect(
      codes([{ ...GOOD, id: 'school_x', kind: 'school', name: 'Hagcraft', witch: true }]),
    ).toContain('lore/witch-magic');
  });

  it('lore: a mystery resolved', () => {
    expect(withText('Here you learn that the Ring was raised by the first Callers.')).toEqual([
      'lore/mystery-resolved',
    ]);
    expect(withText('Nobody here agrees on what the Ring is.')).toEqual([]);
  });

  it('lore: augury that hints at the future, except through Nim', () => {
    expect(withText('The augur tells you who will win the regatta.')).toEqual(['lore/augury-hint']);
    expect(withText('A dream of Nim: the augur sees who will win.')).toEqual([]);
  });

  it('lore: romance and minors', () => {
    const person = { ...GOOD, id: 'person_mill_girl', kind: 'person', name: 'Ilse Weirside' };
    expect(codes([{ ...person, romance: true, age: 16 }])).toEqual(['lore/minor-romance']);
    expect(codes([{ ...person, romance: true }])).toEqual(['lore/minor-romance']);
    expect(codes([{ ...person, romance: true, age: 24 }])).toEqual([]);
    expect(withText('You may court the miller’s child.')).toEqual(['lore/minor-romance']);
  });

  it('lore: a very long sentence is a warning, not an error', () => {
    const long = `${Array.from({ length: 50 }, () => 'mill').join(' ')}.`;
    const problems = runLint({ content: [...CANON, added({ ...GOOD, description: long })] });
    expect(problems.map((p) => [p.code, p.severity])).toEqual([['long-sentence', 'warning']]);
  });
});

describe('helpers', () => {
  it('normalizes names and measures distance', () => {
    expect(normalizeName('The Barley-Sheaf')).toBe('barleysheaf');
    expect(editDistance('ostwick', 'ostwyck')).toBe(1);
    expect(new CanonIndex(CANON).nearest('Elm')).toBeUndefined();
  });

  it('does not treat item names as proper names', () => {
    expect(codes([{ ...GOOD, name: 'Grain' }])).toEqual([]);
  });

  it('reads ids and data fields as non-text', () => {
    expect(
      textFields({ id: 'okay', region: 'rome', name: 'Mill', subs: [{ name: 'Weir' }] }),
    ).toEqual([
      { path: 'name', text: 'Mill' },
      { path: 'subs[0].name', text: 'Weir' },
    ]);
  });

  it('reads a file holding a list or one entry', () => {
    expect(entriesOf([{ id: 'a' }, 'junk'])).toEqual([{ id: 'a' }, { id: '' }]);
    expect(entriesOf({ id: 'a' })).toEqual([{ id: 'a' }]);
    expect(entriesOf(null)).toEqual([]);
  });
});

describe('the additions ledger', () => {
  it('lists additions by land, with roots', () => {
    const east = {
      ...GOOD,
      id: 'place_plandor_quay',
      name: 'Inkwell Quay',
      region: 'plandor',
      roots: ['plandor'],
    };
    const ledger = renderAdditions([...CANON, added(GOOD), added(east)]);
    expect(ledger).toContain('Total additions: 2.');
    expect(ledger.indexOf('## The Seven (1)')).toBeLessThan(ledger.indexOf('## Thoolma (1)'));
    expect(ledger).toContain(
      '| place | Weirside Mill | `place_ostwick_mill` | `ostwick` | `content/world/test.yaml` |',
    );
  });
});

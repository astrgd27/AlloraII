import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
type E = { id: string; roots: string[]; family?: string };
const load = (path: string) => parse(readFileSync(join(ROOT, path), 'utf8')) as E[];

describe('the skill map', () => {
  const canon = load('content/canon/allora1/skills.yaml').map((s) => s.id);
  const skills = load('content/skills/skills.yaml');
  const attributes = load('content/skills/attributes.yaml');

  it('gathers every Allora I skill exactly once', () => {
    const roots = [...skills, ...attributes].flatMap((s) => s.roots);
    expect(roots.slice().sort()).toEqual(canon.slice().sort());
  });

  it('has about seventy skills in eight families, and five attributes', () => {
    expect(skills.length).toBeGreaterThanOrEqual(65);
    expect(skills.length).toBeLessThanOrEqual(75);
    expect(new Set(skills.map((s) => s.family))).toEqual(
      new Set(['crafts', 'land', 'body', 'mind', 'people', 'shadow', 'faith', 'magic']),
    );
    expect(attributes).toHaveLength(5);
  });
});

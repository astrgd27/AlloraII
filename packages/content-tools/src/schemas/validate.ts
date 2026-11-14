/** Picks the schema for an entry's kind and reports what fails. */
import type { z } from 'zod';
import {
  activitySchema,
  faithSchema,
  groupSchema,
  itemSchema,
  landSchema,
  otherSchema,
  personSchema,
  placeSchema,
  postSchema,
  realmSchema,
  schoolSchema,
} from './kinds';

/** Entry kind → the schema that checks it. Kinds not listed get the base check only. */
export const SCHEMA_BY_KIND: Record<string, { name: string; schema: z.ZodType }> = {
  land: { name: 'land', schema: landSchema },
  realm: { name: 'realm', schema: realmSchema },
  region: { name: 'realm', schema: realmSchema },
  place: { name: 'place', schema: placeSchema },
  person: { name: 'person', schema: personSchema },
  npc: { name: 'person', schema: personSchema },
  group: { name: 'group', schema: groupSchema },
  faith: { name: 'faith', schema: faithSchema },
  school: { name: 'school', schema: schoolSchema },
  item: { name: 'item', schema: itemSchema },
  item_variant: { name: 'item', schema: itemSchema },
  post: { name: 'post', schema: postSchema },
  activity: { name: 'activity', schema: activitySchema },
};

export interface Failure {
  id: string;
  path: string;
  message: string;
}

export interface FileCheck {
  file: string;
  /** The schema used: one of the nine kinds, or "base". */
  schema: string;
  entries: number;
  failures: Failure[];
}

export function schemaFor(kind: unknown): { name: string; schema: z.ZodType } {
  return (
    (typeof kind === 'string' && SCHEMA_BY_KIND[kind]) || { name: 'base', schema: otherSchema }
  );
}

export function validateEntry(entry: unknown): Failure[] {
  const e = (entry ?? {}) as { id?: unknown; kind?: unknown };
  const result = schemaFor(e.kind).schema.safeParse(entry);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    id: typeof e.id === 'string' ? e.id : '(no id)',
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export function validateFile(file: string, entries: unknown[]): FileCheck {
  const first = (entries[0] ?? {}) as { kind?: unknown };
  return {
    file,
    schema: schemaFor(first.kind).name,
    entries: entries.length,
    failures: entries.flatMap(validateEntry),
  };
}

/** The "Schema check" section appended to each extraction report. */
export function renderSchemaCheck(checks: FileCheck[]): string {
  const lines = [
    '## Schema check',
    '',
    'Each file is checked against its zod schema (`packages/content-tools/src/schemas`). Kinds outside the nine Phase 0 schemas get the base check only: `id`, `origin`, `kind` and `roots`.',
    '',
    '| File | Schema | Entries | Failures |',
    '| --- | --- | ---: | ---: |',
    ...checks.map((c) => `| \`${c.file}\` | ${c.schema} | ${c.entries} | ${c.failures.length} |`),
    '',
  ];
  const failed = checks.filter((c) => c.failures.length > 0);
  if (failed.length === 0) lines.push('Every entry validates.', '');
  for (const c of failed) {
    lines.push(`### \`${c.file}\``, '');
    for (const f of c.failures) lines.push(`- \`${f.id}\` · \`${f.path}\`: ${f.message}`);
    lines.push('');
  }
  return lines.join('\n');
}

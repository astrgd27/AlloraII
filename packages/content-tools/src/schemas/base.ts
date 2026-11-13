/**
 * What every content entry shares: an id, an origin and, for anything new,
 * the canon it grows from.
 */
import { z } from 'zod';
import { ORIGINS, isStableId } from '../index';

export const originSchema = z.enum(ORIGINS);

const text = z.string().trim().min(1);

/** The fields every entry has. Kind schemas add their own on top. */
export const baseShape = {
  id: text,
  origin: originSchema,
  kind: text,
  /** Canon ids this entry grows from. Required when origin is allora2. */
  roots: z.array(text).optional(),
};

interface BaseEntry {
  id: string;
  origin: (typeof ORIGINS)[number];
  roots?: string[] | undefined;
}

/**
 * Rules that depend on the origin:
 * - a new entry (allora2) names at least one root, and has a kind-prefixed
 *   stable id (design bible, Rules for data);
 * - canon entries keep whatever id their source gave them.
 */
export function checkOrigin(entry: BaseEntry, ctx: z.RefinementCtx): void {
  if (entry.origin !== 'allora2') return;
  if (!entry.roots || entry.roots.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['roots'],
      message: 'An allora2 entry must name the canon ids it grows from',
    });
  }
  if (!isStableId(entry.id)) {
    ctx.addIssue({
      code: 'custom',
      path: ['id'],
      message:
        'An allora2 id is lowercase with underscores, prefixed by kind (place_ostwick_market)',
    });
  }
}

/**
 * Builds an entry schema: the base fields plus `shape`. Unknown fields are
 * kept, because canon carries many fields Allora II has not decided on yet.
 * Pass `null` as the kind to accept any kind.
 */
export function entrySchema<S extends z.ZodRawShape>(kind: string | string[] | null, shape: S) {
  const kinds = kind === null ? null : Array.isArray(kind) ? kind : [kind];
  return z.looseObject({ ...baseShape, ...shape }).superRefine((entry, ctx) => {
    checkOrigin(entry as unknown as BaseEntry, ctx);
    const k = (entry as { kind?: unknown }).kind;
    if (kinds && typeof k === 'string' && !kinds.includes(k)) {
      ctx.addIssue({
        code: 'custom',
        path: ['kind'],
        message: `Expected kind ${kinds.join(' or ')}, got ${k}`,
      });
    }
  });
}

export { text };

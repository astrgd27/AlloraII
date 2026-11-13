/**
 * Schemas for the nine kinds Phase 0 names: land, realm, place, person, group,
 * faith, school, item and post. Each requires only what every entry of that
 * kind must have, in canon and in new content alike. Later phases tighten them
 * as Allora II's systems decide what each field means.
 */
import { z } from 'zod';
import { entrySchema, text } from './base';

const level = z.number().int().min(1).max(100);

/** One of the five lands (the Seven, Gallar, Qoul, Thoolma, Polygoetia). */
export const landSchema = entrySchema('land', {
  name: text,
  realms: z.array(text).optional(),
  level_min: level.optional(),
  level_max: level.optional(),
});

/** A realm, or a map region of one. Canon has both a codex entry and a region per realm. */
export const realmSchema = entrySchema(['realm', 'region'], {
  name: text,
  text: text.optional(),
  /** The land it lies in. Allora I leaves this out for the Seven. */
  world: text.optional(),
  realm: text.optional(),
  gate: text.optional(),
  level_min: level.optional(),
  level_max: level.optional(),
});

const subPlaceSchema = z.looseObject({
  id: text,
  name: text,
  description: text.optional(),
  hidden: z.boolean().optional(),
});

export const placeSchema = entrySchema('place', {
  name: text,
  description: text,
  /** The region (realm) it lies in. */
  region: text,
  subs: z.array(subPlaceSchema).optional(),
  level_min: level.optional(),
  level_max: level.optional(),
});

/** A named person. Covers Allora I's rulers (`person`) and the people a player befriends (`npc`). */
export const personSchema = entrySchema(['person', 'npc'], {
  name: text,
  title: text.optional(),
  region: text.optional(),
  text: text.optional(),
  /** Home place, for new people. */
  home: text.optional(),
  group: text.optional(),
  faith: text.optional(),
});

export const groupSchema = entrySchema('group', {
  name: text,
  type: text.optional(),
  description: text.optional(),
  region: text.optional(),
  world: text.optional(),
  seat: text.optional(),
});

export const faithSchema = entrySchema('faith', {
  name: text,
  domain: text.optional(),
  text: text.optional(),
  /** Usually a list of rank names. One Allora I faith keys them by path instead. */
  ranks: z.union([z.array(text), z.record(z.string(), z.unknown())]).optional(),
  sites: z.array(text).optional(),
});

export const schoolSchema = entrySchema('school', {
  name: text,
  skills: z.array(text).optional(),
  text: text.optional(),
  place: text.optional(),
});

/** An item, or a quality variant of one. */
export const itemSchema = entrySchema(['item', 'item_variant'], {
  name: text,
  /** Missing on 24 Allora I variants whose value is not a number in the game. */
  value: z.number().nonnegative().optional(),
  type: text.optional(),
  description: text.optional(),
  base: text.optional(),
  tier: z.number().int().optional(),
});

const rankSchema = z.looseObject({ name: text, trial: text.optional() });

/** A local post: a trade lived in one place (design bible, Local posts). New to Allora II. */
export const postSchema = entrySchema('post', {
  name: text,
  trade: text,
  place: text,
  /** The ladder: exactly four ranks, lowest first. */
  ranks: z.array(rankSchema).length(4),
  patron: text.optional(),
  group: text.optional(),
});

/** Any other kind (workings, skills, recipes, lore, Weathers, …): the base fields only, for now. */
export const otherSchema = entrySchema(null, {});

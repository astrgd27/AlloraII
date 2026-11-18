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

const rankSchema = z.looseObject({
  name: text,
  trial: text.optional(),
  /** Pay for an hour's work at this rank, in pf. */
  pay: z.number().nonnegative().optional(),
  /** Dues to the post's guild each season at this rank, in pf. */
  dues: z.number().nonnegative().optional(),
});

const approachSchema = z.looseObject({
  id: text,
  name: text,
  /** Added to the case's difficulty. */
  dc: z.number().int(),
  /** A bold way: harder, and better if it comes off. */
  bold: z.boolean().optional(),
  /** A technique: open only from this rank (0 to 3). */
  rank: z.number().int().min(0).max(3).optional(),
  /** Extra quality when it comes off. */
  quality: z.number().int().min(0).max(3).optional(),
});
const workStepSchema = z.looseObject({
  id: text,
  name: text,
  hours: z.number().int().min(1),
  /** An accusation: surer for every clue found, and costly if wrong. */
  accuse: z.boolean().optional(),
  approaches: z.array(approachSchema).min(1),
});

/** A local post: a trade lived in one place (design bible, Local posts). New to Allora II. */
export const postSchema = entrySchema('post', {
  name: text,
  trade: text,
  place: text,
  /** The ladder: exactly four ranks, lowest first. */
  ranks: z.array(rankSchema).length(4),
  patron: text.optional(),
  group: text.optional(),
  /** The steps of a case in this post, each a check with one or more approaches. */
  work: z.array(workStepSchema).min(3).max(6).optional(),
  /** Bars or stuff a case is made from: one is used each case, the best carried. */
  materials: z.array(z.object({ item: text, quality: z.number().int().min(0).max(3) })).optional(),
  /** The household's harmony is kept, and felt in each case. */
  harmony: z.boolean().optional(),
  /** A case left open loses a clue every `every` days after `grace` days. */
  pressure: z.object({ grace: z.number().int().min(1), every: z.number().int().min(1) }).optional(),
});

/** A case: a venture offered to those who hold a post. A trial names the rank it wins. */
export const caseSchema = entrySchema('case', {
  name: text,
  text: text,
  post: text,
  /** The base difficulty of every step. */
  dc: z.number().int().min(5).max(35),
  /** The lowest rank (0 to 3) it is offered to. */
  rank: z.number().int().min(0).max(3).optional(),
  /** For a trial: the rank (1 to 3) it wins. */
  trial_for: z.number().int().min(1).max(3).optional(),
});

const hourOfDay = z.number().int().min(0).max(23);

/** A short act tied to a place and an hour (design bible, Micro-activities). New to Allora II. */
export const activitySchema = entrySchema('activity', {
  name: text,
  text: text,
  place: text,
  /** The sub-place of `place` where it is done. */
  sub: text.optional(),
  /** The hours of the day between which it can be begun. */
  from: hourOfDay,
  to: hourOfDay,
  /** How long it takes. */
  hours: z.number().int().min(1).max(12),
  /** Season indexes (0 spring to 3 winter) it belongs to. All, if left out. */
  seasons: z.array(z.number().int().min(0).max(3)).optional(),
  skill: text.optional(),
  /** Only while this feast is on. */
  feast: text.optional(),
  /** What it pays when done, in pf. */
  pay: z.number().nonnegative().optional(),
  /** If set, finishing it is a check against this difficulty. */
  dc: z.number().int().min(5).max(35).optional(),
  effects: z
    .object({
      vigour: z.number().optional(),
      health: z.number().optional(),
      spirits: z.number().optional(),
    })
    .optional(),
});

/** A market: hours, a market day, and what the place makes. What it sells comes from canon. */
export const marketSchema = entrySchema('market', {
  name: text,
  place: text,
  sub: text.optional(),
  from: hourOfDay,
  to: z.number().int().min(1).max(24),
  /** The weekday (1 to 7) of its market day. */
  day: z.number().int().min(1).max(7),
  /** Item ids the place makes itself: plentiful there. */
  makes: z.array(text).optional(),
});

/** A tool: an item that helps a skill's work and wears out with it. New to Allora II. */
export const toolSchema = entrySchema('tool', {
  item: text,
  skill: text,
  /** Added to the roll of that skill's checks. */
  edge: z.number().int().min(1).max(5),
  /** Hours of work before it is spent. */
  wear: z.number().int().min(10),
  text: text,
});

/** A feast: days of a season when a place keeps holiday. From Allora I's fixed events. */
export const feastSchema = entrySchema('feast', {
  name: text,
  place: text,
  sub: text.optional(),
  canon_event: text,
  season: z.number().int().min(0).max(3),
  from: z.number().int().min(1).max(28),
  to: z.number().int().min(1).max(28),
  text: text,
});

/** Any other kind (workings, skills, recipes, lore, Weathers, …): the base fields only, for now. */
export const otherSchema = entrySchema(null, {});

/**
 * Which Allora I data tables become which canon kinds, and how their short
 * field names read in YAML. Only the top-level fields listed in `rename` are
 * renamed; every other field is kept exactly as Allora I names it.
 */

export interface KindDef {
  /** Output file: content/canon/allora1/<file>.yaml */
  file: string;
  /** The `kind` written on every entry. */
  kind: string;
  /** The Allora I table the entries come from. */
  table: string;
  /** What the table holds, for the report. */
  about: string;
  /** Top-level field renames, Allora I name → YAML name. */
  rename: Record<string, string>;
  /** Keep only some entries of the table (used to split items from their variants). */
  filter?: (id: string, raw: Record<string, unknown>) => boolean;
}

const NAME_ICON = { n: 'name', i: 'icon' };

/** An item is a variant when it names a different base item (a quality grade of it). */
export const isItemVariant = (id: string, raw: Record<string, unknown>): boolean =>
  typeof raw.base === 'string' && raw.base !== id;

export const KINDS: KindDef[] = [
  {
    file: 'places',
    kind: 'place',
    table: 'LOCS',
    about: 'Places, with their sub-places (SUBS and HIDDEN_SUBS) nested as `subs`',
    rename: { ...NAME_ICON, desc: 'description', reg: 'region' },
  },
  {
    file: 'regions',
    kind: 'region',
    table: 'REGIONS',
    about: 'Map regions: one per realm, with its gate place and land (`world`)',
    rename: { ...NAME_ICON, wx: 'map_x', wy: 'map_y' },
  },
  {
    file: 'realms',
    kind: 'realm',
    table: 'REALMS',
    about: 'Realm codex entries',
    rename: { ...NAME_ICON },
  },
  {
    file: 'people',
    kind: 'person',
    table: 'PEOPLE',
    about: 'Named people of the world: rulers, heads of houses and orders',
    rename: { ...NAME_ICON, t: 'title', reg: 'region' },
  },
  {
    file: 'npcs',
    kind: 'npc',
    table: 'NPCS',
    about: 'People the player can meet and befriend, with schedules and three-step stories',
    rename: { ...NAME_ICON, t: 'title', reg: 'region' },
  },
  {
    file: 'groups',
    kind: 'group',
    table: 'FACTIONS',
    about: 'Organisations: realms, guilds, orders, cults, houses, courts and more',
    rename: { ...NAME_ICON, t: 'type', d: 'description', reg: 'region', w: 'world' },
  },
  {
    file: 'faiths',
    kind: 'faith',
    table: 'DEITIES',
    about: 'Gods and their faiths, ranks, ways and boons',
    rename: {
      ...NAME_ICON,
      true: 'true_name',
      dom: 'domain',
      org: 'organisation',
      joinReq: 'join_requires',
    },
  },
  {
    file: 'schools',
    kind: 'school',
    table: 'MAGIC_SYSTEMS',
    about: 'Schools of magic and the skills they train',
    rename: { ...NAME_ICON, sk: 'skills' },
  },
  {
    file: 'workings',
    kind: 'working',
    table: 'SPELLS',
    about: 'Workings (spells) of every school',
    rename: { ...NAME_ICON, s: 'skill', lv: 'level', d: 'description' },
  },
  {
    file: 'skills',
    kind: 'skill',
    table: 'SK',
    about: 'Skills, with their category (from CATS)',
    rename: { ...NAME_ICON, d: 'description', cat: 'category', ord: 'order', req: 'requires' },
  },
  {
    file: 'skill_categories',
    kind: 'skill_category',
    table: 'CATS',
    about: 'Skill categories',
    rename: { ...NAME_ICON },
  },
  {
    file: 'items',
    kind: 'item',
    table: 'ITEMS',
    about: 'Items that are not a quality variant of another item',
    rename: { ...NAME_ICON, v: 'value', t: 'type', d: 'description', q: 'quality' },
    filter: (id, raw) => !isItemVariant(id, raw),
  },
  {
    file: 'item_variants',
    kind: 'item_variant',
    table: 'ITEMS',
    about: 'Quality variants of items (each names its `base` item)',
    rename: { ...NAME_ICON, v: 'value', t: 'type', d: 'description', q: 'quality' },
    filter: isItemVariant,
  },
  {
    file: 'recipes',
    kind: 'recipe',
    table: 'RECIPES',
    about: 'Recipes: skill, level, inputs, outputs and hours',
    rename: {
      ...NAME_ICON,
      sk: 'skill',
      lv: 'level',
      in: 'inputs',
      out: 'outputs',
      dur: 'duration',
      req: 'requires',
    },
  },
  {
    file: 'careers',
    kind: 'career',
    table: 'CAREERS',
    about: 'Careers and their ranks',
    rename: { ...NAME_ICON, fac: 'group', desc: 'description' },
  },
  {
    file: 'lore',
    kind: 'lore',
    table: 'LORE',
    about: 'Lore entries (the codex of the world)',
    rename: { ...NAME_ICON },
  },
  {
    file: 'guide',
    kind: 'guide',
    table: 'GUIDE',
    about: 'Guide entries (how-to-play text)',
    rename: { ...NAME_ICON },
  },
];

/** Every table the extractor reads from the page, including helper tables. */
export const TABLES = [...new Set([...KINDS.map((k) => k.table), 'SUBS', 'HIDDEN_SUBS', 'CATS'])];

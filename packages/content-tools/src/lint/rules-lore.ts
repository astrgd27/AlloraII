/**
 * The lore lint: banned words, the world rules and the voice of game text.
 * It reads new content only. Canon text is what it is.
 * The world-rule checks are patterns, so they catch the plain cases; the
 * `/lore-check` command and review catch the subtle ones.
 */
import { BANNED } from './banned-words';
import { isRecord, type Loaded, type Problem } from './types';

/** Fields that hold ids or data, not words shown to the player. */
const NOT_TEXT = new Set([
  'id',
  'origin',
  'kind',
  'roots',
  'icon',
  'region',
  'realm',
  'world',
  'place',
  'home',
  'group',
  'faith',
  'seat',
  'school',
  'base',
  'trade',
  'type',
  'skill',
  'skills',
  'gate',
  'people',
  'sub',
]);

/** Every piece of game text in an entry, with the path of its field. */
export function textFields(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => textFields(v, `${path}[${i}]`));
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([k, v]) =>
    NOT_TEXT.has(k) ? [] : textFields(v, path ? `${path}.${k}` : k),
  );
}

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRegex = (word: string): RegExp =>
  new RegExp(`(?<![\\p{L}\\p{N}])${escape(word).replace(/ /g, '\\s+')}(?![\\p{L}\\p{N}])`, 'iu');

const BANNED_REGEX = BANNED.flatMap((group) =>
  group.list.map((word) => ({ word, regex: wordRegex(word), code: group.code, why: group.why })),
);

interface Pattern {
  code: string;
  regex: RegExp;
  message: string;
  /** Text that makes the pattern allowed. */
  unless?: RegExp;
}

const GAP = '[^.!?]{0,60}';

const WORLD_RULES: Pattern[] = [
  {
    code: 'witch-magic',
    regex: new RegExp(
      `\\b(learn|learns|learned|learnt|teach|teaches|taught|study|studies|master|masters|train|trains)\\b${GAP}\\bwitch(es)?[- ]?(magic|craft|art|arts|working|workings)?\\b|\\bwitch[- ]?(magic|craft)\\b${GAP}\\b(lesson|lessons|apprentice|pupil|taught|learn)`,
      'i',
    ),
    message: 'Text seems to offer witch magic to the player. The player can never learn it.',
  },
  {
    code: 'mystery-resolved',
    regex: new RegExp(
      `\\bthe (Lease|Ring|Hum)\\b${GAP}\\b(was (made|raised|built|caused|created|begun|sung) by|is (really|truly|in truth|in fact|nothing but)|comes from|came from|truth (of|behind|is)|origin (is|was)|the answer)\\b|\\b(truth|origin|secret|maker|cause) (of|behind) the (Lease|Ring|Hum)\\b${GAP}\\b(is|was|lies)\\b`,
      'i',
    ),
    message:
      'Text seems to resolve a mystery that stays unresolved (the Lease, the Ring, the Hum).',
  },
  {
    code: 'augury-hint',
    regex: new RegExp(
      `\\b(augur\\w*|divin\\w*|omen|omens|scry\\w*|foretell\\w*|prophec\\w*)\\b${GAP}\\b(will (happen|come|win|lose|die|rise|fall|arrive)|tomorrow|next (week|season|year)|shows you (what|who|where))\\b`,
      'i',
    ),
    unless: /\bNim\b/,
    message: 'Text seems to give a hint about the future of play. Only Nim’s dreams may.',
  },
  {
    code: 'minor-romance',
    regex: new RegExp(
      `\\b(romance|lover|lovers|courts?|courting|kiss\\w*|betroth\\w*|woo\\w*|seduc\\w*)\\b${GAP}\\b(child|children|girl of \\d|boy of \\d|aged? (\\d|1[0-7])\\b|(\\d|1[0-7])[- ]years?[- ]old)`,
      'i',
    ),
    message: 'Text seems to tie romance to someone under adult age.',
  },
];

const EMOJI = /\p{Extended_Pictographic}/u;
const MAX_SENTENCE_WORDS = 45;

export function lintLore(additions: Loaded[]): Problem[] {
  const problems: Problem[] = [];
  for (const { entry, file } of additions) {
    const add = (code: string, message: string, severity: Problem['severity'] = 'error') =>
      problems.push({ rule: 'lore', code, severity, file, id: entry.id, message });

    for (const { path, text } of textFields(entry)) {
      for (const b of BANNED_REGEX) {
        if (b.regex.test(text)) add(b.code, `\`${path}\` uses "${b.word}", ${b.why}.`);
      }
      for (const rule of WORLD_RULES) {
        if (rule.regex.test(text) && !rule.unless?.test(text))
          add(rule.code, `\`${path}\`: ${rule.message}`);
      }
      if (EMOJI.test(text)) add('emoji', `\`${path}\` has an emoji. Game text has none.`);
      const longest = Math.max(
        ...text.split(/[.!?]+\s/).map((s) => s.trim().split(/\s+/).filter(Boolean).length),
      );
      if (longest > MAX_SENTENCE_WORDS) {
        add(
          'long-sentence',
          `\`${path}\` has a sentence of ${longest} words. Keep game text short.`,
          'warning',
        );
      }
    }

    // Romance is between adults only: a person open to romance must be marked adult.
    if (entry.romance !== undefined && entry.romance !== false) {
      const age = typeof entry.age === 'number' ? entry.age : undefined;
      if (age !== undefined && age < 18)
        add('minor-romance', `Romance is set on a person aged ${age}.`);
      else if (age === undefined && entry.adult !== true) {
        add(
          'minor-romance',
          'Romance is set, but the person has no `age` of 18 or more and no `adult: true`.',
        );
      }
    }
    // The player can never learn witch magic.
    if (entry.kind === 'school' && entry.witch === true && entry.learnable !== false) {
      add('witch-magic', 'A witch school must be marked `learnable: false`.');
    }
  }
  return problems;
}

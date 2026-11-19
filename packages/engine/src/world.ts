/** The world the engine travels: places and the roads between them. */
import data from './generated/world.json';

export interface Place {
  id: string;
  name: string;
  region: string;
  /** Position within its region, 0 to 100. */
  x: number;
  y: number;
  kind: 'city' | 'settled' | 'wild';
  /** True for a place of Allora I; false for one Allora II adds. */
  canon?: boolean;
  /** Sub-place id → its name. */
  subs?: Record<string, string>;
}

/** A thing that can be carried, bought and sold. */
export interface Item {
  id: string;
  name: string;
  /** Its worth in pf, before demand. */
  value: number;
  food?: boolean;
  /** Its kind: food, tool, wear, goods, raw... */
  type?: string;
}

/** A school of magic made playable. */
export interface Art {
  id: string;
  name: string;
  skill: string;
  place: string;
  library: string;
  hall: string;
  matriculate: { fee: number; skill: string; level: number };
  degrees: { name: string; level?: number; dc?: number }[];
  focus?: string;
}

/** A working of an art. */
export interface Proof {
  id: string;
  art: string;
  name: string;
  level: number;
  fee: number;
  will: number;
  ink: Record<string, number>;
  boost: { skills: string[]; value: number; hours: number };
}

/** Where a new life is born, and what it already knows. */
export interface Upbringing {
  id: string;
  name: string;
  place: string;
  skills: Record<string, number>;
  /** Legend the Tapestry asks to open it; 0 is open from the start. */
  legend: number;
  names: string[];
}

/** How a faith is played: joining, ranks by devotion, its aspects. */
export interface Rite {
  id: string;
  faith: string;
  name: string;
  join: { skill: string; level: number };
  thresholds: number[];
  aspects: {
    id: string;
    place: string;
    sub: string;
    skills?: string[];
    offerings?: boolean;
    boon_skills: string[];
    /** The canon names of the ranks. */
    ranks: string[];
  }[];
}

/** A feast: days of a season when a place keeps holiday. */
export interface Feast {
  id: string;
  name: string;
  place: string;
  sub?: string;
  season: number;
  from: number;
  to: number;
  text: string;
}

/** A tool: an item that helps one skill's work and wears out with it. */
export interface Tool {
  id: string;
  item: string;
  skill: string;
  /** Added to the roll of that skill's checks. */
  edge: number;
  /** Hours of work before it is spent. */
  wear: number;
  text: string;
}

/** A market: where it stands, when it is open, and what it trades in. */
export interface Market {
  id: string;
  name: string;
  place: string;
  sub?: string;
  /** Open between these hours of the day. */
  from: number;
  to: number;
  /** The weekday (1 to 7) of its market day. */
  day: number;
  sells: string[];
  /** Of what it sells, what the place makes itself. */
  makes: string[];
}

export interface Road {
  id: string;
  from: string;
  to: string;
  way: 'street' | 'road' | 'track' | 'sea' | 'river';
  hours: number;
  /** The named route this segment belongs to, if it has one. */
  route?: string;
}

/** A named road, track or river. */
export interface NamedRoute {
  id: string;
  name: string;
  text: string;
  /** Paid on each stretch of it, if it is tolled. */
  toll?: number;
}

/** Something that can happen on the way. */
export interface RoadEvent {
  id: string;
  text: string;
  /** The kinds of way it belongs to. */
  ways: Road['way'][];
  effects: { vigour?: number; health?: number; spirits?: number };
}

/** A short act tied to a place and an hour. */
export interface Activity {
  id: string;
  name: string;
  text: string;
  place: string;
  sub?: string;
  subName?: string;
  /** The hours of the day between which it can be begun. */
  from: number;
  to: number;
  /** How long it takes. */
  hours: number;
  /** Season indexes it belongs to; all, if left out. */
  seasons?: number[];
  skill?: string;
  /** What it pays when done, in pf. */
  pay?: number;
  /** Only while this feast is on. */
  feast?: string;
  /** Only for those who keep this faith. */
  faith?: string;
  effects: { vigour?: number; health?: number; spirits?: number };
  /** How hard it is, as a skill level. 1 if left out. */
  level?: number;
  /** If set, finishing it is a check against this difficulty. */
  dc?: number;
  /** If set, only for a life that holds this post. */
  post?: string;
  /** Standing with the post's employer gained when it is done. */
  standing?: number;
}

export interface Approach {
  id: string;
  name: string;
  /** Added to the case's difficulty. */
  dc: number;
  /** A bold way: harder, and better if it comes off. */
  bold?: boolean;
  /** A technique: open only from this rank. */
  rank?: number;
  /** Extra quality when it comes off. */
  quality?: number;
  /** A way by magic: open to those who know the art, rolled with this skill. */
  magic?: string;
}

export interface WorkStep {
  id: string;
  name: string;
  hours: number;
  /** An accusation: surer for every clue found, and costly if wrong. */
  accuse?: boolean;
  approaches: Approach[];
}

/** A post: a trade lived in one place, with a ladder of four ranks. */
export interface Post {
  id: string;
  name: string;
  skill: string;
  place: string;
  sub?: string;
  ranks: string[];
  /** Pay for an hour's work at each rank, in pf. */
  pay?: number[];
  /** Dues each season at each rank, where the post has a guild. */
  dues?: number[];
  work: WorkStep[];
  /** Bars or stuff a case is made from: one is used each case, the best carried. */
  materials?: { item: string; quality: number }[];
  /** The household's harmony is kept. */
  harmony?: boolean;
  /** A case left open loses a clue every `every` days after `grace` days. */
  pressure?: { grace: number; every: number };
}

/** A case: a venture offered to those who hold a post. */
export interface Case {
  id: string;
  name: string;
  text: string;
  post: string;
  /** The base difficulty of every step. */
  dc: number;
  /** The lowest rank (0 to 3) it is offered to. */
  rank?: number;
  /** For a trial: the rank (1 to 3) it wins. */
  trialFor?: number;
}

/** One line of a person's day: where they are, in which hours and seasons. */
export interface SchedEntry {
  /** [place, sub-place] */
  at: [string, string];
  /** [from, to) hours of the day; may wrap past midnight. Always, if left out. */
  h?: [number, number];
  /** Season indexes. All, if left out. */
  s?: number[];
}

/** A person who keeps a routine. */
export interface Person {
  id: string;
  name: string;
  title: string;
  /** How they look before you know their name. */
  hint: string;
  /** What happens when you first meet. */
  meet: string;
  /** Things they say once you know them. */
  talk: string[];
  sched: SchedEntry[];
  /** Tastes in gifts: item ids, or kinds of item (food, tool, wear...). Canon people have them. */
  love?: string[];
  like?: string[];
  dislike?: string[];
  hate?: string[];
  /** What they tell a friend, at each tier of friendship past the first. */
  tiers?: string[];
}

export interface WorldData {
  regions: { id: string; name: string }[];
  places: Place[];
  roads: Road[];
  activities?: Activity[];
  people?: Person[];
  skills?: { id: string; name: string; family: string }[];
  routes?: NamedRoute[];
  posts?: Post[];
  cases?: Case[];
  roadEvents?: RoadEvent[];
  items?: Item[];
  markets?: Market[];
  tools?: Tool[];
  feasts?: Feast[];
  rites?: Rite[];
  arts?: Art[];
  proofs?: Proof[];
  upbringings?: Upbringing[];
}

export const WORLD = data as unknown as WorldData;

/** Where a new life begins: Ostwick, in Eintenn, as in Allora I. */
export const START_PLACE = 'ostwick';

/** One leg of a journey: a road, and the place it leads to. */
export interface Leg {
  road: string;
  to: string;
  hours: number;
  /** True on water (a sea lane or a river): the life is a passenger and can sleep aboard. */
  sea?: true;
  way?: Road['way'];
  /** What it costs to pass: a toll on a tolled road, a fare by boat. */
  cost?: number;
}

export interface Route {
  legs: Leg[];
  hours: number;
}

/** A boat fare: so much an hour aboard, and never less than this. */
export const FARE = { perHour: 0.05, least: 0.2 };
const round2 = (n: number): number => Math.round(n * 100) / 100;

/** What a way costs to travel: tolls and fares, leg by leg. */
export const costOf = (legs: Leg[]): number => round2(legs.reduce((n, l) => n + (l.cost ?? 0), 0));

export class World {
  private static default: World | undefined;

  /** The one world every engine shares unless given another: its routes are worked out once. */
  static shared(): World {
    return (World.default ??= new World());
  }

  readonly places = new Map<string, Place>();
  readonly activities = new Map<string, Activity>();
  readonly people = new Map<string, Person>();
  readonly posts = new Map<string, Post>();
  readonly cases = new Map<string, Case>();
  readonly items = new Map<string, Item>();
  /** Place id → its market. */
  readonly markets = new Map<string, Market>();
  /** Skill id → the tools that help it. */
  readonly toolsBySkill = new Map<string, Tool[]>();
  readonly feasts = new Map<string, Feast>();
  /** Faith id → how it is played. */
  readonly rites = new Map<string, Rite>();
  readonly arts = new Map<string, Art>();
  readonly proofs = new Map<string, Proof>();
  readonly upbringings = new Map<string, Upbringing>();
  private readonly links = new Map<string, Leg[]>();
  /** The roads do not change, so travel hours from a place are worked out once. */
  private readonly treeCache = new Map<
    string,
    { hours: Record<string, number>; costs: Record<string, number> }
  >();

  constructor(readonly data: WorldData = WORLD) {
    for (const place of data.places) {
      this.places.set(place.id, place);
      this.links.set(place.id, []);
    }
    for (const activity of data.activities ?? []) this.activities.set(activity.id, activity);
    for (const person of data.people ?? []) this.people.set(person.id, person);
    for (const post of data.posts ?? []) this.posts.set(post.id, post);
    for (const c of data.cases ?? []) this.cases.set(c.id, c);
    for (const item of data.items ?? []) this.items.set(item.id, item);
    for (const market of data.markets ?? []) this.markets.set(market.place, market);
    for (const feast of data.feasts ?? []) this.feasts.set(feast.id, feast);
    for (const rite of data.rites ?? []) this.rites.set(rite.faith, rite);
    for (const art of data.arts ?? []) this.arts.set(art.id, art);
    for (const proof of data.proofs ?? []) this.proofs.set(proof.id, proof);
    for (const u of data.upbringings ?? []) this.upbringings.set(u.id, u);
    for (const tool of data.tools ?? []) {
      const list = this.toolsBySkill.get(tool.skill) ?? [];
      list.push(tool);
      this.toolsBySkill.set(tool.skill, list);
    }
    for (const road of data.roads) {
      const water = road.way === 'sea' || road.way === 'river';
      const toll = (data.routes ?? []).find((r) => r.id === road.route)?.toll ?? 0;
      const cost = round2(toll + (water ? Math.max(FARE.least, FARE.perHour * road.hours) : 0));
      const extra = {
        way: road.way,
        ...(water ? ({ sea: true } as const) : {}),
        ...(cost > 0 ? { cost } : {}),
      };
      this.links.get(road.from)?.push({ road: road.id, to: road.to, hours: road.hours, ...extra });
      this.links.get(road.to)?.push({ road: road.id, to: road.from, hours: road.hours, ...extra });
    }
  }

  /** The quickest way between two places (Dijkstra), or undefined if there is none. */
  route(from: string, to: string): Route | undefined {
    if (!this.places.has(from) || !this.places.has(to)) return undefined;
    const best = new Map<string, number>([[from, 0]]);
    const cameBy = new Map<string, { from: string; leg: Leg }>();
    const open = new Set([from]);
    const done = new Set<string>();
    while (open.size > 0) {
      let current: string | undefined;
      for (const id of open) {
        if (current === undefined || (best.get(id) ?? Infinity) < (best.get(current) ?? Infinity)) {
          current = id;
        }
      }
      if (current === undefined) break;
      open.delete(current);
      done.add(current);
      if (current === to) break;
      for (const leg of this.links.get(current) ?? []) {
        if (done.has(leg.to)) continue;
        const hours = (best.get(current) ?? 0) + leg.hours;
        if (hours < (best.get(leg.to) ?? Infinity)) {
          best.set(leg.to, hours);
          cameBy.set(leg.to, { from: current, leg });
          open.add(leg.to);
        }
      }
    }
    if (!done.has(to)) return undefined;
    const legs: Leg[] = [];
    for (let at = to; at !== from;) {
      const step = cameBy.get(at);
      if (!step) return undefined;
      legs.unshift(step.leg);
      at = step.from;
    }
    return { legs, hours: best.get(to) ?? 0 };
  }

  /**
   * One search from a place to all others (Dijkstra by hours): the hours and the
   * tolls and fares of the quickest way to each. Worked out once per place.
   */
  private tree(from: string): { hours: Record<string, number>; costs: Record<string, number> } {
    const known = this.treeCache.get(from);
    if (known) return known;
    const hours: Record<string, number> = { [from]: 0 };
    const costs: Record<string, number> = { [from]: 0 };
    const open = new Set([from]);
    const done = new Set<string>();
    while (open.size > 0) {
      let current: string | undefined;
      for (const id of open) {
        if (current === undefined || (hours[id] ?? Infinity) < (hours[current] ?? Infinity))
          current = id;
      }
      if (current === undefined) break;
      open.delete(current);
      done.add(current);
      for (const leg of this.links.get(current) ?? []) {
        if (done.has(leg.to)) continue;
        const h = (hours[current] ?? 0) + leg.hours;
        if (h < (hours[leg.to] ?? Infinity)) {
          hours[leg.to] = h;
          costs[leg.to] = round2((costs[current] ?? 0) + (leg.cost ?? 0));
          open.add(leg.to);
        }
      }
    }
    const result = { hours, costs };
    this.treeCache.set(from, result);
    return result;
  }

  /** What it costs to travel from one place to every place that can be reached. */
  costsFrom(from: string): Record<string, number> {
    return this.places.has(from) ? this.tree(from).costs : {};
  }

  /** Travel hours from one place to every place that can be reached. */
  hoursFrom(from: string): Record<string, number> {
    return this.places.has(from) ? this.tree(from).hours : {};
  }
}

/** Whether a feast is on, on a date. */
export const feastOn = (feast: Feast, date: { seasonIndex: number; day: number }): boolean =>
  date.seasonIndex === feast.season && date.day >= feast.from && date.day <= feast.to;

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
}

export interface WorkStep {
  id: string;
  name: string;
  hours: number;
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
  work: WorkStep[];
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
}

export interface Route {
  legs: Leg[];
  hours: number;
}

export class World {
  readonly places = new Map<string, Place>();
  readonly activities = new Map<string, Activity>();
  readonly people = new Map<string, Person>();
  readonly posts = new Map<string, Post>();
  readonly cases = new Map<string, Case>();
  readonly items = new Map<string, Item>();
  /** Place id → its market. */
  readonly markets = new Map<string, Market>();
  private readonly links = new Map<string, Leg[]>();
  /** The roads do not change, so travel hours from a place are worked out once. */
  private readonly hoursCache = new Map<string, Record<string, number>>();

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
    for (const road of data.roads) {
      const water = road.way === 'sea' || road.way === 'river';
      const extra = { way: road.way, ...(water ? ({ sea: true } as const) : {}) };
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

  /** Travel hours from one place to every place that can be reached. */
  hoursFrom(from: string): Record<string, number> {
    const known = this.hoursCache.get(from);
    if (known) return known;
    const out: Record<string, number> = {};
    for (const id of this.places.keys()) {
      const route = this.route(from, id);
      if (route) out[id] = route.hours;
    }
    this.hoursCache.set(from, out);
    return out;
  }
}

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
  /** Sub-place id → its name. */
  subs?: Record<string, string>;
}

export interface Road {
  id: string;
  from: string;
  to: string;
  way: 'street' | 'road' | 'track' | 'sea';
  hours: number;
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
  effects: { vigour?: number; health?: number; spirits?: number };
  /** How hard it is, as a skill level. 1 if left out. */
  level?: number;
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
}

export const WORLD = data as unknown as WorldData;

/** Where a new life begins: Ostwick, in Eintenn, as in Allora I. */
export const START_PLACE = 'ostwick';

/** One leg of a journey: a road, and the place it leads to. */
export interface Leg {
  road: string;
  to: string;
  hours: number;
  /** True for a sea lane: the life is a passenger and can sleep aboard. */
  sea?: true;
}

export interface Route {
  legs: Leg[];
  hours: number;
}

export class World {
  readonly places = new Map<string, Place>();
  readonly activities = new Map<string, Activity>();
  readonly people = new Map<string, Person>();
  private readonly links = new Map<string, Leg[]>();

  constructor(readonly data: WorldData = WORLD) {
    for (const place of data.places) {
      this.places.set(place.id, place);
      this.links.set(place.id, []);
    }
    for (const activity of data.activities ?? []) this.activities.set(activity.id, activity);
    for (const person of data.people ?? []) this.people.set(person.id, person);
    for (const road of data.roads) {
      const sea = road.way === 'sea' ? ({ sea: true } as const) : {};
      this.links.get(road.from)?.push({ road: road.id, to: road.to, hours: road.hours, ...sea });
      this.links.get(road.to)?.push({ road: road.id, to: road.from, hours: road.hours, ...sea });
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
    const out: Record<string, number> = {};
    for (const id of this.places.keys()) {
      const route = this.route(from, id);
      if (route) out[id] = route.hours;
    }
    return out;
  }
}

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
}

export interface Road {
  id: string;
  from: string;
  to: string;
  way: 'street' | 'road' | 'track' | 'sea';
  hours: number;
}

export interface WorldData {
  regions: { id: string; name: string }[];
  places: Place[];
  roads: Road[];
}

export const WORLD = data as WorldData;

/** Where a new life begins: Ostwick, in Eintenn, as in Allora I. */
export const START_PLACE = 'ostwick';

/** One leg of a journey: a road, and the place it leads to. */
export interface Leg {
  road: string;
  to: string;
  hours: number;
}

export interface Route {
  legs: Leg[];
  hours: number;
}

export class World {
  readonly places = new Map<string, Place>();
  private readonly links = new Map<string, Leg[]>();

  constructor(readonly data: WorldData = WORLD) {
    for (const place of data.places) {
      this.places.set(place.id, place);
      this.links.set(place.id, []);
    }
    for (const road of data.roads) {
      this.links.get(road.from)?.push({ road: road.id, to: road.to, hours: road.hours });
      this.links.get(road.to)?.push({ road: road.id, to: road.from, hours: road.hours });
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

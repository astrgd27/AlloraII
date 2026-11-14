/**
 * Stub roads. Allora I has no roads inside a realm: you travel straight
 * between any two places. Allora II joins places by roads, so this tool lays a
 * first network over canon places for the owner to redraw.
 *
 * Travel hours come from Allora I's own travel formula (`travelTime` in
 * canon/allora-1.html): distance × 0.38 inside a realm, and
 * 20 + world distance × 1.3 between realms.
 */

export interface MapPlace {
  id: string;
  region: string;
  x: number;
  y: number;
  city?: boolean;
  wild?: boolean;
}

export interface MapRegion {
  id: string;
  map_x: number;
  map_y: number;
  gate: string;
}

export interface Road {
  id: string;
  origin: 'allora2';
  kind: 'road';
  roots: string[];
  from: string;
  to: string;
  /** street: inside one city. road: between settled places. track: to or through the wild. sea: a sea lane. */
  way: 'street' | 'road' | 'track' | 'sea' | 'river';
  hours: number;
}

/** Allora I: `Math.hypot(a.x - b.x, a.y - b.y) * .38`. */
export const HOURS_PER_MAP_UNIT = 0.38;
/** Two city places this close are quarters of one city. */
export const SAME_CITY_DISTANCE = 20;
/** Each place is joined to this many nearest neighbours, besides the spanning tree. */
export const NEAREST_NEIGHBOURS = 2;

const dist = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

export function roadBetween(a: MapPlace, b: MapPlace): Road {
  const [from, to] = a.id < b.id ? [a, b] : [b, a];
  const d = dist(a, b);
  const sameCity = Boolean(a.city && b.city) && d <= SAME_CITY_DISTANCE;
  return {
    id: `road_${from.id}_${to.id}`,
    origin: 'allora2',
    kind: 'road',
    roots: [from.id, to.id],
    from: from.id,
    to: to.id,
    way: sameCity ? 'street' : a.wild || b.wild ? 'track' : 'road',
    hours: sameCity ? 1 : Math.max(1, Math.round(d * HOURS_PER_MAP_UNIT)),
  };
}

/**
 * A network for one region: a minimum spanning tree, so every place can be
 * reached, plus each place's nearest neighbours, so there is more than one way.
 */
export function regionRoads(places: MapPlace[]): Road[] {
  const sorted = [...places].sort((a, b) => a.id.localeCompare(b.id));
  const pairs = new Map<string, [MapPlace, MapPlace]>();
  const add = (a: MapPlace, b: MapPlace) => {
    const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
    pairs.set(key, [a, b]);
  };

  // Prim's algorithm.
  const first = sorted[0];
  if (!first) return [];
  const inTree = new Set([first.id]);
  while (inTree.size < sorted.length) {
    let best: [MapPlace, MapPlace] | undefined;
    let bestD = Infinity;
    for (const a of sorted) {
      if (!inTree.has(a.id)) continue;
      for (const b of sorted) {
        if (inTree.has(b.id)) continue;
        const d = dist(a, b);
        if (d < bestD) {
          bestD = d;
          best = [a, b];
        }
      }
    }
    if (!best) break;
    add(...best);
    inTree.add(best[1].id);
  }

  for (const a of sorted) {
    const nearest = sorted
      .filter((b) => b.id !== a.id)
      .sort((b, c) => dist(a, b) - dist(a, c) || b.id.localeCompare(c.id))
      .slice(0, NEAREST_NEIGHBOURS);
    for (const b of nearest) add(a, b);
  }

  return [...pairs.values()]
    .map(([a, b]) => roadBetween(a, b))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Allora I: `{ x: R.wx + (L.x - 50) * .1, y: R.wy + (L.y - 50) * .1 }` (within one land). */
const worldPos = (p: MapPlace, r: MapRegion) => ({
  x: r.map_x + (p.x - 50) * 0.1,
  y: r.map_y + (p.y - 50) * 0.1,
});

/** A sea lane between the gates of two regions. Allora I: `20 + worldDist(to) * 1.3`. */
export function seaLane(a: MapRegion, b: MapRegion, places: Map<string, MapPlace>): Road {
  const ga = places.get(a.gate);
  const gb = places.get(b.gate);
  if (!ga || !gb) throw new Error(`Gate not found for ${a.id} or ${b.id}`);
  const road = roadBetween(ga, gb);
  return {
    ...road,
    way: 'sea',
    hours: Math.round(20 + dist(worldPos(ga, a), worldPos(gb, b)) * 1.3),
  };
}

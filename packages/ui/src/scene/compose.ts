/**
 * Composes the scene of where a life stands: sky, far ground, buildings, near
 * growth and the figures of the people there (design bible, Scenes). It only
 * arranges what the engine reports. Shapes stand in for the art kits to come.
 */
import type { Snapshot, WorldData } from '@allora/engine';

export interface Shape {
  /** Position and size as shares of the scene, 0 to 1. `y` is the base line. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SceneModel {
  /** Changes when, and only when, the picture should be redrawn. */
  key: string;
  sky: { top: number; bottom: number };
  /** The sun or the moon, and where it stands. */
  light: { kind: 'sun' | 'moon'; x: number; y: number } | null;
  stars: Shape[];
  far: { color: number; ridge: number[] };
  ground: number;
  buildings: (Shape & { roof: boolean; lit: boolean; smoke: boolean })[];
  trees: (Shape & { color: number; bare: boolean })[];
  /** On the way: a road or water across the near ground. */
  way: 'road' | 'water' | null;
  figures: Shape[];
  /** How dark the land is, 0 (noon) to 0.6 (deep night). */
  dusk: number;
  /** Weather over the scene: falling drops or flakes, a fog, a grey sky. */
  weather: { drops: Shape[]; kind: 'rain' | 'snow' | 'none'; fog: number; grey: number };
  /** Bunting for a feast here. */
  bunting: boolean;
  /** The same scene in words, for those who cannot see it. */
  description: string;
}

/** A small repeatable generator, so a place always looks like itself. */
function seeded(text: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const mix = (a: number, b: number, t: number): number => {
  const ch = (shift: number) =>
    Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t) << shift;
  return ch(16) | ch(8) | ch(0);
};

/** Sky colours at key hours of the day: [hour, top, bottom]. */
const SKY: [number, number, number][] = [
  [0, 0x0b1026, 0x1a2140],
  [4, 0x141a38, 0x2c2f55],
  [6, 0x5a6fa8, 0xf2b98a],
  [9, 0x6fa8dc, 0xcfe4f5],
  [15, 0x6fa8dc, 0xd9e9f5],
  [18, 0x4c5fa0, 0xf0a070],
  [20, 0x1d2550, 0x5a4a78],
  [24, 0x0b1026, 0x1a2140],
];

export function skyAt(hour: number): { top: number; bottom: number } {
  const i = SKY.findIndex(([h]) => h > hour);
  const [h0, t0, b0] = SKY[i - 1] ?? SKY[0]!;
  const [h1, t1, b1] = SKY[i] ?? SKY[SKY.length - 1]!;
  const t = h1 === h0 ? 0 : (hour - h0) / (h1 - h0);
  return { top: mix(t0, t1, t), bottom: mix(b0, b1, t) };
}

/** Far hills and near leaves by season: spring, summer, autumn, winter. */
const FAR = [0x8fb58a, 0x6f9e6a, 0xb59a5c, 0xdfe5ea];
const LEAF = [0x7fb069, 0x4f7a55, 0xc9792f, 0x6b5b4b];
const GROUND = [0x9dbb7d, 0x86a868, 0xb3a06a, 0xe9edf0];
const SEASON_WORDS = ['spring', 'summer', 'autumn', 'winter'];

const isNight = (hour: number): boolean => hour >= 20 || hour < 5;
const lampsLit = (hour: number): boolean => hour >= 18 || hour < 6;

export function composeScene(snapshot: Snapshot, world: WorldData): SceneModel {
  const { date, journey } = snapshot;
  const hour = date.hour;
  const season = date.seasonIndex;
  const place = world.places.find((p) => p.id === snapshot.place);
  const kind = journey ? 'wild' : (place?.kind ?? 'settled');
  const leg = journey ? world.roads.find((r) => r.id === journey.road) : undefined;
  const water = leg?.way === 'sea' || leg?.way === 'river';
  const rand = seeded(journey ? journey.road : snapshot.place);

  // The sun crosses from the 6th hour to the 18th; the moon keeps the other half.
  const day = hour >= 6 && hour < 18;
  const along = day ? (hour - 6) / 12 : ((hour + 6) % 24) / 12;
  const light = {
    kind: day ? ('sun' as const) : ('moon' as const),
    x: 0.08 + 0.84 * along,
    y: 0.5 - 0.38 * Math.sin(Math.PI * along),
  };
  const stars: Shape[] = isNight(hour)
    ? Array.from({ length: 40 }, () => ({ x: rand(), y: rand() * 0.5, w: 0.003, h: 0.003 }))
    : [];
  if (!isNight(hour)) for (let i = 0; i < 80; i++) rand();

  const ridge = Array.from({ length: 9 }, () => 0.42 + rand() * 0.14);
  const count = journey ? 0 : kind === 'city' ? 9 : kind === 'settled' ? 4 : 0;
  const lit = lampsLit(hour);
  const hearth = (hour >= 5 && hour < 9) || (hour >= 17 && hour < 22);
  const buildings = Array.from({ length: count }, (_, i) => {
    const w = (kind === 'city' ? 0.07 : 0.09) + rand() * 0.04;
    return {
      x: 0.06 + ((i + rand() * 0.6) / count) * 0.86,
      y: 0.78,
      w,
      h: (kind === 'city' ? 0.2 : 0.12) + rand() * (kind === 'city' ? 0.22 : 0.08),
      roof: rand() < 0.75,
      lit: rand() < 0.8 && lit,
      smoke: rand() < 0.5 && hearth,
    };
  });
  const treeCount = water ? 0 : kind === 'wild' ? 9 : kind === 'settled' ? 5 : 2;
  const trees = Array.from({ length: treeCount }, () => ({
    x: rand(),
    y: 0.8 + rand() * 0.12,
    w: 0.035 + rand() * 0.03,
    h: 0.1 + rand() * 0.1,
    color: mix(LEAF[season] ?? LEAF[0]!, 0x2b2620, rand() * 0.25),
    bare: season === 3,
  }));
  const n = Math.min(snapshot.here.length, 8);
  const figures = Array.from({ length: n }, (_, i) => ({
    x: 0.14 + ((i + 0.5) / Math.max(n, 1)) * 0.72 + (rand() - 0.5) * 0.04,
    y: 0.9,
    w: 0.014,
    h: 0.075,
  }));

  const dusk = isNight(hour) ? 0.6 : hour < 7 || hour >= 18 ? 0.3 : 0;
  const where = journey ? (water ? 'On the water' : 'On the way') : (place?.name ?? snapshot.place);
  const people =
    n === 0
      ? journey
        ? ''
        : ' Nobody is about.'
      : ` ${n === 1 ? 'One person is' : `${n} people are`} here.`;
  const lamps = buildings.some((b) => b.lit) ? ' Lamps are lit.' : '';
  const w = snapshot.weather.id;
  const fall = w === 'rain' || w === 'storm' ? 'rain' : w === 'snow' ? 'snow' : 'none';
  const drops: Shape[] =
    fall === 'none'
      ? []
      : Array.from({ length: fall === 'rain' ? 70 : 50 }, () => ({
          x: rand(),
          y: rand(),
          w: fall === 'rain' ? 0.002 : 0.006,
          h: fall === 'rain' ? 0.06 : 0.006,
        }));
  const weather = {
    drops,
    kind: fall as 'rain' | 'snow' | 'none',
    fog: w === 'fog' ? 0.45 : 0,
    grey:
      w === 'overcast' || w === 'rain' || w === 'storm' || w === 'snow'
        ? w === 'storm'
          ? 0.55
          : 0.35
        : 0,
  };
  const bunting = snapshot.feasts.some((f) => f.here);
  const weatherWords = w === 'fair' ? '' : ` ${snapshot.weather.name}.`;
  const description = `${where}, ${date.dayPart === 'day' ? 'by day' : `at ${date.dayPart}`} in ${SEASON_WORDS[season] ?? ''}.${weatherWords}${lamps}${people}${bunting ? ' A feast is on.' : ''}`;

  return {
    key: `${journey ? journey.road : snapshot.place}|${hour}|${season}|${snapshot.here.length}|${snapshot.weather.id}|${snapshot.feasts.length}`,
    sky: skyAt(hour),
    light,
    stars,
    far: { color: FAR[season] ?? FAR[0]!, ridge },
    ground: water ? 0x3d6f8e : (GROUND[season] ?? GROUND[0]!),
    buildings,
    trees,
    way: journey ? (water ? 'water' : 'road') : null,
    figures,
    dusk,
    weather,
    bunting,
    description,
  };
}

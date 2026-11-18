/**
 * Weather (an Allora II addition: canon gives the Seven none; Polygoetia's
 * Weathers are another matter). Each realm has one weather a day, drawn from
 * its season and its own character, the same for everyone. It slows roads and
 * boats, and lifts or sinks the spirits of those out in it.
 */
import type { GameDate } from './calendar';
import { hashString } from './rng';

export type WeatherId = 'fair' | 'overcast' | 'rain' | 'fog' | 'snow' | 'heat' | 'storm';

export interface Weather {
  id: WeatherId;
  name: string;
  /** Roads and tracks take this many times as long. */
  land: number;
  /** Ways by water take this many times as long; 0 means no boat puts out. */
  water: number;
  /** Spirits each waking hour out of doors (on the way). */
  spirits: number;
  /** Vigour each hour on the way, beyond the usual. */
  vigour: number;
}

export const WEATHERS: Record<WeatherId, Weather> = {
  fair: { id: 'fair', name: 'Fair', land: 1, water: 1, spirits: 0.25, vigour: 0 },
  overcast: { id: 'overcast', name: 'Overcast', land: 1, water: 1, spirits: 0, vigour: 0 },
  rain: { id: 'rain', name: 'Rain', land: 1.3, water: 1.1, spirits: -0.5, vigour: 0 },
  fog: { id: 'fog', name: 'Fog', land: 1.1, water: 1.6, spirits: -0.25, vigour: 0 },
  snow: { id: 'snow', name: 'Snow', land: 1.6, water: 1.2, spirits: -0.5, vigour: -1 },
  heat: { id: 'heat', name: 'Heat', land: 1.1, water: 1, spirits: -0.25, vigour: -1 },
  storm: { id: 'storm', name: 'Storm', land: 1.4, water: 0, spirits: -1, vigour: -1 },
};

/** How often each weather comes, by realm and season (spring, summer, autumn, winter). */
const CLIMATE: Record<string, Partial<Record<WeatherId, number>>[]> = {
  // A northern duchy: wet springs, snowy winters.
  eintenn: [
    { fair: 4, overcast: 3, rain: 4, fog: 1, storm: 1 },
    { fair: 7, overcast: 2, rain: 2, heat: 2, storm: 1 },
    { fair: 3, overcast: 4, rain: 4, fog: 2, storm: 1 },
    { overcast: 4, snow: 5, fog: 2, rain: 1, fair: 2 },
  ],
  // A lagoon republic: fogs on the water, summer heat, winter storms off the sea.
  marre: [
    { fair: 5, overcast: 2, rain: 2, fog: 3, storm: 1 },
    { fair: 7, heat: 4, overcast: 1, storm: 1 },
    { fair: 4, overcast: 3, rain: 3, fog: 3, storm: 1 },
    { overcast: 4, fog: 4, rain: 3, storm: 2, fair: 2 },
  ],
};

/** The weather of a realm on a day. The same for every life in the world. */
export function weatherOf(region: string, date: GameDate): Weather {
  const table = CLIMATE[region]?.[date.seasonIndex] ?? { fair: 1 };
  const entries = Object.entries(table) as [WeatherId, number][];
  const total = entries.reduce((n, [, w]) => n + w, 0);
  const roll = (hashString(`${region}:${date.year}:${date.dayOfYear}`) % 10000) / 10000;
  let at = roll * total;
  for (const [id, w] of entries) {
    at -= w;
    if (at < 0) return WEATHERS[id];
  }
  return WEATHERS.fair;
}

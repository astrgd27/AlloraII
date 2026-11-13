/** Words for the clock. Display only. */
import type { GameDate } from '@allora/engine';

const DAY_PART_WORDS: Record<GameDate['dayPart'], string> = {
  night: 'Night',
  dawn: 'Dawn',
  day: 'Day',
  dusk: 'Dusk',
};

export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

export const formatDate = (d: GameDate): string => `Day ${d.day} of ${d.season}, ${d.year} AR`;

export function formatHour(d: GameDate): string {
  if (d.hour === 0) return 'Midnight';
  if (d.hour === 12) return 'Noon';
  return `${DAY_PART_WORDS[d.dayPart]}, the ${ordinal(d.hour)} hour`;
}

/** "7 hours", or "2 days, 3 hours" for a long road. */
export function hoursText(hours: number): string {
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  const h = `${rest} ${rest === 1 ? 'hour' : 'hours'}`;
  if (days === 0) return h;
  const d = `${days} ${days === 1 ? 'day' : 'days'}`;
  return rest === 0 ? d : `${d}, ${h}`;
}

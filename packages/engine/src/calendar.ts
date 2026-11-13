/**
 * The calendar: 24 hours to a day, 7 days to a week, 28 days to a season and
 * four seasons (112 days) to a year. Time is counted in whole game hours since
 * the start of play.
 */

export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;
export const DAYS_PER_SEASON = 28;
export const SEASONS_PER_YEAR = 4;
export const DAYS_PER_YEAR = DAYS_PER_SEASON * SEASONS_PER_YEAR;
export const HOURS_PER_YEAR = DAYS_PER_YEAR * HOURS_PER_DAY;

/** Allora I's seasons, in order (canon/allora-1.html, SEASONS). */
export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;
export type Season = (typeof SEASONS)[number];

/** Play begins in 1347 AR, the present year of the Allorese Reckoning (canon lore_reckoning). */
export const START_YEAR = 1347;
/** Play begins at dawn on the first day of spring. */
export const START_HOUR = 6;

export const DAY_PARTS = ['night', 'dawn', 'day', 'dusk'] as const;
export type DayPart = (typeof DAY_PARTS)[number];

export interface GameDate {
  /** Year of the Allorese Reckoning. */
  year: number;
  /** 0 to 3. */
  seasonIndex: number;
  season: Season;
  /** Day of the season, 1 to 28. */
  day: number;
  /** Week of the season, 1 to 4. */
  week: number;
  /** Day of the week, 1 to 7. */
  weekday: number;
  /** Day of the year, 1 to 112. */
  dayOfYear: number;
  /** Hour of the day, 0 to 23. */
  hour: number;
  dayPart: DayPart;
}

export function dayPartOf(hour: number): DayPart {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
}

/** The date at a number of whole game hours since the start of play. */
export function dateAt(totalHours: number): GameDate {
  if (!Number.isInteger(totalHours) || totalHours < 0) {
    throw new RangeError(`Game hours must be a whole number from 0, got ${totalHours}`);
  }
  const absolute = totalHours + START_HOUR;
  const hour = absolute % HOURS_PER_DAY;
  const totalDays = Math.floor(absolute / HOURS_PER_DAY);
  const dayIndex = totalDays % DAYS_PER_YEAR;
  const seasonIndex = Math.floor(dayIndex / DAYS_PER_SEASON);
  const dayOfSeason = dayIndex % DAYS_PER_SEASON;
  return {
    year: START_YEAR + Math.floor(totalDays / DAYS_PER_YEAR),
    seasonIndex,
    season: SEASONS[seasonIndex] ?? 'Spring',
    day: dayOfSeason + 1,
    week: Math.floor(dayOfSeason / DAYS_PER_WEEK) + 1,
    weekday: (dayOfSeason % DAYS_PER_WEEK) + 1,
    dayOfYear: dayIndex + 1,
    hour,
    dayPart: dayPartOf(hour),
  };
}

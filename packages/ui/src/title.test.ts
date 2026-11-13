import { dateAt } from '@allora/engine';
import { describe, expect, it } from 'vitest';
import { formatDate, formatHour, ordinal } from './format';
import { TITLE } from './title';

describe('ui package', () => {
  it('names the game', () => {
    expect(TITLE).toBe('Allora II');
  });

  it('words the date and the hour', () => {
    expect(formatDate(dateAt(0))).toBe('Day 1 of Spring, 1347 AR');
    expect(formatHour(dateAt(0))).toBe('Dawn, the 6th hour');
    expect(formatHour(dateAt(18))).toBe('Midnight');
    expect(formatHour(dateAt(6))).toBe('Noon');
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '23rd',
    ]);
  });
});

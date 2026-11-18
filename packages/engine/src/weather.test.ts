import { describe, expect, it } from 'vitest';
import { DAYS_PER_SEASON, HOURS_PER_DAY, dateAt } from './calendar';
import { Engine } from './engine';
import { newGame } from './state';
import { WEATHERS, weatherOf } from './weather';

const daysOf = (season: number, region: string) =>
  Array.from(
    { length: DAYS_PER_SEASON },
    (_, d) => weatherOf(region, dateAt((season * DAYS_PER_SEASON + d) * HOURS_PER_DAY)).id,
  );

describe('the weather', () => {
  it('is one weather a day for a realm, the same for every life', () => {
    const date = dateAt(30 * 24);
    expect(weatherOf('eintenn', date)).toBe(weatherOf('eintenn', date));
    expect(weatherOf('eintenn', dateAt(30 * 24 + 5))).toBe(weatherOf('eintenn', date));
  });

  it('follows the season and the realm: snow in an Eintenn winter, none in its summer', () => {
    expect(daysOf(3, 'eintenn')).toContain('snow');
    expect(daysOf(1, 'eintenn')).not.toContain('snow');
    expect(daysOf(1, 'marre')).toContain('heat');
    expect(new Set(daysOf(0, 'eintenn')).size).toBeGreaterThan(2);
  });

  it('slows the road in snow, and keeps the boats in in a storm', () => {
    expect(WEATHERS.snow.land).toBeGreaterThan(1);
    expect(WEATHERS.storm.water).toBe(0);
    // A journey through snowy days takes longer than through fair ones.
    const winter = 3 * DAYS_PER_SEASON * HOURS_PER_DAY;
    const snowy = daysOf(3, 'eintenn').indexOf('snow');
    const fair = daysOf(1, 'eintenn').indexOf('fair');
    const travel = (start: number) => {
      const state = newGame(2, 0);
      state.hours = start;
      state.money = 100;
      state.orders = { ...state.orders, sleepFrom: 23, wakeAt: 5 };
      const e = new Engine(state);
      e.handle({ type: 'travel', to: 'tennfels' }, 0);
      let n = 0;
      while (e.state.journey && n < 200) {
        e.tick();
        n++;
      }
      return n;
    };
    const inSnow = travel(winter + snowy * HOURS_PER_DAY);
    const inFair = travel(DAYS_PER_SEASON * HOURS_PER_DAY + fair * HOURS_PER_DAY);
    expect(inSnow).toBeGreaterThan(inFair);
  });

  it('is in the snapshot', () => {
    const e = new Engine(newGame(2, 0));
    expect(Object.keys(WEATHERS)).toContain(e.snapshot().weather.id);
  });
});

describe('the feasts', () => {
  it('fall on their days, with something to do only then', () => {
    const state = newGame(2, 0);
    state.place = 'ostwick';
    // The 17th hour of the 26th of autumn: Harvest Home.
    state.hours = (2 * DAYS_PER_SEASON + 25) * HOURS_PER_DAY + 11;
    const e = new Engine(state);
    expect(e.snapshot().feasts).toContainEqual({ id: 'feast_harvest_home', here: true });
    expect(e.snapshot().canDo).toContain('activity_feast_dance_mare');
    e.state.hours -= 5 * HOURS_PER_DAY;
    expect(e.snapshot().feasts).toEqual([]);
    expect(e.snapshot().work.find((w) => w.id === 'activity_feast_dance_mare')?.reason).toBe(
      'Only at Harvest Home',
    );
  });

  it('are Allora I’s four, and Ilvara’s two holy days', () => {
    const e = new Engine(newGame(2, 0));
    expect([...e.world.feasts.keys()].sort()).toEqual([
      'feast_carnevale',
      'feast_harvest_home',
      'feast_lagoon',
      'feast_longest_night',
      'feast_regatta',
      'feast_stubble_burning',
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import { Engine } from './engine';
import { EVICT_AFTER_DAYS, HOMES, INN } from './housing';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';

const life = () => new Engine(newGame(3, 0));

describe('homes and lodging', () => {
  it('starts a life in a rented room in Ostwick, with rent due each dawn', () => {
    const e = life();
    expect(e.state.lodging).toEqual({ kind: 'room', rent: HOMES.room.rent.settled, owed: 0 });
    const before = e.state.money;
    e.run(18); // to midnight
    expect(e.state.spent).toBeCloseTo(3 * 0.5 + HOMES.room.rent.settled);
    expect(e.state.money).toBeLessThan(before);
  });

  it('runs into arrears with an empty purse, and is turned out after a week of them', () => {
    const e = life();
    e.state.money = 0;
    e.run(18 + 24 * (EVICT_AFTER_DAYS - 2));
    expect(e.state.lodging?.owed).toBeGreaterThan(0);
    e.run(24 * 2);
    expect(e.state.lodging).toBeNull();
    expect(e.snapshot().log.some((l) => l.kind === 'evicted')).toBe(true);
  });

  it('sleeps better at home than in an inn, and better in an inn than by the road', () => {
    const night = (setup: (e: Engine) => void): number => {
      const e = life();
      setup(e);
      e.state.needs.vigour = 20;
      e.run(16); // to the 22nd hour
      const v = e.state.needs.vigour;
      e.run(1);
      return e.state.needs.vigour - v;
    };
    const home = night(() => {});
    const inn = night((e) => {
      e.state.place = 'place_eintenn_netherwick';
    });
    const rough = night((e) => {
      e.state.place = 'place_eintenn_netherwick';
      e.handle({ type: 'setOrders', orders: { inn: false } }, 0);
    });
    expect(home).toBe(HOMES.room.sleep);
    expect(inn).toBe(INN.sleep);
    expect(rough).toBeLessThan(inn);
  });

  it('pays for an inn bed once a night', () => {
    const e = life();
    e.state.place = 'place_eintenn_netherwick';
    const before = e.state.money;
    e.run(17 + 8); // through the night
    const meals = e.state.meals * 0.5;
    expect(before - e.state.money).toBeCloseTo(INN.price.settled + meals + HOMES.room.rent.settled);
  });

  it('rents a cottage, giving up the room, and costs more in a city', () => {
    const e = life();
    e.handle({ type: 'rent', home: 'cottage' }, 0);
    expect(e.state.lodging).toMatchObject({ kind: 'cottage', rent: HOMES.cottage.rent.settled });
    expect(() => e.handle({ type: 'rent', home: 'cottage' }, 0)).toThrow('Already');
    e.state.place = 'kess_market';
    expect(e.snapshot().lettings).toEqual({
      room: HOMES.room.rent.city,
      cottage: HOMES.cottage.rent.city,
      inn: INN.price.city,
    });
    e.state.place = 'salzmoor';
    expect(e.snapshot().lettings).toEqual({});
    expect(() => e.handle({ type: 'rent', home: 'room' }, 0)).toThrow('No homes');
  });

  it('can give up its home, and must pay what it owes first', () => {
    const e = life();
    e.state.lodging = { kind: 'room', rent: 0.6, owed: 1.2 };
    e.state.money = 0;
    expect(() => e.handle({ type: 'leaveHome' }, 0)).toThrow('owed');
    e.state.money = 5;
    e.handle({ type: 'leaveHome' }, 0);
    expect(e.state.lodging).toBeNull();
  });

  it('migrates an older save into a rented room', () => {
    const old = { ...newGame(1, 0), version: 12 } as Record<string, unknown>;
    delete old.lodging;
    delete old.innNight;
    old.orders = {
      sleepFrom: 22,
      wakeAt: 6,
      campAtNight: true,
      work: 'away',
      turnBackIfHurt: true,
    };
    const save = migrate(old);
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.lodging?.kind).toBe('room');
    expect(save.orders.inn).toBe(true);
  });
});

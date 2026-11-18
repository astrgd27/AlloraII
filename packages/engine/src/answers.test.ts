import { describe, expect, it } from 'vitest';
import { Engine } from './engine';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';

describe('every click answers', () => {
  it('lists all the work of a place, with the reason any of it cannot be begun', () => {
    const e = new Engine(newGame(9, 0));
    const dawn = e.snapshot();
    expect(dawn.work.length).toBeGreaterThan(dawn.canDo.length);
    expect(
      dawn.work
        .filter((w) => !w.reason)
        .map((w) => w.id)
        .sort(),
    ).toEqual([...dawn.canDo].sort());
    expect(dawn.work.some((w) => w.reason === 'Not at this hour')).toBe(true);
    // Duties of posts not held are not shown at all.
    expect(dawn.work.every((w) => !e.world.activities.get(w.id)?.post)).toBe(true);

    e.run(1);
    e.handle({ type: 'do', activity: e.snapshot().canDo[0] ?? '' }, 0);
    const busy = e.snapshot();
    expect(busy.work.every((w) => w.reason)).toBe(true);
    expect(busy.blocked.travel).toBe('Busy');
    expect(() => e.handle({ type: 'travel', to: 'tennfels' }, 0)).toThrow('Busy');
  });

  it('says why people, the market and a case step are out of reach', () => {
    const e = new Engine(newGame(9, 0));
    expect(e.snapshot().blocked).toEqual({ market: 'The market is shut' });
    e.run(17);
    expect(e.state.asleep).toBe(true);
    expect(e.snapshot().blocked).toMatchObject({ people: 'Asleep', market: 'Asleep' });

    const poor = new Engine(newGame(9, 0));
    poor.run(2);
    poor.state.money = 0.1;
    expect(poor.snapshot().market?.stock.find((s) => s.item === 'bread')?.why).toBe(
      'Not enough money',
    );
  });

  it('keeps a short record of what just happened, newest first', () => {
    const e = new Engine(newGame(9, 0));
    e.run(1);
    e.handle({ type: 'buy', item: 'bread' }, 0);
    const paid = e.snapshot().canDo.find((id) => e.world.activities.get(id)?.pay) ?? '';
    e.handle({ type: 'do', activity: paid }, 0);
    while (e.state.doing) e.tick();
    const log = e.snapshot().log;
    expect(log[0]).toMatchObject({ kind: 'done', id: paid });
    expect(log[0]).toHaveProperty('pay');
    expect(log.at(-1)).toMatchObject({ kind: 'bought', item: 'bread' });
    e.handle({ type: 'travel', to: 'place_eintenn_weirbeck_mill' }, 0);
    while (e.state.journey) e.tick();
    expect(e.snapshot().log[0]).toMatchObject({
      kind: 'arrived',
      place: 'place_eintenn_weirbeck_mill',
    });
    for (let i = 0; i < 100; i++) e.state.log.push({ hours: 0, kind: 'met', person: 'x' });
    e.handle({ type: 'meet', person: e.snapshot().here[0]?.id ?? '' }, 0);
    expect(e.state.log.length).toBeLessThanOrEqual(40);
  });

  it('migrates an older save', () => {
    const old = { ...newGame(1, 0), version: 11 } as Record<string, unknown>;
    delete old.log;
    expect(migrate(old).version).toBe(SAVE_VERSION);
    expect(migrate(old).log).toEqual([]);
  });
});

describe('the character sheet', () => {
  it('shows each skill with the cap that holds it', () => {
    const e = new Engine(newGame(9, 0));
    e.state.skills.skill_husbandry = { level: 10, xp: 0, gates: 0 };
    expect(e.snapshot().skills.skill_husbandry).toMatchObject({ level: 10, cap: 10, atGate: true });
    e.state.skills.skill_husbandry.gates = 1;
    expect(e.snapshot().skills.skill_husbandry).toMatchObject({ cap: 25, atGate: false });
  });

  it('lets the hours of sleep be changed, within reason', () => {
    const e = new Engine(newGame(9, 0));
    e.handle({ type: 'setOrders', orders: { sleepFrom: 21, wakeAt: 5 } }, 0);
    expect(e.state.orders).toMatchObject({ sleepFrom: 21, wakeAt: 5 });
    expect(() => e.handle({ type: 'setOrders', orders: { wakeAt: 23 } }, 0)).toThrow(
      'four to twelve',
    );
    expect(() => e.handle({ type: 'setOrders', orders: { sleepFrom: 24 } }, 0)).toThrow(
      'No such hour',
    );
    expect(e.state.orders).toMatchObject({ sleepFrom: 21, wakeAt: 5 });
  });
});

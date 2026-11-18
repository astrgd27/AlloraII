import { describe, expect, it } from 'vitest';
import { FRIEND_PAY, GIFT_DAYS, POINTS, REACTIONS, reactionTo, tierOf } from './bonds';
import { dateAt } from './calendar';
import { Engine } from './engine';
import { whereIs } from './people';
import { migrate } from './save/migrations';
import { SAVE_VERSION, newGame } from './state';

/** A life beside Hanne Brook, met. */
const withHanne = () => {
  const e = new Engine(newGame(8, 0));
  const hanne = e.world.people.get('hanne');
  if (!hanne) throw new Error('no Hanne');
  // Find an hour when she is in Ostwick and the life is awake.
  while (whereIs(hanne, dateAt(e.state.hours)).place !== 'ostwick' || e.state.asleep) e.tick();
  e.handle({ type: 'meet', person: 'hanne' }, 0);
  return e;
};

describe('friendship', () => {
  it('starts at a first meeting, as in Allora I', () => {
    const e = withHanne();
    expect(e.state.bonds.hanne?.points).toBe(POINTS.meet);
    expect(tierOf(POINTS.meet)).toBe(0);
  });

  it('judges a gift by the person’s own tastes', () => {
    const e = withHanne();
    const hanne = e.world.people.get('hanne')!;
    expect(reactionTo(hanne, e.world, 'bread')).toBe('like'); // food
    expect(reactionTo(hanne, e.world, 'straw_hat')).toBe('love');
    e.state.goods = { straw_hat: 2 };
    e.handle({ type: 'give', person: 'hanne', item: 'straw_hat' }, 0);
    expect(e.state.bonds.hanne?.points).toBe(POINTS.meet + REACTIONS.love);
    expect(e.snapshot().words).toMatchObject({ kind: 'gift', reaction: 'love' });
    expect(() => e.handle({ type: 'give', person: 'hanne', item: 'straw_hat' }, 0)).toThrow(
      'a week',
    );
    expect(e.snapshot().here.find((h) => h.id === 'hanne')?.giftWhy).toMatch(/a week/);
    e.state.hours += GIFT_DAYS * 24;
    expect(e.snapshot().here.find((h) => h.id === 'hanne')?.giftWhy).toBeUndefined();
  });

  it('tells a confidence at each new tier, the next time they talk', () => {
    const e = withHanne();
    e.state.bonds.hanne!.points = 140;
    e.state.goods = { straw_hat: 1 };
    e.handle({ type: 'give', person: 'hanne', item: 'straw_hat' }, 0);
    expect(tierOf(e.state.bonds.hanne!.points)).toBe(1);
    expect(e.snapshot().log.some((l) => l.kind === 'friend')).toBe(true);
    e.handle({ type: 'talk', person: 'hanne' }, 0);
    expect(e.snapshot().words).toEqual({ person: 'hanne', kind: 'confide', line: 0 });
    e.handle({ type: 'talk', person: 'hanne' }, 0);
    expect(e.snapshot().words?.kind).toBe('talk');
  });

  it('grows with a day’s talk and with work alongside', () => {
    const e = withHanne();
    const before = e.state.bonds.hanne!.points;
    e.handle({ type: 'talk', person: 'hanne' }, 0);
    e.handle({ type: 'talk', person: 'hanne' }, 0);
    expect(e.state.bonds.hanne!.points).toBe(before + POINTS.talk);
  });

  it('puts work your way once you are friends', () => {
    const e = withHanne();
    const sub = e.world.people.get('hanne')!.sched[0]!.at[1];
    const job = [...e.world.activities.values()].find(
      (a) => a.place === 'ostwick' && a.sub === sub && a.pay && !a.feast,
    );
    if (!job) throw new Error(`no paid work at ${sub}`);
    e.state.bonds.hanne!.points = 200;
    e.state.place = 'ostwick';
    Object.assign(e.state, { doing: null });
    while (!e.snapshot().canDo.includes(job.id)) e.tick();
    e.handle({ type: 'do', activity: job.id }, 0);
    expect(e.state.doing?.pay).toBeCloseTo((job.pay ?? 0) * FRIEND_PAY);
  });

  it('migrates old bonds', () => {
    const old = { ...newGame(1, 0), version: 16 } as Record<string, unknown>;
    old.bonds = { hanne: { talks: 3, lastTalkDay: 5 } };
    const save = migrate(old);
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.bonds.hanne).toMatchObject({ points: 38, lastGift: -1, toTell: 0, told: 0 });
  });
});

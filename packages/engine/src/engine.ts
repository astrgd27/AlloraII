/**
 * The engine: owns the state, turns real time into game hours, and runs each
 * system once per tick in a declared order. One tick is one game hour.
 * It has no knowledge of the screen, the worker or storage, so the same code
 * runs in the browser, in tests and in the balance bot.
 */
import { activitySystem, availableNow, begin, whyNot, type LastCheck } from './activities';
import {
  beginStep,
  careerDay,
  materialFor,
  choices,
  offers,
  takeCase,
  takePost,
  withdraw,
  workHour,
  type Held,
} from './career';
import { chanceOfSuccess } from './challenge';
import { HOURS_PER_DAY, dateAt, type GameDate } from './calendar';
import { EventBus } from './events';
import type { Order } from './protocol';
import { innAt, leaveHome, payRent, rent, rentAt, type Lodging } from './housing';
import { liveDay, payDues } from './living';
import { giftWhyNot, give, tierOf } from './bonds';
import { faithDay, join, joinWhyNot, lodgingFactor, offer } from './faith';
import {
  WILL_MAX,
  boostModifiers,
  cast,
  castWhyNot,
  copy,
  copyWhyNot,
  dispute,
  disputeWhyNot,
  magicHour,
  matriculate,
  matriculateWhyNot,
} from './magic';
import { note, type LogEntry } from './log';
import { toolFor, toolModifiers, wearLeft } from './tools';
import {
  PACK,
  carried,
  buy,
  buyPrice,
  isMarketDay,
  isOpen,
  marketHere,
  sell,
  sellPrice,
} from './market';
import { meet, peopleAt, talk, type Words } from './people';
import { needsSystem, type Needs, type StandingOrders } from './needs';
import { mark, routine, writeReport, type Report } from './routine';
import { capOf, xpToNext, type SkillState } from './skills';
import { type GameState } from './state';
import { travelSystem, turnBack, setOut } from './travel';
import { World, feastOn } from './world';
import { weatherOf } from './weather';

/** The paces the clock can run at while the game is open: a game hour a minute, six seconds, a second. */
export const SPEEDS = [1, 10, 60];

/** One real minute is one game hour. The single tunable clock rate. */
export const MS_PER_GAME_HOUR = 60_000;

/**
 * Time away is caught up at full speed, but never more than this many game
 * days for each real day away (design bible, Open questions: Offline time).
 */
export const CATCH_UP_DAYS_PER_REAL_DAY = 7;
const REAL_DAY_MS = 24 * 60 * 60 * 1000;

/** A system runs once per tick. Systems are added in the order they must run. */
export interface System {
  name: string;
  tick(state: GameState, date: GameDate, bus: EventBus, world: World): void;
}

export interface EngineOptions {
  msPerGameHour?: number;
  /** Extra systems, run after the built-in ones. */
  systems?: System[];
  world?: World;
}

export interface Snapshot {
  hours: number;
  date: GameDate;
  paused: boolean;
  /** The pace of the clock (see SPEEDS). */
  speed: number;
  /** How far the current game hour has run, 0 to 1. */
  hourProgress: number;
  /** Game hours simulated to catch up after the last time away. */
  caughtUpHours: number;
  /** Game hours of the last time away that were not simulated (over the cap). */
  skippedHours: number;
  needs: Needs;
  /** The activity in hand, and the hours it still needs. */
  doing: { id: string; hoursLeft: number } | null;
  /** All the work of this place open to the life, and why any of it cannot be begun now. */
  work: { id: string; reason?: string }[];
  /** Why whole kinds of order would be refused now. Absent when they would not be. */
  blocked: { travel?: string; people?: string; market?: string; step?: string; takeCase?: string };
  /** What just happened, newest first. */
  log: LogEntry[];
  /** Ids of the activities that can be begun here and now. */
  canDo: string[];
  /** For those that end in a check: the chance of success, 0 to 1. */
  chances: Record<string, number>;
  lastCheck: LastCheck | null;
  /** The post held, if any. */
  post: Held | null;
  /** Posts that can be taken up at this place. */
  postsHere: string[];
  /** Cases on offer. */
  offers: string[];
  /** The case in hand: its step, quality and strain, and the ways through the step. */
  venture: {
    case: string;
    step: number;
    steps: number;
    quality: number;
    strain: number;
    hoursLeft: number;
    choices: { id: string; chance: number }[];
    /** Techniques of this step not yet learned, and the rank that opens them. */
    locked: { id: string; rank: number }[];
    /** The case board: each step done and how it went. */
    clues: { step: string; degree: string }[];
    /** Days the case has been open, and clues lost to time. */
    days: number;
    lost: number;
    /** The material it is made from, if any. */
    material: string | null;
  } | null;
  /** How many pieces of work are finished, and the last one. */
  works: number;
  lastWork: { case: string; quality: number; trial: boolean } | null;
  /** The faith kept, its rank and devotion, and the faiths that can be joined here. */
  faith: {
    faith: string;
    aspect: string;
    rank: number;
    devotion: number;
    next: number | null;
    lapsed: boolean;
    coals: boolean;
  } | null;
  joinable: { faith: string; aspect: string; why?: string }[];
  /** The art studied: degree, Will, proofs known (and why one cannot be cast), proofs in force. */
  magic: {
    art: string;
    degree: number;
    will: number;
    willMax: number;
    proofs: { id: string; why?: string }[];
    boosts: { proof: string; hoursLeft: number }[];
    disputeWhy?: string;
  } | null;
  /** At an art's seat: matriculating, and the proofs in its library. */
  study: { art: string; matriculateWhy?: string; library: { id: string; why?: string }[] }[];
  /** What happened while the player was away, until it is read. */
  report: Report | null;
  /** The tools carried that are in use, each with its hours of use left. */
  tools: { item: string; skill: string; edge: number; left: number; wear: number }[];
  /** Pieces the life made and kept. */
  keepsakes: { case: string; quality: number }[];
  /** The purse, in pf, and what the life carries. */
  money: number;
  goods: Record<string, number>;
  /** The market here: whether it is open, and what one of each thing costs and fetches now. */
  market: {
    id: string;
    open: boolean;
    marketDay: boolean;
    stock: {
      item: string;
      buy: number | null;
      sell: number | null;
      held: number;
      /** Why one cannot be bought now, if it is for sale. */
      why?: string;
    }[];
  } | null;
  /** The skills the life has used: level, progress to the next (0 to 1), and whether a gate holds it. */
  skills: Record<string, { level: number; progress: number; atGate: boolean; cap: number }>;
  /** The people at the life's place now. `known` is false until they have met. */
  here: {
    id: string;
    sub: string;
    known: boolean;
    talks: number;
    /** Friendship points and tier (0 Acquaintance to 3 Confidant), and why no gift today. */
    points: number;
    tier: number;
    giftWhy?: string;
  }[];
  /** The last thing someone said. */
  words: Words | null;
  /** The last thing that happened on the way, while still on the way. */
  roadEvent: string | null;
  asleep: boolean;
  home: string;
  /** The home rented, if any, and what homes and beds cost here. */
  lodging: Lodging | null;
  lettings: { room?: number; cottage?: number; inn?: number };
  orders: StandingOrders;
  /** The place the life is in, or last left. */
  place: string;
  journey: {
    from: string;
    to: string;
    /** The road segment being travelled. */
    road: string;
    /** The place the current leg leads to. */
    next: string;
    /** The place the current leg started from. */
    last: string;
    /** How far along the current leg, 0 to 1. */
    legProgress: number;
    hoursLeft: number;
  } | null;
  /** Today's weather where the life is. */
  weather: { id: string; name: string };
  /** Feasts on today anywhere in the world, and whether here. */
  feasts: { id: string; here: boolean }[];
  /** Tolls and fares from the life's place to every place it can reach. */
  costsTo: Record<string, number>;
  /** Travel hours from the life's place to every place it can reach. */
  hoursTo: Record<string, number>;
}

export class Engine {
  readonly bus = new EventBus();
  readonly msPerGameHour: number;
  /** How many times faster than the usual pace the clock runs while the game is open. */
  speed = 1;
  readonly world: World;
  private readonly systems: System[];
  private caughtUpHours = 0;
  private skippedHours = 0;
  /** True while catching up on time away. */
  private away = false;

  constructor(
    public state: GameState,
    options: EngineOptions = {},
  ) {
    this.msPerGameHour = options.msPerGameHour ?? MS_PER_GAME_HOUR;
    this.world = options.world ?? World.shared();
    this.systems = [needsSystem, travelSystem, activitySystem, ...(options.systems ?? [])];
    // The record of what just happened is kept from the engine's own events.
    this.bus.on('ActivityCompleted', (e) =>
      note(this.state, {
        kind: 'done',
        id: e.activity,
        ...(e.pay ? { pay: e.pay } : {}),
        ...(e.degree ? { degree: e.degree } : {}),
      }),
    );
    this.bus.on('CaseFinished', (e) =>
      note(this.state, { kind: 'case', id: e.case, quality: e.quality, trial: e.trial }),
    );
    this.bus.on('Arrived', (e) => note(this.state, { kind: 'arrived', place: e.place }));
    this.bus.on('RoadEvent', (e) => note(this.state, { kind: 'road', id: e.event }));
  }

  /** Runs one game hour. */
  tick(): void {
    const before = dateAt(this.state.hours);
    this.state.hours += 1;
    const date = dateAt(this.state.hours);
    if (date.hour === 0 && this.state.lodging) {
      const kind = this.state.lodging.kind;
      if (payRent(this.state, lodgingFactor(this.state, date)))
        note(this.state, { kind: 'evicted', home: kind, place: this.state.home });
    }
    if (date.hour === 0) {
      liveDay(this.state);
      faithDay(this.state, this.world, date);
      const lost = careerDay(this.state, this.world);
      if (lost) note(this.state, { kind: 'lost', case: lost });
    }
    if (date.seasonIndex !== before.seasonIndex) payDues(this.state, this.world);
    magicHour(this.state);
    routine(this.state, this.world, before, this.away);
    for (const system of this.systems) system.tick(this.state, date, this.bus, this.world);
    const rank = this.state.post?.rank ?? 0;
    const done = workHour(this.state, this.world).finished;
    if (done) {
      this.bus.emit('CaseFinished', {
        hours: this.state.hours,
        case: done.case,
        quality: done.quality,
        trial: done.trial,
      });
    }
    if (this.state.post && this.state.post.rank > rank)
      note(this.state, { kind: 'rank', post: this.state.post.id, rank: this.state.post.rank });
    const payload = { hours: this.state.hours, date };
    this.bus.emit('HourPassed', payload);
    if (date.hour === 0) this.bus.emit('DayBegan', payload);
    if (date.seasonIndex !== before.seasonIndex) this.bus.emit('SeasonBegan', payload);
    if (date.year !== before.year) this.bus.emit('YearBegan', payload);
  }

  /** Runs a number of game hours at once (the balance bot, catching up). */
  run(hours: number): void {
    for (let i = 0; i < hours; i++) this.tick();
  }

  /** Moves the clock to `nowMs` while the game is open. Returns the hours that passed. */
  advanceTo(nowMs: number): number {
    const elapsed = Math.max(0, nowMs - this.state.lastRealMs);
    this.state.lastRealMs = nowMs;
    if (this.state.paused) return 0;
    const total = this.state.carryMs + elapsed * this.speed;
    const hours = Math.floor(total / this.msPerGameHour);
    this.state.carryMs = total - hours * this.msPerGameHour;
    this.run(hours);
    return hours;
  }

  /**
   * Catches up after time away (a reload, a closed tab). Simulates at full
   * speed up to the cap; the rest is skipped and reported.
   */
  catchUpTo(nowMs: number): void {
    const away = Math.max(0, nowMs - this.state.lastRealMs);
    this.state.lastRealMs = nowMs;
    this.caughtUpHours = 0;
    this.skippedHours = 0;
    if (this.state.paused) return;
    const total = this.state.carryMs + away;
    const due = Math.floor(total / this.msPerGameHour);
    const cap = Math.ceil(away / REAL_DAY_MS) * CATCH_UP_DAYS_PER_REAL_DAY * HOURS_PER_DAY;
    const hours = Math.min(due, cap);
    this.state.carryMs = due > cap ? 0 : total - due * this.msPerGameHour;
    const before = mark(this.state);
    this.away = true;
    this.run(hours);
    this.away = false;
    writeReport(this.state, this.world, before);
    this.caughtUpHours = hours;
    this.skippedHours = due - hours;
  }

  /** Applies an order from the UI. Orders are the only way the UI changes the world. */
  handle(order: Order, nowMs: number): void {
    switch (order.type) {
      case 'pause':
        this.advanceTo(nowMs);
        this.state.paused = true;
        break;
      case 'speed':
        if (!SPEEDS.includes(order.speed)) throw new Error('No such pace');
        this.advanceTo(nowMs);
        this.speed = order.speed;
        break;
      case 'resume':
        this.state.lastRealMs = nowMs;
        this.state.paused = false;
        break;
      case 'do':
        begin(this.state, this.world, order.activity, dateAt(this.state.hours));
        break;
      case 'takePost':
        takePost(this.state, this.world, order.post);
        break;
      case 'takeCase':
        takeCase(this.state, this.world, order.case);
        break;
      case 'step':
        beginStep(this.state, this.world, order.approach, dateAt(this.state.hours));
        break;
      case 'withdraw':
        withdraw(this.state);
        break;
      case 'meet':
        meet(this.state, this.world, order.person, dateAt(this.state.hours));
        note(this.state, { kind: 'met', person: order.person });
        break;
      case 'talk':
        talk(this.state, this.world, order.person, dateAt(this.state.hours));
        break;
      case 'stop':
        this.state.doing = null;
        break;
      case 'travel':
        if (this.state.doing || this.state.venture?.working) throw new Error('Busy');
        setOut(this.state, this.world, order.to);
        break;
      case 'buy':
        note(this.state, {
          kind: 'bought',
          item: order.item,
          price: buy(this.state, this.world, order.item, dateAt(this.state.hours)),
        });
        break;
      case 'sell':
        note(this.state, {
          kind: 'sold',
          item: order.item,
          price: sell(this.state, this.world, order.item, dateAt(this.state.hours)),
        });
        break;
      case 'rent':
        rent(this.state, this.world, order.home);
        note(this.state, { kind: 'moved', home: order.home, place: this.state.place });
        break;
      case 'leaveHome':
        leaveHome(this.state);
        break;
      case 'matriculate':
        matriculate(this.state, this.world, order.art);
        break;
      case 'copy':
        copy(this.state, this.world, order.proof);
        break;
      case 'cast':
        cast(this.state, this.world, order.proof);
        break;
      case 'dispute':
        dispute(this.state, this.world, dateAt(this.state.hours));
        break;
      case 'join':
        join(this.state, this.world, order.faith, order.aspect);
        break;
      case 'offer': {
        const worth = offer(this.state, this.world, order.item, dateAt(this.state.hours));
        note(this.state, { kind: 'offered', item: order.item, worth });
        break;
      }
      case 'give':
        give(this.state, this.world, order.person, order.item);
        break;
      case 'readReport':
        this.state.report = null;
        break;
      case 'setOrders': {
        const next = { ...this.state.orders, ...order.orders };
        for (const h of [next.sleepFrom, next.wakeAt]) {
          if (!Number.isInteger(h) || h < 0 || h > 23) throw new Error('No such hour');
        }
        const span = (next.wakeAt - next.sleepFrom + 24) % 24;
        if (span < 4 || span > 12) throw new Error('A night is four to twelve hours');
        this.state.orders = next;
        break;
      }
      case 'turnBack':
        turnBack(this.state);
        break;
      case 'save':
      case 'reset':
        // Handled by the host (the worker), which owns storage.
        break;
    }
  }

  snapshot(): Snapshot {
    const j = this.state.journey;
    const can = availableNow(this.world, this.state, dateAt(this.state.hours));
    const leg = j?.legs[0];
    const date = dateAt(this.state.hours);
    const market = marketHere(this.state, this.world);
    const s = this.state;
    const working = Boolean(s.doing) || Boolean(s.venture?.working);
    const postPlace = this.world.posts.get(s.post?.id ?? '')?.place;
    const blocked: Snapshot['blocked'] = {};
    if (working && !j) blocked.travel = 'Busy';
    if (s.asleep) blocked.people = 'Asleep';
    if (market && s.asleep) blocked.market = 'Asleep';
    else if (market && !isOpen(market, date)) blocked.market = 'The market is shut';
    if (s.venture) {
      if (s.asleep) blocked.step = 'Asleep';
      else if (j || s.place !== postPlace) blocked.step = 'Not at the workshop';
      else if (working) blocked.step = 'Busy';
    }
    const postNow = s.post ? this.world.posts.get(s.post.id) : undefined;
    if (postNow?.materials && !materialFor(s, postNow)) {
      const names = postNow.materials.map((m) => this.world.items.get(m.item)?.name ?? m.item);
      blocked.takeCase = `Needs ${names.join(' or ')} to work`;
    }
    const full = carried(s) >= PACK;
    return {
      blocked,
      log: s.log.slice(-12).reverse(),
      work: j
        ? []
        : [...this.world.activities.values()]
            .filter((a) => a.place === s.place && (!a.post || a.post === s.post?.id))
            .map((a) => {
              const reason = whyNot(a, s, date, this.world);
              return { id: a.id, ...(reason ? { reason } : {}) };
            }),
      report: this.state.report,
      magic: s.magic
        ? {
            art: s.magic.art,
            degree: s.magic.degree,
            will: s.magic.will,
            willMax: WILL_MAX,
            proofs: s.magic.proofs.map((id) => {
              const why = castWhyNot(s, this.world, id);
              return { id, ...(why ? { why } : {}) };
            }),
            boosts: s.magic.boosts
              .filter((b) => b.until > s.hours)
              .map((b) => ({ proof: b.proof, hoursLeft: b.until - s.hours })),
            ...((w) => (w ? { disputeWhy: w } : {}))(disputeWhyNot(s, this.world)),
          }
        : null,
      study: j
        ? []
        : [...this.world.arts.values()]
            .filter((art) => art.place === s.place)
            .map((art) => ({
              art: art.id,
              ...((w) => (w ? { matriculateWhy: w } : {}))(
                matriculateWhyNot(s, this.world, art.id),
              ),
              library: [...this.world.proofs.values()]
                .filter((p) => p.art === art.id)
                .map((p) => {
                  const why = copyWhyNot(s, this.world, p.id);
                  return { id: p.id, ...(why ? { why } : {}) };
                }),
            })),
      faith: s.faith
        ? {
            faith: s.faith.faith,
            aspect: s.faith.aspect,
            rank: s.faith.rank,
            devotion: s.faith.devotion,
            next: this.world.rites.get(s.faith.faith)?.thresholds[s.faith.rank + 1] ?? null,
            lapsed: s.faith.lapsed,
            coals: s.faith.coals,
          }
        : null,
      joinable: j
        ? []
        : [...this.world.rites.values()].flatMap((r) =>
            r.aspects
              .filter((a) => a.place === s.place)
              .map((a) => {
                const why = joinWhyNot(s, this.world, r.faith, a.id);
                return { faith: r.faith, aspect: a.id, ...(why ? { why } : {}) };
              }),
          ),
      tools: [...this.world.toolsBySkill.keys()].flatMap((skill) => {
        const t = toolFor(s, this.world, skill);
        return t ? [{ item: t.item, skill, edge: t.edge, left: wearLeft(s, t), wear: t.wear }] : [];
      }),
      keepsakes: s.keepsakes.map((k) => ({ case: k.case, quality: k.quality })),
      money: this.state.money,
      goods: { ...this.state.goods },
      market: market
        ? {
            id: market.id,
            open: isOpen(market, date),
            marketDay: isMarketDay(market, date),
            stock: [...new Set([...market.sells, ...Object.keys(this.state.goods)])]
              .map((item) => ({
                item,
                buy: buyPrice(this.state, this.world, market, item, date) ?? null,
                sell: this.state.goods[item]
                  ? (sellPrice(this.state, this.world, market, item, date) ?? null)
                  : null,
                held: this.state.goods[item] ?? 0,
              }))
              .map((row) => ({
                ...row,
                ...(row.buy !== null && full
                  ? { why: 'The pack is full' }
                  : row.buy !== null && row.buy > s.money
                    ? { why: 'Not enough money' }
                    : {}),
              })),
          }
        : null,
      needs: { ...this.state.needs },
      doing: this.state.doing
        ? { id: this.state.doing.id, hoursLeft: this.state.doing.hoursLeft }
        : null,
      canDo: can.map((a) => a.id),
      chances: Object.fromEntries(
        can
          .filter((a) => a.dc)
          .map((a) => [
            a.id,
            chanceOfSuccess({
              dc: a.dc ?? 0,
              skillLevel: (a.skill && this.state.skills[a.skill]?.level) || 0,
              modifiers: [
                ...toolModifiers(this.state, this.world, a.skill),
                ...boostModifiers(this.state, this.world, a.skill),
              ],
              allowsCost: false,
            }),
          ]),
      ),
      lastCheck: this.state.lastCheck,
      post: this.state.post ? { ...this.state.post } : null,
      postsHere:
        j || this.state.post
          ? []
          : [...this.world.posts.values()]
              .filter((p) => p.place === this.state.place)
              .map((p) => p.id),
      offers: offers(this.state, this.world).map((c) => c.id),
      venture: this.state.venture
        ? {
            case: this.state.venture.case,
            step: this.state.venture.step,
            steps: this.world.posts.get(this.state.post?.id ?? '')?.work.length ?? 0,
            quality: this.state.venture.quality,
            strain: this.state.venture.strain,
            hoursLeft: this.state.venture.working?.hoursLeft ?? 0,
            choices: choices(this.state, this.world).map((c) => ({
              id: c.approach.id,
              chance: c.chance,
            })),
            locked: (
              this.world.posts.get(this.state.post?.id ?? '')?.work[this.state.venture.step]
                ?.approaches ?? []
            )
              .filter((a) => (a.rank ?? 0) > (this.state.post?.rank ?? 0))
              .map((a) => ({ id: a.id, rank: a.rank ?? 0 })),
            clues: this.state.venture.clues.map((c) => ({ ...c })),
            days: Math.floor((this.state.hours - this.state.venture.started) / 24),
            lost: this.state.venture.lost,
            material: this.state.venture.material ?? null,
          }
        : null,
      works: this.state.works.length,
      lastWork: this.state.works.at(-1) ?? null,
      here: j
        ? []
        : peopleAt(this.world, this.state.place, dateAt(this.state.hours)).map((p) => ({
            ...p,
            known: Boolean(this.state.bonds[p.id]),
            talks: this.state.bonds[p.id]?.talks ?? 0,
            points: this.state.bonds[p.id]?.points ?? 0,
            tier: tierOf(this.state.bonds[p.id]?.points ?? 0),
            ...((w) => (w ? { giftWhy: w } : {}))(giftWhyNot(this.state, p.id)),
          })),
      skills: Object.fromEntries(
        Object.entries(this.state.skills).map(([id, k]: [string, SkillState]) => [
          id,
          {
            level: k.level,
            progress: Math.min(1, k.xp / xpToNext(k.level)),
            atGate: k.level >= capOf(k) && k.level < 100,
            cap: capOf(k),
          },
        ]),
      ),
      words: this.state.words,
      roadEvent: j ? (this.state.roadEvent?.id ?? null) : null,
      asleep: this.state.asleep,
      home: this.state.home,
      lodging: this.state.lodging ? { ...this.state.lodging } : null,
      lettings: j
        ? {}
        : Object.fromEntries(
            (
              [
                ['room', rentAt(this.world, s.place, 'room')],
                ['cottage', rentAt(this.world, s.place, 'cottage')],
                ['inn', innAt(this.world, s.place)],
              ] as [string, number | undefined][]
            ).filter(([, v]) => v !== undefined),
          ),
      orders: { ...this.state.orders },
      place: this.state.place,
      journey:
        j && leg
          ? {
              from: j.from,
              to: j.to,
              road: leg.road,
              next: leg.to,
              last: this.state.place,
              legProgress: Math.min(
                1,
                (j.legHours + this.state.carryMs / this.msPerGameHour) / leg.hours,
              ),
              hoursLeft: j.legs.reduce((n, l) => n + l.hours, 0) - j.legHours,
            }
          : null,
      hoursTo: j ? {} : this.world.hoursFrom(this.state.place),
      costsTo: j ? {} : this.world.costsFrom(this.state.place),
      weather: (() => {
        const w = weatherOf(
          this.world.places.get(j ? (j.legs[0]?.to ?? s.place) : s.place)?.region ?? '',
          date,
        );
        return { id: w.id, name: w.name };
      })(),
      feasts: [...this.world.feasts.values()]
        .filter((f) => feastOn(f, date))
        .map((f) => ({ id: f.id, here: !j && f.place === s.place })),
      hours: this.state.hours,
      date: dateAt(this.state.hours),
      paused: this.state.paused,
      speed: this.speed,
      hourProgress: Math.min(1, this.state.carryMs / this.msPerGameHour),
      caughtUpHours: this.caughtUpHours,
      skippedHours: this.skippedHours,
    };
  }
}

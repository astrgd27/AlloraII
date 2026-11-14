/**
 * The engine: owns the state, turns real time into game hours, and runs each
 * system once per tick in a declared order. One tick is one game hour.
 * It has no knowledge of the screen, the worker or storage, so the same code
 * runs in the browser, in tests and in the balance bot.
 */
import { HOURS_PER_DAY, dateAt, type GameDate } from './calendar';
import { EventBus } from './events';
import type { Order } from './protocol';
import { needsSystem, type Needs, type StandingOrders } from './needs';
import { type GameState } from './state';
import { travelSystem, turnBack, setOut } from './travel';
import { World } from './world';

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
  tick(state: GameState, date: GameDate, bus: EventBus): void;
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
  /** How far the current game hour has run, 0 to 1. */
  hourProgress: number;
  /** Game hours simulated to catch up after the last time away. */
  caughtUpHours: number;
  /** Game hours of the last time away that were not simulated (over the cap). */
  skippedHours: number;
  needs: Needs;
  asleep: boolean;
  home: string;
  orders: StandingOrders;
  /** The place the life is in, or last left. */
  place: string;
  journey: {
    from: string;
    to: string;
    /** The place the current leg leads to. */
    next: string;
    /** The place the current leg started from. */
    last: string;
    /** How far along the current leg, 0 to 1. */
    legProgress: number;
    hoursLeft: number;
  } | null;
  /** Travel hours from the life's place to every place it can reach. */
  hoursTo: Record<string, number>;
}

export class Engine {
  readonly bus = new EventBus();
  readonly msPerGameHour: number;
  readonly world: World;
  private readonly systems: System[];
  private caughtUpHours = 0;
  private skippedHours = 0;

  constructor(
    public state: GameState,
    options: EngineOptions = {},
  ) {
    this.msPerGameHour = options.msPerGameHour ?? MS_PER_GAME_HOUR;
    this.world = options.world ?? new World();
    this.systems = [needsSystem, travelSystem, ...(options.systems ?? [])];
  }

  /** Runs one game hour. */
  tick(): void {
    const before = dateAt(this.state.hours);
    this.state.hours += 1;
    const date = dateAt(this.state.hours);
    for (const system of this.systems) system.tick(this.state, date, this.bus);
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
    const total = this.state.carryMs + elapsed;
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
    this.run(hours);
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
      case 'resume':
        this.state.lastRealMs = nowMs;
        this.state.paused = false;
        break;
      case 'travel':
        setOut(this.state, this.world, order.to);
        break;
      case 'setOrders':
        this.state.orders = { ...this.state.orders, ...order.orders };
        break;
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
    const leg = j?.legs[0];
    return {
      needs: { ...this.state.needs },
      asleep: this.state.asleep,
      home: this.state.home,
      orders: { ...this.state.orders },
      place: this.state.place,
      journey:
        j && leg
          ? {
              from: j.from,
              to: j.to,
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
      hours: this.state.hours,
      date: dateAt(this.state.hours),
      paused: this.state.paused,
      hourProgress: Math.min(1, this.state.carryMs / this.msPerGameHour),
      caughtUpHours: this.caughtUpHours,
      skippedHours: this.skippedHours,
    };
  }
}

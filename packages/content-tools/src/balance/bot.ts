/**
 * The balance bot harness. It plays lives headless and at full speed, with the
 * same engine the game runs, and gathers what happened into a report.
 *
 * Phase 0 has one persona, the wanderer, because travel is the only thing a
 * life can do yet. The personas of the design bible (careful crafter, reckless
 * adventurer, court climber, merchant, scholar-mage, idler) come with their
 * systems.
 */
import {
  Engine,
  HOURS_PER_DAY,
  HOURS_PER_YEAR,
  WORLD,
  dateAt,
  newGame,
  nextRandom,
} from '@allora/engine';

export interface Persona {
  name: string;
  about: string;
  /** Called once per game hour, before the tick. May give the engine orders. */
  act(engine: Engine): void;
}

/** Walks to a place picked at random whenever it is standing still. */
export const wanderer: Persona = {
  name: 'Wanderer',
  about: 'Sets out for a random place whenever it is standing still.',
  act(engine) {
    if (engine.state.journey) return;
    const others = WORLD.places.filter((p) => p.id !== engine.state.place);
    const roll = nextRandom(engine.state.rng, engine.state.seed, 'bot');
    const target = others[Math.floor(roll * others.length)];
    if (target) engine.handle({ type: 'travel', to: target.id }, 0);
  },
};

/** Lives in Ostwick and does whatever work is to hand. */
export const villager: Persona = {
  name: 'Villager',
  about: 'Stays in Ostwick and takes up any work that can be done at the hour.',
  act(engine) {
    if (engine.state.doing || engine.state.asleep) return;
    const options = engine.snapshot().canDo;
    const roll = nextRandom(engine.state.rng, engine.state.seed, 'bot');
    const pick = options[Math.floor(roll * options.length)];
    if (pick) engine.handle({ type: 'do', activity: pick }, 0);
  },
};

export interface LifeResult {
  seed: number;
  hours: number;
  journeys: number;
  hoursOnTheRoad: number;
  /** Place id → times arrived there. */
  arrivals: Record<string, number>;
  endPlace: string;
  endDate: string;
  meals: number;
  hoursSlept: number;
  /** Skill id → level reached. */
  skills: Record<string, number>;
  /** Degree of result → times it came up. */
  checks: Record<string, number>;
  /** Hours spent on activities. */
  hoursWorked: number;
  /** Each need: its mean over the life, and the lowest it fell. */
  needs: Record<'vigour' | 'health' | 'spirits', { mean: number; low: number }>;
}

export function playLife(persona: Persona, seed: number, hours: number): LifeResult {
  const engine = new Engine(newGame(seed, 0));
  const result: LifeResult = {
    seed,
    hours,
    journeys: 0,
    hoursOnTheRoad: 0,
    arrivals: {},
    endPlace: '',
    endDate: '',
    meals: 0,
    hoursSlept: 0,
    skills: {},
    checks: {},
    hoursWorked: 0,
    needs: {
      vigour: { mean: 0, low: 100 },
      health: { mean: 0, low: 100 },
      spirits: { mean: 0, low: 100 },
    },
  };
  engine.bus.on('Arrived', ({ place }) => {
    result.journeys += 1;
    result.arrivals[place] = (result.arrivals[place] ?? 0) + 1;
  });
  for (let h = 0; h < hours; h++) {
    persona.act(engine);
    if (engine.state.journey) result.hoursOnTheRoad += 1;
    if (engine.state.doing && !engine.state.asleep) result.hoursWorked += 1;
    engine.tick();
    for (const key of ['vigour', 'health', 'spirits'] as const) {
      const v = engine.state.needs[key];
      result.needs[key].mean += v / hours;
      if (v < result.needs[key].low) result.needs[key].low = v;
    }
  }
  for (const [id, k] of Object.entries(engine.state.skills)) result.skills[id] = k.level;
  result.checks = { ...engine.state.checks };
  result.meals = engine.state.meals;
  result.hoursSlept = engine.state.hoursSlept;
  const date = dateAt(engine.state.hours);
  result.endPlace = engine.state.place;
  result.endDate = `Day ${date.day} of ${date.season}, ${date.year} AR`;
  return result;
}

export interface BalanceRun {
  persona: Persona;
  lives: LifeResult[];
  gameYears: number;
  /** Real milliseconds the whole run took. */
  elapsedMs: number;
  /** Real milliseconds per simulated game day, per life. The Phase 0 gate is under 20. */
  msPerGameDay: number;
}

export const DAY_BUDGET_MS = 20;

export function runBalance(
  options: { lives?: number; gameYears?: number; persona?: Persona; now?: () => number } = {},
): BalanceRun {
  const persona = options.persona ?? wanderer;
  const count = options.lives ?? 20;
  const gameYears = options.gameYears ?? 1;
  const now = options.now ?? (() => performance.now());
  const hours = gameYears * HOURS_PER_YEAR;
  const start = now();
  const lives = Array.from({ length: count }, (_, i) => playLife(persona, i + 1, hours));
  const elapsedMs = now() - start;
  const days = (count * hours) / HOURS_PER_DAY;
  return { persona, lives, gameYears, elapsedMs, msPerGameDay: elapsedMs / days };
}

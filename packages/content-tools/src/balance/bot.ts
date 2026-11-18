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
  HOMES,
  HOURS_PER_DAY,
  HOURS_PER_YEAR,
  WORLD,
  dateAt,
  newGame,
  nextRandom,
  buy,
  buyPrice,
  carried,
  isOpen,
  offers,
  PACK,
  sell,
} from '@allora/engine';

export interface Persona {
  name: string;
  about: string;
  /** Where this persona's lives begin and have their bed. Ostwick, if left out. */
  home?: string;
  /** What the life starts with in its purse, if not the usual. */
  money?: number;
  /** Called once per game hour, before the tick. May give the engine orders. */
  act(engine: Engine): void;
}

/** Walks to a place picked at random whenever it is standing still. */
export const wanderer: Persona = {
  name: 'Wanderer',
  about: 'Sets out for a random place whenever it is standing still, with a purse for fares.',
  // It never works: it travels on what it set out with, so that it can reach every place.
  money: 1000,
  act(engine) {
    if (engine.state.journey) return;
    // Only where the purse can pay the tolls and fares.
    const costs = engine.world.costsFrom(engine.state.place);
    const others = WORLD.places.filter(
      (p) => p.id !== engine.state.place && (costs[p.id] ?? Infinity) <= engine.state.money,
    );
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

/** Sets standing orders and leaves the life to itself. */
export const idler: Persona = {
  name: 'Idler',
  about: 'Orders the life to keep at paid work, and never touches it again.',
  act(engine) {
    if (engine.state.orders.work !== 'always')
      engine.handle({ type: 'setOrders', orders: { work: 'always' } }, 0);
  },
};

/** The snapshot, for personas that look at the market. */
const snapEarly = (engine: Engine) => (engine.state.asleep ? undefined : engine.snapshot());

/** A persona that holds a post: duties, cases, and each trial as soon as it is offered. */
function careerist(
  name: string,
  about: string,
  post: string,
  home: string,
  duties: string,
): Persona {
  return {
    name,
    about,
    home,
    act(engine) {
      const state = engine.state;
      if (state.asleep) return;
      if (!state.post) {
        engine.handle({ type: 'takePost', post }, 0);
        return;
      }
      // A careful life keeps the tool of its trade, and buys another when it breaks.
      const tool = engine.world.toolsBySkill.get(engine.world.posts.get(post)?.skill ?? '')?.[0];
      if (tool && !state.goods[tool.item] && state.money > 40 && snapEarly(engine)?.market?.open)
        engine.handle({ type: 'buy', item: tool.item }, 0);
      // A master with money put by lives as a master.
      if (state.orders.living !== 'rich' && state.post.rank >= 2 && state.money > 1500)
        engine.handle({ type: 'setOrders', orders: { living: 'rich' } }, 0);
      // A life that can afford it moves from its room into a cottage.
      if (state.lodging?.kind === 'room' && state.money > 200 && state.place === state.home)
        engine.handle({ type: 'rent', home: 'cottage' }, 0);
      const snap = engine.snapshot();
      if (snap.venture) {
        if (snap.venture.hoursLeft > 0 || state.doing) return;
        // The bold way when it is likely enough; otherwise the safe one.
        const bold = snap.venture.choices.slice(1).find((c) => c.chance >= 0.6);
        const pick = bold ?? snap.venture.choices[0];
        if (pick) engine.handle({ type: 'step', approach: pick.id }, 0);
        return;
      }
      if (state.doing) return;
      const offered = offers(state, engine.world);
      const trial = offered.find((c) => c.trialFor !== undefined);
      const roll = nextRandom(state.rng, state.seed, 'bot');
      const hardest = offered
        .filter((c) => c.trialFor === undefined)
        .sort((a, b) => b.dc - a.dc)[0];
      if (trial) engine.handle({ type: 'takeCase', case: trial.id }, 0);
      else if (hardest && roll < 0.6) engine.handle({ type: 'takeCase', case: hardest.id }, 0);
      else {
        const mine = snap.canDo.filter((id) => id.startsWith(duties));
        const duty = mine[Math.floor(roll * mine.length) % Math.max(1, mine.length)];
        if (duty) engine.handle({ type: 'do', activity: duty }, 0);
      }
    },
  };
}

export const smith = careerist(
  'Smith',
  'Holds the post of guild-smith in Kesselhaven, takes commissions and sits each trial when it is offered.',
  'post_kesselhaven_guild_smith',
  'kess_market',
  'activity_smith_',
);

export const butler = careerist(
  'Butler',
  'Serves in the household of Burg Tennfels, handles incidents and sits each trial when it is offered.',
  'post_tennfels_steward',
  'tennfels',
  'activity_butler_',
);

/** Buys what a place makes, carries it to the nearest market that lacks it, and sells it there. */
export const pedlar: Persona = {
  name: 'Pedlar',
  about: 'Buys what one market makes and sells it at the nearest market that lacks it.',
  act(engine) {
    const { state, world } = engine;
    if (state.journey || state.asleep) return;
    const date = dateAt(state.hours);
    const here = world.markets.get(state.place);
    const others = [...world.markets.values()].filter((m) => m.place !== state.place);
    const nearest = (ms: typeof others) => {
      const hours = world.hoursFrom(state.place);
      return ms.sort((a, b) => (hours[a.place] ?? 1e9) - (hours[b.place] ?? 1e9))[0];
    };
    const go = (to: string | undefined) => {
      if (to && (world.costsFrom(state.place)[to] ?? Infinity) <= state.money)
        engine.handle({ type: 'travel', to }, 0);
    };
    const held = Object.keys(state.goods).filter((id) => !world.items.get(id)?.food);
    if (!here) return go(nearest(others)?.place);
    if (!isOpen(here, date)) return;
    // Sell whatever is scarce here.
    for (const id of held) {
      if (here.sells.includes(id)) continue;
      while (state.goods[id]) sell(state, world, id, date);
    }
    const left = Object.keys(state.goods).filter((id) => !world.items.get(id)?.food);
    if (left.length > 0)
      return go(nearest(others.filter((m) => !m.sells.includes(left[0] ?? '')))?.place);
    // Bread for the road, then a load of the dearest thing made here that sells elsewhere.
    while ((state.goods.bread ?? 0) < 3 && here.sells.includes('bread') && state.money > 5)
      buy(state, world, 'bread', date);
    const load = here.makes
      .filter((id) => others.some((m) => !m.sells.includes(id)))
      .sort((a, b) => (world.items.get(b)?.value ?? 0) - (world.items.get(a)?.value ?? 0))[0];
    if (!load) return go(nearest(others.filter((m) => m.makes.length > 0))?.place);
    const target = nearest(others.filter((m) => !m.sells.includes(load)));
    // Only while it is still cheap enough to sell on at a gain.
    const cap = (world.items.get(load)?.value ?? 1) * 0.9;
    while (carried(state) < PACK) {
      const price = buyPrice(state, world, here, load, date);
      if (price === undefined || price > cap || price > state.money - 2) break;
      buy(state, world, load, date);
    }
    if (state.goods[load]) return go(target?.place);
    // Nothing worth carrying from here today: try another place that makes things.
    const makers = others.filter((m) => m.makes.length > 0);
    const roll = nextRandom(state.rng, state.seed, 'bot');
    go(makers[Math.floor(roll * makers.length)]?.place);
  },
};

export const inquirer = careerist(
  'Inquirer',
  'Holds a place in the Office of the Cerdans in Marre, works cases to an accusation and sits each trial when it is offered.',
  'post_cerdans_inquirer',
  'marre_palace',
  'activity_cerdans_',
);

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
  /** Rank reached in a post (0 to 3), or −1 with no post; and the game day each rank was won. */
  rank: number;
  rankDays: number[];
  post: string;
  works: number;
  /** Things that happened on the road. */
  roadEvents: number;
  /** Degree of result → times it came up. */
  checks: Record<string, number>;
  /** Hours spent on activities. */
  hoursWorked: number;
  /** Money: earned, spent, meals of scraps, and the purse at the end of each game year. */
  earned: number;
  spent: number;
  poorMeals: number;
  purse: number[];
  /** Each need: its mean over the life, and the lowest it fell. */
  needs: Record<'vigour' | 'health' | 'spirits', { mean: number; low: number }>;
}

export function playLife(persona: Persona, seed: number, hours: number): LifeResult {
  const start = newGame(seed, 0);
  if (persona.home) {
    start.place = persona.home;
    start.home = persona.home;
    const kind = WORLD.places.find((p) => p.id === persona.home)?.kind;
    start.lodging = {
      kind: 'room',
      rent: HOMES.room.rent[kind === 'city' ? 'city' : 'settled'],
      owed: 0,
    };
  }
  if (persona.money !== undefined) start.money = persona.money;
  const engine = new Engine(start);
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
    rank: -1,
    rankDays: [],
    post: '',
    works: 0,
    roadEvents: 0,
    hoursWorked: 0,
    earned: 0,
    spent: 0,
    poorMeals: 0,
    purse: [],
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
    const busy = engine.state.doing || engine.state.venture?.working;
    if (busy && !engine.state.asleep) result.hoursWorked += 1;
    engine.tick();
    if ((h + 1) % HOURS_PER_YEAR === 0) result.purse.push(engine.state.money);
    const rank = engine.state.post?.rank ?? -1;
    if (rank > result.rank) {
      result.rank = rank;
      result.rankDays[rank] = Math.floor(h / HOURS_PER_DAY);
    }
    for (const key of ['vigour', 'health', 'spirits'] as const) {
      const v = engine.state.needs[key];
      result.needs[key].mean += v / hours;
      if (v < result.needs[key].low) result.needs[key].low = v;
    }
  }
  for (const [id, k] of Object.entries(engine.state.skills)) result.skills[id] = k.level;
  result.checks = { ...engine.state.checks };
  result.roadEvents = engine.state.roadEvents;
  result.works = engine.state.works.length;
  result.post = engine.state.post?.id ?? '';
  result.earned = engine.state.earned;
  result.spent = engine.state.spent;
  result.poorMeals = engine.state.poorMeals;
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

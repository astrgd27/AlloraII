/** Renders the balance report posted on every pull request. */
import { WORLD, hoursToLevel } from '@allora/engine';
import { DAY_BUDGET_MS, type BalanceRun } from './bot';

/** Marks the report's comment so the next run updates it instead of adding another. */
export const REPORT_MARKER = '<!-- allora-balance-report -->';

const NOT_YET = '_No data yet: this system is not built._';
const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const nameOf = (id: string): string => WORLD.places.find((p) => p.id === id)?.name ?? id;

export function renderReport(run: BalanceRun, options: { timings?: boolean } = {}): string {
  const { lives } = run;
  const totalHours = lives.reduce((n, l) => n + l.hours, 0);
  const arrivals = new Map<string, number>(WORLD.places.map((p) => [p.id, 0]));
  for (const life of lives) {
    for (const [place, n] of Object.entries(life.arrivals)) {
      arrivals.set(place, (arrivals.get(place) ?? 0) + n);
    }
  }
  const ranked = [...arrivals].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const never = ranked.filter(([, n]) => n === 0).map(([id]) => nameOf(id));
  const onRoad = lives.reduce((n, l) => n + l.hoursOnTheRoad, 0);
  const withinBudget = run.msPerGameDay < DAY_BUDGET_MS;

  const lines = [
    REPORT_MARKER,
    '## Balance report',
    '',
    `${lives.length} lives · persona: **${run.persona.name}** (${run.persona.about.replace(/\.$/, '')}) · ${run.gameYears} game ${run.gameYears === 1 ? 'year' : 'years'} each · seeds 1–${lives.length}`,
    '',
  ];
  if (options.timings !== false) {
    lines.push(
      '### Performance budget',
      '',
      `- One game day simulates in **${run.msPerGameDay.toFixed(4)} ms** (budget: under ${DAY_BUDGET_MS} ms): ${withinBudget ? 'within budget' : '**over budget**'}.`,
      `- The whole run (${(totalHours / 24).toLocaleString('en')} game days) took ${Math.round(run.elapsedMs)} ms.`,
      '',
    );
  }
  const travels = lives.some((l) => l.journeys > 0);
  if (!travels) lines.push('### Travel', '', '_This persona stays at home._', '');
  else
    lines.push(
      '### Travel',
      '',
      `- Journeys finished per life: ${mean(lives.map((l) => l.journeys)).toFixed(1)} on average.`,
      `- Things that happened on the way: ${mean(lives.map((l) => l.roadEvents)).toFixed(0)} per life.`,
      `- Time on the road: ${((onRoad / totalHours) * 100).toFixed(1)}% of all hours.`,
      `- Most visited: ${ranked
        .slice(0, 3)
        .map(([id, n]) => `${nameOf(id)} (${n})`)
        .join(', ')}.`,
      `- Least visited: ${ranked
        .slice(-3)
        .reverse()
        .map(([id, n]) => `${nameOf(id)} (${n})`)
        .join(', ')}.`,
      '',
    );
  lines.push(
    '### Needs',
    '',
    '| Need | Mean | Lowest any life fell |',
    '| --- | ---: | ---: |',
    ...(['vigour', 'health', 'spirits'] as const).map(
      (k) =>
        `| ${k} | ${mean(lives.map((l) => l.needs[k].mean)).toFixed(1)} | ${Math.min(...lives.map((l) => l.needs[k].low)).toFixed(1)} |`,
    ),
    '',
    `- Sleep: ${(mean(lives.map((l) => l.hoursSlept)) / (run.gameYears * 112)).toFixed(1)} hours a day. Meals: ${(mean(lives.map((l) => l.meals)) / (run.gameYears * 112)).toFixed(1)} a day.`,
    '',
    '### Dead content',
    '',
    !travels
      ? '- Places nobody visited: not measured for a persona that stays at home.'
      : never.length === 0
        ? `- Places nobody visited: none (all ${WORLD.places.length} were reached).`
        : `- **Places nobody visited (${never.length}):** ${never.join(', ')}.`,
    '- Items nobody makes, cases nobody finishes: ' + NOT_YET,
    '',
    '### Hours to level',
    '',
    ...skillLines(run),
    '',
    '### Earnings per hour',
    '',
    NOT_YET,
    '',
    '### Money supply',
    '',
    NOT_YET,
    '',
    '### Check odds',
    '',
    ...checkLines(run),
    '',
    '### Legend pace',
    '',
    NOT_YET,
    '',
  );
  return lines.join('\n');
}

/** Levels reached in the run, against the hours the curve says they should take. */
function skillLines(run: BalanceRun): string[] {
  const ids = [...new Set(run.lives.flatMap((l) => Object.keys(l.skills)))].sort();
  if (ids.length === 0) return ['_This persona does no work that trains a skill._'];
  const worked = mean(run.lives.map((l) => l.hoursWorked));
  return [
    `Hours worked per life: ${worked.toFixed(0)}. Target curve: level 10 in ${hoursToLevel(10).toFixed(0)} hours of work at the edge, 25 in ${hoursToLevel(25).toFixed(0)}, 50 in ${hoursToLevel(50).toFixed(0)}.`,
    '',
    '| Skill | Mean level | Highest |',
    '| --- | ---: | ---: |',
    ...ids.map((id) => {
      const levels = run.lives.map((l) => l.skills[id] ?? 0);
      return `| ${WORLD.skills?.find((s) => s.id === id)?.name ?? id} | ${mean(levels).toFixed(1)} | ${Math.max(...levels)} |`;
    }),
  ];
}

/** The results of the checks lives actually faced. */
function checkLines(run: BalanceRun): string[] {
  const order = ['triumph', 'success', 'cost', 'failure', 'disaster'];
  const total = (d: string) => run.lives.reduce((n, l) => n + (l.checks[d] ?? 0), 0);
  const all = order.reduce((n, d) => n + total(d), 0);
  if (all === 0) return ['_This persona faces no checks._'];
  const won = (total('triumph') + total('success')) / all;
  return [
    `${all} checks faced. Won ${(won * 100).toFixed(0)}% of them${won > 0.9 ? ' (**mostly trivial**)' : won < 0.2 ? ' (**mostly hopeless**)' : ''}.`,
    '',
    '| Result | Share |',
    '| --- | ---: |',
    ...order.map((d) => `| ${d} | ${((total(d) / all) * 100).toFixed(1)}% |`),
  ];
}

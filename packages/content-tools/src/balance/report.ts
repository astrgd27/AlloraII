/** Renders the balance report posted on every pull request. */
import { WORLD } from '@allora/engine';
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
  lines.push(
    '### Travel',
    '',
    `- Journeys finished per life: ${mean(lives.map((l) => l.journeys)).toFixed(1)} on average.`,
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
    '### Dead content',
    '',
    never.length === 0
      ? `- Places nobody visited: none (all ${WORLD.places.length} were reached).`
      : `- **Places nobody visited (${never.length}):** ${never.join(', ')}.`,
    '- Items nobody makes, cases nobody finishes: ' + NOT_YET,
    '',
    '### Hours to level',
    '',
    NOT_YET,
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
    NOT_YET,
    '',
    '### Legend pace',
    '',
    NOT_YET,
    '',
  );
  return lines.join('\n');
}

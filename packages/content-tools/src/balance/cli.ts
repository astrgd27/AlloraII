/**
 * `pnpm balance`: runs the balance bot and prints its report.
 *   --out <file>   also writes the report to a file (CI posts it on the pull request)
 *   --lives <n>    how many lives to play (default 20)
 *   --years <n>    game years per life (default 1)
 */
import { writeFile } from 'node:fs/promises';
import { DAY_BUDGET_MS, runBalance, villager, wanderer } from './bot';
import { REPORT_MARKER, renderReport } from './report';

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

async function main(): Promise<void> {
  const lives = Number(arg('--lives') ?? 20);
  const gameYears = Number(arg('--years') ?? 1);
  const run = runBalance({ lives, gameYears, persona: wanderer });
  const village = runBalance({ lives, gameYears, persona: villager });
  const report = `${renderReport(run)}\n---\n\n${renderReport(village, { timings: false }).replace(REPORT_MARKER, '').replace('## Balance report', '## Balance report: the villager')}`;
  console.log(report);
  const out = arg('--out');
  if (out) await writeFile(out, report);
  if (run.msPerGameDay >= DAY_BUDGET_MS) {
    console.error(`Over the performance budget: ${run.msPerGameDay.toFixed(2)} ms per game day.`);
    process.exit(1);
  }
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

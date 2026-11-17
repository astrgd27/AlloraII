import type { Snapshot } from '@allora/engine';
import { formatDate, formatHour, pf } from './format';
import { Bar } from './Panel';
import { TITLE } from './title';

const NEEDS = [
  ['vigour', 'Vigour', 'Strength for work and the road. Sleep and meals restore it.'],
  ['health', 'Health', 'Falls when vigour runs out. Mends in sleep.'],
  ['spirits', 'Spirits', 'Lifted by company, good meals and a bed at home.'],
] as const;

/** The bar across the top: the date, the needs and the purse. Display only. */
export function TopBar({ snapshot }: { snapshot: Snapshot }) {
  return (
    <header className="topbar">
      <div className="crest">{TITLE}</div>
      <div className="clock" aria-label="Date and hour">
        <span className="date" data-testid="date">
          {formatDate(snapshot.date)}
        </span>
        <span className="hour" data-testid="hour" data-hours={snapshot.hours}>
          {formatHour(snapshot.date)}
        </span>
        <Bar value={snapshot.hourProgress} label="The hour" tone="thin" />
      </div>
      <ul className="needs" data-testid="needs">
        {NEEDS.map(([key, label, hint]) => {
          const v = snapshot.needs[key];
          return (
            <li key={key} title={hint}>
              <span className="stat-label">{label}</span>
              <Bar value={v / 100} label={label} tone={v < 30 ? 'low' : key} />
              <span className="stat-value">{Math.round(v)}</span>
            </li>
          );
        })}
      </ul>
      <div className="purse" data-testid="purse" title="The purse. Work fills it; meals empty it.">
        <span className="coin" aria-hidden="true" />
        {pf(snapshot.money)}
      </div>
    </header>
  );
}

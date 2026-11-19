import { SPEEDS, type Order, type Snapshot } from '@allora/engine';
import { formatDate, formatHour, pf } from './format';
import { Bar } from './Panel';
import { TITLE } from './title';

const NEEDS = [
  ['vigour', 'Vigour', 'Strength for work and the road. Sleep and meals restore it.'],
  ['health', 'Health', 'Falls when vigour runs out. Mends in sleep.'],
  ['spirits', 'Spirits', 'Lifted by company, good meals and a bed at home.'],
] as const;

/** The bar across the top: the date, the needs and the purse. Display only. */
const WEATHER_HINT: Record<string, string> = {
  fair: 'Fair weather: good for the road and the spirits.',
  overcast: 'Grey, but dry.',
  rain: 'Rain: roads are slower, and spirits sink on the way.',
  fog: 'Fog: boats go slowly, roads a little slower.',
  snow: 'Snow: roads are much slower and the cold tires.',
  heat: 'Heat: the road tires.',
  storm: 'Storm: no boat puts out, and the roads are hard going.',
};

const PACE = ['A game hour each minute', 'A game hour each six seconds', 'A game hour each second'];

/** Pause, and the pace of the clock. Keys: space to pause, 1 2 3 for the pace. */
function TimeControls({ snapshot, send }: { snapshot: Snapshot; send: (order: Order) => void }) {
  return (
    <div className="time" data-testid="time">
      <button
        type="button"
        className={snapshot.paused ? 'paused' : ''}
        aria-label={snapshot.paused ? 'Resume' : 'Pause'}
        title={
          snapshot.paused
            ? 'Resume (space)'
            : 'Pause (space). Nothing happens while paused, here or away.'
        }
        onClick={() => send({ type: snapshot.paused ? 'resume' : 'pause' })}
      >
        {snapshot.paused ? '▶' : '❚❚'}
      </button>
      {SPEEDS.map((s, i) => (
        <button
          key={s}
          type="button"
          aria-pressed={!snapshot.paused && snapshot.speed === s}
          title={`${PACE[i]} (${i + 1})`}
          data-speed={s}
          onClick={() => {
            if (snapshot.paused) send({ type: 'resume' });
            send({ type: 'speed', speed: s });
          }}
        >
          {'›'.repeat(i + 1)}
        </button>
      ))}
    </div>
  );
}

export function TopBar({
  snapshot,
  send,
  onCodex,
}: {
  snapshot: Snapshot;
  send: (order: Order) => void;
  onCodex: () => void;
}) {
  return (
    <header className="topbar">
      <div className="crest">{TITLE}</div>
      <button
        type="button"
        className="codex-open"
        data-testid="codex-open"
        title="The codex: all your lives have learned (C)"
        onClick={onCodex}
      >
        Codex
      </button>
      <div className="clock" aria-label="Date and hour">
        <span className="date" data-testid="date">
          {formatDate(snapshot.date)}
        </span>
        <span className="hour" data-testid="hour" data-hours={snapshot.hours}>
          {snapshot.paused ? 'Paused' : formatHour(snapshot.date)}
        </span>
        <Bar value={snapshot.hourProgress} label="The hour" tone="thin" />
      </div>
      <div
        className="weather"
        data-testid="weather"
        title={WEATHER_HINT[snapshot.weather.id] ?? ''}
      >
        {snapshot.weather.name}
      </div>
      <TimeControls snapshot={snapshot} send={send} />
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

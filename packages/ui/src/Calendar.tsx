import { DAYS_PER_SEASON, SEASONS, WORLD, type Snapshot } from '@allora/engine';

const placeName = (id: string): string => WORLD.places.find((p) => p.id === id)?.name ?? id;
const DAYS_PER_YEAR = DAYS_PER_SEASON * SEASONS.length;

/** The feasts of the year, the next first. Display only. */
export function Calendar({ snapshot }: { snapshot: Snapshot }) {
  const today = snapshot.date.seasonIndex * DAYS_PER_SEASON + snapshot.date.day - 1;
  const on = new Set(snapshot.feasts.map((f) => f.id));
  const feasts = [...(WORLD.feasts ?? [])]
    .map((f) => {
      const start = f.season * DAYS_PER_SEASON + f.from - 1;
      const end = f.season * DAYS_PER_SEASON + f.to - 1;
      const until = on.has(f.id) ? 0 : (start - today + DAYS_PER_YEAR) % DAYS_PER_YEAR;
      return { f, until, end };
    })
    .sort((a, b) => a.until - b.until);
  return (
    <ul className="calendar" data-testid="calendar">
      {feasts.map(({ f, until }) => (
        <li key={f.id} className={until === 0 ? 'on' : ''} title={f.text}>
          <span>
            {f.name}
            <span className="quiet"> · {placeName(f.place)}</span>
          </span>
          <span className="quiet">
            {until === 0 ? 'Now' : until === 1 ? 'Tomorrow' : `In ${until} days`}
          </span>
        </li>
      ))}
    </ul>
  );
}

import { WORLD, type Order, type Snapshot } from '@allora/engine';
import { hoursText } from './format';
import { Bar } from './Panel';

const activities = new Map((WORLD.activities ?? []).map((a) => [a.id, a]));
const posts = new Map((WORLD.posts ?? []).map((p) => [p.id, p]));
const cases = new Map((WORLD.cases ?? []).map((c) => [c.id, c]));
const placeName = (id: string): string => WORLD.places.find((p) => p.id === id)?.name ?? id;

interface Now {
  verb: string;
  what: string;
  detail?: string;
  progress?: number;
  stop?: { label: string; order: Order };
}

/** Works out, from the snapshot alone, the one thing the life is doing. */
export function nowOf(snapshot: Snapshot): Now {
  const { journey, doing, venture } = snapshot;
  if (journey) {
    return {
      verb: snapshot.asleep ? 'Camped on the way to' : 'Travelling to',
      what: placeName(journey.to),
      detail: `${hoursText(Math.ceil(journey.hoursLeft))} to go`,
      progress: journey.legProgress,
      stop: { label: 'Turn back', order: { type: 'turnBack' } },
    };
  }
  if (snapshot.asleep) return { verb: 'Asleep', what: `in ${placeName(snapshot.place)}` };
  if (doing) {
    const a = activities.get(doing.id);
    const total = a?.hours ?? doing.hoursLeft;
    return {
      verb: 'Working',
      what: a?.name ?? doing.id,
      detail: `${hoursText(doing.hoursLeft)} left`,
      progress: (total - doing.hoursLeft + snapshot.hourProgress) / total,
      stop: { label: 'Set it down', order: { type: 'stop' } },
    };
  }
  if (venture && venture.hoursLeft > 0) {
    const step = posts.get(snapshot.post?.id ?? '')?.work[venture.step];
    const total = step?.hours ?? venture.hoursLeft;
    return {
      verb: step?.name ?? 'Working',
      what: cases.get(venture.case)?.name ?? '',
      detail: `${hoursText(venture.hoursLeft)} left`,
      progress: (total - venture.hoursLeft + snapshot.hourProgress) / total,
    };
  }
  if (venture) {
    return {
      verb: 'A case in hand',
      what: cases.get(venture.case)?.name ?? '',
      detail: 'Choose how to go on',
    };
  }
  return { verb: 'At leisure', what: `in ${placeName(snapshot.place)}`, detail: 'Nothing in hand' };
}

/** Always on screen: what the life is doing, and how far along. Display only. */
export function NowBar({ snapshot, send }: { snapshot: Snapshot; send: (order: Order) => void }) {
  const now = nowOf(snapshot);
  return (
    <footer className="nowbar" data-testid="now">
      <div className="now-text">
        <span className="now-verb">{now.verb}</span>
        <span className="now-what" data-testid="now-what">
          {now.what}
        </span>
        {now.detail && <span className="quiet">{now.detail}</span>}
      </div>
      <div className="now-progress">
        {now.progress !== undefined && <Bar value={now.progress} label="Progress" tone="gilt" />}
      </div>
      {now.stop && (
        <button type="button" onClick={() => now.stop && send(now.stop.order)}>
          {now.stop.label}
        </button>
      )}
    </footer>
  );
}

import { WORLD, type Order, type Snapshot } from '@allora/engine';
import { useState } from 'react';

const placeName = new Map(WORLD.places.map((p) => [p.id, p.name]));
const activityName = new Map((WORLD.activities ?? []).map((a) => [a.id, a.name]));
const upbringings = new Map((WORLD.upbringings ?? []).map((u) => [u.id, u]));

const STATE: Record<Snapshot['lives'][number]['state'], string> = {
  asleep: 'Asleep',
  road: 'On the road to',
  case: 'At a commission in',
  work: 'Working',
  idle: 'Idle in',
};

/** Every life, what it is about, and a click to turn to it. Display only. */
export function LivesStrip({
  snapshot,
  send,
}: {
  snapshot: Snapshot;
  send: (order: Order) => void;
}) {
  return (
    <ol className="lives" data-testid="lives">
      {snapshot.lives.map((l, i) => {
        const where = placeName.get(l.place) ?? l.place;
        const what =
          l.state === 'work' && l.doing
            ? `${STATE.work} · ${activityName.get(l.doing) ?? ''}`
            : `${STATE[l.state]} ${l.state === 'asleep' ? `in ${where}` : where}`;
        return (
          <li key={l.name}>
            <button
              type="button"
              data-life={i}
              aria-pressed={l.focus}
              disabled={l.focus}
              title={l.focus ? 'The life in hand' : `Turn to ${l.name}`}
              onClick={() => send({ type: 'focus', life: i })}
            >
              <span className="life-name">{l.name}</span>
              <span className={`life-state ${l.state}`}>{what}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Legend, the threads woven and to weave, and beginning a new life. Display only. */
export function Tapestry({ snapshot, send }: { snapshot: Snapshot; send: (order: Order) => void }) {
  const [chosen, setChosen] = useState<string>();
  const birth = snapshot.births.find((b) => b.upbringing === chosen);
  return (
    <div className="tapestry" data-testid="tapestry">
      <p>
        Legend {snapshot.legend.free}
        <span className="quiet"> · {snapshot.legend.earned} earned by all lives</span>
      </p>
      {snapshot.tapestry.map((n) => (
        <button
          key={n.id}
          type="button"
          data-weave={n.id}
          disabled={Boolean(n.why)}
          title={n.why ?? `Weave it · ${n.cost} Legend`}
          onClick={() => send({ type: 'weave', node: n.id })}
        >
          {n.woven ? 'Woven: ' : ''}
          {n.name}
          <span className="quiet"> · {n.cost}</span>
          {n.why && !n.woven && <span className="why">{n.why}</span>}
        </button>
      ))}
      <h4>A new life</h4>
      {snapshot.births.map((b) => (
        <button
          key={b.upbringing}
          type="button"
          data-birth={b.upbringing}
          aria-pressed={chosen === b.upbringing}
          disabled={Boolean(b.why)}
          title={b.why ?? `Born in ${placeName.get(upbringings.get(b.upbringing)?.place ?? '')}`}
          onClick={() => setChosen(b.upbringing)}
        >
          {upbringings.get(b.upbringing)?.name}
          {b.why && <span className="why">{b.why}</span>}
        </button>
      ))}
      {birth && !birth.why && (
        <div className="names" data-testid="names">
          {birth.names.map((name) => (
            <button
              key={name}
              type="button"
              data-name={name}
              title={`Begin the life of ${name}`}
              onClick={() => {
                send({ type: 'bear', upbringing: birth.upbringing, name });
                setChosen(undefined);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { WORLD, oddsWord, type Order, type Snapshot } from '@allora/engine';
import { hoursText } from './format';

const byId = new Map((WORLD.activities ?? []).map((a) => [a.id, a]));

/** What can be done here and now, and what is in hand. Display only. */
export function Activities({
  snapshot,
  send,
}: {
  snapshot: Snapshot;
  send: (order: Order) => void;
}) {
  const doing = snapshot.doing ? byId.get(snapshot.doing.id) : undefined;
  if (doing && snapshot.doing) {
    return (
      <section className="activities" data-testid="doing">
        <p>
          {doing.name}
          <span className="quiet"> · {hoursText(snapshot.doing.hoursLeft)}</span>
        </p>
        <p className="quiet">{doing.text}</p>
        <button type="button" onClick={() => send({ type: 'stop' })}>
          Set it down
        </button>
      </section>
    );
  }
  const options = snapshot.canDo.flatMap((id) => byId.get(id) ?? []);
  if (options.length === 0) return null;
  return (
    <section className="activities" data-testid="activities">
      <ul>
        {options.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              data-activity={a.id}
              onClick={() => send({ type: 'do', activity: a.id })}
            >
              {a.name}
              <span className="quiet">
                {' '}
                · {a.subName} · {hoursText(a.hours)}
                {snapshot.chances[a.id] !== undefined && (
                  <span title={`${Math.round((snapshot.chances[a.id] ?? 0) * 100)} in 100`}>
                    {' '}
                    · {oddsWord(snapshot.chances[a.id] ?? 0)}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { WORLD, type Order, type Snapshot } from '@allora/engine';
import { hoursText, pf } from './format';

const skillName = new Map((WORLD.skills ?? []).map((s) => [s.id, s.name]));
type Send = (order: Order) => void;

/** What happened while the player was away. Shown in place until put away. Display only. */
export function Report({ snapshot, send }: { snapshot: Snapshot; send: Send }) {
  const r = snapshot.report;
  if (!r) return null;
  const levels = Object.entries(r.levels);
  return (
    <section className="report" data-testid="report">
      <p>
        Away <span className="quiet">· {hoursText(r.hours)}</span>
      </p>
      <p className="quiet">
        {r.tasks} {r.tasks === 1 ? 'task' : 'tasks'} done · {pf(r.earned)} earned · {pf(r.spent)}{' '}
        spent
      </p>
      {levels.length > 0 && (
        <p className="quiet">
          {levels.map(([id, n]) => `${skillName.get(id) ?? id} +${n}`).join(' · ')}
        </p>
      )}
      {r.poorMeals > 0 && <p className="quiet">Ate scraps {r.poorMeals} times</p>}
      {r.turnedBack && <p className="quiet">Turned back from the road, hurt</p>}
      {r.cases > 0 && (
        <p data-testid="waiting">
          {r.trial ? 'A trial waits' : `${r.cases} ${r.cases === 1 ? 'case waits' : 'cases wait'}`}
        </p>
      )}
      <button type="button" onClick={() => send({ type: 'readReport' })}>
        Put away
      </button>
    </section>
  );
}

const WORK_WORDS = { never: 'Never', away: 'While away', always: 'Always' } as const;

/** The routine decisions a life settles for itself. Display only. */
export function Orders({ snapshot, send }: { snapshot: Snapshot; send: Send }) {
  const o = snapshot.orders;
  return (
    <details className="orders" data-testid="orders">
      <summary>Standing orders</summary>
      <p>
        Work unasked
        {(['never', 'away', 'always'] as const).map((work) => (
          <button
            key={work}
            type="button"
            aria-pressed={o.work === work}
            onClick={() => send({ type: 'setOrders', orders: { work } })}
          >
            {WORK_WORDS[work]}
          </button>
        ))}
      </p>
      <p>
        <button
          type="button"
          aria-pressed={o.turnBackIfHurt}
          onClick={() => send({ type: 'setOrders', orders: { turnBackIfHurt: !o.turnBackIfHurt } })}
        >
          Turn back if hurt
        </button>
        <button
          type="button"
          aria-pressed={o.campAtNight}
          onClick={() => send({ type: 'setOrders', orders: { campAtNight: !o.campAtNight } })}
        >
          Camp at night
        </button>
      </p>
    </details>
  );
}

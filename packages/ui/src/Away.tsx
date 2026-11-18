import { WORLD, type Order, type Snapshot } from '@allora/engine';
import { hoursText, ordinal, pf } from './format';

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

/** An hour of the day, with a step down and a step up. */
function Hour({ value, set }: { value: number; set: (h: number) => void }) {
  return (
    <span className="hour-step">
      <button type="button" title="An hour earlier" onClick={() => set((value + 23) % 24)}>
        −
      </button>
      <span className="num">{ordinal(value)}</span>
      <button type="button" title="An hour later" onClick={() => set((value + 1) % 24)}>
        +
      </button>
    </span>
  );
}

const LIVING_WORDS = {
  plain: ['Plainly', 'Spend nothing on comfort, and save'],
  comfortable: [
    'Comfortably',
    'Spend a little of what is put by on good food and a fire, for the spirits',
  ],
  rich: ['Richly', 'Spend freely on fine things, for the spirits'],
} as const;

const WORK_WORDS = { never: 'Never', away: 'While away', always: 'Always' } as const;

/** The routine decisions a life settles for itself. Display only. */
export function Orders({ snapshot, send }: { snapshot: Snapshot; send: Send }) {
  const o = snapshot.orders;
  return (
    <div className="orders" data-testid="orders">
      <p>
        Work unasked
        {(['never', 'away', 'always'] as const).map((work) => (
          <button
            key={work}
            type="button"
            aria-pressed={o.work === work}
            title="Whether the life takes up paid work and duties by itself. Cases always wait for you."
            onClick={() => send({ type: 'setOrders', orders: { work } })}
          >
            {WORK_WORDS[work]}
          </button>
        ))}
      </p>
      <p>
        Live
        {(['plain', 'comfortable', 'rich'] as const).map((living) => (
          <button
            key={living}
            type="button"
            aria-pressed={o.living === living}
            title={LIVING_WORDS[living][1]}
            onClick={() => send({ type: 'setOrders', orders: { living } })}
          >
            {LIVING_WORDS[living][0]}
          </button>
        ))}
      </p>
      <p className="hours-row">
        <span>To bed</span>
        <Hour
          value={o.sleepFrom}
          set={(sleepFrom) => send({ type: 'setOrders', orders: { sleepFrom } })}
        />
        <span>Up</span>
        <Hour value={o.wakeAt} set={(wakeAt) => send({ type: 'setOrders', orders: { wakeAt } })} />
      </p>
      <p>
        <button
          type="button"
          aria-pressed={o.turnBackIfHurt}
          title="On the road with health low, turn back to the place last left"
          onClick={() => send({ type: 'setOrders', orders: { turnBackIfHurt: !o.turnBackIfHurt } })}
        >
          Turn back if hurt
        </button>
        <button
          type="button"
          aria-pressed={o.inn}
          title="Away from home, pay for an inn bed where there is one"
          onClick={() => send({ type: 'setOrders', orders: { inn: !o.inn } })}
        >
          Inns on the road
        </button>
        <button
          type="button"
          aria-pressed={o.campAtNight}
          title="On a road at night, stop and sleep rather than walk on"
          onClick={() => send({ type: 'setOrders', orders: { campAtNight: !o.campAtNight } })}
        >
          Camp at night
        </button>
      </p>
    </div>
  );
}

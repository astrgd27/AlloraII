import { WORLD, oddsWord, type Order, type Snapshot } from '@allora/engine';
import { hoursText, ordinal, pf } from './format';

const byId = new Map((WORLD.activities ?? []).map((a) => [a.id, a]));
const skillName = new Map((WORLD.skills ?? []).map((s) => [s.id, s.name]));
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

/** Says a refusal in full: when the work can be done, if the hour or season is wrong. */
function reasonText(reason: string, a: { from: number; to: number; seasons?: number[] }): string {
  if (reason === 'Not at this hour')
    return `From the ${ordinal(a.from)} hour to the ${ordinal(a.to)}`;
  if (reason === 'Out of season')
    return `Only in ${(a.seasons ?? []).map((s) => SEASONS[s]).join(' and ')}`;
  return reason;
}

/** All the work of this place: what can be begun now, and why the rest cannot. Display only. */
export function Activities({
  snapshot,
  send,
}: {
  snapshot: Snapshot;
  send: (order: Order) => void;
}) {
  const rows = snapshot.work
    .flatMap((w) => {
      const a = byId.get(w.id);
      return a ? [{ a, reason: w.reason }] : [];
    })
    .sort((x, y) => Number(Boolean(x.reason)) - Number(Boolean(y.reason)) || x.a.from - y.a.from);
  if (rows.length === 0) return <p className="quiet">There is no work here.</p>;
  return (
    <section className="activities" data-testid="activities">
      <ul>
        {rows.map(({ a, reason }) => {
          const chance = snapshot.chances[a.id];
          const why = reason ? reasonText(reason, a) : undefined;
          const skill = a.skill ? skillName.get(a.skill) : undefined;
          return (
            <li key={a.id}>
              <button
                type="button"
                data-activity={a.id}
                disabled={Boolean(reason)}
                title={[a.text, skill ? `Trains ${skill}.` : '', why ?? '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => send({ type: 'do', activity: a.id })}
              >
                {a.name}
                <span className="quiet">
                  {a.subName} · {hoursText(a.hours)}
                  {a.pay ? ` · ${pf(a.pay)}` : ''}
                  {chance !== undefined && (
                    <span title={`${Math.round(chance * 100)} in 100`}> · {oddsWord(chance)}</span>
                  )}
                </span>
                {why && <span className="why">{why}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

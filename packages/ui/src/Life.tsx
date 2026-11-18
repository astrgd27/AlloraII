import { WORLD, type Snapshot } from '@allora/engine';
import { pf } from './format';
import { Bar } from './Panel';

const placeName = (id: string): string => WORLD.places.find((p) => p.id === id)?.name ?? id;
const items = new Map((WORLD.items ?? []).map((i) => [i.id, i.name]));
const skills = new Map((WORLD.skills ?? []).map((s) => [s.id, s.name]));
const tools = new Map((WORLD.tools ?? []).map((t) => [t.item, t]));
const cases = new Map((WORLD.cases ?? []).map((c) => [c.id, c.name]));

/** Where the life lives, and what it owns. Display only. */
export function Life({ snapshot }: { snapshot: Snapshot }) {
  const pack = Object.entries(snapshot.goods);
  const l = snapshot.lodging;
  return (
    <dl className="life" data-testid="life">
      <dt>Home</dt>
      <dd title="Where the life has a bed. Sleep is better at home than at an inn, and better at an inn than by the road.">
        {l ? (
          <>
            {l.kind === 'room' ? 'A room' : 'A cottage'} in {placeName(snapshot.home)}
            <span className="quiet"> · {pf(l.rent)} a day</span>
            {l.owed > 0 && <span className="why">Rent owed: {pf(l.owed)}</span>}
          </>
        ) : (
          <span className="why">None. Rooms are let in towns and villages.</span>
        )}
      </dd>
      <dt>Purse</dt>
      <dd>{pf(snapshot.money)}</dd>
      {snapshot.tools.length > 0 && (
        <>
          <dt>Tools</dt>
          <dd>
            <ul className="tools">
              {snapshot.tools.map((t) => (
                <li
                  key={t.item}
                  title={`${tools.get(t.item)?.text ?? ''} +${t.edge} to ${skills.get(t.skill) ?? ''}, and a quarter more pay. ${t.left} hours of use left.`}
                >
                  {items.get(t.item) ?? t.item}
                  <Bar value={t.left / t.wear} label="Wear left" tone="gilt" />
                </li>
              ))}
            </ul>
          </dd>
        </>
      )}
      {snapshot.keepsakes.length > 0 && (
        <>
          <dt>Kept</dt>
          <dd>
            {snapshot.keepsakes
              .map((k) => `${cases.get(k.case) ?? k.case} (quality ${k.quality})`)
              .join(', ')}
          </dd>
        </>
      )}
      <dt>Pack</dt>
      <dd>
        {pack.length > 0
          ? pack.map(([id, n]) => `${items.get(id) ?? id} ×${n}`).join(', ')
          : 'Empty'}
      </dd>
    </dl>
  );
}

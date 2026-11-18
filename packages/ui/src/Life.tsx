import { WORLD, type Snapshot } from '@allora/engine';
import { pf } from './format';

const placeName = (id: string): string => WORLD.places.find((p) => p.id === id)?.name ?? id;
const items = new Map((WORLD.items ?? []).map((i) => [i.id, i.name]));

/** Where the life lives, and what it owns. Display only. */
export function Life({ snapshot }: { snapshot: Snapshot }) {
  const pack = Object.entries(snapshot.goods);
  return (
    <dl className="life" data-testid="life">
      <dt>Home</dt>
      <dd title="Where the life has a bed. Sleep is better at home.">{placeName(snapshot.home)}</dd>
      <dt>Purse</dt>
      <dd>{pf(snapshot.money)}</dd>
      <dt>Pack</dt>
      <dd>
        {pack.length > 0
          ? pack.map(([id, n]) => `${items.get(id) ?? id} ×${n}`).join(', ')
          : 'Empty'}
      </dd>
    </dl>
  );
}

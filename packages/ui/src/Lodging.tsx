import { HOMES, WORLD, type HomeKind, type Order, type Snapshot } from '@allora/engine';
import { pf } from './format';

const placeName = (id: string): string => WORLD.places.find((p) => p.id === id)?.name ?? id;

/** Homes to let here, and the inn's price. Display only. */
export function Lodging({ snapshot, send }: { snapshot: Snapshot; send: (order: Order) => void }) {
  const { lettings, lodging } = snapshot;
  if (lettings.room === undefined) return <p className="quiet">No one lets rooms out here.</p>;
  const homeHere = lodging && snapshot.home === snapshot.place ? lodging.kind : undefined;
  return (
    <section className="lodging" data-testid="lodging">
      <table className="board">
        <thead>
          <tr>
            <th>To let</th>
            <th title="Rent a day, paid at dawn">Rent</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {(['room', 'cottage'] as HomeKind[]).map((kind) => {
            const price = lettings[kind] ?? 0;
            const why =
              homeHere === kind
                ? 'Your home'
                : lodging?.owed
                  ? 'Rent is owed on your home'
                  : price > snapshot.money
                    ? 'Not enough money for the first day'
                    : undefined;
            const h = HOMES[kind];
            return (
              <tr key={kind}>
                <td
                  title={`Sleep restores ${h.sleep} vigour an hour; each night lifts the spirits by ${h.spirits}.`}
                >
                  {kind === 'room' ? 'A room' : 'A cottage'}
                </td>
                <td className="num">{pf(price)}</td>
                <td>
                  <button
                    type="button"
                    data-rent={kind}
                    disabled={Boolean(why)}
                    title={
                      why ??
                      (lodging
                        ? `Move here, giving up the ${lodging.kind} in ${placeName(snapshot.home)}`
                        : 'Take it, and pay the first day')
                    }
                    onClick={() => send({ type: 'rent', home: kind })}
                  >
                    {homeHere === kind ? 'Home' : 'Take'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {lettings.inn !== undefined && (
        <p
          className="quiet"
          title="Taken at bedtime when away from home, if the standing order allows"
        >
          An inn bed for the night: {pf(lettings.inn)}
        </p>
      )}
    </section>
  );
}

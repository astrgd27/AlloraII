import { WORLD, type Order, type Snapshot } from '@allora/engine';
import { hoursText } from '../format';

interface Props {
  snapshot: Snapshot;
  chosen: string | undefined;
  send: (order: Order) => void;
}

const nameOf = (id: string): string => WORLD.places.find((p) => p.id === id)?.name ?? id;
const routeOf = (roadId: string): string | undefined => {
  const route = WORLD.roads.find((r) => r.id === roadId)?.route;
  return WORLD.routes?.find((r) => r.id === route)?.name;
};
const eventText = (id: string | null): string | undefined =>
  WORLD.roadEvents?.find((e) => e.id === id)?.text;

/** One quiet line under the map: where you are, and the way to the chosen place. */
export function PlacePanel({ snapshot, chosen, send }: Props) {
  const { journey, place, hoursTo } = snapshot;

  if (journey) {
    return (
      <div className="place-panel" data-testid="place-panel">
        <p>
          <span data-testid="travelling-to">{nameOf(journey.to)}</span>
          <span className="quiet"> · {hoursText(Math.ceil(journey.hoursLeft))}</span>
          {routeOf(journey.road) && (
            <span className="quiet" data-testid="route">
              {' '}
              · {routeOf(journey.road)}
            </span>
          )}
        </p>
        <button type="button" onClick={() => send({ type: 'turnBack' })}>
          Turn back
        </button>
        {eventText(snapshot.roadEvent) && (
          <p className="said" data-testid="road-event">
            {eventText(snapshot.roadEvent)}
          </p>
        )}
      </div>
    );
  }

  const target = chosen && chosen !== place ? chosen : undefined;
  const hours = target ? hoursTo[target] : undefined;
  return (
    <div className="place-panel" data-testid="place-panel">
      <p>
        <span data-testid="here" data-place={place}>
          {nameOf(target ?? place)}
        </span>
        {hours !== undefined && <span className="quiet"> · {hoursText(hours)}</span>}
      </p>
      {target && hours !== undefined && (
        <button
          type="button"
          data-testid="set-out"
          onClick={() => send({ type: 'travel', to: target })}
        >
          Set out
        </button>
      )}
    </div>
  );
}

/** A plain list of the same places, for keyboards and screen readers. */
export function PlaceList({
  snapshot,
  chosen,
  onChoose,
}: {
  snapshot: Snapshot;
  chosen: string | undefined;
  onChoose: (id: string) => void;
}) {
  return (
    <details className="place-list">
      <summary>Places</summary>
      {WORLD.regions.map((region) => (
        <section key={region.id}>
          <h2>{region.name}</h2>
          <ul>
            {WORLD.places
              .filter((p) => p.region === region.id)
              .map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    data-place={p.id}
                    aria-pressed={chosen === p.id}
                    aria-current={
                      snapshot.place === p.id && !snapshot.journey ? 'location' : undefined
                    }
                    onClick={() => onChoose(p.id)}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </details>
  );
}

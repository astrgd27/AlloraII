import { WORLD, type Order } from '@allora/engine';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Activities } from './Activities';
import { Orders, Report } from './Away';
import { Career } from './Career';
import { engine } from './engine-client';
import { MapView } from './map/MapView';
import { PlaceList, PlacePanel } from './map/PlacePanel';
import { Market } from './Market';
import { NowBar } from './NowBar';
import { Panel } from './Panel';
import { People } from './People';
import { SceneView } from './scene/SceneView';
import { Skills } from './Skills';
import { TITLE } from './title';
import { TopBar } from './TopBar';

const regionOf = (place: string): string =>
  WORLD.places.find((p) => p.id === place)?.region ?? WORLD.regions[0]?.id ?? '';
const placeName = (id: string): string => WORLD.places.find((p) => p.id === id)?.name ?? id;

/** The frame. The UI only displays state and sends orders; no game logic lives here. */
export function App() {
  useEffect(() => engine.start(), []);
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  const error = useSyncExternalStore(engine.subscribe, engine.getError);
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const [picked, setPicked] = useState<string | undefined>(undefined);
  const send = (order: Order) => engine.send(order);

  if (!snapshot) {
    return (
      <main className="loading">
        <h1>{TITLE}</h1>
        {error && <p role="alert">{error}</p>}
      </main>
    );
  }
  const region = picked ?? regionOf(snapshot.place);
  const busy = Boolean(snapshot.doing) || (snapshot.venture?.hoursLeft ?? 0) > 0;
  const here = !snapshot.journey;

  return (
    <main className="game">
      <TopBar snapshot={snapshot} />

      <aside className="column left">
        {snapshot.report && (
          <Panel title="While you were away">
            <Report snapshot={snapshot} send={send} />
          </Panel>
        )}
        <Panel title="Calling" testid="calling">
          {snapshot.post || snapshot.postsHere.length > 0 ? (
            <Career snapshot={snapshot} send={send} />
          ) : (
            <p className="quiet">No post held. A post is taken up at its own place.</p>
          )}
        </Panel>
        <Panel title="Skills">
          {Object.keys(snapshot.skills).length > 0 ? (
            <Skills snapshot={snapshot} />
          ) : (
            <p className="quiet">Skills grow from work.</p>
          )}
        </Panel>
        <Panel title="Standing orders">
          <Orders snapshot={snapshot} send={send} />
        </Panel>
      </aside>

      <section className="centre">
        <nav className="realms" aria-label="Realms">
          {WORLD.regions.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={r.id === region}
              onClick={() => setPicked(r.id === regionOf(snapshot.place) ? undefined : r.id)}
            >
              {r.name}
            </button>
          ))}
        </nav>
        <MapView snapshot={snapshot} chosen={chosen} region={region} onChoose={setChosen} />
        <PlacePanel snapshot={snapshot} chosen={chosen} send={send} />
        <PlaceList snapshot={snapshot} chosen={chosen} onChoose={setChosen} />
      </section>

      <aside className="column right">
        <Panel
          title={here ? placeName(snapshot.place) : 'On the way'}
          aside={here ? WORLD.regions.find((r) => r.id === regionOf(snapshot.place))?.name : ''}
          testid="place"
        >
          <SceneView snapshot={snapshot} />
        </Panel>
        {here && (
          <>
            <Panel title="People here">
              {snapshot.here.length > 0 || snapshot.words ? (
                <People snapshot={snapshot} send={send} />
              ) : (
                <p className="quiet">Nobody is about.</p>
              )}
            </Panel>
            <Panel title="Work to hand">
              {busy ? (
                <p className="quiet">Busy. See below.</p>
              ) : snapshot.asleep ? (
                <p className="quiet">Asleep.</p>
              ) : snapshot.canDo.length > 0 ? (
                <Activities snapshot={snapshot} send={send} />
              ) : (
                <p className="quiet">Nothing to be done here at this hour.</p>
              )}
            </Panel>
          </>
        )}
        <Panel title="Purse and market">
          <Market snapshot={snapshot} send={send} />
        </Panel>
      </aside>

      <NowBar snapshot={snapshot} error={error} send={send} />
    </main>
  );
}

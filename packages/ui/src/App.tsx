import { SPEEDS, WORLD, type Order } from '@allora/engine';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Orders, Report } from './Away';
import { Calling } from './Career';
import { engine } from './engine-client';
import { MapView } from './map/MapView';
import { PlaceList, PlacePanel } from './map/PlacePanel';
import { Life } from './Life';
import { Log } from './Log';
import { Market } from './Market';
import { NowBar } from './NowBar';
import { Panel } from './Panel';
import { PlaceTabs } from './PlaceTabs';
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
  // Keys for the clock: space to pause, 1 2 3 for the pace.
  const paused = snapshot?.paused;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        engine.send({ type: paused ? 'resume' : 'pause' });
      }
      const pace = SPEEDS[Number(e.key) - 1];
      if (pace) {
        if (paused) engine.send({ type: 'resume' });
        engine.send({ type: 'speed', speed: pace });
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [paused]);
  // A refusal is shown where the player last clicked, and fades.
  const [click, setClick] = useState({ x: 0, y: 0 });

  if (!snapshot) {
    return (
      <main className="loading">
        <h1>{TITLE}</h1>
        {error && <p role="alert">{error}</p>}
      </main>
    );
  }
  const region = picked ?? regionOf(snapshot.place);
  const here = !snapshot.journey;

  return (
    <main
      className="game"
      onPointerDownCapture={(e) => {
        setClick({ x: e.clientX, y: e.clientY });
      }}
    >
      <TopBar snapshot={snapshot} send={send} />

      <aside className="column left">
        {snapshot.report && (
          <Panel title="While you were away">
            <Report snapshot={snapshot} send={send} />
          </Panel>
        )}
        <Panel title="The life">
          <Life snapshot={snapshot} />
        </Panel>
        <Panel title="Calling" testid="calling">
          <Calling snapshot={snapshot} />
        </Panel>
        <Panel title="Skills">
          <Skills snapshot={snapshot} />
        </Panel>
        <Panel title="Standing orders">
          <Orders snapshot={snapshot} send={send} />
        </Panel>
        <Panel title="Lately">
          <Log snapshot={snapshot} />
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
        {here ? (
          <PlaceTabs snapshot={snapshot} send={send} />
        ) : (
          <Panel title="Pack">
            <Market snapshot={snapshot} send={send} />
          </Panel>
        )}
      </aside>

      <NowBar snapshot={snapshot} send={send} />
      {error && (
        <p
          key={error}
          className="refusal"
          role="alert"
          data-testid="refusal"
          style={{ left: Math.min(click.x, innerWidth - 260), top: Math.max(8, click.y - 44) }}
        >
          {error}
        </p>
      )}
    </main>
  );
}

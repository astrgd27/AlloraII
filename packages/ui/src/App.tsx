import { useEffect, useState, useSyncExternalStore } from 'react';
import { Activities } from './Activities';
import { engine } from './engine-client';
import { formatDate, formatHour } from './format';
import { MapView } from './map/MapView';
import { People } from './People';
import { PlaceList, PlacePanel } from './map/PlacePanel';
import { Skills } from './Skills';
import { TITLE } from './title';

/** The frame. The UI only displays state and sends orders; no game logic lives here. */
export function App() {
  useEffect(() => engine.start(), []);
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  const error = useSyncExternalStore(engine.subscribe, engine.getError);
  const [chosen, setChosen] = useState<string | undefined>(undefined);

  return (
    <main className="frame">
      <h1>{TITLE}</h1>
      {snapshot && (
        <section className="clock" aria-label="Date and hour">
          <p className="date" data-testid="date">
            {formatDate(snapshot.date)}
          </p>
          <p className="hour" data-testid="hour" data-hours={snapshot.hours}>
            {formatHour(snapshot.date)}
          </p>
          <div className="hour-bar" aria-hidden="true">
            <div style={{ width: `${snapshot.hourProgress * 100}%` }} />
          </div>
          <ul className="needs" data-testid="needs">
            {(['vigour', 'health', 'spirits'] as const).map((need) => (
              <li key={need}>
                <span>{need}</span>
                <meter min={0} max={100} low={30} value={snapshot.needs[need]} aria-label={need} />
              </li>
            ))}
          </ul>
          {snapshot.asleep && (
            <p className="quiet" data-testid="asleep">
              {snapshot.journey ? 'In camp, asleep' : 'Asleep'}
            </p>
          )}
        </section>
      )}
      <MapView snapshot={snapshot} chosen={chosen} onChoose={setChosen} />
      {snapshot && (
        <>
          <PlacePanel snapshot={snapshot} chosen={chosen} send={(order) => engine.send(order)} />
          <People snapshot={snapshot} send={(order) => engine.send(order)} />
          <Activities snapshot={snapshot} send={(order) => engine.send(order)} />
          <Skills snapshot={snapshot} />
          <PlaceList snapshot={snapshot} chosen={chosen} onChoose={setChosen} />
        </>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}

import { useEffect, useSyncExternalStore } from 'react';
import { engine } from './engine-client';
import { formatDate, formatHour } from './format';
import { TITLE } from './title';

/** The frame. The UI only displays state and sends orders; no game logic lives here. */
export function App() {
  useEffect(() => engine.start(), []);
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  const error = useSyncExternalStore(engine.subscribe, engine.getError);

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
        </section>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}

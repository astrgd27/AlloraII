import { TITLE } from './title';

/** A blank frame. The UI only displays state and sends orders; no game logic lives here. */
export function App() {
  return (
    <main className="frame">
      <h1>{TITLE}</h1>
    </main>
  );
}

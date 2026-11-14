import { WORLD, type Order, type Snapshot } from '@allora/engine';

const byId = new Map((WORLD.people ?? []).map((p) => [p.id, p]));
const subName = (place: string, sub: string): string =>
  WORLD.places.find((p) => p.id === place)?.subs?.[sub] ?? '';

/** Who is here, and the last thing someone said. Display only. */
export function People({ snapshot, send }: { snapshot: Snapshot; send: (order: Order) => void }) {
  const words = snapshot.words;
  const speaker = words ? byId.get(words.person) : undefined;
  const line =
    speaker && words
      ? words.kind === 'meet'
        ? speaker.meet
        : speaker.talk[words.line]
      : undefined;
  if (snapshot.here.length === 0 && !line) return null;
  return (
    <section className="people" data-testid="people">
      <ul>
        {snapshot.here.map((h) => {
          const person = byId.get(h.id);
          if (!person) return null;
          const where = subName(snapshot.place, h.sub);
          return (
            <li key={h.id}>
              <button
                type="button"
                data-person={h.id}
                onClick={() => send({ type: h.known ? 'talk' : 'meet', person: h.id })}
              >
                {h.known ? person.name : person.hint}
                {where && <span className="quiet"> · {where}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {line && (
        <p className="said" data-testid="said">
          {line}
        </p>
      )}
    </section>
  );
}

import { WORLD, type Order, type Snapshot } from '@allora/engine';
import { Bar } from './Panel';

const rites = new Map((WORLD.rites ?? []).map((r) => [r.faith, r]));
const items = new Map((WORLD.items ?? []).map((i) => [i.id, i.name]));
const ASPECT: Record<string, string> = { hearth: 'The Hearth', pyre: 'The Pyre' };
const DUTY: Record<string, string> = {
  hearth:
    'Bake for the poor three times in six days. From Keeper of Embers, keep the Longest Night.',
  pyre: 'Be at Aschau for the Stubble-Burning. Ash-Marked is won only by walking the coals.',
};

/** The faith kept: rank, devotion, duties. Display only. */
export function FaithSheet({ snapshot }: { snapshot: Snapshot }) {
  const f = snapshot.faith;
  if (!f)
    return (
      <p className="quiet">
        No faith kept. Ilvara is joined at Ostwick's hearth-shrine or the pyre at Aschau.
      </p>
    );
  const rite = rites.get(f.faith);
  const ranks = rite?.aspects.find((a) => a.id === f.aspect)?.ranks ?? [];
  const from = rite?.thresholds[f.rank] ?? 0;
  return (
    <div className="faith" data-testid="faith">
      <p>
        {rite?.name}
        <span className="quiet"> · {ASPECT[f.aspect] ?? f.aspect}</span>
      </p>
      <ol className="ladder">
        {ranks.map((r, i) => (
          <li key={r} className={i < f.rank ? 'past' : i === f.rank ? 'now' : ''}>
            {r}
          </li>
        ))}
      </ol>
      <p className="quiet">Devotion {Math.floor(f.devotion)}</p>
      {f.next !== null && (
        <Bar
          value={(f.devotion - from) / (f.next - from)}
          label="Devotion towards the next rank"
          tone="gilt"
        />
      )}
      {f.lapsed && <p className="why">Lapsed. Three acts of the faith will restore you.</p>}
      <p className="quiet duty">{DUTY[f.aspect]}</p>
    </div>
  );
}

/** Joining here, and offerings on the Pyre. Display only. */
export function FaithHere({
  snapshot,
  send,
}: {
  snapshot: Snapshot;
  send: (order: Order) => void;
}) {
  const f = snapshot.faith;
  const pack = Object.entries(snapshot.goods);
  const atPyre =
    f?.aspect === 'pyre' &&
    rites.get(f.faith)?.aspects.find((a) => a.id === 'pyre')?.place === snapshot.place;
  return (
    <section className="faith-here" data-testid="faith-here">
      {snapshot.joinable.map((j) => (
        <button
          key={`${j.faith}-${j.aspect}`}
          type="button"
          data-join={j.aspect}
          disabled={Boolean(j.why)}
          title={j.why ?? `Join ${rites.get(j.faith)?.name} by ${ASPECT[j.aspect]?.toLowerCase()}`}
          onClick={() => send({ type: 'join', faith: j.faith, aspect: j.aspect })}
        >
          Join {rites.get(j.faith)?.name} · {ASPECT[j.aspect]}
          {j.why && <span className="why">{j.why}</span>}
        </button>
      ))}
      {atPyre && (
        <>
          <p className="quiet">
            Burn an offering: devotion worth what it is worth, twice in autumn.
          </p>
          <ul className="gift-list">
            {pack.length === 0 && <li className="quiet">Nothing in the pack to burn.</li>}
            {pack.map(([id, n]) => (
              <li key={id}>
                <button
                  type="button"
                  data-offer={id}
                  onClick={() => send({ type: 'offer', item: id })}
                >
                  {items.get(id) ?? id}
                  <span className="quiet"> ×{n}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

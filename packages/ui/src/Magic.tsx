import { WORLD, type Order, type Snapshot } from '@allora/engine';
import { Bar } from './Panel';
import { pf } from './format';

const arts = new Map((WORLD.arts ?? []).map((a) => [a.id, a]));
const proofs = new Map((WORLD.proofs ?? []).map((p) => [p.id, p]));
const skillName = new Map((WORLD.skills ?? []).map((s) => [s.id, s.name]));

const boostText = (id: string): string => {
  const p = proofs.get(id);
  if (!p) return '';
  const skills = p.boost.skills.map((s) => skillName.get(s) ?? s).join(', ');
  return `+${p.boost.value} to ${skills} for ${p.boost.hours} hours`;
};

/** The art studied: degree, Will, proofs, proofs in force. Display only. */
export function MagicSheet({
  snapshot,
  send,
}: {
  snapshot: Snapshot;
  send: (order: Order) => void;
}) {
  const m = snapshot.magic;
  if (!m)
    return <p className="quiet">No art studied. Hermetic Evocation is taught at the Collegium.</p>;
  const art = arts.get(m.art);
  return (
    <div className="magic" data-testid="magic">
      <p>
        {art?.name}
        <span className="quiet"> · {art?.degrees[m.degree]?.name}</span>
      </p>
      <p className="quiet">
        Will {Math.floor(m.will)} / {m.willMax}
      </p>
      <Bar value={m.will / m.willMax} label="Will, regained with rest" tone="gilt" />
      {m.proofs.length === 0 && <p className="quiet">No proofs copied yet.</p>}
      {m.proofs.map((p) => {
        const proof = proofs.get(p.id);
        return (
          <button
            key={p.id}
            type="button"
            data-cast={p.id}
            disabled={Boolean(p.why)}
            title={p.why ?? `${proof?.will} Will and ink · ${boostText(p.id)}`}
            onClick={() => send({ type: 'cast', proof: p.id })}
          >
            Cast {proof?.name}
            {p.why && <span className="why">{p.why}</span>}
          </button>
        );
      })}
      {m.boosts.map((b) => (
        <p key={b.proof} className="quiet" title={boostText(b.proof)}>
          {proofs.get(b.proof)?.name} holds · {b.hoursLeft} h left
        </p>
      ))}
    </div>
  );
}

/** At an art's seat: matriculating, the library, the disputation hall. Display only. */
export function StudyHere({
  snapshot,
  send,
}: {
  snapshot: Snapshot;
  send: (order: Order) => void;
}) {
  const m = snapshot.magic;
  return (
    <section className="study-here" data-testid="study-here">
      {snapshot.study.map((s) => {
        const art = arts.get(s.art);
        const mine = m?.art === s.art;
        const next = mine ? art?.degrees[(m?.degree ?? 0) + 1] : undefined;
        return (
          <div key={s.art}>
            {!mine && (
              <button
                type="button"
                data-matriculate={s.art}
                disabled={Boolean(s.matriculateWhy)}
                title={
                  s.matriculateWhy ?? `Swear the scholars' oath · ${pf(art?.matriculate.fee ?? 0)}`
                }
                onClick={() => send({ type: 'matriculate', art: s.art })}
              >
                Matriculate in {art?.name}
                {s.matriculateWhy && <span className="why">{s.matriculateWhy}</span>}
              </button>
            )}
            {mine && next && (
              <button
                type="button"
                data-dispute={s.art}
                disabled={Boolean(m?.disputeWhy)}
                title={m?.disputeWhy ?? `Stand a disputation for the degree of ${next.name}`}
                onClick={() => send({ type: 'dispute' })}
              >
                Dispute for {next.name}
                {m?.disputeWhy && <span className="why">{m.disputeWhy}</span>}
              </button>
            )}
            <h4>The library</h4>
            {s.library.map((p) => {
              const proof = proofs.get(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  data-copy={p.id}
                  disabled={Boolean(p.why)}
                  title={
                    p.why ??
                    `Copy it · ${pf(proof?.fee ?? 0)}, a parchment and an ink · ${boostText(p.id)}`
                  }
                  onClick={() => send({ type: 'copy', proof: p.id })}
                >
                  Copy {proof?.name}
                  <span className="quiet"> · level {proof?.level}</span>
                  {p.why && <span className="why">{p.why}</span>}
                </button>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}

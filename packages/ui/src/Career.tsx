import { WORLD, oddsWord, type Order, type Snapshot } from '@allora/engine';

const posts = new Map((WORLD.posts ?? []).map((p) => [p.id, p]));
const cases = new Map((WORLD.cases ?? []).map((c) => [c.id, c]));

/** The post held, the cases on offer and the work in hand. Display only. */
export function Career({ snapshot, send }: { snapshot: Snapshot; send: (order: Order) => void }) {
  const { post, venture } = snapshot;
  if (!post) {
    if (snapshot.postsHere.length === 0) return null;
    return (
      <section className="career" data-testid="career">
        <ul>
          {snapshot.postsHere.map((id) => (
            <li key={id}>
              <button
                type="button"
                data-post={id}
                onClick={() => send({ type: 'takePost', post: id })}
              >
                {posts.get(id)?.name}
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  const held = posts.get(post.id);
  const inHand = venture ? cases.get(venture.case) : undefined;
  const step = venture ? held?.work[venture.step] : undefined;
  return (
    <section className="career" data-testid="career">
      <p data-testid="post">
        {held?.name}
        <span className="quiet"> · {held?.ranks[post.rank]}</span>
      </p>
      {venture && inHand && (
        <>
          <p>
            {inHand.name}
            <span className="quiet">
              {' '}
              · {step?.name} · {venture.step + 1} of {venture.steps}
            </span>
          </p>
          <p className="quiet">{inHand.text}</p>
          {snapshot.blocked.step && <p className="why">{snapshot.blocked.step}</p>}
          <ul>
            {venture.choices.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  data-approach={c.id}
                  disabled={Boolean(snapshot.blocked.step)}
                  title={snapshot.blocked.step ?? `${Math.round(c.chance * 100)} in 100`}
                  onClick={() => send({ type: 'step', approach: c.id })}
                >
                  {step?.approaches.find((a) => a.id === c.id)?.name}
                  <span className="quiet"> · {oddsWord(c.chance)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {!venture && snapshot.offers.length > 0 && (
        <ul>
          {snapshot.offers.map((id) => (
            <li key={id}>
              <button
                type="button"
                data-case={id}
                onClick={() => send({ type: 'takeCase', case: id })}
              >
                {cases.get(id)?.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

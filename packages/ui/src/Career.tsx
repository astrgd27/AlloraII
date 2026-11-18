import { TRIAL_STANDING, WORLD, oddsWord, type Order, type Snapshot } from '@allora/engine';
import { Bar } from './Panel';

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

const placeName = (id: string): string => WORLD.places.find((p) => p.id === id)?.name ?? id;

/** The post held, its rank and standing, and the case in hand. Display only. */
export function Calling({ snapshot }: { snapshot: Snapshot }) {
  const { post, venture } = snapshot;
  if (!post) {
    return (
      <p className="quiet">
        No post held. Posts are taken up at their own place: the guild forges of Kesselhaven, the
        household of Burg Tennfels, the Office of the Cerdans in Marre.
      </p>
    );
  }
  const held = posts.get(post.id);
  const next = TRIAL_STANDING[post.rank + 1];
  return (
    <div className="calling">
      <p>
        {held?.name}
        <span className="quiet"> · {placeName(held?.place ?? '')}</span>
      </p>
      <ol className="ladder">
        {held?.ranks.map((r, i) => (
          <li key={r} className={i < post.rank ? 'past' : i === post.rank ? 'now' : ''}>
            {r}
          </li>
        ))}
      </ol>
      <p className="quiet">Standing {post.standing}</p>
      {next !== undefined && (
        <Bar value={post.standing / next} label="Standing towards the next trial" tone="gilt" />
      )}
      {venture && <p>In hand: {cases.get(venture.case)?.name}</p>}
    </div>
  );
}

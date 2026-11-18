import { TIERS, WORLD, type Order, type Snapshot } from '@allora/engine';
import { useState } from 'react';
import { Bar } from './Panel';

const byId = new Map((WORLD.people ?? []).map((p) => [p.id, p]));
const items = new Map((WORLD.items ?? []).map((i) => [i.id, i.name]));
const subName = (place: string, sub: string): string =>
  WORLD.places.find((p) => p.id === place)?.subs?.[sub] ?? '';

const REACTION: Record<string, string> = {
  love: 'loves it',
  like: 'likes it',
  neutral: 'is polite about it',
  dislike: 'does not care for it',
  hate: 'hates it',
};

/** Who is here, how well the life knows them, and the last thing someone said. Display only. */
export function People({ snapshot, send }: { snapshot: Snapshot; send: (order: Order) => void }) {
  const [giving, setGiving] = useState<string | undefined>(undefined);
  const words = snapshot.words;
  const speaker = words ? byId.get(words.person) : undefined;
  const line =
    speaker && words
      ? words.kind === 'meet'
        ? speaker.meet
        : words.kind === 'confide'
          ? speaker.tiers?.[words.line]
          : words.kind === 'gift'
            ? `${speaker.name} ${REACTION[words.reaction ?? 'neutral'] ?? ''}.`
            : speaker.talk[words.line]
      : undefined;
  if (snapshot.here.length === 0 && !line) return null;
  const pack = Object.entries(snapshot.goods);
  return (
    <section className="people" data-testid="people">
      <ul>
        {snapshot.here.map((h) => {
          const person = byId.get(h.id);
          if (!person) return null;
          const where = subName(snapshot.place, h.sub);
          const next = TIERS[h.tier + 1];
          const from = TIERS[h.tier]?.at ?? 0;
          return (
            <li key={h.id} className="person">
              <button
                type="button"
                data-person={h.id}
                disabled={Boolean(snapshot.blocked.people)}
                title={snapshot.blocked.people ?? (h.known ? 'Talk' : 'Meet')}
                onClick={() => send({ type: h.known ? 'talk' : 'meet', person: h.id })}
              >
                {h.known ? person.name : person.hint}
                <span className="quiet">
                  {h.known ? ` · ${TIERS[h.tier]?.name}` : ''}
                  {where ? ` · ${where}` : ''}
                </span>
                {h.known && next && (
                  <Bar
                    value={(h.points - from) / (next.at - from)}
                    label={`Towards ${next.name}`}
                    tone="gilt"
                  />
                )}
              </button>
              {h.known && (
                <button
                  type="button"
                  className="give"
                  data-give={h.id}
                  disabled={
                    Boolean(h.giftWhy) || pack.length === 0 || Boolean(snapshot.blocked.people)
                  }
                  title={
                    snapshot.blocked.people ??
                    h.giftWhy ??
                    (pack.length === 0
                      ? 'Nothing in the pack to give'
                      : 'Give something from the pack')
                  }
                  aria-pressed={giving === h.id}
                  onClick={() => setGiving(giving === h.id ? undefined : h.id)}
                >
                  Give
                </button>
              )}
              {giving === h.id && !h.giftWhy && (
                <ul className="gift-list">
                  {pack.map(([id, n]) => (
                    <li key={id}>
                      <button
                        type="button"
                        data-gift={id}
                        onClick={() => {
                          send({ type: 'give', person: h.id, item: id });
                          setGiving(undefined);
                        }}
                      >
                        {items.get(id) ?? id}
                        <span className="quiet"> ×{n}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      {line && (
        <p className={`said ${words?.kind === 'confide' ? 'confide' : ''}`} data-testid="said">
          {line}
        </p>
      )}
    </section>
  );
}

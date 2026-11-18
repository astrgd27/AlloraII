import type { Order, Snapshot } from '@allora/engine';
import { useState } from 'react';
import { Activities } from './Activities';
import { Career } from './Career';
import { Lodging } from './Lodging';
import { Market } from './Market';
import { People } from './People';

type Tab = 'work' | 'people' | 'market' | 'lodging' | 'post';

/** Everything that can be done at this place, in tabs. Display only. */
export function PlaceTabs({
  snapshot,
  send,
}: {
  snapshot: Snapshot;
  send: (order: Order) => void;
}) {
  const [tab, setTab] = useState<Tab>('work');
  const open = snapshot.work.filter((w) => !w.reason).length;
  const postHere =
    snapshot.postsHere.length > 0 ||
    (snapshot.post !== null && snapshot.offers.length + (snapshot.venture ? 1 : 0) > 0);
  const tabs: { id: Tab; label: string; count?: number; hint: string }[] = [
    { id: 'work', label: 'Work', count: open, hint: 'What can be done here, and when' },
    { id: 'people', label: 'People', count: snapshot.here.length, hint: 'Who is here now' },
    {
      id: 'market',
      label: 'Market',
      hint: snapshot.market ? 'Prices here now' : 'No market here; what you carry',
    },
  ];
  if (snapshot.lettings.room !== undefined)
    tabs.push({ id: 'lodging', label: 'Lodging', hint: 'Rooms and cottages to let, and the inn' });
  if (postHere)
    tabs.push({ id: 'post', label: 'Calling', hint: 'Posts, cases and the work in hand' });
  const shown = tabs.some((t) => t.id === tab) ? tab : 'work';
  return (
    <div className="tabs" data-testid="place-tabs">
      <div role="tablist" className="tab-row">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={shown === t.id}
            aria-pressed={shown === t.id}
            title={t.hint}
            data-tab={t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count !== undefined && <span className="count">{t.count}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="tab-body">
        {shown === 'work' && <Activities snapshot={snapshot} send={send} />}
        {shown === 'people' &&
          (snapshot.here.length > 0 || snapshot.words ? (
            <People snapshot={snapshot} send={send} />
          ) : (
            <p className="quiet">Nobody is about.</p>
          ))}
        {shown === 'market' && <Market snapshot={snapshot} send={send} />}
        {shown === 'lodging' && <Lodging snapshot={snapshot} send={send} />}
        {shown === 'post' && <Career snapshot={snapshot} send={send} />}
      </div>
    </div>
  );
}

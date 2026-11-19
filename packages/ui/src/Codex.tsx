import { WORLD, type Snapshot } from '@allora/engine';
import { useEffect, useState } from 'react';

type Tab = 'regions' | 'places' | 'people' | 'skills' | 'faiths';
const TABS: { id: Tab; label: string }[] = [
  { id: 'regions', label: 'Realms' },
  { id: 'places', label: 'Places' },
  { id: 'people', label: 'People' },
  { id: 'skills', label: 'Skills' },
  { id: 'faiths', label: 'Faiths' },
];

const places = new Map(WORLD.places.map((p) => [p.id, p]));
const regions = new Map(WORLD.regions.map((r) => [r.id, r]));
const people = new Map((WORLD.people ?? []).map((p) => [p.id, p]));
const skills = new Map((WORLD.skills ?? []).map((s) => [s.id, s]));
const faiths = new Map((WORLD.faiths ?? []).map((f) => [f.id, f]));
const FAMILY: Record<string, string> = {
  crafts: 'A craft',
  land: 'Of the land',
  body: 'Of the body',
  mind: 'Of the mind',
  people: 'Of people',
  shadow: 'Of the shadows',
  faith: 'Of faith',
  magic: 'Of magic',
};
const KIND = { city: 'A city', settled: 'A settlement', wild: 'The wild' };

const nameOf = (tab: Tab, id: string): string =>
  (tab === 'regions'
    ? regions.get(id)?.name
    : tab === 'places'
      ? places.get(id)?.name
      : tab === 'people'
        ? people.get(id)?.name
        : tab === 'skills'
          ? skills.get(id)?.name
          : faiths.get(id)?.name) ?? id;

/** One entry of the codex. */
function Entry({ tab, id, snapshot }: { tab: Tab; id: string; snapshot: Snapshot }) {
  if (tab === 'regions') {
    const r = regions.get(id);
    const here = snapshot.known.places.filter((p) => places.get(p)?.region === id);
    return (
      <>
        <p>{r?.text}</p>
        <p className="quiet">Places known here: {here.length}</p>
      </>
    );
  }
  if (tab === 'places') {
    const p = places.get(id);
    return (
      <>
        <p className="quiet">
          {p ? KIND[p.kind] : ''} · {regions.get(p?.region ?? '')?.name}
        </p>
        <p>{p?.text}</p>
        {p?.subs && Object.keys(p.subs).length > 0 && (
          <ul className="subs">
            {Object.values(p.subs).map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </>
    );
  }
  if (tab === 'people') {
    const p = people.get(id);
    return (
      <>
        <p className="quiet">{p?.title}</p>
        <p>{p?.hint ? p.hint.charAt(0).toUpperCase() + p.hint.slice(1) + '.' : ''}</p>
      </>
    );
  }
  if (tab === 'skills') {
    const s = skills.get(id);
    const level = snapshot.skills[id]?.level;
    return (
      <>
        <p className="quiet">
          {FAMILY[s?.family ?? ''] ?? ''}
          {level !== undefined ? ` · this life: ${level}` : ''}
        </p>
        <p>{s?.text}</p>
      </>
    );
  }
  const f = faiths.get(id);
  return (
    <>
      {f?.domain && <p className="quiet">{f.domain}</p>}
      <p>{f?.text}</p>
      <p className="quiet">Kept at: {f?.sites.map((s) => places.get(s)?.name ?? s).join(', ')}</p>
    </>
  );
}

/** Everything any life has learned of the world. Display only. */
export function Codex({ snapshot, onClose }: { snapshot: Snapshot; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('places');
  const [picked, setPicked] = useState<string>();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);
  const ids = [...snapshot.known[tab]].sort((a, b) => nameOf(tab, a).localeCompare(nameOf(tab, b)));
  const shown = picked && ids.includes(picked) ? picked : ids[0];
  return (
    <div className="codex-veil" role="dialog" aria-label="Codex" data-testid="codex">
      <section className="codex panel">
        <header className="codex-head">
          <h2>Codex</h2>
          <div role="tablist" className="tab-row">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-pressed={tab === t.id}
                data-codex-tab={t.id}
                onClick={() => {
                  setTab(t.id);
                  setPicked(undefined);
                }}
              >
                {t.label}
                <span className="count">{snapshot.known[t.id].length}</span>
              </button>
            ))}
          </div>
          <button type="button" className="close" title="Close (Esc)" onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="codex-body">
          <ul className="codex-list">
            {ids.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={id === shown}
                  data-entry={id}
                  onClick={() => setPicked(id)}
                >
                  {nameOf(tab, id)}
                </button>
              </li>
            ))}
          </ul>
          <article className="codex-entry">
            {shown ? (
              <>
                <h3>{nameOf(tab, shown)}</h3>
                <Entry tab={tab} id={shown} snapshot={snapshot} />
              </>
            ) : (
              <p className="quiet">Nothing learned yet.</p>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}

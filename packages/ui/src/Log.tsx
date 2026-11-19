import { WORLD, type LogEntry, type Snapshot } from '@allora/engine';
import { pf } from './format';

const name = <T extends { id: string; name: string }>(list: T[] | undefined) => {
  const map = new Map((list ?? []).map((x) => [x.id, x.name]));
  return (id: string): string => map.get(id) ?? id;
};
const activity = name(WORLD.activities);
const place = name(WORLD.places);
const person = name(WORLD.people);
const item = name(WORLD.items);
const caseName = name(WORLD.cases);
const posts = new Map((WORLD.posts ?? []).map((p) => [p.id, p]));
const arts = new Map((WORLD.arts ?? []).map((a) => [a.id, a]));
const proof = name(WORLD.proofs);
const roadEvent = new Map((WORLD.roadEvents ?? []).map((e) => [e.id, e.text]));

const faithName = (id: string): string => WORLD.rites?.find((r) => r.faith === id)?.name ?? id;
const TIER_NAMES = ['Acquaintance', 'Friend', 'Close Friend', 'Confidant'];

const DEGREE = {
  triumph: 'a triumph',
  success: 'done well',
  cost: 'done, at a cost',
  failure: 'it went badly',
  disaster: 'a disaster',
};

/** One line for one thing that happened. */
export function logText(e: LogEntry): string {
  switch (e.kind) {
    case 'done':
      return [activity(e.id), e.degree ? DEGREE[e.degree] : '', e.pay ? `+${pf(e.pay)}` : '']
        .filter(Boolean)
        .join(' · ');
    case 'case':
      return `${caseName(e.id)} · ${e.trial ? 'trial' : 'closed'}, quality ${e.quality}`;
    case 'rank':
      return `Raised to ${posts.get(e.post)?.ranks[e.rank] ?? 'a new rank'}`;
    case 'arrived':
      return `Arrived at ${place(e.place)}`;
    case 'road':
      return roadEvent.get(e.id) ?? 'Something on the road';
    case 'met':
      return `Met ${person(e.person)}`;
    case 'bought':
      return `Bought ${item(e.item)} · −${pf(e.price)}`;
    case 'sold':
      return `Sold ${item(e.item)} · +${pf(e.price)}`;
    case 'moved':
      return `Took ${e.home === 'room' ? 'a room' : 'a cottage'} in ${place(e.place)}`;
    case 'dues':
      return `Dues to the guild · −${pf(e.price)}`;
    case 'friend':
      return `${person(e.person)} is now a ${TIER_NAMES[e.tier]?.toLowerCase() ?? 'friend'}`;
    case 'faith':
      return e.rank === 0 ? `Joined ${faithName(e.faith)}` : `Raised in ${faithName(e.faith)}`;
    case 'lapsed':
      return `Lapsed from ${faithName(e.faith)}`;
    case 'restored':
      return `Restored to ${faithName(e.faith)}`;
    case 'offered':
      return `Burned ${item(e.item)} on the Pyre · +${e.worth} devotion`;
    case 'lost':
      return `${caseName(e.case)} · a clue lost to time`;
    case 'broke':
      return `${item(e.item)} worn out`;
    case 'evicted':
      return `Turned out of the ${e.home} in ${place(e.place)} for rent owed`;
    case 'degree':
      return e.degree === 0
        ? `Matriculated in ${arts.get(e.art)?.name ?? e.art}`
        : `Won the degree of ${arts.get(e.art)?.degrees[e.degree]?.name ?? 'a new degree'}`;
    case 'disputed':
      return 'Lost a disputation';
    case 'copied':
      return `Copied ${proof(e.proof)} from the library`;
    case 'cast':
      return `Cast ${proof(e.proof)}`;
    case 'misfire':
      return `${proof(e.proof)} misfired and burned`;
  }
}

/** What just happened, newest first. Display only. */
export function Log({ snapshot }: { snapshot: Snapshot }) {
  if (snapshot.log.length === 0) return <p className="quiet">Nothing yet.</p>;
  return (
    <ol className="log" data-testid="log">
      {snapshot.log.map((e, i) => {
        const ago = snapshot.hours - e.hours;
        return (
          <li key={`${e.hours}-${i}`}>
            <span className="quiet">
              {ago < 1 ? 'now' : ago < 24 ? `${ago}h` : `${Math.floor(ago / 24)}d`}
            </span>
            {logText(e)}
          </li>
        );
      })}
    </ol>
  );
}

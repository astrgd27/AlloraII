import { WORLD, type Snapshot } from '@allora/engine';

const names = new Map((WORLD.skills ?? []).map((s) => [s.id, s.name]));

/** The skills a life has used, shown quietly in place. Display only. */
export function Skills({ snapshot }: { snapshot: Snapshot }) {
  const skills = Object.entries(snapshot.skills).sort((a, b) => b[1].level - a[1].level);
  if (skills.length === 0) return null;
  return (
    <ul className="skills" data-testid="skills">
      {skills.map(([id, s]) => (
        <li key={id}>
          <span>
            {names.get(id) ?? id} {s.level}
          </span>
          <meter
            min={0}
            max={1}
            value={s.progress}
            aria-label={`${names.get(id) ?? id}, progress`}
          />
        </li>
      ))}
    </ul>
  );
}

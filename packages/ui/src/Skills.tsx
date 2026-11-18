import { GATES, WORLD, type Snapshot } from '@allora/engine';
import { Bar } from './Panel';

const skills = new Map((WORLD.skills ?? []).map((s) => [s.id, s]));
const FAMILY: Record<string, string> = {
  crafts: 'Crafts',
  land: 'Land and sea',
  body: 'Body',
  mind: 'Mind',
  people: 'People',
  shadow: 'Shadows',
  faith: 'Faith',
  magic: 'Magic',
};
const gateName = (cap: number): string => GATES.find((g) => g.cap === cap)?.name ?? '';

/** The skills a life has used, by family, each with its level, cap and progress. Display only. */
export function Skills({ snapshot }: { snapshot: Snapshot }) {
  const used = Object.entries(snapshot.skills);
  if (used.length === 0) return <p className="quiet">Skills grow from work.</p>;
  const families = Object.keys(FAMILY).filter((f) =>
    used.some(([id]) => skills.get(id)?.family === f),
  );
  return (
    <div className="skills" data-testid="skills">
      {families.map((f) => (
        <section key={f}>
          <h3>{FAMILY[f]}</h3>
          <ul>
            {used
              .filter(([id]) => skills.get(id)?.family === f)
              .sort((a, b) => b[1].level - a[1].level)
              .map(([id, s]) => {
                const name = skills.get(id)?.name ?? id;
                const held = s.atGate
                  ? `Held at ${s.cap} until ${gateName(s.cap).toLowerCase()} is passed.`
                  : `Can rise to ${s.cap} before ${gateName(s.cap).toLowerCase() || 'the end'}.`;
                return (
                  <li key={id} title={held} className={s.atGate ? 'at-gate' : ''}>
                    <span className="skill-name">{name}</span>
                    <span className="skill-level">
                      {s.level}
                      <span className="quiet">/{s.cap}</span>
                    </span>
                    <Bar value={s.progress} label={`${name}, progress`} tone="gilt" />
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}

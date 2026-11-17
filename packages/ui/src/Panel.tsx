import type { ReactNode } from 'react';

/** A framed panel with a heading. Display only. */
export function Panel({
  title,
  aside,
  testid,
  children,
}: {
  title: string;
  aside?: ReactNode;
  testid?: string;
  children: ReactNode;
}) {
  return (
    <section className="panel" data-testid={testid}>
      <header>
        <h2>{title}</h2>
        {aside && <span className="aside">{aside}</span>}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}

/** A labelled bar from 0 to 1. */
export function Bar({ value, tone, label }: { value: number; tone?: string; label: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`bar ${tone ?? ''}`} role="meter" aria-label={label} aria-valuenow={pct}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

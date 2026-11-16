import { WORLD, type Snapshot } from '@allora/engine';
import { Application, FillGradient, Graphics } from 'pixi.js';
import { useEffect, useMemo, useRef } from 'react';
import { composeScene, type SceneModel } from './compose';

const HEIGHT = 190;
const INK = 0x2b2620;

function draw(g: Graphics, m: SceneModel, W: number, H: number): void {
  g.clear();
  const sky = new FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    colorStops: [
      { offset: 0, color: m.sky.top },
      { offset: 1, color: m.sky.bottom },
    ],
    textureSpace: 'local',
  });
  g.rect(0, 0, W, H).fill(sky);
  for (const s of m.stars) g.circle(s.x * W, s.y * H, 1).fill({ color: 0xffffff, alpha: 0.8 });
  if (m.light) {
    const sun = m.light.kind === 'sun';
    g.circle(m.light.x * W, m.light.y * H, sun ? 13 : 9).fill(sun ? 0xffe9a8 : 0xe8ecf5);
  }
  // Far hills.
  const step = W / (m.far.ridge.length - 1);
  g.moveTo(0, H);
  m.far.ridge.forEach((y, i) => g.lineTo(i * step, y * H));
  g.lineTo(W, H).closePath().fill(m.far.color);
  g.rect(0, 0.78 * H, W, 0.22 * H).fill(m.ground);
  if (m.way === 'road') {
    g.moveTo(0, 0.9 * H)
      .lineTo(W, 0.84 * H)
      .lineTo(W, 0.9 * H)
      .lineTo(0, 0.98 * H)
      .closePath();
    g.fill(0xb9a37c);
  }
  for (const b of m.buildings) {
    const x = b.x * W;
    const w = b.w * W;
    const top = (b.y - b.h) * H;
    g.rect(x, top, w, b.h * H).fill(0x8a7460);
    if (b.roof) g.poly([x - 3, top, x + w / 2, top - w * 0.45, x + w + 3, top]).fill(0x6b3f33);
    if (b.lit) g.rect(x + w * 0.35, top + b.h * H * 0.35, w * 0.3, 7).fill(0xffd27a);
    if (b.smoke) {
      for (let i = 0; i < 3; i++) {
        g.circle(x + w * 0.7 + i * 4, top - w * 0.3 - i * 9, 4 + i).fill({
          color: 0xdddddd,
          alpha: 0.5 - i * 0.12,
        });
      }
    }
  }
  for (const t of m.trees) {
    const x = t.x * W;
    const base = t.y * H;
    g.rect(x - 1.5, base - t.h * H * 0.5, 3, t.h * H * 0.5).fill(0x4a3a2c);
    if (t.bare) {
      g.moveTo(x, base - t.h * H * 0.5).lineTo(x - 7, base - t.h * H);
      g.moveTo(x, base - t.h * H * 0.5).lineTo(x + 7, base - t.h * H);
      g.stroke({ color: 0x4a3a2c, width: 2 });
    } else g.circle(x, base - t.h * H * 0.7, t.w * W * 0.5 + 5).fill(t.color);
  }
  if (m.dusk > 0) {
    // Night falls on the land, not the sky.
    g.moveTo(0, H);
    m.far.ridge.forEach((y, i) => g.lineTo(i * step, y * H));
    g.lineTo(W, H)
      .closePath()
      .fill({ color: 0x0b1026, alpha: m.dusk * 0.6 });
  }
  // Lit windows shine through the dark.
  if (m.dusk > 0)
    for (const b of m.buildings) {
      if (!b.lit) continue;
      const top = (b.y - b.h) * H;
      g.rect(b.x * W + b.w * W * 0.35, top + b.h * H * 0.35, b.w * W * 0.3, 7).fill(0xffd27a);
    }
  for (const f of m.figures) {
    const x = f.x * W;
    const base = f.y * H;
    g.roundRect(x - 4, base - f.h * H * 0.72, 8, f.h * H * 0.72, 3).fill(INK);
    g.circle(x, base - f.h * H * 0.86, 3.5).fill(INK);
  }
}

/** The scene of where the life stands, drawn with PixiJS. Display only. */
export function SceneView({ snapshot }: { snapshot: Snapshot }) {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<{ app: Application; g: Graphics } | undefined>(undefined);
  const model = useMemo(() => composeScene(snapshot, WORLD), [snapshot]);
  const latest = useRef(model);
  const drawn = useRef('');

  const paint = () => {
    const s = stage.current;
    if (!s || !host.current) return;
    const key = `${latest.current.key}|${host.current.clientWidth}`;
    if (key === drawn.current) return;
    drawn.current = key;
    s.app.renderer.resize(host.current.clientWidth, HEIGHT);
    draw(s.g, latest.current, host.current.clientWidth, HEIGHT);
  };

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const app = new Application();
    let dead = false;
    void app
      .init({
        antialias: true,
        backgroundAlpha: 0,
        autoDensity: true,
        resolution: Math.min(2, window.devicePixelRatio || 1),
      })
      .then(() => {
        if (dead) return app.destroy();
        el.appendChild(app.canvas);
        const g = new Graphics();
        app.stage.addChild(g);
        stage.current = { app, g };
        paint();
      });
    const observer = new ResizeObserver(() => paint());
    observer.observe(el);
    return () => {
      dead = true;
      observer.disconnect();
      if (stage.current) stage.current.app.destroy(true, { children: true });
      stage.current = undefined;
      drawn.current = '';
    };
  }, []);

  useEffect(() => {
    latest.current = model;
    paint();
  });

  return (
    <div
      className="scene"
      ref={host}
      role="img"
      aria-label={model.description}
      data-testid="scene"
      data-scene={model.key}
      style={{ height: HEIGHT }}
    />
  );
}

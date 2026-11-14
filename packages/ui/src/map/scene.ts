/**
 * The map, drawn with PixiJS. It draws what it is given and reports taps.
 * It knows nothing of the rules: travel times and routes come from the engine.
 */
import type { Snapshot, WorldData } from '@allora/engine';
import { Application, Circle, Container, Graphics, Text } from 'pixi.js';
import {
  layoutMap,
  placeLabel,
  pointOf,
  regionIdsOf,
  shortName,
  type MapLayout,
  type Rect,
} from './layout';

interface Theme {
  bg: number;
  ink: number;
  accent: number;
  wild: number;
  sea: number;
}

const cssColor = (name: string, fallback: string): number => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  return parseInt(raw.replace('#', ''), 16);
};

const readTheme = (): Theme => ({
  bg: cssColor('--bg', '#f6f1e7'),
  ink: cssColor('--ink', '#2b2620'),
  accent: cssColor('--accent', '#a63a2b'),
  wild: cssColor('--wild', '#4f7a55'),
  sea: cssColor('--sea', '#3d6f8e'),
});

const FONT = "Georgia, 'Times New Roman', serif";
const RADIUS = { city: 5, settled: 4, wild: 4 } as const;

export class MapScene {
  private app = new Application();
  private ground = new Container();
  private marks = new Graphics();
  private chosenLabel = new Text({ text: '', style: { fontFamily: FONT, fontSize: 13 } });
  private layout: MapLayout = { width: 0, height: 0, regions: {} };
  private theme = readTheme();
  private snapshot: Snapshot | undefined;
  private chosen: string | undefined;
  private ready = false;
  private dead = false;

  constructor(
    private readonly host: HTMLElement,
    private readonly world: WorldData,
    private readonly onChoose: (placeId: string) => void,
  ) {}

  async start(): Promise<void> {
    await this.app.init({
      antialias: true,
      autoDensity: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      backgroundAlpha: 0,
    });
    if (this.dead) {
      this.app.destroy(true);
      return;
    }
    this.host.appendChild(this.app.canvas);
    this.app.stage.addChild(this.ground, this.marks, this.chosenLabel);
    this.ready = true;
    this.resize();
  }

  destroy(): void {
    this.dead = true;
    if (this.ready) this.app.destroy(true, { children: true });
  }

  /** Call when the host element changes width, or the colour scheme changes. */
  resize(): void {
    if (!this.ready) return;
    this.theme = readTheme();
    this.layout = layoutMap(this.host.clientWidth, regionIdsOf(this.world));
    this.app.renderer.resize(this.layout.width, this.layout.height);
    this.host.style.height = `${this.layout.height}px`;
    this.drawGround();
    this.drawMarks();
  }

  update(snapshot: Snapshot | undefined, chosen: string | undefined): void {
    this.snapshot = snapshot;
    this.chosen = chosen;
    if (this.ready) this.drawMarks();
  }

  private point(id: string): { x: number; y: number } {
    const place = this.world.places.find((p) => p.id === id);
    return place ? pointOf(place, this.layout) : { x: 0, y: 0 };
  }

  /** Regions, roads, places and names: everything that only changes with size. */
  private drawGround(): void {
    for (const child of this.ground.removeChildren()) child.destroy();
    const { ink, wild, sea, bg } = this.theme;
    const g = new Graphics();
    this.ground.addChild(g);

    for (const region of this.world.regions) {
      const box = this.layout.regions[region.id];
      if (!box) continue;
      g.roundRect(box.x, box.y, box.size, box.size, 6).stroke({
        width: 1,
        color: ink,
        alpha: 0.18,
      });
      const title = new Text({
        text: region.name,
        style: { fontFamily: FONT, fontSize: 15, fill: ink, letterSpacing: 1 },
      });
      title.position.set(box.x + 2, box.y - 24);
      this.ground.addChild(title);
    }

    for (const road of this.world.roads) {
      const a = this.point(road.from);
      const b = this.point(road.to);
      const style =
        road.way === 'sea' || road.way === 'river'
          ? { width: 1.5, color: sea, alpha: 0.7 }
          : road.way === 'track'
            ? { width: 1, color: wild, alpha: 0.6 }
            : { width: road.way === 'street' ? 1 : 1.6, color: ink, alpha: 0.45 };
      g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke(style);
    }

    const taken: Rect[] = [];
    for (const place of this.world.places) {
      const p = pointOf(place, this.layout);
      const r = RADIUS[place.kind];
      taken.push({ x: p.x - r - 2, y: p.y - r - 2, w: r * 2 + 4, h: r * 2 + 4 });
    }
    for (const place of this.world.places) {
      const p = pointOf(place, this.layout);
      const r = RADIUS[place.kind];
      if (place.kind === 'wild') g.circle(p.x, p.y, r).fill(bg).stroke({ width: 1.5, color: wild });
      else g.circle(p.x, p.y, r).fill(ink);

      const hit = new Container();
      hit.position.set(p.x, p.y);
      hit.eventMode = 'static';
      hit.cursor = 'pointer';
      hit.hitArea = new Circle(0, 0, 16);
      hit.label = place.id;
      hit.on('pointertap', () => this.onChoose(place.id));
      this.ground.addChild(hit);

      const label = new Text({
        text: shortName(place.name),
        style: { fontFamily: FONT, fontSize: 11, fill: ink },
      });
      label.alpha = 0.8;
      const spot = placeLabel(p, label.width, label.height, taken, this.layout, r + 3);
      if (!spot) {
        label.destroy();
        continue;
      }
      label.position.set(spot.x, spot.y);
      taken.push(spot);
      this.ground.addChild(label);
    }
  }

  /** The life, the chosen place and the journey: everything that changes as time passes. */
  private drawMarks(): void {
    const { ink, accent, bg } = this.theme;
    const m = this.marks.clear();
    this.chosenLabel.visible = false;
    const snap = this.snapshot;

    if (this.chosen) {
      const p = this.point(this.chosen);
      m.circle(p.x, p.y, 10).stroke({ width: 1.5, color: ink, alpha: 0.9 });
      const place = this.world.places.find((x) => x.id === this.chosen);
      if (place) {
        this.chosenLabel.text = place.name;
        this.chosenLabel.style.fill = ink;
        const x = Math.max(
          2,
          Math.min(
            this.layout.width - this.chosenLabel.width - 2,
            p.x - this.chosenLabel.width / 2,
          ),
        );
        const y = p.y - 16 - this.chosenLabel.height;
        m.roundRect(x - 4, y - 1, this.chosenLabel.width + 8, this.chosenLabel.height + 2, 3).fill({
          color: bg,
          alpha: 0.92,
        });
        this.chosenLabel.position.set(x, y);
        this.chosenLabel.visible = true;
      }
    }
    if (!snap) return;

    let at = this.point(snap.place);
    if (snap.journey) {
      const from = this.point(snap.journey.last);
      const to = this.point(snap.journey.next);
      const t = snap.journey.legProgress;
      at = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
      const goal = this.point(snap.journey.to);
      m.circle(goal.x, goal.y, 8).stroke({ width: 1.5, color: accent, alpha: 0.8 });
    }
    m.circle(at.x, at.y, 6.5).fill(accent).stroke({ width: 2, color: bg });
  }
}

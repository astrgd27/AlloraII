/**
 * The map, drawn with PixiJS. It draws what it is given and reports taps.
 * It knows no rules: routes are found by the engine's own World.
 */
import { World, type Snapshot, type WorldData } from '@allora/engine';
import { Application, Container, Graphics, Text } from 'pixi.js';
import { HOME, centreOn, clamp, toScreen, zoomAt, type Camera } from './camera';
import {
  layoutMap,
  placeLabel,
  pointOf,
  regionIdsOf,
  shortName,
  type MapLayout,
  type Rect,
} from './layout';

const C = {
  land: 0x1d2531,
  edge: 0x3a4656,
  ink: 0xe6dcc6,
  muted: 0xa39b87,
  gilt: 0xc9a24a,
  accent: 0xd86a48,
  wild: 0x6fa37a,
  forest: 0x2f4a36,
  field: 0x4a4430,
  sea: 0x5b93b8,
  water: 0x22415a,
};
const FONT = "'Palatino Linotype', Palatino, Georgia, serif";
const RADIUS = { city: 5, settled: 3.5, wild: 3.5 } as const;
/** Which names are placed first when there is not room for all. */
const RANK = { city: 0, settled: 1, wild: 2 } as const;

type Pt = { x: number; y: number };

export class MapScene {
  private app = new Application();
  private ground = new Graphics();
  private labels = new Container();
  private marks = new Graphics();
  private layout: MapLayout = { width: 0, height: 0, regions: {} };
  private cam: Camera = HOME;
  private routes: World;
  private base = new Map<string, Pt>();
  private snapshot: Snapshot | undefined;
  private chosen: string | undefined;
  private ready = false;
  private dead = false;
  private drag: { x: number; y: number; cam: Camera; moved: boolean } | undefined;
  private frame = 0;

  constructor(
    private readonly host: HTMLElement,
    private readonly world: WorldData,
    private readonly onChoose: (placeId: string) => void,
    full: WorldData,
  ) {
    this.routes = new World(full);
  }

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
    this.app.stage.addChild(this.ground, this.labels, this.marks);
    const canvas = this.app.canvas;
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerup', this.onUp);
    canvas.addEventListener('pointerleave', () => (this.drag = undefined));
    this.ready = true;
    this.resize();
  }

  destroy(): void {
    this.dead = true;
    cancelAnimationFrame(this.frame);
    if (this.ready) this.app.destroy(true, { children: true });
  }

  resize(): void {
    if (!this.ready) return;
    this.layout = layoutMap(
      this.host.clientWidth,
      regionIdsOf(this.world),
      Math.max(120, this.host.clientHeight),
    );
    this.app.renderer.resize(this.layout.width, this.layout.height);
    this.base = new Map(this.world.places.map((p) => [p.id, pointOf(p, this.layout)]));
    this.cam = clamp(this.cam, this.centre());
    this.draw();
  }

  update(snapshot: Snapshot | undefined, chosen: string | undefined): void {
    this.snapshot = snapshot;
    this.chosen = chosen;
    if (this.ready) this.drawMarks();
  }

  /** Zoom controls from the page. */
  zoomBy(factor: number): void {
    this.cam = zoomAt(this.cam, factor, this.centre(), this.centre());
    this.draw();
  }

  /** Back to the whole realm, or close in on the life. */
  home(): void {
    this.cam = HOME;
    this.draw();
  }

  findLife(): void {
    const at = this.snapshot && this.base.get(this.snapshot.journey?.next ?? this.snapshot.place);
    if (!at) return;
    this.cam = centreOn({ ...this.cam, zoom: Math.max(this.cam.zoom, 3) }, at, this.centre());
    this.draw();
  }

  private centre(): Pt {
    return { x: this.layout.width / 2, y: this.layout.height / 2 };
  }

  private at(id: string): Pt | undefined {
    const p = this.base.get(id);
    return p && toScreen(p, this.cam, this.centre());
  }

  private draw(): void {
    // The view, for tests and for the page's own tools.
    this.host.dataset.view = `${this.cam.zoom.toFixed(2)},${Math.round(this.cam.x)},${Math.round(this.cam.y)}`;
    this.drawGround();
    this.drawMarks();
  }

  private schedule(): void {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.draw());
  }

  // ---- input ----

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const r = this.app.canvas.getBoundingClientRect();
    this.cam = zoomAt(
      this.cam,
      e.deltaY < 0 ? 1.15 : 1 / 1.15,
      { x: e.clientX - r.left, y: e.clientY - r.top },
      this.centre(),
    );
    this.schedule();
  };

  private onDown = (e: PointerEvent): void => {
    this.drag = { x: e.clientX, y: e.clientY, cam: this.cam, moved: false };
  };

  private onMove = (e: PointerEvent): void => {
    const d = this.drag;
    if (!d) {
      this.app.canvas.style.cursor = this.nearest(e) ? 'pointer' : 'grab';
      return;
    }
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    this.app.canvas.style.cursor = 'grabbing';
    this.cam = clamp({ zoom: d.cam.zoom, x: d.cam.x + dx, y: d.cam.y + dy }, this.centre());
    this.schedule();
  };

  private onUp = (e: PointerEvent): void => {
    const d = this.drag;
    this.drag = undefined;
    if (d && !d.moved) {
      const id = this.nearest(e);
      if (id) this.onChoose(id);
    }
  };

  /** The place under the pointer, if any. */
  private nearest(e: PointerEvent): string | undefined {
    const r = this.app.canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    let best: string | undefined;
    let dist = 14;
    for (const id of this.base.keys()) {
      const p = this.at(id);
      if (!p) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < dist) {
        dist = d;
        best = id;
      }
    }
    return best;
  }

  // ---- drawing ----

  /** Land, water, woods, roads, places and names. Redrawn when the view moves. */
  private drawGround(): void {
    const g = this.ground.clear();
    for (const child of this.labels.removeChildren()) child.destroy();
    const z = this.cam.zoom;
    const centre = this.centre();

    for (const region of this.world.regions) {
      const box = this.layout.regions[region.id];
      if (!box) continue;
      const a = toScreen({ x: box.x, y: box.y }, this.cam, centre);
      g.roundRect(a.x, a.y, box.size * z, box.size * z, 8)
        .fill({ color: C.land })
        .stroke({ width: 1, color: C.edge });
    }

    // Woods and fields round places, and water along the ways by boat.
    for (const place of this.world.places) {
      const p = this.at(place.id);
      if (!p) continue;
      if (place.kind === 'wild')
        g.circle(p.x, p.y, 22 * z ** 0.8).fill({ color: C.forest, alpha: 0.55 });
      else
        g.circle(p.x, p.y, (place.kind === 'city' ? 18 : 12) * z ** 0.8).fill({
          color: C.field,
          alpha: 0.45,
        });
    }
    for (const road of this.world.roads) {
      if (road.way !== 'sea' && road.way !== 'river') continue;
      const a = this.at(road.from);
      const b = this.at(road.to);
      if (a && b)
        g.moveTo(a.x, a.y)
          .lineTo(b.x, b.y)
          .stroke({ width: 10 * z ** 0.7, color: C.water, alpha: 0.7, cap: 'round' });
    }
    for (const road of this.world.roads) {
      const a = this.at(road.from);
      const b = this.at(road.to);
      if (!a || !b) continue;
      const water = road.way === 'sea' || road.way === 'river';
      const style = water
        ? { width: 1.2, color: C.sea, alpha: 0.8 }
        : road.way === 'track'
          ? { width: 1, color: C.wild, alpha: 0.7 }
          : { width: road.way === 'road' ? 1.8 : 1, color: C.muted, alpha: 0.6 };
      g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke(style);
    }

    // Places, then as many names as there is room for: towns first, then villages, then the wild.
    const taken: Rect[] = [];
    const order = [...this.world.places].sort(
      (a, b) => RANK[a.kind] - RANK[b.kind] || Number(Boolean(b.canon)) - Number(Boolean(a.canon)),
    );
    for (const place of order) {
      const p = this.at(place.id);
      if (!p) continue;
      const r = RADIUS[place.kind] * Math.min(1.6, z ** 0.3);
      taken.push({ x: p.x - r - 2, y: p.y - r - 2, w: r * 2 + 4, h: r * 2 + 4 });
      if (place.kind === 'wild')
        g.circle(p.x, p.y, r).fill(C.land).stroke({ width: 1.5, color: C.wild });
      else if (place.kind === 'city')
        g.rect(p.x - r, p.y - r, r * 2, r * 2)
          .fill(C.ink)
          .stroke({ width: 1, color: C.land });
      else g.circle(p.x, p.y, r).fill(C.ink);
    }
    const bounds = { width: this.layout.width, height: this.layout.height };
    for (const place of order) {
      const p = this.at(place.id);
      if (!p) continue;
      const city = place.kind === 'city';
      const label = new Text({
        text: shortName(place.name),
        style: {
          fontFamily: FONT,
          fontSize: city ? 13 : 11,
          fill: city ? C.ink : C.muted,
          fontWeight: city ? 'bold' : 'normal',
        },
      });
      const spot = placeLabel(p, label.width, label.height, taken, bounds, RADIUS[place.kind] + 4);
      if (!spot) {
        label.destroy();
        continue;
      }
      label.position.set(spot.x, spot.y);
      taken.push(spot);
      this.labels.addChild(label);
    }
  }

  /** The life, the chosen place, and the way between. Redrawn as time passes. */
  private drawMarks(): void {
    const m = this.marks.clear();
    for (const child of this.marks.removeChildren()) child.destroy();
    const snap = this.snapshot;
    if (!snap) return;
    const j = snap.journey;

    // The way still to go: the journey in hand, or the way to the chosen place.
    const from = j ? j.next : snap.place;
    const to = j ? j.to : this.chosen && this.chosen !== snap.place ? this.chosen : undefined;
    if (to) {
      const route = this.routes.route(from, to);
      const pts = [from, ...(route?.legs.map((l) => l.to) ?? [])].map((id) => this.at(id));
      if (pts.every(Boolean) && pts.length > 1) {
        const line = pts as Pt[];
        m.moveTo(line[0]!.x, line[0]!.y);
        for (const p of line.slice(1)) m.lineTo(p.x, p.y);
        m.stroke({ width: 3, color: C.gilt, alpha: 0.85, cap: 'round', join: 'round' });
      }
      const goal = this.at(to);
      if (goal) m.circle(goal.x, goal.y, 9).stroke({ width: 2, color: C.gilt });
    }
    if (this.chosen && this.chosen !== to) {
      const c = this.at(this.chosen);
      if (c) m.circle(c.x, c.y, 9).stroke({ width: 1.5, color: C.ink, alpha: 0.9 });
    }
    if (this.chosen) {
      const c = this.at(this.chosen);
      const place = this.world.places.find((p) => p.id === this.chosen);
      const inView =
        c && c.x >= 0 && c.y >= 0 && c.x <= this.layout.width && c.y <= this.layout.height;
      if (c && place && inView) {
        const label = new Text({
          text: place.name,
          style: { fontFamily: FONT, fontSize: 13, fill: C.ink },
        });
        const x = Math.max(4, Math.min(this.layout.width - label.width - 4, c.x - label.width / 2));
        const y = Math.max(4, c.y - 18 - label.height);
        m.roundRect(x - 5, y - 2, label.width + 10, label.height + 4, 3)
          .fill({ color: 0x11151b, alpha: 0.92 })
          .stroke({ width: 1, color: C.gilt });
        label.position.set(x, y);
        this.marks.addChild(label);
      }
    }

    // The life itself.
    let at = this.at(snap.place);
    if (j) {
      const a = this.at(j.last);
      const b = this.at(j.next);
      if (a && b)
        at = { x: a.x + (b.x - a.x) * j.legProgress, y: a.y + (b.y - a.y) * j.legProgress };
    }
    if (at) {
      m.circle(at.x, at.y, 11).fill({ color: C.accent, alpha: 0.25 });
      m.circle(at.x, at.y, 6.5).fill(C.accent).stroke({ width: 2, color: 0x11151b });
    }
  }
}

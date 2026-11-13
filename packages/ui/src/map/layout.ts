/** Where things go on the map canvas. Pure maths, so it can be tested without a canvas. */
import type { Place, WorldData } from '@allora/engine';

export interface Box {
  x: number;
  y: number;
  size: number;
}

export interface MapLayout {
  width: number;
  height: number;
  /** Region id → the square it is drawn in. */
  regions: Record<string, Box>;
}

export const NARROW = 640;
const GAP = 24;
const TITLE = 28;
const PAD = 14;

/** Regions sit side by side on a wide screen and stack on a narrow one. */
export function layoutMap(width: number, regionIds: string[]): MapLayout {
  const n = Math.max(1, regionIds.length);
  const stacked = width < NARROW;
  const size = stacked ? width : Math.min(560, (width - GAP * (n - 1)) / n);
  const regions: Record<string, Box> = {};
  const total = stacked ? size : size * n + GAP * (n - 1);
  const left = (width - total) / 2;
  regionIds.forEach((id, i) => {
    regions[id] = stacked
      ? { x: left, y: i * (size + TITLE + GAP) + TITLE, size }
      : { x: left + i * (size + GAP), y: TITLE, size };
  });
  const rows = stacked ? n : 1;
  return { width, height: rows * (size + TITLE) + (rows - 1) * GAP, regions };
}

/** A place's point on the canvas. Place coordinates run 0 to 100 within their region. */
export function pointOf(place: Place, layout: MapLayout): { x: number; y: number } {
  const box = layout.regions[place.region];
  if (!box) return { x: 0, y: 0 };
  const inner = box.size - PAD * 2;
  return { x: box.x + PAD + (place.x / 100) * inner, y: box.y + PAD + (place.y / 100) * inner };
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/**
 * Finds room for a label beside a point: below, above, right, then left.
 * Returns undefined when every spot is taken; the label then shows only when chosen.
 */
export function placeLabel(
  point: { x: number; y: number },
  w: number,
  h: number,
  taken: Rect[],
  bounds: { width: number; height: number },
  offset = 9,
): Rect | undefined {
  const spots: Rect[] = [
    { x: point.x - w / 2, y: point.y + offset, w, h },
    { x: point.x - w / 2, y: point.y - offset - h, w, h },
    { x: point.x + offset, y: point.y - h / 2, w, h },
    { x: point.x - offset - w, y: point.y - h / 2, w, h },
  ];
  return spots.find(
    (s) =>
      s.x >= 0 &&
      s.y >= 0 &&
      s.x + s.w <= bounds.width &&
      s.y + s.h <= bounds.height &&
      !taken.some((t) => overlaps(s, t)),
  );
}

/** A shorter name for the map: the part before a comma or an ampersand. */
export const shortName = (name: string): string => (name.split(/,| & /)[0] ?? name).trim();

export const regionIdsOf = (world: WorldData): string[] => world.regions.map((r) => r.id);

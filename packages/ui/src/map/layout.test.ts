import { WORLD } from '@allora/engine';
import { describe, expect, it } from 'vitest';
import { hoursText } from '../format';
import { layoutMap, placeLabel, pointOf, shortName } from './layout';

describe('map layout', () => {
  it('puts regions side by side when wide and stacks them when narrow', () => {
    const wide = layoutMap(1160, ['a', 'b']);
    expect(wide.regions.a!.y).toBe(wide.regions.b!.y);
    expect(wide.regions.b!.x).toBeGreaterThan(wide.regions.a!.x + wide.regions.a!.size);
    const narrow = layoutMap(390, ['a', 'b']);
    expect(narrow.regions.a!.size).toBe(390);
    expect(narrow.regions.b!.y).toBeGreaterThan(narrow.regions.a!.y + 390);
    expect(narrow.height).toBeGreaterThan(780);
  });

  it('keeps every place of the world inside its region and the canvas', () => {
    for (const width of [360, 390, 800, 1160]) {
      const layout = layoutMap(
        width,
        WORLD.regions.map((r) => r.id),
      );
      for (const place of WORLD.places) {
        const p = pointOf(place, layout);
        const box = layout.regions[place.region]!;
        expect(p.x).toBeGreaterThanOrEqual(box.x);
        expect(p.x).toBeLessThanOrEqual(box.x + box.size);
        expect(p.y).toBeGreaterThanOrEqual(box.y);
        expect(p.y).toBeLessThanOrEqual(box.y + box.size);
        expect(p.x).toBeLessThanOrEqual(layout.width);
      }
    }
  });

  it('finds room for a label, or gives up', () => {
    const bounds = { width: 200, height: 200 };
    const below = placeLabel({ x: 100, y: 100 }, 40, 10, [], bounds);
    expect(below).toEqual({ x: 80, y: 109, w: 40, h: 10 });
    const above = placeLabel({ x: 100, y: 100 }, 40, 10, [below!], bounds);
    expect(above?.y).toBe(81);
    expect(
      placeLabel({ x: 100, y: 100 }, 40, 10, [{ x: 0, y: 0, w: 200, h: 200 }], bounds),
    ).toBeUndefined();
    // Near the left edge, the label goes to the right, not off the canvas.
    expect(placeLabel({ x: 5, y: 195 }, 40, 10, [], bounds)?.x).toBe(14);
  });

  it('shortens names for the map and words travel times', () => {
    expect(shortName('Pomerell, the Orchard Abbey')).toBe('Pomerell');
    expect(shortName('Salzmarkt & Guild Quarter')).toBe('Salzmarkt');
    expect([1, 7, 24, 27, 49].map(hoursText)).toEqual([
      '1 hour',
      '7 hours',
      '1 day',
      '1 day, 3 hours',
      '2 days, 1 hour',
    ]);
  });
});

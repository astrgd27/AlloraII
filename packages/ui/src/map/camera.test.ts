import { describe, expect, it } from 'vitest';
import { HOME, MAX_ZOOM, centreOn, clamp, toScreen, zoomAt } from './camera';

const centre = { x: 300, y: 200 };

describe('the map camera', () => {
  it('shows the map as laid out at the start', () => {
    expect(toScreen({ x: 10, y: 20 }, HOME, centre)).toEqual({ x: 10, y: 20 });
  });

  it('zooms about the pointer, keeping the point under it still', () => {
    const at = { x: 120, y: 80 };
    const cam = zoomAt(HOME, 2, at, centre);
    expect(cam.zoom).toBe(2);
    const p = toScreen(at, cam, centre);
    expect(p.x).toBeCloseTo(at.x);
    expect(p.y).toBeCloseTo(at.y);
  });

  it('keeps zoom within bounds and the map within reach', () => {
    let cam = HOME;
    for (let i = 0; i < 40; i++) cam = zoomAt(cam, 1.5, centre, centre);
    expect(cam.zoom).toBe(MAX_ZOOM);
    expect(zoomAt(HOME, 0.1, centre, centre).zoom).toBe(1);
    const far = clamp({ zoom: 1, x: 99999, y: -99999 }, centre);
    expect(far.x).toBe(300);
    expect(far.y).toBe(-200);
  });

  it('centres on a place', () => {
    const cam = centreOn({ zoom: 3, x: 0, y: 0 }, { x: 250, y: 150 }, centre);
    const p = toScreen({ x: 250, y: 150 }, cam, centre);
    expect(p.x).toBeCloseTo(300);
    expect(p.y).toBeCloseTo(200);
  });
});

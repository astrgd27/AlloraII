/** The map's camera: zoom and pan, as pure maths so it can be tested without a canvas. */

export interface Camera {
  zoom: number;
  /** Offset of the view, in screen pixels. */
  x: number;
  y: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 6;
export const HOME: Camera = { zoom: 1, x: 0, y: 0 };

/** Where a point of the unzoomed map appears on screen. */
export function toScreen(
  p: { x: number; y: number },
  cam: Camera,
  centre: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: (p.x - centre.x) * cam.zoom + centre.x + cam.x,
    y: (p.y - centre.y) * cam.zoom + centre.y + cam.y,
  };
}

/** Zooms by `factor`, keeping the map point under `at` (screen pixels) where it is. */
export function zoomAt(
  cam: Camera,
  factor: number,
  at: { x: number; y: number },
  centre: { x: number; y: number },
): Camera {
  const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.zoom * factor));
  const k = zoom / cam.zoom;
  // The screen point `at` stays fixed: solve for the new offset.
  const x = at.x - centre.x - (at.x - centre.x - cam.x) * k;
  const y = at.y - centre.y - (at.y - centre.y - cam.y) * k;
  return clamp({ zoom, x, y }, centre);
}

/** Keeps the map from being dragged out of sight: the centre may move at most half a map away. */
export function clamp(cam: Camera, centre: { x: number; y: number }): Camera {
  const limitX = centre.x * cam.zoom;
  const limitY = centre.y * cam.zoom;
  return {
    zoom: cam.zoom,
    x: Math.max(-limitX, Math.min(limitX, cam.x)),
    y: Math.max(-limitY, Math.min(limitY, cam.y)),
  };
}

/** Moves the view so that `p` (an unzoomed map point) is at the centre. */
export function centreOn(
  cam: Camera,
  p: { x: number; y: number },
  centre: { x: number; y: number },
): Camera {
  return clamp(
    { zoom: cam.zoom, x: -(p.x - centre.x) * cam.zoom, y: -(p.y - centre.y) * cam.zoom },
    centre,
  );
}

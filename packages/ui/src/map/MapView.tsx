import { WORLD, type Snapshot, type WorldData } from '@allora/engine';
import { useEffect, useMemo, useRef } from 'react';
import { MapScene } from './scene';

interface Props {
  snapshot: Snapshot | undefined;
  chosen: string | undefined;
  /** The realm shown. */
  region: string;
  onChoose: (placeId: string) => void;
}

/** One realm of the world: its places, and the ways that stay inside it. */
function realmOf(region: string): WorldData {
  const places = WORLD.places.filter((p) => p.region === region);
  const ids = new Set(places.map((p) => p.id));
  return {
    ...WORLD,
    regions: WORLD.regions.filter((r) => r.id === region),
    places,
    roads: WORLD.roads.filter((r) => ids.has(r.from) && ids.has(r.to)),
  };
}

/** Hosts the PixiJS map and keeps it in step with the engine's state. */
export function MapView({ snapshot, chosen, region, onChoose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<MapScene | undefined>(undefined);
  const choose = useRef(onChoose);
  const realm = useMemo(() => realmOf(region), [region]);
  useEffect(() => {
    choose.current = onChoose;
  }, [onChoose]);

  useEffect(() => {
    if (!host.current) return;
    const s = new MapScene(host.current, realm, (id) => choose.current(id), WORLD);
    scene.current = s;
    void s.start();
    const observer = new ResizeObserver(() => s.resize());
    observer.observe(host.current);
    return () => {
      observer.disconnect();
      s.destroy();
      scene.current = undefined;
    };
  }, [realm]);

  useEffect(() => {
    scene.current?.update(snapshot, chosen);
  });

  const name = realm.regions[0]?.name ?? '';
  return (
    <div className="map-frame">
      <div className="map" ref={host} role="img" aria-label={`Map of ${name}`} data-testid="map" />
      <div className="map-tools">
        <button
          type="button"
          title="Closer (or the mouse wheel)"
          onClick={() => scene.current?.zoomBy(1.4)}
        >
          +
        </button>
        <button type="button" title="Further" onClick={() => scene.current?.zoomBy(1 / 1.4)}>
          −
        </button>
        <button type="button" title="The whole realm" onClick={() => scene.current?.home()}>
          ⌂
        </button>
        <button
          type="button"
          title="Find the life on the map"
          onClick={() => scene.current?.findLife()}
        >
          ◎
        </button>
      </div>
    </div>
  );
}

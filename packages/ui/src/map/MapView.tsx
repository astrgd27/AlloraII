import { WORLD, type Snapshot } from '@allora/engine';
import { useEffect, useRef } from 'react';
import { MapScene } from './scene';

interface Props {
  snapshot: Snapshot | undefined;
  chosen: string | undefined;
  onChoose: (placeId: string) => void;
}

/** Hosts the PixiJS map and keeps it in step with the engine's state. */
export function MapView({ snapshot, chosen, onChoose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<MapScene | undefined>(undefined);
  const choose = useRef(onChoose);
  useEffect(() => {
    choose.current = onChoose;
  }, [onChoose]);

  useEffect(() => {
    if (!host.current) return;
    const s = new MapScene(host.current, WORLD, (id) => choose.current(id));
    scene.current = s;
    void s.start();
    const observer = new ResizeObserver(() => s.resize());
    observer.observe(host.current);
    const scheme = matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => s.resize();
    scheme.addEventListener('change', onScheme);
    return () => {
      observer.disconnect();
      scheme.removeEventListener('change', onScheme);
      s.destroy();
      scene.current = undefined;
    };
  }, []);

  useEffect(() => {
    scene.current?.update(snapshot, chosen);
  });

  return <div className="map" ref={host} role="img" aria-label="Map of Eintenn and Marre" />;
}

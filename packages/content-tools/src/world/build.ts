/**
 * `pnpm world`: builds the world data the engine and the map load.
 *   --roads   also (re)writes the stub roads in content/world/roads/ from canon places
 *   --check   fails if the built file on disk is out of date
 *
 * Phase 0 covers Eintenn and Marre only (the map stub).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';
import { regionRoads, seaLane, type MapPlace, type MapRegion, type Road } from './roads';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
export const WORLD_REGIONS = ['eintenn', 'marre'];
const ROADS_DIR = 'content/world/roads';
const OUT = 'packages/engine/src/generated/world.json';

const ROADS_HEADER =
  '# Stub roads, laid by `pnpm world --roads` over canon places, for the owner to redraw.\n' +
  '# Allora I has no roads inside a realm; these are new. Hours follow Allora I’s travel formula.\n' +
  '# Once edited by hand, do not run `--roads` again for this file: it would overwrite the edits.\n';

type Raw = Record<string, unknown>;
const readYaml = async (path: string): Promise<Raw[]> =>
  parse(await readFile(join(ROOT, path), 'utf8')) as Raw[];

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const allPlaces = await readYaml('content/canon/allora1/places.yaml');
  const allRegions = await readYaml('content/canon/allora1/regions.yaml');

  const regions = allRegions.filter((r) => WORLD_REGIONS.includes(r.id as string));
  const places = allPlaces.filter((p) => WORLD_REGIONS.includes(p.region as string));
  const mapPlaces = places as unknown as MapPlace[];

  if (args.has('--roads')) {
    await mkdir(join(ROOT, ROADS_DIR), { recursive: true });
    for (const region of WORLD_REGIONS) {
      const roads = regionRoads(mapPlaces.filter((p) => p.region === region));
      await writeFile(join(ROOT, ROADS_DIR, `${region}.yaml`), ROADS_HEADER + stringify(roads));
    }
    const byId = new Map(mapPlaces.map((p) => [p.id, p]));
    const [a, b] = regions as unknown as MapRegion[];
    if (a && b) {
      const lanes = [seaLane(a, b, byId)];
      await writeFile(join(ROOT, ROADS_DIR, 'sea-lanes.yaml'), ROADS_HEADER + stringify(lanes));
    }
    console.log(`Wrote stub roads to ${ROADS_DIR}.`);
  }

  const roads: Road[] = [];
  for (const file of [...WORLD_REGIONS, 'sea-lanes']) {
    roads.push(...((await readYaml(`${ROADS_DIR}/${file}.yaml`)) as unknown as Road[]));
  }

  const world = {
    regions: regions.map((r) => ({ id: r.id, name: r.name })),
    places: places.map((p) => ({
      id: p.id,
      name: p.name,
      region: p.region,
      x: p.x,
      y: p.y,
      kind: p.city ? 'city' : p.wild ? 'wild' : 'settled',
    })),
    roads: roads.map((r) => ({ id: r.id, from: r.from, to: r.to, way: r.way, hours: r.hours })),
  };
  const text = `${JSON.stringify(world, null, 1)}\n`;

  if (args.has('--check')) {
    const onDisk = await readFile(join(ROOT, OUT), 'utf8').catch(() => undefined);
    if (onDisk !== text) {
      console.error(`${OUT} is out of date. Run \`pnpm world\`.`);
      process.exit(1);
    }
    console.log(`${OUT} is up to date.`);
    return;
  }
  await mkdir(dirname(join(ROOT, OUT)), { recursive: true });
  await writeFile(join(ROOT, OUT), text);
  console.log(
    `Wrote ${OUT}: ${world.places.length} places, ${world.roads.length} roads, ${world.regions.length} regions.`,
  );
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

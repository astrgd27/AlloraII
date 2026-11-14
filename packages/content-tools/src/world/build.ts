/**
 * `pnpm world`: builds the world data the engine and the map load.
 *   --roads   also (re)writes the stub roads in content/world/roads/ from canon places
 *   --check   fails if the built file on disk is out of date
 *
 * Phase 0 covers Eintenn and Marre only (the map stub).
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
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
  const readDir = async (dir: string): Promise<Raw[]> => {
    const out: Raw[] = [];
    for (const file of (await readdir(join(ROOT, dir)).catch(() => [] as string[])).sort()) {
      if (file.endsWith('.yaml')) out.push(...(await readYaml(`${dir}/${file}`)));
    }
    return out;
  };
  // Canon places first, then the places Allora II adds.
  const places = [...allPlaces, ...(await readDir('content/world/places'))].filter((p) =>
    WORLD_REGIONS.includes(p.region as string),
  );
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

  const roads = (await readDir(ROADS_DIR)) as unknown as Road[];

  // Activities at the places of this world, with the name of the sub-place they belong to.
  const activities = await readDir('content/activities');
  const placeIds = new Set(places.map((p) => p.id));
  const subName = (placeId: unknown, subId: unknown): string | undefined => {
    const place = places.find((p) => p.id === placeId);
    const subs = (place?.subs as Raw[] | undefined) ?? [];
    return subs.find((s) => s.id === subId)?.name as string | undefined;
  };

  // People of this world who keep a schedule (Allora I's NPCS). Wanderers with a route come later.
  const npcs = [
    ...(await readYaml('content/canon/allora1/npcs.yaml')),
    ...(await readDir('content/people')),
  ].filter((n) => WORLD_REGIONS.includes(n.region as string) && Array.isArray(n.sched));

  const world = {
    regions: regions.map((r) => ({ id: r.id, name: r.name })),
    places: places.map((p) => ({
      id: p.id,
      name: p.name,
      region: p.region,
      x: p.x,
      y: p.y,
      kind: p.city ? 'city' : p.wild || p.place_kind === 'wild' ? 'wild' : 'settled',
      canon: p.origin === 'allora1',
      subs: Object.fromEntries(((p.subs as Raw[] | undefined) ?? []).map((x) => [x.id, x.name])),
    })),
    roads: roads.map((r) => ({
      id: r.id,
      from: r.from,
      to: r.to,
      way: r.way,
      hours: r.hours,
      route: (r as unknown as Raw).route,
    })),
    routes: (await readDir('content/world/routes')).map((r) => ({
      id: r.id,
      name: r.name,
      text: r.text,
    })),
    roadEvents: (await readDir('content/events'))
      .filter((e) => e.kind === 'road_event')
      .map((e) => ({ id: e.id, text: e.text, ways: e.ways, effects: e.effects ?? {} })),
    skills: (await readYaml('content/skills/skills.yaml')).map((k) => ({
      id: k.id,
      name: k.name,
      family: k.family,
    })),
    people: npcs.map((n) => ({
      id: n.id,
      name: n.name,
      title: n.title,
      hint: n.hint,
      meet: n.meet,
      talk: n.talk,
      sched: n.sched,
    })),
    activities: activities
      .filter((a) => placeIds.has(a.place))
      .map((a) => ({
        id: a.id,
        name: a.name,
        text: a.text,
        place: a.place,
        sub: a.sub,
        subName: subName(a.place, a.sub),
        from: a.from,
        to: a.to,
        hours: a.hours,
        seasons: a.seasons,
        skill: a.skill,
        dc: a.dc,
        effects: a.effects ?? {},
      })),
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
    `Wrote ${OUT}: ${world.places.length} places, ${world.roads.length} roads, ${world.activities.length} activities.`,
  );
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

"""Turns a compact table of places into YAML: places, people, activities and roads."""
import math, re
def canon_coords(root):
    out = {}
    for block in open(root + '/content/canon/allora1/places.yaml').read().split('\n- id: ')[1:]:
        i = block.split('\n', 1)[0].strip()
        x = re.search(r'^  x: (\d+)', block, re.M); y = re.search(r'^  y: (\d+)', block, re.M)
        if x and y: out[i] = (int(x.group(1)), int(y.group(1)))
    return out
q = lambda s: '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'
def write_batch(root, region, tag, P, title, extra_pos=None, water=False):
    canon = canon_coords(root); canon.update(extra_pos or {})
    ids = {p[0] for p in P}
    pid = lambda x: f'place_{region}_{x}' if x in ids else x
    pos = {**canon, **{pid(p[0]): (p[3], p[4]) for p in P}}
    hdr = f"# {title}\n"
    places = people = acts = roads = hdr
    seen = set()
    for (i, name, kind, x, y, roots, desc, subs, links, per, act) in P:
        me = pid(i)
        places += f"- id: {me}\n  origin: allora2\n  kind: place\n  roots:\n" + ''.join(f"    - {pid(r)}\n" for r in roots) + f"  name: {q(name)}\n  place_kind: {kind}\n  region: {region}\n  x: {x}\n  y: {y}\n  description: {q(desc)}\n  subs:\n" + ''.join(f"    - id: {s}\n      name: {q(n)}\n      description: {q(d)}\n" for s, n, d in subs)
        (pi, pn, pt, hint, meet, t1, t2, day, night) = per
        people += f"- id: person_{region}_{pi}\n  origin: allora2\n  kind: person\n  roots:\n    - {me}\n  name: {q(pn)}\n  title: {q(pt)}\n  region: {region}\n  home: {me}\n  hint: {q(hint)}\n  meet: {q(meet)}\n  talk:\n    - {q(t1)}\n    - {q(t2)}\n  sched:\n    - at: [{me}, {day}]\n      h: [6, 20]\n    - at: [{me}, {night}]\n"
        (ai, an, at, asub, af, ato, ah, ask, adc) = act
        acts += f"- id: activity_{i}_{ai}\n  origin: allora2\n  kind: activity\n  roots:\n    - {me}\n  name: {q(an)}\n  text: {q(at)}\n  place: {me}\n  sub: {asub}\n  from: {af}\n  to: {ato}\n  hours: {ah}\n  skill: {ask}\n" + (f"  dc: {adc}\n" if adc else '') + "  effects:\n    vigour: " + str(-3 * ah) + "\n"
        for l in links:
            a, b = sorted([me, pid(l)])
            if (a, b) in seen: continue
            seen.add((a, b))
            d = math.hypot(pos[a][0] - pos[b][0], pos[a][1] - pos[b][1])
            way = 'track' if kind == 'wild' else 'road'
            # In a lagoon a short hop is a street and bridge; anything longer is a boat.
            if water: way = 'street' if round(d * 0.38) <= 1 else 'river'
            roads += f"- id: road_{a}_{b}\n  origin: allora2\n  kind: road\n  roots:\n    - {a}\n    - {b}\n  from: {a}\n  to: {b}\n  way: {way}\n  hours: {max(1, round(d * 0.38))}\n"
    for path, text in [(f'content/world/places/{tag}.yaml', places), (f'content/people/{tag}.yaml', people), (f'content/activities/{tag}.yaml', acts), (f'content/world/roads/{tag}.yaml', roads)]:
        open(root + '/' + path, 'w').write(text)
    print(len(P), 'places', len(seen), 'roads')

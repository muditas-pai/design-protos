#!/usr/bin/env python3
"""Propose role maps for illustrated drawings that don't have one yet. Proposals are never applied until approved.

  python3 scripts/illus-tokens/propose_role_maps.py ../resources [ids…]

Rules (a starting point for the designer, not a decision):
  near-black (L < 0.2) → line · tiny near-white spots → gloss · possible skin → fixed (flagged)
  colour families by hue, ranked by area: the biggest → primary, the rest → accent · greys → surface
  drawings of trophies, podiums and awards: their colours → fixed (real-world metals; flagged)
  colours the app already themes, outside point groups: section-primary/color1 → primary, color2–6 → accent,
    slide-secondary → surface-shade, slide-tertiary → surface-light; a large shape in the slide TEXT colour → "line" if it holds
    a text box (stays dark under light text), otherwise → primary-deep; smaller text-colour details → line.
    (In these drawings the slide text colour is dark shading on light slides: shadows, dark faces, outlines.) Background/contrast colours are left as they are.
"""
import json, re, glob, os, sys, collections, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oklch import rgb_to_oklch
from convert_drawings import h2r, files_for, HEX
from tagger import colour_areas
HERE = os.path.dirname(os.path.abspath(__file__))
SKIP = {'bridge': 'original drawing; its redesign replaces it', 'mountain': 'original drawing; its redesign replaces it'}
METAL_WORDS = ('trophy', 'podium', 'award')

def hue_dist(a, b): d = abs(a - b) % 360; return min(d, 360 - d)
def master_of(files):
    sol = sorted((f for f in files if '/solid/' in f), key=lambda f: int(re.search(r'(\d+)node\.svg$', f).group(1)))
    return sol[min(1, len(sol) - 1)] if sol else files[0]
def median_L(cs, area):
    cs = sorted((rgb_to_oklch(*h2r(c))[0], area.get(c, 1.0)) for c in cs if rgb_to_oklch(*h2r(c))[0] >= 0.2)
    if not cs: return None
    half, acc = sum(a for _, a in cs) / 2, 0
    for l, a in cs:
        acc += a
        if acc >= half: return round(l, 3)

VAR_DEFAULT = {'--th-section-primary': 'primary', '--th-section-color1': 'primary', '--th-section-color2': 'accent',
               '--th-section-color3': 'accent', '--th-section-color4': 'accent', '--th-section-color5': 'accent', '--th-section-color6': 'accent',
               '--th-slide-secondary': 'surface-shade', '--th-slide-tertiary': 'surface-light', '--th-slide-contrast': 'line'}
def default_vars(svg_text):
    """Theme colours in the illustration → tokens; large text-colour shapes → line (holds text) or primary (doesn't)."""
    from svgelements import Path
    present = set(re.findall(r'var\((--th-[a-z0-9-]+)\)', svg_text))
    vars_ = {v: t for v, t in VAR_DEFAULT.items() if v in present}
    elements, notes = {}, []
    vb = re.search(r'viewBox="([^"]*)"', svg_text)
    W, H = ([float(x) for x in vb.group(1).replace(',', ' ').split()[2:4]] if vb else (1, 1))
    rects = []
    for m in re.finditer(r'<rect\b[^>]*id="[^"]*content\d[^"]*"[^>]*>', svg_text):
        a = dict(re.findall(r'\b(x|y|width|height)="([^"]*)"', m.group(0)))
        x, y, w, h = (float(a.get(k, 0)) for k in ('x', 'y', 'width', 'height')); rects.append((x + w / 2, y + h / 2))
    for m in re.finditer(r'<(path|rect)\b[^>]*fill="rgba?\(var\(--th-slide-contrast\)[^"]*"[^>]*>', svg_text):
        tag = m.group(0); eid = re.search(r'\bid="([^"]+)"', tag)
        if not eid: continue
        try:
            if m.group(1) == 'path': bb = Path(re.search(r'\sd="([^"]+)"', tag).group(1)).bbox()
            else:
                a = dict(re.findall(r'\b(x|y|width|height)="([^"]*)"', tag)); x, y = float(a.get('x', 0)), float(a.get('y', 0))
                bb = (x, y, x + float(a.get('width', 0)), y + float(a.get('height', 0)))
        except Exception: continue
        if (bb[2] - bb[0]) * (bb[3] - bb[1]) < 0.03 * W * H: continue
        holds_text = any(bb[0] <= cx <= bb[2] and bb[1] <= cy <= bb[3] for cx, cy in rects)
        elements[eid.group(1).split('node-', 1)[-1]] = 'line' if holds_text else 'primary-deep'
        notes.append(f'large text-colour shape {eid.group(1)} → {"line (holds text, stays dark)" if holds_text else "primary-deep (a dark face or shadow)"}')
    return vars_, elements, notes

def propose(resources, id_):
    files = files_for(resources, id_)
    union = set(); vars_ = collections.Counter()
    for f in files:
        t = open(f).read()
        union |= set(x.lower() for x in re.findall(r'\b(?:fill|stop-color|stroke)="(' + HEX + ')"', t))
        for v in re.findall(r'var\((--th-[a-z0-9-]+)\)', t): vars_[v] += 1
    master = master_of(files)
    area = colour_areas(master); tot = sum(area.get(c, 0) for c in union) or 1
    share = lambda c: area.get(c, 0) / tot
    roles, flags = {}, []
    metal = any(w in id_ for w in METAL_WORDS)
    chrom = []
    for c in sorted(union):
        L, C, H = rgb_to_oklch(*h2r(c))
        if L < 0.2: roles[c] = 'line'
        elif L > 0.97 and C < 0.02 and share(c) < 0.01: roles[c] = 'gloss'
        elif 35 <= H <= 75 and 0.05 <= C <= 0.16 and 0.6 <= L <= 0.9 and not metal:
            roles[c] = 'fixed'; flags.append(f'{c} looks like skin → fixed; make it accent/primary if it isn\'t skin')
        elif C < 0.03: roles[c] = 'surface'
        else: chrom.append((c, H))
    # hue families among the chromatic colours, merged within 40°, ranked by area
    fams = []
    for c, H in sorted(chrom, key=lambda x: -share(x[0])):
        for f in fams:
            if hue_dist(f['h'], H) <= 40: f['cols'].append(c); f['area'] += share(c); break
        else: fams.append({'h': H, 'cols': [c], 'area': share(c)})
    fams.sort(key=lambda f: -f['area'])
    if metal and fams:
        for f in fams:
            for c in f['cols']: roles[c] = 'fixed'
        flags.append('trophy/podium/award: coloured parts kept as drawn (real-world metals). Change to primary if the palette should colour them.')
    else:
        for i, f in enumerate(fams):
            for c in f['cols']: roles[c] = 'primary' if i == 0 else 'accent'
        if len(fams) > 2: flags.append(f'{len(fams)} colour families: the biggest is primary, the other {len(fams) - 1} share the accent — check that is the right hero')
    if not fams and not metal:
        flags.append('no coloured parts: everything is neutral, so the drawing will stay quiet. Consider making the main object primary.')
    # if there is no primary, nothing in the drawing carries the palette colour — say so
    if 'primary' not in roles.values() and not metal:
        themed = [v for v in vars_ if v.startswith('--th-section')]
        flags.append('no primary assigned' + (f'; the palette colour comes from existing theme colours ({", ".join(themed)})' if themed else ''))
    dv, elements, notes = default_vars(open(master).read())
    flags += notes
    left = [v for v in vars_ if v not in dv]
    if dv: flags.append('existing theme colours mapped (outside point groups): ' + ', '.join(f'{v} → {t}' for v, t in dv.items()))
    if left: flags.append('left as they are: ' + ', '.join(left))
    base = {}
    for r in ('primary', 'surface', 'accent'):
        b = median_L([c for c in roles if roles[c] == r and c in area], area)
        if b is not None: base[r] = b
    colour_share = {r: round(100 * sum(share(c) for c in roles if roles[c] == r)) for r in set(roles.values())}
    return {'id': id_, 'note': 'PROPOSED automatically on 21 Oct 2026 — review the flags, edit roles, then set "approved".',
            'approved': None, 'proposed': '21 Oct 2026', 'flags': flags, 'share_by_role_percent': colour_share,
            'master': os.path.relpath(master, resources), 'base': base, 'vars': dv, 'elements': elements, 'colours': roles}

if __name__ == '__main__':
    resources = sys.argv[1]
    wanted = sys.argv[2:]
    existing = {os.path.basename(p)[:-5] for p in glob.glob(os.path.join(HERE, 'role-maps', '*.json'))}
    ids = collections.defaultdict(int)
    for f in glob.glob(f'{resources}/genericassets/shapes/*/*node.svg'):
        m = re.match(r'(.+?)\d+node\.svg$', os.path.basename(f))
        if m: ids[m.group(1)] += 1
    out = []
    for id_ in sorted(wanted or ids):
        if id_ in existing or id_ in SKIP: continue
        files = files_for(resources, id_)
        n = len({c.lower() for f in files for c in re.findall(r'\b(?:fill|stop-color|stroke)="(' + HEX + ')"', open(f).read())})
        if n < 4 and not wanted: continue          # named drawings are proposed even with few hard-coded colours
        rm = propose(resources, id_)
        json.dump(rm, open(os.path.join(HERE, 'role-maps', f'{id_}.json'), 'w'), indent=1)
        out.append(rm)
        print(f"{id_:22s} {rm['share_by_role_percent']}  flags: {len(rm['flags'])}")
    print(f'proposed {len(out)} role map(s); skipped: {", ".join(f"{k} ({v})" for k, v in SKIP.items())}')

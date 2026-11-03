#!/usr/bin/env python3
"""Convert illustrated drawings in deck-in/resources to --th-illus-* tokens, from approved role maps.

  python3 scripts/illus-tokens/convert_drawings.py ../resources            # convert every id that has an approved role map
  python3 scripts/illus-tokens/convert_drawings.py ../resources --check    # report only; exit 1 if anything would change
  python3 scripts/illus-tokens/convert_drawings.py ../resources --only lighthouse iceberg

Role map (role-maps/<id>.json):
  colours   hex → primary | surface | accent | line | gloss | panel | card | fixed
            (card = a light block that holds dark text: the slide's near-background colour, --th-slide-alternate-primary)
            or a role with a forced tone, which skips the automatic tone: e.g. "primary-shade", "surface-highlight", "accent-light"
  vars      existing theme variable → token (e.g. "--th-section-primary": "primary"); unlisted variables are left as they are.
            Applied only OUTSIDE point groups (g[id*="-point"]), so per-point colours (badges, markers) keep their own colour,
            unless "vars_in_points": true.
  elements  shape id (the part after "<id><N>node-", e.g. "color1-5") → token, for one shape (e.g. a text-colour panel that holds text → "line"); wins over colours and vars
  base      lightness (OKLab L, 0–1) of each part's midtone, measured from the master drawing; overridable by hand
Translucent pure black/white shapes (opacity < 1) are shading layers and stay as drawn.
Only colours change. Ids, text boxes, point groups, transforms and everything else stay byte-for-byte.
A colour a role map doesn't list stops that file (reported, not guessed). Re-running changes nothing.
"""
import json, re, sys, glob, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oklch import rgb_to_oklch

HERE = os.path.dirname(os.path.abspath(__file__))
HEX = r'#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}(?![0-9a-fA-F])'
# fallback for palettes that don't have the tokens yet (server-made themes, older brand kits)
FALLBACK = {'primary': 'var(--th-section-primary)', 'surface': 'var(--th-slide-tertiary)', 'accent': 'var(--th-section-color2)',
            'line': 'var(--th-slide-contrast)', 'gloss': '255, 255, 255', 'panel': 'var(--th-slide-contrast)'}

def h2r(h):
    h = h.lstrip('#'); h = ''.join(c * 2 for c in h) if len(h) == 3 else h
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def L(h): return rgb_to_oklch(*h2r(h))[0]
def tier(d):
    # seven bands around the part's base, so neighbouring facets stay distinct
    return ('highlight' if d >= 0.165 else 'light' if d >= 0.08 else 'soft' if d >= 0.03 else '' if d > -0.03 else
            'dim' if d > -0.08 else 'shade' if d > -0.165 else 'deep')
TONES = {'primary': ('highlight', 'light', 'soft', 'dim', 'shade', 'deep'), 'surface': ('highlight', 'light', 'soft', 'dim', 'shade', 'deep'), 'accent': ('light', 'shade')}
def split_role(value):
    """'primary' → ('primary', None); 'primary-shade' → ('primary', 'shade'); unknown → (None, None)."""
    if value in ('primary', 'surface', 'accent', 'line', 'gloss', 'panel', 'fixed', 'card'): return value, None
    fam, _, tone = value.partition('-')
    if fam in TONES and (tone in TONES[fam] or tone == 'base'): return fam, tone
    return None, None
def token(role, colour, base):
    role, forced = split_role(role)
    if role is None: raise ValueError(f'unknown role for {colour}')
    if forced is not None: return role if forced == 'base' else f'{role}-{forced}'     # a designer named the tone
    if role in ('gloss', 'panel', 'card'): return role
    if role == 'line' or L(colour) < 0.2: return 'line'
    t = tier(L(colour) - base[role])
    if role == 'accent': t = {'highlight': 'light', 'soft': '', 'dim': '', 'deep': 'shade'}.get(t, t)
    return role + (f'-{t}' if t else '')


def ref(tok, fallback=None):
    """CSS value for a token, with a fallback for palettes that don't have the tokens yet."""
    if tok == 'card': return 'var(--th-slide-alternate-primary)'      # light block under dark text: near-background colour
    fam = tok.split('-')[0]
    if fallback == 'var(--th-slide-contrast)' and fam != 'line': fallback = None   # the text colour would be black on light slides
    return f'var(--th-illus-{tok}, {fallback or FALLBACK[fam]})'

def convert(svg, rm):
    colours, vars_, base = {k.lower(): v for k, v in rm['colours'].items()}, rm.get('vars', {}), dict(rm.get('base', {}))
    # a part whose base wasn't measured (its colours only appear in some versions): use the middle of its own colours
    for fam in ('primary', 'surface', 'accent'):
        if fam not in base:
            ls = sorted(L(c) for c, r in colours.items() if split_role(r) == (fam, None) and L(c) >= 0.2)
            if ls: base[fam] = round(ls[len(ls) // 2], 3)
    unknown = set()
    def hexrep(m):
        attr, c = m.group(1), m.group(2).lower()
        role = colours.get(c)
        if role is None or split_role(role)[0] is None: unknown.add(c if role is None else f'{c} (unknown role "{role}")'); return m.group(0)
        if role == 'fixed': return m.group(0)
        return f'{attr}="rgb({ref(token(role, c, base))})"'
    # element overrides first: one shape → one token, whatever its colour
    elements = rm.get('elements', {})
    def el_override(m):
        tag = m.group(0); eid = re.search(r'\bid="([^"]+)"', tag)
        tok = elements.get(eid.group(1).split('node-', 1)[-1]) if eid else None   # same shape across point counts: match after 'node-'
        if not tok: return tag
        return re.sub(r'\b(fill|stroke)="(?!none)([^"]*)"', lambda a: f'{a.group(1)}="rgb({ref(tok)})"', tag)
    if elements: svg = re.sub(r'<(?:path|rect|ellipse|circle|polygon|line|polyline)\b[^>]*>', el_override, svg)
    def is_overlay(tag, colour):
        L_, C_ = rgb_to_oklch(*h2r(colour))[:2]
        if C_ > 0.02 or 0.08 <= L_ <= 0.97: return False
        ops = [float(v) for v in re.findall(r'\b(?:opacity|fill-opacity|stop-opacity)="([0-9.]+)"', tag)]
        ops += [float(v) for v in re.findall(r'(?:opacity|fill-opacity|stop-opacity)\s*:\s*([0-9.]+)', tag)]
        return any(o < 1 for o in ops)
    def tag_sub(m):
        tag = m.group(0)
        return re.sub(r'\b(fill|stop-color|stroke)="(' + HEX + ')"', lambda a: a.group(0) if is_overlay(tag, a.group(2)) else hexrep(a), tag)
    out = re.sub(r'<[a-zA-Z][^>]*>', tag_sub, svg)
    if re.search(r'style="[^"]*(?:fill|stroke|stop-color)\s*:\s*#', out): unknown.add('(colour inside a style attribute)')
    def map_vars(chunk):
        for var, tok in vars_.items():
            chunk = re.sub(r'rgba?\(var\(' + re.escape(var) + r'\)(?:\s*,\s*([0-9.]+))?\)',
                           lambda m: f'rgba({ref(tok, f"var({var})")}, {m.group(1) or 1})', chunk)
        return chunk
    if rm.get('vars_in_points'):
        out = map_vars(out)
    else:                                   # leave point groups (per-point colours) untouched
        spans, pos = [], 0
        for m in re.finditer(r'<g\b[^>]*\bid="[^"]*-point\d+"[^>]*>', out):
            if m.start() < pos: continue
            depth, j = 1, m.end()
            for mm in re.finditer(r'<g\b|</g>', out[m.end():]):
                depth += 1 if mm.group() == '<g' else -1
                if depth == 0: j = m.end() + mm.end(); break
            spans.append((m.start(), j)); pos = j
        pieces, last = [], 0
        for a, b in spans: pieces += [map_vars(out[last:a]), out[a:b]]; last = b
        out = ''.join(pieces) + map_vars(out[last:])
    return out, unknown

def files_for(resources, id_):
    pat = re.compile(re.escape(id_) + r'\d+node\.svg$')
    return sorted(f for f in glob.glob(os.path.join(resources, 'genericassets', 'shapes', '*', f'{id_}*node.svg')) if pat.search(os.path.basename(f)))

def main():
    args = [a for a in sys.argv[1:]]
    check = '--check' in args; args = [a for a in args if a != '--check']
    only = None
    if '--only' in args: i = args.index('--only'); only = set(args[i + 1:]); args = args[:i]
    resources = args[0] if args else os.path.join(HERE, '..', '..', '..', 'resources')
    changed, problems = 0, []
    for p in sorted(glob.glob(os.path.join(HERE, 'role-maps', '*.json'))):
        rm = json.load(open(p))
        if only and rm['id'] not in only: continue
        if not rm.get('approved'): print(f"skip {rm['id']}: role map not approved yet"); continue
        for f in files_for(resources, rm['id']):
            svg = open(f).read()
            out, unknown = convert(svg, rm)
            if unknown: problems.append((os.path.relpath(f, resources), sorted(unknown))); continue
            if out != svg:
                changed += 1
                if not check: open(f, 'w').write(out)
    for f, u in problems: print(f'NOT CONVERTED {f}: colours missing from its role map: {", ".join(u)}')
    print(f"{'would change' if check else 'converted'} {changed} file(s); {len(problems)} file(s) need their role map extended")
    sys.exit(1 if (problems or (check and changed)) else 0)

if __name__ == '__main__':
    main()

# Automatic role tagging for illustrations: every fixed colour gets one role.
#   body     the biggest colour family by area   → --th-section-primary
#   accent   the second family                    → --th-section-color2
#   accent2  any further family                    → --th-section-color3
#   fixed    skin tones, near-black, near-white    → unchanged
# Colours already written as theme variables are left alone.
import re, colorsys, math
from svgelements import SVG, Shape

def hex_rgb(h):
    h = h.lstrip('#'); h = ''.join(c * 2 for c in h) if len(h) == 3 else h
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
def hsl(h):
    r, g, b = hex_rgb(h); hh, l, s = colorsys.rgb_to_hls(r, g, b)
    return hh * 360, s * 100, l * 100

def is_skin(h, s, l):  return 12 <= h <= 42 and 20 <= s <= 75 and 40 <= l <= 85
def is_fixed(h, s, l): return l <= 8 or (l >= 95 and s <= 25) or is_skin(h, s, l)

HEX = r'#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}(?![0-9a-fA-F])'

def colour_areas(path):
    """Area each fixed colour covers: shape bounding boxes, split evenly across a gradient's stops."""
    t = open(path).read()
    grads = {}
    for m in re.finditer(r'<(linearGradient|radialGradient)\b([^>]*)>(.*?)</\1>', t, re.S):
        gid = re.search(r'\bid="([^"]+)"', m.group(2))
        if gid: grads[gid.group(1)] = [c.lower() for c in re.findall(r'stop-color\s*[:=]\s*"?\s*(' + HEX + ')', m.group(3))]
    # gradients that inherit stops (xlink:href)
    for m in re.finditer(r'<(linearGradient|radialGradient)\b([^>]*?)/?>', t):
        gid = re.search(r'\bid="([^"]+)"', m.group(2)); ref = re.search(r'href="#([^"]+)"', m.group(2))
        if gid and ref and not grads.get(gid.group(1)): grads[gid.group(1)] = grads.get(ref.group(1), [])
    area = {}
    try: svg = SVG.parse(path, reify=True)
    except Exception: svg = None
    if svg is not None:
        for e in svg.elements():
            if not isinstance(e, Shape): continue
            bb = e.bbox()
            if not bb: continue
            a = max(0.0, (bb[2] - bb[0]) * (bb[3] - bb[1]))
            raw = e.values.get('fill') or ''
            m = re.match(r'url\(#([^)]+)\)', raw)
            if m:
                stops = grads.get(m.group(1), [])
                for c in stops: area[c] = area.get(c, 0) + a / max(1, len(stops))
            elif re.fullmatch(HEX, raw.strip()):
                c = raw.strip().lower(); area[c] = area.get(c, 0) + a
    # colours svgelements could not attribute (styles, strokes): count a token amount so they still get a role
    for c in set(x.lower() for x in re.findall(HEX, t)):
        area.setdefault(c, 1.0)
    return area

def families(area):
    """Group non-fixed colours: one neutral family (low saturation) + hue families merged within 40°."""
    fams = []
    for c, a in sorted(area.items(), key=lambda x: -x[1]):
        h, s, l = hsl(c)
        if is_fixed(h, s, l): continue
        key = 'neutral' if s < 14 else h
        for f in fams:
            if key == 'neutral' and f['key'] == 'neutral': f['cols'].append(c); f['area'] += a; break
            if key != 'neutral' and f['key'] != 'neutral' and min(abs(f['key'] - h), 360 - abs(f['key'] - h)) <= 40:
                f['cols'].append(c); f['area'] += a; break
        else:
            fams.append({'key': key, 'cols': [c], 'area': a})
    return sorted(fams, key=lambda f: -f['area'])

def tag(path):
    area = colour_areas(path)
    roles = {}
    for c in area:
        h, s, l = hsl(c)
        if is_fixed(h, s, l): roles[c] = 'fixed'
    names = ['body', 'accent', 'accent2']
    fams = families(area)
    for i, f in enumerate(fams):
        for c in f['cols']: roles[c] = names[min(i, 2)]
    # anchor per role: the area-weighted mean lightness of that family — its "middle"
    anchors = {}
    for r in names:
        cs = [c for c in roles if roles[c] == r]
        tot = sum(area[c] for c in cs)
        if tot: anchors[r] = round(sum(hsl(c)[2] * area[c] for c in cs) / tot)
    return roles, anchors, area, fams

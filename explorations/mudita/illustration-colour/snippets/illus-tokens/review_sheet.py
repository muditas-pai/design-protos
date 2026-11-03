#!/usr/bin/env python3
"""Review sheet for converted drawings: every drawing on real palette stylesheets, as on a slide.

  python3 scripts/illus-tokens/review_sheet.py ../resources out.html [--palettes tide cerise chronotone aurora lenskart] [--ids lighthouse ...]

Uses the palette stylesheets in <resources>/themes/css, scoped per palette, and the app's own background classes
(th-light, th-dark, th-colorN). "As drawn" is the file at the repo's HEAD, before conversion.
"""
import sys, os, re, glob, json, subprocess, html
HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
def opt(name, default):
    if name in args:
        i = args.index(name); vals = []
        for a in args[i + 1:]:
            if a.startswith('--'): break
            vals.append(a)
        return vals
    return default
pos = [a for a in args if not a.startswith('--') and a not in sum([opt(n, []) for n in ('--palettes', '--ids')], [])]
resources, out = pos[0], pos[1]
palettes = opt('--palettes', ['tide', 'cerise', 'chronotone', 'aurora', 'lenskart'])
from review_sheet_lib import node_wrap
ids = opt('--ids', [json.load(open(p))['id'] for p in sorted(glob.glob(os.path.join(HERE, 'role-maps', '*.json'))) if json.load(open(p)).get('approved')])

def scoped(name):
    css = open(os.path.join(resources, 'themes', 'css', f'com.pitchdeck.{name}.css')).read()
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    def scope(m):
        sels = ', '.join(f'.pal-{name} {s.strip()}' for s in m.group(1).split(',') if s.strip())
        return sels + ' {' + m.group(2) + '}'
    return re.sub(r'([^{}]+)\{([^}]*)\}', scope, css)
def colour_bgs(name):
    css = open(os.path.join(resources, 'themes', 'css', f'com.pitchdeck.{name}.css')).read()
    return sorted(set(re.findall(r'\n\.(th-color\d+)\s*\{', css)), key=lambda s: int(s[8:]))[:4]
def master(id_):
    fs = glob.glob(os.path.join(resources, 'genericassets', 'shapes', 'solid', f'{id_}*node.svg'))
    fs = [f for f in fs if re.search(re.escape(id_) + r'\d+node\.svg$', f)]
    return sorted(fs, key=lambda f: int(re.search(r'(\d+)node\.svg$', f).group(1)))[min(1, len(fs) - 1)]
def clean(svg, uid):
    svg = re.sub(r'^<\?xml[^>]*>\s*', '', svg); svg = re.sub(r'<!--.*?-->', '', svg, flags=re.S)
    svg = re.sub(r'(<rect[^>]*id="[^"]*content\d[^"]*"[^>]*?)fill="none"', r'\1fill="none" visibility="hidden"', svg)
    svg = re.sub(r'\bid="([^"]+)"', lambda m: f'id="{uid}-{m.group(1)}"', svg)
    svg = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{uid}-{m.group(1)})', svg)
    svg = re.sub(r'href="#([^"]+)"', lambda m: f'href="#{uid}-{m.group(1)}"', svg)
    return re.sub(r'<svg\b', '<svg preserveAspectRatio="xMidYMid meet"', svg, count=1)

drawings = []
for id_ in ids:
    f = master(id_); rel = os.path.relpath(f, resources)
    before = subprocess.run(['git', '-C', resources, 'show', f'HEAD:{rel}'], capture_output=True, text=True).stdout
    drawings.append((id_, rel, open(f).read(), before))
n = 0
def uid():
    global n; n += 1; return f'd{n}'
cols = ['th-light', 'th-dark']
body = []
for pal in palettes:
    bgs = cols + colour_bgs(pal)
    rows = []
    for id_, rel, after, before in drawings:
        cells = [f'<div class="cell asdrawn">{clean(before, uid()).replace("var(--th-", "var(--x-")}</div>']
        for bg in bgs:
            cells.append(f'<div class="cell {bg}">{node_wrap(bg, clean(after, uid()))}</div>')
        rows.append(f'<div class="rh">{html.escape(id_)}<small>{html.escape(rel)}</small></div>' + ''.join(cells))
    head = '<span></span><span class="ch">As drawn</span>' + ''.join(f'<span class="ch">{b.replace("th-", "").replace("color", "colour ")}</span>' for b in bgs)
    body.append(f'<section class="pal pal-{pal}" id="{pal}"><h2>{pal}</h2><div class="scroll"><div class="grid" style="--cols:{len(bgs) + 1}">{head}{"".join(rows)}</div></div></section>')
styles = '\n'.join(scoped(p) for p in palettes)
page = f'''<title>Illustration Token Review</title>
<style>
:root {{ --bg:#f3f4f7; --fg:#161a26; --muted:#5d6476; --line:#dfe2ea; --surface:#fff; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#11131a; --fg:#e8eaf1; --muted:#a2a8b8; --line:#2c3140; --surface:#191c25; color-scheme:dark; }} }}
:root[data-theme="dark"] {{ --bg:#11131a; --fg:#e8eaf1; --muted:#a2a8b8; --line:#2c3140; --surface:#191c25; color-scheme:dark; }}
body {{ background:var(--bg); color:var(--fg); font:15px/1.5 system-ui, sans-serif; }}
.page {{ max-width:1300px; margin:0 auto; padding-inline:20px; padding-block:32px 60px; display:grid; gap:36px; }}
h1 {{ margin:0; font-size:1.8rem; }} h2 {{ margin:0 0 10px; font-size:1.15rem; text-transform:capitalize; }}
.lede {{ color:var(--muted); max-width:72ch; margin:6px 0 0; }}
nav {{ display:flex; gap:8px; flex-wrap:wrap; }} nav a {{ color:var(--fg); border:1px solid var(--line); border-radius:999px; padding:5px 12px; text-decoration:none; text-transform:capitalize; }}
.scroll {{ overflow-x:auto; }}
.grid {{ display:grid; grid-template-columns:150px repeat(calc(var(--cols)), minmax(120px, 1fr)); gap:8px; min-width:1000px; }}
.ch {{ font:600 11px system-ui; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); align-self:end; }}
.rh {{ display:grid; align-content:center; font-weight:600; }} .rh small {{ font-weight:400; color:var(--muted); font-size:.72rem; overflow-wrap:anywhere; }}
.cell {{ aspect-ratio:16/9; max-width:100%; border-radius:10px; overflow:hidden; background:rgb(var(--th-slide-primary)); border:1px solid rgba(127,127,127,.18); display:grid; }}
.cell svg {{ width:100%; height:100%; }}
.cell.asdrawn {{ background:#fff; --x-section-primary:120,120,240; --x-section-color1:120,120,240; --x-section-color2:90,200,190; --x-section-color3:255,170,60; --x-section-color4:90,200,190; --x-slide-contrast:20,20,20; --x-slide-secondary:110,110,110; --x-slide-tertiary:150,150,150; --x-slide-primary:255,255,255; --x-section-contrast:255,255,255; }}
{styles}
</style>
<div class="page">
<header><h1>Illustration token review</h1>
<p class="lede">Converted drawings from the deck-in/resources clone, on the real palette stylesheets with the app's own background classes. "As drawn" is the file before conversion, with stand-in colours for its theme variables. Every point count and style folder was converted; one file per drawing is shown.</p></header>
<nav>{''.join(f'<a href="#{p}">{p}</a>' for p in palettes)}</nav>
{''.join(body)}
</div>'''
open(out, 'w').write(page)
print(f'{out}: {len(drawings)} drawings × {len(palettes)} palettes, {len(page)//1024} KB')

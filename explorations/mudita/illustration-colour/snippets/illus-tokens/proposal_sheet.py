#!/usr/bin/env python3
"""Review page for PROPOSED role maps: as drawn · role map in code colours · previews on real palettes.
Converts in memory only; nothing in the resources clone changes.

  python3 scripts/illus-tokens/proposal_sheet.py ../resources out.html
"""
import sys, os, re, glob, json, subprocess, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from convert_drawings import convert, HEX, split_role
from review_sheet_lib import scoped, clean, node_wrap
HERE = os.path.dirname(os.path.abspath(__file__))
resources, out = sys.argv[1], sys.argv[2]
CODE = {'primary': '#3557ff', 'surface': '#c9ccd6', 'accent': '#ff8b2b', 'line': '#1d1f27', 'gloss': '#fff6a8', 'panel': '#6fd1c4'}
PREVIEW = [('tide', 'th-light'), ('tide', 'th-dark'), ('tide', 'th-color1'), ('aurora', 'th-light'), ('aurora', 'th-color2'), ('lenskart', 'th-light')]
maps = [json.load(open(p)) for p in sorted(glob.glob(os.path.join(HERE, 'role-maps', '*.json')))]
maps = [m for m in maps if not m.get('approved')]
n = 0
def uid():
    global n; n += 1; return f'p{n}'
def code_view(svg, rm):
    cols = {k.lower(): v for k, v in rm['colours'].items()}
    def rep(m):
        role = cols.get(m.group(2).lower())
        if role is None or role == 'fixed': return m.group(0)
        return f'{m.group(1)}="{CODE[split_role(role)[0]]}"'
    return re.sub(r'\b(fill|stop-color|stroke)="(' + HEX + ')"', rep, svg)
rows = []
for rm in maps:
    rel = rm['master']
    orig = subprocess.run(['git', '-C', resources, 'show', f'HEAD:{rel}'], capture_output=True, text=True).stdout or open(os.path.join(resources, rel)).read()
    conv, unknown = convert(orig, rm)
    stand = lambda s: s.replace('var(--th-', 'var(--x-')
    cells = [f'<div class="cell white">{stand(clean(orig, uid()))}</div>', f'<div class="cell white">{stand(clean(code_view(orig, rm), uid()))}</div>']
    for pal, bg in PREVIEW:
        cells.append(f'<div class="pal-{pal}"><div class="cell {bg}">{node_wrap(bg, clean(conv, uid()))}</div></div>')
    flags = ''.join(f'<li>{html.escape(f)}</li>' for f in rm.get('flags', []))
    shares = ' · '.join(f'{k} {v}%' for k, v in sorted(rm.get('share_by_role_percent', {}).items(), key=lambda x: -x[1]))
    status = 'pending (decided by hand)' if not rm.get('proposed') else 'proposed'
    rows.append(f'<article><header><h2>{html.escape(rm["id"])}</h2><span class="st">{status}</span><span class="sh">{shares}</span></header>'
                f'<div class="grid">{"".join(cells)}</div>{"<ul>" + flags + "</ul>" if flags else ""}</article>')
heads = ''.join(f'<span>{h}</span>' for h in ['As drawn', 'Role map'] + [f'{p.title()} · {b.replace("th-", "").replace("color", "colour ")}' for p, b in PREVIEW])
styles = '\n'.join(scoped(resources, p) for p in sorted({p for p, _ in PREVIEW}))
legend = ''.join(f'<span><i style="background:{c}"></i>{r}</span>' for r, c in CODE.items()) + '<span>original colours in the role map = fixed</span>'
page = f'''<title>Role Map Proposals</title>
<style>
:root {{ --bg:#f3f4f7; --fg:#161a26; --muted:#5d6476; --line:#dfe2ea; --card:#fff; --flag:#8a5a00; --flagbg:#fff4dc; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#11131a; --fg:#e8eaf1; --muted:#a2a8b8; --line:#2c3140; --card:#191c25; --flag:#f0c46a; --flagbg:#2e2614; color-scheme:dark; }} }}
:root[data-theme="dark"] {{ --bg:#11131a; --fg:#e8eaf1; --muted:#a2a8b8; --line:#2c3140; --card:#191c25; --flag:#f0c46a; --flagbg:#2e2614; color-scheme:dark; }}
body {{ background:var(--bg); color:var(--fg); font:15px/1.5 system-ui, sans-serif; }}
.page {{ max-width:1400px; margin:0 auto; padding-inline:20px; padding-block:32px 60px; display:grid; gap:18px; }}
h1 {{ margin:0; font-size:1.8rem; }} .lede {{ color:var(--muted); max-width:78ch; margin:4px 0 0; }}
.legend {{ display:flex; flex-wrap:wrap; gap:14px; font-size:.86rem; color:var(--muted); }} .legend i {{ width:14px; height:14px; border-radius:4px; display:inline-block; margin-right:6px; vertical-align:-2px; border:1px solid rgba(127,127,127,.3); }}
.heads, .grid {{ display:grid; grid-template-columns:repeat(8, minmax(110px, 1fr)); gap:6px; }}
.heads {{ position:sticky; top:0; background:var(--bg); padding-block:8px; z-index:2; font:600 11px system-ui; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); }}
.scroll {{ overflow-x:auto; }} .inner {{ min-width:1000px; display:grid; gap:14px; }}
article {{ background:var(--card); border:1px solid var(--line); border-radius:12px; padding:12px; display:grid; gap:8px; }}
article header {{ display:flex; gap:12px; align-items:baseline; flex-wrap:wrap; }} h2 {{ margin:0; font-size:1.05rem; }}
.st {{ font-size:.75rem; font-weight:600; padding:1px 8px; border-radius:999px; background:var(--flagbg); color:var(--flag); }} .sh {{ font-size:.82rem; color:var(--muted); }}
ul {{ margin:0; padding:8px 12px 8px 28px; background:var(--flagbg); color:var(--flag); border-radius:8px; font-size:.85rem; display:grid; gap:2px; }}
.cell {{ aspect-ratio:16/9; max-width:100%; border-radius:8px; overflow:hidden; background:rgb(var(--th-slide-primary)); border:1px solid rgba(127,127,127,.18); display:grid; }}
.cell svg {{ width:100%; height:100%; }}
.cell.white {{ background:#fff; --x-section-primary:120,120,240; --x-section-color1:120,120,240; --x-section-color2:90,200,190; --x-section-color3:255,170,60; --x-section-color4:90,200,190; --x-slide-contrast:20,20,20; --x-slide-secondary:110,110,110; --x-slide-tertiary:150,150,150; --x-slide-primary:255,255,255; --x-section-contrast:255,255,255; }}
{styles}
</style>
<div class="page"><header><h1>Role map proposals</h1>
<p class="lede">{len(maps)} drawings without an approved role map. Proposed automatically; nothing is applied until approved. Each row: the drawing as drawn, its role map in code colours, then previews on real palette stylesheets, converted in memory only. Flags show where a person needs to decide.</p></header>
<div class="legend">{legend}</div>
<div class="scroll"><div class="inner"><div class="heads">{heads}</div>{"".join(rows)}</div></div></div>'''
open(out, 'w').write(page)
print(f'{out}: {len(maps)} drawings, {len(page) // 1024} KB')

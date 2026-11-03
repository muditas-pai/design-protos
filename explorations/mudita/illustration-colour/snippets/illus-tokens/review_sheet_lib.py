"""Helpers shared by review_sheet.py and proposal_sheet.py."""
import os, re
def scoped(resources, name):
    css = open(os.path.join(resources, 'themes', 'css', f'com.pitchdeck.{name}.css')).read()
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    def scope(m):
        sels = ', '.join(f'.pal-{name} {s.strip()}' for s in m.group(1).split(',') if s.strip())
        return sels + ' {' + m.group(2) + '}'
    return re.sub(r'([^{}]+)\{([^}]*)\}', scope, css)
def clean(svg, uid):
    svg = re.sub(r'^<\?xml[^>]*>\s*', '', svg); svg = re.sub(r'<!--.*?-->', '', svg, flags=re.S)
    svg = re.sub(r'(<rect[^>]*id="[^"]*content\d[^"]*"[^>]*?)fill="none"', r'\1fill="none" visibility="hidden"', svg)
    svg = re.sub(r'\bid="([^"]+)"', lambda m: f'id="{uid}-{m.group(1)}"', svg)
    svg = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{uid}-{m.group(1)})', svg)
    svg = re.sub(r'href="#([^"]+)"', lambda m: f'href="#{uid}-{m.group(1)}"', svg)
    return re.sub(r'<svg\b', '<svg preserveAspectRatio="xMidYMid meet"', svg, count=1)

def node_wrap(bg, svg):
    """A drawing sits inside a diagram (scheme class) and node 1 (th-section1) on a real slide; previews need the same,
    or existing --th-section-* colours don't resolve. Light/dark use the multicolour scheme; colour slides use their tints."""
    if bg in ('th-light', 'th-dark'):
        return f'<div class="th-sections-theme-multiple" style="display:contents"><div class="th-section1" style="display:contents">{svg}</div></div>'
    return (f'<div class="th-sections-dark-tint" style="display:contents"><div class="th-sections-light-tint" style="display:contents">'
            f'<div class="th-section1" style="display:contents">{svg}</div></div></div>')

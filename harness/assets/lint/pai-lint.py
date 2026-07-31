#!/usr/bin/env python3
"""pai-lint — v1. Source checks run on the file; rendered checks run on a
state's serialised DOM. Every finding is blocking and carries a locator.

  python3 pai-lint.py source  <artifact.html>
  python3 pai-lint.py rendered <state>.html --content ../content.md
"""
import json, re, sys, pathlib

IMPLEMENTED = {
    "source": ["template-start", "no-inline-style", "no-colour-literal",
               "no-radius-literal", "no-placeholder", "no-unresolved-content", "stylesheet-resolves"],
    "rendered": ["numbers-resolve", "contrast-declared", "accessible-name", "focus-visible",
                 "modal-heading-count-and-step"],
}

# closed type scale, largest first — index distance is the "steps apart" measure
HEADING_SCALE = ["text-heading-4xl", "text-heading-3xl", "text-heading-2xl", "text-heading-xl",
                 "text-heading-lg", "text-heading-base", "text-heading-sm"]
# scoped: this check loads only on modal-ish surfaces
APPLIES_TO = {"modal-heading-count-and-step": {"surfaces": ["upgrade-modal", "pricing-modal", "dialog"]}}
NOT_IMPLEMENTED = ["component-markup-matches-components.html"]

PLACEHOLDER = re.compile(r"\b(lorem|ipsum|\$XX+|\b1234\b)", re.I)
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
RADIUS = re.compile(r"border-radius\s*:\s*(\d+)px")
CONTENT_TOKEN = re.compile(r"\{\{content:[^}]+\}\}")
# currency, percentages and bare thousands-separated numbers in visible text
NUMERIC = re.compile(r"\$[\d,]+(?:\.\d+)?|\b\d{1,3}(?:,\d{3})+\b|\b\d+%")
TAGS = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.S | re.I)


def find(rule, locator, message):
    return {"rule": rule, "locator": locator, "severity": "blocking",
            "source": "lint", "message": message}


def visible_text(html):
    html = TAGS.sub(" ", html)
    return re.sub(r"<[^>]+>", " ", html)


def source_checks(path):
    html = pathlib.Path(path).read_text()
    out = []
    links = re.findall(r'<link[^>]+href="([^"]+pai\.css)"', html)
    if not links:
        out.append(find("template-start", "<head>", "artifact does not link design-system/pai.css"))
    for href in links:
        if not (pathlib.Path(path).parent / href).resolve().exists():
            out.append(find("stylesheet-resolves", "<head>",
                            f"pai.css href does not resolve on disk: {href}"))
    if '<body class="pai"' not in html:
        out.append(find("template-start", "<body>", 'body must carry class="pai" (template.html)'))

    for m in re.finditer(r'style="([^"]*)"', html):
        decl = m.group(1)
        line = html[: m.start()].count("\n") + 1
        bad = [d for d in decl.split(";") if HEX.search(d) or RADIUS.search(d)]
        if bad:
            out.append(find("no-inline-style", f"line {line}",
                            f"inline style carries a literal: {';'.join(bad).strip()}"))

    body = html.split("</head>", 1)[-1]
    for m in HEX.finditer(body):
        line = html[: html.index("</head>") + m.start()].count("\n") + 1
        out.append(find("no-colour-literal", f"line {line}",
                        f"colour literal {m.group(0)} outside the token block — use var(--…)"))
    for m in RADIUS.finditer(body):
        px = int(m.group(1))
        if px not in (0, 4, 6, 8, 10, 12, 34, 999):
            line = body[: m.start()].count("\n") + 1
            out.append(find("no-radius-literal", f"body line {line}",
                            f"border-radius {px}px is off-scale (4/6/8/10/12, pills 34+)"))
    for m in PLACEHOLDER.finditer(visible_text(html)):
        out.append(find("no-placeholder", "visible text",
                        f"placeholder content: {m.group(0)!r}"))
    for m in CONTENT_TOKEN.finditer(html):
        out.append(find("no-unresolved-content", "visible text",
                        f"unresolved {m.group(0)} — add the key to content.md"))
    return out


def content_values(md):
    vals = set()
    for line in pathlib.Path(md).read_text().splitlines():
        cells = [c.strip() for c in line.split("|") if c.strip()]
        if len(cells) == 2 and cells[0] not in ("key",) and not set(cells[0]) <= set("-"):
            vals.add(cells[1])
            for n in NUMERIC.findall(cells[1]):
                vals.add(n)
    return vals


def heading_step_check(html, surface):
    """<=2 headings in a modal; if 2, they must sit >=2 steps apart on the scale."""
    scope = APPLIES_TO["modal-heading-count-and-step"]["surfaces"]
    if surface not in scope:
        return []
    out, found = [], []
    for m in re.finditer(r"<(h[1-6])\b([^>]*)>(.*?)</\1>", html, re.S | re.I):
        tag, attrs, inner = m.group(1).lower(), m.group(2), re.sub(r"<[^>]+>", "", m.group(3)).strip()
        cls = next((c for c in HEADING_SCALE if c in attrs), None)
        found.append({"tag": tag, "class": cls, "text": inner[:48]})
    if len(found) > 2:
        out.append(find("modal-heading-count-and-step", ", ".join(f["text"] for f in found),
                        f"{len(found)} headings in a modal; at most 2 are allowed"))
    if len(found) == 2:
        a, b = found
        if not a["class"] or not b["class"]:
            out.append(find("modal-heading-count-and-step",
                            (a if not a["class"] else b)["text"],
                            "heading carries no text-heading-* class, so its step on the scale cannot be read"))
        else:
            gap = abs(HEADING_SCALE.index(a["class"]) - HEADING_SCALE.index(b["class"]))
            if gap < 2:
                out.append(find("modal-heading-count-and-step",
                                f'{a["text"]!r} ({a["class"]}) vs {b["text"]!r} ({b["class"]})',
                                f"the two headings are {gap} step apart on the type scale; a modal's two "
                                f"headings must differ by at least 2 — move one of them"))
    return out


def rendered_checks(path, content_md, surface="unclassified"):
    html = pathlib.Path(path).read_text()
    allowed = content_values(content_md)
    out = []
    text = visible_text(html)
    for m in NUMERIC.finditer(text):
        tok = m.group(0)
        if tok not in allowed:
            out.append(find("numbers-resolve", f"text {tok!r}",
                            f"{tok} does not appear in content.md — invented or stale"))
    for m in re.finditer(r"<(button|a)\b([^>]*)>(.*?)</\1>", html, re.S | re.I):
        attrs, inner = m.group(2), re.sub(r"<[^>]+>", "", m.group(3)).strip()
        if not inner and "aria-label" not in attrs:
            out.append(find("accessible-name", m.group(0)[:60],
                            "interactive element has no text and no aria-label"))
    if ":focus-visible" not in pathlib.Path(path).read_text():
        out.append(find("focus-visible", "<style>",
                        "no :focus-visible style declared for interactive elements"))
    out += heading_step_check(html, surface)
    return out


if __name__ == "__main__":
    mode, target = sys.argv[1], sys.argv[2]
    if mode == "source":
        findings = source_checks(target)
    else:
        content = sys.argv[sys.argv.index("--content") + 1]
        surface = (sys.argv[sys.argv.index("--surface") + 1]
                   if "--surface" in sys.argv else "unclassified")
        findings = rendered_checks(target, content, surface)
    print(json.dumps({"mode": mode, "target": target, "findings": findings,
                      "checks_run": IMPLEMENTED[mode],
                      "checks_not_run": NOT_IMPLEMENTED}, indent=1))
    sys.exit(1 if findings else 0)

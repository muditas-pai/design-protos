"""dsparse — read the design system, derive what it publishes.

The linter must not contain a list of colours, class names, radii or property
names.  Everything below is read out of ``design-system/`` at runtime.  The only
things written down here are CSS-spec and Tailwind facts: what a colour looks
like syntactically, which value types are self-identifying, how a camelCase
theme key maps to a kebab-case property.  None of that goes stale when the
design system changes.

Spec: docs/lint-spec.md sections 2, 3 and 6.

Derivations implemented (D3 is deliberately dropped):

    D1  var-usage   pai.css writes ``P: … var(--tok) …``  ⇒ --tok is consumed for P
    D2  kebab-key   theme key camelCase→kebab, kept only if pai.css itself
                    declares that property
    D2n             the same test applied to the option-object keys nested inside
                    a scale entry, gated on the design system's own CSS never
                    stepping outside the key's value set (see _derive_d2_nested)
    D4  spread      a vocabulary whose members reach ≥3 distinct properties is a
                    palette, unscoped
    D5  observed    pai.css writes a self-identifying value (gradient, shadow,
                    easing) directly on property Q ⇒ Q is in scope
    D6  self-usage  those same self-identifying literals, and every :root token,
                    are members of the system

Public surface:

    parse_design_system(ds_dir) -> DesignSystem
    adopted_design_system(html_path, ds_dir) -> bool
    DesignSystem.classes / .tokens / .vocabularies
    DesignSystem.vocabulary_for(property[, value]) -> Vocabulary | None
    DesignSystem.is_silent(property[, value]) -> bool
    Vocabulary.property / .entries / .value_type / .ordered / .scope
"""

from __future__ import annotations

import json
import os
import re
import subprocess
from dataclasses import dataclass, field

__all__ = [
    "parse_design_system",
    "adopted_design_system",
    "DesignSystem",
    "Vocabulary",
    "Declaration",
    "Nearest",
    "classify_value",
    "normalise_value",
    "malformations",
]


# ---------------------------------------------------------------------------
# residual hardcoding — CSS spec and Tailwind level only
# ---------------------------------------------------------------------------

#: value types with a meaningful "nearest member".  Spec section 1: colours,
#: lengths and weights can name a replacement; font stacks, animations,
#: gradients cannot.  Shadows and easings have no nearest either — there is no
#: such thing as a near-miss between two shadows — so they are unordered too.
ORDERED_VALUE_TYPES = frozenset({"color", "length", "number"})

#: types whose syntax alone identifies them, so pai.css writing one is evidence
#: the property is in scope (D5) and the value is in the system (D6).
SELF_IDENTIFYING_TYPES = frozenset({"gradient", "shadow", "easing"})

_CSS_WIDE_KEYWORDS = frozenset(
    {"inherit", "initial", "unset", "revert", "revert-layer", "none", "auto"}
)

_TIMING_KEYWORDS = frozenset(
    {"linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end"}
)

_GENERIC_FONT_FAMILIES = frozenset(
    {
        "serif",
        "sans-serif",
        "monospace",
        "cursive",
        "fantasy",
        "system-ui",
        "ui-serif",
        "ui-sans-serif",
        "ui-monospace",
        "ui-rounded",
        "math",
        "emoji",
        "fangsong",
    }
)

#: px-convertible units, with their factor.  em/rem assume the 16px root the
#: browser defaults to; only used to rank "nearest", never to assert equality.
_ABSOLUTE_UNITS = {
    "px": 1.0,
    "pt": 96.0 / 72.0,
    "pc": 16.0,
    "in": 96.0,
    "cm": 96.0 / 2.54,
    "mm": 96.0 / 25.4,
    "q": 96.0 / 101.6,
    "rem": 16.0,
    "em": 16.0,
}
_RELATIVE_UNIT_CLASSES = {
    "%": "percent",
    "vh": "viewport",
    "vw": "viewport",
    "vmin": "viewport",
    "vmax": "viewport",
    "svh": "viewport",
    "lvh": "viewport",
    "dvh": "viewport",
    "ch": "ch",
    "ex": "ex",
    "fr": "fr",
}

_NAMED_COLORS = frozenset(
    """aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond
blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue
cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey
darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon
darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet
deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen
fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon
lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey
lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey
lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine
mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue
mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose
moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink
plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon
sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey
snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white
whitesmoke yellow yellowgreen transparent currentcolor""".split()
)

_COLOR_FUNCTIONS = ("rgb(", "rgba(", "hsl(", "hsla(", "hwb(", "lab(", "lch(",
                    "oklab(", "oklch(", "color(")

_HEX_RE = re.compile(r"^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$", re.I)
_NUMBER_RE = re.compile(r"^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$", re.I)
_DIMENSION_RE = re.compile(
    r"^([+-]?(?:\d+\.?\d*|\.\d+))(%|[a-z]+)$", re.I
)
_GRADIENT_RE = re.compile(
    r"(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(", re.I
)
_CUBIC_RE = re.compile(r"(?:cubic-bezier|steps)\s*\(", re.I)
_VAR_RE = re.compile(r"var\(\s*(--[\w-]+)", re.I)
_CLASS_RE = re.compile(r"\.(-?[_a-zA-Z][\w-]*)")


# ---------------------------------------------------------------------------
# value normalisation and classification
# ---------------------------------------------------------------------------


def normalise_value(value: str) -> str:
    """Canonical form for comparing two written values.

    Lower-cases, collapses whitespace, drops the space after commas and expands
    short hex.  Two values that normalise equal are the same value.
    """
    if value is None:
        return ""
    v = value.strip().rstrip(";").strip()
    v = re.sub(r"\s+", " ", v)
    v = re.sub(r"\s*,\s*", ",", v)
    v = re.sub(r"\(\s+", "(", v)
    v = re.sub(r"\s+\)", ")", v)
    v = v.lower()
    if _HEX_RE.match(v):
        v = _expand_hex(v)
    return v


def _expand_hex(h: str) -> str:
    body = h[1:]
    if len(body) in (3, 4):
        body = "".join(c * 2 for c in body)
    return "#" + body.lower()


def _split_top_level(value: str, sep: str = ",") -> list[str]:
    """Split on ``sep`` ignoring separators inside parens or strings."""
    parts, depth, buf, i, n = [], 0, [], 0, len(value)
    quote = ""
    while i < n:
        c = value[i]
        if quote:
            buf.append(c)
            if c == "\\":
                if i + 1 < n:
                    buf.append(value[i + 1])
                    i += 1
            elif c == quote:
                quote = ""
        elif c in "\"'":
            quote = c
            buf.append(c)
        elif c == "(":
            depth += 1
            buf.append(c)
        elif c == ")":
            depth = max(0, depth - 1)
            buf.append(c)
        elif c == sep and depth == 0:
            parts.append("".join(buf).strip())
            buf = []
        else:
            buf.append(c)
        i += 1
    tail = "".join(buf).strip()
    if tail:
        parts.append(tail)
    return parts


def _split_components(value: str) -> list[str]:
    """Split a single layer into whitespace-separated components, keeping
    functional notation (``rgba(1, 2, 3, .4)``) together."""
    comps, depth, buf, i, n = [], 0, [], 0, len(value)
    quote = ""
    while i < n:
        c = value[i]
        if quote:
            buf.append(c)
            if c == "\\":
                if i + 1 < n:
                    buf.append(value[i + 1])
                    i += 1
            elif c == quote:
                quote = ""
        elif c in "\"'":
            quote = c
            buf.append(c)
        elif c == "(":
            depth += 1
            buf.append(c)
        elif c == ")":
            depth = max(0, depth - 1)
            buf.append(c)
        elif c.isspace() and depth == 0:
            if buf:
                comps.append("".join(buf))
                buf = []
        else:
            buf.append(c)
        i += 1
    if buf:
        comps.append("".join(buf))
    return comps


def _is_color_component(c: str) -> bool:
    c = c.strip().lower()
    if not c:
        return False
    if _HEX_RE.match(c):
        return True
    if c.startswith(_COLOR_FUNCTIONS):
        return True
    return c in _NAMED_COLORS


def _is_length_component(c: str) -> bool:
    c = c.strip().lower()
    if _NUMBER_RE.match(c):
        return True
    m = _DIMENSION_RE.match(c)
    if not m:
        return False
    unit = m.group(2).lower()
    return unit in _ABSOLUTE_UNITS or unit in _RELATIVE_UNIT_CLASSES


def _is_shadow(value: str) -> bool:
    """A shadow is one or more layers of >=3 lengths plus a colour or ``inset``.

    ``1px solid var(--border-neutral)`` is not one (a single length, and a
    keyword that has no place in a shadow); ``200% 100%`` is not one (no
    colour); ``0 0 0 1px rgba(...) inset`` is.
    """
    layers = _split_top_level(value)
    if not layers:
        return False
    for layer in layers:
        comps = _split_components(layer)
        if not comps:
            return False
        lengths = colors = 0
        inset = False
        for c in comps:
            lc = c.lower()
            if lc == "inset":
                inset = True
            elif _is_color_component(c):
                colors += 1
            elif _is_length_component(c):
                lengths += 1
            elif lc.startswith("var("):
                # could be either; neutral
                pass
            else:
                return False
        if lengths < 3 or not (colors or inset):
            return False
    return True


def _is_easing_value(value: str) -> bool:
    v = value.strip().lower()
    return v in _TIMING_KEYWORDS or bool(_CUBIC_RE.match(v))


def _is_font_stack(value: str) -> bool:
    parts = [p.strip().strip("\"'").lower() for p in _split_top_level(value)]
    if not parts:
        return False
    if any(p in _GENERIC_FONT_FAMILIES for p in parts):
        return True
    # a multi-member list of bare identifiers is a stack too
    if len(parts) > 1 and all(
        p and not _is_length_component(p) and not _is_color_component(p) for p in parts
    ):
        return True
    return False


def classify_value(value: str) -> str:
    """One of color | length | shadow | gradient | easing | font-family | number | keyword."""
    if value is None:
        return "keyword"
    v = value.strip().rstrip(";").strip()
    if not v:
        return "keyword"
    if _GRADIENT_RE.search(v):
        return "gradient"
    if _is_shadow(v):
        return "shadow"
    if _is_easing_value(v):
        return "easing"
    comps = _split_components(v)
    if len(comps) == 1 and _is_color_component(comps[0]):
        return "color"
    if _is_font_stack(v):
        return "font-family"
    if len(comps) == 1:
        c = comps[0].lower()
        if _NUMBER_RE.match(c):
            return "number"
        if _is_length_component(c):
            return "length"
    return "keyword"


def _extract_self_identifying(value: str) -> list[tuple[str, str]]:
    """Pull the self-identifying components out of a written value (D5/D6).

    ``transition:opacity 160ms linear`` yields the easing ``linear``;
    ``background:linear-gradient(...)`` yields the gradient; a whole value that
    reads as a shadow yields itself.
    """
    found: list[tuple[str, str]] = []
    for m in _GRADIENT_RE.finditer(value):
        text = _balanced_from(value, m.end() - 1)
        if text:
            found.append(("gradient", value[m.start(): m.end() - 1] + text))
    if _is_shadow(value):
        found.append(("shadow", value.strip()))
    for m in _CUBIC_RE.finditer(value):
        text = _balanced_from(value, m.end() - 1)
        if text:
            found.append(("easing", value[m.start(): m.end() - 1] + text))
    for tok in re.findall(r"[A-Za-z][A-Za-z-]*", value):
        if tok.lower() in _TIMING_KEYWORDS:
            # guard against `linear` inside `linear-gradient`, which the token
            # regex already keeps whole, and against a bare `none`
            found.append(("easing", tok.lower()))
    return found


def _balanced_from(text: str, open_idx: int) -> str:
    """Return ``(...)`` starting at ``open_idx``, paren-balanced."""
    depth, i, n = 0, open_idx, len(text)
    while i < n:
        c = text[i]
        if c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                return text[open_idx: i + 1]
        i += 1
    return ""


# ---------------------------------------------------------------------------
# CSS parsing
# ---------------------------------------------------------------------------


@dataclass
class Declaration:
    selector: str
    property: str
    value: str
    line: int
    at_rules: tuple[str, ...] = ()


def _blank_comments(css: str) -> str:
    """Same-length copy with comment bodies replaced by spaces.

    Comments are stripped FIRST so a ``var(--x)`` inside one never registers,
    and strings are skipped so a ``/*`` in a data URI cannot open one.

    Sets ``_blank_comments.unclosed_at`` to the index of a ``/*`` that never
    closed, else ``None``. That case blanks to end of file, so every rule after
    it disappears — and since it disappears rather than becoming a bad value,
    nothing downstream can see it went. Recorded here because this is the only
    place that knows.
    """
    _blank_comments.unclosed_at = None
    out = list(css)
    i, n = 0, len(css)
    while i < n:
        c = css[i]
        if c == "/" and css[i + 1: i + 2] == "*":
            j = css.find("*/", i + 2)
            if j < 0:
                _blank_comments.unclosed_at = i
            j = n if j < 0 else j + 2
            for k in range(i, j):
                if out[k] != "\n":
                    out[k] = " "
            i = j
            continue
        if c in "\"'":
            q = c
            j = i + 1
            while j < n:
                if css[j] == "\\":
                    j += 2
                    continue
                if css[j] == q:
                    j += 1
                    break
                j += 1
            i = j
            continue
        i += 1
    return "".join(out)


def malformations(css_text: str) -> list[dict]:
    """-> defects that make rules vanish, each with the line it starts on.

    Every other check in the linter reads the *values* a declaration writes.
    That has one blind spot it cannot close from the inside: a rule that does
    not parse carries no values, so it contributes nothing to check, and a
    stylesheet missing half its rules scores zero. Zero reads as perfect.

    Both causes are already known here and were being discarded — an unclosed
    comment by ``_blank_comments``, an unbalanced brace by the same event walk
    ``parse_css`` uses. This reports them rather than re-deriving them, so the
    check can never disagree with the parser about what is a comment, a string
    or a brace inside ``url(…)``.
    """
    blanked = _blank_comments(css_text)
    out: list[dict] = []

    if _blank_comments.unclosed_at is not None:
        i = _blank_comments.unclosed_at
        out.append({
            "what": "unclosed-comment",
            "line": css_text.count("\n", 0, i) + 1,
            "detail": "a /* that never closes. Every rule after it is inside "
                      "the comment, and the browser never sees any of them",
        })

    depth = 0
    opens: list[tuple[int, int]] = []
    for idx, ch, line in _structural_events(blanked):
        if ch == "{":
            depth += 1
            opens.append((idx, line))
        elif ch == "}":
            if depth == 0:
                out.append({
                    "what": "stray-close-brace",
                    "line": line,
                    "detail": "a } with no block open. Everything the author "
                              "meant to put in that block is outside it",
                })
            else:
                depth -= 1
                opens.pop()

    for _idx, line in opens:
        out.append({
            "what": "unclosed-block",
            "line": line,
            "detail": "a { that never closes. Whatever follows is swallowed "
                      "into this rule instead of standing on its own",
        })

    return sorted(out, key=lambda f: f["line"])


def _structural_events(css: str) -> list[tuple[int, str, int]]:
    """Positions of ``{ } ;`` that are real structure.

    Skips strings and anything inside parens, so a ``url("data:…")`` carrying
    braces or semicolons cannot be read as structure.
    """
    events: list[tuple[int, str, int]] = []
    i, n, line = 0, len(css), 1
    while i < n:
        c = css[i]
        if c == "\n":
            line += 1
            i += 1
            continue
        if c in "\"'":
            q = c
            j = i + 1
            while j < n:
                if css[j] == "\\":
                    j += 2
                    continue
                if css[j] == q:
                    j += 1
                    break
                j += 1
            line += css.count("\n", i, min(j, n))
            i = j
            continue
        if c == "(":
            depth, j = 1, i + 1
            while j < n and depth:
                ch = css[j]
                if ch == "\\":
                    j += 2
                    continue
                if ch in "\"'":
                    q = ch
                    j += 1
                    while j < n:
                        if css[j] == "\\":
                            j += 2
                            continue
                        if css[j] == q:
                            j += 1
                            break
                        j += 1
                    continue
                if ch == "(":
                    depth += 1
                elif ch == ")":
                    depth -= 1
                j += 1
            line += css.count("\n", i, min(j, n))
            i = j
            continue
        if c in "{};":
            events.append((i, c, line))
        i += 1
    return events


def parse_css(css_text: str):
    """-> (declarations, classes, at_rule_preludes).

    Descends into ``@media`` (and any other block at-rule); skips ``@keyframes``
    bodies, whose percentage selectors are not rules and whose declarations are
    not the design system speaking about a property.
    """
    css = _blank_comments(css_text)
    events = _structural_events(css)
    declarations: list[Declaration] = []
    classes: set[str] = set()
    at_preludes: list[str] = []
    stack: list[str] = []
    last = 0

    def in_keyframes() -> bool:
        return any(p.lstrip().lower().startswith("@keyframes") or
                   p.lstrip().lower().startswith("@-webkit-keyframes")
                   for p in stack)

    def current_selector() -> str:
        for p in reversed(stack):
            if not p.lstrip().startswith("@"):
                return p
        return stack[-1] if stack else ""

    def current_ats() -> tuple[str, ...]:
        return tuple(p for p in stack if p.lstrip().startswith("@"))

    for idx, ch, line in events:
        seg = css[last:idx].strip()
        last = idx + 1
        if ch == "{":
            stack.append(seg)
            if seg.lstrip().startswith("@"):
                at_preludes.append(seg)
            elif not in_keyframes():
                for sel in _split_top_level(seg):
                    classes.update(_CLASS_RE.findall(sel))
            continue
        if ch == "}":
            if seg and stack and not in_keyframes():
                _emit(seg, current_selector(), current_ats(), line, declarations)
            if stack:
                stack.pop()
            continue
        # ';'
        if not seg:
            continue
        if seg.lstrip().startswith("@"):
            at_preludes.append(seg)
            continue
        if stack and not in_keyframes():
            _emit(seg, current_selector(), current_ats(), line, declarations)
    return declarations, classes, at_preludes


def _emit(seg, selector, ats, line, out):
    if ":" not in seg:
        return
    prop, _, value = seg.partition(":")
    prop = prop.strip()
    value = value.strip()
    if not prop or not value:
        return
    out.append(Declaration(selector, prop, value, line, ats))


# ---------------------------------------------------------------------------
# Tailwind config
# ---------------------------------------------------------------------------


def _load_tailwind_config(js_path: str, warnings: list[str]) -> dict:
    cfg = _load_via_node(js_path, warnings)
    if cfg is None:
        cfg = _load_via_python(js_path, warnings)
    return cfg or {}


def _load_via_node(js_path: str, warnings: list[str]):
    script = (
        "globalThis.tailwind={};"
        f"require({json.dumps(os.path.abspath(js_path))});"
        "console.log(JSON.stringify(tailwind.config));"
    )
    try:
        res = subprocess.run(
            ["node", "-e", script],
            capture_output=True,
            text=True,
            timeout=30,
        )
    except (FileNotFoundError, OSError):
        warnings.append(
            "node not found; fell back to the built-in JS object reader for "
            f"{os.path.basename(js_path)}"
        )
        return None
    except subprocess.TimeoutExpired:
        warnings.append(f"node timed out reading {os.path.basename(js_path)}")
        return None
    if res.returncode != 0:
        warnings.append(
            f"node failed on {os.path.basename(js_path)}: "
            f"{res.stderr.strip().splitlines()[-1] if res.stderr.strip() else res.returncode}"
        )
        return None
    try:
        return json.loads(res.stdout.strip() or "null")
    except json.JSONDecodeError:
        warnings.append(f"node produced unreadable JSON for {os.path.basename(js_path)}")
        return None


def _load_via_python(js_path: str, warnings: list[str]):
    """Tolerant reader for the ``tailwind.config = {...}`` object literal.

    Only used when node is unavailable.  Handles comments, trailing commas,
    single quotes, bare identifier keys and nested objects/arrays.
    """
    try:
        with open(js_path, "r", encoding="utf-8") as fh:
            text = fh.read()
    except OSError as exc:
        warnings.append(f"could not read {js_path}: {exc}")
        return None
    m = re.search(r"tailwind\s*\.\s*config\s*=\s*", text)
    start = text.index("{", m.end()) if m else text.find("{")
    if start < 0:
        warnings.append(f"no object literal found in {os.path.basename(js_path)}")
        return None
    try:
        obj, _ = _js_value(text, start)
    except ValueError as exc:
        warnings.append(f"could not read {os.path.basename(js_path)}: {exc}")
        return None
    return obj


def _js_skip(text: str, i: int) -> int:
    n = len(text)
    while i < n:
        c = text[i]
        if c.isspace():
            i += 1
        elif c == "/" and text[i + 1: i + 2] == "/":
            j = text.find("\n", i)
            i = n if j < 0 else j + 1
        elif c == "/" and text[i + 1: i + 2] == "*":
            j = text.find("*/", i + 2)
            i = n if j < 0 else j + 2
        else:
            break
    return i


def _js_value(text: str, i: int):
    i = _js_skip(text, i)
    if i >= len(text):
        raise ValueError("unexpected end of input")
    c = text[i]
    if c == "{":
        obj, i = {}, i + 1
        while True:
            i = _js_skip(text, i)
            if i >= len(text):
                raise ValueError("unterminated object")
            if text[i] == "}":
                return obj, i + 1
            key, i = _js_key(text, i)
            i = _js_skip(text, i)
            if text[i] != ":":
                raise ValueError(f"expected ':' at {i}")
            val, i = _js_value(text, i + 1)
            obj[key] = val
            i = _js_skip(text, i)
            if i < len(text) and text[i] == ",":
                i += 1
    if c == "[":
        arr, i = [], i + 1
        while True:
            i = _js_skip(text, i)
            if i >= len(text):
                raise ValueError("unterminated array")
            if text[i] == "]":
                return arr, i + 1
            val, i = _js_value(text, i)
            arr.append(val)
            i = _js_skip(text, i)
            if i < len(text) and text[i] == ",":
                i += 1
    if c in "\"'`":
        return _js_string(text, i)
    j = i
    while j < len(text) and text[j] not in ",}]\n":
        j += 1
    raw = text[i:j].strip()
    if raw in ("true", "false"):
        return raw == "true", j
    if raw == "null":
        return None, j
    try:
        return float(raw) if "." in raw else int(raw), j
    except ValueError:
        return raw, j


def _js_key(text: str, i: int):
    if text[i] in "\"'`":
        return _js_string(text, i)
    j = i
    while j < len(text) and (text[j].isalnum() or text[j] in "_$-"):
        j += 1
    return text[i:j], j


def _js_string(text: str, i: int):
    q, buf, i = text[i], [], i + 1
    while i < len(text):
        c = text[i]
        if c == "\\":
            buf.append(text[i + 1: i + 2])
            i += 2
            continue
        if c == q:
            return "".join(buf), i + 1
        buf.append(c)
        i += 1
    raise ValueError("unterminated string")


def _theme(config: dict) -> dict:
    theme = dict(config.get("theme") or {})
    extend = theme.pop("extend", None) or {}
    merged = dict(theme)
    for k, v in extend.items():
        if isinstance(v, dict) and isinstance(merged.get(k), dict):
            merged[k] = {**merged[k], **v}
        else:
            merged[k] = v
    return merged


def _camel_to_kebab(name: str) -> str:
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", name)
    s = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1-\2", s)
    return s.lower()


def _flatten_member(value):
    """A theme member's written value.  Scale entries ship as
    ``[size, {options}]``; font stacks ship as a list."""
    if isinstance(value, str):
        return value
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        if value and isinstance(value[0], str) and any(
            isinstance(v, dict) for v in value[1:]
        ):
            return value[0]
        return ", ".join(str(v) for v in value if isinstance(v, (str, int, float)))
    return None


def _member_options(value):
    if isinstance(value, list):
        for v in value[1:]:
            if isinstance(v, dict):
                return v
    return None


# ---------------------------------------------------------------------------
# vocabularies
# ---------------------------------------------------------------------------


@dataclass
class Nearest:
    name: str
    value: str
    distance: float


@dataclass
class Vocabulary:
    property: str
    entries: dict[str, str]
    value_type: str
    ordered: bool
    scope: str
    properties: frozenset[str] = frozenset()
    sources: frozenset[str] = frozenset()

    # -- membership ---------------------------------------------------------

    def contains(self, value: str) -> bool:
        target = normalise_value(value)
        return any(normalise_value(v) == target for v in self.entries.values())

    def name_for(self, value: str) -> str | None:
        target = normalise_value(value)
        for name, v in self.entries.items():
            if normalise_value(v) == target:
                return name
        return None

    def nearest(self, value: str) -> Nearest | None:
        """The member this value was probably meant to be, or None.

        Section 1: the linter may only call something an error when it can name
        a replacement.  An unordered vocabulary always returns None.
        """
        if not self.ordered:
            return None
        if self.value_type == "color":
            return self._nearest_color(value)
        return self._nearest_scalar(value)

    def _nearest_color(self, value):
        target = _parse_rgba(value)
        if target is None:
            return None
        best = None
        for name, v in self.entries.items():
            cand = _parse_rgba(v)
            if cand is None:
                continue
            d = (
                (target[0] - cand[0]) ** 2
                + (target[1] - cand[1]) ** 2
                + (target[2] - cand[2]) ** 2
            ) ** 0.5 + abs(target[3] - cand[3]) * 255.0
            if best is None or d < best.distance:
                best = Nearest(name, v, d)
        return best

    def _nearest_scalar(self, value):
        target = _parse_scalar(value)
        if target is None:
            return None
        cls, mag = target
        best = None
        for name, v in self.entries.items():
            cand = _parse_scalar(v)
            if cand is None:
                continue
            if cand[0] != cls and not (cand[1] == 0 or mag == 0):
                continue
            if cand[0] != cls and cand[1] != 0 and mag != 0:
                continue
            d = abs(mag - cand[1])
            if best is None or d < best.distance:
                best = Nearest(name, v, d)
        return best


# CSS-spec knowledge, not design-system knowledge: these keywords resolve to
# fixed values in every stylesheet ever written.  Without them `color: white`
# cannot be compared against --text-white and gets reported as a colour the
# design system lacks, which is the opposite of true.  Any named colour absent
# here returns None and is routed to not_checked rather than invented as a gap.
_NAMED_COLOR_VALUES = {
    "transparent": (0.0, 0.0, 0.0, 0.0),
    "white": (255.0, 255.0, 255.0, 1.0),
    "black": (0.0, 0.0, 0.0, 1.0),
    "red": (255.0, 0.0, 0.0, 1.0),
    "lime": (0.0, 255.0, 0.0, 1.0),
    "blue": (0.0, 0.0, 255.0, 1.0),
    "yellow": (255.0, 255.0, 0.0, 1.0),
    "cyan": (0.0, 255.0, 255.0, 1.0),
    "aqua": (0.0, 255.0, 255.0, 1.0),
    "magenta": (255.0, 0.0, 255.0, 1.0),
    "fuchsia": (255.0, 0.0, 255.0, 1.0),
    "gray": (128.0, 128.0, 128.0, 1.0),
    "grey": (128.0, 128.0, 128.0, 1.0),
    "silver": (192.0, 192.0, 192.0, 1.0),
    "maroon": (128.0, 0.0, 0.0, 1.0),
    "olive": (128.0, 128.0, 0.0, 1.0),
    "green": (0.0, 128.0, 0.0, 1.0),
    "purple": (128.0, 0.0, 128.0, 1.0),
    "teal": (0.0, 128.0, 128.0, 1.0),
    "navy": (0.0, 0.0, 128.0, 1.0),
    "orange": (255.0, 165.0, 0.0, 1.0),
}


def _hsl_to_rgb(h: float, s: float, ll: float):
    h = h % 360 / 60.0
    c = (1 - abs(2 * ll - 1)) * s
    x = c * (1 - abs(h % 2 - 1))
    m = ll - c / 2
    r, g, b = [
        (c, x, 0.0), (x, c, 0.0), (0.0, c, x),
        (0.0, x, c), (x, 0.0, c), (c, 0.0, x),
    ][int(h) % 6]
    return ((r + m) * 255, (g + m) * 255, (b + m) * 255)


def _parse_rgba(value):
    v = normalise_value(value)

    named = _NAMED_COLOR_VALUES.get(v.strip().lower())
    if named is not None:
        return named

    m = re.match(r"^hsla?\(([^)]*)\)$", v.strip().lower())
    if m:
        parts = [p.strip() for p in re.split(r"[,/ ]+", m.group(1)) if p.strip()]
        if len(parts) >= 3:
            try:
                h = float(parts[0].rstrip("deg"))
                s = float(parts[1].rstrip("%")) / 100
                ll = float(parts[2].rstrip("%")) / 100
            except ValueError:
                return None
            a = 1.0
            if len(parts) >= 4:
                try:
                    a = (float(parts[3][:-1]) / 100 if parts[3].endswith("%")
                         else float(parts[3]))
                except ValueError:
                    a = 1.0
            r, g, b = _hsl_to_rgb(h, s, ll)
            return (r, g, b, a)

    if _HEX_RE.match(v):
        body = _expand_hex(v)[1:]
        if len(body) == 6:
            body += "ff"
        return (
            int(body[0:2], 16),
            int(body[2:4], 16),
            int(body[4:6], 16),
            int(body[6:8], 16) / 255.0,
        )
    m = re.match(r"^rgba?\(([^)]*)\)$", v)
    if m:
        parts = [p.strip() for p in re.split(r"[,/ ]+", m.group(1)) if p.strip()]
        if len(parts) >= 3:
            try:
                rgb = [
                    float(p[:-1]) * 255 / 100 if p.endswith("%") else float(p)
                    for p in parts[:3]
                ]
            except ValueError:
                return None
            a = 1.0
            if len(parts) >= 4:
                try:
                    a = float(parts[3][:-1]) / 100 if parts[3].endswith("%") else float(parts[3])
                except ValueError:
                    a = 1.0
            return (rgb[0], rgb[1], rgb[2], a)
    return None


def _parse_scalar(value):
    """-> (unit-class, magnitude in px or raw) or None."""
    v = normalise_value(value)
    if _NUMBER_RE.match(v):
        return ("number", float(v))
    m = _DIMENSION_RE.match(v)
    if not m:
        return None
    mag, unit = float(m.group(1)), m.group(2).lower()
    if unit in _ABSOLUTE_UNITS:
        return ("px", mag * _ABSOLUTE_UNITS[unit])
    if unit in _RELATIVE_UNIT_CLASSES:
        return (_RELATIVE_UNIT_CLASSES[unit], mag)
    return None


@dataclass
class _Draft:
    value_type: str
    entries: dict[str, str] = field(default_factory=dict)
    properties: set[str] = field(default_factory=set)
    sources: set[str] = field(default_factory=set)
    d2_property: str | None = None
    property_hits: dict[str, int] = field(default_factory=dict)

    def hit(self, prop: str, n: int = 1):
        self.properties.add(prop)
        self.property_hits[prop] = self.property_hits.get(prop, 0) + n


def _dominant_type(values) -> str:
    counts: dict[str, int] = {}
    for v in values:
        if v is None:
            continue
        t = classify_value(v)
        counts[t] = counts.get(t, 0) + 1
    if not counts:
        return "keyword"
    return max(counts.items(), key=lambda kv: (kv[1], kv[0] != "keyword"))[0]


# ---------------------------------------------------------------------------
# the design system
# ---------------------------------------------------------------------------


@dataclass
class DesignSystem:
    classes: set[str]
    tokens: dict[str, str]
    vocabularies: dict[str, Vocabulary]
    all_vocabularies: list[Vocabulary] = field(default_factory=list)
    declarations: list[Declaration] = field(default_factory=list)
    theme: dict = field(default_factory=dict)
    css_paths: list[str] = field(default_factory=list)
    js_paths: list[str] = field(default_factory=list)
    #: legacy class name -> the canonical one to write instead, read from
    #: ``/* @legacy .old -> .new */`` markers in the design system's own CSS.
    #: Empty when the design system declares none, which is the honest
    #: default: nothing here decides what is deprecated.
    legacy_classes: dict[str, str] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)

    # -- the questions the linter asks --------------------------------------

    def vocabulary_for(self, property: str, value: str | None = None) -> Vocabulary | None:
        """The vocabulary that reaches this property.

        With ``value``, the answer is typed: the vocabulary whose value type
        matches what was written, falling back to an unscoped palette of that
        type — which is how a colour written on a property pai.css never puts a
        colour on still resolves to the palette.
        """
        prop = (property or "").strip().lower()
        if value is None:
            return self.vocabularies.get(prop)
        want = classify_value(value)
        scoped = [
            v for v in self.all_vocabularies
            if prop in v.properties and v.value_type == want
        ]
        if scoped:
            return _best(scoped, prop)
        unscoped = [
            v for v in self.all_vocabularies
            if v.scope == "unscoped" and v.value_type == want
        ]
        if unscoped:
            return _best(unscoped, prop)
        return None

    def is_silent(self, property: str, value: str | None = None) -> bool:
        """True when the design system publishes nothing that reaches here."""
        return self.vocabulary_for(property, value) is None

    def vocabularies_for(self, property: str) -> list[Vocabulary]:
        prop = (property or "").strip().lower()
        return [v for v in self.all_vocabularies if prop in v.properties]

    def token_value(self, name: str) -> str | None:
        return self.tokens.get(name.lstrip("-"))

    @property
    def published_properties(self) -> set[str]:
        return set(self.vocabularies)


def _best(cands: list[Vocabulary], prop: str) -> Vocabulary:
    return sorted(
        cands,
        key=lambda v: (
            0 if v.property == prop else 1,
            0 if "D2" in v.sources or "D2n" in v.sources else 1,
            -len(v.entries),
        ),
    )[0]


# ---------------------------------------------------------------------------
# the derivations
# ---------------------------------------------------------------------------


_LEGACY_MARKER = re.compile(
    r"@legacy\s+\.([A-Za-z][\w-]*)\s*->\s*\.([A-Za-z][\w-]*)"
)


def _legacy_classes(css_text: str) -> dict[str, str]:
    """Legacy class names the design system has marked, and what to write instead.

    The marker is explicit rather than inferred from selector order. Of the rules
    in pai.css carrying more than one selector, most are components sharing a
    rule — ``.pai-input, .pai-textarea`` — not aliases, so position says nothing.
    """
    return {m.group(1): m.group(2) for m in _LEGACY_MARKER.finditer(css_text)}


def parse_design_system(ds_dir: str) -> DesignSystem:
    ds_dir = os.path.abspath(ds_dir)
    warnings: list[str] = []

    css_paths = sorted(
        os.path.join(ds_dir, f) for f in os.listdir(ds_dir) if f.lower().endswith(".css")
    )
    js_paths = sorted(
        os.path.join(ds_dir, f) for f in os.listdir(ds_dir) if f.lower().endswith(".js")
    )
    if not css_paths:
        warnings.append(f"no .css file in {ds_dir}")

    declarations: list[Declaration] = []
    classes: set[str] = set()
    legacy_classes: dict[str, str] = {}
    for path in css_paths:
        with open(path, "r", encoding="utf-8") as fh:
            raw = fh.read()
        decls, cls, _ = parse_css(raw)
        declarations.extend(decls)
        classes |= cls
        legacy_classes.update(_legacy_classes(raw))

    theme: dict = {}
    for path in js_paths:
        cfg = _load_tailwind_config(path, warnings)
        if cfg:
            theme.update(_theme(cfg))

    tokens: dict[str, str] = {}
    for d in declarations:
        if d.property.startswith("--") and ":root" in d.selector:
            tokens[d.property[2:]] = d.value

    written = [d for d in declarations if not d.property.startswith("--")]
    declared_properties = {d.property.lower() for d in written}

    drafts: list[_Draft] = []

    # -- D1 -----------------------------------------------------------------
    # pai.css writes `P: … var(--tok) …` ⇒ --tok is consumed for P.
    d1: dict[tuple[str, str], _Draft] = {}
    token_properties: dict[str, set[str]] = {}
    for d in written:
        prop = d.property.lower()
        for ref in _VAR_RE.findall(d.value):
            name = ref[2:]
            token_properties.setdefault(name, set()).add(prop)
            tval = tokens.get(name)
            if tval is None:
                continue  # dangling; the linter reports it, it is not a member
            t = classify_value(tval)
            key = (prop, t)
            draft = d1.get(key)
            if draft is None:
                draft = d1[key] = _Draft(value_type=t, sources={"D1"})
                drafts.append(draft)
            draft.entries[name] = tval
            draft.hit(prop)

    # -- D2 -----------------------------------------------------------------
    # theme key camelCase→kebab, kept only if pai.css itself declares it.
    for key, members in theme.items():
        if not isinstance(members, dict):
            continue
        prop = _camel_to_kebab(key)
        if prop not in declared_properties:
            continue
        entries = {}
        for name, raw in members.items():
            flat = _flatten_member(raw)
            if flat:
                entries[str(name)] = flat
        if not entries:
            continue
        draft = _Draft(
            value_type=_dominant_type(entries.values()),
            entries=entries,
            sources={"D2"},
            d2_property=prop,
        )
        draft.hit(prop, len(entries))
        drafts.append(draft)

    # -- D2n ----------------------------------------------------------------
    drafts.extend(
        _derive_d2_nested(theme, declared_properties, written)
    )

    # -- D4 candidates ------------------------------------------------------
    # theme keys D2 rejected as non-properties get their scope from D1/D4: the
    # members are matched to :root tokens by name and the spread of properties
    # those tokens reach decides whether it is a palette.
    for key, members in theme.items():
        if not isinstance(members, dict):
            continue
        if _camel_to_kebab(key) in declared_properties:
            continue
        entries = {}
        for name, raw in members.items():
            flat = _flatten_member(raw)
            if flat:
                entries[str(name)] = flat
        if not entries:
            continue
        vtype = _dominant_type(entries.values())
        if vtype == "keyword":
            continue  # keyframes and friends: not a vocabulary of values
        draft = _Draft(value_type=vtype, entries=entries, sources={"D4"})
        for name in entries:
            for prop in token_properties.get(name, ()):
                draft.hit(prop)
        # A D4 draft that reaches no property has no evidence it is a vocabulary
        # for anything.  Tailwind's `spacing` key lands here: it is not a CSS
        # property, and its members ("1", "2", "4") match no :root token by
        # name.  Merged, it silently pours the whole spacing scale into
        # border-radius, making 96px a legal corner.
        if not draft.properties:
            continue
        drafts.append(draft)

    # -- D5 / D6 ------------------------------------------------------------
    # a self-identifying value written straight onto property Q puts Q in scope
    # and puts the value in the system.
    d5: dict[tuple[str, str], _Draft] = {}
    for d in written:
        prop = d.property.lower()
        if "var(" in d.value and not _extract_self_identifying(d.value):
            continue
        for t, text in _extract_self_identifying(d.value):
            if t not in SELF_IDENTIFYING_TYPES:
                continue
            norm = normalise_value(text)
            if not norm or norm in _CSS_WIDE_KEYWORDS:
                continue
            key = (prop, t)
            draft = d5.get(key)
            if draft is None:
                draft = d5[key] = _Draft(value_type=t, sources={"D5", "D6"})
                drafts.append(draft)
            draft.entries.setdefault(norm, text.strip())
            draft.hit(prop)

    # -- merge --------------------------------------------------------------
    vocabs = _merge(drafts)

    # -- D6, token level ----------------------------------------------------
    # a :root token is a published member by definition.  It joins the unique
    # vocabulary of its value type; where more than one vocabulary of that type
    # exists the token is ambiguous and is left alone.
    by_type: dict[str, list[_Draft]] = {}
    for v in vocabs:
        by_type.setdefault(v.value_type, []).append(v)
    for name, value in tokens.items():
        t = classify_value(value)
        group = by_type.get(t, [])
        if len(group) == 1:
            group[0].entries.setdefault(name, value)
            group[0].sources.add("D6")

    finished = _finish(vocabs)
    index: dict[str, Vocabulary] = {}
    for v in finished:
        for prop in v.properties:
            cur = index.get(prop)
            if cur is None or _prefer(v, cur, prop):
                index[prop] = v

    return DesignSystem(
        classes=classes,
        tokens=tokens,
        vocabularies=index,
        all_vocabularies=finished,
        declarations=declarations,
        theme=theme,
        css_paths=css_paths,
        js_paths=js_paths,
        legacy_classes=legacy_classes,
        warnings=warnings,
    )


def _derive_d2_nested(theme, declared_properties, written) -> list[_Draft]:
    """D2 applied to the option object inside a scale entry.

    ``fontSize`` ships ``["2.25rem", {lineHeight, letterSpacing, fontWeight}]``.
    Those are coupled ramp steps, not free-standing vocabularies — a scale does
    not publish a line-height, it publishes a step that has one.  A nested key
    only becomes a vocabulary in its own right when the design system's own CSS
    never steps outside it: if every literal pai.css writes for that property is
    already a member, the system is treating the set as closed and the linter
    can too.

    On today's design system this keeps ``font-weight`` (400/500/600, and
    pai.css writes nothing else) and drops ``line-height`` (pai.css writes 14px,
    16px, 20px) and ``letter-spacing`` (pai.css writes 0.3px) — which is exactly
    the inventory in spec section 3.  It is derived, not listed: add
    ``font-weight:700`` to pai.css and font-weight stops being published.
    """
    literals: dict[str, set[str]] = {}
    for d in written:
        if "var(" in d.value:
            continue
        v = normalise_value(d.value)
        if v and v not in _CSS_WIDE_KEYWORDS:
            literals.setdefault(d.property.lower(), set()).add(v)

    candidates: dict[str, dict[str, str]] = {}
    for members in theme.values():
        if not isinstance(members, dict):
            continue
        for raw in members.values():
            opts = _member_options(raw)
            if not opts:
                continue
            for nested_key, nested_val in opts.items():
                if not isinstance(nested_val, (str, int, float)):
                    continue
                prop = _camel_to_kebab(str(nested_key))
                if prop not in declared_properties:
                    continue
                candidates.setdefault(prop, {})[normalise_value(str(nested_val))] = str(
                    nested_val
                )

    out: list[_Draft] = []
    for prop, entries in candidates.items():
        seen = literals.get(prop, set())
        if not seen or not seen <= set(entries):
            continue  # the system steps outside its own set: not a vocabulary
        draft = _Draft(
            value_type=_dominant_type(entries.values()),
            entries=dict(entries),
            sources={"D2n"},
            d2_property=prop,
        )
        draft.hit(prop, len(entries))
        out.append(draft)
    return out


def _merge(drafts: list[_Draft]) -> list[_Draft]:
    """Fold drafts of the same value type together.

    Two vocabularies published under different CSS property names never merge —
    a font-size scale and a radius scale are both lengths and have nothing to do
    with each other.  Otherwise they merge when their members overlap, or, for
    value types with no ordering, unconditionally: there is one gradient
    vocabulary and one easing vocabulary however many properties they reach.
    """
    drafts = list(drafts)
    changed = True
    while changed:
        changed = False
        for i in range(len(drafts)):
            for j in range(i + 1, len(drafts)):
                a, b = drafts[i], drafts[j]
                if a.value_type != b.value_type:
                    continue
                if a.d2_property and b.d2_property and a.d2_property != b.d2_property:
                    continue
                overlap = _overlap(a, b)
                ordered = a.value_type in ORDERED_VALUE_TYPES
                if not overlap and ordered:
                    continue
                a.entries.update({k: v for k, v in b.entries.items() if k not in a.entries})
                a.properties |= b.properties
                a.sources |= b.sources
                a.d2_property = a.d2_property or b.d2_property
                for p, n in b.property_hits.items():
                    a.property_hits[p] = a.property_hits.get(p, 0) + n
                drafts.pop(j)
                changed = True
                break
            if changed:
                break
    return drafts


def _overlap(a: _Draft, b: _Draft) -> bool:
    if set(a.entries) & set(b.entries):
        return True
    av = {normalise_value(v) for v in a.entries.values()}
    bv = {normalise_value(v) for v in b.entries.values()}
    return bool(av & bv)


def _finish(drafts: list[_Draft]) -> list[Vocabulary]:
    out = []
    for d in drafts:
        if not d.entries or not d.properties:
            continue
        # D4: reaching >=3 distinct properties makes it a palette, unscoped.
        scope = "unscoped" if len(d.properties) >= 3 else "scoped"
        prop = d.d2_property or max(
            d.property_hits.items(), key=lambda kv: (kv[1], kv[0])
        )[0]
        out.append(
            Vocabulary(
                property=prop,
                entries=dict(d.entries),
                value_type=d.value_type,
                ordered=d.value_type in ORDERED_VALUE_TYPES,
                scope=scope,
                properties=frozenset(d.properties),
                sources=frozenset(d.sources),
            )
        )
    out.sort(key=lambda v: (-len(v.entries), v.property))
    return out


def _prefer(new: Vocabulary, cur: Vocabulary, prop: str) -> bool:
    def rank(v):
        return (
            0 if v.property == prop else 1,
            0 if ("D2" in v.sources or "D2n" in v.sources) else 1,
            0 if v.scope == "scoped" else 1,
            -len(v.entries),
        )

    return rank(new) < rank(cur)


# ---------------------------------------------------------------------------
# section 6 — did this page opt in at all?
# ---------------------------------------------------------------------------

_HREF_RE = re.compile(r"""(?:href|src)\s*=\s*["']([^"']+)["']""", re.I)
_IMPORT_RE = re.compile(r"""@import\s+(?:url\(\s*)?["']?([^"')\s;]+)""", re.I)


def adopted_design_system(html_path: str, ds_dir: str) -> bool:
    """Does the file load the design system's stylesheet?  One check."""
    ds_dir = os.path.abspath(ds_dir)
    try:
        sheets = {
            f.lower() for f in os.listdir(ds_dir) if f.lower().endswith(".css")
        }
    except OSError:
        return False
    if not sheets:
        return False
    try:
        with open(html_path, "r", encoding="utf-8", errors="replace") as fh:
            html = fh.read()
    except OSError:
        return False
    refs = _HREF_RE.findall(html) + _IMPORT_RE.findall(html)
    for ref in refs:
        base = os.path.basename(ref.split("?")[0].split("#")[0]).lower()
        if base in sheets:
            return True
    return False


# ---------------------------------------------------------------------------


def _report(ds: DesignSystem) -> str:
    lines = []
    lines.append(f"classes: {len(ds.classes)}   tokens: {len(ds.tokens)}")
    for w in ds.warnings:
        lines.append(f"  ! {w}")
    lines.append("")
    lines.append(
        f"{'PROPERTY':<20} {'ENTRIES':>7}  {'TYPE':<12} {'ORDERED':<8} {'SCOPE':<9} SOURCES"
    )
    for v in ds.all_vocabularies:
        lines.append(
            f"{v.property:<20} {len(v.entries):>7}  {v.value_type:<12} "
            f"{str(v.ordered):<8} {v.scope:<9} {','.join(sorted(v.sources))}"
        )
        reach = sorted(v.properties)
        if reach != [v.property]:
            lines.append(f"{'':<20} reaches: {', '.join(reach)}")
    return "\n".join(lines)


if __name__ == "__main__":
    import sys

    here = os.path.dirname(os.path.abspath(__file__))            # tools/lint
    root = os.path.dirname(os.path.dirname(here))                # repo root
    target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "design-system")
    print(_report(parse_design_system(target)))

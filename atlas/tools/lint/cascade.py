"""cascade — what a text element's colours compute to, read from source alone.

Spec: docs/lint-spec.md section 5.

The contrast check needs something no other rule in this linter needs: not "what
did the author write here" but "what does *this element* end up with".  Colour
inherits, backgrounds show through, and a class carries its value from
``design-system/pai.css`` while the artifact never writes it down.  The screen
behind issue #2 wrote nothing but ``class="button-gold-shimmer"``; both sides of
the failing pair live in the design system.

So this module runs a small, deliberately incomplete cascade over the source:

* every declaration from ``design-system/*.css`` and from the artifact's own
  ``<style>`` blocks and ``style=`` attributes, ordered the way a browser orders
  them — specificity, then document order, with ``!important`` on top;
* selectors restricted to what a static parse tree can decide — tags, classes,
  ids, attribute selectors, the four combinators, ``:not()``, ``:has()`` and the
  structural pseudo-classes;
* **everything else marks the element unresolved rather than resolving it**, and
  the admission is scoped to the selector's *subject*, so one undecidable rule
  does not taint every element on the page.

That last point is the whole design.  A checker that quietly skips what it
cannot work out is what let a 2.02:1 buy button through, so every give-up is
recorded with a reason and surfaced in ``not_checked``.  :func:`read` never
returns an element as "fine" — it returns a pair or a list of reasons.

Nothing about the design system is written down here.  Tokens, the type ramp and
the palette are read through :mod:`dsparse` at runtime.  The only constants are
CSS, WCAG and Tailwind facts — which elements are void, which pseudo-classes are
states, how sRGB converts to relative luminance, what "large text" means.

Public surface::

    read(html_path, ds) -> Cascade
    Cascade.texts             -> [TextElement]     (resolved and unresolved alike)
    TextElement.pair          -> Pair | None
    TextElement.unresolved    -> [reason]
    contrast_ratio(fg, bg)    -> float
"""

from __future__ import annotations

import html.parser
import os
import re
from dataclasses import dataclass, field

from dsparse import (
    DesignSystem,
    _parse_rgba,
    _parse_scalar,
    _split_components,
    _split_top_level,
    normalise_value,
    parse_css,
)

__all__ = [
    "read", "Cascade", "TextElement", "Pair", "contrast_ratio",
    "LARGE_PX", "LARGE_BOLD_PX", "BOLD_WEIGHT",
]


# ---------------------------------------------------------------------------
# WCAG and CSS constants — spec-level, never design-system-level
# ---------------------------------------------------------------------------

#: WCAG 2.2 SC 1.4.3 "large scale text": 18pt, or 14pt bold.  In CSS px at the
#: 96dpi reference that is 24px and 18.6667px.  The standard's numbers, not a
#: house choice, and they do not go stale when design-system/ changes.
LARGE_PX = 24.0
LARGE_BOLD_PX = 18.66
#: "bold" in the standard is the CSS bold weight.
BOLD_WEIGHT = 700

#: the root font size browsers ship, used to turn rem into px.
DEFAULT_ROOT_PX = 16.0
#: CSS initial value for font-weight.
DEFAULT_WEIGHT = 400

_VOID = frozenset(
    "area base br col embed hr img input link meta param source track wbr".split()
)
#: text inside these is never rendered as page text
_NON_RENDERING = frozenset("script style template title noscript head".split())

#: pseudo-classes that describe a *state* the element is not in at rest.
#: Skipping them is correct rather than a give-up — they are not the resting
#: appearance.  ``:disabled`` is doubly safe: SC 1.4.3 exempts inactive controls.
_STATE_PSEUDOS = frozenset(
    """hover focus focus-visible focus-within active visited target checked
    disabled indeterminate placeholder-shown user-invalid user-valid invalid
    valid autofill open""".split()
)

#: pseudo-elements that paint *over* an element's own background.  Whether they
#: obscure the text is a compositing question only a browser answers, so their
#: presence turns a computed ratio into an upper bound.
_OVERLAY_PSEUDOS = ("::before", "::after", ":before", ":after")

#: properties that decide a text/background pair, and the ones that disturb what
#: composites without deciding it.  A rule this reader cannot evaluate matters
#: only if it sets one of these.
_COLOUR_PROPS = frozenset(
    "color -webkit-text-fill-color".split()
)
_BACKGROUND_PROPS = frozenset(
    "background background-color background-image".split()
)
_DISTURBING_PROPS = frozenset(
    "opacity filter mix-blend-mode backdrop-filter".split()
)

#: Tailwind stock utilities that take an element out of sight.  Tailwind's own
#: API, the same category as the prefix table in rules.py; it does not go stale
#: when design-system/ changes.
_TW_INVISIBLE = frozenset({"sr-only", "hidden", "invisible"})

_CLASS_TOKEN = re.compile(r"\.(-?[_a-zA-Z][\w-]*)")
_TAG_TOKEN = re.compile(r"^([a-zA-Z][\w-]*)")
_TAG_ANYWHERE = re.compile(r"(?:^|[\s>+~])([a-zA-Z][\w-]*)")
_VAR_CALL = re.compile(r"var\(\s*(--[\w-]+)\s*(?:,([^)]*))?\)", re.I)
_URL_RE = re.compile(r"\burl\s*\(", re.I)
_GRADIENT_RE = re.compile(r"(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(", re.I)
_STYLE_BLOCK = re.compile(r"<style\b[^>]*>(?P<body>.*?)</style\s*>", re.I | re.S)
_ABSENT = frozenset({"none", "transparent", "initial", "unset", "revert", "revert-layer"})


# ---------------------------------------------------------------------------
# colour arithmetic
# ---------------------------------------------------------------------------


def _relative_luminance(rgb) -> float:
    def channel(c):
        c = max(0.0, min(255.0, c)) / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (channel(c) for c in rgb[:3])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(fg, bg) -> float:
    """WCAG 2.2 SC 1.4.3.  Both arguments must already be opaque."""
    l1, l2 = _relative_luminance(fg), _relative_luminance(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def _over(top, bottom):
    """Source-over compositing.  ``bottom`` must be opaque."""
    a = top[3]
    if a >= 0.999:
        return (top[0], top[1], top[2], 1.0)
    return tuple(top[i] * a + bottom[i] * (1 - a) for i in range(3)) + (1.0,)


def hexof(rgb) -> str:
    return "#%02x%02x%02x" % tuple(int(round(max(0.0, min(255.0, c)))) for c in rgb[:3])


def _gradient_stops(value: str) -> list[str] | None:
    """The colour stops of the first gradient in a value, in written order.

    A gradient is a range, not a colour, and the text sits over all of it, so
    every stop is a background this text is on.  sRGB interpolation never
    produces a luminance outside its two endpoints, so the worst stop is the
    worst point on the gradient.
    """
    m = _GRADIENT_RE.search(value)
    if not m:
        return None
    depth, i = 0, m.end() - 1
    while i < len(value):
        if value[i] == "(":
            depth += 1
        elif value[i] == ")":
            depth -= 1
            if depth == 0:
                break
        i += 1
    stops = []
    for part in _split_top_level(value[m.end(): i]):
        for comp in _split_components(part):
            if _parse_rgba(comp) is not None:
                stops.append(comp)
                break
    return stops or None


# ---------------------------------------------------------------------------
# selectors
# ---------------------------------------------------------------------------


#: structural pseudo-classes decidable from the parse tree alone
_STRUCTURAL = ("first-child", "last-child", "only-child", "first-of-type",
               "last-of-type", "only-of-type", "root", "empty")
_NTH = re.compile(r"^nth-(child|last-child)$")


@dataclass(frozen=True)
class _Attr:
    name: str
    op: str | None
    value: str | None


@dataclass
class _Compound:
    tag: str | None = None              # None is the universal selector
    ids: tuple = ()
    classes: frozenset = frozenset()
    attrs: tuple = ()
    structural: tuple = ()              # (name, argument) pairs
    nots: tuple = ()                    # nested selectors this must NOT match
    has: tuple = ()                     # relative selectors that must exist below


@dataclass
class _Selector:
    text: str
    parts: list                         # [(combinator, _Compound)]; first combinator is None
    specificity: tuple
    supported: bool                     # decidable from a static tree?
    state_only: bool                    # a :hover/:disabled variant, not the resting state
    overlay: bool                       # targets ::before / ::after

    @property
    def subject(self) -> _Compound:
        return self.parts[-1][1]


class _Unsupported(Exception):
    """This selector needs something a static tree does not have."""


def _split_compounds(text: str):
    """-> [(combinator, compound-source)] respecting brackets and parens."""
    out, buf, comb, depth = [], [], None, 0
    i, n = 0, len(text)
    pending_ws = False
    while i < n:
        c = text[i]
        if c in "([":
            depth += 1
        elif c in ")]":
            depth -= 1
        if depth == 0 and c.isspace():
            pending_ws = True
            i += 1
            continue
        if depth == 0 and c in ">+~":
            if buf:
                out.append((comb, "".join(buf)))
                buf, comb = [], None
            comb = c
            pending_ws = False
            i += 1
            continue
        if pending_ws and buf:
            out.append((comb, "".join(buf)))
            buf, comb = [], " "
        pending_ws = False
        buf.append(c)
        i += 1
    if buf:
        out.append((comb, "".join(buf)))
    return out


_COMPOUND_TOKEN = re.compile(
    r"""
      (?P<universal>\*)
    | \#(?P<id>-?[_a-zA-Z][\w-]*)
    | \.(?P<class>-?[_a-zA-Z][\w-]*)
    | \[(?P<attr>[^\]]*)\]
    | ::?(?P<pseudo>[-\w]+)(?P<args>\((?:[^()]|\([^()]*\))*\))?
    | (?P<tag>[a-zA-Z][\w-]*)
    """,
    re.X,
)
_ATTR_RE_C = re.compile(
    r"""^\s*(?P<name>[-\w:]+)\s*(?:(?P<op>[~^$*|]?=)\s*(?P<value>"[^"]*"|'[^']*'|[^\s\]]+))?"""
    r"""\s*[is]?\s*$""",
    re.X,
)


def _parse_compound(text: str, spec: list, depth: int = 0) -> tuple[_Compound, bool, bool]:
    """-> (compound, state_only, overlay).  Raises _Unsupported."""
    tag = None
    ids, classes, attrs, structural, nots, has = [], set(), [], [], [], []
    state_only = overlay = False
    pos = 0
    while pos < len(text):
        m = _COMPOUND_TOKEN.match(text, pos)
        if not m or m.start() != pos:
            raise _Unsupported(text)
        pos = m.end()
        if m.group("universal"):
            continue
        if m.group("id"):
            ids.append(m.group("id"))
            spec[0] += 1
            continue
        if m.group("class"):
            classes.add(m.group("class"))
            spec[1] += 1
            continue
        if m.group("attr") is not None:
            am = _ATTR_RE_C.match(m.group("attr"))
            if not am:
                raise _Unsupported(text)
            value = am.group("value")
            if value and value[0] in "\"'":
                value = value[1:-1]
            attrs.append(_Attr(am.group("name").lower(), am.group("op"), value))
            spec[1] += 1
            continue
        if m.group("tag"):
            tag = m.group("tag").lower()
            spec[2] += 1
            continue
        name = m.group("pseudo").lower()
        args = (m.group("args") or "")[1:-1].strip()
        if text[m.start(): m.start() + 2] == "::" or name in ("before", "after"):
            overlay = True
            spec[2] += 1
            continue
        if name in _STATE_PSEUDOS:
            state_only = True
            spec[1] += 1
            continue
        if name == "not" and depth < 2:
            spec[1] += 1
            for alt in _split_top_level(args):
                sub, sub_state, _ov = _parse_compound(alt.strip(), spec, depth + 1)
                if sub_state:
                    # `:not(:disabled)` excludes a state the element is not in at
                    # rest, so at rest it is simply true — dropping it is exact,
                    # and treating it as undecidable would take the whole rule
                    # out over a condition that always holds.
                    continue
                nots.append(sub)
            continue
        if name == "has" and depth < 2:
            spec[1] += 1
            for alt in _split_top_level(args):
                has.append(_parse_relative(alt.strip(), spec, depth + 1))
            continue
        if name in _STRUCTURAL or _NTH.match(name):
            spec[1] += 1
            structural.append((name, args))
            continue
        raise _Unsupported(text)
    return (
        _Compound(tag, tuple(ids), frozenset(classes), tuple(attrs),
                  tuple(structural), tuple(nots), tuple(has)),
        state_only,
        overlay,
    )


def _parse_relative(text: str, spec: list, depth: int):
    """A :has() argument — an optional leading combinator then a chain."""
    text = text.strip()
    lead = " "
    if text[:1] in ">+~":
        lead, text = text[0], text[1:].strip()
    parts = []
    for comb, src in _split_compounds(text):
        sub, sub_state, _ov = _parse_compound(src, spec, depth + 1)
        if sub_state:
            raise _Unsupported(text)
        parts.append((comb, sub))
    if not parts:
        raise _Unsupported(text)
    return (lead, parts)


def _parse_selector(text: str) -> _Selector:
    raw = text.strip()
    spec = [0, 0, 0]
    parts, state_only, overlay = [], False, False
    try:
        pieces = _split_compounds(raw)
        if not pieces:
            raise _Unsupported(raw)
        for comb, src in pieces:
            compound, st, ov = _parse_compound(src, spec, 0)
            state_only = state_only or st
            overlay = overlay or ov
            parts.append((comb, compound))
        supported = True
    except (_Unsupported, RecursionError):
        supported = False
        # the subject still tells us which elements the rule could reach, which
        # is what keeps an undecidable rule from tainting the whole page
        pieces = _split_compounds(raw)
        subject_src = pieces[-1][1] if pieces else ""
        # strip functional-pseudo arguments before reading the subject: the
        # classes inside `:is(.a, .b)` constrain the match, they are not classes
        # the element must carry, and requiring them makes the subject match
        # nothing — which would turn an admitted unknown back into a silent skip
        while True:
            stripped = re.sub(r"\([^()]*\)", "", subject_src)
            if stripped == subject_src:
                break
            subject_src = stripped
        classes = frozenset(_CLASS_TOKEN.findall(subject_src))
        tag_m = _TAG_TOKEN.match(subject_src)
        parts = [(None, _Compound(tag_m.group(1).lower() if tag_m else None,
                                  (), classes, (), (), (), ()))]
        overlay = overlay or any(p in raw for p in _OVERLAY_PSEUDOS)
        spec = [raw.count("#"), len(_CLASS_TOKEN.findall(raw)) + raw.count("["),
                len(_TAG_ANYWHERE.findall(raw))]
    return _Selector(raw, parts, tuple(spec), supported, state_only, overlay)


# ---------------------------------------------------------------------------
# the document
# ---------------------------------------------------------------------------


@dataclass
class _El:
    tag: str
    classes: frozenset
    attrs: dict
    parent: object
    line: int
    text: str = ""
    ancestors: tuple = ()
    children: list = field(default_factory=list)
    index: int = 1                       # 1-based position among element siblings
    sibling_count: int = 1

    @property
    def prev_siblings(self):
        return self.parent.children[: self.index - 1] if self.parent else []

    @property
    def next_siblings(self):
        return self.parent.children[self.index:] if self.parent else []

    def label(self) -> str:
        names = sorted(self.classes)[:3]
        return self.tag + ("." + ".".join(names) if names else "")


class _Doc(html.parser.HTMLParser):
    """A tree, because contrast is the one question that needs ancestors."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.elements: list[_El] = []
        self.stack: list[_El] = []
        self._muted = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        d = {k.lower(): (v if v is not None else "") for k, v in attrs}
        el = _El(
            tag=tag,
            classes=frozenset(d.get("class", "").split()),
            attrs=d,
            parent=self.stack[-1] if self.stack else None,
            line=self.getpos()[0],
            ancestors=tuple(self.stack),
        )
        if el.parent is not None:
            el.parent.children.append(el)
            el.index = len(el.parent.children)
        self.elements.append(el)
        if tag not in _VOID:
            self.stack.append(el)
        if tag in _NON_RENDERING:
            self._muted += 1

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag.lower() not in _VOID and self.stack:
            self.stack.pop()

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in _NON_RENDERING:
            self._muted = max(0, self._muted - 1)
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        if not self._muted and self.stack and data.strip():
            self.stack[-1].text += data

    def close(self):
        super().close()
        for el in self.elements:
            for child in el.children:
                child.sibling_count = len(el.children)


# ---------------------------------------------------------------------------
# declarations, ordered the way a browser orders them
# ---------------------------------------------------------------------------


@dataclass
class _Cand:
    selector: _Selector
    property: str
    value: str
    important: bool
    order: int
    origin: str           # "design-system" | "artifact"
    source: str           # a human handle: "pai.css:545"
    at_rule: bool

    def key(self):
        return (self.important, self.selector.specificity, self.order)


def _collect(ds: DesignSystem, text: str, artifact_name: str):
    """-> (candidates, root custom properties)

    The design system comes first because the artifact loads ``pai.css`` with a
    ``<link>`` and writes its own ``<style>`` after it, so at equal specificity
    the artifact wins.  That is the browser's ordering, and it is also the
    ordering behind the `text-*` utility beating a component class (spec §4).
    """
    cands: list[_Cand] = []
    root: dict[str, str] = {}
    order = 0

    def add(decls, origin, name, line_offset=0):
        nonlocal order
        for d in decls:
            prop = d.property.strip()
            prop = prop if prop.startswith("--") else prop.lower()
            value = d.value.strip()
            important = value.lower().endswith("!important")
            if important:
                value = re.sub(r"!\s*important$", "", value, flags=re.I).strip()
            for part in _split_top_level(d.selector):
                if not part.strip():
                    continue
                if prop.startswith("--") and ":root" in part:
                    root[prop] = value
                cands.append(
                    _Cand(
                        selector=_parse_selector(part),
                        property=prop,
                        value=value,
                        important=important,
                        order=order,
                        origin=origin,
                        source=f"{name}:{line_offset + d.line}",
                        at_rule=bool(d.at_rules),
                    )
                )
                order += 1

    for path in ds.css_paths:
        with open(path, "r", encoding="utf-8") as fh:
            decls, _c, _a = parse_css(fh.read())
        add(decls, "design-system", os.path.basename(path))

    for block in _STYLE_BLOCK.finditer(text):
        offset = text.count("\n", 0, block.start("body"))
        decls, _c, _a = parse_css(block.group("body"))
        add(decls, "artifact", artifact_name, offset)
    return cands, root


# ---------------------------------------------------------------------------
# Tailwind utilities
# ---------------------------------------------------------------------------

#: utility prefix → the theme keys it reads, in the order Tailwind tries them,
#: and the CSS property each one sets.  Tailwind's public API, not the design
#: system's vocabulary: the *members* are read from the config at runtime, only
#: the prefix→property mapping is written down, exactly as in rules.py.
_TW_UTILITY = {
    "text": (("colors", "color"), ("fontSize", "font-size")),
    "bg": (("colors", "background-color"), ("backgroundImage", "background-image")),
    "font": (("fontWeight", "font-weight"),),
    "opacity": (("opacity", "opacity"),),
}
#: the options object on a fontSize entry, mapped to the properties it sets
_TW_FONT_OPTIONS = {"fontWeight": "font-weight", "lineHeight": "line-height",
                    "letterSpacing": "letter-spacing"}
_TW_ARBITRARY = re.compile(r"^(?P<prefix>[a-z-]+)-\[(?P<value>.+)\]$", re.I)
_TW_ALPHA = re.compile(r"^(?P<base>.+?)/(?P<alpha>\d{1,3})$")


def _utility_selector(cls: str) -> _Selector:
    """A single-class selector built directly, because a Tailwind class can
    contain characters (``[`` ``#`` ``/``) that make a written selector
    undecidable while the class itself is perfectly ordinary."""
    return _Selector(
        text=f".{cls}",
        parts=[(None, _Compound(classes=frozenset({cls})))],
        specificity=(0, 1, 0),
        supported=True,
        state_only=False,
        overlay=False,
    )


def _apply_alpha(value: str, alpha: int) -> str:
    """Tailwind's ``/NN`` *replaces* a colour's alpha rather than multiplying it
    — the same fact rules.py gates ``token-alpha-replaced`` on."""
    rgba = _parse_rgba(value)
    if rgba is None:
        return value
    return "rgba(%g,%g,%g,%g)" % (rgba[0], rgba[1], rgba[2], alpha / 100.0)


def _tailwind_candidates(ds: DesignSystem, classes: set, start_order: int):
    """Candidates for the utility classes this document actually uses.

    The Tailwind CDN appends its ``<style>`` to ``<head>``, after both the
    design-system ``<link>`` and the artifact's own ``<style>``, so at equal
    specificity a utility wins.  Ordering them last is what makes that true here
    — and it is the same cascade fact behind spec §4's ``text-*`` utility
    out-specifying a component class.
    """
    out: list[_Cand] = []
    order = start_order

    def emit(cls, prop, value, at_rule):
        nonlocal order
        out.append(
            _Cand(
                selector=_utility_selector(cls),
                property=prop,
                value=str(value),
                important=cls.lstrip().startswith("!"),
                order=order,
                origin="artifact",       # the screen chose to write this class
                source=f"tailwind utility {cls}",
                at_rule=at_rule,
            )
        )
        order += 1

    for cls in sorted(classes):
        variants, _sep, utility = cls.rpartition(":")
        parts = [v for v in variants.split(":") if v]
        if any(v.lstrip("!") in _STATE_PSEUDOS for v in parts):
            continue                      # not the resting appearance
        # a responsive or scheme variant depends on a media query, so it is
        # reported as undecidable rather than applied or ignored
        at_rule = bool(parts)
        utility = utility.lstrip("!")

        arb = _TW_ARBITRARY.match(utility)
        if arb:
            prefix, value = arb.group("prefix"), arb.group("value").replace("_", " ")
            for key, prop in _TW_UTILITY.get(prefix, ()):
                if key == "colors" and _parse_rgba(value) is None:
                    continue
                if key == "fontSize" and _parse_rgba(value) is not None:
                    continue
                emit(cls, prop, value, at_rule)
                break
            continue

        for prefix, lookups in _TW_UTILITY.items():
            if not utility.startswith(prefix + "-"):
                continue
            rest = utility[len(prefix) + 1:]
            alpha = None
            m = _TW_ALPHA.match(rest)
            for key, prop in lookups:
                members = ds.theme.get(key)
                if not isinstance(members, dict):
                    continue
                name, alpha = rest, None
                if name not in members and m and m.group("base") in members:
                    name, alpha = m.group("base"), int(m.group("alpha"))
                if name not in members:
                    continue
                raw = members[name]
                if isinstance(raw, list):
                    # a fontSize entry: ["1rem", {lineHeight, fontWeight, …}]
                    emit(cls, prop, raw[0], at_rule)
                    for opt in raw[1:]:
                        if isinstance(opt, dict):
                            for k, v in opt.items():
                                if k in _TW_FONT_OPTIONS:
                                    emit(cls, _TW_FONT_OPTIONS[k], v, at_rule)
                    break
                value = str(raw)
                if alpha is not None:
                    resolved = ds.token_value(_VAR_CALL.match(value).group(1)[2:]) \
                        if _VAR_CALL.match(value) else value
                    value = _apply_alpha(resolved or value, alpha)
                emit(cls, prop, value, at_rule)
                break
            break
    return out


# ---------------------------------------------------------------------------
# matching
# ---------------------------------------------------------------------------


def _attr_matches(a: _Attr, el: _El) -> bool:
    if a.name not in el.attrs:
        return False
    if a.op is None:
        return True
    got, want = el.attrs[a.name], a.value or ""
    if a.op == "=":
        return got == want
    if a.op == "~=":
        return want in got.split()
    if a.op == "^=":
        return got.startswith(want)
    if a.op == "$=":
        return got.endswith(want)
    if a.op == "*=":
        return want in got
    if a.op == "|=":
        return got == want or got.startswith(want + "-")
    return False


def _nth_matches(arg: str, index: int) -> bool:
    arg = arg.strip().lower().replace(" ", "")
    if arg == "odd":
        a, b = 2, 1
    elif arg == "even":
        a, b = 2, 0
    else:
        m = re.match(r"^([+-]?\d*)n([+-]\d+)?$|^([+-]?\d+)$", arg)
        if not m:
            raise _Unsupported(arg)
        if m.group(3) is not None:
            return index == int(m.group(3))
        raw = m.group(1)
        a = 1 if raw in ("", "+") else -1 if raw == "-" else int(raw)
        b = int(m.group(2) or 0)
    if a == 0:
        return index == b
    return (index - b) % a == 0 and (index - b) // a >= 0


def _matches_compound(c: _Compound, el: _El) -> bool:
    if c.tag and c.tag != el.tag:
        return False
    if not c.classes <= el.classes:
        return False
    if any(el.attrs.get("id") != i for i in c.ids):
        return False
    if any(not _attr_matches(a, el) for a in c.attrs):
        return False
    for name, arg in c.structural:
        if name == "root":
            if el.parent is not None:
                return False
        elif name == "first-child" or name == "first-of-type":
            if el.index != 1:
                return False
        elif name == "last-child" or name == "last-of-type":
            if el.index != el.sibling_count:
                return False
        elif name in ("only-child", "only-of-type"):
            if el.sibling_count != 1:
                return False
        elif name == "empty":
            if el.children or el.text.strip():
                return False
        elif _NTH.match(name):
            index = el.index if name == "nth-child" else el.sibling_count - el.index + 1
            if not _nth_matches(arg, index):
                return False
    if any(_matches_compound(n, el) for n in c.nots):
        return False
    for lead, parts in c.has:
        if not _has_match(lead, parts, el):
            return False
    return True


def _has_match(lead: str, parts, el: _El) -> bool:
    pool = el.children if lead == ">" else _descendants(el)
    if lead == "+":
        pool = el.next_siblings[:1]
    elif lead == "~":
        pool = el.next_siblings
    return any(_matches_parts(parts, len(parts) - 1, cand, stop=el) for cand in pool)


def _descendants(el: _El):
    out = []
    stack = list(el.children)
    while stack:
        node = stack.pop()
        out.append(node)
        stack.extend(node.children)
    return out


def _matches_parts(parts, i, el: _El, stop: _El | None = None) -> bool:
    comb, compound = parts[i]
    if not _matches_compound(compound, el):
        return False
    if i == 0:
        return True
    link = parts[i][0]
    if link == ">":
        return el.parent is not None and el.parent is not stop and _matches_parts(
            parts, i - 1, el.parent, stop
        )
    if link == "+":
        prev = el.prev_siblings[-1:] if el.prev_siblings else []
        return bool(prev) and _matches_parts(parts, i - 1, prev[0], stop)
    if link == "~":
        return any(_matches_parts(parts, i - 1, s, stop) for s in el.prev_siblings)
    for anc in reversed(el.ancestors):
        if anc is stop:
            break
        if _matches_parts(parts, i - 1, anc, stop):
            return True
    return False


def _matches(sel: _Selector, el: _El) -> bool:
    try:
        return _matches_parts(sel.parts, len(sel.parts) - 1, el)
    except _Unsupported:
        return False


def _reaches(sel: _Selector, el: _El) -> bool:
    """Could an *undecidable* selector be setting a property on this element?

    Only the selector's subject decides which elements a rule paints; the parts
    before it merely constrain.  So the question is whether the subject could be
    this element — not whether the selector mentions anything nearby, which was
    loose enough to have one ``:has()`` in ``pai.css`` taint every text element
    on the page.
    """
    return _matches_compound(sel.subject, el)


# ---------------------------------------------------------------------------
# resolution
# ---------------------------------------------------------------------------


@dataclass
class _Value:
    value: str
    source: str
    origin: str


class _Resolver:
    def __init__(self, cands: list[_Cand], root: dict[str, str]):
        self.root = root
        self.by_key: dict[str, list[_Cand]] = {}
        self.undecidable: list[_Cand] = []
        self.behind_at_rule: list[_Cand] = []
        self.overlays: list[_Cand] = []
        for c in cands:
            sel = c.selector
            if sel.overlay:
                self.overlays.append(c)
            elif sel.state_only:
                continue                       # not the resting appearance
            elif not sel.supported:
                self.undecidable.append(c)
            elif c.at_rule:
                self.behind_at_rule.append(c)
            else:
                subject = sel.subject
                for key in (subject.classes or {subject.tag or "*"}):
                    self.by_key.setdefault(key, []).append(c)
        self._cache: dict = {}

    # -- one property on one element, no inheritance ------------------------

    def declared(self, el: _El, prop: str) -> _Value | None:
        cache_key = (id(el), prop)
        if cache_key in self._cache:
            return self._cache[cache_key]
        best = None
        for k in tuple(el.classes) + (el.tag, "*"):
            for c in self.by_key.get(k, ()):
                if c.property != prop:
                    continue
                if best is not None and c.key() <= best.key():
                    continue
                if _matches(c.selector, el):
                    best = c
        out = _Value(best.value, best.source, best.origin) if best else None

        # a style= attribute beats every stylesheet rule that is not !important
        for part in _split_top_level(el.attrs.get("style", ""), ";"):
            name, sep, value = part.partition(":")
            if not sep or not value.strip():
                continue
            name = name.strip()
            name = name if name.startswith("--") else name.lower()
            if name == prop and not (best and best.important):
                out = _Value(value.strip(), f"{el.label()} style= (line {el.line})",
                             "artifact")
        self._cache[cache_key] = out
        return out

    def inherited(self, el: _El, prop: str):
        """-> (element the value came from, value) walking up the tree."""
        node = el
        while node is not None:
            got = self.declared(node, prop)
            if got is not None and normalise_value(got.value) not in (
                "inherit", "unset", "initial", "revert"
            ):
                return node, got
            node = node.parent
        return None, None

    # -- what could not be decided -----------------------------------------

    def undecidable_for(self, chain, props) -> list[str]:
        """Rules that could overturn a resolved value somewhere on ``chain``.

        ``chain`` is the run of elements the value actually came through — the
        element itself up to whichever ancestor supplied it.  A rule that paints
        an ancestor *above* that one is behind an opaque background and changes
        nothing, and a rule whose subject cannot be any element on the chain
        never reaches it at all.
        """
        out = []
        for c in self.undecidable:
            if c.property not in props:
                continue
            if any(_reaches(c.selector, el) for el in chain):
                out.append(f"`{c.selector.text}` sets {c.property} and this reader "
                           f"cannot decide the selector ({c.source})")
        for c in self.behind_at_rule:
            if c.property not in props:
                continue
            if any(_matches(c.selector, el) for el in chain):
                out.append(f"`{c.selector.text}` sets {c.property} behind an at-rule "
                           f"({c.source})")
        return sorted(set(out))

    def overlay_on(self, chain) -> str | None:
        """A ::before/::after painting over anything between the text and the
        background it was resolved against."""
        for c in self.overlays:
            if c.property not in _BACKGROUND_PROPS:
                continue
            if normalise_value(c.value) in _ABSENT:
                continue
            if not c.selector.supported:
                continue
            if any(_matches(c.selector, el) for el in chain):
                return f"{c.selector.text} ({c.source})"
        return None

    def backdrop_undecidable(self, chain) -> str | None:
        """A positioned sibling painting *between* the text and its background.

        The ancestor walk assumes what is behind the text is an ancestor's
        background.  An absolutely positioned sibling breaks that — a video plate
        under a translucent scrim, a decorative panel — and no ordering of the
        parse tree says which one wins.  Two limits keep this from firing on
        everything:

        * ``chain`` excludes the element that supplied the background.  A sibling
          of *that* one is painted underneath an opaque fill and changes nothing
          — which is what stops a modal's scrim from making every line inside the
          modal unreadable to this reader.
        * the sibling must be pinned to all four edges.  A close button in a
          corner is positioned too, and whether it lands on any given line is
          laid-out geometry: phase 2, named there rather than guessed at here.
        """
        for node in chain:
            for sib in (node.prev_siblings + node.next_siblings):
                pos = self.declared(sib, "position")
                if pos is None or normalise_value(pos.value) not in ("absolute", "fixed"):
                    continue
                if self._full_bleed(sib) and self._paints(sib):
                    return (f"`{sib.label()}` is positioned over this and paints its own "
                            f"backdrop, so what is behind the text is not decided by the "
                            f"parse tree ({pos.source})")
        return None

    def _full_bleed(self, el: _El) -> bool:
        """Pinned to all four edges, so it covers whatever is behind it."""
        inset = self.declared(el, "inset")
        if inset is not None and all(
            _parse_scalar(c) and _parse_scalar(c)[1] == 0
            for c in _split_components(normalise_value(inset.value))
        ):
            return True
        sides = []
        for prop in ("top", "right", "bottom", "left"):
            got = self.declared(el, prop)
            s = _parse_scalar(normalise_value(got.value)) if got else None
            sides.append(s is not None and s[1] == 0)
        if all(sides):
            return True
        if sides[0] and sides[3]:
            w = self.declared(el, "width")
            h = self.declared(el, "height")
            full = {"100%"}
            return bool(w and h and normalise_value(w.value) in full
                        and normalise_value(h.value) in full)
        return False

    def _paints(self, el: _El) -> bool:
        if el.tag in ("img", "video", "canvas", "svg", "picture"):
            return True
        if any(d.tag in ("img", "video", "canvas", "svg", "picture")
               for d in _descendants(el)):
            return True
        for prop in sorted(_BACKGROUND_PROPS):
            got = self.declared(el, prop)
            if got is not None and normalise_value(got.value) not in _ABSENT:
                return True
        return self.overlay_on([el]) is not None

    # -- custom properties --------------------------------------------------

    def expand(self, el: _El, value: str, depth: int = 0):
        """Substitute ``var(--x)`` from this element's inherited custom
        properties, then from ``:root``.  ``None`` when a reference dangles and
        has no fallback — which is a rendering fact, not a guess."""
        if el is None or depth > 8:
            return value
        m = _VAR_CALL.search(value)
        if not m:
            return value
        name, fallback = m.group(1), m.group(2)
        found = None
        node = el
        while node is not None and found is None:
            got = self.declared(node, name)
            if got is not None:
                found = got.value
            node = node.parent
        if found is None:
            found = self.root.get(name)
        if found is None:
            found = fallback.strip() if fallback and fallback.strip() else None
        if found is None:
            return None
        return self.expand(el, value[: m.start()] + found + value[m.end():], depth + 1)


# ---------------------------------------------------------------------------
# the pair
# ---------------------------------------------------------------------------


@dataclass
class Pair:
    fg_raw: tuple                 # as written, alpha kept
    fg_written: str
    fg_source: str
    fg_origin: str
    backgrounds: list             # opaque rgba, one per gradient stop
    bg_written: str
    bg_source: str
    bg_origin: str

    def composited(self, bg):
        return _over(self.fg_raw, bg)

    @property
    def worst(self):
        """-> (ratio, background) for the stop the text does worst against."""
        return min(
            ((contrast_ratio(self.composited(b), b), b) for b in self.backgrounds),
            key=lambda t: t[0],
        )

    @property
    def authored(self) -> bool:
        """Did the screen write either end, or is the whole pair published?"""
        return "artifact" in (self.fg_origin, self.bg_origin)


@dataclass
class TextElement:
    line: int
    label: str
    text: str
    pair: Pair | None = None
    font_px: float | None = None
    font_weight: int | None = None
    overlay: str | None = None
    unresolved: list = field(default_factory=list)

    @property
    def large(self):
        """True / False, or None when the size or weight could not be resolved."""
        if self.font_px is None:
            return None
        if self.font_px >= LARGE_PX:
            return True
        if self.font_px < LARGE_BOLD_PX:
            return False
        if self.font_weight is None:
            return None
        return self.font_weight >= BOLD_WEIGHT


@dataclass
class Cascade:
    texts: list
    #: elements never considered: hidden, or a WCAG-exempt inactive control
    skipped: int = 0


# ---------------------------------------------------------------------------


def _weight_number(value: str):
    v = normalise_value(value)
    if v == "normal":
        return DEFAULT_WEIGHT
    if v == "bold":
        return BOLD_WEIGHT
    s = _parse_scalar(v)
    return int(s[1]) if s and s[0] == "number" else None


def _font_px(r: _Resolver, el: _El):
    """font-size in px, following em/% up the tree.  ``None`` when a step in the
    chain cannot be resolved."""
    node, relative = el, []
    while node is not None:
        got = r.declared(node, "font-size")
        if got is None or normalise_value(got.value) == "inherit":
            node = node.parent
            continue
        expanded = r.expand(node, got.value)
        if expanded is None:
            return None
        s = _parse_scalar(expanded)
        if s is None:
            return None
        if s[0] == "px":
            base = s[1]
            break
        if s[0] == "percent":
            relative.append(s[1] / 100.0)
            node = node.parent
            continue
        return None
    else:
        base = DEFAULT_ROOT_PX
    for factor in relative:
        base *= factor
    return base


def _chain(el: _El, upto: _El | None):
    """The elements a value came through: ``el`` up to and including ``upto``."""
    out = [el]
    node = el
    while node is not upto and node.parent is not None:
        node = node.parent
        out.append(node)
    return out


def _background_of(r: _Resolver, el: _El):
    """-> (stops, written, source, origin, node, reasons)

    Walks up from the element compositing translucent layers onto what is behind
    them, and stops at the first opaque one.  ``stops`` is a list because a
    gradient is a range.  ``None`` with reasons when a layer cannot be read.
    """
    layers: list[tuple] = []       # translucent layers, nearest first
    written = source = origin = None
    node = el
    while node is not None:
        top = None
        for prop in ("background-color", "background", "background-image"):
            got = r.declared(node, prop)
            if got is None:
                continue
            if top is None or prop == "background-image":
                top = got
            elif prop == "background" and normalise_value(top.value) in _ABSENT:
                top = got
        if top is None:
            node = node.parent
            continue
        expanded = r.expand(node, top.value)
        if expanded is None:
            return None, top.value, top.source, top.origin, node, [
                f"the background references an undefined custom property "
                f"({top.source})"
            ]
        if _URL_RE.search(expanded):
            return None, top.value, top.source, top.origin, node, [
                f"the background is an image, so what sits behind the text is not "
                f"in the source ({top.source})"
            ]
        if normalise_value(expanded) in _ABSENT:
            node = node.parent
            continue

        stops = _gradient_stops(expanded)
        if stops is not None:
            colours = [_parse_rgba(s) for s in stops]
            if any(c is None for c in colours):
                return None, top.value, top.source, top.origin, node, [
                    f"a gradient stop could not be read as a colour ({top.source})"
                ]
        else:
            colours = []
            for comp in _split_components(expanded):
                c = _parse_rgba(comp)
                if c is not None:
                    colours = [c]
                    break
            if not colours:
                node = node.parent
                continue

        if written is None:
            written, source, origin = top.value, top.source, top.origin
        if all(c[3] >= 0.999 for c in colours):
            for layer in reversed(layers):
                colours = [_over(layer, c) for c in colours]
            return colours, written, source, origin, node, []
        if len(colours) > 1:
            return None, written, source, origin, node, [
                f"a translucent gradient sits over another background; compositing "
                f"it needs a browser ({top.source})"
            ]
        layers.append(colours[0])
        node = node.parent
    return None, written, source, origin, None, [
        "nothing in the ancestor chain declares an opaque background, so the text "
        "sits on the browser's canvas colour rather than on anything the source "
        "chose"
    ]


def _hidden(r: _Resolver, el: _El) -> bool:
    node = el
    while node is not None:
        if node.attrs.get("hidden") is not None:
            return True
        if node.attrs.get("aria-hidden", "").lower() == "true":
            return True
        # SC 1.4.3 exempts inactive user-interface components
        if node.attrs.get("disabled") is not None:
            return True
        if node.classes & _TW_INVISIBLE:
            return True
        got = r.declared(node, "display")
        if got is not None and normalise_value(got.value) == "none":
            return True
        got = r.declared(node, "visibility")
        if got is not None and normalise_value(got.value) == "hidden":
            return True
        node = node.parent
    return False


def _disturbances(r: _Resolver, el: _El) -> list[str]:
    """Things that change what actually composites and cannot be computed here."""
    out = []
    node = el
    while node is not None:
        got = r.declared(node, "opacity")
        if got is not None:
            s = _parse_scalar(normalise_value(got.value))
            if s and s[1] < 0.999:
                out.append(f"opacity {got.value} on `{node.label()}` changes what "
                           f"composites ({got.source})")
        for prop, phrase in (("filter", "a filter"),
                             ("mix-blend-mode", "a blend mode"),
                             ("backdrop-filter", "a backdrop filter")):
            got = r.declared(node, prop)
            if got is not None and normalise_value(got.value) not in _ABSENT:
                out.append(f"{phrase} on `{node.label()}` changes what composites "
                           f"({got.source})")
        node = node.parent
    return out


def read(html_path: str, ds: DesignSystem) -> Cascade:
    """Every element that renders text, with its resolved pair or its reasons."""
    with open(html_path, "r", encoding="utf-8", errors="replace") as fh:
        text = fh.read()

    doc = _Doc()
    doc.feed(text)
    doc.close()

    cands, root = _collect(ds, text, os.path.basename(html_path))
    used_classes = set()
    for el in doc.elements:
        used_classes |= el.classes
    cands += _tailwind_candidates(ds, used_classes, len(cands))
    for name, value in ds.tokens.items():
        root.setdefault("--" + name, value)     # the artifact's :root wins
    r = _Resolver(cands, root)

    out: list[TextElement] = []
    skipped = 0
    for el in doc.elements:
        if not el.text.strip() or el.tag in _NON_RENDERING:
            continue
        if _hidden(r, el):
            skipped += 1
            continue

        te = TextElement(line=el.line, label=el.label(),
                         text=" ".join(el.text.split())[:60])
        # opacity, filters and blend modes apply from anywhere above, so the
        # whole chain is in play for them
        whole = _chain(el, None)
        te.unresolved.extend(
            r.undecidable_for(whole, _DISTURBING_PROPS)[:2]
        )
        te.unresolved.extend(_disturbances(r, el)[:2])
        te.font_px = _font_px(r, el)
        w_node, w_got = r.inherited(el, "font-weight")
        te.font_weight = (
            _weight_number(r.expand(w_node, w_got.value) or "") if w_got
            else DEFAULT_WEIGHT
        )

        fg_node, fg_got = r.inherited(el, "-webkit-text-fill-color")
        if fg_got is None:
            fg_node, fg_got = r.inherited(el, "color")
        if fg_got is None:
            te.unresolved.append("no rule in the source sets a text colour here, so it "
                                 "comes from the user agent")
            out.append(te)
            continue
        fg_value = r.expand(fg_node, fg_got.value)
        if fg_value is None:
            te.unresolved.append(f"the text colour references an undefined custom "
                                 f"property ({fg_got.source})")
            out.append(te)
            continue
        if normalise_value(fg_value) == "currentcolor":
            te.unresolved.append("the text colour is currentColor with nothing above it "
                                 "to inherit from")
            out.append(te)
            continue
        if _GRADIENT_RE.search(fg_value):
            te.unresolved.append("the text is painted with a gradient fill")
            out.append(te)
            continue
        fg = _parse_rgba(fg_value)
        if fg is not None and fg[3] < 0.005:
            # `color: transparent` with `background-clip: text` paints the glyphs
            # with the element's own background — a gradient, usually — and the
            # ratio against that gradient is a different sum this reader cannot
            # do.  Without the clip it is invisible text, which is a finding this
            # check does not own.
            clip = (r.declared(el, "background-clip")
                    or r.declared(el, "-webkit-background-clip"))
            te.unresolved.append(
                "the glyphs are painted by a background clipped to the text"
                if clip is not None and normalise_value(clip.value) == "text"
                else "the text colour is fully transparent"
            )
            out.append(te)
            continue
        if fg is None:
            te.unresolved.append(f"the text colour {normalise_value(fg_value)!r} is not "
                                 f"a colour this reader can parse ({fg_got.source})")
            out.append(te)
            continue

        stops, bg_written, bg_source, bg_origin, bg_node, reasons = _background_of(r, el)
        if stops is None:
            te.unresolved.extend(reasons)
            out.append(te)
            continue

        bg_chain = _chain(el, bg_node)
        te.overlay = r.overlay_on(bg_chain)
        backdrop = r.backdrop_undecidable(bg_chain[:-1])
        if backdrop:
            te.unresolved.append(backdrop)

        # A rule this reader cannot decide only matters where it could have won:
        # on the run of elements the value actually came through.
        te.unresolved.extend(
            r.undecidable_for(_chain(el, fg_node), _COLOUR_PROPS)[:2]
        )
        te.unresolved.extend(
            r.undecidable_for(bg_chain, _BACKGROUND_PROPS)[:2]
        )

        te.pair = Pair(
            fg_raw=fg,
            fg_written=normalise_value(fg_got.value),
            fg_source=fg_got.source,
            fg_origin=fg_got.origin,
            backgrounds=stops,
            bg_written=normalise_value(bg_written or ""),
            bg_source=bg_source or "",
            bg_origin=bg_origin or "design-system",
        )
        out.append(te)
    return Cascade(texts=out, skipped=skipped)

"""rules — the phase-1 source checks.  Spec: docs/lint-spec.md section 4.

Everything the design system knows is read from ``design-system/`` at runtime by
:mod:`dsparse`.  Nothing here names a colour, a class, a radius or a design-system
property.  The only things written down are CSS-spec and Tailwind-API facts —
what a colour looks like syntactically, which utility prefix sets which CSS
property, how sRGB converts to CIE Lab.  None of it goes stale when the design
system changes.

**The rule that decides everything** (spec section 1): the linter may only emit an
error when it can name what should have been written instead.  That lives in
exactly one function, :func:`_evaluate`, and one invariant enforced in
:meth:`Finding.__post_init__`::

    bucket == "error"  ⟺  design_system_offers is non-empty

Every rule flows through it.  Monospace and a custom animation fall out as
extensions with nothing special-cased: their vocabularies are unordered, so
``_nearest`` returns ``None``, so no replacement can be named, so they cannot
block.  The same code path makes ``border-radius`` flip from proposal to error
the day radius tokens land, because the flip happens inside ``dsparse``.

Public surface::

    check(html_path, ds) -> list[Finding]
    Finding(rule, bucket, property, value, found, design_system_offers,
            origin, where)
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass, field

from cascade import hexof, read
from dsparse import (
    DesignSystem,
    Vocabulary,
    _camel_to_kebab,
    _member_options,
    _parse_rgba,
    _parse_scalar,
    _split_components,
    _split_top_level,
    classify_value,
    malformations,
    normalise_value,
    parse_css,
)

__all__ = ["check", "Finding", "BUCKETS", "malformed_findings"]

BUCKETS = ("error", "proposal", "extension")


# ---------------------------------------------------------------------------
# policy constants — the two numbers this module chooses
# ---------------------------------------------------------------------------

#: CIE Lab ΔE (CIE76) below which a written colour is treated as a near-miss for
#: a published one, i.e. the linter is willing to say "you meant this".  The
#: spike found 5 to be a sharp cliff: below it the hits are transcription drift,
#: above it they are colours the palette genuinely does not carry.
DELTA_E_MAX = 5.0

#: Alpha is 0–1 while Lab L is 0–100, so an alpha delta is scaled onto the same
#: range before being added to ΔE.  A hairline at 6% opacity and a scrim at 50%
#: are not near-misses for each other however close their RGB.
ALPHA_WEIGHT = 100.0

#: Edit distance at which a dangling ``var(--x)`` is treated as a typo of a real
#: token — i.e. the linter can name the replacement — rather than a reference to
#: something the system has no token for.
VAR_NAME_TYPO_DISTANCE = 2

# How far a length or number may sit from a published member and still be read
# as a slip rather than a deliberate value the system has no word for.
# 0.15 makes 15px-vs-16px a slip and 96px-vs-36px a decision.
SCALAR_SLIP_RATIO = 0.15
SCALAR_ABSOLUTE_SLIP = 1.0

# Rules exempt from the error-iff-replacement invariant: the reference is
# broken, so the declaration does not render at all.  Nothing to offer, and
# nothing to think about.
#
# The malformed:* rules are the same case one level up.  A stylesheet that does
# not parse has no declaration to name a replacement for — the rules are still
# in the file and the browser never received them.  The repair is to close the
# comment or balance the brace, and the finding says which.
BROKEN_REFERENCE = frozenset({
    "dangling-var",
    "malformed:unclosed-comment",
    "malformed:stray-close-brace",
    "malformed:unclosed-block",
})

# Values that mean "no value" rather than a design choice.  CSS-spec knowledge,
# not design-system knowledge: these words mean the same thing in every
# stylesheet ever written, and no design system will ever publish a token for
# them.  Anything here is skipped before the bucket split.
_NOT_A_DESIGN_DECISION = frozenset({
    "inherit", "initial", "unset", "revert", "revert-layer",
    "none", "auto", "normal", "transparent", "currentcolor",
})

#: Structural values, not design decisions.  A percentage, a grid fraction or a
#: bare flex/opacity number describes how a box relates to its container - no
#: design system publishes a token for ``100%``.  Without this the tally is led
#: by ``width: 100%`` on 82 screens, which nobody would ever tokenise.
_STRUCTURAL_RE = re.compile(r"^-?\d*\.?\d+(%|fr|vh|vw|vmin|vmax)$")
_STRUCTURAL_PROPERTIES = frozenset({
    "flex", "flex-grow", "flex-shrink", "order", "z-index", "opacity",
    "grid-template-columns", "grid-template-rows", "grid-column", "grid-row",
    "line-clamp", "aspect-ratio",
})


# ---------------------------------------------------------------------------
# residual hardcoding — Tailwind's own API, not the design system's vocabulary
# ---------------------------------------------------------------------------

#: Utility prefix → the CSS property it sets.  A mapping is either a single
#: property or, where Tailwind overloads a prefix, a per-value-type table with a
#: ``*`` default.  This is Tailwind's public API and does not change when
#: ``design-system/`` changes; an entry missing here degrades a finding to the
#: prefix as its own property label, which lands it in the silent column — never
#: in a false error.
_TW_PREFIX_PROPERTY: dict[str, object] = {
    "bg": {"color": "background-color", "gradient": "background-image",
           "*": "background-color"},
    "text": {"color": "color", "length": "font-size", "number": "font-size",
             "*": "color"},
    "border": {"color": "border-color", "length": "border-width",
               "*": "border-color"},
    "border-t": {"color": "border-top-color", "*": "border-top-width"},
    "border-r": {"color": "border-right-color", "*": "border-right-width"},
    "border-b": {"color": "border-bottom-color", "*": "border-bottom-width"},
    "border-l": {"color": "border-left-color", "*": "border-left-width"},
    "ring": {"color": "box-shadow", "*": "box-shadow"},
    "outline": {"color": "outline-color", "*": "outline-width"},
    "divide": {"color": "border-color", "*": "border-width"},
    "placeholder": "color",
    "caret": "caret-color",
    "accent": "accent-color",
    "fill": "fill",
    "stroke": {"color": "stroke", "*": "stroke-width"},
    "from": "background-image",
    "via": "background-image",
    "to": "background-image",
    "shadow": {"color": "box-shadow", "*": "box-shadow"},
    "font": {"number": "font-weight", "*": "font-family"},
    "rounded": "border-radius",
    "rounded-t": "border-radius",
    "rounded-b": "border-radius",
    "rounded-l": "border-radius",
    "rounded-r": "border-radius",
    "rounded-tl": "border-radius",
    "rounded-tr": "border-radius",
    "rounded-bl": "border-radius",
    "rounded-br": "border-radius",
    "rounded-full": "border-radius",
    "p": "padding", "px": "padding", "py": "padding",
    "pt": "padding-top", "pr": "padding-right",
    "pb": "padding-bottom", "pl": "padding-left",
    "m": "margin", "mx": "margin", "my": "margin",
    "mt": "margin-top", "mr": "margin-right",
    "mb": "margin-bottom", "ml": "margin-left",
    "gap": "gap", "gap-x": "column-gap", "gap-y": "row-gap",
    "space-x": "margin-left", "space-y": "margin-top",
    "w": "width", "h": "height", "size": "width",
    "min-w": "min-width", "max-w": "max-width",
    "min-h": "min-height", "max-h": "max-height",
    "top": "top", "right": "right", "bottom": "bottom", "left": "left",
    "inset": "inset", "inset-x": "inset", "inset-y": "inset",
    "z": "z-index",
    "opacity": "opacity",
    "leading": "line-height",
    "tracking": "letter-spacing",
    "indent": "text-indent",
    "underline-offset": "text-underline-offset",
    "decoration": {"color": "text-decoration-color",
                   "*": "text-decoration-thickness"},
    "duration": "transition-duration",
    "delay": "transition-delay",
    "ease": "transition-timing-function",
    "translate-x": "translate", "translate-y": "translate",
    "grid-cols": "grid-template-columns",
    "grid-rows": "grid-template-rows",
    "col-span": "grid-column", "row-span": "grid-row",
    "basis": "flex-basis",
    "blur": "filter", "backdrop-blur": "backdrop-filter",
    "order": "order",
}

_TW_PREFIXES_BY_LENGTH = sorted(_TW_PREFIX_PROPERTY, key=len, reverse=True)

#: A Tailwind class, after variants (``hover:``), an important marker (``!``) and
#: a negative sign have been stripped.
_TW_ARBITRARY_RE = re.compile(r"^(?P<prefix>.+?)-\[(?P<value>.+)\]$")
#: a step on a numeric scale (``p-4``, ``gap-1.5``, ``w-1/2``) as opposed to a
#: keyword utility (``w-full``, ``ml-auto``).  Only a step could ever become a
#: design-system value.
_SCALE_STEP_RE = re.compile(r"^\d+(?:\.\d+)?(?:/\d+)?$")
_TW_OPACITY_RE = re.compile(r"^(?P<base>.+?)/(?P<alpha>\d{1,3})$")

_VAR_REF_RE = re.compile(r"var\(\s*(--[\w-]+)\s*(,)?", re.I)
_TAG_RE = re.compile(
    r"<(?P<tag>[a-zA-Z][\w:-]*)(?P<attrs>(?:\"[^\"]*\"|'[^']*'|[^>\"'])*)>"
)
_ATTR_RE = re.compile(
    r"(?P<name>[a-zA-Z_:][-\w:.]*)\s*=\s*(?P<q>[\"'])(?P<val>.*?)(?P=q)", re.S
)
_STYLE_BLOCK_RE = re.compile(
    r"<style\b[^>]*>(?P<body>.*?)</style\s*>", re.I | re.S
)
_SCRIPT_BLOCK_RE = re.compile(
    r"<script\b[^>]*>(?P<body>.*?)</script\s*>", re.I | re.S
)


# ---------------------------------------------------------------------------
# the finding
# ---------------------------------------------------------------------------


@dataclass
class Finding:
    rule: str
    bucket: str
    property: str
    value: str
    found: str | None = None
    design_system_offers: list[str] = field(default_factory=list)
    origin: str | None = None
    where: dict = field(default_factory=dict)
    #: a sentence a rule can attach when the (property, value) pair does not say
    #: enough on its own.  Extensions get theirs derived in pai-lint.py; contrast
    #: carries its own, because the threshold it was judged at and where the pair
    #: came from are not recoverable from the fields.
    note: str | None = None

    def __post_init__(self):
        if self.bucket not in BUCKETS:
            raise ValueError(f"unknown bucket {self.bucket!r}")
        # Spec section 1, enforced rather than asserted in prose: the linter may
        # only block when it can name what should have been written instead.
        #
        # BROKEN_REFERENCE rules are exempt, and the exemption is narrow.  A
        # var() pointing at nothing is not a vocabulary deviation that a nearer
        # member would settle — the declaration does not render at all.  It is
        # broken code, and blocking it needs no replacement to be nameable.
        if self.rule in BROKEN_REFERENCE:
            return
        if (self.bucket == "error") != bool(self.design_system_offers):
            raise ValueError(
                f"{self.rule}: bucket {self.bucket!r} with "
                f"{len(self.design_system_offers)} offers breaks the "
                "error-iff-replacement rule"
            )
        if self.origin is not None and self.bucket != "proposal":
            raise ValueError(f"{self.rule}: origin is for proposals only")

    @property
    def key(self):
        return (self.rule, self.bucket, self.property, self.value,
                self.where.get("line"), self.where.get("selector"))


# ---------------------------------------------------------------------------
# colour and scalar comparison
# ---------------------------------------------------------------------------


def _srgb_to_lab(rgb) -> tuple[float, float, float]:
    def linear(c):
        c = max(0.0, min(255.0, c)) / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (linear(c) for c in rgb[:3])
    x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041
    xn, yn, zn = 0.95047, 1.0, 1.08883

    def f(t):
        return t ** (1 / 3) if t > 0.008856 else (7.787 * t + 16.0 / 116.0)

    fx, fy, fz = f(x / xn), f(y / yn), f(z / zn)
    return (116.0 * fy - 16.0, 500.0 * (fx - fy), 200.0 * (fy - fz))


_LAB_CACHE: dict[str, tuple | None] = {}


def _lab_of(value: str):
    key = normalise_value(value)
    if key in _LAB_CACHE:
        return _LAB_CACHE[key]
    rgba = _parse_rgba(value)
    out = None if rgba is None else (_srgb_to_lab(rgba), rgba[3])
    _LAB_CACHE[key] = out
    return out


def _colour_distance(a: str, b: str) -> float | None:
    la, lb = _lab_of(a), _lab_of(b)
    if la is None or lb is None:
        return None
    (l1, a1, b1), alpha1 = la
    (l2, a2, b2), alpha2 = lb
    de = ((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2) ** 0.5
    return de + abs(alpha1 - alpha2) * ALPHA_WEIGHT


def _shadow_layers(value: str) -> tuple[str, ...] | None:
    """A shadow as a canonical multiset of layers.

    ``inset`` may be written at either end of a layer and the layers themselves
    are usually listed in whatever order they were transcribed, so two spellings
    of the same shadow do not compare equal as strings.  That is a syntax
    difference, not a design one.
    """
    if classify_value(value) != "shadow":
        return None
    layers = []
    for layer in _split_top_level(value):
        comps = [c for c in _split_components(layer) if c.lower() != "inset"]
        inset = "inset" if "inset" in layer.lower().split() else ""
        norm = []
        for c in comps:
            rgba = _parse_rgba(c)
            if rgba is not None:
                norm.append("rgba:%.0f,%.0f,%.0f,%.3f" % rgba)
                continue
            s = _parse_scalar(c)
            norm.append(f"{s[0]}:{s[1]:g}" if s else normalise_value(c))
        layers.append(inset + "|" + " ".join(norm))
    return tuple(sorted(layers))


def _same_value(a: str, b: str) -> bool:
    """Unit-aware equality.  ``18px`` and ``1.125rem`` are the same value, and a
    linter that says otherwise invents a defect out of a unit choice."""
    if normalise_value(a) == normalise_value(b):
        return True
    ra, rb = _parse_rgba(a), _parse_rgba(b)
    if ra is not None and rb is not None:
        return all(abs(x - y) < 0.5 for x, y in zip(ra[:3], rb[:3])) and (
            abs(ra[3] - rb[3]) < 0.005
        )
    sa, sb = _parse_scalar(a), _parse_scalar(b)
    if sa is not None and sb is not None:
        # 0.813rem is 13.008px: a rem-expressed scale step and the px the author
        # typed are the same decision, and a sub-pixel gap is not a defect.
        return sa[0] == sb[0] and abs(sa[1] - sb[1]) < 0.02
    la, lb = _shadow_layers(a), _shadow_layers(b)
    if la is not None and lb is not None:
        return la == lb
    return False


@dataclass
class _Near:
    name: str
    value: str
    distance: float


def _nearest(vocab: Vocabulary, value: str) -> _Near | None:
    """The member this value was probably meant to be, or ``None``.

    ``None`` is the whole of section 1's extension case: an unordered vocabulary
    (font stacks, animations, gradients, shadows, easings) can never name a
    replacement, and neither can an ordered one whose members are all too far
    away or of a different unit class.
    """
    if not vocab.ordered:
        return None
    if vocab.value_type == "color":
        best = None
        for name, member in vocab.entries.items():
            d = _colour_distance(value, member)
            if d is None:
                continue
            if best is None or d < best.distance:
                best = _Near(name, member, d)
        if best is None or best.distance > DELTA_E_MAX:
            return None
        return best
    target = _parse_scalar(value)
    if target is None:
        return None
    cls, mag = target
    best = None
    for name, member in sorted(vocab.entries.items()):
        cand = _parse_scalar(member)
        if cand is None or cand[0] != cls:
            continue  # different unit class: no ordering between them
        d = abs(mag - cand[1])
        if best is None or d < best.distance:
            best = _Near(name, member, d)
    if best is None:
        return None

    # §1: an error must name what was *meant*, not merely the closest member.
    # Without a cap, font-size:96px is told "use 2.25rem" and font-weight:900
    # "use 600" — neither is a slip, both are a value the system has no word
    # for, which is the proposal/extension column.
    cand_mag = _parse_scalar(best.value)[1]
    if not _within_slip_distance(mag, cand_mag):
        return None

    # A tie carries no signal: 11px is 1px from both 10px and 12px, and which
    # one wins depends on the order of keys in the Tailwind config.
    # Tie on distinct VALUES, not on entry names.  Two names for the same value
    # (Tailwind's DEFAULT and "2" are both 8px) is one answer, not an ambiguity.
    ties = {
        m for m in vocab.entries.values()
        if (c := _parse_scalar(m)) and c[0] == cls
        and abs(mag - c[1]) == best.distance
    }
    ties = {_parse_scalar(m)[1] for m in ties}
    if len(ties) > 1:
        return None
    return best


def _within_slip_distance(written: float, offered: float) -> bool:
    """Is the written value close enough to be a mistyped member?

    Relative, because the scale is not linear: 15px against 16px is a slip,
    96px against 36px is a decision.  Zero is handled separately since a
    ratio against it is meaningless.
    """
    if offered == 0:
        return abs(written) <= SCALAR_ABSOLUTE_SLIP
    return abs(written - offered) / abs(offered) <= SCALAR_SLIP_RATIO


# ---------------------------------------------------------------------------
# the single decision point
# ---------------------------------------------------------------------------


def _evaluate(ds: DesignSystem, prop: str, value: str, ctx: "_Ctx"):
    """-> (bucket, rule, offers) or ``None`` when the value conforms.

    The one place the error / proposal / extension split is made.  Every rule
    that does not already know its replacement comes through here.
    """
    # A CSS-wide keyword is not a design decision.  `transparent`, `none`,
    # `inherit`, `auto`, `currentColor` mean *the absence of a value*, so asking
    # the design system for a word for them is a category error — and it was a
    # loud one: a corpus roll-up put `transparent` on 32 screens and
    # `animation: none` on 18, as though the system had a gap.
    v = normalise_value(value).strip().lower()
    if v in _NOT_A_DESIGN_DECISION:
        return None
    if _STRUCTURAL_RE.match(v) or prop in _STRUCTURAL_PROPERTIES:
        return None

    vocab = ds.vocabulary_for(prop, value)
    if vocab is None:
        # The system is silent.  Inventing is allowed, and logged.
        return ("proposal", f"silent:{prop}", [])

    member = _member_of(vocab, value)
    if member is not None:
        # The value is published.  It is only a defect if the system offers a
        # *name* for it that is writable in the medium the author was writing
        # in — a --var for CSS, a utility class for a class attribute.  The type
        # ramp and the gradients are published only as class names, so demanding
        # a token that cannot be referenced from CSS is a false positive.
        offers = ctx.names_for(ds, prop, member, value)
        if offers:
            return ("error", "literal-equals-token", offers)
        return None

    near = _nearest(vocab, value)
    if near is None:
        # The system speaks about this property but has no member that fits, and
        # nothing can be named.  Not the author's fault.
        return ("extension", f"incomplete:{prop}", [])
    return ("error", f"near-miss:{vocab.value_type}", [ctx.offer(ds, prop, near)])


def _member_of(vocab: Vocabulary, value: str) -> str | None:
    for name, member in vocab.entries.items():
        if _same_value(value, member):
            return name
    return None


# ---------------------------------------------------------------------------
# where the author was writing — decides what a nameable replacement looks like
# ---------------------------------------------------------------------------


class _Ctx:
    """A medium.  Subclasses answer one question: given a design-system member,
    what would the author have written instead, here?"""

    def names_for(self, ds, prop, member_name, value) -> list[str]:
        raise NotImplementedError

    def offer(self, ds, prop, near: _Near) -> str:
        raise NotImplementedError


class _CssCtx(_Ctx):
    """Inside a CSS declaration: the replacement is ``var(--tok)`` if a :root
    token carries the value, otherwise the literal value itself.

    Several tokens can share a value, and offering ``var(--bg-primary)`` for a
    ``color`` declaration is a replacement nobody would write.  So the offers are
    ranked by whether ``pai.css`` itself puts that token on this property — the
    same var-usage evidence D1 is built on, reused as the reachability test the
    spec asks for.
    """

    def __init__(self, token_properties: dict[str, set[str]]):
        self.token_properties = token_properties

    def _tokens_for(self, ds, prop, value):
        hits = [name for name, tok in ds.tokens.items() if _same_value(tok, value)]
        reachable = [n for n in hits if prop in self.token_properties.get(n, ())]
        return reachable or hits

    def names_for(self, ds, prop, member_name, value):
        return [f"var(--{n})" for n in self._tokens_for(ds, prop, value)][:4]

    def offer(self, ds, prop, near):
        names = self._tokens_for(ds, prop, near.value)
        if near.name in names:
            return f"var(--{near.name})"
        return f"var(--{names[0]})" if names else near.value


class _ClassCtx(_Ctx):
    """Inside a ``class`` attribute: the replacement is the utility class, which
    is the prefix the author already used plus the theme member's name."""

    def __init__(self, prefix: str):
        self.prefix = prefix

    def names_for(self, ds, prop, member_name, value):
        if _theme_key_of(ds, member_name) is None:
            return []
        return [f"{self.prefix}-{member_name}"]

    def offer(self, ds, prop, near):
        if _theme_key_of(ds, near.name) is not None:
            return f"{self.prefix}-{near.name}"
        return near.value


def _theme_key_of(ds: DesignSystem, member_name: str) -> str | None:
    """The theme key a member name lives under, i.e. is it addressable as a
    Tailwind utility at all."""
    for key, members in ds.theme.items():
        if isinstance(members, dict) and member_name in members:
            return key
    return None


# ---------------------------------------------------------------------------
# what the design system publishes only as a coupled ramp step
# ---------------------------------------------------------------------------


def _coupled_only(ds: DesignSystem) -> frozenset[str]:
    """Properties that exist in the design system only inside a scale entry's
    option object and never as a vocabulary of their own.

    Spec section 3 puts these in neither column: the system ships coupled ramp
    *steps*, not free-standing values, so there is nothing to deviate from and
    nothing worth recording as an invention either.  Derived from the theme, so
    it flips on its own — publish a free-standing scale and the property leaves
    this set.  Today it is exactly ``line-height`` and ``letter-spacing``.
    """
    nested: set[str] = set()
    for members in ds.theme.values():
        if not isinstance(members, dict):
            continue
        for raw in members.values():
            opts = _member_options(raw)
            if not opts:
                continue
            for key in opts:
                nested.add(_camel_to_kebab(str(key)))
    return frozenset(nested - ds.published_properties)


# ---------------------------------------------------------------------------
# reading the artifact
# ---------------------------------------------------------------------------


def _blank(text: str, start: int, end: int) -> str:
    body = text[start:end]
    return text[:start] + re.sub(r"[^\n]", " ", body) + text[end:]


def _mask_non_markup(html: str) -> str:
    """Same-length copy with HTML comments and script bodies blanked, so a
    commented-out ``<div class=…>`` never registers and line numbers survive."""
    out = html
    for m in list(re.finditer(r"<!--.*?-->", out, re.S)):
        out = _blank(out, m.start(), m.end())
    for m in list(_SCRIPT_BLOCK_RE.finditer(out)):
        out = _blank(out, m.start("body"), m.end("body"))
    return out


def _line_of(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


@dataclass
class _Written:
    """One property/value the author wrote, wherever they wrote it."""

    property: str
    value: str
    line: int
    selector: str


def _element_label(tag: str, attrs: str) -> str:
    classes = ""
    for m in _ATTR_RE.finditer(attrs):
        if m.group("name").lower() == "class":
            classes = m.group("val")
            break
    names = [c for c in classes.split() if c][:3]
    return tag + ("." + ".".join(names) if names else "[style]")


def malformed_findings(html: str) -> list[Finding]:
    """Stylesheets in this artifact that the browser never fully received.

    `dsparse.malformations` decides; this walks the `<style>` blocks and puts
    the line numbers back into the file's own frame, so a reader can go straight
    there rather than counting from the top of a block.
    """
    out: list[Finding] = []
    masked = _mask_non_markup(html)
    for block in _STYLE_BLOCK_RE.finditer(masked):
        offset = _line_of(masked, block.start("body")) - 1
        for f in malformations(block.group("body")):
            out.append(Finding(
                rule=f"malformed:{f['what']}",
                bucket="error",
                property="(stylesheet)",
                value=f["what"],
                where={"line": f["line"] + offset, "selector": None},
                note=f["detail"] + ". A rule that never parsed carries no "
                     "values, so nothing else in this report can see it is gone",
            ))
    return out


def _read_artifact(html: str):
    """-> (declarations, class uses).

    Declarations come from ``<style>`` blocks and from ``style=`` attributes;
    both are CSS the author wrote, so both go through the same rules.
    """
    masked = _mask_non_markup(html)
    decls: list[_Written] = []

    for block in _STYLE_BLOCK_RE.finditer(masked):
        body = block.group("body")
        offset = _line_of(masked, block.start("body")) - 1
        parsed, _classes, _ats = parse_css(body)
        for d in parsed:
            decls.append(
                _Written(d.property.strip().lower() if not
                         d.property.startswith("--") else d.property.strip(),
                         d.value, offset + d.line, d.selector or "?")
            )

    class_uses: list[tuple[str, int, str]] = []
    for tag in _TAG_RE.finditer(masked):
        attrs = tag.group("attrs")
        base = tag.start("attrs")
        label = _element_label(tag.group("tag").lower(), attrs)
        for attr in _ATTR_RE.finditer(attrs):
            name = attr.group("name").lower()
            line = _line_of(masked, base + attr.start("val"))
            if name == "style":
                for part in _split_top_level(attr.group("val"), ";"):
                    prop, sep, value = part.partition(":")
                    if not sep or not prop.strip() or not value.strip():
                        continue
                    prop = prop.strip()
                    decls.append(
                        _Written(prop if prop.startswith("--") else prop.lower(),
                                 value.strip(), line, label)
                    )
            elif name == "class":
                for cls in attr.group("val").split():
                    class_uses.append((cls, line, label))
    return decls, class_uses


# ---------------------------------------------------------------------------
# candidate values inside one declaration
# ---------------------------------------------------------------------------


def _is_zero(value: str) -> bool:
    s = _parse_scalar(value)
    return s is not None and abs(s[1]) < 1e-9


def _candidates(ds, prop: str, value: str) -> list[str]:
    """The typed values inside a written declaration value.

    A value the design system has a vocabulary for is checked whole — that is
    how a whole ``animation: my-spin 2s linear infinite`` reaches the two-member
    animation vocabulary and comes back an extension, with nothing about
    animations written down anywhere.  A compound the system has no vocabulary
    for — ``1px solid #ccc``, ``6px 8px`` — is split, so the colour in a border
    shorthand is still checked against the palette while ``display: flex``
    produces nothing at all.
    """
    v = value.strip()
    if v.lower().endswith("!important"):
        v = v[: -len("!important")].strip()
    if classify_value(v) != "keyword" or ds.vocabulary_for(prop, v) is not None:
        return [v]
    out = []
    for comp in _split_components(v):
        if comp.lower().startswith("var("):
            continue
        if classify_value(comp) != "keyword":
            out.append(comp)
    return out


# ---------------------------------------------------------------------------
# the rules
# ---------------------------------------------------------------------------


def _rule_token_redefined(ds, decls, out):
    """A local ``:root`` redefines a design-system token to a different value.

    The highest-precision rule in the set: the design system's own name, its own
    value, and a local declaration that disagrees.  The replacement is the design
    system's value, so it is always an error.
    """
    for d in decls:
        if not d.property.startswith("--"):
            continue
        if not any(part.strip() == ":root"
                   for part in _split_top_level(d.selector)):
            continue
        published = ds.token_value(d.property)
        if published is None or _same_value(published, d.value):
            continue
        out.append(
            Finding(
                rule="token-redefined",
                bucket="error",
                property=d.property,
                value=d.value,
                found=d.value,
                design_system_offers=[published],
                where={"line": d.line, "selector": d.selector},
            )
        )


def _rule_dangling_var(ds, decls, out):
    """``var(--x)`` referenced but never defined — not by the design system, not
    by the artifact itself.

    Routed through the same rule as everything else: if a real token is one or
    two characters away it is a typo and the linter can name it, so it blocks.
    If nothing is close the author reached for a token the system does not have,
    which is an extension.  A ``var(--x, fallback)`` resolves either way and is
    left alone.
    """
    published = {f"--{name}" for name in ds.tokens}
    local = {d.property for d in decls if d.property.startswith("--")}
    known = published | local
    for d in decls:
        for m in _VAR_REF_RE.finditer(d.value):
            name = m.group(1)
            if name in known or m.group(2):
                continue
            near = _nearest_name(name, published)
            if near:
                out.append(
                    Finding(
                        rule="dangling-var",
                        bucket="error",
                        property=d.property,
                        value=name,
                        found=name,
                        design_system_offers=[near],
                        where={"line": d.line, "selector": d.selector},
                    )
                )
            else:
                # Still an error.  A var() pointing at nothing does not render,
                # so the declaration is dead whether or not the linter can guess
                # what was meant.  BROKEN_REFERENCE exempts it from the
                # error-iff-replacement invariant for exactly this case.
                out.append(
                    Finding(
                        rule="dangling-var",
                        bucket="error",
                        property=d.property,
                        value=name,
                        where={"line": d.line, "selector": d.selector},
                    )
                )


def _nearest_name(name: str, published) -> str | None:
    """The design-system token this reference is a slip of, if any.

    Only design-system names are candidates.  A local ``--bc`` that happens to be
    one character from a local ``--bg`` is a coincidence, not a typo, and the
    linter has no business claiming to know what an author's private variable
    was meant to be.  The distance must also be small *relative* to the name:
    one character out of four is a different word, one out of thirteen is a
    slip.
    """
    # `published` is a set; iterating it directly makes the answer depend on
    # Python's per-process string hashing, so the same file yields a different
    # error on every run and no baseline can ever be recorded.  Sort it, and
    # break ties by name rather than by whichever candidate was seen first.
    best, best_d = None, VAR_NAME_TYPO_DISTANCE + 1
    for cand in sorted(published):
        d = _edit_distance(name, cand, best_d + 1)
        if d <= 0.2 * len(name) and d < best_d:
            best, best_d = cand, d

    # A tie on a numbered ramp (--gray-50 / --gray-400 / --gray-850 are all two
    # edits from --gray-450) carries no signal about which was meant.  Offering
    # a near-black as the fix for a light grey is worse than offering nothing.
    if best is not None:
        tied = [c for c in sorted(published)
                if _edit_distance(name, c, best_d + 1) == best_d]
        if len(tied) > 1:
            return None
    return best


def _edit_distance(a: str, b: str, cap: int) -> int:
    if abs(len(a) - len(b)) >= cap:
        return cap
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1,
                           prev[j - 1] + (ca != cb)))
        if min(cur) >= cap:
            return cap
        prev = cur
    return prev[-1]


def _token_properties(ds: DesignSystem) -> dict[str, set[str]]:
    """Which properties ``pai.css`` writes each token onto.  This is D1's
    evidence, reused to rank replacements."""
    out: dict[str, set[str]] = {}
    for d in ds.declarations:
        if d.property.startswith("--"):
            continue
        for m in _VAR_REF_RE.finditer(d.value):
            out.setdefault(m.group(1)[2:], set()).add(d.property.strip().lower())
    return out


def _rule_written_values(ds, decls, out, coupled, ctx):
    """Every value written in CSS, against whatever the design system publishes
    for its property.  This is where the colour near-miss, the off-scale
    font-size, the off-system box-shadow, the monospace extension and the silent
    proposals all come from — one loop, one decision point."""
    for d in decls:
        prop = d.property
        if prop in coupled:
            continue
        custom = prop.startswith("--")
        if custom and ds.token_value(prop) is not None:
            continue  # a redefinition; _rule_token_redefined owns it
        for value in _candidates(ds, prop, d.value):
            if _is_zero(value):
                continue  # zero is the absence of a value, not a choice
            if custom and ds.is_silent(prop, value):
                # a local variable for something the system has no word for;
                # its name is not a property, so it is not worth recording
                continue
            verdict = _evaluate(ds, prop, value, ctx)
            if verdict is None:
                continue
            bucket, rule, offers = verdict
            out.append(
                Finding(
                    rule=rule,
                    bucket=bucket,
                    property=prop,
                    value=value,
                    found=value if bucket == "error" else None,
                    design_system_offers=offers,
                    origin="invented" if bucket == "proposal" else None,
                    where={"line": d.line, "selector": d.selector},
                )
            )


def _split_class(cls: str):
    """-> (prefix, rest) with Tailwind's variants, important marker and negative
    sign removed.  The ``/NN`` suffix is deliberately left on ``rest``: whether
    it is an opacity modifier or a fraction (``left-1/2``) is decided by
    provenance, in :func:`_rule_classes`, not by its shape."""
    cls = cls.split(":")[-1].lstrip("!").lstrip("-")
    for prefix in _TW_PREFIXES_BY_LENGTH:
        if cls.startswith(prefix + "-"):
            return prefix, cls[len(prefix) + 1:]
    return None, cls


def _property_for(prefix: str, value: str) -> str:
    mapped = _TW_PREFIX_PROPERTY.get(prefix)
    if mapped is None:
        return prefix
    if isinstance(mapped, str):
        return mapped
    return mapped.get(classify_value(value), mapped["*"])


def _unescape_arbitrary(value: str) -> str:
    return value.replace("_", " ").strip()


def _rule_classes(ds, class_uses, out, coupled, stats):
    """Tailwind classes.

    Three things live here, and only the first two produce a value the design
    system can judge:

    * an arbitrary value — ``bg-[#ff0000]``, ``p-[13px]`` — a literal in
      disguise, judged exactly as if it had been written in CSS;
    * ``bg-<token>/NN`` — Tailwind *replaces* the token's baked-in alpha rather
      than multiplying it, so a 6% hairline becomes a 50% scrim.  The computed
      colour is byte-identical to a hand-written ``rgba()``, so the rule gates on
      provenance — the class names a design-system token — never on the colour;
    * a stock utility on a silent property — ``p-4`` — recorded as a proposal
      whose origin is ``adopted``: one decision to take Tailwind's default scale,
      not four hundred inventions.
    """
    for cls, line, label in class_uses:
        prefix, rest = _split_class(cls)
        if prefix is None and not _TW_ARBITRARY_RE.match(cls):
            continue

        arb = _TW_ARBITRARY_RE.match(cls)
        if arb:
            prefix = arb.group("prefix").split(":")[-1].lstrip("!-")
            value = _unescape_arbitrary(arb.group("value"))
            prop = _property_for(prefix, value)
            if prop in coupled or _is_zero(value):
                continue
            verdict = _evaluate(ds, prop, value, _ClassCtx(prefix))
            if verdict is None:
                continue
            bucket, rule, offers = verdict
            out.append(
                Finding(
                    rule=rule,
                    bucket=bucket,
                    property=prop,
                    value=value,
                    found=cls if bucket == "error" else None,
                    design_system_offers=offers,
                    origin="invented" if bucket == "proposal" else None,
                    where={"line": line, "selector": label},
                )
            )
            continue

        if _theme_key_of(ds, rest) is not None:
            continue  # the author used a design-system token, as intended
        m = _TW_OPACITY_RE.match(rest)
        if m and _theme_key_of(ds, m.group("base")) is not None:
            # provenance, not colour: the part before the slash names a
            # design-system token, so the slash is Tailwind's opacity modifier
            # and not a fraction utility like ``left-1/2``.
            _check_alpha_override(ds, prefix, m.group("base"), m.group("alpha"),
                                  cls, line, label, out)
            continue

        prop = _property_for(prefix, rest)
        if prop in coupled:
            continue
        if not ds.is_silent(prop):
            # a stock utility on a property the system publishes.  Its value
            # lives in Tailwind's default theme, which is not in design-system/,
            # so the linter cannot resolve it and says nothing rather than
            # guessing.
            stats["unresolved_utilities"] += 1
            continue
        if not _SCALE_STEP_RE.match(rest) or _is_zero(rest):
            # ``w-full``, ``ml-auto``, ``min-h-screen``: a keyword utility, not a
            # step on a scale.  Nothing here could ever become a design-system
            # value, so recording it would only pad the roll-up.
            continue
        out.append(
            Finding(
                rule=f"silent:{prop}",
                bucket="proposal",
                property=prop,
                value=rest,
                origin="adopted",
                where={"line": line, "selector": label},
            )
        )


def _check_alpha_override(ds, prefix, name, alpha, cls, line, label, out):
    """``bg-<token>/NN`` where the token already carries an alpha."""
    value = None
    for members in ds.theme.values():
        if isinstance(members, dict) and name in members:
            raw = members[name]
            if isinstance(raw, str):
                value = raw
            break
    if value is None:
        value = ds.token_value(name)
    rgba = None if value is None else _parse_rgba(value)
    if rgba is None or rgba[3] >= 0.999:
        return  # an opaque token: /NN is ordinary Tailwind, not the defect
    effective = f"rgba({int(rgba[0])},{int(rgba[1])},{int(rgba[2])},{int(alpha) / 100:g})"
    out.append(
        Finding(
            rule="token-alpha-replaced",
            bucket="error",
            property=_property_for(prefix, value),
            value=cls,
            found=effective,
            design_system_offers=[f"{prefix}-{name}"],
            where={"line": line, "selector": label},
        )
    )


# ---------------------------------------------------------------------------
# Pairs somebody has looked at and accepted, keyed (foreground, background) in
# lowercase hex.  A pair listed here is not reported — but it is counted, and the
# count goes into the run's stats, because an accepted failure and one nobody
# ever saw must not look the same.
#
# **Published pairs only.**  An acceptance is a decision about what the design
# system ships, not about a hex.  A screen that writes the same two colours by
# hand has made its own choice and still gets told, which is why the check below
# tests `pair.authored` before looking here.
#
# This is a short list on purpose.  A pair earns a line here when a person has
# seen it rendered and said so; "it looked fine in a diff" is not that.
ACCEPTED_CONTRAST = {
    # The Gold buy button.  White on every stop of the gold gradient, accepted by
    # Dhruv on 5 Aug 2026 after looking at white and near-black side by side.
    ("#ffffff", "#dcb05e"): "white on gold — accepted 5 Aug 2026",
    ("#ffffff", "#ca9e4c"): "white on gold — accepted 5 Aug 2026",
    ("#ffffff", "#c39643"): "white on gold — accepted 5 Aug 2026",
    ("#ffffff", "#b8893a"): "white on gold — accepted 5 Aug 2026",
}


# contrast
# ---------------------------------------------------------------------------

#: WCAG 2.2 SC 1.4.3.  Written down because they are the standard's numbers, in
#: the same category as the sRGB matrix above — a design system does not get to
#: publish its own definition of legible.
AA_BODY = 4.5
AA_LARGE = 3.0


def _rule_contrast(ds, html_path, out, stats):
    """Text against the background it actually sits on.

    Spec §5.  The pair is the finding, not the instance, so the value is
    ``"<fg> on <bg>"`` and the roll-up groups by it.  Three things decide what
    comes out, and each is a judgement the spec makes rather than one this
    function invents:

    * **the bucket is always ``proposal``.**  ``--text-tertiary`` cannot pass AA
      on any light surface the system publishes, and ``pai.css`` itself puts it
      on light surfaces, so an error would condemn the design system's own
      components with no compliant substitution to offer.
    * **``origin`` says who chose the pair.**  ``published`` means both ends came
      out of ``design-system/`` and the screen only used the class — the finding
      is about the design system and belongs in a design-system PR, not in a
      correction pass on the screen.  ``authored`` means the screen wrote at
      least one end.  Same axis the field already carries for values: who made
      the decision, the system or the author.
    * **an unresolved pair is never a pass.**  Everything the cascade could not
      work out is counted here and named in ``not_checked``.
    """
    cascade = read(html_path, ds)
    unresolved: dict[str, int] = {}
    #: line -> the first reason that line was given up on.  The counts above are
    #: what the report shows; this is what fixtures assert against, so a plant
    #: that says "this must be admitted, not passed" can be checked per element.
    by_line: dict[int, str] = {}
    checked = 0

    accepted = []
    def unresolvable(line: int, reason: str):
        unresolved[reason] = unresolved.get(reason, 0) + 1
        by_line.setdefault(line, reason)

    for te in cascade.texts:
        if te.pair is None:
            for reason in te.unresolved or ["the pair could not be resolved"]:
                unresolvable(te.line, reason)
            continue
        # a disturbance does not stop the pair resolving, but it does stop the
        # number meaning what it says
        if te.unresolved:
            for reason in te.unresolved:
                unresolvable(te.line, reason)
            continue

        ratio, bg = te.pair.worst
        large = te.large
        # An unresolved size cannot pick a threshold.  Judging at the lenient one
        # and recording the gap keeps the linter from crying wolf on a heading
        # while still refusing to call the element clean.
        threshold = AA_BODY if large is False else AA_LARGE
        if large is None and AA_LARGE <= ratio < AA_BODY:
            unresolvable(
                te.line,
                "the text size could not be resolved and the ratio falls between "
                "the large-text and body-text thresholds",
            )
            continue
        # A ::before/::after paints over the fill.  Where the base pair already
        # fails, the overlay only makes it worse and the finding stands; where it
        # passes, the computed ratio is an upper bound and says nothing.
        if te.overlay and ratio >= threshold:
            unresolvable(
                te.line,
                f"a pseudo-element overlay sits over the text ({te.overlay}); the "
                f"computed ratio is an upper bound",
            )
            continue
        checked += 1
        if ratio >= threshold:
            continue

        pair_key = (hexof(te.pair.composited(bg)).lower(), hexof(bg).lower())
        if not te.pair.authored and pair_key in ACCEPTED_CONTRAST:
            accepted.append({"pair": "%s on %s" % pair_key,
                             "found": f"{ratio:.2f}:1",
                             "why": ACCEPTED_CONTRAST[pair_key],
                             "where": {"line": te.line, "selector": te.label}})
            continue

        size = "unresolved size" if te.font_px is None else f"{te.font_px:g}px"
        weight = "" if te.font_weight is None else f"/{te.font_weight}"
        note = (
            f"{ratio:.2f}:1 against {threshold:g}:1 — {size}{weight}, "
            f"{'large' if large else 'body' if large is False else 'size unresolved'} "
            f"text.  colour from {te.pair.fg_source}, background from "
            f"{te.pair.bg_source}."
        )
        if len(te.pair.backgrounds) > 1:
            note += (f"  The background is a gradient; this is its worst stop of "
                     f"{len(te.pair.backgrounds)}.")
        if te.overlay:
            note += (f"  A pseudo-element overlay ({te.overlay}) paints over it, so the "
                     f"real ratio is lower still.")
        if not te.pair.authored:
            note += ("  Both ends are published by the design system, so this is a "
                     "finding about the design system rather than about this screen.")
        out.append(
            Finding(
                rule="contrast:aa",
                bucket="proposal",
                property="contrast",
                value=f"{hexof(te.pair.composited(bg))} on {hexof(bg)}",
                found=f"{ratio:.2f}:1",
                origin="authored" if te.pair.authored else "published",
                where={"line": te.line, "selector": te.label},
                note=note,
            )
        )

    stats["contrast"] = {
        "checked": checked,
        "accepted": accepted,
        "unresolved_lines": by_line,
        "skipped": cascade.skipped,
        "unresolved": sorted(unresolved.items(), key=lambda kv: (-kv[1], kv[0])),
    }


# ---------------------------------------------------------------------------
# entry point
# ---------------------------------------------------------------------------


def _rule_legacy_class(ds: DesignSystem, html: str, class_uses, out: list[Finding]) -> None:
    """A class the design system has marked legacy, in a screen being written now.

    The map comes from ``/* @legacy .old -> .new */`` markers in the design
    system's own CSS — nothing is named here, so nothing goes stale when the
    aliases change.

    An error rather than a proposal because the replacement is known: the marker
    names it, which is the one condition this linter blocks on. Both spellings
    render identically, so the finding is never that a screen looks wrong — it is
    that a screen is being written in a name the system has retired.

    Two places count as *using* a class and one does not:

    * ``class="…"`` attributes, already parsed;
    * quoted strings inside ``<script>`` — ``classList.toggle("chip-selected", on)``
      — because classes are set from JavaScript too, and a scan anchored to the
      attribute misses them. That miss is why four built screens were broken once.

    Prose does not count. A page documenting its own naming writes the legacy
    names as text, and flagging the documentation for documenting is noise.
    """
    if not ds.legacy_classes:
        return

    used: dict[str, int] = {}
    for entry in class_uses:
        cls, line = entry[0], entry[1]
        if cls in ds.legacy_classes:
            used.setdefault(cls, line)

    for block in _SCRIPT_BLOCK_RE.finditer(html):
        body = block.group("body")
        base = _line_of(html, block.start("body")) - 1
        for m in re.finditer(r"""["'`]([^"'`\n]{0,200})["'`]""", body):
            for token in re.split(r"[\s.]+", m.group(1)):
                if token in ds.legacy_classes:
                    used.setdefault(token, base + _line_of(body, m.start()))

    for legacy in sorted(used):
        canonical = ds.legacy_classes[legacy]
        out.append(
            Finding(
                rule="legacy-class-name",
                bucket="error",
                property="class",
                value=legacy,
                found=legacy,
                design_system_offers=[canonical],
                where={"line": used[legacy]},
                note=(
                    f"{legacy} is a legacy spelling the design system keeps so screens "
                    f"already built keep rendering. New work writes {canonical}."
                ),
            )
        )


def check(html_path: str, ds: DesignSystem) -> list[Finding]:
    """Every phase-1 source finding in one artifact."""
    with open(html_path, "r", encoding="utf-8", errors="replace") as fh:
        html = fh.read()

    decls, class_uses = _read_artifact(html)
    coupled = _coupled_only(ds)
    stats = {"unresolved_utilities": 0}
    out: list[Finding] = []

    _rule_token_redefined(ds, decls, out)
    _rule_dangling_var(ds, decls, out)
    _rule_written_values(ds, decls, out, coupled, _CssCtx(_token_properties(ds)))
    _rule_classes(ds, class_uses, out, coupled, stats)
    _rule_contrast(ds, html_path, out, stats)
    _rule_legacy_class(ds, html, class_uses, out)

    seen, unique = set(), []
    for f in out:
        if f.key in seen:
            continue
        seen.add(f.key)
        unique.append(f)
    unique.sort(key=lambda f: (f.where.get("line", 0), f.rule, f.value))
    check.last_stats = stats
    return unique


# ---------------------------------------------------------------------------


def _main(argv):
    import collections
    from dsparse import parse_design_system, adopted_design_system

    here = os.path.dirname(os.path.abspath(__file__))            # tools/lint
    root = os.path.dirname(os.path.dirname(here))                # repo root
    ds_dir = os.path.join(root, "design-system")
    ds = parse_design_system(ds_dir)
    for path in argv:
        findings = check(path, ds)
        by_bucket = collections.Counter(f.bucket for f in findings)
        by_rule = collections.Counter(f"{f.bucket:<9} {f.rule}" for f in findings)
        print(f"\n=== {os.path.relpath(path, here)}")
        print(f"    adopted_design_system: {adopted_design_system(path, ds_dir)}")
        print(f"    {dict(by_bucket)}  total {len(findings)}"
              f"  unresolved utilities {check.last_stats['unresolved_utilities']}")
        for rule, n in by_rule.most_common():
            print(f"      {n:>5}  {rule}")
    return 0


if __name__ == "__main__":
    import sys

    raise SystemExit(_main(sys.argv[1:]))

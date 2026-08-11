# The linter

Written 31 Jul 2026. Issue #7. Reviewed for correctness, simplicity and coverage before
first commit; the findings are folded in and the ones still open are marked.

The harness builds screens against the design system. The skill that instructs the builder
names nothing — no colour, no class, no radius, no token. Any such list is a copy of the
design system that goes stale, and keeping it fresh is work nobody does. So the design
system stays the only authority, and this linter parses it at runtime.

**Phase 1 is source-only — no browser, no server.** Phase 2 adds the rendered layer. Both are
specified here because the phase-2 findings shape the phase-1 schema, but nothing in phase 2
is built first.

## Where the numbers come from

Two spikes, run 31 Jul 2026, over the 248 HTML files in `explorations/` in
`muditas-pai/design-protos` — another repo, and the only corpus that existed at the time.
Counts marked *(spike)* were measured by code now in a scratch directory. Counts marked
*(repo)* were checkable in design-protos then; neither is reproducible here, because atlas
carries four of those files rather than 248.

**That corpus is not the population this linter will lint.** Only 99 of 248 files load
`pai.css` *(repo)*. A harness screen starts from `design-system/template.html`, which loads
`pai.css` and the Tailwind config by construction, so it is an adopter every time. Legacy
counts are evidence that a rule *can* fire, not a prediction of how often it will.

---

## 1. Three buckets

| | the design system | the verdict |
|---|---|---|
| **error** | has it | deviating is blocking |
| **proposal** | is silent | inventing is allowed, and logged |
| **extension** | speaks, but has no member for a legitimate need | logged, and not the author's fault |

**Error.** Writing `#0057f0` when `--app-600` is `#0055ED`. Redefining a token the system
already defines. The author departed from something that exists.

**Proposal.** There are no radius tokens, so a radius cannot be an error — there is nothing
to deviate from. It is recorded so it can be proposed back later.

**Extension.** `font-family` publishes three stacks and none is monospace, so a `<code>` block
has nowhere to go — 47 files in the corpus contain one *(repo)*. The system speaks, but has
nothing to say about this.

Over time proposals and extensions get absorbed, the silent column shrinks, and the blocking
column grows. That is the whole point.

### The linter must earn the right to block

**It may only call something an error if it can name what should have been written instead.**
If it cannot produce a replacement, it records and moves on.

That single rule decides the error/extension split, per value, with nothing written down:

| written | published | can it name a replacement? | verdict |
|---|---|---|---|
| `#0057f0` | `#0055ED` | yes — near enough to be what was meant | **error** |
| `ui-monospace` | 3 sans stacks | no — none of them is a monospace | **extension** |
| a custom keyframe animation | 2 unrelated animations | no | **extension** |
| `border-radius: 7px` | nothing | no vocabulary at all | **proposal** |

The property's *type* does the work. Colours, lengths and weights have a nearest member, so
they can block. Font stacks, animations and gradients have no ordering — there is no such
thing as a near-miss between two animations — so nothing can be named and they never block on
their own.

This replaces the earlier test, *"same property, many files, no near-miss"*, which was
unimplementable: it needed corpus-wide evidence and a lint run sees one artifact. It also
removes the calibration list that test required. **There is no exceptions list, and nothing to
maintain.**

Two consequences worth stating, because both were previously handled by hand:

- **Monospace** falls out as an extension automatically. Nothing in a set of sans stacks is a
  near-miss for a monospace one.
- **`animation`** stops being a trap. A two-member vocabulary can never generate a
  replacement for a third animation, so a custom animation is an extension, not an error.

`font-weight` is the one case that still blocks: writing `700` when the scale publishes
`400/500/600` yields "use 600", which is a real answer. That is correct behaviour — the
problem there is that `template.html` loads weights the scale does not publish, which is a
design-system bug (#6), not a linter policy question.

---

## 2. Classification is derived, never written down

This is the requirement the rest depends on. The linter must not contain a list of property
names, because such a list is the same stale copy in a new place. When radius tokens land,
radius must flip from proposal to error with **no code change**.

The move: don't ask *"what property is this?"* Ask *"does the design system publish a named
set of values that reaches this property?"* — with `pai.css` acting as the property
dictionary.

Five derivations:

```
D1  var-usage      pai.css writes `P: … var(--tok) …`  ⇒ --tok is consumed for P
D2  kebab-key      theme key camelCase→kebab, kept only if pai.css itself
                   declares that property
D4  spread test    a token used on ≥3 distinct properties is a palette, unscoped
D5  observed       pai.css writes a self-identifying value (gradient, shadow,
                   easing) directly on property Q ⇒ Q is in scope
D6  self-usage     values pai.css writes as literals are in the system
```

D2 self-validates: `boxShadow` → `box-shadow` ✓, `fontSize` → `font-size` ✓, while `colors`
→ `"colors"` ✗ and `keyframes` → `"keyframes"` ✗ are correctly rejected as non-properties and
get their scope from D1/D4 instead.

D6 is a judgement call, and without it the design system fails its own linter — `pai.css`
writes bare `ease`, ad-hoc gradients and one-off shadows.

D3 (suffix-class) was specified and is **dropped**. Everything it uniquely produced —
standalone `line-height` and `letter-spacing` vocabularies — is a vocabulary the system does
not publish; it ships coupled ramp *steps*, not free-standing line-heights. Its remaining
output is already delivered by D2. Numbering is left as-is so the spike's notes still match.

### It was proven, not asserted

A synthetic future design system was built with `--radius-*` vars and a `borderRadius` theme
key added, and nothing else changed. Zero linter code was edited *(spike)*:

```
                      today          after radius tokens land
border-radius: 7px    proposal   ──►  ERROR, offers 2/4/8/12/9999px
border-radius: 8px    proposal   ──►  PASSES
padding: 13px         proposal   ──►  proposal   (correctly unaffected)
```

### Where the flip does not reach

A property flips only if it is **both** a real CSS property name **and** either var-backed or
written by `pai.css`. Roughly half the silent list fails that:

| silent property | flips when tokens land? | why not |
|---|---|---|
| radius | **yes** | property name + var-backed |
| z-index, opacity, width/height | **yes** | same |
| padding / margin / gap | only via `--space-*` | a Tailwind `spacing` key is not a CSS property |
| border-width | **no** | `pai.css` uses the `border:` shorthand, never `border-width` |
| duration | **no** | only `transition:` shorthand, never `transition-duration` |
| breakpoints | **no** | `screens` is not a CSS property |
| grid / flex | **no** | `grid-template-columns` never declared |

A related fragility: D2's gate ties classification to incidental authoring style. If someone
refactors component styles into Tailwind utilities, `pai.css` stops declaring a property and
that property silently un-flips back to proposal. Worth a regression test that asserts the
published inventory, so a refactor that shrinks it fails loudly.

Residual hardcoding is CSS-spec and Tailwind level only — what a colour looks like
syntactically, which value types are self-identifying. None of it goes stale when the design
system changes.

---

## 3. What the design system publishes today

Derived, not assumed. Counts *(spike)*, recount before relying on them.

```
PUBLISHED                                        entries
  colour       palette, unscoped                    ~214
  box-shadow                                          ~51
  gradient                                            ~22
  font-size                                            20
  animation                                             2   ← see warning
  easing                                                4
  font-family                                           3
  font-weight                                           3   (400/500/600)

SILENT
  radius · padding/margin/gap · width/height/inset · duration
  z-index · opacity · border-width · breakpoints · grid/flex
```

**`animation` would have been a trap**, and §1's rule defuses it. D2 scopes it — it is a
Tailwind theme key with two members, and `pai.css` declares `animation:` six times — so a
naive reading makes every ad-hoc `animation:` a blocking error against a two-member
vocabulary. But animations have no nearest member, so the linter can never name a
replacement, so a custom animation is an extension. Nothing special-cased.

`line-height` and `letter-spacing` are deliberately in neither column: D3 is dropped, so
nothing derives them, and they are not checked.

---

## 4. Two layers, and the line between them

**Source knows what was written. Only the browser knows what took effect.** Anything
decidable from the text of a declaration belongs to source.

### Phase 1 — source owns

Token redefined to a different value · colour near-miss · literal equal to a token value ·
off-scale font-size · off-system box-shadow · dangling `var(--x)` · Tailwind arbitrary values
(`bg-[#ff0000]`) · **`bg-<token>/NN` opacity syntax** · **contrast, where the pair resolves
from source** (§5) · **a rule that never parsed** (below).

#### A rule that never parsed

Every other check reads the *values* a declaration writes. That has one blind spot it cannot
close from the inside: **a rule that does not parse carries no values, so it contributes
nothing to check, and a file missing half its rules scores zero.** Zero reads as perfect.

Two causes, both from ordinary editing, and neither leaves a value behind to flag:

| | |
|---|---|
| an unclosed `/*` | everything after it is a comment. The rules are still in the file and the browser never sees them |
| unbalanced braces | a stray `}` ends a block early; a missing one runs two rules together |

**The parser already knows, and was discarding it.** `_blank_comments` finds a `/*` with no
closing `*/` — that is the branch that blanks to end of file. The same event walk `parse_css`
runs leaves an unbalanced brace visible in its own stack. `dsparse.malformations` reports what
both had computed and thrown away, rather than scanning again.

That matters more than saving a file. A second scanner would have to decide for itself what
counts as a comment, a string, or a brace inside `url(…)` — and the moment `dsparse` changed
its mind, the check would quietly stop describing what the linter actually parses. One scanner
cannot disagree with itself.

These findings are **errors, and they sort first.** A stylesheet the browser never received
makes every other finding in the report a statement about a file nobody rendered.

They join `dangling-var` in `BROKEN_REFERENCE`, exempt from §1's error-iff-replacement rule and
for the same reason: nothing rendered, so there is no declaration to name a replacement for.
The repair is to close the comment or balance the brace, and the finding says which.

This is source-only and stays that way. A rendered check would see the missing effect but not
the reason, and the reason is the whole repair.

That last one is source-only and it matters. Tailwind's `/NN` **replaces** a token's baked-in
alpha rather than multiplying it — `--border-tertiary` is `rgba(11,15,20,0.06)` *(repo)* and
`bg-border-tertiary/50` renders `rgba(11,15,20,0.5)`, over eight times more opaque, a
hairline turned into a scrim. But the computed value is byte-identical to a hand-written
`rgba()`, so only provenance distinguishes them. Matching on colour gave 1,418 false hits;
gating on provenance took it to zero *(spike)*.

**One phase-2 finding is worth approximating in phase 1.** The Tailwind CDN injects its
`<style>` after the `<link>`, so at equal specificity a utility beats a component class.
Observed: `button-primary` + `text-text-primary` renders near-black text on a near-black
button, 1.01:1 *(spike, ratio verified in repo)*. A crude source check — a `text-*` utility
co-occurring on an element with a component class that sets colour — catches most of it with
no browser.

### Phase 2 — rendered owns

Contrast against the real composited backdrop, **for the pairs source cannot resolve** (§5) ·
tokens dead by **scope or type** rather than by name · whether a declaration actually won ·
laid-out geometry.

The finding that justifies phase 2 existing at all: **dead tokens do not fail uniformly.**
`background: var(--missing)` goes transparent, which is obvious. But `color: var(--missing)`
**inherits the parent's colour** — it renders as something plausible and nobody notices. An
AI builder will produce exactly this.

---

## 5. Contrast

Built 4 Aug 2026, issue #2. Superseded the original "phase 2, not built" — a screen shipped
with its buy button at 2.02:1 and the linter reported zero errors, which settled the question
of whether this could wait for a browser.

### The bug that decided the shape

`.button-gold-shimmer` in `pai.css` sets `color: var(--text-white)` and a gold gradient fill.
White against its lightest stop is **2.02:1**; `.button-large` makes the label 14px/500, so
AA wants 4.5. The screen wrote nothing but the class name — **both ends of the pair live in
the design system.** A source linter that only reads what the artifact wrote can never see
this. So contrast is the one check that resolves a *computed* value: it runs a small cascade
over `design-system/*.css`, the artifact's `<style>`, its `style=` attributes and the Tailwind
utilities it uses, ordered by specificity then document order.

### What is checked

**Text against the background it sits on, and nothing else.** For every element with rendered
text: the resolved `color` (following inheritance, `var()` and alpha compositing) against the
first opaque background found walking up its ancestors.

- **A gradient is a range.** Every stop is a background the text is on; the worst stop is the
  finding. sRGB interpolation never leaves the interval between two stops, so the worst stop
  is the worst point on the gradient.
- **Alpha composites.** `rgba(0,0,0,0.32)` on white is `#adadad` at 2.23:1, not black at
  12.63:1. A translucent background composites onto what is behind it, recursively.
- **Thresholds are the standard's.** 4.5:1, or 3:1 for large text — 24px, or 18.66px at
  weight ≥700. The size and weight are resolved from the same cascade, so the type ramp is
  read out of the design system rather than assumed. Worth noting what falls out: the ramp
  publishes 400/500/600 and nothing heavier, so on today's design system a ramp step can only
  reach the large threshold by being ≥24px.
- **Disabled controls and hidden text are exempt.** SC 1.4.3 excludes inactive components;
  `display:none`, `hidden`, `aria-hidden`, `sr-only` are not seen.
- **`:hover` and friends are not the resting appearance** and are not judged.

### What is deliberately not checked, and why

**Non-text contrast (SC 1.4.11) — borders, focus rings, control fills.** The 3:1 there applies
to whichever edge is the component's *visual boundary*: a filled button's is its fill, a bare
input's is its border, a card's may be neither. Nothing in a stylesheet says which. Checking
every border would put a finding on every hairline the system publishes, which is the
cry-wolf failure. Named in `not_checked` on every report.

**Laid-out geometry.** Whether a partially-positioned element lands on a given line of text is
a layout question. A *full-bleed* positioned sibling — pinned to all four edges, carrying its
own paint — is treated as an unresolved backdrop, because there the tree does not decide what
is behind the text at all. A close button in a corner is not.

### The uncheckable case is recorded, never passed

This is the rule the whole check hangs on. **A pair the reader cannot resolve is reported as
unresolved with its reason** and counted in `not_checked`. It is never treated as a pass. A
checker that quietly skips what it cannot work out is exactly how a 2.02:1 buy button shipped
clean.

What gets admitted:

| case | why source cannot settle it |
|---|---|
| a background `url()` behind text | the image is not in the stylesheet |
| `opacity`, `filter`, `mix-blend-mode`, `backdrop-filter` on the element or above it | changes what composites |
| a `::before`/`::after` overlay over the text | the base ratio becomes an **upper bound**; if it already fails the finding stands, if it passes the pair is admitted |
| a full-bleed positioned sibling | what is behind the text is not the ancestor's background |
| `color: transparent` with `background-clip: text` | the glyphs are painted by the background |
| a dangling `var(--x)` on either end | the declaration does not render |
| a selector outside the reader's grammar (`:is()`, `::first-line`) that could set either end | it might win and cannot be evaluated |
| an unresolvable font-size (`clamp()`) with a ratio between 3 and 4.5 | passes as large text, fails as body, and there is no way to tell which |

The reader's selector grammar covers tags, classes, ids, attribute selectors, `>` `+` `~`,
`:not()`, `:has()` and the structural pseudo-classes. Anything beyond that is admitted rather
than ignored — and the admission is scoped to the selector's **subject**, so one `:has()` in
`pai.css` does not taint every line of text on the page.

### Whose finding is it: `origin`

If a published pair fails, that is a finding about the **design system**, not about the screen
that used the class. `origin` carries it, on the same axis the field already uses for values —
who made the decision:

| `origin` | meaning | where it goes |
|---|---|---|
| `published` | both ends came from `design-system/`; the screen wrote a class name | roll-up → a design-system PR (§9) |
| `authored` | the screen wrote at least one end, or chose the pairing | the screen's own correction pass |

The `.button-gold-shimmer` case is `published`. A screen putting `text-text-tertiary` on a
white card is `authored` — both values are published, but the pairing was the screen's.

### Bucket: proposal, not error

`--text-tertiary` (`#a3a3a3`) cannot pass AA on any light surface the system publishes. It
would need a background brighter than white. Ratios *(repo, recomputed in review)*:

```
--bg-blackout          7.11  ████████████████████  AA
--bg-primary-inverted  7.06  ████████████████████  AA
--bg-primary (white)   2.52  ███████               fail
--bg-quaternary        2.00  █████                 fail
```

It is not a broken token — it is a **dark-surface** de-emphasis token, and the gap is the
missing light-surface counterpart, which would be about `#767676` (4.54 on white). `pai.css`
itself puts it on light surfaces in `::placeholder`, `.chip-input` and `.listitem-subtitle`
*(repo)*, so an error here would fail the design system's own components.

So contrast findings are **proposals, not errors**, deduped to the (foreground, background)
pair rather than the instance.

### Accepted pairs

A published pair can be looked at and kept. `ACCEPTED_CONTRAST` in `rules.py` is the list, keyed
`(foreground, background)` in lowercase hex, each line carrying who accepted it and when.

**An accepted pair is not reported. It is still counted**, into `stats.contrast.accepted`, with its
ratio and where it was found. An accepted failure and one nobody ever saw must not look the same —
that is the whole difference between a decision and a hole.

**Published pairs only.** The check tests `pair.authored` before consulting the list. An acceptance
is a decision about what the design system ships, not about two hex values: a screen that writes the
same colours by hand has made its own choice and still gets told.

**A pair earns a line when somebody has seen it rendered and said so.** Not from a diff, and not
because a run was noisy. The list is short on purpose, and `fixtures/contrast.html` asserts both
halves — that the accepted pair is silent, and that it was counted.

Today it holds one decision: white on the gold gradient of `.button-gold-shimmer`, kept on
5 Aug 2026. The gold *badge* — `#ca8a04` on a pale gold tint at 2.66:1 — is a different pair and is
not accepted.

### The exception, stated plainly

**This does not derive from §2, and it cannot flip.** §2's mechanism is property-scoped, and
contrast is not a property — it is a relation between two values. None of D1–D6 reads
pairings, so if the system later ships a light-surface counterpart, contrast will not
automatically become an error. This is the one place design knowledge is written into the
linter rather than read out of the design system, and pretending otherwise would be the
spec's worst kind of lie.

It is accepted because the alternative is worse: blocking helps nobody when every light
surface fails and there is no compliant substitution to offer. It is contained by emitting
proposals rather than errors, by `origin` separating the design system's fault from the
screen's, and by the exception being named here so the next person does not have to discover
it.

There is a second reason not to block, and it is §1's rule rather than a contrast-specific
concession: **the linter may only error when it can name what should have been written
instead.** For a failing pair there is no such name. A search of the palette for a member that
clears 4.5:1 on that background returns colours picked by luminance alone — offering
`--text-error-primary` as the fix for a buy-button label is not a replacement, it is a
different design. Until the system publishes pairings, contrast cannot name one.

Two guards were specified for turning a contrast finding into an error, and both are
**dropped**:

1. ~~Either end off-token → error.~~ Already covered. A colour the system does not publish is
   an error under `near-miss` or a proposal under `silent:`, on its own terms, before contrast
   ever looks at it. Erroring again here double-counts one defect.
2. ~~A pairing produced by the cascade rather than chosen → error.~~ The pairing that motivated
   it — a `text-*` utility out-specifying a component class, near-black on near-black — is now
   *resolved* rather than guessed at, because the cascade orders the Tailwind CDN's injected
   `<style>` after the artifact's, which is where the utility's win comes from. It reports as
   an ordinary contrast proposal at 1.01:1. The open question about joining source and
   rendered data does not arise: nothing needed joining.

Text inside slide *thumbnails* is a picture of a slide and exempt, but nothing in the source
distinguishes it from real body text — a known residual false positive, unchanged.

### What this cost, measured

Over the whole corpus — every `designs/**/*.html`, `canonical/` and the design system's own
review pages, 20 files:

```
text elements resolved     1479   ████████████████████████████████████
unresolved, with a reason    50   █
hidden or WCAG-exempt       284   ███████
```

**15 distinct (foreground, background) pairs fail**, 4 of them `published`. The most any one
file reports is 6. The tally is led by `--text-tertiary` on white at 2.52:1 — the pair §5 was
written about, at the ratio §5 recorded, which is the closest thing to a calibration this
check has.

---

## 6. Scoping: did this page opt in at all?

`adopted_design_system` is a boolean on the output: does the file load `pai.css`? One check.

It is not a mode. A harness screen starts from `template.html` and is always an adopter, so
the "everything is bucket 2" path guards a condition that is true by construction. The flag
exists so that pointing the linter at work that predates the design system — as 149 of those
248 files did *(repo)* — reports honestly instead of condemning files that were never in scope.
`designs/deck-ready-modal-expanded/` is the one such file carried into this repo.

---

## 7. Output

Written beside the artifact, inside the pass directory:

```
runs/<run-id>/passes/<n>/
  artifact.html
  lint.json
```

```json
{
  "run_id": "2026-07-31-01",
  "screen": "designs/feature-gate-pricing-modal",
  "file": "…/artifact.html",
  "state": null,
  "phase": 1,
  "adopted_design_system": true,
  "summary": { "errors": 29, "proposals": 14, "extensions": 2 },
  "errors": [
    { "rule": "token-redefined",
      "property": "--app-600",
      "found": "#0057F0",
      "design_system_offers": ["#0055ED"],
      "occurrences": 2,
      "where": { "line": 14, "selector": ":root" } }
  ],
  "proposals": [
    { "rule": "silent:border-radius",
      "property": "border-radius", "value": "22px",
      "origin": "invented",
      "occurrences": 14,
      "where": { "line": 47, "selector": ".sheet" } },
    { "rule": "contrast:aa",
      "property": "contrast", "value": "#ffffff on #dcb05e",
      "found": "2.02:1",
      "origin": "published",
      "occurrences": 1,
      "where": { "line": 292, "selector": "button.button-gold-shimmer" },
      "note": "2.02:1 against 4.5:1 — 14px/500, body text.  colour from
               pai.css:544, background from pai.css:545.  The background is a
               gradient; this is its worst stop of 4.  A pseudo-element overlay
               paints over it, so the real ratio is lower still.  Both ends are
               published by the design system." }
  ],
  "extensions": [
    { "rule": "incomplete:font-family",
      "property": "font-family", "value": "ui-monospace, monospace",
      "occurrences": 3,
      "where": { "line": 88, "selector": "code" },
      "note": "the system publishes 3 stacks, none monospace" }
  ],
  "not_checked": [
    { "what": "properties with no published vocabulary",
      "detail": ["z-index", "opacity", "gap", "width"],
      "why": "no tokens exist and no value was written, so nothing to record" },
    { "what": "cascade outcome, dead-by-scope tokens, geometry",
      "why": "phase 2, not built" },
    { "what": "contrast on anything that is not text against its own background",
      "why": "borders and control fills fall under SC 1.4.11, whose 3:1 applies to
              whichever edge is the visual boundary — not readable off a stylesheet" },
    { "what": "text whose colours could not both be resolved from source",
      "detail": ["3x the background is an image, so what sits behind the text is
                  not in the source (artifact.html:88)"],
      "why": "3 of 41 text elements; a browser resolves these, a source reader
              cannot, and passing them silently is the defect this check exists for" },
    { "what": "text on hidden or disabled elements",
      "detail": ["12 element(s)"],
      "why": "SC 1.4.3 exempts inactive controls, and hidden text is not seen" },
    { "what": "accessible names, focus rings, placeholder text, content values",
      "why": "owned by the lint stage in the harness design, not implemented here" }
  ]
}
```

### Schema rules

- **Every bucket uses the same field names**: `rule`, `property`, `value` (or `found` +
  `design_system_offers` for errors), `occurrences`, `where`. No bucket-specific shapes.
- **`screen` is the problem folder, not the run and not the state.** This is what the roll-up
  counts. One run over seven states is one screen. Without this the "≥2 screens" threshold is
  unimplementable, which it was in the first draft of this spec.
- **`state`** is null for phase 1, and carries the state name for phase-2 findings so a
  seven-state run produces seven entries that still roll up as one screen.
- **`origin`** distinguishes `"adopted"` (`p-4`, taking Tailwind's default scale) from
  `"invented"` (`p-[18px]`, a one-off). Both are "system is silent", but only the second is a
  real invention — the first is one decision, not four hundred proposals.
- **Everything deduped by (property, value)** with an occurrence count. Read literally the
  corpus produces ~40,000 proposals; deduped it is a few dozen per file *(spike)*. Instance
  counts mislead the other way too — 2,260 raw hits were 31 distinct defects *(spike)*, so
  one bad CSS rule reads as a catastrophe unless findings are reported per defect.
- **Contrast findings do not have a (property, value) key.** They are a colour pair, so they
  carry `"property": "contrast"` and `"value": "<fg> on <bg>"` — the *composited* colours in
  hex, not what was written — to stay groupable by the roll-up. Ugly, and the price of §5's
  exception. `found` carries the ratio, and `origin` is `published` or `authored` rather than
  `adopted` / `invented`: same axis, different vocabulary, because for a pairing the question
  is who chose it rather than where the value came from.
- **`note`** is a sentence a rule may attach when `(property, value)` does not say enough.
  Extensions have theirs derived from the vocabulary that failed to supply a member; contrast
  carries the threshold it was judged at, the resolved size and weight, and the file and line
  each end of the pair came from — none of which is recoverable from the other fields.
- **`not_checked` is not optional.** A thin linter must never read as a clean bill of health,
  and phase 1 is thin. It must name the phase-2 checks and the checks the harness design
  assigns to the lint stage that this linter does not implement.

---

## 8. Placement in the pipeline

The system diagram runs lint at step 3 and render at step 4; the handoff table lists render
before lint. Both are right about one half. Resolved:

```
generate ──► SOURCE LINT ──► render ──► RENDERED LINT ──► judges
                  │                          │
             errors? stop              (phase 2)
```

A source failure short-circuits before anything is rendered — no screenshots, no judges, no
pass spent. That is what the diagram's lint node already says in its footnote, and it is why
source lint runs first.

**Only `errors` block.** Proposals and extensions are recorded and never stop a run. When
`adopted_design_system` is false, nothing blocks.

On a block, the run routes straight to `/atlas-fixer` — targeted edits, never a regenerate —
and re-lints. It skips the render, the review and both judges: a screen outside the design system
is corrected before anyone draws or looks at it. `/atlas-verdict` reads `lint.json` on that path
with no judge findings to merge, and alongside them on every other.

**The judges do not see `lint.json`.** The diagram has no lint→judge edge and the design
judge is deliberately kept from the code; feeding it lint output would reopen a settled
decision.

### Enforcement is phased in

Errors are **advisory in phase 1** — reported, counted, not blocking. `design-system/components.html`
currently produces 45 errors *(spike)*; a linter whose first act is to condemn the design
system teaches everyone to ignore it. Blocking switches on when issue #6 is resolved, or
against a recorded baseline of the errors that existed on day one, whichever comes first.

This is deliberate and matches the standing decision that drifting toward design-system-only
is the goal but enforcing it fully now is premature.

---

## 9. The roll-up

Harvest runs `lint-rollup` over every run's `lint.json`, counting **distinct screens** that
reached for the same thing.

```
runs/*/lint.json ──► group by (property, value) ──► count DISTINCT `screen`
                                                          │
                                               1 screen ──┴── ≥2 screens
                                               (wait)         (PR candidate)
```

One screen is an observation, two is the signal — the same threshold the annotation system
uses, in its own words. Forty uses on one screen is still one designer decision; two screens
reaching for it independently is evidence.

Counting is mechanical, so it is a **script and gets no vote** on what the count means.

**Output:** `proposals.json`, committed, holding every (property, value) with its screen
count, first-seen run, and a `status` of `open`, `proposed`, `absorbed` or `declined`. The
status is the ratchet — without it, a proposal that Mudita has already shipped or already
refused resurfaces at every roll-up forever.

Harvest reads the tally and decides; **a person raises the design-system PR** against
`design-system/`, which is owned elsewhere and PR-gated. A draft PR opened by a machine that
guessed wrong costs the owner more than it saves.

Extensions roll up the same way as proposals. A gap the system has — no monospace stack —
becomes a PR candidate on the same two-screen threshold as a value it never had a word for.

---

## 10. Build contract

```
tools/lint/
  pai-lint.py          source linter, phase 1 — the CLI and the output
  rules.py             the checks
  dsparse.py           reads design-system/, derives what it publishes
  cascade.py           resolves a text element's computed pair (§5)
  rollup.py            the roll-up
  check_fixtures.py    asserts what the fixtures say the linter finds
  fixtures/            clean.html · violations.html · contrast.html
```

No data files. Everything the linter knows it reads from `design-system/` at runtime.

Inputs: the artifact, `design-system/pai.css`, `design-system/pai.tailwind.js`.
Exit non-zero only when blocking is enabled and errors exist.

`check_fixtures.py` is part of the contract, not a convenience. `fixtures/contrast.html`
annotates every element with `data-lint="fail|pass|unresolved|skip"`, and the `unresolved`
plants assert that the check **recorded** the give-up rather than merely failing to resolve —
without that, a rule that drops unresolvable pairs on the floor passes the suite. The suite is
mutation-tested: fourteen deliberate breaks of the contrast check, including inverting the
comparison, removing the large-text branch and skipping the unresolvable case, and each one
turns it red.

A prior `pai-lint.py` exists on `design-harness@9724eae` with seven working source checks.
The spikes behind this spec were run fresh and deliberately did not read it. Worth diffing
before building — not to inherit, but so a check that already worked is not re-derived
badly.

---

## What is not in scope

Taste. The linter enforces vocabulary, not judgement — every real design defect found in the
harness's one deleted artifact would have passed it clean. Layout rhythm, hierarchy, motion
quality and copy have no vocabulary to check against and are not membership tests. That is
the judges' job, and keeping the boundary clean is what stops the linter becoming a place
where opinions get smuggled in as rules.

`lint.json` has a second consumer: issue #5 wants lint violations to become Don'ts in the
annotations library, in an `element` / `problem` / `instead` shape. Nothing here provides
`instead`. Named now so the schema is not re-cut later.

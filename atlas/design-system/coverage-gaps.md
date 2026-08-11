# Coverage gaps

The subjects this design system has **no house answer to**. Not a wishlist — a register of the
questions a builder will actually hit, with the evidence that they are unanswered and one line on
what would close each.

A gap belongs here when something went looking for an answer and did not find one: a screen that
had to invent, a judge finding that recurred, a verdict that logged it unjudged, a comment in
`pai.css` admitting it. **A gap with no evidence is speculation and does not go in this file.**

Compiled 9 Aug 2026 from `pai.css`, the build reference, the canonical screens and the one complete
run's six passes.

---

## How to use it

**Building?** If your screen needs one of these, decide, and say in the handover what you decided
and why. That is how a gap closes — by a decision somebody can argue with later, not by a rule
nobody agreed.

**Adding to the system?** This is the queue. The entries with the most evidence behind them are the
ones costing the most.

**Closing one?** Move it to *Closed* with the date and what closed it. Do not delete it — the
register is more useful with its history than without.

---

## States nobody has settled

Six of the eight states a control can be in have no published answer. This is the largest cluster
in the file and every judged pass has logged part of it.

### What does a control look like at the moment it is pressed?

**Evidence.** `grep -c ':active' pai.css` returns **0**, against 37 `:hover` rules. Named as
unanswered in the build reference since 31 Jul 2026, and the stylesheet has grown to 2496 lines
since without gaining one. Every judged pass logged it: *"Motion, hover, active, focus and pressed
states — no picture shows any of them"* (pass 3, `not_checked`).

**What closes it.** One rule, applied across the interactive families at once. A decision about
whether pressed is a depth change, a fill change or both.

### Selected and focused are the same picture

**Evidence.** `.pai-surface-card.is-selected` was published on 10 Aug 2026 with exactly the box-shadow
`.pai-thumbnail-card:focus-visible` draws — a near-black ring over a hairline of the surface colour.
Chosen deliberately rather than delaying the selected state behind the separation, and the cost was
stated at the time: on a screen where the choice is the point, a keyboard user cannot tell the card
they are on from the card they picked.

**What closes it.** A second signal on one of the two. Three candidates were weighed and none
adopted: focus stacking a further ring outside selected, focus going brand (which reverses this
file's neighbour asserting focus is near-black never brand), or selected taking a heavier ring at the
same colour. Worth settling the next time a screen has both states live at once.

### Which controls get a focus ring, and does the component draw it or does the screen add it?

**Evidence.** The system publishes the ring and not the policy: `shadow-focus-{field|surface|image}`
with a documented reason for having no `--focus-*` token. But only four `:focus-visible` rules exist
in the whole stylesheet — `.pai-thumbnail-card`, `.pai-switcher-option`, `.pai-link`,
`.pai-select-trigger`. Buttons, chips, list items, tabs, checkboxes, radios and the modal dismiss
have none. Three passes running could not settle it from the pictures.

**What closes it.** A rule saying every interactive component draws its own ring, plus the rules to
make that true. Today a builder cannot tell whether a missing ring is a bug or their job.

### What is the one disabled treatment, and what happens when a whole card is disabled?

**Evidence.** `pai.css` publishes disabled four different ways and never says which is the house
one — two opacities on buttons, a background swap on inputs, an opacity on the toggle track, another
on list and dropdown rows. Nothing covers a container. Pass 2, F5: *"The pending dim is applied to
some children of a card and not others."*

**What closes it.** A decision on whether a container may be disabled at all, or whether that is
always a scrim over a region.

### What does a control look like after it is pressed, while the work is still running?

**Evidence.** The same defect in two consecutive passes on the same state. Pass 1, F2: *"the one
word telling you money is moving is the least readable thing in the modal. There is no spinner, no
progress mark."* Pass 2, F1 raised it again as a blocker. The loading guidance distinguishes
skeleton / shimmer / spinner / progress and never says what happens to **the button that started
the work**.

**What closes it.** A rule for the in-flight control itself, not for the region it is loading.

### What does a screen with nothing in it look like?

**Evidence.** `pai.css` publishes exactly one thing in this territory — `.dropdown-no-results`,
scoped to a menu. The README's component list has no empty state. Routing sends "an empty or error
state" to a section covering tooltips, skeleton, shimmer, spinner, progress, scrim, toast and
banner, none of which is a surface with no content.

**What closes it.** A component, and a position on whether an empty state is illustrated.

### How does a surface say something failed, when the failure is not a form field?

**Evidence.** Error is published only where a field owns it — `.is-error` on input and select,
`.is-failed` on file upload. The one published rule is about fields. Pass 1, F5:
*"video-unavailable.png is a failure state that looks like a working player."*

**What closes it.** A treatment for a region or a screen that failed, distinct from a field that is
invalid.

---

## Layout questions with no answer

### How does a screen behave between the two widths that get drawn?

**Evidence.** The stylesheet branches on width in exactly one place and only for the grid — 900 where
the analytics modal drops to one column, 600 where the create flow does. Modals size in `vw`/`vh`
with no breakpoint at all. Every verdict logged it unjudged: *"Any width other than 1440. Only that
width was rendered."*

**What closes it.** Two named breakpoints published as tokens, or a stated position that screens are
drawn at fixed widths and reflow is out of scope.

### How much belongs on one screen, and what happens to a column that runs out first?

**Evidence.** The same shaped finding in all three judged passes, each time measured. Pass 1, F8:
*"160 empty pixels in default.png… 232 in no-offer.png (about 40% of the rail's height)."* Pass 2,
F6: *"roughly 57,000px² of blank panel beside a full left column."*

**What closes it.** A rule for what a two-column layout does when one side is short — pin to the
taller, let each find its own height, or reserve.

### What marks a thing as interactive, beyond it being a published component?

**Evidence.** The only two positions are assertions with no mechanism: *"Interactive is a claim, and
it goes both ways"* and *"A row you can press says so."* Neither says what the claim is made of.
Pass 2, F8: *"The preview block carries no play control, no duration, no poster overlay and no
visible affordance of any kind."*

**What closes it.** A named visual family that non-interactive things do not share.

**Narrowed, 10 Aug 2026, for one family only.** `.is-interactive` on `.pai-surface-card` /
`.pai-surface-raised` is exactly that: cursor, a hover step up the elevation ladder, and a focus
ring — a treatment a plain surface does not carry, so the two are distinguishable without reading
the markup. It answers the question for cards and panels and for nothing else. Rows, thumbnails,
tiles and preview blocks — the one pass 2's F8 was about — still have no published answer, and the
gap stays open until the same family covers them.

---

## Values the system does not publish

### How long should a transition take?

**Evidence.** Three easing curves are tokens. Every duration beside them is a hand-written literal —
**fifteen distinct values** across the file (100 · 130 · 140 · 150 · 160 · 200 · 250 · 280 · 300 ·
400 · 800ms · 2 · 3 · 4 · 8s), with 160ms used twelve times and 300ms six. The same gesture is timed
differently depending on which component you land in.

**What closes it.** A `--duration-*` scale of three or four steps, and the same adoption pass every
token addition owes.

### Is a padded, fixed-width box measured border-box or content-box?

**Evidence.** `pai.css` sets `box-sizing` nowhere and admits it in its own comment. **Four
components have patched it locally** rather than the system setting it once. It has already cost a
canonical screen 53px on a column, *"invisible until measured."*

**What closes it.** A decision, not a token — flipping the system to `border-box` would move layout
on every screen already built against `content-box`, so it needs the migration protocol, not a
one-line change.

### Is there a published style for a face the scale does not carry?

**Evidence.** A canonical screen holds a literal because the system has the size and not the face:
1.5rem at weight 500 with -0.02em, where `.text-heading-2xl` is the same size at weight 400 with
different tracking. Because a `fontSize` entry is a tuple, type has no CSS variable to reach past.

**What closes it.** Either a type step for this face, or a stated position that a design may own its
title's face and the linter should stop offering the nearest class.

### Which properties does the system deliberately not govern?

**Evidence.** A canonical screen had to argue against the linter to keep underline thickness at 2px
and a scrollbar at 4px: *"a spacing scale does not govern how thick a text underline is, and using it
there would be a coincidence dressed as a decision."* The lint stage names the territory —
*"properties with no published vocabulary"* — and cannot resolve it.

**What closes it.** A published list of properties the scales do not reach, so the linter stops
proposing a spacing step for a text decoration.

---

## Surfaces the system has no material for

### Can a surface be a material rather than a colour?

Everything the system publishes about a surface is a *value*: a background step, an elevation, a
radius. Nothing says what a surface is **made of**. So a screen that wants to distinguish one panel
from another has exactly two moves — change its lightness, or put a border on it — and both are
already spent by the time a page has a recommended option on it.

The house does own a ribbed language already: `assets/backgrounds/footer-saturated-blue.png` is
composed of vertical ribs lit from the lower right, and it is the one place the product has texture.
It exists as a 1440px image reserved for one footer per page, so nothing can reach for it at any
other size — a 336px card crops it to a smear.

`riffs/recommended-pricing-card/sheet.html` frame **F6** drew that language at a twentieth of the
strength on a white card: a repeating brand tint at 12% on a 12px pitch, masked so it fades out
before the body copy. It was put forward by the product owner on 11 Aug 2026 as a candidate for
the system, as a surface or background type rather than a one-off.

**What it costs.** Three things, and the third is the one that decides it:

- **A pitch and an opacity on a scale**, not a pair of numbers — a rib that is right on a card is
  wrong on a full-bleed band, so this is a small ramp, the way elevation is.
- **A rule for what a material may claim.** Texture is not decoration: a ribbed surface has to mean
  something a flat one does not, or every panel gets ribs within a month.
- **It has to survive its own delivery.** 1px ribs alias on non-retina, thin out in a compressed
  screenshot, and moiré against a scaled render. A material that only exists on the designer's
  display is not a material. Any candidate is judged in a screenshot and at a scaled render before
  it is judged on screen.

**What closes it.** A named surface class that draws its own ribs from tokens (never an image, so
it works at any width), a stated pitch/opacity ramp, one line saying what a material asserts, and
the screenshot test above.

---

## Components that do not exist

### Is there a slider?

**Evidence.** `grep -c slider pai.css` returns **0**. The README's scope note lists five unported
components — dialog, dropdown, slider, tabbar, loader — and three of the five have since landed,
so the note reads as if four are missing when only this one is.

**What closes it.** A component when a screen needs one. The stale half of that scope note should
be corrected either way.

---

## Two published positions that disagree

These are not missing answers. They are two answers, both shipped.

### Is the published modal layer allowed on an atlas screen?

`.pai-modal-layer` is `position:fixed; inset:0`. The build rule forbids exactly that shape:
*"A viewport-locked shell… pins the document to the window, so content taller than the viewport is
cut even from a full-page capture. Draw a scrim in flow and let the page grow."*

Pass 3 is this contradiction surfacing — the modal measured 1013px tall in a 390px viewport.

**What closes it.** An in-flow variant of the layer, or a rule saying which wins and when.

### Does `.pai-scrim` take a layer step, and what happens to the screens built before the scale?

`--z-scrim` and `--z-modal` are published, and `.pai-surface-scrim` takes its step. `.pai-scrim`
takes none — the comment on it used to say the system had no layer scale, which was true when the
class was written and is not true now.

**It cannot simply be given one.** Screens built against it put a bespoke modal after it in source
order with no z-index of their own, so the scrim would paint over them. Tried on 9 Aug 2026 and
reverted: it blanks `single-export-vs-pro`, which renders correctly today only because neither
element carries a z-index and source order decides.

**What closes it.** The pinning protocol in `README.md` — give `.pai-scrim` its step, then walk each
built screen that uses it, pin the old stacking, and migrate one at a time. Ten screens use it.

### What is the 32px search field called?

The README admits it and leaves it open on purpose: two sizes are named, and
`.dropdown-search-container` forces a third, *"decided by where it sits rather than by what it is —
worth resolving, and not resolved here, because moving it changes every menu long enough to need
searching."*

**What closes it.** A name and a migration, or a rule that a container may set a size.

---

## Closed

| Gap | Closed by | When |
|---|---|---|
| **A divider in a card could not obey its own rule** — the annotation says dividers in cards run end to end; `.pai-divider` is `width:100%`, which resolves against the content box and stops short by exactly the padding. The one working version was written inline for `.dropdown-menu-style`, scoped to a menu and to its 4px. | `.pai-divider-bleed`, generalising that technique. The container declares `--divider-bleed` as its own padding; the fallback is `--space-xl`. Rendered in `sticker-sheet.html#dividers` beside a plain divider stopping short. | Aug 2026 |
| **A card and a row had no selected state** — chip, tab, list item and switcher each publish one and none fits a card, so two separate runs reached for `--bg-brand-selected`, a hover tint for one button variant whose name reads like a state. | `.pai-surface-card.is-selected` / `.pai-surface-raised.is-selected` — the thumbnail card's ring, promoted off that one component. It does not close the selected-vs-focus question, which is now its own entry above. | Aug 2026 |
| **The offer chip had no home** — a filled brand pill with a downward tail carrying a countdown, raised by `canonical/feature-modal`. `.pai-badge` was an 18px tint and `.chip-style` an outlined control, so nothing published was a near miss. | `.pai-tooltip-brand` + `.pai-tooltip-pill`. The countdown was folded into the tooltip because it was the same object, and keeping them apart left the checkout offer pill with a tail nothing published. | Aug 2026 |

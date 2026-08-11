# Early renewal

The modal that asks somebody to renew before their year is up, because they have run out of
credits or are about to. Credits on the left with what refilling them costs; the payment on the
right. Four scenarios — Silver, Gold, Buy Team, Teams — over two credit states and two payment
providers.

Rebuilt from `explorations/mani/pricing/early-renewal.html` in design-protos on the design
system, 6 Aug 2026. No Figma frame was cited for this one; the prototype is the source.

## What it gets right

**The meter is the argument, and it is the first thing on the screen.** Nothing has to say *you
are nearly out* — a bar with 432 of 5,000 left says it before the headline is read, and the
headline then only has to say what to do about it. The screen earns the interruption in its top
40px, which is the whole job of a modal that appeared uninvited.

**One number is the offer, and it is the same number in both cards.** `5,000` and `50,000` sit at
the same size, in the same place, at the same x. That is what makes 10× legible as a quantity
rather than as a claim — the comparison is done by the eye before the badge that spells it out is
read. It is also why neither card carries an icon in front of its number: put one on the Gold card
alone and its number steps 28px right, and the two figures you are meant to compare stop lining up.

**The upsell is a card, not a banner.** Gold is offered as a second row in the same list, with the
same shape, the same radio and the same price line as the plan being renewed — so it reads as the
other option rather than as an advertisement wedged into a checkout. The gold wash does all the
work that a heavier device would have done badly.

**The pool picker prices itself.** Choosing 50,000 credits does not open a table or a comparison —
it changes the price above it and the discount badge beside it, in place. The ladder (10 · 20 · 30
· 40 · 50%) is visible as you scroll the menu, so the reason the price fell is on screen at the
moment it falls.

**The two payment providers are one screen.** Stripe draws the whole form because there is no card
on file; Paddle draws a summary and one button because there is. Nothing about the left column
knows or cares which — the difference is contained entirely in the right column, and that is why
this screen has two providers rather than two screens.

**Carry-forward appears only when there is something to carry.** `+432 credits carry forward` is
absent at zero, and it is the sentence that makes renewing *early* rational rather than wasteful.
Showing it at zero would be showing `+0`.

## What to take from it, and what not to

**Take** the meter-as-argument, the two numbers on one baseline, the upsell as a peer row, and the
picker that reprices in place.

**Do not take** the animated gradient on *Unlimited seats*. It is the only moving type on the
screen and it earns that only because "unlimited" is a quantity with no digits — the sweep stands
in for the number that would otherwise be there. Mid-sweep the light band (`#b6daff`) is close to
unreadable on white. On any phrase that is not standing in for a number it would be decoration
with a legibility cost.

**Do not take** the gold shimmer on the credit figure without the gold card under it. It works
because the card is already washed gold and the number is the brightest thing on it; on a white
card it is a gradient for its own sake.

## Where the design system asserted itself

A rebuild, not a copy.

| | source | here |
|---|---|---|
| modal radius | 12px | `--rounded-lg`, 8px — the settled annotation is 8px for all modals |
| modal shadow | `0 24px 80px rgba(0,0,0,.4)` | `--elevation-04` |
| page + scrim | flat `#3d3d3d` | `--bg-tertiary` under `.pai-scrim` — black at 50% with a real 8px blur |
| close button | 40px, hand-placed at `right:-54px` | `.pai-modal-dismiss`, 28px, wherever it puts it |
| plan card shadow | three hand-written layers | `--elevation-01` — which those three layers already were, spelled out |
| radios | bespoke 5px ring | `.pai-radio` |
| pool picker | bespoke dropdown | `.pai-select` + `.dropdown-menu-style` |
| payment tabs | bespoke | `.tabs-strip .tabs-track` + `.tab-item` |
| card fields | `div.placeholder` | real `.pai-input--lg`, so focus and error are the field's own |
| country | bespoke | `.pai-select--lg`, opening upward so it does not fall out of the modal |
| the CTAs | bespoke `#0b0f14` | `.button-style .button-large .button-primary` |
| tier + discount chips | bespoke | `.pai-badge` · `-neutral` · `-gold` · `-success` · `-info` |
| tooltip | bespoke bubble | `.pai-tooltip .pai-tooltip-bottom-center` |
| demo switchers | bespoke | `.pai-switcher .pai-switcher-small` ×3 |
| the spark glyph | hand-drawn `<svg>` | `ph ph-sparkle` — it *was* Phosphor's sparkle, pasted as a path |
| icons | CDN, three weights | vendored `regular` only |
| 28 · 18 · 22 · 14 · 10 · 6 · 5px | off-scale padding and margins | the nearest `--space-*` rung, per the scale's own 28→24, 14→12, 6→4 |

Two colour moves are worth naming because they were measured, not eyeballed:

**`--text-tertiary` failed twice and both went to `--text-secondary`.** "of 5,000" on the grey
panel measured 2.4:1 where 4.5 is needed, and the struck price on the gold wash the same. Nothing
was lost: "of 5,000" is 12px against "credits left" at 14px, so size was already carrying that
hierarchy, and a line through a price is what says it is the old one — the colour was never doing
that job.

**`#005eff` became `--text-brand`.** The source reached for `app-500`; the semantic layer points
brand text at `app-600`. One step, and it is the difference between a hex and a decision.

## The one thing that is not a faithful copy

**The modal has no minimum height.** The source floors it at 600.

Measured across all sixteen states: **ten of them are taller than 600 anyway**, so the floor did
nothing at all. Where it did bite, it was holding the modal open over emptiness — worst in Gold +
Paddle, which is one small card and a three-line summary propped 195px apart by a number.

```
                        with 600   free    dead grey
gold / paddle             600       405       195
silver / zero / paddle    600       560        40
silver|gold / stripe      600       573        27
the other ten states      — the floor adds nothing —
```

Now the content sets the height: 405 at the shortest, 748 at the tallest. That is a wide swing,
and it costs nothing, because the four scenarios are mutually exclusive in life — a person is on
Silver *or* on Gold, and only the demo switchers put the two next to each other.

This is the same call `feature-modal` made about its own 600, for the same reason: the number was
never derived from anything.

## The one thing left as it was, and why

**The payment tab strip has one tab.** A tab strip with one tab is not a control — nothing can be
switched — so it reads as a heading that has grown an underline. It is also a leftover rather than
a design: it had more tabs until UPI and QR were removed from every checkout modal on 3 Aug 2026.

It is kept anyway, and that is a deliberate refusal. Whether a second payment method returns is a
product question this rebuild cannot answer, and a canonical screen that quietly deletes a
payment-method affordance would mislead the next person to open it more than one that keeps it
with this paragraph attached. **If the answer is that nothing is coming back, this is the first
thing to change.**

## What is hardcoded, and what is not

Audited with the repo's own linter, `tools/lint/pai-lint.py`, which reads `design-system/` at run
time. It comes back with **two errors and no contrast failures** — against `feature-modal`'s four
and none, on a considerably bigger screen.

**Everything with a published home uses it:**

| | |
|---|---|
| shell, surface, radius, elevation | `.pai-modal` |
| the close control | `.pai-modal-dismiss` |
| the credit meter | `.pai-progress` · `.pai-progress-bar` |
| plan choice | `.pai-radio` |
| pool + country pickers | `.pai-select` · `.pai-select--lg` · `.dropdown-menu-style` |
| card fields | `.pai-input` · `.pai-input--lg` |
| the agreement | `.pai-checkbox` |
| payment method | `.tabs-strip` · `.tabs-track` · `.tab-item` |
| both CTAs | `.button-style` · `.button-large` · `.button-primary` |
| every badge | `.pai-badge` · `-neutral` · `-gold` · `-success` · `-info` |
| every rule | `.pai-divider` · `.pai-divider-vertical` |
| the explainer | `.pai-tooltip` · `-bottom-center` |
| the demo switchers | `.pai-switcher` · `.pai-switcher-small` |
| all type | the `text-*` ramp, including both 24px numbers |
| every gap, pad and radius | `--space-*` · `--rounded-*` |
| every colour | the semantic layer, with the gold family the single exception |
| icons | Phosphor, vendored, at `--icon-*` |

**What is still literal, on purpose:**

**The geometry** — 1068 wide, a 540px left column, a 300px pool picker. This is the design, and it
is the one thing a canonical screen should own.

**The payment logos' box** — 24 × 16. Both surviving lint errors are this, and the linter offers
`--space-xl` and `--space-md` because the numbers happen to match. A spacing scale does not govern
the aspect ratio of a brand logo; taking it would be a coincidence dressed as a decision.

**The credit figure's weight** — 700. It takes `.text-heading-2xl` for size, line-height and
tracking and departs on one leg of that tuple, because the ramp publishes 1.5rem at weight 400
only. The meter's number above is the same class untouched, and the two at 400 and 700 *is* the
hierarchy — writing it as a single override rather than as a second face is what makes that
readable in the markup. The source's `-0.02em` went with the ramp's `-0.01em`: 0.24px against
0.48px per character is not a design.

**The gold family, entire** — `#faf0d6` · `#fdf9ec` · `#e6d19e` · `#c9932a` · `#8a5a10`. See below.

## Gaps this found in the design system

Eight, and three of them are now the **second** screen to hit the same wall, which is the
threshold the roll-up treats as a PR candidate rather than an observation.

**No badge tone names a promotion.** "50% off" is neither a tier (`pro`/`gold`/`basic`/`free`) nor
a status (`success`/`warning`/`danger`/`info`). `-info` is the nearest published member and it is
a near miss, not a match. `feature-modal` hit this from the other side — its offer chip had no home
either. **Two screens.**

**`.pai-progress` publishes one track colour, and it is a surface.** The track is `--bg-tertiary`,
which is exactly this panel's own background, so the bar vanishes on it. Moved one semantic step to
`--bg-quaternary` here. The component wants a surface-aware track, or a variant for a tinted panel.

**`.pai-progress` reads as a task, not as a remaining quantity.** The fill ramps navy → brand and
is pinned to the *track's* width, so at 432/5,000 you see only the navy end of it. That is exactly
what the component promises — "the bar warms toward the brand as it completes" — and it is built
for progress *through* something. A gauge of what is **left** wants the opposite: quiet when full,
loud when nearly empty. Taken as published, and worth a conversation.

**The gold card has no tokens.** `bg-gradient-gold` is a saturated horizontal fill built for a
button, not the soft vertical wash a card wants, and nothing publishes the ring. The gold text
shimmer has no home either — `.button-gold-shimmer` is a fill sweeping *under* a label, not a
gradient clipped to glyphs.

**`.pai-tooltip` publishes one max-width, 192px.** That is a label's width. This tooltip carries
two sentences and a date range; at 192 it is seven lines in a column narrower than the icon it
hangs off. 280 local. The system wants a `-wide`.

**`.pai-link` is written for an `<a>`.** It sets colour, decoration and a radius and nothing else,
so on a `<button>` the UA border, grey face, padding and font all survive it — "Change" drew a
bordered grey box with a blue link inside it. Every screen styling a button as a link re-resets
this by hand, which means every screen does it slightly differently.

**`.pai-modal` solves overflow only for its header/body/actions arrangement.** It caps itself at
`calc(100vh - 96px)` and lets `.pai-modal-body` scroll underneath the cap. A two-column modal has
no body to scroll, so the cap just clips the taller column — and `.pai-modal-layer` is
`position:fixed`, so there is no way to reach what was clipped. Measured: at a 762px viewport the
Buy Team scenario put its last link **42px below the shell**, sitting on the scrim. The layer
scrolls here instead, with `margin:auto` rather than the layer's `align-items:center`, because a
centred flex item that outgrows its container loses its top edge to the scroll origin.
`feature-modal` never met this because it fixes its height at 538.

**`pai.css` still sets `box-sizing` nowhere.** Same finding as `feature-modal`, same local reset.
**Two screens**, and the reason not to fix it is unchanged: flipping the system to `border-box`
would move layout on every screen already built against `content-box`.

**A divider inside a card does not run end to end on its own.** The README says it should;
`pai.css` implements it only for `.dropdown-menu-style`, which cancels its own padding with
negative margins. The summary box does it by hand. The dividers *inside* a plan card are left
inset on purpose — those divide the row body, not the card, and already run the full width of the
thing they divide.

## Notes

**Sixteen states, every one in the URL.** `?plan=silver|gold|teambuy|teams` ·
`?credits=zero|low` · `?pay=stripe|paddle`. The switchers write back to the URL, so any state can
be linked to.

**The pricing is computed, not written.** A unit price times the pool, less a discount that grows
with it — 10 · 20 · 30 · 40 · 50% up the ladder. Two rules sit on top and both are in the code with
their reasons: Silver Team's 15,000 floor carries no discount because it is the plan the person
already has, and Gold Team keeps its extra 50% off on top of whatever the ladder gives.

**In Buy Team the meter still shows the person's own cap**, not the pool's. They have not bought
the team plan yet, so their own credits are still the ones running out.

**The Gold scenario draws no radio.** One plan on offer is not a choice, and a radio with one
position is a control that cannot be operated.

**Assets are local** — five card and processor logos plus one CVC icon, in `assets/`. Unlike
`feature-modal`'s feature media there is no shared set for these, and a brand logo is not a
Phosphor icon and cannot become one.

**Paddle's wordmark is set as text**, not as a logo. There is no Paddle asset in the repo, and
approximating someone's brand grey by eye is worse than not drawing it.

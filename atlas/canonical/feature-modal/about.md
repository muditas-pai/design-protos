# Feature modal

The modal that sells Pro and Gold from a list of what each plan unlocks. Seventeen features down
the left, the selected one shown large on the right, two prices at the bottom.

Rebuilt from `explorations/mani/pricing/feature-modal.html` in design-protos — Figma `217:7704`,
box `2132:1984` — on the design system, 3 Aug 2026.

## What it gets right

**The list is the navigation and the argument at the same time.** Seventeen locked features, each
with its tier beside it, is a longer pitch than any paragraph would be — and scrolling it is the
person reading the pitch. Nothing has to say *there is a lot here*.

**One thing is large and everything else is small.** The media block is the biggest object on the
screen by a wide margin, and it is the only one that changes. The eye has one place to land, and
the list underneath it is a column of near-identical rows precisely so it does not compete.

**The tier badge does two jobs and reads as one.** `PRO` and `GOLD` sit beside the label as a
tint, not a border, so they colour the row without adding an edge to it — and because they are the
only colour in the list, the tier is legible as a pattern before any single row is read.

**The offer is a chip with a tail, not a banner.** It points at the headline it modifies rather
than sitting above it in its own band, so the discount reads as a qualifier on the sentence
instead of a second announcement competing with it.

**The close control is outside the modal.** A dismiss tucked into an 8px corner fights the radius;
outside, it belongs to the modal without being part of its surface.

**Three states, one layout.** Offer, no-offer and trial-expired change only the headline and
whether savings appear on the CTAs. Nothing moves. A person who has seen one has seen all three.

## What to take from it, and what not to

**Take** the list-as-argument, the single large object, the tint-not-border tier badge.

**Do not take** the bob-and-glow on the offer chip. It is the one piece of motion on a screen that
is otherwise still, and it earns that only because the chip carries a countdown — animation on a
thing that is not counting down would be decoration.

## Where the design system asserted itself

A rebuild, not a copy. Six values moved because the system publishes them:

| | source | here |
|---|---|---|
| modal radius | 4px | `--rounded-lg`, 8px — the settled annotation is 8px for all modals |
| scrim | `rgba(10,25,37,.72)` + 1px blur | `--bg-scrim` + `--bg-scrim-blur` — black at 50% with a real 8px blur, so the blur does the separating |
| modal shadow | four hand-written layers | `--elevation-04` |
| export icon | `ph-fill` | `ph` — the source filled this one glyph and no other |
| row pitch | 46px | 44px — the source's 10px gap is not on the spacing scale |
| close button | hand-placed at +12, +10 | wherever `.pai-modal-dismiss` puts it |

Everything else is within two pixels of the original, measured rather than eyeballed: both column
widths, the media box, badge position, CTA height, every vertical offset.

Components used as published: `.pai-modal`, `.pai-modal-dismiss`, `.listitem` with
`-interactive` / `-selected`, `.pai-badge-pro` / `-gold`, `.button-primary`,
`.button-gold-shimmer`.

## The one thing that is not a faithful copy

**The modal is 538 tall, not the source's 600.** That 600 was never derived from anything — the
source positions its content absolutely, so nothing pushed back against it and 62px fell to the
floor as dead space under the CTAs.

538 is what the right column actually needs: media, then the name, the description, the gap, the
buttons and their padding. The description is reserved at two lines because seven of the seventeen
features describe themselves in one and ten in two — without that the modal would lose 20px on
seven of them and the buttons would move under the cursor as you read down the list.

The cost is one row: seven features are visible before scrolling rather than eight. The list
scrolls either way, so that is a smaller thing than a hole under the two controls the whole screen
exists to get clicked.

Matching the source's geometry was the right instinct while rebuilding and the wrong one to stop
at. This folder is screens that are right, not screens that are faithful.


## What is hardcoded, and what is not

Audited with the repo's own linter, `tools/lint/pai-lint.py`, which reads `design-system/` at run
time rather than carrying a list. It came back with nine errors and four survived — the other five
were declarations restating something the system already publishes, and they are gone.

**Everything with a published home now uses it:**

| | |
|---|---|
| shell, surface, radius, elevation | `.pai-modal` |
| the close control | `.pai-modal-dismiss` |
| feature rows | `.listitem` · `-medium` · `-interactive` · `-selected` |
| tier chips | `.pai-badge-pro` · `.pai-badge-gold` |
| the two CTAs | `.button-style` · `.button-large` · `.button-primary` · `.button-gold-shimmer` |
| feature name | `.text-heading-xl` |
| description | `.text-body-base-regular` |
| offer chip type | `.text-body-sm-medium` |
| scrim | `--bg-scrim` · `--bg-scrim-blur` |
| every gap, pad and radius | `--space-*` · `--rounded-*` |
| every colour | the semantic layer, no hex anywhere |
| icons | Phosphor, vendored, at `--icon-*` |

The CTA height was the clearest catch: `.button-large` already publishes `height: 44px` and this
file declared it a second time. Four type rules were the same mistake in a different property.

**Four things are still literals, on purpose:**

**The geometry** — 940 × 538, and a 341px left column. This is the design, not a system value, and
it is the one thing a canonical screen should own.

**The title's face** — 1.5rem at weight 500 with -0.02em. `.text-heading-2xl` is the same size at
weight 400, 1.3 line-height and -0.01em, so taking it would change the design. The system has the
size and not this face.

**Underline thickness and offset, and the scrollbar's width** — 2px and 4px. The linter offers
`--space-3xs` and `--space-2xs` because the numbers match, but a spacing scale does not govern how
thick a text underline is, and using it there would be a coincidence dressed as a decision.

**The offer chip, entire** — see below.

## Two gaps this found in the design system

**`pai.css` sets `box-sizing` nowhere.** A padded, fixed-width column comes out wider than declared
by exactly its padding and border — 53px here, and invisible until measured. The reset is local to
this file rather than added to the system: flipping to `border-box` would move layout on every
screen already built against `content-box`.

**The offer chip has no home.** A filled brand pill with a downward tail. `.pai-badge` is an 18px
tint and `.chip-style` is an outlined control, so nothing published is a near miss. Built from
tokens and flagged rather than forced into a component it is not.

## Notes

**Assets are the shared set**, `assets/features/`, not a local copy — that library exists so
seventeen features' media is carried once rather than per screen. Three of them (`export`,
`invite-members`, `analytics`) play a real clip, with the still doubling as its poster.

**One string is invented.** *Meet and edit* has no description in the source, where all sixteen
others do. It is marked in the data and is not shipped copy.

**Modes** are `?mode=offer` (default), `plain`, `trial`.

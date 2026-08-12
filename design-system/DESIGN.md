# DESIGN.md

What the design system **means**, and which thing to reach for.

`pai.css` says what everything *is* — every colour, size, shadow and component. It cannot say which
one your screen wants, or what each one claims before you write a word. That is this file.

---

## How to read this

**This file names tokens. It never restates their values.** "The modal shell takes `--rounded-lg`",
never "8px". A number written here is a number that can go stale here, and a second copy of a value
is the one thing this system has always refused. Where you need the value, open `pai.css`; it is
one file and it is the truth.

Four homes, and each answers a different question:

```
what is it?          pai.css · pai.tailwind.js     values, and the components built from them
how do I build it?   sticker-sheet.html            every component rendered live, markup to copy
what does it mean?   DESIGN.md            ← here   which one to reach for, and why
what has no answer?  coverage-gaps.md              the questions nobody has settled
what do I put in it? ../assets/README.md           the pictures. 180 real slides, 4 decks, 3 sizes
```

**Never draw a grey rectangle where a picture goes.** `assets/decks/` holds four real presentations,
fifteen slides each, in three sizes, and `assets/decks/README.md` is a roster with a picking rule:
**match the register of the screen, not your taste.** A dark investor deck behind a light modal is a
contrast test the screen may not have meant to take, and a picker grid painted from one deck reads
as one deck four times. `assets/` also holds avatars, logos and brand kits.

*Added 10 Aug 2026, after a run drew five variants with empty thumbnails on the conclusion that no
deck imagery existed. It existed; the search was truncated and the truncation was read as the
answer.*

Two more sit outside this folder and outrank it on their own ground:

- **`designs/*/annotations.jsonl`** — rules learned by looking at a real screen, anchored to the
  element that proved them. **An evidenced note beats a proposal here.** Where this file and an
  annotation disagree, the annotation wins and this file is wrong.
- **`tools/lint/pai-lint.py`** — anything mechanically checkable belongs there rather than here. A
  rule a linter can enforce runs on every pass; a rule in prose runs when somebody remembers it.

**Copy markup from the sticker sheet, not from here and not from `pai.css`.** Serve the repo root
and open `design-system/sticker-sheet.html`; every section below names its anchor. Reconstructing a
component from class names is how a modifier gets missed.

---

## 1. Loading it

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="icons/regular.css" />
<script src="https://cdn.tailwindcss.com"></script>
<script src="pai.tailwind.js"></script>
<link rel="stylesheet" href="pai.css" />
<body class="pai">
```

**Icons are vendored, never fetched.** `icons/` holds Phosphor, and no page reaches a CDN for it.
The reason is the render stage: screens are screenshotted headless and judged on the picture, so a
CDN blip produces a screen condemned for icons that were never missing. That has already happened
here once, to Google Fonts.

**The token config comes after the CDN script.** That is the only ordering constraint — `pai.css` is
standalone and the Play CDN injects its sheet last regardless.

**Never inline or copy the design system.** A copied stylesheet is a fork, and the linter cannot see
it — a `pai.css` sitting beside a screen reads as adoption.

---

## 2. Colour

**Two layers, and they point one way.** A ramp step holds a value; a semantic token holds a
reference to one; a component uses the semantic and never the ramp. Nothing points back up — a ramp
resolving to a semantic token means the palette is now defined by one of its consumers.

**One colour means one thing, per screen.** Brand blue can be the discount, or the current plan, or
the recommended option. It cannot be all three — by the third use it means nothing. Its published
jobs are highlighting a discount, and highlighting a snippet of text inside a longer line.

**Grey and white backgrounds divide one surface into sections.** That is the house way to make two
regions on one panel, before a border is considered.

**Nothing pale next to white.** A pale fill on a white surface has no edge; the two read as one
thing with a smudge. If something must be seen on white it needs a real fill.

**A promotional surface takes a saturated fill or the brand gradient**, never a tint above 90%
lightness. Pale reads as tentative, which is the opposite of what a promotion is for.

### Three heroes

The interface is monochrome by default — navy, grey, white. Three accents own exactly one job
each, and the restraint is why each lands. (Fork-local, from `pai-visual-language`, 10 Aug 2026.)

| colour | job | shows up as |
|---|---|---|
| **navy** (`#0A1925` family) | **action** | the primary CTA on ordinary surfaces — "Export as PPT", "Save changes" |
| **orange** (`#FF5500`) | **brand** | the logo, COMING SOON / NEW tags. Brand, never monetization |
| **Brand Blue** (`#005EFF` family) | **growth** | what drives a paid action: upgrade CTAs, paywalls, PRO / GOLD badges, offer banners, plan callouts, credit purchase |

Quick test: dashboard primary button → navy. "Get Pro" and the PRO badge → Brand Blue. The
logo → orange. Anything else colourful in chrome → probably wrong. A hex here is
identification, never a value to write — take the token from `pai.css`.

### Colour that is not the system's

**A customer's brand colour is data, not a design-system value.** There is no token for it and there
should not be — brand kits are read at runtime and applied as a fill at low opacity. This is the
boundary on "a value is written once": per-customer colour never becomes a token, however many
screens use it.

**The identity palette carries no meaning.** An avatar's colour is hashed from a **stable id**, never
from a display name — a name changes and the person's colour changes with it. Every ink in that
palette clears 4.5:1 on its own fill.

### Colour in a chart

**Distinct hues, never shades of one.** A ramp reads as an order, and lightness does not survive a
thin donut stroke or a small legend swatch.

**Colour is the only thing separating one arc from the next**, so it has to survive being printed,
screenshotted into a deck, and read by somebody who cannot distinguish red from green. Pick from
across the wheel and check the pair that will sit adjacent.

**One colour for every bar in a bar chart.** Colour a single bar differently only to pick it out.

> Values and ramps: `pai.css`. Rendered: `sticker-sheet.html#colour`, `#chart`, `#avatars`.

---

## 3. Type

**The type ramp exists as classes only — there is no CSS variable for a type step.** Each entry is a
tuple of size, line height and weight rather than a single value, so it cannot be a `var()`. This is
why a wrong type size can be *named* in a class but only *valued* in CSS. A known asymmetry, not an
oversight.

**Two or three styles in a block of text, never more.** A style is any combination of size, colour
and weight — so grey-regular-14 and blue-bold-14 are two styles, not one.

**Make hierarchy with size, not weight.** Reach for a bigger step first. Weight is the second lever,
and using it first produces screens where everything is bold and nothing leads.

**Setup / payoff is the signature two-tier headline.** A lighter, quieter pre-statement, then the
darker bolder claim — "Ready to export? **Here are your options.**" — built from weight and colour
at one size, not from two sizes. For modal titles, section headings, pricing headlines.
(Fork-local, from `pai-visual-language`, 10 Aug 2026.)

**14px is the default for body text.** 12px exists and is for rare cases. Do not set a paragraph
in it.

**Quotations are set in the serif.**

**Eyebrows are rare, and set in the monospace in caps.** If a screen has one it should do work no
heading could.

**A title runs to two lines at most.**

**A subtitle must state at least one fact that does not appear in its title.** If it restates the
title in other words, it doubles the height and says nothing.

**No single paragraph runs past about sixty words.** Longer copy is split into paragraphs or a list.
A block of prose goes unread, and the sentence that mattered goes unread with it.

**A number that changes while you watch it is set in tabular figures**, so the digits do not reflow
their container second by second.

> Rendered: `sticker-sheet.html#type`. What the words should *say* lives in `VOICE.md`.

**14px is the default for body text.** 12px exists and is for rare cases. Do not set a paragraph
in it.

**Quotations are set in the serif.**

**Eyebrows are rare, and set in the monospace in caps.** If a screen has one it should do work no
heading could.

**A title runs to two lines at most.**

**A subtitle must state at least one fact that does not appear in its title.** If it restates the
title in other words, it doubles the height and says nothing.

**No single paragraph runs past about sixty words.** Longer copy is split into paragraphs or a list.
A block of prose goes unread, and the sentence that mattered goes unread with it.

**A number that changes while you watch it is set in tabular figures**, so the digits do not reflow
their container second by second.

> Rendered: `sticker-sheet.html#type`. What the words should *say* lives in `VOICE.md`.

---

## 4. Space and radius

**One spacing scale for padding, margin and gap** — they are the same decision on three different
edges. The step widens as the values grow, and several rungs are deliberately absent. Reaching for
the neighbour is the point of having a scale; if a number is not on it, that is the answer, not a
problem to route around.

**Space groups before a border does.** Use a fill or a line to separate two groups only where the
gap between them is below `--space-xl`; at or above that, the gap is the separation.

**A divider is for two different kinds of thing.** Two groups of the same kind take a gap instead.
Inside a card or a menu, a divider runs edge to edge — one that stops short reads as a mistake
rather than a separation. `.pai-divider-bleed` is how, and the container declares `--divider-bleed`
as its own padding.

**The gap above and below a bleeding divider matches the container's padding.** A divider that
reaches both edges is a wall between two rooms, and each room should be inset the same on all four
sides. A card padded 20 with 12 above and below its divider gives regions of 20/20/12 and
12/20/20 — nothing is technically wrong and the eye reads the mismatch immediately.

*The class deliberately does not set this itself. Vertical margins on a component collide with the
`gap` or `space-y` of whatever contains it, and which wins depends on the parent — silent, and
different in flow than in flex. One value, declared once by the container, is the predictable
version. Settled 10 Aug 2026, off a sticker-sheet card that had it wrong.*

### Radius

**Our corners are sharper than most product UI, and that is the most recognisable thing about the
surface.** The scale stops at `--rounded-2xl` on purpose: 24px and up showed up only on progress
bars and skeletons, things meant to read as pills. Reaching past the step you need does not make a
screen friendlier; it makes it look like someone else's.

Every element takes `--rounded-base` unless it is one of three things: **tiny** (under about 40px —
`--rounded-sm`), **floating above the canvas** (`--rounded-md` or `--rounded-lg`), or **the thing
the page is about** (`--rounded-xl` or `--rounded-2xl`). `--rounded-2xl` is the ceiling; above it
there is only `--rounded-full`.

**A content card takes `--rounded-base`, and a large floating container takes `--rounded-lg`.**
Those two carry 26 of the 36 radius uses across the canonical screens; everything else is a special
case with a reason. A plan card, a pricing card and a summary panel are content cards — they are
not "the thing the page is about" merely because the page is about buying something.

**`--rounded-xl` and `--rounded-2xl` are for a surface that carries the page**, and they are rare:
one use of `xl` across every canonical screen, and **zero of `2xl`**. If you are reaching for either,
say in the handover what makes this surface the page's subject rather than an object on it.

*This rule exists because a run reached for `--rounded-2xl` on every card in five variants, on the
strength of the token's own comment naming "billing, pricing, plan" — a comment describing an
intention nothing had ever acted on. Settled 10 Aug 2026.*

A pill is `--rounded-full`, never a guess like 34px or 999px.

**A floating menu takes `--rounded-base`.** Settled 9 Aug 2026. The token comment on `--rounded-md`,
the README's radius row and `.pai-surface-overlay` each named a different answer; the component was
right.

**Nesting: outer radius minus the padding between them gives the inner one**, so the corners stay
parallel.

### Two traps

**Never clip a shell that has a control outside it.** The modal dismiss sits outside the shell by
house rule, so `overflow:hidden` on the shell cuts it off entirely. Round each column's own outer
corners instead.

**Reserve space for a string whose length varies**, using the published class's line height as the
unit. Without it, the controls underneath move as the person reads down a list — and a control that
moves because somebody looked at something else is a defect they will feel and not be able to name.

> Scales: `pai.css`. Rendered: `sticker-sheet.html#spacing`, `#rounding`, `#dividers`.

---

## 5. Elevation, edges and focus

**Elevation is how far off the page a surface sits.** Four steps, and each says something:

| | |
|---|---|
| `--elevation-01` | resting — buttons, inputs |
| `--elevation-02` | raised — cards, chips, a modal's inner panel |
| `--elevation-03` | floating — dropdowns, popovers, tooltips |
| `--elevation-04` | overlay — modals, and nothing else |

**One shadow colour at three strengths**, and each step adds a layer to the step below it. Every
step carries the same 1px inner white highlight, so a surface catches light at its top edge whatever
depth it sits at. A dark ladder exists separately because that near-white inset draws a halo on a
near-black object.

**Cards get elevation, not a plain grey stroke.** A stroke is a line drawn round something; an
elevation says how far above the surface it sits. The system publishes the second.

A variant that owns its edge — the whole outlined family — takes the lift alone rather than the
ladder's ring on top of its border.

### Focus

**Near-black, never brand.** Blue reads as a state the component owns; black reads as the thing you
have got hold of.

Three rings, because one cannot serve a white card and a photograph: `field` is one stroke where the
resting ring sits; `surface` lays a hairline of the page colour down first, so the ring never
touches the element's own edge; `image` does the same at 2px, because a dark stroke on a dark slide
is no stroke at all. Checkboxes and radios take none of them.

**There is deliberately no `--focus-*` token.** A custom property substitutes its `var()`s where it
is *declared*, so a composite written at `:root` would bake in the light page's colours and a dark
region could never move it. The utilities compose in the rule instead, which resolves on the
element — so a dark region that re-declares the two semantics gets a ring that follows it for free.

**Which components draw their own ring is unsettled** — see `coverage-gaps.md`.

### Selected

**A selected card or row takes a near-black ring with a hairline of the surface colour under it** —
`.is-selected` on `.pai-surface-card` or `.pai-surface-raised`. The ring **replaces** the resting
elevation rather than stacking on it: two edges on one card reads as a border that changed its mind.

**Never a pale fill.** `--bg-brand-selected` is a hover tint for `.button-secondary-brand` and
nothing else — its name is a trap, and two separate runs have reached for it as a selected
background on the strength of the name alone. A pale blue on white also breaks the rule two sections
up: nothing pale next to white.

**Selected and focused look identical today.** Chosen on 10 Aug 2026 rather than delaying the
selected state behind the separation — the cost is that a keyboard user cannot tell the card they
are on from the card they picked. Registered in `coverage-gaps.md`.

Chip, tab, list item and switcher each publish their own selected treatment and none of them is this
one. That is four answers to one question, and it is why the card needed a fifth rather than
borrowing.

> Rendered: `sticker-sheet.html#elevation`.

---

## 6. Surfaces, layers and layout

**A surface is a background, an elevation and a layer travelling together.** Not three decisions —
one. A side panel is the modal surface anchored to an edge; a sunken surface goes the other way,
below the page rather than above it.

**The page is `--bg-secondary`.** Settled 10 Aug 2026: it moved one step lighter, so the elevation
ladder does more of the separating and the colour step does less. `--bg-tertiary` keeps its value and
its other jobs — a disabled field, the free badge, the prompt tint — it is simply no longer what a
page is painted with.

`--bg-subtle` is the step above it: the main column and top nav, so a panel beside them reads as its
own surface rather than as the same one.

*Four light steps, not five. `--bg-muted` sat 0.4 of perceptual lightness from its neighbour — a
difference nobody can see and everybody had to choose between — and was removed the same day. Its one
consumer, `canonical/dashboard`'s sidebar, moved to `--bg-secondary` and renders unchanged.*

**The layer scale is published.** Take a step from it; do not invent a number. Its gaps are
deliberate, so that something can be slotted between two layers later without renumbering.

### The scrim

Plain black at half strength with a real blur — **the blur does the separating**, so the scrim does
not need to be near-opaque. It is plain black because a tinted scrim pushes its colour through
whatever is blurred behind it.

**A scrim says the layer beneath is unavailable, not merely behind.** Dimming something still usable
teaches people to try anyway.

### Modals

**Three axes, not one list.** **Size** sets how much of the screen it takes. **Orientation** sets the
aspect the content sits in — landscape is not "grows sideways", it is the shape a grid reads well
in, and portrait is the shape a single column of rows reads well in. **Type** decides whether the
body sits on its own inner card. Small has no orientation: it is as tall as its sentence.

**One modal at a time.** A modal that opens a modal is a flow that needed a step, not a layer.

**The dismiss sits outside the shell.** Tucked into the corner it fights the radius; outside, it
belongs to the modal without being part of its surface.

### Where the chrome goes

**Back sits left. Dismiss sits right.** On a page, in a flow, in a modal header — the same two
positions every time. They are different jobs and they must not swap: back walks the flow, dismiss
leaves it.

A page that only has one of them still obeys the side it belongs to. **A back control on the right
is the single most common way a screen reads as somebody else's**, and it happens most often when
modal chrome is carried onto a page, because a modal's dismiss is top-right by house rule and the
two get confused.

*Written down 10 Aug 2026. The rule was real and existed only as a source comment inside
`canonical/start-with-template`, where nothing in the build path was told to look — so a run drew
five page variants with back on the right and no stage could have caught it.*

### Layout

**One to four columns. There is no twelve-column grid**, because nothing here has ever needed one.
Track sizing is `minmax(0,1fr)` so a wide child cannot push a column past its share, and the gutter
matches the modal's padding so a grid inside one lines up with its edges.

**A scroll region that runs to its container's edge fades rather than clips**, one overlay per end,
each toggled from the scroll position with a small dead zone so neither shows against an end that is
already flush.

**Put `min-width: 0` and `min-height: 0` on every flex or grid box between a scroller and its
shell.** Without it the scroller's own content width propagates up as min-content and blows the
parent wider than the viewport — while `document.scrollWidth` stays put, so the capture crops and
nothing reports it.

### Page anatomy

**Name the sections before drawing them.** A page is a short list a person could recite —
a storefront's is header · quote control · plans · the promise · proof · the upward
door. Write the list first; every region on the page belongs to exactly one entry.

**The seams must be visible at arm's length.** The gap between two sections is at least
one full spacing step larger than any gap inside either of them. Proximity is the
primary grouping device: a page with uniform vertical rhythm reads as one squished
column, however good each region is. (Decided 10 Aug 2026, off the hire-an-expert
storefront — six logical sections, no visible seams between them.)

**Escalate devices in order.** Space first. Then a surface change — §2's grey band
against white is the house way to make a section its own place. Then a section header.
A divider is the last resort. "Structure felt, not seen" still governs the *inside* of
a section; between sections, structure may be seen.

**The check: squint.** If you cannot count the sections from the blur, the seams are
not doing their job.

### Registers

Every screen is in one of two registers; when unsure, default to **app**. (Fork-local, from
`pai-visual-language`, 10 Aug 2026.)

| register | surfaces | feel |
|---|---|---|
| **app** | dashboard, editor, settings, empty states | calm room around the user's work — grayscale + navy chrome; the user's content is the hero |
| **marketing / growth** | pricing, upgrade modals, paywalls, offer banners, checkout | more visual energy, in whatever density the job needs: a pricing page is dense by design, an offer banner is one tight line |

**Polished must not feel sterile.** Every surface gets one warming element — a first-name
greeting, a small dimensional illustration (marketing only), a casual aside. One, not several.

**Real product over metaphor.** Imagery is slide thumbnails, real charts, presentation covers at
casual angles — from `assets/`, never grey boxes, never AI-brain metaphors, never stock photos.

**Emoji are a rare accent.** At most one per surface, on the one moment that earns it. Never in
buttons or list items — those keep line icons. When unsure, drop it.

> Rendered: `sticker-sheet.html#surface`, `#modals`, `#scrim`, `#grid`.

---

## 7. What each component claims

Each one asserts something before a word is written. **Pick by the claim.** A component that looks
right and claims the wrong thing is wrong.

| | asserts |
|---|---|
| **card** | this is one thing, and you can act on it |
| **chip** | a filter — something applied, and removable |
| **badge** | a status this thing is in |
| **button** | an action happens when you press this |
| **thumbnail** | content. Not navigation |
| **icon** | navigation, or a category — not content |
| **modal** | this decision is worth stopping everything else for |
| **toast** | an event that has just happened |
| **banner** | a condition that is still true |

### Cards, and the surface underneath them

**The claim comes from the affordance, not the box.** This is the distinction the rest of this
section turns on, and getting it backwards is what makes screens that refuse to group anything.

| | |
|---|---|
| **surface** | a bounded region with a background and an elevation. `.pai-surface-card`. It asserts **nothing** — grouping content is what it is for, and it needs no justification |
| **card** | that surface plus an affordance — `.is-interactive` on a real button, link or label. **Now** it claims *this is one thing, and you can act on it* |

**Do not use a card for something that is not clickable** — the claim is false and people try. But
read what that forbids: **the claim, never the container.** A panel that groups a price and its
terms is a surface and is not the thing the rule is about. Reach for `.pai-surface-card` freely; add
`.is-interactive` only when pressing it does something.

*Written down 10 Aug 2026. The system published a background with the word "card" in its name, no
card component at all, and two rules against misuse — so screens got built with nothing grouped,
which was never what the rule asked for.*

**`.is-interactive` goes on a real `<button>`, `<a>` or `<label>`.** It supplies cursor, hover and a
focus ring; it cannot make a `<div>` focusable, and a div you can click is unreachable by keyboard.

**Hover raises one step of the elevation ladder** — 01 → 02 for a card, 02 → 03 for raised — rather
than inventing a treatment. **Selected outranks hover:** the ring says which one you picked, the
lift only says where the pointer is.

**Do not nest a card in a card.** The inner one asserts it is a separate thing you can act on, and
it is not. Nesting a *surface* inside a surface is a different question and is answered in §6 —
white on white needs the raised step, or nothing says there are two planes.

**Buyable options each get their own bounded surface.** §2 makes grey and white sections the house
way to divide one surface — **a purchase choice is the named exception** (decided 10 Aug 2026, off
the `single-export-vs-pro` run; restated in this section's vocabulary 10 Aug 2026). When a screen
offers two or more things a person can pick and pay for — plans side by side, a one-off against a
subscription — each option is bounded and padded, with its price and its one button inside it. The
bounded region is the unit a person compares and picks; sections read as description, boundaries
read as a choice. They are **surfaces**, not cards: the affordance is the button inside, so
`.is-interactive` belongs on that button and not on the panel. Options need not be equal — one may
be the visibly recommended one — and §7's filled-action ceiling holds across the set.

**Selected is a state, not a variant.** A chip, a tab, a list row — the selected treatment is the
same component in a different state, so it is never a second class.

### Actions

**At most two filled actions on a surface. One is better.** Two equally loud buttons make the person
choose which to read first, which is a decision the screen should already have made. Settled
9 Aug 2026 against a stricter unevidenced rule of one.

**A disabled control owes an explanation.** If the reason is not visible beside it, a tooltip is the
minimum. A disabled control with no reason is a dead end.

**Never make a whole row a link and put a button inside it.** One of the two wins the press and
nobody can predict which.

### A few components with a rule you would not guess

**The tab indicator ships zero-width and is inert without script.** `pai.css` gives it a height and a
transition and no width at all — it has to be measured off the selected item, positioned *before*
the glide transition is enabled so it does not fly in from zero, and re-measured on resize and after
the webfont lands. Copy the tab markup without this and you get a strip with no underline and
nothing to tell you why.

**A tooltip is small on purpose.** If the explanation does not fit, it is not a tooltip — it is
helper text, a popover, or a sentence the screen should have said out loud. Raising the max-width is
the wrong fix.

**Never a native `<select>`.** The published trigger opens the published dropdown unchanged.

**A switcher is one of N mutually exclusive values** — not tabs, not chips — and is built on real
radios so a keyboard and a screen reader get it for free.

**A discount inside a switcher takes a badge, not a coloured word.** A discount is a status.

**A destructive row goes last in a menu, under a divider.**

**A toast is an event; a banner is a condition.** Anything that stays true belongs in the layout, not
in something that disappears — and nothing important may live only in a toast, because it is gone
before somebody returns to the tab. A toast gets one action, and it is the undo.

**A thumbnail is always 16:9.** Give it a width and let it work out its height; if a row needs
shorter thumbnails it needs narrower ones. When a picture is not 16:9, crop it — never squash it. An
empty one shows the sunken grey, not white and not a spinner.

**A skeleton must be the shape of what is arriving.** One that does not match the layout it becomes
produces a visible jump, which is worse than a spinner that promised nothing. And if you know the
proportion, do not use a spinner at all.

**A progress bar does not say what is progressing.** Name the work and the units beside it —
"Generating 12 of 20 slides".

> Every component rendered, with markup to copy: `sticker-sheet.html`. Thirty-four sections, each
> anchored — `#buttons`, `#badges`, `#chips`, `#tabs`, `#switcher`, `#listitems`, `#dropdowns`,
> `#links`, `#dividers`, `#inputs`, `#selection`, `#avatars`, `#surface`, `#grid`, `#ticker`,
> `#chart`, `#thumbnail`, `#prompt`, `#file`, `#progress`, `#spinner`, `#timeline`, `#shimmer`,
> `#tooltips`, `#search`, `#table`, `#toast`, `#type`, `#elevation`, `#colour`, `#modals`, `#scrim`,
> `#rounding`, `#spacing`.

---

## 8. Icons

**Phosphor, vendored, outline.** No second icon set, and no hand-drawn SVG where a Phosphor glyph
exists. A screen that needs a glyph Phosphor does not have is a conversation, not a licence to add
one.

**One exception, and it is published.** `.pai-icon-brand` requires the **fill** weight: a gradient
clipped to a thin outline shows a stroke or two of the ramp and reads as a flat mid-blue. If your
screen uses it, load the fill sheet — otherwise the icon renders as the exact failure the component
exists to avoid.

**Size an icon, never inherit it.** Phosphor is a font, so a glyph silently takes its parent's font
size — which is how a button icon ends up at the button's text size.

**The icon sizes are container sizes, and the container is the glyph's own em box.** It is not
trimmed to the ink and must not be: the ink fills between roughly two thirds and nine tenths of the
box depending on the glyph, so two icons at the same size read at different weights. That is the
typeface's decision, not a bug.

**Equal space on all four sides.** An icon in a button or a badge inherits the padding of the label
beside it unless you adjust for it, and that reads as a nudge to one side.

**Top-align an icon with a label that wraps.** Centring works for one line and looks broken on two.

**A control leading a stacked label aligns to the label's first line, not to the top of its block** —
`.pai-radio-stacked` / `.pai-checkbox-stacked`. Top-aligning the boxes is not the same thing: the
first glyph sits lower inside its line box by the leading, so the control comes out visibly high.
Measured on a 14px/20px first line beside the 16px control, `flex-start` lands **−4.5px**, `baseline`
**−3px**, `center` **+7.5px** — that last one because it centres on the whole two-line block, which
is what the annotation about two-line labels forbids. 4px closes it to −0.5px.

**An emoji appears where expressiveness is the point** — a countdown, a celebration, an empty state
with some personality, a nudge that wants to feel human — and nowhere else. Phosphor is monochrome
and even-weighted: the right instrument nearly everywhere, and the wrong one when the job is warmth.

> Sizes and the size-to-component mapping: `pai.css`.

---

## 9. Staying on the system

The techniques for writing a screen that holds up. Most of these exist because a real screen got
them wrong first.

**Derive a colour, never write a new one.** Where you need a brand colour at partial strength, take
it from the token:

```css
color-mix(in srgb, var(--bg-brand) 55%, transparent)
```

so the value follows the brand rather than freezing today's hex.

**Derive an offset the same way** — `calc(var(--space-2xs) * -1)`, not a negative literal.

**Comment the literal where it sits, not in a document.** Every value that survives on purpose
carries its justification on the line above it. A handover note scrolls away; the linter and the
next reader both land on the declaration.

**Name the published class in a comment where a local rule does not set it.** A rule that sets
layout but not type should say `/* type is .text-body-sm-medium */` and carry that class in markup —
otherwise the next reader concludes the type was forgotten.

**Markup generated from script carries its published classes too.** A class set from JavaScript is
still a design-system class, and the linter reads the file, not the DOM.

**Drive a repeated region from one data table** with a legend naming its columns, and let every
consumer read the same rows. A per-row variation is a set beside the table, not a flag repeated in
every row.

**Mark invented copy in the data**, at the row it belongs to, so it is never mistaken for shipped
copy.

**Where the system publishes nothing, say what you did.** That territory is smaller than it looks:
radius, spacing and easing all have tokens. **Duration is the one genuinely open value** — pick one,
and say so in the handover.

**When a value changes under a screen already built and judged, pin the old value in that screen**
in a dated block that says what moved and that the screen has not been migrated. A past screen is
the record of what was built; if it re-renders differently, the lint and the judgements filed beside
it stop describing it. Migration is then deliberate and one screen at a time.

**No `style=` attributes, and no literal the system could have given you** — not in markup, not in a
`<style>` block.

---

## 10. Changing this file

**A rule is not finished until it names its tokens.** The mirror of the token rule next door:
adding a token is not finished until something uses it.

**Every token named here must exist in `pai.css`.** That check belongs in the lint, so prose can
never drift into describing a token that has been renamed away.

Where a new rule goes:

| the rule | its home |
|---|---|
| came from looking at a real screen | `designs/*/annotations.jsonl` — with the selector that proved it |
| a machine can check it reliably | `tools/lint/pai-lint.py` |
| what a token or component *means* | here |
| **how to compose a screen out of them** | **`.claude/skills/atlas-build/reference/principles.md`** |
| a value | `pai.css`, and only there |
| markup somebody will copy | `sticker-sheet.html` |
| nobody has decided yet | `coverage-gaps.md` |

**Here or `principles.md`? Three tests, and the first decides most cases.**

| | here | `principles.md` |
|---|---|---|
| Delete every screen ever built. Is the rule still true? | yes — it is a fact about the system | no — it only means something about a screen being made |
| Can you check it without knowing what the screen is *for*? | yes, countable or lookup-able | no, it needs the screen's intent |
| When the rule changes, what happens to what is already built? | every screen may now be wrong, and you owe a migration | future screens are drawn differently; past ones are not retroactively wrong |

The grammar follows: a rule here **names an object and its property** — *"a divider inside a card
runs edge to edge"*. A principle **names a relationship on a screen** — *"nothing competes for
attention it has not earned"*.

The two often sit on one subject and are not duplicates. *"At most two filled actions on a
surface"* is here because you can count it. *"Nothing competes for attention it has not earned"* is
a principle because you cannot judge it without knowing what the screen exists for. One is a limit;
the other is the reasoning that produced it.

**A fact may carry a consequence; a consequence alone is not a fact.** *"A content card takes
`--rounded-base`"* belongs here, and *"if you reach past it, say in the handover what makes this
surface the page's subject"* rides along. If all you have is the second half, it is a principle.

Getting it wrong costs both ways. A principle smuggled in here is unenforceable and dilutes a file
whose whole value is that everything in it can be checked. A fact stranded in `principles.md` is
invisible to the linter, to the fixer, and to anyone reading the system rather than the skill — and
it drifts. That second failure is why this file gained a radius rule, a selected state, a chrome
rule and an assets rule on 10 Aug 2026: four facts stranded in code comments, a canonical screen and
a roster nothing read.

**Name an exact object and a consequence.** "A divider inside a card runs edge to edge" is a rule.
"Dividers should be clean" is not, and cannot be checked, followed or argued with.

**This file is read by more than one stage** — the build draws from it, the fixer edits against it,
a person reads it before opening Figma. It carries facts about the house. It does not carry the
build's principles or the judge's rubric, and it must never share sentences with either: a builder
holding the judge's tests writes the screen the judge is primed to approve, and the pass reads clean
because they agree rather than because it is good.

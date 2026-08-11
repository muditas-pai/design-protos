# Dashboard

The screen the app opens on. A fixed sidebar, a scrolling main column, and three bands inside it:
what you could set up, what you came to make, and what you already made.

Rebuilt on the design system, 6 Aug 2026, from Figma **JAS '26 Handoff** `101:485`
*"Dashboard - entry"*. The frame is a 600px crop of a **1440 × 983** page.

**The first full screen in `canonical/`.** Everything before it was a modal — one surface with one
job, where the design system does most of the work. A whole page is a different test: it has to
hold a layout together, not just a component.

## What it gets right

**The prompt is the screen.** Not a search field in a header, not a button that opens a dialog —
the thing you came to do is the largest object on the page, centred, at the top, already focused
on you. Everything else is arranged around it: a nudge above, three other routes below, your
existing work beneath the fold.

**The three ways in are peers, not a menu.** Import PowerPoint, Hire an Expert, Use a Template sit
in a row under the prompt at equal weight. Somebody who does not want to type has three visible
alternatives without opening anything, and none of them is buried in the sidebar.

**The upsell is quiet and everywhere.** Five `PRO` badges — Create project, Use a Template, Invite
new member, Brand Kit, and the workspace's own Upgrade — and not one of them interrupts. The trial
countdown is the only thing with a colour and it still fits in a 36px row. The screen sells
constantly and never blocks.

**The CTA is disabled, not grey.** *Create Presentation* looks grey because it is
`.button-primary` at 40% — the primary button in its disabled state — and it comes alive the
moment there is something to submit. That is a different claim from a grey button: it says *this
is the action, and it is not ready yet* rather than *this is a secondary thing*. Type into the
prompt and watch it.

**The sidebar's bottom two rows are pinned.** Workspace settings and Invite new member sit against
the bottom edge whatever the height, above their own rule, so the destructive-adjacent and
administrative rows never mix with the ones you use to work.

## Where the design system asserted itself

| | source | here |
|---|---|---|
| **the whole prompt** | bespoke | **`.pai-prompt`**, published — see below |
| sidebar rows | bespoke | `.listitem` · `-medium` · `-interactive` · `.is-selected` |
| the five PRO badges | bespoke | `.pai-badge .pai-badge-pro` |
| document tabs | named `chip` in the handoff, drawn as tabs | `.tabs-strip .tabs-track` + `.tab-item` + the published sliding `.tabs-indicator` |
| list / grid toggle | 46 × 28 | `.pai-switcher .pai-switcher-small .pai-switcher-icons`, which lands at 54 |
| toolbar buttons | 28 tall | `.button-style .button-small .button-tertiary` |
| action chips | 40 tall | `.chip-style .chip-medium .chip-default`, 36 |
| dividers | bespoke | `.pai-divider` |
| avatars | 28 and 34 | `.pai-avatar-small` 28 and `.pai-avatar` 36 |
| the fire emoji | 🔥 | `ph-fire`. An emoji is a different typeface on every OS, and the render stage judges the picture |
| every icon | mixed | Phosphor, vendored, regular only |

### The prompt is published now, and it came from here

The first draft of this screen hand-rolled the prompt: a grey shell, a brand strip, a white box,
a toolbar. Between that draft and this one, `pai.css` gained **`.pai-prompt`** — and its comment
reads *"Ported from the dashboard launcher (Figma 101:592)"*, which is the node inside the very
frame this file is built from.

So the local version is gone and **this screen writes no CSS for the prompt at all.** What is left
is the one thing the component leaves to its consumer: toggling `.is-focused`, the same way every
dropdown here opens itself.

Three things moved by taking it, and all three are the component's decisions rather than mine:

| | mine | the component's |
|---|---|---|
| tint | `--bg-muted` | `--bg-tertiary` |
| elevation | `--elevation-02` | `--elevation-03` |
| the white box | inset 4px on three sides | **flush** to three edges, carrying its own stroke |

That last one is the real change and it is better: the card stops being a frame around the box and
becomes the strip the box hangs from, which is what the tint was there to do all along.

**Two heights are not written down anywhere.** The trial row and the brand-kit row both needed to
land on a published control rung — 36 and 44 — and neither has a token. Rather than assert the
number, both are **padding-driven**: a 28px button inside 4px of padding is 36; a 20px line inside
12px is 44. The rung is hit without a literal, and if the control inside ever changes size the row
follows it. See the gaps below — this is a real hole, not a trick.

## What is not a faithful copy

**The deck covers are 16:9, not the handoff's 366.5 × 202.** That placeholder is 1.814:1 — four
pixels off the ratio every deck in `assets/decks/` is actually rendered at. A cover letterboxed by
4px is a cover nobody framed.

**Three different decks, not one placeholder three times.** The handoff repeats *"McKinsey acquires
S4G Consulting…"* across all three cards. Three real covers from the shared library is what the
shelf actually looks like, and it is the only way to see that the card copes with a long title and
a short one.

**The list view exists.** The handoff draws only the grid, so the other half of that switcher was
never designed. It is built here as the smallest honest thing — same cards, one per row, cover
shrunk to a 96px thumbnail — because **a switcher whose other half does nothing is a control that
lies**, and this folder is screens that are right rather than screens that are faithful.

**The three empty tabs say what is empty.** Starred, Download and Recently deleted have no design
and would otherwise be a blank page under a selected tab, which reads as broken rather than empty.
One sentence each, naming the shelf.

## What is hardcoded, and what is not

Audited with `tools/lint/pai-lint.py`: **zero errors.** The first canonical screen to reach that.

Three errors were live at first draft and all three had a real answer rather than a justification:

| | the linter offered | what was actually wrong |
|---|---|---|
| `height: 36px` | `--space-2xl` (32) | the height should not have been asserted — padding gets there |
| `height: 44px` | `--space-4xl` (48) | same |
| `font-size: 32px` | `--space-2xl` (32) | an empty-state icon at a display size the system does not publish. The icon was repeating the sentence under it, so it went |

Taking any of those three offers would have changed the design to match a coincidence — a spacing
token is not a control height and is not a font size. The right move each time was to stop writing
the value at all.

**One literal remains, and it is a gap rather than a choice**: `#D04423` on the PowerPoint logo.
See below.

## Gaps this found in the design system

### Two closed while this screen was being built, both from here

**The brand gradient is a value now.** It was written inline inside
`.button-gradient-primary` and nowhere else, so the second thing that wanted it — these three
icons — would have had to copy the four stops. It is `--gradient-brand-03` in `:root`, and the
button points at it. The README lists `backgroundImage` among the Tailwind-only exceptions because
gradients are *"composed, not single values"* — but `--elevation-04` is seven composed shadows and
is a variable, so composition was never the reason a thing could not be one.

**The icon-sizing rules only saw one weight.** Phosphor names each weight with its own family
class — `.ph`, `.ph-fill`, `.ph-bold` — and every sizing rule in `pai.css` was written against
`.ph` alone. A filled icon in a chip therefore got none of them and fell back to the chip's own
14px text size. All fourteen selectors now read `:is(.ph,.ph-fill,.ph-bold)`. Until this, two of
the three vendored weights were shipped but not supported.

### Still open

**The rest of the product one-off colours cannot be reached from plain CSS.** `ppt-500`
(`#D04423`), `linkedin-500`, `gold-*`, `darkblue-*` are published in `pai.tailwind.js` and
**nowhere else** — no CSS variable behind any of them. The README's own rule is *"a value is
written once, as a custom property in `:root` in `pai.css`"*; these invert it. This screen no
longer needs one (the PowerPoint logo takes the brand gradient with the other two), so it is no
longer blocking anything here — but the next screen that wants a product colour will hit it.

**Control heights are component values with no tokens.** 28 · 36 · 44 govern buttons, avatars,
chips, switchers and inputs, and anything local that must line up with one has to know the number.
Padding-driving it works and is arguably better, but it only works when you control the contents —
and the sidebar's `Projects` heading is the case where you do not. Its text is 12px on a 16px line
and it has to occupy a 36px row, which no combination of scale steps reaches. It is the **one lint
error this screen carries**, and the linter offers `--space-2xl` because 32 is near 36; taking it
would drift the whole group 4px off the handoff's rhythm to satisfy a spacing token that does not
govern control heights. **Third screen to want this.** A `--control-{sm,md,lg}` would close it.

**A workspace is not a person.** `.pai-avatar` is the only published shape for "a small square
identifying someone", and it is round by rule. That is right for a face and wrong for an
organisation — squaring it would break every avatar, and rounding this one crops a logo drawn to
fill its box. So the workspace tile is local: 28px to match `.pai-avatar-small` so it lines up with
the profile picture in the top nav, white behind it because a brand logo is drawn against its own
background rather than a grey panel.

**`.button-style` spaces a leading icon and not a trailing one.** The published mechanism is
`.button-label`, which sets `margin-left` when it is not the first child — so a button with a
caret after the word has nothing, and the caret sits against the text. One local rule here.
`.chip-medium` gets this right with a plain `gap`, which is the tell: two components solve the
same problem two ways and only one covers both sides. **Still open after design-system round 2 —
the sticker sheet's own prompt has the caret against the word too.**

**No icon size above 20px.** `--icon-{xs,sm,md}` stops at `--icon-md`. An empty state, a zero-state
illustration or a feature callout all want something in the 32–48 range and there is no rung for
it.

**`.pai-badge-pro` sits exactly on the contrast threshold — 4.50:1 against 4.5.** `origin:
published`: both ends are `pai.css:452`. It passes, but only just, and *because its fill is
translucent the ratio depends on what is under it* — on this screen's `--bg-muted` sidebar it
lands on the line; on white it has a little more room. A badge whose contrast changes with its
surface is worth knowing about before it lands on something darker.

**`pai.css` still sets `box-sizing` nowhere.** Fourth canonical screen carrying the same reset.

## Notes

**Every state is in the URL** — `?tab=recent|starred|download|deleted` · `?view=grid|list` ·
`?typed=0|1`. `typed=1` fills the prompt so the enabled CTA can be linked to directly.

**The decks are the shared library**, `assets/decks/`, at `card/` size (800 × 450). Not local
copies, and not exports — the same three covers any other screen would reach for.

**The sidebar is `--bg-muted` and the main column `--bg-subtle`**, which is exactly what those two
near-white steps are published for: *"main column and top nav, then side panel one step darker so
it reads as its own surface"*.

**One thing the handoff does that HTML cannot.** Its placeholder underlines *"upload a file"* —
a placeholder is a plain string and cannot carry markup. Left plain rather than faked with an
overlay, which would break the moment anyone typed.

**`Projects` is a heading, not a row.** It is not a `.listitem`, because nothing happens when you
press it.

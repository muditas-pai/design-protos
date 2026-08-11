# Deck analytics

Who read the deck, how far they got, and how long they spent on each slide. **Two steps in one
modal**: step 1 is the deck across its whole audience, three metrics on tabs; step 2 is the same
deck through one person's session. A viewer row is the door between them.

Rebuilt on the design system, 6 Aug 2026, from four frames in the Figma **JAS '26 Handoff**:
`334:3748` (deck, median time) · `334:4199` (completion) · `334:4443` (views) · `334:4915` (viewer
drill-down). The editor behind the scrim is deliberately not built — it is another screen's job.

## What it gets right

**The drill-down is the same screen, not another one.** The shell, the width, the dismiss and the
panel never move; only the header swaps and the body changes. A person going one level deeper does
not experience an arrival, which is what makes the back arrow feel like a step rather than a
navigation.

**The stat is the tab.** Three figures sit across the top and the one you are looking at is
underlined. Nothing is labelled "tab", there is no second row of controls, and the summary you came
for is the same object as the control that changes the view. Three metrics cost zero extra chrome.

**The list of slides is the deck.** Titles in order, a bar each, a duration on the right — so
"where do people stop reading" is answered by scanning down a column rather than by comparing
numbers. The two slides nobody reaches are still listed, at 0 sec, with an empty track: a slide
nobody opened is a finding, and dropping it from the list would hide the most useful thing on
the screen.

**Every viewer row is a question you can follow.** The aggregate answers "how did it go"; one click
answers "how did it go *for them*". The two are one gesture apart because the row itself is the
control.

**One person's numbers add up to that person's total.** The row says 4:11; the eight slide times on
their drill-down sum to 251 seconds. That is the difference between a screen you can trust and a
screen that merely looks like data.

## Where the design system asserted itself

Barely anything had to move — **`pai.css` was ported from this Figma file**, so the tokens on both
sides are the same tokens. `elevation-2/3/4`, `heading-2xl`, `body-base`, `body-sm` and
`overline-small` all matched exactly, tracking included.

| | source | here |
|---|---|---|
| modal width | 808 | `.pai-modal-portrait` — which publishes `min(808px, 92vw)` and whose comment reads *"the analytics modal's, measured off JAS '26"*. **This is the screen that width was measured off.** |
| shell | grey header, white card | `.pai-modal` + `.pai-modal-panel`, whose `0 4px 4px` padding is exactly the handoff's header at x=4 w=800 and panel at y=80 |
| dismiss | 28px at +8 | `.pai-modal-dismiss`, which puts it there itself |
| per-slide bar | 8px, pill, light-blue→brand | `.pai-progress` — 6px, `--rounded-sm`, navy→brand. Three deltas, all taken |
| stat tabs | bespoke | `.tabs-strip .tabs-track .tabs-stretch` + the published `.tabs-indicator` |
| viewer list | bespoke rows | `.pai-table .pai-table-interactive`, whose overline header is already what the handoff drew |
| back control | 44px icon | `.button-style .button-large .icon-only .button-ghost` |
| avatars | 32 and 48 | `.pai-avatar` 36 and `.pai-avatar-large` 44 — neither source size is on the published scale |
| chart tooltip | bespoke | `.pai-tooltip` + `.text-overline-small` |
| donut fills | blue · green · yellow | `--bg-brand` · `--bg-success` · `--bg-warning` |

**The per-slide bar is the one visible loss.** The handoff draws a light blue that deepens to
brand; `.pai-progress` publishes navy that warms to brand, and eight of them stacked read
considerably heavier than the handoff does. It is taken as published anyway — the ramp is a
deliberate, documented decision (*"the bar warms toward the brand as it completes"*), this is the
second canonical screen to use the component, and a screen that forks it is a screen that teaches
the next one to fork it differently. The comparison is a design-system question, recorded below,
not a licence to diverge here.

## The handoff does not agree with itself

Five ways. Worth setting out, because the resolution is the same rule each time: **where a
consistent number could be derived, it was; where it needs a product definition, it is flagged and
left alone. Nothing here is an invented figure.**

The root cause is visible once you line the frames up: **the bar geometry in both charts is the
same twelve heights reused** — `249, 146, 104, 104, 91, 91, 57, 66, 57, 20, 20, 7`. That is
placeholder shape, not data, so nothing derived from it was ever going to reconcile.

| | the handoff | here |
|---|---|---|
| **slide count** | 6 (aggregate) · 8 (drill-down) · 12 (completion chart) | **8.** The only count stated as *content* — the drill-down names all eight. Six and twelve are frame heights |
| **per-slide bar width** | does not track its own label: 13 sec drawn wider than 20 sec | derived from the seconds beside it, against the longest slide |
| **chart tooltip** | reads 72% while sitting on a bar drawn at 35% | reports the bar it is on. The one defect here that could only be a wiring mistake |
| **views chart** | 12 daily bars summing to ~156, headline says 128 | the handoff's *shape*, apportioned to land on 128 exactly, largest-remainder so the parts sum to the published total rather than near it |
| **completion rate** | curve ends at ~25%, headline says 78% | **left alone, and flagged** — see below |

### The one that is not reconciled

**78% completion and a drop-off curve ending at 25% do not meet under any reading.** Not as
"finished the deck" (that would need the last bar at 78). Not as an average across slides (the
curve averages 32). The gap is not arithmetic — it is that **"completion rate" has no definition
here**, and picking one is a product decision, not a number I can derive.

So both are shown exactly as designed and this paragraph is the note. Deriving a reconciliation
would have meant inventing the definition and hiding that I had.

## What is hardcoded, and what is not

Audited with `tools/lint/pai-lint.py`: **two errors, two proposals.**

| | |
|---|---|
| shell, radius, elevation, width | `.pai-modal` · `.pai-modal-portrait` · `.pai-modal-panel` |
| the scrolling region | `.pai-modal-body` — the published arrangement, used as intended |
| dismiss and back | `.pai-modal-dismiss` · `.button-style` |
| tabs | `.tabs-strip` · `.tabs-track` · `.tabs-stretch` · `.tab-item` · `.tabs-indicator` |
| per-slide bars | `.pai-progress` · `.pai-progress-bar` |
| viewer list | `.pai-table` · `.pai-table-interactive` · `.pai-table-numeric` |
| avatars | `.pai-avatar` + the accent tints |
| tooltip | `.pai-tooltip` |
| all type | the published ramp, `overline-small` included |
| every gap, pad, radius, colour | `--space-*` · `--rounded-*` · the semantic layer |

**Both errors are design geometry**, and both are cases where the linter offers `--space-4xl`
because the number happens to be 48: the header thumbnail's `85.33 × 48` box (16:9, the handoff's
own) and the 48px column reserved for `22 sec`. A spacing scale governs neither an image's aspect
nor a reserved text column.

## Gaps this found in the design system

**The published table header fails contrast, and it is not this screen's fault.** `.pai-table th`
is `--text-tertiary` on `--bg-elevated` — **2.52:1 where 4.5 is needed**, at 10px semibold. The
linter marks it `origin: published`: both ends come from `pai.css`, so it is a finding about the
design system rather than about this screen. **It is deliberately not patched locally.** Every
table on every screen has it, one screen quietly fixing it would hide it, and moving
`--text-tertiary` is a change with a blast radius that belongs to whoever owns the token. This is
the sharpest thing this screen turned up.

**There are no chart primitives at all.** No plot frame, no axis, no gridline, no vertical bar, no
donut. `.pai-progress` is the only bar the system has and it is horizontal by construction. Both
charts, both donuts, the axes and the gridlines are local — comfortably the largest single gap
either canonical screen has produced, and the reason `stroke-width` shows up as a silent property.

**`.tab-item` has the behaviour but not the shape.** It is published as a 40px single-line label.
This tab is a figure over a label, 87px tall and left-aligned. The track, the sliding indicator and
the selected weight are all the component's; only the box is overridden. A `tab-item-stat` — or
simply a taller variant that does not centre — would close it.

**The avatar scale has no 32 and no 48.** The handoff uses both. 28 · 36 · 44 are sized to the
control heights, which is the right principle; these two just are not on it.

**`pai.css` still sets `box-sizing` nowhere.** Third canonical screen carrying the same local
reset.

## Notes

**Every state is in the URL** — `?view=deck|viewer` · `?tab=time|completion|views` ·
`?viewer=1|2|3|4`. The demo switcher top-left only moves between the two steps; the real controls
are the tab strip and the viewer rows.

**The deck thumbnail is the shared library**, `assets/decks/palantir-q1-investor/`, not a local
copy and not a Figma export — those URLs expire in seven days, and the register matches (investor
/ business review). The viewer avatars are Phosphor `ph-user` in `.pai-avatar`, not images.

**The four avatar tints are the published accents** — `danger`, `warning`, `info`, `success` — used
the way the system describes them: *"where the colour is the only thing distinguishing one seat
from the next"*. The handoff's first viewer is pink, which has no published equivalent; `danger` is
the nearest, and reads as a tint rather than an alert at this size.

**A day with no views keeps a hairline.** A zero-height bar is invisible, and invisible reads as
"not measured" rather than "measured, and it was nothing".

**One string differs from the handoff by design.** The drill-down header shows the clicked viewer's
own duration and last-opened, so opening viewer 1 says 2:21 rather than the deck median of 3:12.
The handoff shows one viewer's numbers on every viewer.

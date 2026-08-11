# Start with a template

Picking a template and turning it into your deck. **A flow, not a screen** — four steps you can
walk end to end, from a shelf of templates to a deck being written.

Rebuilt on the design system, 7 Aug 2026, from Figma **JAS '26 Handoff** `1:2798` *"Use a
Template"*. The board carries six frames; the first is the dashboard, which is already its own
canonical screen, so this is frames two to six.

## Four steps, one file, one each

These are **not four states of one screen.** They are four screens in a sequence, each with its own
layout and its own logic — and the harness has no word for that. `atlas-checklist` defines a state
as *"every state the finished thing will ever be in"* and then says *"a run works one of them"*;
everything downstream of the brief scores a single screen.

They are declared as states anyway, because `?state=` is the only addressing mechanism
`tools/render/render.py` has. The word is borrowed; the pictures are the point — without the
declaration the render photographs the gallery four times and calls it a flow.

```
?state=gallery      ?state=detail      ?state=context      ?state=generating
                     + ?typed=0|1  ─────────┘
```

`?step=` still reads, so links written before this survive; the screen rewrites the address bar to
`?state=`. An undeclared state shows a red banner rather than screenshotting as a clean gallery —
try `?state=editor`, which is one of the two steps the board names and never draws.

**One file on purpose.** Split into four and the strongest claim below — that the template you
picked never leaves — stops being something you can verify by reading and becomes a sentence
repeated in four places. The steps share `PICKED`, the deck library, the bar and the asset helper;
that cohesion is what makes them agree with each other, which is most of what makes them right.

Each step, and the layout question it settles:

| | selector | what to open it for |
|---|---|---|
| **gallery** | `.tw-gallery` · `.tw-grid` | A shelf. `repeat(auto-fill, minmax(320px,1fr))` capped at 1148 — three across at the design width, two below ~1000 rather than three squeezed past legibility. Cards are `canonical/dashboard`'s, unchanged: **a template and a deck are the same object on a shelf** |
| **detail** | `.tw-detail` · `.tw-strip` | A layer over a screen that stays mounted, so returning is obviously reversible. Preview + info at `min(1120px, 100% - 48px)`, both columns shrinking in proportion. The filmstrip runs past the panel edge on purpose — cut off by the panel, never by an invisible line inside it |
| **context** | `.tw-context` · `.tw-context-slides` | The two-pane split. `minmax(0,1fr)` + `clamp(360px, 41.25%, 640px)` — **the handoff's ratio rather than its number**, so 752/528 holds at every width. The tint is what makes an unequal division legible; without it both halves are one surface and it reads as a lopsided margin |
| **generating** | `.pai-timeline` · `.pai-rewriting` | A long job, written down, beside the deck it is rewriting. **Both parts graduated** — the step is now the worked example rather than the source. Open it for how a log differs from a progress bar, and for the third thing content can be doing besides absent and refreshing |

## What it gets right

**The template you picked never leaves.** Its cover is the card you clicked, its slides are the
filmstrip under the preview, and the same slides sit beside the prompt while you describe your
deck — then blur in place while it is rewritten. Four steps and you never lose sight of the thing
you chose. That single continuity is most of why this reads as one flow rather than four screens.

**The detail is a layer, not a destination.** The gallery stays mounted and visible behind the
scrim, so opening a template is obviously reversible — you can see exactly what you came back to.
The handoff draws it that way and it settles the question of whether these are one surface or two.

**The card answers "what is in this?" without opening it.** The handoff's own note on the gallery
frame reads *"On hover, thumbnail should show different slides"*, and it is right: a template is
15 slides and a cover tells you almost nothing. Hovering cycles four of them behind a progress
row, crossfaded — and it resets on leave, so the shelf is never left showing a card part-way
through a deck nobody is asking about any more.

**The prompt is the dashboard's prompt, whole.** Brand strip included — the same
`Set up Brand Kit…` offer, the same `ph-swatches`, the same `Pro` badge. It was left out of the
first draft on the reasoning that the template had already decided the deck's identity, which is
wrong on inspection: a template decides the *layout*, and a brand kit decides the logo, the colours
and the voice. Those are different questions, and the second one is still open at the point this
screen asks it. Two screens one click apart now offer it identically.

**The dashed edge is a promise the screen keeps.** It says *you can drop a file on me*, so it
accepts a drag and lights up when one is over it. An affordance that only looks like one is worse
than none.

**Submit is disabled until there is something to submit.** Same as the dashboard: it is
`.button-primary` at 40%, not a grey button — the action is named and simply not ready.

## Where the design system asserted itself

| | source | here |
|---|---|---|
| the template card | bespoke | the card `canonical/dashboard` settled from `663:1769` — one clipped container, cover flush, `--elevation-01`. **A template and a deck are the same object on a shelf** |
| category row | called `chip` in the handoff, drawn as tabs | `.tabs-strip` + `.tab-item-small` + the published `.tabs-indicator` |
| search | bespoke | `.pai-search.pai-search-large` wrapping a real `.pai-input` — a size the **wrapper** states |
| both prompts | bespoke | `.pai-prompt` whole — brand strip, `.pai-prompt-toolbar` and `.pai-prompt-submit` |
| the detail shell | bespoke | `.pai-modal` · `.pai-modal-dismiss` · `.pai-scrim` |
| author | bespoke | `.pai-avatar-small` + `.pai-link-inline` |
| the run's spinner | bespoke | `.pai-spinner-md` |
| every icon | mixed | Phosphor, vendored, regular and fill |

## What is hardcoded, and what is not

Audited with `tools/lint/pai-lint.py`: **zero errors, zero proposals.**

It was two for a while, both the same 6px on the run log's dot. The linter offered `--rounded-md`,
which is 6px — but it is a **radius**, and a radius standing in for a diameter resizes the dot the
day the rounding scale moves. The real finding was that the spacing scale steps 4 → 8 with nothing
between, so **nothing on it could draw a 6px dot.** That is now resolved in the right place rather
than worked around here: the dot moved into `.pai-timeline`, and the component owns the number.

Which is the general shape. A literal a screen cannot avoid is usually a component the system does
not have yet, and the lint error is how you find out.

Seven errors were live at first draft and every one had a real answer rather than a justification:

| | the linter offered | what was actually wrong |
|---|---|---|
| `height: 2px` on a progress pip | `--space-3xs` | it *is* the hairline step — taken |
| `background: var(--white)` | `--bg-elevated` | a component must use the semantic, never the ramp — taken |
| `font-size: 1rem` on the textarea | `--icon-sm` | the size is on the type ramp; the element takes `.text-body-lg-regular` and the rule stops naming a size |
| four offsets in the run list | radius and spacing tokens | the dot was a pseudo-element pinned with pixel nudges. Making it a **real element** removed all four at once |

That last one is the pattern worth keeping: four literals in one block usually means the layout is
being faked rather than laid out.

## What is not faithful, and why

**The run log describes this deck.** `1:3294` is a **pasted screenshot**, not a design — the board
says so beside it: *"Will work on a shader for this loading state."* Its steps read *"Refining
Financial Narrative"*, *"Analyzing Financial Performance"*, *"Searched Duolingo"* — a different
deck being generated, shown next to a studio capabilities template. A run log that describes
somebody else's deck is the same defect as a bar that contradicts its own label, so the **shape** is
the handoff's and the **words** say what this template and this context would actually produce.

Being a screenshot, it carries no layer positions — every number below was read off its own pixels
(`1:3319`, placed at 350 × 267, so its pixels are frame units):

| | reference | here |
|---|---|---|
| row pitch | 32 | 32 — 14/20 type on `--space-sm` |
| label ink | `rgb(82,82,82)` | `--text-secondary` — **exact** |
| dot | 6, `rgb(163,163,163)` | 6, `--text-tertiary` — **exact** |
| connector | `rgb(205,205,205)` | `--border-quaternary` (212) |
| spinner | 14 ink, brand blue | `.pai-spinner-sm` |
| header ink | `rgb(84,84,84)` | the same ink as the labels |

**The colours are what changed the design, not the spacing.** Every dot in the reference is the same
grey and every label the same ink — it draws no done/pending split at all. This was built with four
rows at primary behind a blue dot and two greyed ahead of them, which is a **progress bar wearing a
log's clothes**: it claims to know how many steps there are and how far along it is, and a
generation run knows neither. What the reference shows is a log — every line is something that *has*
happened — with the live thing in the header and the line being written marked as in flight.

### Then the component itself turned up

The same thing exists in production: `pitchdeckdoclist`'s chat flow loader — `ClipEBlock.jsx` draws
the timeline, `ResearchProgress.jsx` the header — which is presumably what `1:3294` is a screenshot
*of*. Reading it settled every open question and **corrected two readings taken off the pixels**:

| | measured off the screenshot | what the component says |
|---|---|---|
| the active row | a static fade at the tail | a **shimmer** — `.timeline-shimmer`, a lighter band sweeping through the label on a 1.2s loop. The screenshot had simply caught it mid-sweep |
| header vs labels | header 10px to the left | both at **36**. The offset was a bug, since fixed — aligning them was right for a better reason than the one I had |

Everything else it confirmed, to the pixel: a 24 column with the dot centred, `pl-3` to the label,
a 6px bullet in `text-tertiary`, `min-h-7` + `pb-1` = the 32 pitch, `text-sm` normal secondary going
medium when open, and the expand as `grid-rows: 0fr → 1fr` over 280ms. The rail is **broken around
the bullet** — a 6px stub above and a growing segment below — which is why it stays joined when a row
opens and gets taller.

And it settles the blue dot in its own words, in a comment sitting right beside it: *"Dot stays grey
even while active — the shimmering heading already signals the loading state, so no blue accent
here."*

**So it graduated.** A thing two places need is a component, not a screen's local CSS — the run log
is now `.pai-timeline` in the design system, with a sticker-sheet specimen and a README entry, and
this screen writes three rules for it: where it sits, how far it is from the head, and the one
colour that is this screen's rather than the component's. That is where reuse actually lives; a
canonical screen is where you see components **composed**.

**The blur went with it, as `.pai-rewriting`.** The system already drew a distinction it had only
half-written: `.pai-skeleton` for content that is absent, `.pai-shimmer` for content that is present
and being worked on — with a comment insisting the shimmer keeps its content **readable**, because
*"a screen that hides what it has while refreshing it reads as a screen that lost it"*. The slides
here are a third case that neither covers: present, and being **replaced**. Reading a deck's copy
while it is being rewritten means reading something about to be wrong, so this one hides it on
purpose. What survives is identity — shape, colour, count, position — which is what still says
*this is your deck* while saying *not these words*. It carries no sweep, because the timeline beside
it is already saying what is happening; on its own it is not a loading indicator.

One thing the move cost, worth recording because it will happen again. The component's caret rule was
written as `:is(.ph,.ph-fill,.ph-bold)`, and `cascade.py` does not parse `:is()` — it marks the rule
unsupported and strips the parenthesised part off the subject, leaving a selector that matches every
element. On a `font-size` rule that is harmless (fourteen of those exist and the fixtures stay
green). On `-webkit-text-fill-color` it made the text colour undecidable everywhere and took
**thirteen contrast expectations** down in fixtures that have nothing to do with the component. The
selectors are written out now, and the rule is in the design-system README.

**The rows open.** A caret that opens onto nothing is worse than no caret, so each step carries what
it worked out — the outline dropping a credentials slide because a retainer pitch is not an
introduction, the six case studies cut to three, the pricing moving from per-project to a monthly
band. One open at a time: six bodies at once is a wall of text where a log was.

**Two departures from the component.** The reference indents its rows 10px past its own header —
drift in shipped code, and fixed there since. And the body is `--text-secondary`, not the
component's `--text-tertiary`: `#a3a3a3` on `#fafafa` is **2.42:1**, and this is the only prose on
the screen anyone is meant to actually read. Secondary takes it to 7.49:1. Worth saying that the
linter could not have caught this either way — these rows are written by script, and `cascade.py`
reads source.

**Six templates, and four of them are real.** The repo carries four deck libraries; the handoff's
grid wants six. The set repeats once, which is a stated placeholder rather than a pretence — the
duplication is visible on purpose so nobody mistakes this for a catalogue. A real gallery needs
template art, and that is a content job, not a build one.

**Template names are not deck names.** The shelf shows *Capabilities Deck*, *Quarterly Business
Review*, *Brand Story*, *Research Report* — what each deck would be called if it were offered as a
template, rather than the specific company deck it actually is. Naming a template *"IBM Security —
Cost of a Data Breach Report"* would be offering somebody else's deck rather than a shape to fill.

**The flow stops where the design stops.** The board labels two further steps — *"Editor loading
state"* and *"Presentation view"* — and draws neither. They are not built.

## Notes

**Every state is in the URL** — `?step=gallery|detail|context|generating` and `?typed=0|1`, read
on load and written on every move.

**No demo switcher, unlike every other screen in this folder.** The others carry one because their
states are *alternatives* — sixteen scenarios nobody can reach by using the screen. A flow's states
are a *sequence*, and it already has the controls to walk it: a card opens the detail, `Use this
Template` moves on, `Create Presentation` runs it, and back steps home. A switcher here would be a
second way to do what the screen already does, sitting on top of the screen it exists to show.

**Back walks the flow; dismiss leaves it.** They are not a pair, which is why they sit at opposite
ends of the bar. Back steps one frame toward the gallery and stops there.

**The bar goes behind the scrim when the detail opens**, and goes `inert` with it. The bar sits above
the gallery so a card cannot scroll over the back button — but that also put it above the scrim,
which meant a screen dimmed everywhere except its two corner controls. That reads as *these two still
work*, and they never did: the scrim is over them and eats the click. Now they dim with everything
else, and the `inert` keeps a Tab key from finding what the eye already cannot.

**The bar floats; it does not sit in a column.** `1:3225` — the slide panel on the context step —
is 528 × 600 in a 600-tall frame, so it starts at the very top of the screen and the bar passes over
it. Built as a row, the bar pushed the panel down 68px and its tint stopped short of the top, which
read as a band across the screen rather than as one side of it. The bar carries no background of its
own, so there is nothing to overlay with.

**The two halves are 752 / 528, and the tint is what makes that legible.** The right panel takes
`--bg-quaternary`, which is `1:3225`'s own fill. Without it both halves are one surface — and an
unequal division of a surface you cannot see the edge of just reads as a lopsided margin.

## Nothing here is sized in pixels twice

A handoff gives you one width, and the temptation is to write that width down. This screen was built
that way first and it only composed at 1280: everywhere else the left half absorbed all of the growth
on its own while a 624px block stayed pinned to its top-left corner. Four rules replaced six numbers,
and each one still resolves to the handoff's own measurement at the width the handoff was drawn at.

| | was | is | at 1280 |
|---|---|---|---|
| the two halves | flex, right pinned to `528px` | grid, `minmax(0,1fr)` + `clamp(360px, 41.25%, 640px)` | 752 / 528 |
| the prompt's offset | `padding-left: 64px`, left-aligned | `padding-inline: max(20px, (100% - 624px) / 2)` | 64 either side |
| the prompt's vertical position | pinned to the top | `justify-content: safe center`, weighted above middle | — |
| the gallery | `repeat(3, 1fr)` | `repeat(auto-fill, minmax(320px, 1fr))` | 3 × 353 |
| the detail modal | `width: 1120px` | `min(1120px, 100% - 48px)` | 1120 |

**41.25% is 528/1280** — the handoff's ratio rather than its number, so the split reads the same at
every width instead of only one. The `clamp()` is what keeps a ratio honest at the extremes: under
~900 the panel is too narrow for two recognisable thumbnails, and on an ultrawide 41% of the screen
is more slide than anyone asked for.

**`(100% - 624px) / 2` is the centring, and it is also the handoff.** At the left track's 752 that
resolves to 64 — exactly the offset the design draws. Left-aligning was only ever right because the
column was barely wider than the block sitting in it; centring produces the same picture at 1280 and
keeps producing a picture at 1525.

`safe` on the centring is not decoration: a centred flex column that overflows pushes its own first
line above the scroll container's reach, so on a short window the heading would become unreachable.

The 48 on the modal is `.pai-modal-dismiss`'s room — that button is positioned **outside** the modal
box, so a modal that fills its layer exactly pushes its own close control off the screen.

**The handoff has no dismiss on the context step**; back is the only way out of it. The bar here is
on every step, and at the handoff's 17px top offset the dismiss landed on the second slide. Either
the button goes or the row does — the button is the only way out of four steps without walking back
through all of them, so the row moves down to clear it.

**The filmstrip runs past the panel's right edge on purpose.** The deck is longer than the space,
and saying so is better than trimming it to fit.

**All fifteen slides, everywhere the deck appears.** `assets/decks/index.json` opens with *"Four
decks, fifteen slides each"*, and both the filmstrip and the panel beside the prompt used to show a
truncated set — six and eight. Neither cut was a design decision; they were the number that happened
to fit. A shelf that describes a template as fifteen slides and then shows you six is answering a
question nobody asked, and the two surfaces disagreeing with each other made it worse. One constant
now feeds both, so the deck is the same length wherever you look at it — the filmstrip scrolls
sideways past the divider, the panel scrolls down.

**The decks are the shared library**, `assets/decks/`, at `card/` size for thumbnails and `full/`
for the preview stage. The author's face is `assets/avatars/`. Nothing here is a Figma export —
those URLs expire in seven days.

**One invented string**: the description in the detail panel. The handoff's is the KPI Report's,
which is not the template this flow opens. Written for the deck that is actually on screen.

# presentations.ai design system — for HTML prototypes

Atlas's design system. Plain HTML and CSS — no React, no build step — so a prototype is one file
you can open.

It began on 31 Jul 2026 as a port of the production tokens (`config/tailwind/pai.tailwind.config.js`
+ `src/common/uicomponents/*`) and has diverged since. **It is not a copy of anything now.** The
radius and spacing scales below were decided here. Nothing syncs in from another repo, and nothing
is sent out.

## Files

| File | What it is |
|---|---|
| `pai.tailwind.js` | Tailwind **token config** for the [Play CDN](https://tailwindcss.com/docs/installation/play-cdn). Makes brand utility classes resolve — `bg-bg-primary-inverted`, `text-text-secondary`, `shadow-elevation-02`, `text-body-base-medium`, `rounded`, … |
| `pai.css` | Plain **component CSS** (no build): the button system, badges, inputs, search, select, checkbox / radio / toggle, switcher, tooltip (with a pointer, and the countdown folded into it), chips, tabs, list items, dropdowns, links, dividers, avatars, tables, toasts, progress, spinner, skeleton and shimmer, scrim — plus every token as a CSS variable. |
| `icons/` | Phosphor 2.1.1, vendored. Three weights, woff2 only. |
| `assets/` | Illustrations a component needs and no icon set publishes — currently the file sheet. |
| `sticker-sheet.html` | Every component the system ships, rendered live, in 34 anchored sections. **The markup to copy.** Serve the repo root and open it. |
| `DESIGN.md` | What all of the above **means**, and which one to reach for. Names tokens, never restates a value. |
| `VOICE.md` | What the words on a screen should say. |
| `coverage-gaps.md` | The questions this system has no answer to, each with the evidence that it is a gap. |

## Serving it

Serve the **repo root**, not this directory — the sticker sheet reaches `../assets/` for
real deck imagery, and a server rooted here cannot see above itself.

```
python3 -m http.server 8907 --directory ~/Documents/GitHub/PAI/atlas
open http://localhost:8907/design-system/sticker-sheet.html
```

**The sheet loads `pai.css` with a timestamp on purpose.** `python -m http.server` sends no
`Cache-Control`, so the browser applies its own heuristic and will serve a stylesheet from
minutes ago — which looks exactly like a change that did not land. Reloading does not fix it: the
stylesheet's URL has not moved, so only the HTML is re-fetched. If you are ever unsure whether
what you are looking at is current, the timestamp is visible in the page source.

## Naming

Four kinds of class, applied in this order:

| | Form | Example |
|---|---|---|
| **Component** | `.pai-<component>` | `.pai-avatar` |
| **Variant** | `.pai-<component>-<variant>` | `.pai-badge-success` |
| **Size** | `.pai-<component>-<size>` | `.pai-switcher-small` — `small`/`medium`/`large`, omitted means medium |
| **State** | `.is-<state>` | `.is-error`, `.is-selected` |

**A variant is chosen when the screen is built and does not change. A state is true now and false
later.** That distinction decides which form a class takes and is the one most often got wrong.

### Where the code does not follow this yet

The system began as a port and the port's names were kept, so roughly half the classes predate the
rule above. **Where a name could be corrected without touching a built screen, both names now
resolve to the same rule** — the canonical one first, the legacy one beside it, marked in `pai.css`
as `/* @legacy .old -> .new */`. These are not second components, only second names.

| Departure | Legacy name | Canonical name | Both resolve |
|---|---|---|---|
| State as a suffix | `.chip-selected` · `.listitem-selected` · `.tab-item-selected` | `.is-selected` | yes |
| | `.listitem-disabled` · `.dropdown-item-disabled` | `.is-disabled` | yes |
| | `.dropdown-menu-closed` · `.dropdown-item-focus` | `.is-closed` · `.is-focused` | yes |
| A `tone-` infix | `.chip-tone-success` · `.chip-tone-danger` | `.chip-success` · `.chip-danger` | yes |
| Size named `--lg` | `.pai-input--lg` · `.pai-select--lg` · `.pai-search--lg` | `-large`, one hyphen | yes |
| No `pai-` prefix | `button` · `chip` · `tab` · `listitem` · `dropdown` | `.pai-button`, and so on | **no** |
| A `-style` base class | `.button-style` · `.chip-style` · `.dropdown-menu-style` | the component name alone | **no** |
| Size named `xs/sm/md` | `.pai-icon-*` · `.pai-spinner-*` | `small` · `medium` · `large` | **no** |
| Size required, not implied | `button` · `chip` · `tab` · `listitem` · `switcher` · `modal` | omitted means medium | **no** |
| | ~~`.pai-search`~~ · ~~`.pai-input`~~ | `-medium` now exists and renders identically | **fixed** |

The four marked **no** cannot be aliased cheaply. `.button-style` alone appears 354 times across
built screens, and the icon sizes track `--icon-*` tokens that would have to move with them. Write
them as they are; they are corrected when a screen using them is rebuilt anyway.

Everything added since the port — avatar, progress, spinner, table, toast, search, shimmer,
switcher, link, divider, select, tooltip — follows the rule.

**The linter enforces this.** `dsparse` reads the `@legacy` markers, and `rules.py` raises a
`legacy-class-name` error naming the replacement — in class attributes and in quoted strings inside
`<script>`, because classes are set from JavaScript too.

### Never rename a class inside a built screen

Annotations and lint findings anchor to CSS selectors, so a rename points them at elements that no
longer match. And classes are set from JavaScript as well as markup, so **grep the bare name, never
`class="…"`** — that under-count is how four screens were broken once. Renaming is only safe at zero
hits; otherwise add the new selector alongside the old in the same rule, scoped to its component.

> **The sticker sheet carries none of this.** It is for visual review and sharing, so it shows the
> four kinds of class and stops there. Naming debt lives here.

## Where values live

**`pai.css` owns every value. `pai.tailwind.js` owns none.**

```
pai.css      :root { --bg-brand: #0055ED; --rounded-lg: 8px; }   ← the only place a value is written
                ↑                        ↑
pai.tailwind.js                     components in pai.css
  "bg-brand": "var(--bg-brand)"       .pai-tooltip { border-radius: var(--rounded-md) }
  no literals                          no literals
```

Four rules, and they cover every case:

1. **A value is written once**, as a custom property in `:root` in `pai.css`.
2. **`pai.tailwind.js` references, never repeats** — `"var(--token)"`, never a hex or a px.
   If you are typing a number into it, add the variable first.
3. **Components reference too.** No literal inside a component rule.
4. **To change something, edit the variable.** Both media follow, and nothing else needs
   touching. **To add something, add the variable first, then the Tailwind key that points
   at it** — both, or neither.

### Icons are Phosphor, always

No second icon set, and no hand-drawn SVG where a Phosphor icon exists. A screen that
needs an icon Phosphor does not have is a conversation, not a licence to add one.

**It is vendored, not fetched.** `icons/` holds Phosphor 2.1.1 — three weights, woff2 only,
672 KB — and no page reaches for a CDN.

```html
<link rel="stylesheet" href="icons/regular.css" />
<link rel="stylesheet" href="icons/fill.css" />
<link rel="stylesheet" href="icons/bold.css" />
```

The reason is the render stage: artifacts are screenshotted headless and judged on the
picture, so a CDN blip produces a screen condemned for missing icons that were never
missing. That has already happened once here, to Google Fonts. Updating Phosphor is now a
deliberate act — re-download, re-trim to woff2, commit — which is the point.

**Size it, never inherit it.** Phosphor is a font, so an `<i>` carrying it silently takes
its parent's `font-size` — a button icon was 14px because button text is 14px.

| | | Used by |
|---|---|---|
| `--icon-xs` | 12px | `.chip-small` |
| `--icon-sm` | 16px | buttons, chips, menu items, and the 28px icon-only button |
| `--icon-md` | 20px | `.listitem` rows, and icon-only buttons at 36px and up |

**These are container sizes, and the container is the icon's own em box.** `.pai-icon` sets
`width/height: 1em`, which is the square Phosphor drew the icon in, padding included. It is
not trimmed to the drawing and must not be: the icon fills between 0.63em and 0.91em of that
square, so a 16px `×` reads smaller than a 16px sparkle. That is the typeface's decision.

```html
<i class="ph ph-sparkle pai-icon pai-icon-md"></i>
```

**One idea, one icon.** A feature that is drawn two ways is a feature people learn twice. These
are settled — write the named glyph and nothing else, wherever the idea appears: the sidebar, a
chip, a modal, an empty state.

| Idea | Icon | Settled |
|---|---|---|
| Brand Kit | `ph-swatches` | 7 Aug 2026 |
| Hire an Expert | `ph-pen-nib` | 7 Aug 2026 |

The table is the record, so add a row when an idea gets its icon rather than leaving it in one
screen for the next person to copy or contradict. A glyph that has not been settled is a
conversation, the same as an icon Phosphor does not have.

**`.pai-icon-brand`** puts the brand gradient in the glyph, for the icon that *is* the offer — the
way into a feature, not an icon that labels or decorates. **Use the fill weight with it**: a
gradient clipped to a 16px outline shows a stroke or two of ramp and reads as flat mid-blue, since
there is not enough glyph for a gradient to happen on. It sets no size, so whatever already sizes
the icon keeps doing it.

```html
<i class="ph-fill ph-swatches pai-icon-brand"></i>
```

**A row of them means nothing.** The point is that one object in a group carries the invitation; if
everything in a row has it, the gradient stops being a signal and becomes a texture.

### An emoji, when an icon is too flat

Phosphor is monochrome and even-weighted on purpose — it labels, navigates and acts without ever
asking to be looked at. That is the right instrument nearly everywhere and the wrong one when the
job is **warmth, urgency or delight**. A trial counting down wants to feel like a countdown; a
grey flame at 16px reads as a category marker.

**So: reach for an emoji when expressiveness is the point, and not otherwise.**

| | |
|---|---|
| **yes** | a countdown, a celebration, an empty state with a bit of personality, a nudge that wants to feel human |
| **no** | anything inside a control — buttons, menu rows, tabs, inputs, table headers |
| **never** | as the only thing carrying a meaning |

**It costs something, and the cost is why the default is still Phosphor.** An emoji is a picture
the *operating system* draws, not one this system ships: it is a different shape on macOS, Windows
and Android, it ignores `color` because it brings its own, and it does not come from `icons/` — so
the "vendored, not fetched" guarantee does not cover it. The render stage screenshots one platform
and judges that picture, so a screen whose meaning depends on an emoji's exact drawing is a screen
that will look different to whoever reviews it.

Which is the whole reason for the third rule above: the sentence has to work with the emoji
deleted. `🔥 Trial: 4 days left` still says everything without the flame. That is the test.

Size it like an icon (`--icon-sm` and up) and set `line-height:1`, or a tall glyph will push its
row off the control rung it shares with everything beside it.

```html
<span class="db-trial-emoji" role="img" aria-hidden="true">🔥</span>Trial: 4 days left
```

`aria-hidden` when the words already say it — which, per the third rule, they always should.

### Colour has two layers, and they only point one way

```
ramps       --app-* · --green-* · --gray-* · --red-* · --amber-* · --blue-* · --white
                ↑
semantics   --bg-brand: var(--app-600)   --text-danger-primary: var(--red-700)
                ↑
components  .button-primary-danger { background: var(--bg-danger) }
```

**A ramp step holds a value. A semantic token holds a reference. A component uses the
semantic, never the ramp.** Nothing points back up: a ramp that resolves to a semantic
token is inverted, and means the palette is now defined by one of its consumers.

Not every semantic has a ramp behind it — a scrim, a near-white surface step and the
translucent borders are their own values, and that is fine. But where a ramp step and a
semantic token hold the same colour, the semantic must reference it, or the hex is written
twice and the two drift.

### Adding a token is not finished until something uses it

A token nobody uses is a proposal, not a decision — and it quietly costs something: the
linter works out what a token is *for* by watching which properties it lands on, so an
unadopted token has no property and gets suggested for the wrong ones.

So adding one has a second half, in the same change:

1. **Name the components that should use it.** Walk `pai.css` and list every rule whose
   literal this token now means.
2. **Change them.** Same commit as the token.
3. **If a value does not fit the new scale, stop and ask.** That is a visual change to a
   component, not a token addition, and it belongs to whoever owns the design.
4. **If nothing should adopt it yet, write down why** — next to the token, in one line.
   "No adopters yet" is a legitimate answer for a scale published ahead of the screens
   that need it. An unexplained one is an unfinished job.

### A screen already built never changes underneath

Components share one stylesheet, so changing a component's value changes every screen that
uses it — including screens that were built, linted and judged months ago against the old
value. **That must never happen silently.** A past run's artifact is the record of what was
built; if it re-renders differently, the lint and the judgements filed beside it stop
describing it.

So a value change to a component has a third step, after naming the adopters and changing
them:

5. **Find every built screen that uses the component** — `designs/*/**.html` — and pin the
   old value in that file, in one `<style>` block, with a comment saying what moved and
   that the screen has not been migrated. The block is the marker: a screen carrying one is
   a screen still waiting to be walked.

Migration is then deliberate and one screen at a time: open it, look at it, delete the
block. Nothing gets swept along by a token landing.

Adding a *new* token needs none of this — nothing references it yet, so nothing can move.

### The exceptions, and they are the only ones

- **The pinned stock palettes** — `violet`, `purple`, `indigo`, `orange`. Copies of Tailwind's own
  ramps, held here so a proto cannot silently pick up a different ramp from a future CDN release.
  They are guards, not brand decisions, and nobody writes them in CSS. Tailwind-only.

  **`red`, `amber` and `blue` left this exception** the day the semantic tokens needed to reference
  a step instead of repeating its hex. They are ordinary ramps in `pai.css` now and follow rule 1
  like everything else — the exception held only while nobody wrote them in CSS.
- **Product and social one-offs** — `ppt-*`, `gold-*`, `linkedin-500`, `darkblue-*` and the
  like. Same reason: they exist for one utility class each.
- **`fontSize`** — each entry is a tuple of size, line height and weight, not a single value,
  so it cannot be a `var()`. **This is why type has no CSS variable**, and why a wrong font
  size can be named (`text-heading-lg`) in a class but only valued (`0.875rem`) in CSS.
  A known asymmetry, not an oversight.
- **`keyframes`, `animation`, `backgroundImage`** — composed, not single values.

Anything not on that list follows the four rules. If a fifth exception seems necessary,
that is the moment to change this section rather than to make a quiet exception.

### Never put `:is()` in the subject of a rule that sets a text colour

`tools/lint/cascade.py` does not parse `:is()`. It marks the rule unsupported and then **strips the
parenthesised part off the subject** — deliberately, so an unknown rule is admitted rather than
silently skipped. What is left matches every element on the page.

On most properties that is harmless. On `color` or `-webkit-text-fill-color` it makes the text
colour undecidable *everywhere*: one such rule added here took **thirteen contrast expectations**
in `check_fixtures.py` down at once, in fixtures that have nothing to do with the component. Write
the selectors out instead:

```css
/* no  */  .thing .label :is(.ph,.ph-fill,.ph-bold){ -webkit-text-fill-color:…; }
/* yes */  .thing .label .ph,
           .thing .label .ph-fill,
           .thing .label .ph-bold{ -webkit-text-fill-color:…; }
```

`:is()` in a **`font-size`** rule is fine and is used in fourteen places — verified against the
fixtures. It is text colour specifically that cannot take it.

## Load it

```html
<!-- fonts + icons -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="icons/regular.css" />

<!-- design system -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="pai.tailwind.js"></script>     <!-- brand Tailwind utilities -->
<link rel="stylesheet" href="pai.css" />     <!-- component classes -->

<body class="pai"> … </body>                  <!-- `pai` = Inter base font + brand text color -->
```

**Icons come from `icons/`, never a CDN** — this block used to load them from unpkg, which is the
exact thing *Icons are Phosphor, always* above forbids, for the exact reason it gives.

Two interchangeable ways to style — mix freely:

- **Component classes** (from `pai.css`): `<button class="button-style button-medium button-primary">Save</button>`, `<span class="pai-badge pai-badge-pro">PRO</span>`.
- **Tailwind utilities with brand tokens** (from `pai.tailwind.js`): `<div class="p-4 rounded bg-bg-elevated shadow-elevation-02 text-body-base-medium">…</div>`.

---

## Using it

**This file is for whoever edits the design system. [DESIGN.md](DESIGN.md) is for whoever uses it.**

The component roster that used to sit here has moved, because it was three copies of one thing:

| you want | open |
|---|---|
| what a component *means*, and when to reach for it | [DESIGN.md](DESIGN.md) |
| the markup to copy | `sticker-sheet.html` — 34 anchored sections |
| a value | `pai.css`, and only there |
| what the words should say | [VOICE.md](VOICE.md) |
| what the system has no answer to | [coverage-gaps.md](coverage-gaps.md) |
| a rule learned from a real screen | `designs/*/annotations.jsonl` |

Nothing above restates anything below it. Where DESIGN.md and an annotation disagree, the
annotation wins — it has a screen behind it.

### One guard that belongs here rather than there

**Two pinned palettes are not what their names suggest: `gray` is Tailwind's neutral and `amber` is
Tailwind's yellow.** They are pinned so a proto cannot silently pick up a different ramp from a
future CDN release.

**`slate`, `zinc`, `stone`, `emerald`, `teal`, `cyan`, `sky`, `rose`, `pink`, `fuchsia`, `lime` and
`neutral`** reach a proto from the Tailwind CDN and have no counterpart in the product. Anything
built with them is off-system.

## Scope

A **subset**, focused on the highest-use components. Components arrive as prototypes need them —
add them here rather than hand-rolling one in a screen.

**What is missing, and what has no house answer at all, is tracked in
[coverage-gaps.md](coverage-gaps.md)** rather than in a note here that nobody updates. As of
9 Aug 2026 the slider is the one component on the original unported list still absent; the dialog,
dropdown, tab strip and loader have all landed.

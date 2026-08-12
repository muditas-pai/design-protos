# presentations.ai design system — for HTML prototypes

A browser-ready port of the production design system (`config/tailwind/pai.tailwind.config.js`
+ `src/common/uicomponents/*`) so you can build **static HTML** prototypes that match the app —
no React, no build step.

## Files

| File | What it is |
|---|---|
| `pai.tailwind.js` | Tailwind **token config** for the [Play CDN](https://tailwindcss.com/docs/installation/play-cdn). Makes brand utility classes resolve — `bg-bg-primary-inverted`, `text-text-secondary`, `shadow-elevation-02`, `text-body-base-medium`, `rounded`, … |
| `pai.css` | Plain **component CSS** (no build): the button system, badges, inputs, checkbox / radio / toggle, tooltip, plus typography + shadow helper classes and tokens as CSS variables. |
| `template.html` | Copy this to start a new proto — wires fonts, icons, the CDN + config, and `pai.css`. |
| `components.html` | Live gallery of every component. **View source to copy snippets.** |
| `sticker-sheet.html` | **The exhaustive reference.** Every component the system ships, rendered live, 35 searchable sections, markup to copy. Prefer this over reconstructing a component from class names. |
| `DESIGN.md` · `design.html` | What each token and component *means*, and which to reach for. Colour roles, registers, radius, elevation, page anatomy. |
| `VOICE.md` · `voice.html` | What the words say — the twelve rules and the five nevers. |
| `icons/` | Phosphor, vendored (regular · fill · bold). Prefer these over the unpkg CDN: a CDN blip renders a proto with no icons. |

## The atlas migration — 12 Aug 2026

`pai.css` is now the atlas stylesheet: **337 component classes and 226 tokens**, up from 133 and
124. The old file published no spacing, radius, icon, elevation or layer scale at all; those are
the biggest thing that arrived.

**Nothing that already existed changed.** The two systems shared 173 rule blocks and 105 tokens,
and once `var()` was resolved, 145 rules and 101 tokens were already identical and merely spelled
differently. The rest is pinned to its old value in the compatibility layer at the foot of
`pai.css`, together with the tokens and the `.listitem-selected` / `.chip-selected` /
`.tab-item-selected` style selectors that atlas had renamed. Verified by screenshotting all 103
protos before and after and diffing every pair — 99 pixel-identical, and the 4 that moved are
self-animating pages that were confirmed unchanged at the computed-style level.

### New work opts in with `pai-next`

```html
<body class="pai pai-next">
```

A few atlas rules size icons by their context — an icon in a button is 16, in a list row 20 —
which the old system never did. Applied globally they would have resized every icon in every
existing proto, so they sit behind `.pai-next`. `template.html` already carries it. Add it to an
old proto when you are ready to check that proto, one file at a time.

## Use it

```html
<!-- fonts + icons -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />

<!-- design system -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="pai.tailwind.js"></script>     <!-- brand Tailwind utilities -->
<link rel="stylesheet" href="pai.css" />     <!-- component classes -->

<body class="pai"> … </body>                  <!-- `pai` = Inter base font + brand text color -->
```

Two interchangeable ways to style — mix freely:

- **Component classes** (from `pai.css`): `<button class="button-style button-medium button-primary">Save</button>`, `<span class="pai-badge pai-badge-pro">PRO</span>`.
- **Tailwind utilities with brand tokens** (from `pai.tailwind.js`): `<div class="p-4 rounded-md bg-bg-elevated shadow-elevation-02 text-body-base-medium">…</div>`.

## Quick reference

- **Buttons** — `.button-style` + a size (`.button-large|medium|small`) + a color
  (`.button-primary | primary-brand | secondary | secondary-brand | tertiary | ghost | dark | primary-danger | secondary-danger | tertiary-danger | ghost-danger`). Add `.icon-only` for square icon buttons, `.button-disabled .button-disabled-40` (primary) / `.button-disabled-60` (others) for disabled.
- **Badges** — `.pai-badge` + `.pai-badge-pro|gold|basic|free|neutral`.
- **Inputs** — `.pai-input` (`.pai-input--lg` for 44px, `.is-error` for error), `.pai-textarea`.
- **Checkbox / radio** — `<input type="checkbox" class="pai-checkbox">`, `<input type="radio" class="pai-radio">`.
- **Toggle** — `<label class="pai-toggle"><input type="checkbox"><span class="track"></span><span class="knob"></span></label>`.
- **Type** — `text-heading-{4xl…sm}`, `text-body-{xl|lg|base|sm|xs}-{regular|medium|semibold}`, `text-overline-small`.
- **Elevation** — `shadow-elevation-{01|02|03|04|new-04|button|input|input-focused|input-error}`.
  `new-04` (Figma effect style 471:2410) is the heavier one the newer dashboard modals use.
- **Colour ramps** — `app-{50…900}` (brand), `green-{50…950}` (aliased `success-*`),
  `gray-{25…900}`. The brand and green ramps are OKLCH-corrected: perceived lightness is
  evenly spaced, and for green pinned to the red/blue/purple mean so it stops reading
  fluorescent. The brand anchors 50/500/600/700/900 are held exactly and must not change.
- **Surfaces** — `bg-{primary|subtle|muted|secondary|tertiary|quaternary}`. `subtle` (#FCFCFC)
  and `muted` (#F9F9F9) are the two near-white steps: main column and top nav, then side
  panel one step darker so it reads as its own surface.
- **Shadow primitives** — `drop-{1|2|3}`, `inner-{1|2}`. Every elevation composes from these,
  so reach for them rather than inventing a new rgba.
- **Stock palettes** — `gray`, `amber`, `violet`, `purple`, `red`, `indigo`, `blue`, `orange` are
  pinned to the exact ramps the app aliases. Two are not what their name suggests: **`gray` is
  Tailwind's neutral** and **`amber` is Tailwind's yellow**. Pinning them means a proto cannot
  silently pick up a different ramp from the CDN default.
- **Not in the app** — `slate`, `zinc`, `stone`, `emerald`, `teal`, `cyan`, `sky`, `rose`, `pink`,
  `fuchsia`, `lime`, `neutral` reach protos from the Tailwind CDN but have no counterpart in the
  product. Treat anything you build with them as off-system.

## Notes / scope

- This is a faithful **subset** focused on the highest-use components. Source of truth remains
  `pitchdeckdoclist`; if a token or component changes there, update these files to match.
- A few components in the library (dialog, dropdown, slider, tabbar, loader) aren't ported yet —
  add them as protos need them.
- Brand voice & usage conventions (navy = action, orange = brand/upsell, setup→payoff headlines)
  live in the `pai-visual-language` guidance, not in CSS.

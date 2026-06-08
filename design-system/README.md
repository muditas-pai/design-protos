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
- **Elevation** — `shadow-elevation-{01|02|03|button|input}`.

## Notes / scope

- This is a faithful **subset** focused on the highest-use components. Source of truth remains
  `pitchdeckdoclist`; if a token or component changes there, update these files to match.
- A few components in the library (dialog, dropdown, slider, tabbar, loader) aren't ported yet —
  add them as protos need them.
- Brand voice & usage conventions (navy = action, orange = brand/upsell, setup→payoff headlines)
  live in the `pai-visual-language` guidance, not in CSS.

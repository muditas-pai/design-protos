# design-protos — guide for Claude

This repo holds **HTML design prototypes** for presentations.ai. Designers build them
**with you (Claude)**. Every proto is a single self-contained `.html` file that opens
directly in a browser (from Finder) and is published via GitHub Pages at
**https://muditas-pai.github.io/design-protos/**.

## Building a proto
- One self-contained `.html` per proto, at the **repo root**. Short, kebab-case, **no spaces**
  (clean Pages URLs): `editor-to-present.html`, not `My Proto.html`.
- **No local asset files** — everything loads from CDNs. Use inline SVG, CSS, or Phosphor
  icons for imagery, so the file renders both from Finder and on Pages.
- After creating a proto, add a card for it in `index.html` (the landing page).

## Always use the design system (`design-system/`)
Put this in the `<head>` of every proto (paths are relative to the repo root), or copy
`design-system/template.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" />
<script src="https://cdn.tailwindcss.com"></script>
<script src="design-system/pai.tailwind.js"></script>   <!-- brand Tailwind tokens -->
<link rel="stylesheet" href="design-system/pai.css" />   <!-- component classes -->
```
…and `<body class="pai">` (sets the Inter base font + brand text color).

Two interchangeable layers — mix freely, never hardcode brand colors:
- **Component classes** (`pai.css`): `.button-style` + size + color, `.pai-badge`, `.pai-input`,
  `.pai-checkbox`, `.pai-radio`, `.pai-toggle`, `.pai-tooltip`, type (`.text-heading-2xl`,
  `.text-body-base-medium`), `.shadow-elevation-02`.
- **Brand Tailwind utilities** (`pai.tailwind.js`): `bg-bg-primary-inverted`, `text-text-secondary`,
  `border-border-primary`, `shadow-elevation-02`, `text-body-base-medium`, + all standard Tailwind.

Full component list + snippets: `design-system/README.md` and the live gallery
`design-system/components.html`.

## Brand voice (presentations.ai)
- **Navy `#0A1925` is the action color** — primary CTAs are navy-filled. **Orange `#FF5500` is
  brand/upsell only** (logo, PRO badge, upgrade prompts). Outside those moments the UI is
  monochrome (navy / grey / white).
- One emphatic action per surface; everything else outlined or ghost.
- Headlines use **setup → payoff** (lighter setup line, then a darker, bolder payoff line).
- Show **real product** (slide thumbnails, the editor) — not abstract "AI" metaphors.
- Copy is short, plain, human. Avoid "empower / unlock / seamless / revolutionize".
- For motion + static polish, apply the `emil-design-eng`, `make-interfaces-feel-better`,
  and `pai-visual-language` skills when relevant.

## Publishing
Commit + push to `main` → GitHub Pages redeploys in a few seconds. Keep `index.html` updated
so new protos are linked from the landing page.

## The design system is a snapshot
`design-system/` is ported from the production app (`~/Documents/GitHub/PAI/pitchdeckdoclist`:
`config/tailwind/pai.tailwind.config.js` + `src/common/uicomponents/`). If app tokens or
components change, re-sync these files — don't let the proto system drift silently.

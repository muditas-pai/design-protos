# Palette spec: illustration colour tokens

**Research spike, 3 Nov 2026.** Code: `snippets/IllusTokenUtil.js` (20 tokens) and `snippets/painter-stored.mjs` +
`snippets/painter-recipe.css` (Painter layer). Full engineering detail: `snippets/illus-tokens/SPEC.md`.

---

## The idea

A drawing never names a colour. It names a **role** (primary, surface, accent, line) and a **tone** within that
role (lighter or darker). The palette decides what each role and tone actually look like, once for each slide
background. The same drawing then sits correctly on a white slide, a dark slide and a brand-colour slide.

No AI is involved. Nothing is tuned to a particular palette, so uploaded and brand-kit palettes go through the same
rules as the shipped ones.

---

## Inputs and outputs

```
inputs, per background block                    output
────────────────────────────                    ──────
brand colours, in palette order    ─┐
this block's background  (--th-slide-primary)  ├──▶  20 tokens  --th-illus-*   as "r, g, b"
this block's text colour (--th-slide-contrast) │
kind: light · dark · colour         ─┘
```

| Family | Tones | Count |
|---|---|---|
| primary (the hero object) | highlight, light, soft, base, dim, shade, deep | 7 |
| surface (quiet supporting shapes) | highlight, light, soft, base, dim, shade, deep | 7 |
| accent (small focal parts) | light, base, shade | 3 |
| line, gloss, panel | one each | 3 |

Values are precomputed final colours, never `color-mix()` or opacity. PPTX export reads final colours, and real
opacity would let overlapping shapes show through each other.

---

## How each colour is picked

All maths happen in OKLCH: **L** is lightness (0 to 1), **C** is chroma, or colourfulness, and **H** is hue.

**Primary** takes the hue of brand colour 1. Its chroma is capped at 0.13 so it never goes neon.

**Accent** is the brand colour that's most different from primary. Each other brand colour is scored by
`hue distance (max 150°) × min(1, chroma / 0.08)`, so far-away hues win and near-greys are discounted. If even the
best one is less than 80° from primary, the palette counts as **single-hue**, and accent becomes a lighter, brighter
primary instead.

**Surface** uses primary's hue at chroma 0.02, a grey with a hint of the brand.

**Tones** are fixed lightness steps around each family's base:

```
highlight +0.22   light +0.11   soft +0.055   base 0   dim −0.055   shade −0.11   deep −0.21
```

Near the very light and very dark ends, chroma is eased off so tones don't go garish.

### Per background

| Background | Primary base | Surface base | Notes |
|---|---|---|---|
| Light (L ≥ 0.6) | 0.66 | 0.86 | Pushed darker until it reaches 1.5 contrast with the background ("stand-off") |
| Dark | 0.68 | 0.60 | Pushed lighter for the same 1.5 contrast; every tone stays at least 0.12 above the background |
| Colour slide | none | none | No brand hue at all: every tone is white or black laid over the slide colour (the "ladder") |

On a colour slide the accent is a brand colour at full strength that differs from the slide in hue (more than 25°)
and stands out from it (1.5 contrast). If none does, it falls back to a deep or very light version of the slide
colour. It is never the slide colour itself.

A "dark" block whose background is actually white is treated as light. The real brightness wins over the label.

---

## Painter layer (experimental)

The Painter layer renames the roles after how painters describe form, and stores fewer colours:

```
stored per background (6)                  mixed in CSS (painter-recipe.css)
──────────────────────────                 ─────────────────────────────────
dominant   ← illus-primary          ──▶    dominant-highlight · light · halftone · shadow
accent     ← illus-accent           ──▶    accent-light · halftone · shadow
neutral    ← illus-surface          ──▶    neutral-light · halftone · shadow
line       ← illus-line                    specular       = light-to
light-to   barely warm white               cast-shadow    = slide colour mixed toward shadow-to
shadow-to  deep, cool colour
```

- **Lights** step up in lightness, tinted 12% toward `light-to`.
- **Shadows** mix toward `shadow-to`, never black. Its hue comes from the slide when the slide has colour;
  otherwise it's the dominant hue pulled up to 35° toward blue.
- **Accent shadow** keeps its own hue and only steps darker. Mixing it toward a shadow colour of another hue turned
  it grey, as on the lighthouse stripe.
- **On a colour slide**, `light-to` takes the slide's own hue, the way a room colours its light.

### Locked colours

Some objects stop reading as themselves when recoloured. These skip the palette entirely:

| Drawing | Part | Tokens | Values |
|---|---|---|---|
| Lighthouse | tower body | `--th-paint-tower-*` | `#FFFFFF` `#FFFFFF` `#F4F2EE` `#D6D2CB` |
| Bridge journey | water | `--th-paint-water-*` | `#8CC2F5` `#3F86E3` `#2559B8` |

How tones map from the 20-token version to Painter names:

| 20-token tone | Painter token |
|---|---|
| primary-highlight | dominant-highlight |
| primary-light, primary-soft | dominant-light |
| primary, primary-dim | dominant-halftone |
| primary-shade, primary-deep | dominant-shadow |
| surface-highlight, -light, -soft | neutral-light |
| surface, surface-dim | neutral-halftone |
| surface-shade, surface-deep | neutral-shadow |
| accent-light, accent, accent-shade | accent-light, accent-halftone, accent-shadow |
| gloss · line, panel | specular · line |

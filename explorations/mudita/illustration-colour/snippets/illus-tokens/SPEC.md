# Illustration colour tokens: research spike (v2)

Written 21 Oct 2026. Owner: Mudita (design). Prototype and decisions: https://claude.ai/artifact/WW3wE247HpcWXyyHrKMHAy · Review of converted drawings: https://claude.ai/artifact/Qmcsrjb931qWV92QiH9AZ7

This file lives next to the code it describes, in `design_assets/scripts/illus-tokens/`. Paths are relative to this folder unless they name a repo.

## The question this spike answers

**How do we colour illustrated diagrams so that any colour palette works on any diagram, and the result looks all right?**

That includes the 45 app palettes, the ~1,950 company palettes, and anything a user builds in a brand kit or through **Add palette**, on every background a palette has (light, dark, and each colour background).

**In scope:** the colour model, how values are generated from a palette, how a drawing is converted to use them, and how we judge that it looks right.
**Out of scope:** shipping concerns: export, rollout and caching, existing decks changing, rollback, CI, server-made themes, backward compatibility of saved brand kits.

## What changed from v1

```
change
20 tokens, not 16: -soft and -dim added to primary and surface (§2, §3.3)
fixture: 12 palettes, 1,040 values (was 832)
tone overrides include soft and dim (§4.2)
convert_drawings.py replaces tokenise3.py as the conversion reference (§4.2)
gradient ids must be unique per copy on the page, or a drawing's gradients take another copy's colours (§5)
open colour questions added: custom slide backgrounds, drawings on coloured cards (§7)
scoped down to the colour approach; shipping concerns removed
```

## Where the spike stands (21 Oct 2026)

```
piece                                      state
colour model + generator                   done; 1,040/1,040 fixture values; all 1,999 real palettes generated
brand-kit palettes (pitchdeckdoclist)      done on branch illustration-tokens; same output as the shipped palettes
drawings                                   65 role maps → 59 drawings converted in the resources clone (891 files, colours only).
                                           9 maps decided by hand; 56 proposed by rule and "approved for in-app review"
                                           (flags not individually checked). 2 kept as drawn on purpose (podiumaward,
                                           winnertrophy); 4 changed nothing (butterfly, developmentstages, listbubble,
                                           steppedportico: their text-colour shapes are point markers).
                                           genericassets/illustrations/ not started.
gradients across copies                    bug found and reproduced; fix written and tested (GRADIENT-FIX.md)
```

## 1. The approach

Illustrated diagram drawings currently use hard-coded colours, so they ignore the deck's palette. The spike adds a **tonal illustration layer** to the existing palette system:

- Every palette generates **20 CSS variables** (`--th-illus-*`) inside each background block it already has (`.th-light`, `.th-dark`, `.th-color1 … N`, and any `.th-surfaceN`).
- Drawings are converted so every colour points at one of those variables, except colours that must never change (skin, fire), which stay as drawn.

**Colour by value, not by hue.** Brand colours are not painted onto drawings. Each drawing part has a midtone **base** for its largest fills, with lighter and darker tones above and below. The background decides where those tones sit. That's what lets one drawing work on any palette: the drawing defines light and shade, and the palette only supplies the hue.

It's additive: no existing `--th-*` variable, class or selector changes.

## 2. The token contract

Twenty names, defined in every background block. Values are bare channels like every existing palette variable, `r, g, b` with spaces (e.g. `--th-illus-primary: 120, 140, 230;`). Drawings write `rgb(var(--th-illus-primary))`.

```
family    token                         meaning                                        share of a drawing
primary   --th-illus-primary-highlight  lightest tone of the hero                      small
          --th-illus-primary-light
          --th-illus-primary-soft       just lighter than base
          --th-illus-primary            the hero's BASE (its largest fills)            ~25%
          --th-illus-primary-dim        just darker than base
          --th-illus-primary-shade
          --th-illus-primary-deep       darkest tone of the hero                       small
surface   --th-illus-surface-highlight  neutrals: bodies, ground, large quiet shapes
          --th-illus-surface-light
          --th-illus-surface-soft
          --th-illus-surface            the neutrals' BASE                             60–70%
          --th-illus-surface-dim
          --th-illus-surface-shade
          --th-illus-surface-deep
accent    --th-illus-accent-light       small focal points only
          --th-illus-accent             the accent's BASE                              <10%
          --th-illus-accent-shade
other     --th-illus-line               outlines, hair, true darks
          --th-illus-gloss              specular highlight, light on every background
          --th-illus-panel              a text-bearing block inside a drawing (keeps
                                        contrast with the text that sits on it)
```

`-soft` and `-dim` were added on 21 Oct 2026 so drawings with many close shades keep their detail.

## 3. How the values are generated

**One generator.** The colour maths live only in pitchdeckdoclist's `src/listing/core/screens/workspace/styles/IllusTokenUtil.js` (`buildIllusTokens(brand, bg, contrast, kind)`). The app uses it for brand-kit palettes; design_assets' `illus-tokens.mjs` loads that same file (it expects pitchdeckdoclist checked out beside design_assets, as gulp already does; override with `ILLUS_TOKENS_SRC`) and only adds the stylesheet rewriting: `generate-illus-tokens.mjs [--check] [folder]` (idempotent). There is no second copy of the maths to keep in step.

`test/expected-tokens.json` holds frozen expected values for 12 palettes (Tide, Cerise, Chronotone, Aurora, and 8 `edge-*` user-palette cases), 1,040 values. `node test/illus-tokens.test.mjs` here and `npm run test:illustokens` in pitchdeckdoclist both check them. When the maths change on purpose: change `IllusTokenUtil.js`, run `node test/regenerate-fixture.mjs`, review the diff, and copy the file to pitchdeckdoclist's `__tests__/`.

### 3.1 Inputs (all already in the palette)
- **Brand colours:** the palette's originals, in order. The same values as `--th-slide-color1 … n`, where n is the number of brand colours (not the generated accents).
- **Per background block:** its `--th-slide-primary` (background) and `--th-slide-contrast` (text colour).

### 3.2 Colour maths
- Work in **OKLCH** (`oklch.py`). Convert back to sRGB with gamut mapping: if out of gamut, binary-search the largest chroma that fits, keeping L and H.
- **`tone(H, C, L)`:** clamp L to [0.08, 0.975]; ease chroma off toward the ends: `C × (1 − 0.7 × ((L − 0.6) / 0.42)²)`, floored at 0.
- **Hue distance:** shortest angle between two hues, 0–180°.
- **Rounding:** exact halves round to even (Python's `round`).
- **No runtime colour functions** (`color-mix()`, `hsl(from …)`) and no real opacity: values are precomputed solid colours, so overlapping shapes don't show through each other.

### 3.3 Seeds
- **P** = brand colour 1. Primary hue Ph = P.h, chroma Pc = min(P.c, 0.13).
- **A** = among brand colours 2…n, the highest score `min(hueDistance(x, P), 150) × min(1, x.c / 0.08)`; ties keep brand order. Accent Ah = A.h, Ac = min(A.c, 0.14).
- **Single-hue rule:** if `hueDistance(A, P) < 80°`, set Ah = Ph and Ac = min(P.c × 1.15, 0.16). The palette stays single-hue, and the accent becomes a lighter, brighter primary.
- **Neutral:** Nh = Ph, Nc = 0.02.

### 3.4 Families
A family is seven tones (accent: three) at `base + step`, each clamped to [lo, hi]:

```
step   highlight +0.22   light +0.11   soft +0.055   base 0   dim −0.055   shade −0.11   deep −0.21
```

### 3.5 Per background

**Light and dark are decided by real brightness.** A `.th-light` or `.th-dark` block uses the light rules if its background has OKLab L ≥ 0.6, and the dark rules otherwise. Some palettes have a "dark" background that is actually white.

**Stand-off rule (light and dark slides).** For the primary and accent families: if the base tone's contrast ratio with the background is under 1.5, move the base away from the background in steps of 0.02 L until it reaches 1.5. Move darker on light backgrounds and lighter on dark ones, staying within the family's clamp. The steps around the base move with it. Surfaces are left quiet on purpose.

**Light slide** (`.th-light`):
```
primary  base 0.66, then stand-off   [0.30, 0.95]   hue Ph, chroma Pc
surface  base 0.86                   [0.45, 0.975]  hue Nh, chroma Nc
accent   base 0.72 (0.80 if single-hue), then stand-off   [0.30, 0.94]  light/base/shade only
line     tone(Nh, Nc × 1.5, 0.32)
```

**Dark slide** (`.th-dark`). Floor = background L + 0.12, so nothing sinks into the background:
```
primary  base 0.68, then stand-off   [floor, 0.94]
surface  base 0.60                   [floor, 0.90]
accent   base 0.76 (0.86 if single-hue), then stand-off   [floor, 0.95]
line     tone(Nh, Nc, max(background L + 0.10, 0.30))
```

**Colour slide** (`.th-colorN`, and `.th-surfaceN` the same way). The "opacity look": white or black laid over the background, blended at generation time and stored as solid colours. Blend in plain 8-bit sRGB: `round(bg × (1 − a) + top × a)` per channel.

Mid and dark colour backgrounds (OKLab L < 0.80):
```
primary   white at 0.90 · 0.78 · 0.71 · 0.64 (base) · 0.56 · 0.48 · 0.32      (highlight → light → soft → base → dim → shade → deep)
surface   white at 0.55 · 0.42 · 0.36 · 0.30 (base) · 0.24 · 0.18,  black at 0.12 (deep)
line      black at 0.45
```
Light colour backgrounds (OKLab L ≥ 0.80), where white has nowhere lighter to go, so the ladder flips:
```
primary   black at 0.12 · 0.22 · 0.28 · 0.34 (base) · 0.40 · 0.46 · 0.58      (highlight → deep)
surface   white at 0.50 · 0.25 · 0.08 (soft),  black at 0.08 (base) · 0.12 · 0.16 · 0.26
line      black at 0.70
```
Accent, on every colour background:
```
accent    the brand colour that differs from THIS background in hue AND stands out from it:
          candidates have hue distance > 25°, chroma > 0.05 and contrast ratio ≥ 1.5 with the background;
          pick the highest score min(hueDistance, 150) × min(1, c / 0.08); use it at full strength.
          If no brand colour qualifies, the accent stands out by brightness instead:
            mid/dark background → white at 0.92 over the background
            light background    → tone(background hue, min(background chroma, 0.12), 0.30)
          Never the background colour itself.
accent-light = the accent mixed with white at 0.35;  accent-shade = mixed with black at 0.22
```

**Every background:**
```
gloss   tone(Nh, 0.01, 0.97)
panel   light/dark slides: same value as --th-slide-contrast
        colour slides: white at 0.90 over the background
```

### 3.6 Why it holds for any palette

Nothing is tuned to particular palettes. Every value comes from the palette's own inputs, so a palette a user builds goes through the same rules. The 4 named fixture palettes are test cases, not special cases.

Each rule above exists because a real palette broke without it, found by auditing all 1,999 palettes in deck-in/resources:

```
messy palette                               what would go wrong            rule that handles it
one brand colour, or several of one hue     accent = the background        accent must stand out; else brightness fallback
two identical brand colours                 same                           same
very light or neon brand colours            hero invisible on colour slide flipped ladder on light colour backgrounds
grey or tinted "light" background           accent too close               stand-off rule
"dark" background that is actually white    dark rules on a white slide    light/dark decided by real brightness
all greys (no hue at all)                   —                              works: neutral greys, accent by brightness
```

**Result** across 6,314 background blocks in 1,999 real palettes: no hero or accent under 1.3 contrast with its background, and no accent identical to it. Before these rules, about 2,000 blocks failed. Brand kits built in the app with one colour, or with a very light colour, also keep hero and accent at 1.5 contrast or more on every background.

The `edge-*` cases in `test/expected-tokens.json` are the regression tests for user palettes. Add a case whenever a palette produces something that reads badly.

### 3.7 Testing locally
The tokens only show on a slide if that slide's palette stylesheet contains them. **Where each palette loads from** (`DocumentThemesHelper.js` ~line 470): a palette counts as local only if it is in the built-in list (`PresetThemeHelper.getThemesList()`, i.e. `themelist.json`, the 45). Everything else loads from the CDN, even on localhost:

```
palette                       loaded from (localhost)                          tokens today
built-in (45)                 assets/resources/themes/css/  (the local mirror)  yes
brand kit / Add palette       CSS stored with the brand kit                     once re-saved with the frontend branch
company (~1,950)              https://cdn.presentations.ai/ampthemes/<name>.css no — the mirror's copies aren't used
workspace / user              https://cdn.presentations.ai/themes/<name>.css    no
deck with a saved theme URL   that URL                                          depends
```

So locally, only built-in palettes and re-saved brand kits show the real result; the generated company stylesheets only take effect once deck-in/resources is pushed and the CDN copies are updated (inferred from the loader code; check with the console line below). To check a slide, in the browser console:
`getComputedStyle(document.querySelector('[class*="th-light"], [class*="th-dark"], [class*="th-color"]')).getPropertyValue('--th-illus-primary')` (empty means the drawing is showing its fallback, §4.3).

## 4. Converting a drawing

### 4.1 Scope (`scope.json`)
Measured on the deck-in/resources `new_dev` clone (21 Oct 2026; `scope.json` came from an older local mirror and is out of date):
- **450 drawing ids.** 35 have 4+ hard-coded colours (`bridge` and `mountain` among them, skipped: their redesigns replace them; `cyclicalprogression` has since been themed upstream).
- **31 more** fill a large area with the slide **text colour** (`--th-slide-contrast`), which turns solid black on light slides (found from `waterflow`). They have no hard-coded colours, so the first count missed them; their role maps work through `vars` and `elements`.
- Plus `aim` (horizontal target board) and `waterflow`, mapped by hand.
- **10 SVGs under `genericassets/illustrations/`** (not 15). Not started.
- The remaining drawings already use theme variables and look fine; leave them alone unless they turn up in review.

### 4.2 Roles are decided per drawing, and a designer approves them

A script cannot know what a part *means*: which part is the hero, what is skin, what is a real-world colour like fire or gold. So:

1. **Propose.** For each id, take the `solid` file at its lowest point count as the master. `propose_role_maps.py` lists its colours with OKLCH values and area share (`tagger.py` → `colour_areas`) and writes a proposed **role map**: each colour → `primary | surface | accent | line | gloss | panel | card | fixed`, to `role-maps/<id>.json`. `proposal_sheet.py` renders proposals for review. Starting heuristics: the hero object → primary; large quiet shapes → surface; small focal parts → accent; near-black → line; white specular spots → gloss; skin, fire, metals that carry meaning → fixed.
2. **Designer review.** Mudita approves or edits each role map. Don't apply a role map that hasn't been approved.
3. **Apply** with `convert_drawings.py`:
   - **Base per part:** the area-weighted median OKLab L of the part's colours, ignoring L < 0.2. Half the part's area is lighter and half darker. A role map can override it, e.g. `"base": {"primary": 0.90}`.
   - **Tier per colour:** by `d = L − base`: d ≥ 0.165 → highlight · d ≥ 0.08 → light · d ≥ 0.03 → soft · |d| < 0.03 → base · d > −0.08 → dim · d > −0.165 → shade · otherwise deep. Accent has three tones: d ≥ 0.08 → light, d ≤ −0.08 → shade, else base. L < 0.2 → line.
   - **Tone override:** a role map can name a tone for one colour, e.g. `"#63000c": "primary-shade"`. That colour skips the automatic tone and gets exactly that token. Allowed: `primary-` / `surface-` + `highlight | light | soft | base | dim | shade | deep`, and `accent-` + `light | base | shade`. Use it when the automatic tone reads wrong, e.g. something placed on the body-fill tone that is really a shadow.
   - **Shading layers stay as drawn:** a pure black or white shape (chroma < 0.02, L < 0.08 or > 0.97) with opacity, fill-opacity or stop-opacity below 1 is a shading layer that works on any colour beneath it. Leave it untouched; converting it to a tinted token flattens the shading.
   - **`card` role:** a light block that holds DARK text (e.g. Waterflow's middle box) → `rgb(var(--th-slide-alternate-primary))`, the slide's near-background colour, which is always readable under the slide's text colour. Not a new token.
   - **Rewrite:** replace the colour in `fill`, `stop-color` and `stroke` attributes with `rgb(var(--th-illus-<token>, <fallback>))`. Fixed colours are left untouched.
   - **Existing theme variables:** `rgba(var(--th-…), a)` references are remapped by the role map, e.g. `"vars": {"--th-section-primary": "primary"}`, but only **outside point groups** (`g[id*="-point"]`), so per-point colours such as badges and markers keep their own colour. Default mapping for illustrations: section-primary / color1 → primary, color2–6 → accent, slide-secondary → surface-shade, slide-tertiary → surface-light. Leaving these unmapped was tried first and produced flat brand-colour blocks beside tonal greys.
   - **Per-shape overrides:** `"elements": {"color1-5": "line"}` sets one shape's token, matched on the id after `<id><N>node-` so it applies to every point count. Used for large shapes in the slide text colour: one that holds a text box → `line` (stays dark under light text); otherwise → `primary-deep`. Smaller text-colour details → `line` via `vars`. In these drawings the slide text colour is dark shading on light slides (shadows, dark faces, outlines); mapping it to a light hero tone erased the podium trophy's shadows.
   - **Apply to every variant:** apply the same role map to all point-count and style-folder variants of that id. If a variant has a colour the map doesn't cover, stop and report it; don't guess.
4. **Never touch:** ids, `content*` rects, `point*` and `placeholder*` groups; transforms; `<style>` motion blocks, `viewBox`, and anything that isn't a colour.

### 4.3 Fallback inside each reference
Every token reference carries a fallback to an existing variable, so a drawing still renders on a palette without tokens:

```
--th-illus-primary-*   → var(--th-section-primary)
--th-illus-surface-*   → var(--th-slide-tertiary)
--th-illus-accent-*    → var(--th-section-color2)
--th-illus-line        → var(--th-slide-contrast)
--th-illus-gloss       → 255, 255, 255
--th-illus-panel       → var(--th-slide-contrast)
```

Written as `fill="rgb(var(--th-illus-primary, var(--th-section-primary)))"`. A remapped theme colour falls back to its original variable, except `--th-slide-contrast` (the text colour), which falls back to its family's fallback: the text colour is black on light slides and made large shapes solid black. Shading collapses to flat colour in the fallback, but the drawing stays readable.

### 4.4 Decisions already made (prototype)
Approved and usable as-is. Colours are in the files' original hex.

```
lighthouse           white tower → primary (base override 0.90) · red stripe, lamp, glow → accent ·
                     rock greys → surface · windows #607476 → line
strugglingman        shirt (--th-section-color1) → primary · boulder → surface ·
                     #363636 (hair, trousers, tie) → line · #fbfcf5 → gloss ·
                     skin #ffbb96 #ff9361 #af483d #68544e → fixed
mountainclimbingman  cliff (--th-section-primary) → primary · clothes → surface ·
                     --th-section-color1 → accent · --th-section-color4 → accent-shade ·
                     --th-slide-secondary, #070505, #1e2e34 → line · #fff → gloss ·
                     skin #ffc3a3 #f59f75 → fixed
megaphoneinhand      red megaphone → primary · bell and greys → surface ·
                     sleeve navy + --th-section-color1 → accent · #000 #161616 #151b26 #001528 → line ·
                     #defff9 #fff #f7f7f7 → gloss · text panel (--th-slide-contrast) → panel ·
                     panel lines (--th-slide-secondary) → surface-shade · hand #dbae85 → fixed
rockettakeoff        rocket body (cool greys, hue 250–290) → primary · smoke → surface ·
                     flame (anything with chroma > 0.12) → fixed · #141414 → line · #fff → gloss
iceberg (library)    --th-section-color1 (underwater mass, water, waterline AND flag share it) → primary ·
                     snow-tip greys → surface · #000 #161616 → line · label leader lines (--th-slide-secondary)
                     left as they are. The flag can't be an accent here.
lighthouse (revised) rock highlights #dfdfdf #d3d3d3 → surface (were caught as tower colours)
podiumaward,         every drawn colour fixed: gold, silver, bronze are real-world colours; silver is grey,
winnertrophy         which the rules had sent to surface
waterflow            river (--th-slide-contrast) → primary · planks (--th-section-color5) → accent ·
                     middle box #545454 holds DARK text → card
aim                  #d01110 → primary · #fff → gloss (rings stay white) · #7c7c7c → surface ·
                     --th-slide-secondary → surface-shade
goal                 #fff → gloss (rings stay white; they had turned grey as surface)
bridgejourney        hills (green, hue < 160) → surface · water (teal, hue ≥ 160) → accent ·
                     bridge (--th-section-color1) → primary
podiumtrophy         text-colour shapes are the trophies' shadows and the podium's side faces →
                     primary-deep (large) / line (small); mapping them to a light hero erased the shadows
```

## 5. Known rendering issue: gradients across copies

Drawings are inlined into the page, and a shape filled with `url(#gradient-id)` uses the **first** element with that id anywhere on the page, with that copy's colours. The drawing files use the same gradient ids in every copy (lighthouse has 48 gradients), so two copies of a drawing on different backgrounds show the first copy's gradient colours. Flat fills are unaffected.

```
slide 3 (light)  lighthouse ── owns "lighthouse2node-linear-gradient" (light-slide tones)
slide 7 (dark)   lighthouse ── uses url(#lighthouse2node-linear-gradient) ──▶ light-slide tones on a dark slide ✗
```

This matters to the spike because it makes a correct colour approach *look* wrong (filmstrip, Present mode, Browse Templates show several copies at once). Reproduced in Chrome on 21 Oct 2026. The fix is in the diagram library, not the drawings: prefix every referenced id per inlined copy and rewrite its references. Full write-up, helper code and test in `GRADIENT-FIX.md` (tested: each copy's gradients then follow its own background). When judging drawings with gradients before that fix is in, look at one copy at a time.

## 6. Judging whether it looks all right

**Review sheet** (`review_sheet.py`; example `review-sheet-example.html` in the original spec folder), one page per batch of converted drawings:
- **Rows:** each converted drawing.
- **Columns:** "as drawn", light, dark, and colour 1–4.
- **Two views:** by drawing (pick a palette) and by palette (pick a drawing).
- **Palettes:** at least Tide, Cerise, Chronotone and Aurora, **plus the `edge-*` palettes** (one colour, all greys, pale yellow, near-black, duplicates, neon, misnamed dark, grey light), since "any palette" is the claim being tested.

Mudita reviews it; a drawing counts as converted only after that sign-off.

**Spike success criteria:**
- [ ] Every background block of every palette (45 app, ~1,950 company, brand kits) produces all 20 tokens; the one generator (`IllusTokenUtil.js`) matches `expected-tokens.json`, checked from both repos.
- [ ] No hero or accent under 1.3 contrast with its background, and no accent equal to it, across all 1,999 palettes; brand kits with one colour or a very light colour stay visible on every background.
- [ ] Converted drawings read well on the fixture and `edge-*` palettes, on light, dark and colour backgrounds (review sheet signed off).
- [ ] Converted drawings keep all ids, content rects, point groups and transforms; only colours change.
- [ ] No hard-coded colours remain except those mapped `fixed` and shading layers; every token reference carries its fallback.

## 7. Open colour questions
- **Custom slide backgrounds:** if a user sets a slide background colour that isn't one of the theme's background blocks, the tokens still come from the block, so contrast isn't guaranteed. Part of "any palette, any diagram", or accepted?
- **Drawings on a coloured card or section:** tokens follow the slide's background block, not a card or section colour behind the drawing. Same question.
- **Multiple scheme:** a drawing sits inside node 1, so these tokens don't vary per node. That's intended for illustrations.
- **`--th-illus-primary-highlight`** is used by only one of the seven prototype drawings. Keep it for now and revisit after all 34 ids are mapped.
- **Weak drawings, parked:** Open Door Opportunity, Mission and Vision, Mission / Vision statement read poorly even after conversion; the limit is the drawings themselves.
- **Big dark objects as neutrals:** the struggling man's boulder reads as pale stone on light slides, because neutrals sit light there by design. A per-part "shift darker" option in role maps would fix it if wanted.
- **The redesigned bridge and mountain drawings** (separate work, not yet in deck-in/resources) use `--th-section-*` and `--th-slide-*`. Convert them to these tokens once the approach is settled.

## Files in this folder
- `SPEC.md`: this document. `GRADIENT-FIX.md`: the gradient-ids fix for the diagram library.
- `illus-tokens.mjs`: loads the one generator (pitchdeckdoclist `IllusTokenUtil.js`) and rewrites stylesheets; `generate-illus-tokens.mjs`: runs it over a folder (`--check` to verify only).
- `oklch.py`: colour-space conversion used by the drawing converter (not a generator).
- `test/illus-tokens.test.mjs` + `test/expected-tokens.json`: 12 palettes including 8 user-palette edge cases, 1,040 values; `test/regenerate-fixture.mjs` rewrites the values from the generator when the maths change on purpose.
- `convert_drawings.py`: the drawing converter (role maps → tokens, with fallbacks). `role-maps/`: one JSON per drawing id.
- `propose_role_maps.py`: proposes a role map for every illustrated drawing that has none (never applied until approved).
- `proposal_sheet.py` + `review_sheet_lib.py`: the review page for proposed role maps.
- `review_sheet.py`: the review page for converted drawings on real palette stylesheets.
- `tagger.py`: area per colour, used when proposing role maps.
- `scope.json`: the 34 ids (files, point counts, style folders) and the 15 illustrations.
- The prototype review page (`review-sheet-example.html`) and the superseded prototype scripts stay in the original spec folder.

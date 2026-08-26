# Export PPT modal, rem typography, grounding

Volatile working notes. Ages with the code; don't trust it as current.

## Where this came from

Fork of Mani's `explorations/mani/pricing/export-ppt-modal.html` at commit `5ab872a`
(26 Aug 2026). Copied rather than edited: it is his frame.

Only the assets the proto actually references came along (5 card SVGs, 9 logo SVGs,
`ppt-3d.png`, `editor-bg.html`). The source `assets/export-ppt/` also holds `illo2.png`,
`illo5.png`, `priya.png` and `logos-edu/` (about 3 MB) that this file never loads.

## What changed

Every `font-size` and every px `line-height` became rem at a 16px root. 53 replacements.
Nothing else moved: no layout, copy, colour, spacing or radius change, and no `px` removed
outside typography.

| was | now | uses |
|---|---|---|
| 9.5px | 0.59375rem | 1 |
| 11px | 0.6875rem | 7 |
| 11.5px | 0.71875rem | 1 |
| 12px | 0.75rem | 7 |
| 12.5px | 0.78125rem | 2 |
| 13px | 0.8125rem | 5 |
| 14px | 0.875rem | 10 |
| 15px | 0.9375rem | 3 |
| 16px | 1rem | 3 |
| 17px | 1.0625rem | 2 |
| 18px | 1.125rem | 3 |
| 20px | 1.25rem | 1 |
| 22px | 1.375rem | 2 |
| 24px | 1.5rem | 2 |
| 26px | 1.625rem | 1 |
| 32px | 2rem | 1 |
| 280px | 17.5rem | 1 |

## Decisions worth remembering

- **Rendered output is byte-identical at a 16px root.** Nothing here sets `html { font-size }`,
  so this is a units change, not a visual one. It only starts to matter if a root override
  lands, or a browser is set to a larger default text size.
- **The 280px quote glyph converted too** (`.testimonial .quote-mark`, 17.5rem). It is
  decoration, not type, so it is the one value that arguably should have stayed px, it will
  now scale with the root along with everything else.
- **Seven values are off the design system scale**: 9.5, 11, 11.5, 12.5, 13, 15, 17px. The
  system ships 10 / 12 / 13 / 14 / 16 / 18 / 20 / 24 / 32 (`design-system/pai.tailwind.js`).
  Converting preserved them as-is rather than snapping them, so the fork stays a pure units
  diff. Snapping to the scale is a separate pass.
- **Ten of the converted rules size Phosphor icons, not text** (`.tier-features li i`,
  `.cb-x i`, `.work-link i`, …). Phosphor sizes glyphs by `font-size`, so they went to rem
  with everything else. That is the behaviour I want, an icon sitting beside a label should
  grow when the label grows, but it means this fork also changed icon sizing, not only type.
- **This proto does not load the design system.** No `pai.css`, no Tailwind config, all styles
  are inline in a single `<style>` block. So the rem tokens in `pai.tailwind.js` are not in
  play here, the conversion is hand-rolled against a 16px root.

## Repo context

The design system's type scale is already rem (`text-body-base-regular` is 0.875rem), but
component internals, spacing and icon sizes in `pai.css` are px, and across `explorations/`
there are roughly eight thousand px font-sizes against two hundred rem ones. Nothing sets a
root font-size anywhere, so rem and px render the same today.

## Verification

Diffed against the source with units normalised back to px: the only differences are the
provenance comment and the `<title>`. Every rem value maps back to its original px exactly,
including the four fractional ones (9.5, 11.5, 12.5px), which needed five decimal places to
round-trip cleanly.

## Snapping to the scale (27 Aug 2026)

The TODO below is closed: every `font-size` in the file now sits on the published ramp.
**10 / 12 / 13 / 14 / 16 / 18 / 20 / 24 / 32**, spelled the way `pai.tailwind.js` spells it
(13px is `.813rem`, the `2xs` token's own value, not the arithmetically-exact `.8125rem`).

Three rules did the work, and they are worth stating because they disagree about where a
value like 15px should land.

| kind | ramp | why |
|---|---|---|
| text | 10 / 12 / 13 / 14 / 16 / 18 / 20 / 24 / 32 | the type tokens |
| an icon sitting beside a label | 12 / 16 / 20 | `--icon-xs/sm/md`. Phosphor sizes glyphs by `font-size`, so a 15px icon reads as an off-scale type step and is not one |
| a standalone display icon | left alone | the 32px success tick in its 64px circle and the 24px step icons are drawn objects, not chrome |

### What actually moved on screen

Three things, all on the tier card, and they are the point of the pass rather than a side
effect of it:

- **Tier name and price 28 → 24.** 28px is the gap between 24 and 32 and belongs to neither.
- **Credit number 26 → 20.** It was 2px off the tier name, which reads as a mistake rather
  than a hierarchy. At 20 the card has an actual ladder: 24 price → 20 credits → 14 features
  → 13 captions. The price is the decision; the credits are the evidence for it.
- **The Reach seller note 9.5 → 12, the renewal legal 11 → 12.** DESIGN.md sets 12 as the
  floor for a paragraph and neither of these was near it. The checkout panel grows about
  30px as a result. The better fix is shorter copy, not smaller type — that is a VOICE
  question and it is still open.

Everything else is invisible at a 16px root: 11 → 10 or 12 by role (badges and tracked
uppercase labels down, captions and prose up), 12.5 → 13, 11.2 and 11.5 → 12, 22 → 20,
and the two spellings of 13px collapsed into one.

Line-heights were snapped to the published pairing for each size (10 → 1.33, 12 → 1.33,
14 → 1.43, 16 → 1.5, 24 → 1.3), except multi-line prose, which is 1.55 throughout. The
arbitrary 1.35 / 1.4 / 1.45 / 1.5 one-offs are gone.

The last six px `font:` shorthands the rem pass missed (`font:600 15px`, `font:400 14px/1.43`,
`font:700 9px`, …) are rem now, so the file's own claim in its header comment is true.

### Still off the ramp on purpose

- **The 280px quote glyph** (`.testimonial .quote-mark`, 17.5rem) — decoration, not type.
  The older TODO about it stands.
- **Weight.** The card sets 700 and 800; the type ramp publishes nothing above 600, and
  DESIGN.md says to make hierarchy with size and reach for weight second. Left alone because
  dropping the card to 600 is a visible change nobody asked for, but it is the next thing to
  settle here.
- **The serif quote at 24px.** On the numeric ramp, but not a quote token: the house tokens
  are `text-quote-lg` (28) and `text-quote-base` (20), and 24 is neither. 28 pushes it to a
  sixth line in the left panel.

## TODO

- [ ] Decide whether the quote glyph goes back to px.
- [ ] Decide whether the card drops from 700/800 to the published 600.
- [ ] Shorten the Reach seller note and the renewal legal so 12px costs no height.
- [x] Snap the off-scale values to the system scale — done 27 Aug 2026, see above.
- [ ] If this direction sticks, try a root override (e.g. 18px) to see what actually breaks.

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

## TODO

- [ ] Decide whether the quote glyph goes back to px.
- [ ] Decide whether to snap the seven off-scale values to the system scale.
- [ ] If this direction sticks, try a root override (e.g. 18px) to see what actually breaks.

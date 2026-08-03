# backdrops

Procedural background images for marketing assets, built for product
screenshots to sit on top of. Seven geometric motifs, each renderable in
any of four palettes.

```
open tools/backdrops/index.html          # or the Pages URL
```

Everything renders in-browser on a canvas. Nothing is stored: a preset is a
recipe plus a seed, so the same seed always gives the same image, and
**Reroll seeds** gives you a fresh set in the same styles.

## The idea

The starting reference was how Cursor stages product shots on painterly
backgrounds. What makes those work isn't the painting, it's the structure
underneath it.

**Motif and palette are separate axes.** The motif is the geometry; the
palette is the treatment. Switching palette re-skins all seven motifs
without touching the drawing, which is the only way to judge a treatment
fairly.

| The thing that matters | How it's done here |
|---|---|
| Structure, not a flat fill | a base field plus one linear **band** |
| Variation, so it never reads as a clean gradient | **cells**: a posterised mosaic, hard-edged, quantised into steps |
| A calm centre, interest at the edges | every motif layer is masked by `calm`, so the window lands on a quiet area |
| Fine grain everywhere | per-pixel luminance noise, which also kills banding |

**No palette uses a radial glow or a vignette.** Both simulate optics (a
light source, a lens) and that is exactly what reads as dated and
skeuomorphic. A glow on a navy-to-blue ramp is the 2014 corporate-tech
look. Depth here comes from geometry overlapping, not from fake light.

**The vocabulary is strictly geometric.** No curves, no organic
silhouettes, no painterly marks. Where a motif could produce a smooth
outline as a by-product (the tops of the slats), it's quantised to steps
on purpose.

## The palettes

| | |
|---|---|
| **Ink** (dark) | slate near-neutral, brand blue as punctuation on a few filled elements |
| **Cobalt** (dark) | flat brand blue, poster-like, geometry in white |
| **Paper** (light) | near-neutral off-white, brand blue as punctuation |
| **Mist** (light) | cooler, more tinted blue-grey field |

Brand blue `#005EFF` is deliberately an **accent**, not the ground: it fills
a handful of frames in Contact Sheet and a few cells in Layout, and nothing
else. Flooding a whole background with it is both dated and off-brand,
since blue is meant to mark growth moments rather than carry surfaces.

## The motifs

Each one is a reading of what a deck already is, rather than decoration
applied to it.

| | |
|---|---|
| **Stack** | slides offset and receding, bleeding off-frame. The literal one |
| **Strata** | layers seen edge-on, as a cross-section with a rule on each seam |
| **Panes** | overlapping planes; depth comes from value building at the crossings, not from blur |
| **Contact Sheet** | a grid of 16:9 frames, thinning out across the field |
| **Layout** | the frame recursively subdividing into slide layouts |
| **Nested** | concentric 16:9 frames. Sits well under a window because it echoes its shape |
| **Slats** | one frame sliced and pushed out of alignment: a build transition held still |

## Using it

| | |
|---|---|
| **plate** | drops a mock app window on every backdrop so you can judge a screenshot against it before exporting |
| **export** | 1920×1080, 2560×1440, 3840×2160, 4:3 or square. The preview is 1280×720; export re-renders from the same seed at full size, so what you see is what you get |
| **↻** on a card | re-seeds that one backdrop, keeping its motif |
| **↓** on a card | downloads that PNG |
| **Download all 14** | fires fourteen downloads back to back. Chrome will ask once to allow multiple files |

Files come out named `pai-backdrop-<palette>-<motif>-<W>x<H>.png`.

## Changing them

`PALETTES` and `MOTIFS` are separate arrays in `index.html`, combined by
`buildPreset()`. A motif returns its layers as a function of the palette's
`ink`, so adding either one is independent of the other.

```
palette   base    the underlying field
          lights  washes: {type:'band', angle, stops}
                  (radial blooms are still supported but nothing uses them)
          cells   the posterised mosaic
          ink     {stroke, fill, accent, blend, a, fa, calm}
          grain   {amount, scale, chroma, opacity}

motif     layers(ink) -> stack · strata · panes · frames · layout
                         · nested · slats · grid · hairline · particles
```

The seed lives on the **motif**, so switching palette changes only the
treatment. That is what makes two palettes comparable.

Things learned the hard way, all worth keeping:

- **A glow or a vignette will date the whole thing** no matter how good the
  geometry is. Structure the field with a linear band instead.
- **Light palettes get their light from `cells`, not from a white radial
  blob.** A white radial on a tinted base punches the tint out and leaves
  grey mid-tones.
- **A motif that's barely visible is worse than no motif** — it just reads
  as a slightly dirty gradient. If you can't name the motif at a glance,
  raise `ink.a` rather than leaving it subtle.
- **Don't let the mosaic out-shout the motif.** Around `alpha` 0.5 it wins;
  0.26–0.34 is about right on light, 0.28 on dark.

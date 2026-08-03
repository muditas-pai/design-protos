# backdrops

Procedural background images for marketing assets, built for product
screenshots to sit on top of. Seven geometric motifs, each in a dark and a
light variant, all in the brand's electric blue.

```
open tools/backdrops/index.html          # or the Pages URL
```

Everything renders in-browser on a canvas. Nothing is stored: a preset is a
recipe plus a seed, so the same seed always gives the same image, and
**Reroll seeds** gives you a fresh set in the same styles.

## The idea

The starting reference was how Cursor stages product shots on painterly
backgrounds. What makes those work isn't the painting, it's four things
underneath it, and those are what the tool reproduces:

| The thing that matters | How it's done here |
|---|---|
| Large-scale value structure, not a flat fill | a base gradient plus a **band** wash that gives the frame a light half and a dark half |
| Variation, so it never reads as a clean gradient | **cells**: a posterised mosaic, hard-edged, driven by noise but quantised into steps |
| A calm centre, interest at the edges | every motif layer is masked by `calm` before compositing, so the window lands on a quiet area |
| Fine grain everywhere | per-pixel luminance noise over the whole frame, which also kills gradient banding |

**The vocabulary is strictly geometric.** No curves, no organic silhouettes,
no painterly marks. Where a motif could produce a smooth outline as a
by-product (the tops of the slats), it's quantised to steps on purpose.

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

Dark variants are a saturated blue field, for **light UI** screenshots.
Light variants are pale and blue-tinted, for **dark UI** screenshots.

## Using it

| | |
|---|---|
| **plate** | drops a mock app window on every backdrop so you can judge a screenshot against it before exporting |
| **export** | 1920×1080, 2560×1440, 3840×2160, 4:3 or square. The preview is 1280×720; export re-renders from the same seed at full size, so what you see is what you get |
| **↻** on a card | re-seeds that one backdrop, keeping its motif |
| **↓** on a card | downloads that PNG |
| **Download all 14** | fires fourteen downloads back to back. Chrome will ask once to allow multiple files |

Files come out named `pai-backdrop-<mode>-<id>-<W>x<H>.png`.

## Changing them

A preset is a plain object in `index.html`. To add one, copy the nearest
preset, change `id`, `name`, `seed` and `recipe`, and adjust:

```
base      linear gradient, the underlying colour
lights    washes: {type:'band', angle, stops} for structure,
          or {x, y, r, color, blend} for a bloom
layers    cells · stack · strata · panes · frames · layout · nested · slats
          · grid · hairline · particles
          each takes calm (0 = even, 1 = centre cleared) and a blend mode
vignette  corner darkening
grain     {amount, scale, chroma, opacity}
```

`id` must be unique across the whole set, including across modes — the
preview cache is keyed by it, so two presets sharing an id will render as
each other.

Four things learned the hard way, all worth keeping:

- **Light presets get their light from `cells`, not from a white radial
  blob.** A white radial on a tinted base punches the tint out and leaves
  grey mid-tones.
- **On light presets the mosaic has to stay under the motif.** At `alpha`
  around 0.5 it wins, and the motif reads as a faint afterthought; 0.32–0.36
  is about right.
- **`calm` above ~0.5 is for dark presets only.** On a pale ground, pushing
  texture out to the edges reads as dirt in the corners rather than as
  atmosphere. Light presets sit at 0.15–0.3.
- **A motif that's barely visible is worse than no motif** — it just reads as
  a slightly dirty gradient. If you can't name the motif at a glance, raise
  the alpha rather than leaving it subtle.

Colours come from the brand: navy `#0A1925`, brand blue `#005EFF`
(`#0043B8` / `#0055ED` companions).

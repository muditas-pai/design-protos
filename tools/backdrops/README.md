# backdrops

Ten procedural background images for marketing assets, built for product
screenshots to sit on top of. Five dark, five light, all in the brand's
electric blue.

```
open tools/backdrops/index.html          # or the Pages URL
```

Everything renders in-browser on a canvas. Nothing is stored: a preset is a
recipe plus a seed, so the same seed always gives the same image, and
**Reroll seeds** gives you a fresh set of ten in the same styles.

## What it's for

The reference point is how Cursor stages its product shots on painterly
backgrounds. What makes those work isn't the painting, it's four things
underneath it, and those are what this tool reproduces in our own visual
language:

| The thing that matters | How it's done here |
|---|---|
| Large-scale value structure, not a flat fill | a base gradient plus a **band** wash that gives the frame a light half and a dark half |
| Organic variation, never a clean gradient | **mottle**: fbm noise rendered small and scaled up, so light falls in irregular patches |
| A calm centre, interest at the edges | every texture layer is masked by `calm` before compositing, so the window lands on a quiet area |
| Fine grain everywhere | per-pixel luminance noise over the whole frame, which also kills gradient banding |

Texture vocabulary is grids, particles, network meshes, contours and fine
lines. No painterly brushwork, no fluted glass.

## Using it

| | |
|---|---|
| **plate** | drops a mock app window on every backdrop so you can judge a screenshot against it before exporting. Pair a **light UI** shot with the dark set, a **dark UI** shot with the light set |
| **export** | 1920×1080, 2560×1440, 3840×2160, 4:3 or square. The preview is 1280×720; export re-renders from the same seed at full size, so what you see is what you get |
| **↻** on a card | re-seeds that one backdrop, keeping its style |
| **↓** on a card | downloads that PNG |
| **Download all 10** | fires ten downloads back to back. Chrome will ask once to allow multiple files |

Files come out named `pai-backdrop-<mode>-<id>-<W>x<H>.png`.

## The ten

**Dark** (saturated blue, for light UI screenshots)

| | |
|---|---|
| Deep Field | flow-lines over navy, brand blue glow low-left. The quietest one |
| Signal Grid | a receding grid plane with a particle haze |
| Constellation | network mesh of linked nodes, off-centre bloom |
| Ion | the most electric: `#005EFF` at full strength, crossed hairlines, heavy grain |
| Contour Depth | topographic iso-lines |

**Light** (blue-tinted, low contrast, for dark UI screenshots)

| | |
|---|---|
| Paper Blue | tinted paper with a soft flow-line drift |
| Mesh Light | the network mesh, near-white |
| Drift | flow-lines with a whisper of brand orange in one corner |
| Halftone Field | a particle field with a density gradient |
| Blueprint Light | fine grid with major axes |

## Changing them

A preset is a plain object in `index.html`. To add one, copy the nearest
preset, change `id`, `name`, `seed` and `recipe`, and adjust:

```
base      linear gradient, the underlying colour
lights    washes: {type:'band', angle, stops} for structure,
          or {x, y, r, color, blend} for a bloom
layers    texture: mottle · flow · grid · particles · network · contour · hairline
          each takes calm (0 = even, 1 = centre cleared) and a blend mode
vignette  corner darkening
grain     {amount, scale, chroma, opacity}
```

Two things learned the hard way, both worth keeping:

- **Light presets get their light from `mottle`, not from a white radial
  blob.** A white radial on a tinted base punches the tint out and leaves grey
  mid-tones; irregular mottle patches read as light instead.
- **`calm` above ~0.5 is for dark presets only.** On a pale ground, pushing
  texture out to the edges reads as dirt in the corners rather than as
  atmosphere. Light presets sit at 0.15–0.35.

Colours come from the brand: navy `#0A1925`, brand blue `#005EFF`
(`#0043B8` / `#0055ED` companions), orange `#FF5500` used only as a whisper.

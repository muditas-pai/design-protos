# Template fill motion — grounding

Volatile reference for this folder. Ages with the design and the code. Not a spec.

## The problem

Show, in motion, that a template slide's placeholder content is being replaced by real,
generated content. Five distinct treatments, each run on two slides with different layouts, so
we can pick a house style rather than inventing a new one per surface.

| # | Treatment | Cover | The Opportunity | Shape |
|---|---|---|---|---|
| 1 | Stream | 6.7s | 10.1s | everything at once, typed and scanned |
| 2 | Shimmer sweep | 7.0s | 7.0s | one band of light, whole slide as one gesture |
| 3 | Stagger swap | 6.7s | 10.1s | word by word, tile by tile |
| 4 | Stream, in sequence | 10.9s | 16.4s | treatment 1 with nothing overlapping |
| 5 | Stream, lit | 6.7s | 10.1s | treatment 1 with the writing glowing |

## Source of truth

Both slides are from **JAS '26 — Working file**, file key `FilrWEhw4GFBJqKUpKabCa`.

| Slide | Template node | Filled node |
|---|---|---|
| Cover | `813:36648` | `813:36528` |
| The Opportunity | `813:36712` | `813:36592` |

Everything reconstructed here was read off those nodes, not eyeballed from a screenshot:

- Background is one greyscale leaf photograph coloured by a
  `linear-gradient(139.885deg, #bbfb67 29.982%, #6dfac2 66.206%)` div in `mix-blend-mode: color`.
  That is why `public/cover-bg.png` is greyscale. **Both slides use the same file at different
  crops**: the cover at `0, -375, 2438 x 1625`, The Opportunity at `-703, -1257, 3506 x 2337`.
- Display face is **Familjen Grotesk**. Figma sets body copy in a licensed face called Momo Trust
  Sans, which we do not have; body is set in Familjen Grotesk too and the difference does not read
  at these sizes. Because of that, The Opportunity's body copy is **hand-wrapped to Figma's line
  breaks** rather than left to the browser.
- Cover: title 112/120/-2, subtitle 36/38, footer 28/38. The two-line placeholder title collapses
  to one real line, which moves the rule and subtitle **up 99px**.
- The Opportunity: title 80/82/-1, strapline 30/38, item headings 36/48/-0.3 semibold, item bodies
  28/38. Item blocks are vertically centred, so an item whose body grows from two lines to three
  moves **up 20px**. The template's strapline is replaced by the green rule, not by other text.
- Picture frame (cover only): `1200, 120, 640 x 840`, 5px border `rgba(187,251,103,0.5)`, radius
  `80 80 80 0`. The photo inside is 1680 x 2400 at 100% width / 108.84% height / -4.42% top.

## Prototype decisions

- **Slides are data, treatments are code.** `src/slides/cover.tsx` and
  `src/slides/opportunity.tsx` each declare both states of every field with absolute tops;
  `src/schedule.ts` turns a spec into per-field timings; the five treatments in
  `src/treatments/` never mention either slide. Adding a third slide is a new spec, not new
  motion code. Cut lengths are computed from the schedule, not typed in.
- **Absolute tops, not flex columns.** Modelling each field's template and filled position as two
  numbers and interpolating between them is simpler than a flex column that has to be measured,
  and it makes the reflow explicit as a design decision rather than a side effect.
- **Treatments 1, 4 and 5 are one component.** They differ only in the plan they are handed
  (`parallelPlan` vs `sequentialPlan`) and whether the typed characters glow.
- **The mosaic is a pre-downscaled file, not a CSS effect.** `image-rendering: pixelated` plus a
  `transform: scale()` does not pixelate in headless Chrome; it re-rasterises from the
  full-resolution source and you get a sharp photo with a grid drawn over it.
  `public/photo-mosaic.png` is the photo resampled to 16 x 23 with `sips`, blown back up to 640px
  wide with nearest-neighbour. That also fixes treatment 3's tile grid to the same 16 x 23.
- **The Opportunity's diagram is chrome.** The arc, the three icon circles and the connector lines
  are identical in both states, so they are one exported SVG that never animates. Figma's PNG
  export of that node comes back on an **opaque black background**, and the black cannot be keyed
  out because the icon glyphs are black strokes inside the green circles. The SVG export works
  once its artboard mat and the slide's background rect are stripped out of the file by hand.
- **The MCP reported the template's item headings at 50% opacity; the render says otherwise.**
  Sampling the Figma screenshot puts the heading at full white (255) and the body at ~147, so the
  spec uses opacity 1 for headings in both states. Trust the pixels over the generated code.
- **Treatment 2 masks two complete slides** rather than animating individual elements. That is
  what lets it survive a change of layout, and why it is the same length on both slides.
- **No blur on the outgoing layer in treatment 2.** A `filter: blur()` on the masked layer blurs
  the whole slide the moment the sweep starts, including the parts nothing has happened to yet.
  The band's own soft gradient edge does the bridging instead.
- **Treatment 4 marks nothing.** A first pass had a green rail in the left margin holding the
  current component. It was the only invented element in the folder and read as scaffolding, so it
  was cut on 26 Aug 2026. The caret, the rule's single pulse and the scan line carry the sequence.
- **The mosaic grid stays put until the scan line covers it.** Fading it off a region the line has
  not reached yet reads as the placeholder giving up early.
- Curves: `cubic-bezier(0.23, 1, 0.32, 1)` for entrances, `cubic-bezier(0.77, 0, 0.175, 1)` for
  reflow, a gentler `cubic-bezier(0.5, 0, 0.5, 1)` for the sweep because a strong ease makes the
  last corner visibly drag. Exits always run shorter than entrances.

## Running it

```
cd remotion
npm install
npm run dev        # Remotion studio, scrub any cut frame by frame
npm run build:all  # render all eleven files into out/ (wraps render-all.sh)
```

`remotion/node_modules/` and `remotion/out/` are gitignored. The eleven committed `.mp4` files in
`assets/` are what `motion-treatments.html` plays, so **re-copy them from `remotion/out/` after a
re-render** or the page keeps showing the old cut.

## TODO

- Pick one treatment, or a hybrid: the sweep for the picture, the lit stream for the text.
- Treatment 5's bloom sits at 55% over a blurred copy. Check it on a projector before shipping;
  it may be too much light in a dark room.
- Treatment 4 scales badly with field count (sixteen seconds on a three-item slide). Either cap
  it to hero slides or let several fields share a turn.
- Try the sweep on a dense table slide, where the diagonal has much more to cross.
- Sound is out of scope so far; a single soft transient on the sweep would probably carry it.

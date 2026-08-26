# Template fill motion — grounding

Volatile reference for this folder. Ages with the design and the code. Not a spec.

## The problem

Show, in motion, that a template slide's placeholder content is being replaced by real,
generated content. Three distinct treatments so we can pick a house style for it rather than
inventing a new one per surface.

## Source of truth

Both slides are from **JAS '26 — Working file**, file key `FilrWEhw4GFBJqKUpKabCa`.

| State | Node | What it is |
|---|---|---|
| Template | `813:36648` | Bracketed placeholders at 50% / 40% opacity, picture as a 16 x 23 mosaic with a green grid |
| Filled | `813:36528` | Ledgerline x Corva, Corva partnerships team, March 2026, real photograph |

Everything the animation reconstructs was read off those two nodes, not eyeballed from a screenshot:

- Background is one greyscale leaf photograph at `left 0, top -375, 2438 x 1625`, coloured by a
  `linear-gradient(139.885deg, #bbfb67 29.982%, #6dfac2 66.206%)` div in `mix-blend-mode: color`.
  That is why the background is greyscale in `public/cover-bg.png`.
- Title is **Familjen Grotesk** 112px, line-height 120, tracking -2. Body in Figma is a licensed face
  called Momo Trust Sans, which we do not have; the protos set body in Familjen Grotesk too and the
  difference does not read at these sizes.
- The title block is a vertically centred auto-layout, so the two-line placeholder title sits at
  `top: 99` and the one-line real title at `top: 120`. Collapsing two lines to one therefore moves the
  rule and the subtitle **up 99px**, which is a real beat in all three treatments, not a mistake.
- Picture frame: `1200, 120, 640 x 840`, 5px border `rgba(187,251,103,0.5)`, radius `80 80 80 0`.
  The photo inside is 1680 x 2400 placed at 100% width / 108.84% height / -4.42% top.

## Prototype decisions

- **The mosaic is a pre-downscaled file, not a CSS effect.** `image-rendering: pixelated` plus a
  `transform: scale()` does not pixelate in headless Chrome; it re-rasterises from the full-resolution
  source and you get a sharp photo with a grid drawn over it. `public/photo-mosaic.png` is the photo
  resampled to 16 x 23 with `sips`, blown back up to 640px wide with nearest-neighbour. That also fixes
  the tile grid in treatment 3 to the same 16 x 23, so tiles land exactly on mosaic cells.
- **Treatment 2 masks two complete slides** rather than animating individual elements. That is what lets
  it survive a change of layout: it never needs to know what is on the slide.
- **No blur on the outgoing layer in treatment 2.** A `filter: blur()` on the masked layer blurs the whole
  slide the moment the sweep starts, including the parts nothing has happened to yet. The band's own
  soft gradient edge does the bridging instead.
- Content lives in `src/theme.ts` as `TEMPLATE` and `FINAL`. Swapping the deck or the photograph is a
  one-file change plus a new `photo.jpg` / `photo-mosaic.png`.
- Curves: `cubic-bezier(0.23, 1, 0.32, 1)` for entrances, `cubic-bezier(0.77, 0, 0.175, 1)` for the
  block reflow, a gentler `cubic-bezier(0.5, 0, 0.5, 1)` for the sweep because a strong ease makes the
  last corner visibly drag. Exits always run shorter than entrances.

## Running it

```
cd remotion
npm install
npm run dev        # Remotion studio, scrub any treatment frame by frame
npm run build:all  # re-render 1-stream / 2-shimmer / 3-stagger / reel into out/
```

`remotion/node_modules/` and `remotion/out/` are gitignored. The four committed `.mp4` files in
`assets/` are what `motion-treatments.html` plays, so **re-copy them from `remotion/out/` after a
re-render** or the page keeps showing the old cut.

## TODO

- Pick one treatment (or a hybrid: sweep for the picture, stream for the text).
- Decide whether the caret in treatment 1 is on-brand or too "chat app".
- Try treatment 2 on a dense body-copy slide, where the diagonal has more to cross.
- Sound is out of scope so far; a single soft transient on the sweep would probably carry it.

# Icon animations — grounding

Volatile reference for this folder. Ages with the code — don't trust as current.

## Problem

Animate Phosphor icons and export them as **Lottie `.json`** — the format apps use for
animated icons — for the **chat loading states**. They sit in the same slot as Tyo's
spinner mark.

## Where they run (sizing + colour)

- Tyo's loader lives in `explorations/tyo/loader/`. The spinner tuner runs at **120px**, but
  the real chat usage is **20px** inline with a phase label (`chat-prototype.html`:
  "20px loader + phase label" — *Thinking… / Searching…*).
- So **20px is the target size**; the renderer previews 20 / 24 / 40px plus a 128px hero and an
  in-context chat row.
- Loader mark colour is **`#2f2be5`** (the violet-blue Tyo uses), *not* navy. The renderer
  re-tints any Lottie's strokes live so we can match whatever the loading surface needs.

## How they're authored (Text-to-Lottie + Skottie)

Built **through the Text-to-Lottie skill** (`diffusionstudio/lottie`, MIT) running in a scratch
clone at `~/lottie-lab` — a Skia/**Skottie** player with a `/__context` HTTP endpoint and live
preview. Verification doesn't need a browser: frames render headlessly via the bundled
`canvaskit-wasm` (`MakeManagedAnimation` → PNG). That loop caught a real bug — see below.

All **parametric shapes**, no traced bezier paths, so each stays tiny (~3–6 KB) and editable.
Stroke **14** @ 256 viewbox ≈ 1.1px at 20px display (was 18 — too heavy; Phosphor regular ~16).

**Globe** — front-on Phosphor globe. Static frame (outer circle · equator · 2 tropics) plus
**three meridian ellipses** width-pulsing 96↔6 at 0/40/80-frame phase offsets. Three staggered
longitudes read as a wireframe **sphere rotating** (fuller than the old 2). Subtle whole-globe
breath (100→102.5%). No masks; seamless 2s loop (`fr 60`, `op 120`).

**Sparkle** — Phosphor four-point star. Main star **pulses** (74↔85%, overshoot easing) with a
±4° wobble — *not* a full spin: the headless render showed a 0→90° spin looked like a tumbling
shuriken and the companions collided with an oversized star. Fixed = smaller main star + two
**corner companions** that pop in with overshoot (top-right twice, bottom-left once, offset) so
something's always twinkling. 2s loop.

The lab scenes carry an extra background layer + a `bgColor` Skottie **slot** (player needs a bg
control); the port to this folder strips that layer + slots, leaving the icon with inline stroke
colours so the lottie-web renderer can re-tint.

## Files

- `globe.json`, `sparkle.json` — the Lottie deliverables (hand off to eng / drop into lottie-web).
- `lottie-renderer.html` — the renderer, with an icon switcher (Globe / Sparkle). Both are
  **inlined** so it runs from Finder (`file://` blocks `fetch`); the `.json` files on disk are
  identical. Drag-drop loads any other `.json` to preview.

## Decisions / TODO

- **Author in `~/lottie-lab`** (Text-to-Lottie scratch clone, gitignored from this repo), preview
  live at `http://localhost:3030/icon-animations/scene-1` (globe) / `scene-2` (sparkle), then port
  into this folder. To regenerate frames headlessly: `node /tmp/render-check.mjs` style script
  using `canvaskit-wasm/bin/full`.
- Renderer uses `lottie-web@5.12.2` from unpkg (SVG renderer). Lab uses Skottie — they agree on
  these basic shape/transform/easing features, but eyeball the lottie-web output too.
- Done: globe (searching), sparkle (generating). Next: magnifying-glass, brain/gear (reasoning)
  — to cover the chat phase set Tyo's loader exposes.
- Open question: ship as Lottie, or is animated SVG/CSS enough for eng? Lottie wins if the same
  files feed web **and** native/mobile.

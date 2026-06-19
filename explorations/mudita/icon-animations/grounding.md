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

## How the globe is built (no After Effects)

Hand-authored Lottie, all **parametric shapes** — no traced bezier paths, so it stays tiny
(~3 KB) and editable:

```
frame (static)      outer circle · equator · 2 tropic lines   ← Phosphor globe, front-on
meridian-a (anim)   vertical ellipse, width 96 → 6 → 96
meridian-b (anim)   vertical ellipse, width  6 → 96 → 6        ← 90° out of phase with A
```

The two meridians breathing out of phase read as a **wireframe globe rotating** — no masks,
seamless 2s loop (`fr 60`, `op 120`). Stroke 18 @ 256 viewbox ≈ 1.4px at 20px display.

## Files

- `globe.json` — the Lottie deliverable (hand off to eng / drop into lottie-web).
- `lottie-renderer.html` — the renderer. Globe is **inlined** so it runs from Finder
  (`file://` blocks `fetch`); `globe.json` on disk is the identical data. Drag-drop loads any
  other `.json` to preview.

## Decisions / TODO

- **v1 = globe only.** Spin is symmetric (pulse), not directional — reads fine; a directional
  sweep would need a circle clip-mask. Revisit if it feels too "breathing".
- Renderer uses `lottie-web@5.12.2` from unpkg (SVG renderer).
- Next icons to try once the globe lands: magnifying-glass (searching), sparkle (generating),
  brain/gear (reasoning) — to cover the chat phase set Tyo's loader exposes.
- Open question: ship as Lottie, or is animated SVG/CSS enough for eng? Lottie wins if the same
  files feed web **and** native/mobile.

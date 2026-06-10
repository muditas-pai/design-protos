# Pai Loader — project context

Brand loader animations for presentations.ai, recreated from Figma prototypes as
self-contained HTML files (no build step, no dependencies). This file is the handoff
context from the Cowork session where these were built.

## Figma sources

File: `T3VGugpHgpvi3jHsBm43Cn` (AMJ '26 - Dashboard), page "Loading" (canvas 348:7201).

- **Logo cascade** — Component 7 (`361:2707`, frames 35–36): two-frame smart-animate.
  Bars cascade: a new bar enters tiny at bottom → grows to small → big at top → fades out.
- **Spinner** — Component 5 (`361:2701`, frames 26–34): the logo (frame 26) dissolves
  into 8 parallelogram dashes appearing one-by-one around a circle while the ring rotates.
- **Spinner variants** — Components 1–4 (`361:2668`, `361:2674`, `361:2680`, `361:2691`):
  radius patterns layered on rotation → pulseOut, pulseIn (collapse to center blob),
  heartbeat, expandCollapse.
- **Chat thinking UI** — "Thinking" frames (`348:8763` etc.): 20px loader + label.

## Files

- `loader.html` — logo cascade + tuner panel (standalone, pure CSS keyframes).
- `loader-spinner.html` — ring spinner + tuner panel (standalone).
- `loader-combined.html` — logo ↔ spinner as two states with morph transitions,
  variant select + random shuffle, auto-cycle mode. Superseded by loader-llm.html.
- `loader-llm.html` — **the canonical component** (`createPaiLoader`) + demo harness
  with full config panel.
- `chat-prototype.html` — chat UI using the component as an inline thinking indicator.
  Its copy of `createPaiLoader` is the most recent: adds `initialPhase` option and
  `still: true` phase support. If consolidating, treat the chat copy as source of truth.

## Geometry (do not eyeball — these came from the Figma nodes)

- Tile: 120×120. All math assumes this; visual size via `transform: scale()`.
- Logo poses (bbox x,y,w,h): big bar 21,21,72,54 · small bar 21,69,45,33 ·
  enter pose 21,101,20,15 (opacity 0) · exit pose 21,21,16,12 (opacity 0).
- Ring: 8 dashes, 19.5×15.6 each, centers at radius **29.25** from tile center (60,60),
  45° apart, each rotated to its angle. Expanded radius 41.4, collapsed 4 (scale 0.8).
- Parallelogram slant: 25% of height, top edge slants up to the right.
- Brand blue: `#2f2be5`.

## Implementation decisions (and why)

- **Parallelograms are skewY'd rectangles, not clip-path.** clip-path can't do
  border-radius. For target box w×h with slant s%: element height = h−sh, shifted
  down sh/2, `skewY(−atan(sh/w))` where sh = h·s/100. This reproduces the clip-path
  polygon exactly. See `sk()` helper.
- **Keyframes are generated in JS** into per-instance `<style>` tags (namespaced
  `pai{N}cascade`, `pai{N}ringspin`, `pai{N}orbit{i}`) because hold %, slant, spin
  and easing are all configurable. Multiple instances coexist safely.
- **Logo → spinner only morphs at a cascade loop boundary** (listens for
  `animationiteration` on the enter-role dash) so the morph starts from the exact
  frame-35 pose — never a visual jump. Worst-case wait = one `speed` period.
- **Spinner exits freeze first**: each dash's computed transform matrix is written
  inline before removing the animation, then CSS transitions take over. Same for the
  ring angle (unwinds to 360°). This makes mid-pattern exits seamless.
- **Variant switches** (spinner→spinner) freeze, regroup to the base ring over one
  MORPH, then start the new orbit pattern.
- **Rapid phase changes queue** (`pendingPhase`) and apply in order.
- Dash roles: indices 3 (small bar), 4 (big bar), 5 (enter bar); appear order
  `[3,4,5,6,7,0,1,2]`, stagger 0.08s, morph 0.55s.

## Component API (createPaiLoader)

```js
const loader = createPaiLoader(mountEl, {
  config: { ... },            // see keys below
  phases: { ... },            // optional override of phase map
  initialPhase: 'thinking',   // chat copy only: mount directly in a phase
});
loader.setPhase('thinking');  // phases: idle, thinking, searching, reasoning, generating, done
loader.setConfig({ speed: 2 });
loader.on('phasechange', (phase, variant, state) => {});
loader.getPhase(); loader.getVariant(); loader.getState(); loader.getConfig();
```

- Phase map values: `{ state:'logo' }`, `{ state:'logo', still:true }` (static logo,
  no cascade — chat copy only), or `{ state:'spinner', variant:'random'|<name> }`.
- Variants: `classic`, `pulseOut`, `pulseIn`, `heartbeat`, `expandCollapse`.
  `'random'` picks a different variant on every phase change.
- Config keys: `speed` (s), `hold` (pause % per step), `slant` (%), `radius`
  (corner px), `scale`, `spin` (deg per step), `easing`, `color`, `background`.

## Settled product choices (chat prototype)

- Loader config: **speed 1.5, easing linear, hold 0** (continuous, no pauses),
  `background: 'transparent'`, 20px (`scale: 20/120`), corner radius 2px.
- Every response **starts with the logo cascade** (initial animation), then morphs
  to spinner; variants randomize on each phase change.
- Layout: no avatar; loader + label in a horizontal row (4px gap), message below.
  No bubble/container on assistant messages; user messages keep blue bubbles.
- Labels are plain text with CSS `::after` "..." — no shimmer, regular font weight.
- On done: loader fades out mid-spin (no morph back to logo) and its space collapses
  (mind the −4px margin matching the flex gap); label crossfades to "Thought for Xs"
  (same font size, gray `#9a9aae`).
- Page layout: no card; messages scroll with the page; only the composer is sticky
  (frosted blur).

## Known leftovers

- `verify_frame35.png` / `verify_ring.png` may exist in the old session outputs —
  scratch verification renders, safe to delete; not part of the project.
- `loader.html` / `loader-spinner.html` still use clip-path (no corner radius) —
  fine as standalone references; the component versions are canonical.

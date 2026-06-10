# Pai Loader — developer handoff (React)

How to drop the brand loader into a React app. The loader is one animated mark that
**morphs between a resting logo and a spinning state** and is driven entirely by a
single `phase` string — so it doubles as a logo *and* a progress indicator without
swapping components.

> Designer: Tyo · Source: AMJ '26 Dashboard Figma ([file](https://www.figma.com/design/T3VGugpHgpvi3jHsBm43Cn/AMJ--26---Dashboard)) · Brand blue `#2f2be5`

---

## Two components

Pick based on how much control you want over the label text:

| Component | What it renders | Use when |
|---|---|---|
| **`PaiLoader`** | The animated mark **only** — one square `<span>`, no text. | You want to lay out and style your own label (or need no label). **This is the primitive.** |
| **`PaiLoaderLabel`** | `PaiLoader` + a phase-driven text label in an inline row. | You want the standard "spinner + status text" out of the box, with sensible defaults you can still restyle. |

`PaiLoaderLabel` is a thin wrapper over `PaiLoader` — same engine, same phase model.
Everything in §3–§9 below is about `PaiLoader`; the label wrapper is documented in §10.

---

## 1. Install

Copy the files you need into the app — no npm dependency, no build step required:

```
pai-loader.mjs        ← framework-free runtime (always required)
PaiLoader.jsx         ← the loader-only component
PaiLoaderLabel.jsx    ← optional: loader + label wrapper (imports PaiLoader.jsx)
```

These import each other relatively, so keep them in the same folder (or fix the import
paths). If your toolchain can't process `.jsx`, use the no-JSX twins
`PaiLoader.react.mjs` / `PaiLoaderLabel.react.mjs` — identical APIs.

```jsx
import { PaiLoader } from './PaiLoader.jsx';
import { PaiLoaderLabel } from './PaiLoaderLabel.jsx';
```

---

## 2. Quick start

The loader is **controlled** — you own a `phase` string in state and pass it down:

```jsx
function ThinkingIndicator({ isThinking }) {
  return (
    <PaiLoader
      phase={isThinking ? 'thinking' : 'idle'}
      size={24}
    />
  );
}
```

That's the whole integration. `idle` shows the resting logo; `thinking` morphs it into
the spinner. Flip the prop and the component animates between states for you.

---

## 3. Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `phase` | `string` | `'idle'` | **The main control.** Any key in the phase map (see §5). Change it → the loader transitions. |
| `size` | `number` | `120` | Rendered square in **px**. See §4 — **prefer `24`** for inline use. Min `20` (clamped). |
| `config` | `object` | — | Visual overrides (color, speed, …). See §6. Wrap in `useMemo`. |
| `phases` | `object` | — | Override/extend the phase→animation map. See §5. Wrap in `useMemo`. |
| `ariaLabel` | `string` | `'Loading'` | Accessible label; the root carries `role="status"`. |
| `onPhaseChange` | `(phase, variant, state) => void` | — | Fires when a transition **settles** (not when requested). Use it to sync labels. |
| `className` | `string` | — | Applied to the wrapper `<span>`. |
| `style` | `object` | — | Merged onto the wrapper `<span>`. |

The component renders one inline-block `<span>` sized to `size` × `size`, vertically
centered, `flex: 0 0 auto` — safe to drop straight into a flex row next to a label.

---

## 4. Sizing

**Preferred size is `24px`** for inline contexts (next to a label, in a chat row, inside
a button). Use larger sizes for standalone / full-screen loaders.

| Context | `size` |
|---|---|
| Inline with text, chat thinking row, button | **24** (preferred) |
| Section / card placeholder | 48–64 |
| Full-screen / route loader | 96–120 |

How it works: the artwork is authored on a fixed **120×120** tile and scaled with a CSS
transform — `scale = size / 120`. So geometry stays pixel-perfect at any size; you only
ever set `size`.

```jsx
<PaiLoader phase="thinking" size={24} />   // inline (preferred)
<PaiLoader phase="thinking" size={120} />  // full size
```

- **Minimum is 20px** — values below are clamped (sub-20 the dashes muddy together).
- **Don't set `scale` in `config`** — the `size` prop owns it and will overwrite yours.

---

## 5. State changes (the phase model)

The loader is a small state machine with two visual **states** — `logo` and `spinner` —
and a **phase map** that maps each phase name to one of them. You drive it with phase
*names*; the component figures out the transition.

### Default phase map

| `phase` | state | variant | reads as |
|---|---|---|---|
| `idle` | logo | — | resting / ready |
| `thinking` | spinner | `random` | working (shuffles look each change) |
| `searching` | spinner | `pulseOut` | reaching out |
| `reasoning` | spinner | `heartbeat` | deliberating |
| `generating` | spinner | `expandCollapse` | producing output |
| `done` | logo | — | finished |

### How transitions behave (handled for you)

- **logo → spinner** morphs at the next cascade loop boundary, so it always starts from
  the exact logo pose — never a visual jump. Worst-case delay before the morph begins is
  one `speed` period (~1.5s default).
- **spinner → spinner** (e.g. `thinking` → `reasoning`) freezes mid-orbit, regroups, and
  starts the new pattern — no restart flicker.
- **spinner → logo** unwinds the ring and morphs back.
- **Rapid changes queue and apply in order** — safe to drive from fast-changing app state
  (streaming tokens, quick status flips). You won't desync the animation.
- `onPhaseChange(phase, variant, state)` fires when each transition **lands**, so labels
  update in step with the visual, not ahead of it.

### Typical lifecycle (LLM request)

```jsx
const [phase, setPhase] = useState('idle');

async function run() {
  setPhase('thinking');
  const stream = await callModel();
  setPhase('generating');
  for await (const chunk of stream) { /* render tokens */ }
  setPhase('done');                       // morphs back to the logo
  setTimeout(() => setPhase('idle'), 1200);
}
```

### Custom phases

Pass `phases` to rename, re-map, or add states. Merge over the defaults — you only need
the keys you change. Available variants: `classic`, `pulseOut`, `pulseIn`, `heartbeat`,
`expandCollapse`, `breathe`, `focus`, `squeeze`, `starburst`, or `'random'`.

```jsx
const phases = useMemo(() => ({
  uploading:  { state: 'spinner', variant: 'pulseOut' },
  processing: { state: 'spinner', variant: 'starburst' },
  ready:      { state: 'logo' },
}), []);

<PaiLoader phase={phase} phases={phases} size={24} />
```

---

## 6. Config (visual tuning)

Optional `config` object — every key has a sensible brand default, so pass only overrides.

| Key | Default | What it does |
|---|---|---|
| `color` | `'#2f2be5'` | Brand blue. The only token you'll usually touch. |
| `speed` | `1.5` | Seconds per animation cycle. |
| `radius` | `2` | Dash corner radius (px). |
| `hold` | `0` | Pause (% of each step) — `0` = continuous, no stutter. |
| `easing` | `'linear'` | Any CSS timing function. |
| `background` | `'transparent'` | Backdrop behind the mark. |
| `slant` | `25` | Parallelogram skew (% of height) — brand geometry, rarely change. |
| `spin` | `40` | Degrees the ring advances per step. |
| `scale` | — | **Don't set** — owned by the `size` prop. |

Settled product defaults for the chat thinking indicator: `speed 1.5`, `easing 'linear'`,
`hold 0`, `radius 2`, `background 'transparent'`, `size 24`.

```jsx
const config = useMemo(() => ({ color: '#2f2be5', radius: 2 }), []);
<PaiLoader phase={phase} size={24} config={config} />
```

> **Memoize `config` and `phases`.** New object literals every render re-apply config and
> can restart the cascade. `useMemo` (or module-level constants) keeps them stable.

---

## 7. Imperative API (optional)

For cases where you'd rather call methods than flip props, grab a ref:

```jsx
const ref = useRef(null);
<PaiLoader ref={ref} size={24} />

ref.current.setPhase('thinking');
ref.current.setConfig({ speed: 2 });
ref.current.getPhase();    // → 'thinking'
ref.current.getVariant();  // → current spinner variant, or null in logo state
ref.current.getState();    // → 'logo' | 'spinner'
ref.current.getElement();  // → the inner loader DOM node
```

Prefer the controlled `phase` prop for normal use; reach for the ref only for
fire-and-forget cases outside React's render flow.

---

## 8. Accessibility

- Root element is `role="status"` with `aria-label` (default `"Loading"`). Set `ariaLabel`
  to something meaningful per context (`"Generating slides"`), and clear/relabel it when
  the work finishes so screen readers aren't stuck on "Loading".
- It's a continuous CSS animation. If you support `prefers-reduced-motion`, gate the
  spinner phases (e.g. keep `idle`/logo, or render a static fallback) at the call site.

---

## 9. SSR / Next.js note

The runtime touches `document`, `requestAnimationFrame`, and `getComputedStyle` in
`useEffect`, so it's **client-only**. In the Next.js App Router, mark the consumer
`'use client'`, or load it without SSR:

```jsx
import dynamic from 'next/dynamic';
const PaiLoader = dynamic(
  () => import('./PaiLoader.jsx').then(m => m.PaiLoader),
  { ssr: false }
);
```

Note: the React wrapper **always mounts as the logo first**. Even if the initial `phase`
is a spinner phase, it morphs from the logo at the first cascade boundary (there's no
`initialPhase` in the React wrapper — that option exists only in the standalone runtime).

---

## 10. `PaiLoaderLabel` (loader + label)

The convenience wrapper for "spinner next to status text." It renders `PaiLoader` plus a
phase-driven label in an inline-flex row, and forwards every loader prop (`phase`, `size`,
`config`, `phases`, `onPhaseChange`, `ariaLabel`, ref) straight through.

```jsx
import { PaiLoaderLabel } from './PaiLoaderLabel.jsx';

<PaiLoaderLabel phase={phase} size={24} />
// idle → just the mark · thinking → mark + "Thinking" · done → just the mark
```

### Extra props (on top of all `PaiLoader` props)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `labels` | `object` | `DEFAULT_PAI_LOADER_LABELS` | Phase → text map. Empty string = no label for that phase (the default for `idle`/`done`). |
| `label` | `string` | — | Explicit text; **overrides** the `labels` map for the current phase. |
| `gap` | `number` | `8` | px between mark and text. |
| `labelClassName` | `string` | — | Class on the label `<span>` — **style your own text here.** |
| `labelStyle` | `object` | — | Inline style merged onto the label (overrides the soft defaults: `#44445a`, weight 450). |
| `className` / `style` | — | — | Applied to the **wrapper row**, not the loader. |

Default labels: `thinking → "Thinking"`, `searching → "Searching"`,
`reasoning → "Reasoning"`, `generating → "Generating"`, `idle`/`done` → none.

### Bring your own label styling

```jsx
<PaiLoaderLabel
  phase={phase}
  size={24}
  labels={{ thinking: 'Working on it', generating: 'Writing…' }}
  labelClassName="text-sm text-muted-foreground"   // your design-system classes
/>
```

If you want full control over layout (label above, custom animation, tabular timer like
"Thought for 4s"), skip this wrapper and compose the bare `PaiLoader` yourself — see §11.

---

## 11. Cheatsheet

```jsx
// Option A — primitive: you own the label
import { useMemo } from 'react';
import { PaiLoader } from './PaiLoader.jsx';

export function Indicator({ phase }) {
  const config = useMemo(() => ({ color: '#2f2be5', radius: 2 }), []);
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <PaiLoader phase={phase} size={24} config={config} ariaLabel="Working" />
      <span className="your-label-classes">{phase === 'idle' ? '' : 'Thinking…'}</span>
    </span>
  );
}

// Option B — convenience: label handled for you
import { PaiLoaderLabel } from './PaiLoaderLabel.jsx';

export function Indicator({ phase }) {
  return <PaiLoaderLabel phase={phase} size={24} labelClassName="your-label-classes" />;
}
```

Live reference: open `react-example.html` (controlled phase buttons + simulated lifecycle).
Run it from this folder with `python3 -m http.server 5173` → `http://127.0.0.1:5173/react-example.html`.

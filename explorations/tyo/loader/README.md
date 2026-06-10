# Pai Loader

Brand loader animations built from the AMJ '26 Dashboard Figma prototypes
([source file](https://www.figma.com/design/T3VGugpHgpvi3jHsBm43Cn/AMJ--26---Dashboard)).
The HTML demos are self-contained — open them in a browser, no build step.

## Files

| File | What it is |
|---|---|
| `loader.html` | Logo cascade loader (Component 7, frames 35–36) with tuner panel. |
| `loader-spinner.html` | Circular 8-dash spinner (Component 5, frames 27–34) with tuner panel. |
| `loader-combined.html` | Logo ↔ spinner as two states with smooth morph transitions, spinner variants (pulse out/in, heartbeat, expand & collapse from Components 1–4), random shuffle, auto-cycle. |
| `loader-llm.html` | The loader as an embeddable component (`createPaiLoader`) driven by LLM lifecycle phases, with demo harness + full config panel (incl. corner radius). |
| `chat-prototype.html` | Chat UI prototype: 20px loader + phase label ("Thinking...", "Reasoning...") above each streamed response; fades to "Thought for Xs" when done. |
| `pai-loader.mjs` | Framework-free reusable loader runtime exported as an ES module. |
| `PaiLoader.jsx` | **Loader-only** React component — the animated mark, no text. Controlled `phase`, `size`, `config`, `phases` props. |
| `PaiLoaderLabel.jsx` | Convenience wrapper: `PaiLoader` + a phase-driven, restyleable text label in one row. |
| `PaiLoader.react.mjs` / `PaiLoaderLabel.react.mjs` | No-JSX twins used by the browser-runnable demo. |
| `react-example.html` | No-build React example with controlled phase buttons and simulated lifecycle. |
| `DEV-HANDOFF.md` | Engineering handoff: both components, props, sizing, phase/state model, config, a11y, SSR. |

## Using the component

`createPaiLoader` is exported from `pai-loader.mjs`. The HTML files keep their
own inline demo copies so they remain self-contained. Use the module directly:

```js
import { createPaiLoader } from './pai-loader.mjs';

const loader = createPaiLoader(mountEl, {
  config: { speed: 1.5, easing: 'linear', hold: 0, scale: 20 / 120 },
  // phases map is optional; defaults: idle, thinking, searching, reasoning, generating, done
});
loader.setPhase('thinking');                    // morphs logo -> spinner
loader.setPhase('reasoning');                   // smooth variant switch (random by default)
loader.setPhase('done');                        // morphs back to logo
loader.setConfig({ color: '#2f2be5', radius: 2 });
loader.on('phasechange', (phase, variant, state) => { /* update labels */ });
```

Config keys: `speed`, `hold` (pause % per step), `slant` (parallelogram %),
`radius` (corner px), `scale`, `spin` (deg/step), `easing`, `color`, `background`.

Spinner variants: `classic`, `pulseOut`, `pulseIn`, `heartbeat`, `expandCollapse`,
`breathe`, `focus`, `squeeze`, `starburst`, or `'random'` to shuffle on every phase change.

## React usage

Two components (see `DEV-HANDOFF.md` for the full reference):

- **`PaiLoader`** — the loader mark only, no text. Bring your own label styling.
- **`PaiLoaderLabel`** — `PaiLoader` + a phase-driven label in a row, for the common
  "spinner + status text" case; the label is restyleable via `labelClassName`/`labelStyle`.

Copy `pai-loader.mjs` + `PaiLoader.jsx` (and `PaiLoaderLabel.jsx` if you want the
labeled variant) into a React app, then control the loader with your app state. The
component always mounts as the logo first; if the initial `phase` prop is already a
spinner phase, it still morphs from the logo at the next cascade boundary.

```jsx
import { PaiLoader } from './PaiLoader.jsx';

export function ThinkingIndicator({ isThinking, isSearching }) {
  const phase = isSearching ? 'searching' : isThinking ? 'thinking' : 'idle';

  return (
    <PaiLoader
      phase={phase}
      size={20}
      config={{
        color: '#2f2be5',
        radius: 2,
      }}
      onPhaseChange={(phase, variant, state) => {
        console.log({ phase, variant, state });
      }}
    />
  );
}
```

React props:

- `phase`: controlled phase string. Defaults to `idle`.
- `size`: visual/layout size in px. Minimum is `20`.
- `config`: optional loader config override.
- `phases`: optional phase map override, for example `{ thinking: { state: 'spinner', variant: 'starburst' } }`.
- `onPhaseChange`: callback with `(phase, variant, state)`.

To run the browser example from this folder:

```sh
python3 -m http.server 5173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:5173/react-example.html`.

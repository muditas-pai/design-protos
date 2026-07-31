# baby-PAI

The canonical PAI screens, stitched together in React, so explorations can build
on them without copying them.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/  (committed, so Pages serves it)
npm run lint     # the seam rule
npm run annotations   # review packet from every annotation
```

---

## Annotations

`Shift-C` on any route toggles the annotation layer: located judgements pinned
to elements, coloured by verdict, with the elements nobody has judged outlined
as coverage. `npm run annotations` clusters them by rule slug across surfaces
and prints a review packet.

Capture records evidence only — it never proposes a home. That's the analysis
pass, deliberately separated. Full design in `ANNOTATIONS.md`.

---

## Routes

```
#/                                index of everything
#/dashboard                       canonical dashboard
#/editor                          editor, opens the Figma deck (slide 4 is real DOM)
#/editor/<deck-slug>              editor, opens a deck from the library
#/flow/create-deck                canonical flow
#/x/<designer>/<problem>/<variant>   an exploration
```

A dashboard tile opens the deck it shows, by handing its slug to the editor.
Home in the editor goes back. That round trip is the point of stitching the
screens together rather than shipping them as separate files.

---

## The design system

`src/ds/` wraps `design-system/pai.css` in React. No styles are declared there —
`main.jsx` imports `pai.css` itself by relative path, and `styles/tokens.css`
aliases its variables rather than redeclaring them. Nothing is copied.

```jsx
import { Button, Badge } from '../../ds'

<Button variant="primary-brand" size="small" leading={<i className="ph ph-rocket-launch" />}>
  Upgrade
</Button>
<Badge variant="pro">Pro</Badge>
```

Available: `Button` (3 sizes × 12 variants) · `Badge` · `Input` · `Textarea` ·
`Checkbox` · `Radio` · `Field` · `Toggle` · `Tooltip` · `Skeleton` · `Text`.

Design-system components are **not seams** — they're PR-gated and owned by the
design-system owner. See ARCHITECTURE.md for the four places where the JAS '26
Figma and `pai.css` disagree.

---

## The one idea

Canonical screens resolve their parts **by name at render time**, not by import:

```jsx
const Sidebar = useComponent('Sidebar')   // seam
import Sidebar from '../components/Sidebar'   // ← blocked by eslint
```

That single indirection is what lets an exploration replace one part of a live
screen without touching canonical, so several designers can work on different
features at once and never collide. They only ever add files under their own
folder.

The registry is globbed from the file tree, never hand-listed, so adding a
canonical component doesn't touch a shared file either.

---

## Four altitudes

An exploration lives at `src/explorations/<designer>/<problem>/<Variant>.jsx`
and is auto-routed to `#/x/<designer>/<problem>/<variant>`. Which altitude it
uses depends only on what it exports.

| Altitude | Export | Use when | Example |
|---|---|---|---|
| **token** | `export const tokens = {...}` | restyling everything, replacing nothing | `mudita/softer-surfaces/V1` |
| **component** | `export default { Sidebar: Mine }` | swapping one part | `mudita/sidebar-collapse/V1` |
| **screen** | `export default { Dashboard: Mine }` | changing arrangement, which no swap can express | `mudita/files-first/V1` |
| **flow** | `export const flow = {id, steps, define}` | reordering or inserting steps | `mudita/brand-check-step/V1` |

Optional on any of them: `title` (shown on the index) and `screen` (which
canonical screen to render when it isn't a flow, defaults to `Dashboard`).
They compose: `brand-check-step/V1` inserts a step *and* supplies its screen.

The screen altitude is the escape hatch, and note what it does **not** copy:
`files-first/V1` rewrites the layout but still resolves Sidebar, Topbar,
DeckCard and the rest through `useComponent`. You copy arrangement, not parts.
That's the thing a standalone HTML file can't do, where copying a screen means
copying everything on it.

---

## Promotion

A variation becomes canonical by moving its component into
`src/canonical/components/`, via PR. Every screen and every other designer's
exploration picks it up on next load. That propagation is the whole reason this
exists: in the HTML protos, promoting a component leaves every prior copy stale
forever.

---

## Known limits

- **The token altitude reaches only what is already a CSS var.** Radius and
  spacing are literals in the screen CSS, so they can't be explored that way
  yet. Same gap `design-system/pai.css` has (colour and shadow tokens, no
  radius or spacing tokens).
- **Seams exist only where placed.** Today: `Sidebar`, `Topbar`,
  `PromptComposer`, `ActionPills`, `DocumentsHeader`, `DeckCard`. Adding one is
  a one-line change to a canonical screen, PR-gated like any canonical change.
- **Competing overrides don't compose.** Two people overriding `Sidebar` have no
  combined route. Promotion is a human choice between candidates, not a merge.
- **One build.** A syntax error anywhere fails it. A GitHub Action that builds
  on push would keep the last good deploy live instead; not wired up yet, so
  `dist/` is committed by hand for now.

---

## Provenance

The Dashboard is ported from Figma **"JAS '26 — Handoff"**, node `101:640`
(*Dashboard - entry*). It supersedes `key-screens/dashboard.html`, which shows
the older design (hero heading, plain prompt field, shadowed tab chips, CSS deck
covers). The two will drift; one of them eventually has to be canonical.

Icons are Phosphor via CDN, matching the rest of the repo. The four raster
assets in `src/assets/` are exported from that Figma node.

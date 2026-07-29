# baby-PAI — architecture for running explorations

baby-PAI is the canonical PAI screens, stitched together in React, built so that
several designers can explore different features on top of the same product at
the same time without breaking each other's work.

This doc is about that last part. The screens are the easy bit. The architecture
exists to answer one question: **how do eight variations of a sidebar coexist
with three other designers' feature work, in one app, without anyone waiting on
anyone?**

---

## The problem it solves

The instinct is to copy a screen per variation. That works, and it rots:

```
copy the PAGE                     copy the COMPONENT
Dashboard-v1 … Dashboard-v8       Sidebar-v1 … Sidebar-v8
each with its sidebar inline      everything else untouched

you also copied the topbar,       eight variations, each sitting
composer, tabs and cards —        in a LIVE dashboard that stays
which you are NOT exploring       current as others change it

canonical changes → 8 stale       canonical changes → all 8 inherit
copies, silently                  it, immediately
```

The left column is the HTML-proto model, and it's why 36 protos in this repo
each hand-rolled their own sidebar and 33 hand-rolled a credit counter. Copying
a screen means copying everything on it, and every copy is a fork you now
maintain by hand or quietly abandon.

The right column is what this app is built to give you.

---

## The one idea: seams

A canonical screen resolves its parts **by name at render time**, not by import:

```jsx
const Sidebar = useComponent('Sidebar')        // a seam
import Sidebar from '../components/Sidebar'    // ← blocked by eslint
```

`useComponent` is a twenty-line hook over React context. It looks the name up in
an override map supplied by the current route, and falls through to canonical
when the route doesn't override it.

That single indirection is the whole architecture. Everything below is a
consequence of it.

```
       route /x/mudita/sidebar-collapse/1
                    │
                    ▼
       <Overrides map={{ Sidebar: IconRail }}>
                    │
                    ▼
       <Dashboard />                    ← canonical, unmodified
            ├── useComponent('Sidebar')          → IconRail   (overridden)
            ├── useComponent('Topbar')           → canonical
            ├── useComponent('PromptComposer')   → canonical
            ├── useComponent('ActionPills')      → canonical
            ├── useComponent('DocumentsHeader')  → canonical
            └── useComponent('DeckCard')         → canonical
```

---

## Four altitudes

Not every exploration is shaped like "replace one box". You cannot express *move
the sidebar to the right* as a sidebar override, because position is decided by
the parent. And you cannot express *add a fourth step* as a screen override,
because the sequence isn't a screen. So there are four altitudes, and an
exploration picks one by what it exports.

| Altitude | Export | Use when | Reaches |
|---|---|---|---|
| **token** | `export const tokens = {…}` | restyling everything, replacing nothing | CSS vars, scoped to the route |
| **component** | `export default { Sidebar: Mine }` | swapping one part | anything with a seam |
| **screen** | `export default { Dashboard: Mine }` | changing arrangement | the whole layout |
| **flow** | `export const flow = {id, steps, define}` | reordering, inserting or dropping steps | the sequence, and state across it |

The test for whether something deserves its own altitude is independence: can
you override it without copying the others, and vice versa? All four pass.

The **screen** altitude is the escape hatch for arrangement, and the important
thing is what it still does not copy. `files-first/V1` rewrites the Dashboard's
layout entirely, and every part inside it still resolves through
`useComponent` — you copied the arrangement, not the parts. When someone
improves `DeckCard` tomorrow, that exploration gets it.

That is the difference from a standalone HTML file, where copying a screen means
copying everything on it forever.

### The flow altitude

A flow is **data**, not code — an ordered list of steps kept separate from the
screens those steps render:

```js
// canonical/flows/create-deck.js
export default [
  { id: 'prompt',     screen: 'Dashboard',  label: 'Prompt' },
  { id: 'outline',    screen: 'Outline',    label: 'Outline' },
  { id: 'generating', screen: 'Generating', label: 'Generating' },
]
```

An exploration reorders, inserts or drops steps in one line, and can introduce a
step whose screen canonical has never heard of:

```js
export const flow = {
  id: 'create-deck',
  steps: ['prompt', 'outline', 'brand-check', 'generating'],   // ← 4 steps now
  define: { 'brand-check': { screen: 'BrandCheck', label: 'Brand' } },
}
export default { BrandCheck }        // the new step's screen, from this file
```

Prompt, Outline and Generating are **untouched canonical screens**. Redesign
Outline tomorrow and this exploration inherits it.

Steps share state through `useFlow()`, which returns `null` outside a flow — so
a screen can be flow-aware without becoming flow-dependent. The Dashboard works
standalone *and* as step 1, and what you type into its composer is there in the
Outline. That carry-across is the thing a set of standalone HTML files
structurally cannot do, and it's why flows end up in React at all.

`FlowFrame` (the step bar) is itself a seam, so *how* a flow is stepped through
is explorable too, not just what the steps are.

---

## Adding an exploration

Create one file. That's the whole procedure.

```
src/explorations/<designer>/<problem>/<Variant>.jsx
        │            │          │
        │            │          └── V1, V2, … any name; lowercased in the URL
        │            └── one folder per problem statement, 8-10 variants together
        └── your own folder — nobody else writes here
```

It is routed automatically at `#/x/<designer>/<problem>/<variant>` and appears
on the index at `#/`. **No router file to edit, no registry to append to**,
which is exactly why two designers adding variations the same afternoon never
conflict. Routes, components, screens and flows are all globbed from the file
tree.

A component-altitude variation, in full:

```jsx
export const title = 'Icon rail, labels on hover'

function IconRailSidebar() { /* … */ }

export default { Sidebar: IconRailSidebar }
```

A token-altitude one:

```jsx
export const title = 'Warm paper surfaces'
export const tokens = { '--sidebar-bg': '#efe9dd', '--surface': '#fffdf7' }
export default {}
```

Optional on any of them: `title` (shown on the index) and `screen` (which
canonical screen to render, when it isn't a flow; defaults to `Dashboard`).

The altitudes compose. `brand-check-step/V1` uses the flow altitude to insert a
step and the component altitude to supply that step's screen, in one file.

---

## What isolation you actually get

This is the part worth being precise about, because "will we break each other"
was the question that shaped the design.

| Failure | Isolated? | Why |
|---|---|---|
| Your variation looks wrong | **yes** | it's your file, nobody else renders it |
| You change canonical for your feature | **prevented** | canonical is PR-gated; the eslint rule stops screens hardcoding parts |
| Two designers touch the same file | **prevented** | there is no shared file — registry and routes are globbed |
| Your variation throws at runtime | **yes**, per route | other routes render fine |
| Your variation has a **syntax error** | **no** | one build, so it fails for everyone |

That last row is real and doesn't fully go away. The fix is a GitHub Action that
builds on push: a failed build skips the deploy and the **last good build keeps
serving**, so the blast radius becomes "your change isn't live yet" rather than
"everyone's links died". Not wired up yet — `dist/` is committed by hand for
now, so run `npm run build` before pushing.

Locally, `npm run dev` gives HMR with state preserved, which is faster feedback
than saving an HTML file and refreshing, because the modal you're iterating on
stays open.

---

## Promotion

A variation becomes canonical by moving its component into
`src/canonical/components/`, via PR. Every screen and every other designer's
exploration picks it up on next load.

That propagation is the reason this exists. In the HTML protos, promoting a
component leaves every prior copy stale forever — promotion has never actually
propagated in this repo, and the 36 sidebars are the evidence.

Two consequences to expect:

- **Competing overrides don't compose.** If two people override `Sidebar` there
  is no route showing both. Promotion is a human choice between candidates, not
  a merge. That's correct, just plan for it.
- **Canonical changes affect everyone by design.** That's the point, and it's
  why canonical is the only PR-gated part.

---

## The design system layer

`src/ds/` is the design system as React. Every component there is a **class-name
wrapper** over `design-system/pai.css` — no styles are declared in that folder,
and `main.jsx` imports `../../design-system/pai.css` by relative path. Nothing is
copied, so a change Tyo makes lands here for free.

```
design-system/pai.css        the source of truth, imported whole
        │
        ├── src/ds/*.jsx     Button · Badge · Input · Textarea · Checkbox
        │                    Radio · Field · Toggle · Tooltip · Skeleton · Text
        │
        └── src/styles/tokens.css
                             screen tokens are now var() ALIASES onto pai.css
                             tokens, not literals lifted from Figma
```

**These are not seams.** Design-system primitives are PR-gated and owned
elsewhere; `canonical/components/` is baby-PAI's own composition layer and is
where overriding happens. Screens may import from `src/ds/` directly. If this
port proves useful it graduates to `design-system/react/` via a PR to the
design-system owner — it should not live in this app forever.

### Where the Figma file and pai.css disagree

Aliasing the tokens surfaced four genuine conflicts. **pai.css wins in all of
them**, on the grounds that it is the design system; the deltas are recorded
here as findings for its owner rather than papered over.

| Token | JAS '26 Figma | pai.css | Effect |
|---|---|---|---|
| brand blue | `#005EFF` | `#0055ED` | badges and the Upgrade button shift very slightly |
| primary action | `#0b0f14` near-black | `#0A1925` navy | **Create Presentation reads navy now, not black.** Brand voice says navy is the action colour, so the Figma value looks like the drift |
| selection fill | `rgba(22,30,39,.08)` | `rgba(11,15,20,.08)` | imperceptible |
| button size | 28px tall, **14px** text | small is 28/12, medium is 36/14 | **no size in the system matches.** Used `small`, so the Upgrade label is 12px where Figma says 14px |

That last row is the one worth a decision: either the Figma is using an
off-system button, or the system is missing a size.

Four tokens have no design-system equivalent at all and stay local:
`--sidebar-bg`, `--main-bg`, `--sh-card-hover`, `--sh-pill`. And `pai.css` still
defines no radius or spacing tokens, which is what caps the token altitude.

---

## The seam rule

Seams only exist where someone put one, so the rule is enforced rather than
remembered:

```js
// canonical screens may not import canonical components directly
'no-restricted-imports': ['error', { patterns: ['**/canonical/components/*'] }]
```

`npm run lint` fails if a canonical screen hardcodes a part. Without it, someone
writes `<Card />` one afternoon and cards become unexplorable until a PR reopens
the seam.

Current seams — Dashboard: `Sidebar` · `Topbar` · `PromptComposer` ·
`ActionPills` · `DocumentsHeader` · `DeckCard`. Editor: `EditorTopbar` ·
`Filmstrip` · `SlideCanvas` · `EditorToolbar` · `InlineMenu`. Adding one is a
one-line change to a canonical screen.

`InlineMenu` is worth calling out: the editor's chrome primitive (a white
rounded surface holding groups split by hairline dividers) appears **four
times** in that one screen — topbar left, topbar right, filmstrip header, bottom
toolbar. In HTML that's four hand-typed copies. Here it's one seam, so
exploring the editor's chrome is a single override. It is a compound component
(`.Group`, `.Item`), so a replacement has to provide those too.

---

## Known limits

- **The token altitude reaches only what is already a CSS var.** Colour and
  shadow, yes. Radius and spacing are literals in the screen CSS, so *"what if
  our radii were softer"* is not expressible this way. Same gap
  `design-system/pai.css` has today. Closing it means adding radius and spacing
  tokens, which is a design-system decision, not an app one.
- **Seams are the explorable surface.** Anything without one needs a PR first.
  The screen altitude means you're never blocked while waiting for one.
- **One build, one failure mode.** See the table above.
- **Name lookup is a string.** A typo fails at runtime, not build time, so the
  hook throws with the list of valid names rather than rendering nothing. Same
  for an undefined flow step.
- **Tailwind utilities share the class namespace.** A semantic class called
  `.outline` silently picked up Tailwind's `outline-style: solid` and drew a
  box around the slide list. Prefix screen-specific classes; don't name one
  after a utility.

---

## Where this sits next to the HTML protos

It does not replace them, and it shouldn't.

```
self-contained UI              a modal, a card, a type scale, a prompt input
(no product around it)     →   stays a standalone HTML file. Instant link,
                               zero setup, total isolation, crazy8s works

needs the product              a flow, a state change, navigation, what happens
around it                  →   after the primary action → a route in baby-PAI
```

Divergence wants freedom; the app wants constraint. Forcing both into one
substrate makes one of them worse. Use baby-PAI when the exploration only makes
sense with chrome around it.

---

## Provenance

Both screens are ported from Figma **"JAS '26 — Handoff"**: the Dashboard from
node `101:640` (*Dashboard - entry*), the Editor from `334:3043`
(*Editor - Theme - Font*).

They supersede the key screens. `key-screens/dashboard.html` carries the older
design (hero heading, plain prompt field, shadowed tab chips, CSS deck covers)
and `key-screens/editor.html` is 2,873 lines of a different editor. Those pairs
will drift, and one of each eventually has to be canonical — a call for the
screens' owners, not this app.

Icons are Phosphor via CDN, matching the rest of the repo. The four rasters in
`src/assets/` are exported from that Figma node.

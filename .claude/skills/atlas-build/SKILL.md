---
name: atlas-build
description: Draw the thing. Turn a ratified checklist.json into one self-contained HTML artifact built on the shared design system — every state it names reachable from the URL, every moving part freezable so two renders of a state are pixel-identical, every user-visible string taken from the content file rather than invented. Few-shots on approved examples and on the rejected ones, so a known mistake is prevented rather than rediscovered. Invoke when a ratified checklist exists and something has to be drawn, when a run directory has a checklist but no artifact, or when an artifact needs rebuilding after the content file or the example index changed. Halts and prints the missing keys rather than making a number or a name up.
---

# atlas-build

## What this produces

One file: `artifact.html`, in the run directory beside the checklist that describes it. Plus a
short run record saying what it was built from.

This is the first step that designs. Everything before it moved text around. The checklist is the
scoring rubric, not a plan — it says what must be true, never how. How is yours.

---

## Before you draw

Read, in this order, and do not start until all four are in hand.

| Input | Where | If it is not there |
|---|---|---|
| the checklist | the path given, else the highest `runs/<run-id>/checklist.json` under the problem folder | stop. There is nothing to build against |
| the design system | `design-system/` — `template.html`, `pai.css`, `pai.tailwind.js`, `components.html` | stop |
| the content file | `atlas/content.md` | treat as empty; every string becomes a gap and the run halts |
| the examples | `atlas/examples.json` | treat as `[]`; the run is unanchored, and say so |

**`ratified_at: null` is a stop.** Say the checklist has not been ratified and send it back to
`atlas-checklist`. A null there is not an oversight to work around — it means nobody has agreed
what this is being judged on, and drawing against it wastes the drawing.

Read `pai-visual-language` if it is present. The design system answers which token; that answers
which token, used how.

Requirements with `status: "not-checkable"` are not built to and not designed around. They are
noise here; skip them.

---

## Step 1 — anchors

Filter `examples.json` to `still_valid: true`.

**Do's — up to three, few-shot into generation.** This is the only moment in the whole pipeline
where prevention is cheaper than correction; after this it is all rework.

Selecting when more than three survive:

1. Rank by how close each row's `what` is to the thing being built, in plain words. *"the empty
   state of a list"* is close to *"the empty state of a search"*, far from *"a settings page"*.
2. Break ties by `approved`, most recent first.
3. **Prefer `origin: "human"`.** A `harness` row is taken only to fill a slot no human row can
   fill, and never more than one of the three. A corpus feeding on its own output stops being a
   standard and becomes an echo.

Read the chosen files whole before generating. A path in a list teaches nothing.

**Don'ts — up to five, into generation as negative examples.** Not held back for a later judge. A
rejection that only ever reaches the judge is one we pay to rediscover on every single run, and
the cost of carrying it forward is one line. Quote each one's `element`, `problem` and `instead`
verbatim into the work, and check the finished artifact against them before writing it out.

**Show the anchors and ask.** `AskUserQuestion`, one call: the chosen Do paths and one line each
on why — **Use these** *(Recommended)* · **Swap one** · **Build unanchored**. On approval write
the paths into the checklist's `anchors` array, which has been sitting empty and reserved for
exactly this. Nothing is anchored sight-unseen.

**An empty index means an unanchored run.** Say it plainly in the output — *"No canonical
examples; built from the design system alone. It will drift more than an anchored run."* Do not
skip the line because it sounds like an excuse. It is the person's cue to add the first row.

---

## Step 2 — content

Every user-visible string and number resolves against `atlas/content.md` — a flat map of
`dotted.key = value`, substituted at generation time so the built artifact carries plain text and
depends on nothing at runtime.

Anything that does not resolve is written into the artifact as the literal token
`{{content:<dotted.key>}}`. Not a guess, not lorem, not a plausible-looking number. **A made-up
number is worse than a visible hole**, because a hole gets filled and a plausible number gets
believed, quoted, and shipped.

Structural text you would write regardless of the domain — a control called Close, a heading that
restates the checklist's own words — comes from you. Anything a person or a system owns — a name,
a figure, a threshold, a label somebody signed off — comes from the file.

---

## Step 3 — the artifact contract

Six rules. A renderer written later gets no further information than this, so everything it needs
is here.

### 3.1 It starts from the template

Copy `design-system/template.html` and build inside it. `pai.css` and `pai.tailwind.js` are
**linked by relative path — never inlined, never copied into the run directory.** A copied
stylesheet is a fork that stops tracking the system the day it is made.

From `explorations/<designer>/<problem>/runs/<run-id>/` the repo root is five levels up:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="../../../../../design-system/pai.tailwind.js"></script>
<link rel="stylesheet" href="../../../../../design-system/pai.css" />
```

If the artifact is ever written somewhere else, count the path segments between it and the repo
root and use one `../` for each. Load order is fixed: Tailwind CDN, then the token config, then
`pai.css`.

### 3.2 The template's own inline style does not come along

`template.html` carries `style="margin:0; background:#F5F5F7;"` on its `<body>` — an inline style
and a raw literal, both of which this contract forbids. It is scaffolding, and inheriting it would
be the artifact's first violation.

**Strip it.** Replace with utilities: `<body class="pai m-0 bg-bg-tertiary">`. Delete the
template's demo `<main>` and its inline sizing too. The token is `#F5F5F5`, two units off the
template's literal, and that is fine — the token is the right answer and the literal was never one.

### 3.3 Every state in the checklist is reachable

Collect the distinct non-null `state` values across `active` requirements. The checklist's `reach`
field says which mechanism each one gets.

**`reach: null` — static.** The state is a condition of the world at open time. It is produced by
loading `?state=<name>`, which sets `document.body.dataset.state` and reveals the matching
`[data-state]` branch. Put this script as the **first child of `<body>`** — `document.body` exists
there, and nothing has painted yet, so there is no flash:

```html
<body class="pai m-0 bg-bg-tertiary">
<script>
  // Every state named in checklist.json, ordinary one first.
  const ATLAS_STATES = ["default", "empty", "failed"];
  const ATLAS_T0 = 1780000000000;            // the artifact's only clock — see 3.4
  (function () {
    const q = new URLSearchParams(location.search);
    const s = q.get("state");
    document.body.dataset.state = ATLAS_STATES.includes(s) ? s : ATLAS_STATES[0];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.dataset.freeze = (q.get("freeze") === "0" && !reduced) ? "0" : "1";
  })();
</script>
```

An unknown or absent `?state=` falls back to `ATLAS_STATES[0]` silently — no console noise, no
blank page. Also emit `<meta name="atlas-states" content="default empty failed">` in the head so
a renderer can discover the states without parsing the checklist.

Branch visibility is plain CSS, one generated line per state:

```css
body [data-state] { display: none; }
body[data-state="default"] [data-state~="default"],
body[data-state="empty"]   [data-state~="empty"],
body[data-state="failed"]  [data-state~="failed"] { display: contents; }
```

- The hide rule is scoped `body [data-state]` so it cannot match `<body>` itself, which carries
  the same attribute.
- A branch lists every state it belongs in, space-separated: `data-state="default empty"`. `~=`
  matches one word of the list. Two states sharing a branch is the normal case and does not want
  duplicated markup.
- **A `[data-state]` element is a bare wrapper — never carry layout on it.** The show rule sets
  `display: contents` at a specificity that beats a Tailwind `flex` or `grid`, so the wrapper
  drops out of layout and its children slot into the parent's. Put layout on the child.

**`reach: "<click path>"` — driven.** The state exists only after someone acts on this artifact.
Do not build a `?state=` branch for it. Build the control the path names, with the label or
selector the checklist wrote, and make walking that path actually produce the state. The reach
string is a claim the checklist made; your job is to make it true. If it cannot be — the path
names a control the design does not want — that is a finding for the run record, not a rename.

### 3.4 Determinism

Something downstream screenshots this at fixed widths and diffs the images. Two renders of a state
must be pixel-identical.

**Motion is not the problem and is not banned** — a design without it is a different, worse design.
It is made freezable.

**`?freeze=1` is the default. `?freeze=0` restores the real motion.** Default-on, because a
renderer that forgets a flag must still get a stable image; a still render is never wrong, only
still. Anyone reviewing the motion by hand adds `&freeze=0`. `prefers-reduced-motion` forces
freeze on regardless.

```css
body[data-freeze="1"], body[data-freeze="1"] *,
body[data-freeze="1"] *::before, body[data-freeze="1"] *::after {
  animation-delay: 0s !important;
  animation-duration: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  scroll-behavior: auto !important;
  caret-color: transparent !important;
}
```

Zero duration lands every animation on a defined frame instead of pausing it wherever the clock
happened to be. A caret blinking in a focused field is a two-pixel diff on every other run.

The other three sources, each closed:

- **The clock.** The artifact may not call `Date.now()` or `new Date()` with no argument. There is
  one constant, `ATLAS_T0`, and every time-derived string is computed from it. `?t=<ms>` overrides
  it for a run that needs a different moment. Any ticking loop starts only when
  `document.body.dataset.freeze !== "1"`.
- **Randomness.** No `Math.random()`. Where variation is the design, a seeded generator with a
  constant seed.
- **Media.** `<video>` gets a `poster` and is never `autoplay`; it is started from script, and only
  when not frozen. Frozen, the poster is what renders — which is also the honest answer when the
  video has not loaded.

**Readiness.** Web fonts land after first paint and shift every glyph when they do. Expose a
promise the renderer waits on before capturing:

```html
<script>
  window.__atlasReady = document.fonts.ready
    .then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
</script>
```

### 3.5 Token discipline

No `style=` attributes. No colour, radius, shadow or spacing literals — not in a `<style>` block
either. Everything comes from the component classes in `pai.css` and the tokens in
`pai.tailwind.js`: `.button-style` + a size + a colour, `.pai-badge`, `.pai-input`, `.pai-toggle`,
`.pai-checkbox`, `.pai-tooltip`, `.pai-skeleton`, the `text-heading-*` / `text-body-*` scale, the
`shadow-elevation-*` set, and Tailwind utilities over brand tokens — `bg-bg-elevated`,
`text-text-secondary`, `border-border-secondary`, `bg-gradient-gold`.

The artifact's own `<style>` block is allowed and holds exactly three things: the state rules, the
freeze rules, and layout that Tailwind utilities cannot express. Anything in it that needs a colour
uses `var(--…)` from `pai.css`. A literal in there is the same violation, moved.

A component the system does not have yet — a dialog, a tab bar — is built from the tokens and
noted in the run record as a candidate for the system. It is not built from invented values.

### 3.6 Widths

Build against every width in the checklist's `viewports`, smallest first. No fixed-width shell:
the artifact is one document that reflows, not one per width.

---

## Step 4 — the halt

After generating and before declaring anything done, search the artifact for `{{content:`.

**If any survive, the run halts.** Print, in chat:

- one line per distinct missing key, in the order they appear, each with where it sits in the
  artifact;
- the path of `atlas/content.md` and the one-line instruction — add the lines, re-run.

**A halt is the intended path, not a failure.** It is the system declining to invent a number that
would otherwise get believed. Say so in those words, so nobody "fixes" it by filling the gaps in.

The artifact is still written to disk with the tokens visible in place — the shape is worth seeing
and the holes are worth being able to point at. The run record records `halted: true`. Nothing
downstream runs against a halted artifact.

---

## Where it writes

```
explorations/<designer>/<problem>/runs/<run-id>/
├── checklist.json     the input
├── artifact.html      the artifact
└── build.json         the run record
```

`artifact.html` — one per run, so the run id is the version and no name has to carry it.

## The run record

`build.json`, beside the artifact. Small on purpose — enough to answer *what was this built from*
six weeks later, and nothing that duplicates the checklist.

```json
{ "built_at": "31 Jul 2026 16:20",
  "artifact": "artifact.html",
  "states": ["default", "empty", "failed"],
  "anchors": [],
  "donts_applied": ["explorations/rae/team-settings/settings-page-v2.html#danger-zone"],
  "content_missing": ["onboarding.name.hint"],
  "halted": true,
  "notes": ["unanchored run — examples.json is empty"] }
```

`anchors: []` with `unanchored` in `notes` is the honest record of a run with nothing to learn
from. `notes` also carries anything you had to decide on your own — a component the system lacks,
a `reach` path that could not be made true.

---

## Done when

`artifact.html` exists at its path, links the design system by relative path, opens on every
static state via `?state=` and reaches every driven one by its click path, holds still under
`?freeze=1`, carries no inline style and no literal, contains no `{{content:` token, and
`build.json` says what it was built from. Then hand it over — do not judge your own artifact here.

# atlas

A design agent that takes a brief and gives back a finished screen: one self-contained HTML
file, drawn in the product's own visual language, linted against the design system and
photographed in every state it claims to have.

It is a **synced copy** of the `agentic-atlas` repo. Read [`SYNCED-FROM.md`](SYNCED-FROM.md)
for what came across, what did not, and the one rule: **you do not fix things in here.** A
fix goes upstream in atlas and comes back on the next `./sync.sh`.

**[`AGENTS.md`](AGENTS.md) is the process.** This file is how to run it.

```
brief ──► study ─┬─► draw ──► lint ──► render ──► look ──► fix ─┐
                 │     ▲  ▲                                     │
     shape open? │     │  └────────── anything wrong ◄──────────┘
                 ▼     │                    │
              explore ─┘                    ▼
                                       blind judge ──► hand over
```

---

## Your first five minutes

Everything below runs from **this folder**:

```sh
cd atlas
```

**1 · Write the brief.** `designs/<slug>/brief.md` — what this is, who sees it, what must be
true of the finished screen. One page at most. Never invent a price, a plan name or a limit:
write `{{content:<name>}}` and say so.

**2 · Read before you draw.** `design-system/DESIGN.md` (what each token and component
*means*), `design-system/VOICE.md` (what the words say), `docs/design-principles.md` (the
eight calls you make while drawing), and two screens in `canonical/` with their `about.md`.

**3 · Draw.** Start from the template, never from a blank file:

```sh
mkdir -p designs/<slug>
cp templates/screen.html designs/<slug>/<slug>.html
```

The template already carries the state switching, the frame marker, the freeze rules and the
ready signal. It links `../../design-system/pai.css`, which is why the file has to live at
`designs/<slug>/<slug>.html` and not one level up or down.

**4 · Lint.** Fix every `error`. Leave `proposal` and `extension` alone — they are facts about
the design system, not mistakes of yours.

```sh
uv run --python 3.12 python tools/lint/pai-lint.py designs/<slug>/<slug>.html \
    --json designs/<slug>/lint.json
```

**5 · Render, then look at the pictures.** One PNG per state per width, into
`designs/<slug>/states/`.

```sh
uv run --python 3.12 --with playwright python tools/render/render.py designs/<slug> \
    --artifact designs/<slug>/<slug>.html --width 1440 --width 390
```

First run on a new machine, if Playwright complains it has no browser:

```sh
uv run --python 3.12 --with playwright python -m playwright install chromium
```

**6 · Serve it and open it.** A lint at zero is not a picture, and neither is a PNG.

```sh
python3 -m http.server 8912 --directory ..
```

Then open `http://localhost:8912/atlas/designs/<slug>/<slug>.html`, and
`?state=<name>` for each state. Serve from the repo root rather than from `atlas/` so the URL
matches the published one:
`https://muditas-pai.github.io/design-protos/atlas/designs/<slug>/<slug>.html`.

**7 · Get it judged, then hand over.** `AGENTS.md` step 7: a fresh agent, given only the PNGs
and `DESIGN.md` + `VOICE.md` — not the brief, not the file. Then triage what comes back
against the brief and reject the rest in writing.

---

## The worked example

`designs/loop-check/` is a small screen built end to end through exactly the steps above, kept
as the thing to read first and the thing to re-run when something here looks broken. It lints
at zero errors and renders four pictures. Its `brief.md` says what it skipped and why.

```sh
uv run --python 3.12 python tools/lint/pai-lint.py designs/loop-check/loop-check.html \
    --json designs/loop-check/lint.json
uv run --python 3.12 --with playwright python tools/render/render.py designs/loop-check \
    --artifact designs/loop-check/loop-check.html --width 1440 --width 390
```

Both toolchains also carry their own tests, which is the fastest way to tell whether the
problem is your screen or the copy:

```sh
uv run --python 3.12 python tools/lint/check_fixtures.py
uv run --python 3.12 --with playwright python tools/render/test_render.py
```

---

## Known snags

**`templates/screen.html` costs you five lint errors that are not yours.** Its
`.atlas-unknown-state` block is written in literals — `top: 8px`, `background: #b91c1c` — and
the linter rightly names the tokens that should have been used. Atlas's own screens
(`hire-an-expert`, `single-export-vs-pro`) write that block in tokens and lint at zero, so the
template is simply stale. Until it is fixed upstream, replace those five values in your copy:

```css
.atlas-unknown-state {
  position: fixed; top: var(--space-xs); left: var(--space-xs); z-index: var(--z-tooltip);
  background: var(--bg-danger); color: var(--text-inverted-primary);
  font: 700 14px/1.4 Inter, sans-serif;
  padding: var(--space-2xs) var(--space-sm); border-radius: var(--rounded-base);
}
```

**`data-atlas-frame` goes on the modal, not on a wrapper round it.** `.pai-modal-layer` is
`position: fixed`, so a plain `<div>` round it has no box and the render photographs a
zero-height grey strip. The template's placeholder wrapper is right for a page and wrong for
a modal.

**A `[data-state]` element gets `display: contents`, which deletes its box.** Put the
attribute on a bare wrapper. On a `.pai-thumbnail`, a button or an image it silently removes
the aspect ratio, the edge or the control itself.

**Below 600px the modal dismiss button falls off the screen.** `.pai-modal-dismiss` is
positioned outside the shell (`left: 100%`), and at that width there is no outside. A
design-system gap; `designs/loop-check/loop-check.html` shows the local workaround.

---

## Two design systems live in this repo. Do not merge them

| | |
|---|---|
| `design-protos/design-system/pai.css` | 513 lines. What the other 99 protos link, and what they are live on Pages against |
| `atlas/design-system/pai.css` | 2,646 lines. What everything under `atlas/` links |

They share 179 selectors and **60 of those have different declarations** — `.button-small`
pads 10px in one and 8px in the other, `.chip-small` gaps 4px against 8px. Copying either
over the other silently restyles every screen built on the loser. Atlas's radius and spacing
scales were decided in atlas; the older file has no radius or spacing tokens at all.

Same story for icons: protos outside `atlas/` pull Phosphor from unpkg, atlas vendors it at
`design-system/icons/` and forbids the CDN. Both work. Leave both alone.

---

## Re-syncing

```sh
./sync.sh                      # from ../../agentic-atlas
./sync.sh ~/code/agentic-atlas # from somewhere else
./sync.sh --full-assets        # plus the 29 MB of full-size slides and feature clips
```

It re-stamps `SYNCED-FROM.md` with the atlas commit it copied. Your own `designs/<slug>/`
folders are never touched, with one exception: the four vendored reference slugs listed in
`SYNCED-FROM.md`.

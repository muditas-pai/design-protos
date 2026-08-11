# atlas — guide for Claude

You are inside a **vendored copy** of the `agentic-atlas` repo, sitting in design-protos.
Working on anything under `atlas/`, these rules override design-protos' root `CLAUDE.md`.

## Read AGENTS.md, not this file

`AGENTS.md` is the whole process — brief, study, explore, draw, lint, render, look, judge,
hand over. It is the source of truth for how a screen gets made here. `README.md` is how to
run the commands. This file is only the boundary rules.

## The boundary

- **Everything here except five files is a verbatim copy.** `README.md`, `SYNCED-FROM.md`,
  `sync.sh`, `CLAUDE.md`, `.gitignore` are ours; the rest is atlas's.
- **Never edit the vendored copy to fix something.** Not `pai.css`, not `AGENTS.md`, not a
  lint rule, not `templates/screen.html`. A fix belongs upstream in atlas and arrives on the
  next `./sync.sh`. Editing here forks the design system where nobody can see it. Say what is
  wrong, work round it in your own file, and note it under "Known snags" in `README.md`.
- **New work goes in `designs/<slug>/`.** Four slugs there are vendored reference and are
  overwritten by a sync: `cancel-flow`, `checkout-with-offer`, `deck-ready-modal-expanded`,
  `gold-50-off-modal`.
- **`atlas/design-system/` and `design-protos/design-system/` are different systems** that
  share class names and disagree on values. Nothing under `atlas/` links the outer one;
  nothing outside links this one. Never copy either over the other, in either direction.
- **Phosphor comes from `design-system/icons/`, never the CDN.** The rest of design-protos
  uses unpkg; that is their tree, not this one.

## Where the repo's own rules still apply

- A proto with an `annotations.jsonl` against it is frozen — fork a `-v2` rather than editing
  it. That covers the four reference designs here.
- Pages publishes from `main`, so anything committed under `atlas/` is live at
  `https://muditas-pai.github.io/design-protos/atlas/…`.
- Assets stay inside the tree and are referenced relatively, never from the repo root.

## Python is uv

`uv run --python 3.12 --with playwright python …`. Never system python, never pip. The exact
lint and render commands are in `README.md`.

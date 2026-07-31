# design-protos — guide for Claude

HTML design prototypes for presentations.ai, built **with designers, through you (Claude)**.
Each proto is a single self-contained `.html` that opens straight from Finder and publishes to
GitHub Pages: **https://muditas-pai.github.io/design-protos/**.

Your job is to help each designer move fast, keep their work shareable, and stay out of each
other's frames. **The conventions below are defaults, not handcuffs** — if a designer has their
own rhythm, follow it. Only two things are firm: don't edit a frame you didn't make without
asking, and don't quietly change the key screens.

## How the repo is organised

```
design-protos/
├── key-screens/          canonical screens that mirror the live product (read-only refs)
│                         · dashboard · editor · login · pricing
├── explorations/                everyone's playground — most work lives here
│   └── <designer>/<problem>/    one folder per problem statement —
│                                a designer's 8–10 attempts at it live together
├── design-system/        shared tokens + components (pai.tailwind.js, pai.css, …)
├── index.html            the landing page = the index of all frames
└── CLAUDE.md  README.md
```

- **key-screens/** — the reference frames everyone duplicates from. Treat as read-only;
  copy one into your explorations to riff on it.
- **explorations/<designer>/<problem>/** — your space; anything goes. A designer usually does
  **8–10 HTML files solving the same problem**, so make a folder per problem statement and keep
  the variations together (`explorations/mudita/editor-to-present-transition/loader-1.html`, …).
  If a designer is new, offer to set up `explorations/<their-name>/<problem>/` — but adapt to
  however they like to organise.
- **design-system/** — what every proto is built on. Don't hardcode brand values; use these.

### The landing page scales by designer
The root `index.html` lists three things: **Design system**, **Key screens**, and **Designers** —
one card per designer linking to their own `explorations/<designer>/index.html`, which lists that
designer's problems and protos. To add a designer: copy an existing `explorations/<name>/index.html`
as a template, fill in their work, and add a card under "Designers" on the root index. This keeps
the root short no matter how many designers join. Keep both the designer's index and the root in
sync when work is added.

### Marking explorations dev-ready
When an exploration is ready to hand to engineering, add a green **Dev Ready** tag next to its
title on the designer's index: `<span class="tag-dev-ready"><i class="ph ph-check"></i>Dev Ready</span>`
(the `.tag-dev-ready` style lives in each designer's `index.html`). Remove it if the status changes
back. Only set it on cards that are genuinely ready — it's a signal to eng, not decoration.

### Spec docs alongside protos
A problem folder often has a Markdown spec next to the prototypes. GitHub Pages serves `.md` as
**raw text** (we use `.nojekyll`), so to make a spec viewable, add a sibling **`<name>.html`** that
fetches the `.md` and renders it with marked.js + the design system — use
`explorations/mudita/role-input-specific-regenerate/editor-chat-atoms-spec.html` as the template.
The `.md` stays the single source of truth (the page renders it live; it shows a link fallback when
opened from `file://`, where browsers block fetch). Link the rendered page from the index, and give
it the **Dev Ready** tag when the spec is ready for eng.

**One `grounding.md` per problem folder; specs and protos are flat siblings.** Keep each problem
folder simple and **un-nested**:

```
explorations/<designer>/<problem>/
├── grounding.md          one shared grounding for the whole folder
├── <name>-spec.md        any number of specs  (+ rendered <name>-spec.html)
├── <proto>.html          any number of protos
└── assets/               local assets if a proto needs them
```

A **spec** is *stable design intent* — what a proto should be; it's the source of truth protos
relate to, so keep it clean. **`grounding.md`** is the folder's *volatile reference* — how the
feature maps to current `presentation-services` code, one-off prototype decisions, and a running
TODO. Grounding **ages with the code** — don't trust it as current. Specs and protos can point at
the single `grounding.md`; the grounding never points back. Don't nest further and don't make
per-spec groundings — one per folder. Reference folder: `explorations/mudita/brand-kit/`.

### Migrating an existing repo
To import a designer's existing proto repo, drop its whole working tree under
`explorations/<designer>/<problem>/` keeping the internal structure (so its relative asset paths
still resolve), bring the `assets/` along, and note the provenance (source repo + date) on the
designer's index. Skip build cruft (`.git`, lockfiles, binary docs) where you can. Then give the
designer a clean `explorations/<designer>/index.html` that links to the key protos.

## Branch vs commit to `main`

Pages publishes **only from `main`**, so a push to `main` is an instant shareable link, while a
branch is isolated but has no live URL. So, as a rule of thumb:

| Situation | Do this |
|---|---|
| Your own exploration, or your own file | Commit straight to `main` |
| A **key screen you own** | Commit to `main` (it's yours to maintain) |
| `design-system/` (everyone depends on it) | Branch + PR |
| Someone else's frame, or a key screen you don't own | Don't — duplicate it, or ask the owner |

Run `git pull --rebase` before pushing; separate files rarely collide.

## Don't edit another designer's frame — duplicate instead

Treat every existing proto like a designer's own Figma frame: people reuse work by **copying**
components into their own file, not by editing someone else's frame.

- **Before writing to or editing a proto you didn't just create, ask first.** Default to
  duplicating into the asker's explorations and riffing there.
- Edit a file in place only when the asker made it (e.g. earlier in this session) or explicitly
  confirms they want *that file* changed.
- Unsure who owns it? `git log -1 --format='%an %ar' <file>`, and when in doubt, ask.
- **Shared infrastructure is meant to be updated**, so edit these normally: `design-system/`,
  `index.html`, `CLAUDE.md`, `README.md`.

## Building a proto

- One self-contained `.html`, usually under `explorations/<designer>/<problem>/`. Short,
  kebab-case, **no spaces** (clean Pages URLs).
- **Every proto is standalone — never link one proto to another (or to a key screen).** A proto
  must open and demo entirely on its own. For cross-app navigation that's only there for context
  (e.g. a "Back to Home" affordance), use a **non-navigating placeholder** — a `<button>`, or
  `href="#"` — never an `href` pointing at another `.html`. (Index/hub pages are the one exception:
  their whole job is to link out to protos.)
- **Prefer no local asset files** — inline SVG/CSS and Phosphor icons keep a proto portable
  (opens from Finder, trivial to duplicate). But local assets are fine when a proto genuinely
  needs them (photos, logos, migrated work): keep them **inside that proto's own folder**
  (e.g. `explorations/<designer>/<problem>/assets/`), never at the repo root, and reference them
  with **relative** paths (not `/assets/…`) so they resolve under the Pages subpath.
- Start from `design-system/template.html`, or put this in the `<head>` (fix the relative depth
  to the repo root — e.g. `../../../design-system/pai.css` from
  `explorations/<you>/<problem>/`):

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" />
<script src="https://cdn.tailwindcss.com"></script>
<script src="…/design-system/pai.tailwind.js"></script>
<link rel="stylesheet" href="…/design-system/pai.css" />
```

- `<body class="pai">`. Style with component classes (`.button-style`, `.pai-badge`, `.pai-input`, …)
  and/or brand Tailwind utilities (`bg-bg-primary-inverted`, `text-body-base-medium`, …). Full
  list: `design-system/README.md` and the live gallery `design-system/components.html`.
- Add a card to `index.html` so the proto is linked from the landing page.

## Key screens — owned and hand-maintained

Key screens are **hand-built and hand-maintained by a designated owner.** Translating the live
React app to HTML is too lossy to trust (well under 80% accurate), so there is **no auto-sync** —
keeping a key screen current is a manual design job that belongs to its owner.

| Screen | Owner |
|---|---|
| editor | Mudita (`@muditas-pai`) |
| dashboard | Tyo (`@tyo-pai`) |
| pricing | Mani (`@manivasakan-arch`) |
| login | Mudita (`@muditas-pai`) |

Ownership is wired in `.github/CODEOWNERS`, which auto-requests the owner's review on any PR that
touches their screen.

- Each screen carries a stamp at the top: `<!-- key screen: <name> · owner: <name> · updated: <date> -->`.
- The owner is the only person who changes their screen. When the live screen changes, the owner
  updates it by hand — you (Claude) can help build and polish, but **don't auto-derive a key
  screen from the app and pass it off as current**; treat the app only as a visual reference.
- Not the owner and want changes? Duplicate the screen into your `explorations/<you>/`, or ask
  the owner to update theirs.

## Design skills (in `.claude/skills/`)

These project skills are committed to the repo, so they're **auto-available to anyone working in
design-protos with Claude Code** — no `~/.claude/skills` install or symlink needed.

- **`/crazy8s`** — branching visual-iteration: produces 8 variations in one rolling `crazy8s.html`,
  waits for a pick, then branches 8 more off it. Reach for it when exploring alternatives ("give
  me 8 variations", "different versions of this") — it's the natural way to fill an
  `explorations/<designer>/<problem>/` folder.
- **`/design-brief`** — interviews whoever brings a vague ask and writes the brief the design
  harness consumes (`explorations/<designer>/<problem>/brief.md`). Reach for it before
  a harness run, or any time a request is too loose to build from.
- **`pai-visual-language`** — presentations.ai brand voice & visual conventions (navy = action,
  orange = brand/upsell, setup → payoff, density, copy tone). Runs *alongside* the design system;
  auto-triggers on UI/brand work. The brand-voice section below is the short version of it.

Source of truth: `muditas-pai/pai-design-skills`. These are **copies** — if a skill changes there,
re-vendor it into `.claude/skills/<name>/SKILL.md`.

### Using crazy8s in this repo
crazy8s is our *divergence engine* — it rewrites one rolling `crazy8s.html` each round, branching
off the picked variant. It doesn't know our conventions, so steer it:

- **Seed the baseline from `design-system/template.html`** (or a faithful copy of the screen you're
  iterating on) so all 8 variations inherit the design system — crazy8s preserves the baseline's
  stack but won't add ours on its own.
- **Run it inside the designer's `explorations/<you>/<problem>/` folder** so `crazy8s.html` lands
  there, not at the repo root.
- **Keep the rounds — crazy8s files are not throwaway scratchpads.** Commit and push `crazy8s.html`;
  looking back at the iteration history is valuable. Because the rolling file overwrites each round,
  **snapshot a round to `crazy8s-round-<N>.html` before branching the next** so prior rounds stay
  browsable on Pages (git history alone is too buried for a designer). Link the current `crazy8s.html`
  from the designer's index as an *iterations* entry — it doesn't get the Dev Ready tag.
- On **"freeze it"**, save the picked variant as a clean, named `.html` in that same problem folder
  (strip the gallery scaffolding) and add *that* file to the designer's index — that's the keeper /
  Dev Ready candidate, distinct from the round snapshots. The 8–10 keepers in a problem folder are
  the frozen picks; the `crazy8s*.html` files are the iteration trail behind them.
- Iterating on **someone else's** frame? Duplicate it into your own folder first, then run crazy8s
  on the copy — never let it overwrite another designer's file.

## Brand voice (presentations.ai)

- **Navy `#0A1925` is the action color** — primary CTAs are navy-filled. **Orange `#FF5500` is
  brand / upsell only** (logo, PRO badge, upgrade prompts). Outside those, the UI is monochrome.
- One emphatic action per surface; everything else outlined or ghost.
- Headlines use **setup → payoff** (lighter setup line, then a darker, bolder payoff).
- Show **real product** (slide thumbnails, the editor), not abstract "AI" metaphors.
- Copy is short, plain, human. Avoid "empower / unlock / seamless / revolutionize".
- **Never use em dashes in any user-facing copy** (the `—` character or the `&mdash;` HTML
  entity). Use a comma, period, colon, or parentheses instead. Applies to every proto, spec,
  index card, and UI string we ship.
- Apply the `emil-design-eng`, `make-interfaces-feel-better`, and `pai-visual-language` skills
  when relevant.

## Publishing

Commit + push to `main` → GitHub Pages redeploys in a few seconds. Keep `index.html` current so
new frames are linked.

## The design system is a snapshot

`design-system/` is ported from the production app (`~/Documents/GitHub/PAI/pitchdeckdoclist`) —
if app tokens or components change, re-sync it so protos don't drift. **Owner: Tyo (`@tyo-pai`)**;
design-system changes go via branch + PR. (Key screens are different: they're hand-maintained by
their owners, not auto-synced — see above.)

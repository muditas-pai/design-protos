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
├── explorations/         everyone's playground — most work lives here
│   └── <designer>/       one folder per designer (group your own frames here)
├── design-system/        shared tokens + components (pai.tailwind.js, pai.css, …)
├── index.html            the landing page = the index of all frames
└── CLAUDE.md  README.md
```

- **key-screens/** — the reference frames everyone duplicates from. Treat as read-only;
  copy one into your explorations to riff on it.
- **explorations/<designer>/** — your space; anything goes. If a designer is new or has no
  space yet, offer to make them an `explorations/<their-name>/` folder — but adapt to however
  they like to organise (a flat file is fine too).
- **design-system/** — what every proto is built on. Don't hardcode brand values; use these.

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

- One self-contained `.html`, usually under `explorations/<designer>/`. Short, kebab-case,
  **no spaces** (clean Pages URLs).
- **No local asset files** — inline SVG/CSS and Phosphor icons, so it renders from Finder and on
  Pages.
- Start from `design-system/template.html`, or put this in the `<head>` (fix the relative depth
  to the repo root, e.g. `../../design-system/pai.css` from `explorations/<you>/`):

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

## Brand voice (presentations.ai)

- **Navy `#0A1925` is the action color** — primary CTAs are navy-filled. **Orange `#FF5500` is
  brand / upsell only** (logo, PRO badge, upgrade prompts). Outside those, the UI is monochrome.
- One emphatic action per surface; everything else outlined or ghost.
- Headlines use **setup → payoff** (lighter setup line, then a darker, bolder payoff).
- Show **real product** (slide thumbnails, the editor), not abstract "AI" metaphors.
- Copy is short, plain, human. Avoid "empower / unlock / seamless / revolutionize".
- Apply the `emil-design-eng`, `make-interfaces-feel-better`, and `pai-visual-language` skills
  when relevant.

## Publishing

Commit + push to `main` → GitHub Pages redeploys in a few seconds. Keep `index.html` current so
new frames are linked.

## The design system is a snapshot

`design-system/` is ported from the production app (`~/Documents/GitHub/PAI/pitchdeckdoclist`) —
if app tokens or components change, re-sync it so protos don't drift. (Key screens are different:
they're hand-maintained by their owners, not auto-synced — see above.)

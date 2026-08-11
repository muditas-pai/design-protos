# SYNCED-FROM

Everything in this folder except five files is a **verbatim copy** of the `agentic-atlas`
repo. It is vendored, not forked.

## The source

| | |
|---|---|
| repo | `agentic-atlas` — local checkout at `../../agentic-atlas` when this was written |
| commit | `65fa7057c6f471d3bc27d832b602ae073bb42da0` |
| subject | atlas-riff: coverage is the floor, not the sheet — and the ribbed surface goes into the queue |
| dated | 11 Aug 2026 |
| synced | 11 Aug 2026 |

Re-sync with `./sync.sh` — it re-copies from a local atlas checkout and re-stamps the four
rows above. That is the only supported way to update this folder.

---

## The rule

**The vendored copy is read-only.** If something here is wrong — a token, a lint rule, a
line in `AGENTS.md`, a component in `DESIGN.md` — the fix belongs **upstream in atlas**,
and it arrives here on the next `./sync.sh`. A fix made here is invisible to atlas, is
overwritten by the next sync, and silently forks the design system in the meantime.

Five files are ours and survive a sync: `README.md`, `SYNCED-FROM.md`, `sync.sh`,
`CLAUDE.md`, `.gitignore`. So does your own work under `designs/<slug>/`.

---

## What was copied

| | why |
|---|---|
| `AGENTS.md` | the process. The whole loop lives in this one file |
| `design-system/` | `pai.css` · `pai.tailwind.js` · `DESIGN.md` · `VOICE.md` · `README.md` · `coverage-gaps.md` · `sticker-sheet.html` · vendored Phosphor under `icons/` |
| `docs/` | `design-principles.md` (step 2 reading) · `lint-spec.md` (binds the linter) · `radius-reference.md` |
| `templates/screen.html` | the render contract pre-built — every draw starts from this |
| `tools/lint/` | the linter, its rules, its fixtures |
| `tools/render/` | the renderer, its fixtures |
| `canonical/` | five screens put forward as right, each with an `about.md` |
| `.claude/skills/atlas-riff/` | the `/atlas-riff` skill. Nested here on purpose — Claude Code scopes a nested `.claude/skills/` to files under its own folder, so this one applies under `atlas/` and nowhere else |
| `assets/` | minus two heavy tiers, see below |
| `designs/` | **only** the four folders carrying an `annotations.jsonl` — `cancel-flow`, `checkout-with-offer`, `deck-ready-modal-expanded`, `gold-50-off-modal` — plus atlas's `designs/README.md`. `AGENTS.md` step 2 says "read every `designs/*/annotations.jsonl`", so they keep that exact path. **Those four slugs are reserved**: do not name your own work after one, or the next sync overwrites it |

The directory layout mirrors atlas's root exactly. That is deliberate and load-bearing:
`templates/screen.html` links `../../design-system/pai.css`, the linter resolves its design
system as `tools/lint/../../design-system`, and every path in `AGENTS.md` is written from
the atlas root. Mirroring means **none of them needed rewriting** — so `AGENTS.md` here is
byte-identical to upstream and stays diffable, and a screen drawn from the template loads
the system with no edit.

---

## What was left out, and how to get it

| left out | weight | why | to get it |
|---|---|---|---|
| `assets/decks/*/full/` | 15 MB | 1920 × 1080 slides. Needed only for a deck on a full canvas above ~480 CSS px. `thumb` (400) and `card` (800) are vendored and cover filmstrips, picker grids and deck cards | `./sync.sh --full-assets` |
| `assets/features/*.mp4`, `*.webm` | 14 MB | the three feature clips. Atlas's own `assets/README.md` calls the `webm` "fidelity to production, not because a prototype needs it". Every feature keeps its `<slug>.jpg`, which is also the clip's first frame | `./sync.sh --full-assets` |
| `attic/` | 2.5 MB | the retired thirteen-stage harness. History, not process | read it in atlas |
| the other four `designs/` | 20 MB | `feature-gate-pricing-modal`, `plans-with-studio`, `hire-an-expert`, `single-export-vs-pro` — atlas's own work in progress, mostly rendered PNGs. `canonical/` is the exemplar set you are meant to imitate | read them in atlas |
| `proposals.json` | 368 KB | a corpus scan of every (property, value) across atlas's screens. Regenerable, and it describes atlas's corpus rather than this one | read it in atlas |
| `riffs/` | — | atlas's own riff sheets. `/atlas-riff` writes yours to `atlas/riffs/<element>/` | read them in atlas |
| `tools/annotate/` | — | design-protos already has its own annotate tool at `../tools/annotate/`. Two copies of the same tool pointed at two note stores is a trap | use `../tools/annotate/` |
| atlas's `README.md` and `CLAUDE.md` | — | orientation written for the atlas repo — they describe `attic/`, `riffs/`, upstream PR tracking, none of which came across. Replaced by this folder's own `README.md` and `CLAUDE.md` | read them in atlas |

So: **about 8 MB vendored, 29 MB of assets left behind, one flag away.**

The two heavy asset tiers are **gitignored**, so `--full-assets` is a local convenience and
never repo weight. A plain `./sync.sh` leaves them alone once pulled — rsync does not delete
what it excludes — and `./sync.sh --light-assets` is how you send them back.

---

## What is NOT shared with the rest of design-protos

`design-protos/design-system/pai.css` is a 513-line ancestor of this one (2,646 lines).
They share class names — `button-primary`, `text-heading-2xl` — and have **diverged in
values**: atlas's radius and spacing scales were decided in atlas, and copying either file
over the other would silently restyle every screen built against the other.

Ninety-nine existing protos link `../../../design-system/pai.css`. Nothing under `atlas/`
links that file, and nothing outside `atlas/` links `atlas/design-system/pai.css`. The two
trees do not touch, on purpose. **Do not merge them**, in either direction.

**Icons split the same way.** Protos outside `atlas/` pull Phosphor from
`unpkg.com/@phosphor-icons/web@2.1.1`. Atlas vendors it at `atlas/design-system/icons/`
and forbids the CDN, because a screen has to render with no network and because the
renderer photographs what actually loaded. Both keep working; do not cross them over.

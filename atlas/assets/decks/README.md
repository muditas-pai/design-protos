# assets/decks/

Four real presentations, fifteen slides each, `01`–`15`, in three sizes. Anywhere a screen has to
show a deck — a filmstrip, a picker grid, a canvas, a thumbnail behind a modal — the slide comes
from here rather than from a grey rectangle.

**They are not interchangeable.** They were chosen to be four different-looking decks, so the one
you pick is a decision about what the screen is claiming. A picker grid painted from a single deck
reads as one deck four times; a dark investor slide behind a light modal is a contrast test the
screen may not have meant to take.

Sizes, the 2× rule and why JPEG live in [`../README.md`](../README.md). This file is the roster.

## The four

| Slug | Deck | Register | Looks like |
|---|---|---|---|
| `ibm-cost-of-a-data-breach` | IBM Security — Cost of a Data Breach Report, 2023 | Enterprise research | Light. Dense. Small type in three columns, donut and line charts, data tables, pale-blue stat pages, thin blue line-art arcs, stock photography of people at work |
| `nayture-brand-like-patagonia` | Nayture — Building a Brand Like Patagonia, 2023 | Brand strategy, editorial | Loud. Display serif against sans, full-bleed landscape photography, saturated orange and electric purple colour blocks, black title cards, pull quotes |
| `palantir-q1-investor` | Palantir — Q1 Investor Presentation, 2025 | Investor update | Dark. Near-black ground, white type, red chrome, financial tables, one enormous number per page, charts on dark cards, a wall of legal small print |
| `refresh-capabilities` | Refresh — Capabilities Deck, 2024 | Studio pitch | Minimal. Black and electric blue alternating, big sans headlines, wide margins, section title cards, team photography, testimonial and FAQ layouts |

## Picking one

**Match the register of the screen, not your taste.** A billing screen and a template gallery want
opposite decks.

| The screen needs | Reach for |
|---|---|
| a deck that must read as serious work — enterprise, compliance, analyst, report | `ibm-cost-of-a-data-breach` |
| a deck that must look good small — thumbnails, a gallery, a template picker, a cover | `nayture-brand-like-patagonia` |
| dark slides — proving light chrome over dark content, or a finance / metrics context | `palantir-q1-investor` |
| slides that stay legible and distinct from each other at any size — filmstrips, step-throughs, nav | `refresh-capabilities` |
| **more than one deck on screen at once** | one of each, in that order, and let them look different |

**Slide `01` is the cover of every deck** and `index.json` names it. It is the safe pick for a single
thumbnail. `02` onward is body, and body pages differ hard between these four — an IBM body page is
a wall of 9pt text that turns to grey mush under 200px, where a Refresh body page survives it.

Two useful specifics:

- **A dense slide at thumbnail size is a real state**, not a failing image. If a screen has to show
  that a deck is text-heavy, `ibm-cost-of-a-data-breach/thumb/12.jpg` is the honest picture.
- **Charts on dark**: `palantir-q1-investor` `07`–`10` are charts and big-number stat pages, `11`–`15`
  are financial tables. Use them where a screen needs to say *this deck has data in it* without a
  caption.

The numbering is the position in *this* set, not in the deck it came from, so a consumer can loop
`01`–`15` without gaps.

## index.json

```js
const { decks } = await fetch("assets/decks/index.json").then(r => r.json());
```

Each entry carries `slug`, `title`, `year`, `slides`, `cover`, plus `register` and `use` — the two
columns above, so a build can pick without a human reading this file. Every slide is 16:9; set
`aspect-ratio: 16/9` and nothing letterboxes.

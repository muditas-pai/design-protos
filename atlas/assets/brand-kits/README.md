# assets/brand-kits/

Four brand kits, so a screen that applies one has something real to apply. A kit is a **name**, a
**logo** in colour and monochrome, and a **palette**.

```
brand-kits/
├── index.json          every kit, its palette, both logo paths and where the logo came from
└── <slug>/
    ├── logo.svg        the logo in the brand's own colour
    └── logo-mono.svg   the same logo in near-black, for a tinted or dark surface
```

## These are real trademarks

The logos are the companies' own, vendored here for prototyping. **A screen built on one must not be
presented as coming from that company**, shown to a customer as theirs, or published outside this
repo. They are here so a component's logo slot holds a real one at a real weight — which is the
only way to find out whether a layout survives IBM's wide wordmark and Spotify's tight circle.

Each entry records where its logo came from, in `source`:

| Slug | Name | Mark from | Licence |
|---|---|---|---|
| `bain` | Bain & Company | Wikimedia Commons | trademark, used for identification |
| `spotify` | Spotify | Simple Icons | CC0 |
| `ibm` | IBM | Simple Icons | CC0 |
| `airbnb` | Airbnb | Simple Icons | CC0 |

CC0 covers Simple Icons' *SVG files*, not the trademarks they depict — the logos are still owned by
the companies. Both facts are true at once and neither one licenses the other.

## The palettes

The brand's published colours, so a card tinted by a kit looks the way it would look.

| Slug | Primary | Card tint at 12% | Palette |
|---|---|---|---|
| `bain` | `#CC0000` | `#F9E0E0` | Bain Red · Charcoal · Slate · Mist · Paper |
| `spotify` | `#1ED760` | `#E4FAEC` | Spotify Green · Black · Slate · Ash · White |
| `ibm` | `#0F62FE` | `#E2ECFF` | Blue 60 · Gray 100 · Gray 60 · Gray 20 · White |
| `airbnb` | `#FF5A5F` | `#FFEBEC` | Rausch · Babu · Arches · Hof · Foggy |

They were chosen to be four different problems, not four logos. A red against a blue against a green
against a coral; Airbnb's five-colour palette against IBM's near-monochrome ramp; a wordmark that
needs width against three symbols that fit a square. **A screen that only ever renders one kit has not
been tested** — the point of having four is to run the same layout through all of them.

## Using them

```js
const { kits } = await fetch("assets/brand-kits/index.json").then(r => r.json());
const kit = kits.find(k => k.slug === "airbnb");   // → { name, logo, logoMono, primary, palette, … }
```

Every entry has the same shape — `slug`, `name`, `logo`, `logoMono`, `primary`, `ink`, `source`, and
a `palette` of five named colours — so a component can loop rather than special-case.

**Read the colours from here, never transcribe them.** A brand colour is data, not a design-system
value; there is no token for it and there should not be. The prompt box on the sticker sheet reads
its kit at load, which is why no hex for a brand appears anywhere in that page.

**Mono is not "the logo in grey".** It is the logo in one colour, for a surface where the brand
colour would clash or vanish — a coloured card, a dark region, a print of one ink.

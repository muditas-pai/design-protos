# Brand Kit — phasing spec

**Status:** In progress · **Owner:** Mudita · **Updated:** 10 Jun 2026
**Main spec →** [brand-kit-spec](brand-kit-spec.html) · **Grounding →** [grounding](grounding.html)

How we ship the Brand Kit in two phases. **Phase 1** is the lightweight *identity layer* — mostly
configuration a brand already has on hand. **Phase 2** is the heavier *creation layer* — the
subsystems that involve building something new (custom moods, a template engine, an asset library).
The idea: get decks on-brand fast with the simple stuff, then add the powerful-but-bigger tooling.

---

## The split

```
PHASE 1 — identity layer              PHASE 2 — creation layer
(config a brand already has)          (build something new — the complications)

├─ Org info                           ├─ Mood       pick a starting mood + build CUSTOM moods
├─ Font pairing                       ├─ Templates  save-a-deck-as-template + refresh
├─ Colour palette                     └─ Assets     smart library: auto-tag + AI-retrieve
├─ Logos                                            ↑ Phase 1 already scraped the images
├─ Voices
└─ Image collection                   (scraped whole-site on import — browse + insert;
                                       the smart Assets library above is Phase 2)
```

Every **Phase 1** component is essentially *fill-in-the-fields* — paste some text, pick two fonts,
drop in colours, upload logos, write a couple of voices. Every **Phase 2** component is a *system* —
a mood builder, a save / refresh engine, a tagged media library.

---

## Phase 1 — the identity layer

Ships first. A Phase-1 kit holds:

| Component | What the user does |
|---|---|
| **Org info** | Paste a short description of the org / product / service |
| **Font pairing** | Choose a title font + a body font |
| **Colour palette** | Add the brand's colours |
| **Logos** | Upload variants (light / dark / mono / full-colour) |
| **Voices** | Write one or more voices (the kit names a default) |

**How it relates to mood (important).** Phase 1 has **no mood ownership**. Font + colour are
*mood-agnostic overrides* (see the main spec's mood-override model) — they ride on top of whatever
mood the deck already uses. So a Phase-1 kit makes any deck look on-brand — right type, colours,
logo, voice — without the kit picking or building a mood itself.

**In the manage UI** (the built proto), Phase 1 = Org info · Look & feel *(fonts + colours only — no
mood row)* · Logos · Voices · a basic **Images** collection (the scraped assets — browse + insert).
The mood row, Templates, and the smart Assets library are Phase 2.

### Set up by import — extract & pre-fill

Filling five modules by hand is friction. So the **primary way to start a kit is to point us at what
the brand already has**, and we pre-fill from it:

```
DROP IN WHAT YOU HAVE …            WE EXTRACT …                  PRE-FILLS (Phase 1)
· Past PowerPoint decks (.pptx)    fonts · colours · logos       → Org info
· A brand book / guidelines (PDF)  tone of copy · org blurb      → Font pairing · Colour palette
· Your website (just a URL)        every image, across every     → Logos · Voices
                                   page — not just the hero      → Image collection (asset seed)
```

- **Whole-site image scrape.** From a website we crawl **every page, not just the hero** — product
  shots, lifestyle, team photos, UI screenshots — and pull them all into a **starter image
  collection** (à la Mutiny). That collection is the Phase-1 seed of the asset library; the smart
  parts — **auto-tagging + AI retrieval** — arrive in Phase 2.
- **Best-effort, not magic.** We pre-fill what we're confident about and leave the rest blank.
- **Provenance + always editable.** Each pre-filled value shows where it came from ("from your
  website") and can be confirmed or changed — extraction is a *head start*, never the final word.
- **From scratch still works.** Import is the fast path, not the only one; a user can fill every
  module by hand.

> The scraped **image collection** lands in **Phase 1** (browse + insert). Turning it into the smart
> **asset library** — auto-tagging, AI retrieval, uploading more — and adding **templates** are Phase 2.

---

## Phase 2 — the creation layer (the complications)

Adds the heavier subsystems:

- **Mood.** The kit gains a **starting mood** (pick 1 of ~50) and — the real complication —
  **custom mood creation**: a builder for layouts, decorative shapes, image masks, etc. This is the
  single biggest piece. Once a kit owns a mood, "Look & feel" gains the mood row above fonts + colours.
- **Templates.** Save any deck as a **template into the kit** (locked narrative + refresh-able
  slots), and refresh it per lead / industry — binding the app's existing refresh flow to the kit.
- **Assets.** The **smart library** on top of the Phase-1 image collection — one **auto-tagging** pass
  + **AI retrieval** by relevance, plus uploading more and curating. (Phase 1 already scraped the
  starter images; Phase 2 makes them generation-ready.)

Each is deferred not because it's optional, but because it's a **build-something** system rather than
a config field — more design, more engineering, more edge cases.

> This **supersedes the earlier "templates in v1" call** — templates are a creation subsystem and now
> sit in Phase 2 alongside custom moods and assets.

---

## Open questions for the split

- **Does a Phase-1 kit pin a default mood?** Two readings:
  **(a)** Phase 1 is fully mood-agnostic — font/colour just ride on the deck's mood; or
  **(b)** Phase 1 lets you *pick* an existing mood, and only **custom** moods wait for Phase 2.
  (b) gives Phase-1 kits a stronger starting look; (a) is simpler and cleaner to ship.
- **The manage UI for Phase-2 sections during Phase 1** — absent, or shown locked / "coming in Phase 2"?
- **Migration** — when Phase 2 lands, do existing kits get an empty mood / templates / assets, or a
  sensible default?

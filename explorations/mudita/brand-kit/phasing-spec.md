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
├─ Colour palette                     └─ Assets     upload library + auto-tagging
├─ Logos
└─ Voices
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
mood row)* · Logos · Voices. Templates and Assets are absent (or shown as "Phase 2").

### Set up by import — extract & pre-fill

Filling five modules by hand is friction. So the **primary way to start a kit is to point us at what
the brand already has**, and we pre-fill from it:

```
DROP IN WHAT YOU HAVE …            WE EXTRACT …                 PRE-FILLS (Phase 1)
· Past PowerPoint decks (.pptx)    fonts · colours · logos      → Org info
· A brand book / guidelines (PDF)  recurring imagery            → Font pairing
· Your website (just a URL)        tone of copy · org blurb     → Colour palette
                                                                → Logos · Voices
```

- **Best-effort, not magic.** We pre-fill what we're confident about and leave the rest blank.
- **Provenance + always editable.** Each pre-filled value shows where it came from ("from your
  website") and can be confirmed or changed — extraction is a *head start*, never the final word.
- **From scratch still works.** Import is the fast path, not the only one; a user can fill every
  module by hand.

> When Phase 2 lands, the same import can also seed **assets** (images pulled from the deck/site) and
> a **template** (a recurring deck layout) — but in Phase 1 it pre-fills only the five identity modules.

---

## Phase 2 — the creation layer (the complications)

Adds the heavier subsystems:

- **Mood.** The kit gains a **starting mood** (pick 1 of ~50) and — the real complication —
  **custom mood creation**: a builder for layouts, decorative shapes, image masks, etc. This is the
  single biggest piece. Once a kit owns a mood, "Look & feel" gains the mood row above fonts + colours.
- **Templates.** Save any deck as a **template into the kit** (locked narrative + refresh-able
  slots), and refresh it per lead / industry — binding the app's existing refresh flow to the kit.
- **Assets.** An **upload library** with one **auto-tagging** pass, so assets are AI-retrieved by
  relevance and hand-inserted by the user.

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

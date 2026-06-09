# Brand Kit — scoping

**Status:** Scoping · **Owner:** Mudita · **Updated:** 9 Jun 2026

A living scoping doc for the Brand Kit feature. It captures what's decided, what a brand kit
is made of, where it surfaces in the product, and what's still open. Decisions move as we
resolve them — this is the team's shared source of truth while we design it.

---

## Why

Agencies and consultancies — McKinsey, Bain, MetaLab, Pentagram — run many clients, each with
its own identity, so they need **many** brand kits in one workspace. Product companies —
Duolingo, Coca-Cola — run **one**. Either way, a brand kit lets a workspace lock its identity
once — org story, fonts, colors, logos, voice, templates, assets — so every generated deck
comes out on-brand by default, instead of being re-styled by hand each time.

---

## Where it lives today (grounding)

What's already real in the code, so we're not scoping blind:

- **The `BrandKit` table already exists** in `presentation-services` — `workspace_id`, `name`,
  `is_default`, and a free-form `payload` (JSONB). One **"Default"** kit is auto-created per
  workspace, and the DB enforces **exactly one default per workspace**. There are **no endpoints
  and no UI yet** — the empty `payload` is precisely what this doc defines.
- **Workspace = the tenant = "org."** There is **no `Team` entity** in the model — the closest
  thing is **Projects** (optional sub-groupings inside a workspace). So the mental model
  "org → teams" doesn't map to the data yet. Flagged below.
- **Templates and the refresh flow already exist** in the main app
  (`pitchdeckdoclist/.../templateflow/`, server route `POST /docs/pra/refreshtype`, which detects
  per-slide which parts are data vs. narrative). They're just **not bound to a brand kit**. The
  only new template work is the **binding** plus a **"save this deck as a template"** action.
- **Everything else is greenfield.** Moods are a known product concept (~50 of them), but
  font / color / logo / voice / asset structures are not modeled. Voice today is a single
  free-text `creator_role` hint passed to the generator.

So the whole `payload` shape is ours to define, and we're building on a table that already
reserved the right place for it.

---

## Decided

| Question | Decision |
|---|---|
| **Scope** | Workspace-level. Every kit is visible to everyone in the workspace and selectable on any deck. (Team-level visibility is a later concern — no `Team` entity exists yet.) |
| **Mood coupling** | A kit overrides only **font pairing + color palette** on top of the active mood. Every other mood property — layout, padding, corners, SVG decor, image masks, animation — is **never** overridden. The kit's mood is a *starting point*, not a lock. |
| **Templates in v1** | Yes. They already exist in the app; we add the brand-kit binding + a "save as template" action. |
| **Assets** | Upload → one **auto-tagging** pass → assets are both **AI-retrieved** (by relevance) and **hand-inserted** by the user. |
| **Icons** | **Out of scope.** A partial brand icon set mixed with our default set breaks visual consistency — same reasoning, deliberately cut. |

---

## What a brand kit is made of

```
BRAND KIT   (workspace-scoped · many per workspace · exactly one is default)
│
├─ Org info ....... text background on the org / product / service   → grounds AI copy
├─ Mood ........... a starting mood (1 of ~50)
├─ Font pairing ... title + body        ┐ override, on top of ANY mood
├─ Color palette .. brand colors        ┘
├─ Logos .......... light / dark / mono / full-color (multiple)
├─ Voices ......... many (Exec · Marketing · Sales) — one per deck; kit has a default
├─ Templates ...... saved decks: locked narrative + refresh-able slots
└─ Assets ......... uploaded images → auto-tagged → AI retrieves + user inserts
                                                       (no icons — by design)
```

### The mood-override model

This is the crux of how a kit and a mood combine. A mood is a rich, pre-built design; a kit only
ever touches two of its layers:

```
MOOD  — 1 of ~50, built by us
  ├─ layouts · padding · margins · corners
  ├─ SVG decor · image masks · animation styles     ← never overridden (too granular)
  ├─ default font  ───────┐
  └─ default palette ─────┤
                          ▼   the brand kit overrides ONLY these two
      BRAND KIT:   font pairing   +   color palette
      (mood-agnostic — they survive when the user swaps to a different mood)
```

Because the overrides are mood-agnostic, a user can change the mood mid-deck and keep their
brand intact.

### Component detail

| Component | What it holds | How it's applied |
|---|---|---|
| **Org info** | Plain-text background on what the org / product / service is | Grounds the AI's copy and voice |
| **Mood** | A starting mood (1 of ~50) | The base design; the kit overrides only its font + palette |
| **Font pairing** | Title font + body font | Overrides the active mood's fonts |
| **Color palette** | The brand's colors | Overrides the active mood's palette |
| **Logos** | Multiple variants — light / dark / mono / full-color | Placed on slides; the variant is chosen to suit the background |
| **Voices** | Many (e.g. Exec · Marketing · Sales); the kit names one **default** | One voice is active per deck; it drives copy tone |
| **Templates** | Saved decks — locked narrative + refresh-able slots | Picked at creation; refreshed per lead / industry via the existing refresh flow |
| **Assets** | Uploaded images (photos, illustrations), auto-tagged | AI retrieves by relevance + the user inserts manually |

---

## The three touchpoints

### 1 · Creation flow — pick a kit before generating

```
Create a deck
  └─ pick a brand kit            (workspace default pre-selected)
       ├─ pick a voice           (kit's default voice pre-selected)
       ├─ optionally start from one of the kit's templates
       └─ the kit primes generation:
            org info · mood · fonts · colors · logo · assets
```

### 2 · Editor — switch kit / voice mid-deck

```
In the editor
  ├─ switch brand kit
  │    ├─ switch voice within the kit
  │    ├─ re-apply font / palette / logo to existing slides   ← re-theme scope: OPEN
  │    └─ pull a brand asset into the current slide
  └─ save this deck as a template  →  into a brand kit         ← the one new action
```

### 3 · Dashboard — manage kits

```
Brand kits (workspace setting)
  └─ list of kits:  create · duplicate · set default · delete
       └─ edit a kit:
            org info · mood · font pairing · color palette ·
            logos · voices · templates · assets
```

---

## Sub-systems still to detail

### Templates
- A template = a saved deck where some blocks are **locked narrative** and others are
  **refresh slots**. The detection + refresh already exists (`/docs/pra/refreshtype`).
- "Save as template into a brand kit": which kit, what metadata (name, thumbnail, intended
  use), and does it capture the deck's current voice/mood?
- Does a template carry its own voice/mood binding, or inherit whatever kit it's opened under?

### Voices
- What is a voice as data — a **name + written guidelines + a few example phrases**?
- Confirm: each kit has a **default voice** so generation always has one; switchable at creation
  *and* in the editor. It supersedes today's free-text `creator_role` hint.

### Assets
- Auto-tag taxonomy — likely **subject + type (photo / illustration) + orientation +
  dominant color**. That's what powers "retrieve where relevant."
- Retrieval surface in the editor: a searchable brand-asset panel.

### Logos
- Variant selection: auto by slide-background luminance (light vs. dark), or user picks per use?

---

## Cross-cutting open questions

- **Default behavior** — new decks start from the workspace's default kit. Can a deck opt out
  of a kit entirely (pure-mood, no brand)?
- **Re-theme scope** — switching kit (or voice) in the editor re-applies to **existing** slides
  (full re-theme) or only to **new** ones generated afterward?
- **Org → team mapping** — the model has Workspace + Projects but no Team. If team-scoped kits
  are ever needed, that's a `Team` entity first. Out of v1; noted so we don't design it away.

---

## Suggested prototype order

Not feature cuts (templates are in v1) — just the order to design the surfaces so each one
de-risks the next:

```
1. Dashboard — manage a kit   (defines what a kit *is*, visually)
2. Creation flow — pick a kit + voice (+ template)
3. Editor — switch kit / voice · save-as-template
```

Starting at the dashboard nails the anatomy first; the other two reuse those same pieces.

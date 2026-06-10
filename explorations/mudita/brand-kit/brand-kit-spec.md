# Brand Kit — spec

**Status:** In progress · **Owner:** Mudita · **Updated:** 10 Jun 2026
**Grounding, one-off decisions & todos →** [brand-kit-grounding](brand-kit-grounding.html)

The design source of truth for the Brand Kit feature — what a kit is, where it surfaces, and the
decisions every Brand Kit prototype should match. Code reality and prototype-only notes live in the
grounding appendix (linked above), not here.

---

## Why

Agencies and consultancies — McKinsey, Bain, MetaLab, Pentagram — run many clients, each with its
own identity, so they need **many** brand kits in one workspace. Product companies — Duolingo,
Coca-Cola — run **one**. Either way, a brand kit lets a workspace lock its identity once — org
story, fonts, colors, logos, voice, templates, assets — so every generated deck comes out on-brand
by default, instead of being re-styled by hand each time.

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

The crux of how a kit and a mood combine. A mood is a rich, pre-built design; a kit only ever
touches two of its layers:

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

Because the overrides are mood-agnostic, a user can change the mood mid-deck and keep their brand
intact.

### Component detail

| Component | What it holds | How it's applied |
|---|---|---|
| **Org info** | Plain-text background on what the org / product / service is | Grounds the AI's copy and voice |
| **Mood** | A starting mood (1 of ~50) | The base design; the kit overrides only its font + palette |
| **Font pairing** | Title font + body font | Overrides the active mood's fonts |
| **Color palette** | The brand's colors | Overrides the active mood's palette |
| **Logos** | Multiple variants — light / dark / mono / full-color | Placed on slides; the variant is chosen to suit the background |
| **Voices** | Many (e.g. Exec · Marketing · Sales); the kit names one **default** | One voice is active per deck; it drives copy tone |
| **Templates** | Saved decks — locked narrative + refresh-able slots | Picked at creation; refreshed per lead / industry |
| **Assets** | Uploaded images (photos, illustrations), auto-tagged | AI retrieves by relevance + the user inserts manually |

---

## Decided

| Question | Decision |
|---|---|
| **Scope** | Workspace-level. Every kit is visible to everyone in the workspace and selectable on any deck. |
| **Mood coupling** | A kit overrides only **font pairing + color palette** on top of the active mood. Every other mood property — layout, padding, corners, SVG decor, image masks, animation — is **never** overridden. The kit's mood is a *starting point*, not a lock. |
| **Templates in v1** | Yes. They already exist in the app; we add the brand-kit binding + a "save as template" action. |
| **Assets** | Upload → one **auto-tagging** pass → assets are both **AI-retrieved** (by relevance) and **hand-inserted**. |
| **Icons** | **Out of scope.** A partial brand icon set mixed with our default set breaks visual consistency. |

---

## Where it lives (IA)

A brand kit is **workspace-scoped** (many per workspace, exactly one default). The entry point is a
**"Brand Kits"** item in the sidebar, right under "Created by Me".

The **manage** surface reuses the existing sidebar as the kit navigator — no second rail — and the
selected kit's detail fills the main area:

```
BRAND KITS   (the sidebar becomes the kit nav)
┌ sidebar ─────────┬ detail (fills main) ────────────────┐
│ workspace         │  [logo] Kit name          ★ Default │
│ ← Back to Home    │  ▾ Org info                          │
│ Brand Kits    [+] │  ▸ Look & feel  (mood · fonts · colors + live preview)
│ ▸ Kit A  ★        │  ▸ Logos                             │
│   Kit B           │  ▸ Voices                            │
│   Kit C (no logo) │  ▸ Templates                         │
│ ─────────         │  ▸ Assets                            │
│ settings          │                                      │
└───────────────────┴──────────────────────────────────────┘
```

- **Within a kit: preview-rich accordions.** A collapsed header shows a summary/thumbnail of that
  section; expanding it reveals the editor. (Accordions over tabs/panes — better discovery.)
- **Sections are flat**, with one exception: **mood + fonts + colors** are grouped into a single
  **"Look & feel"** section (they stack into the visual system) with a live preview slide.
- **Kit identity = the colour logo**, with an **illustrated pictogram fallback** when a kit has no
  logo yet.

---

## The three touchpoints

### 1 · Creation flow — pick a kit before generating

```
Create a deck
  └─ pick a brand kit            (workspace default pre-selected)
       ├─ pick a voice           (kit's default voice pre-selected)
       ├─ optionally start from one of the kit's templates
       └─ the kit primes generation: org info · mood · fonts · colors · logo · assets
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

### 3 · Dashboard — manage kits  *(filled state built)*

```
Brand Kits surface (sidebar = kit nav · detail = the selected kit)
  └─ kits:  create · duplicate · set default · delete
       └─ edit a kit, section by section (accordions):
            org info · look & feel (mood · fonts · colors) ·
            logos · voices · templates · assets
```

---

## Open questions

- **Voices — data shape.** A voice = a **name + written guidelines + a few example phrases**?
  Confirm each kit has a **default voice** (so generation always has one), switchable at creation
  *and* in the editor; it supersedes today's free-text creator hint.
- **Templates — binding.** "Save as template into a kit": which kit, what metadata (name,
  thumbnail, intended use), and does it capture the deck's current voice/mood? Does a template
  carry its own voice/mood binding or inherit the kit it's opened under?
- **Assets — tagging.** Auto-tag taxonomy (likely **subject · type · orientation · dominant
  color**), and the editor retrieval surface (a searchable brand-asset panel).
- **Logos — variant selection.** Auto by slide-background luminance, or user picks per use?
- **Re-theme scope.** Switching kit/voice in the editor re-applies to **existing** slides (full
  re-theme) or only to **new** ones generated afterward?
- **Kit opt-out.** New decks start from the default kit — can a deck opt out entirely (pure mood,
  no brand)?
- **Org → team.** The model has Workspace + Projects but no Team; team-scoped kits would need a
  `Team` entity first. Out of v1 — noted so we don't design it away.

---

## Build order & status

Not feature cuts (templates are in v1) — the order to design the surfaces so each de-risks the next:

```
1. Dashboard — manage a kit     ✓ filled state built  →  next: zero state + FTUE
2. Creation flow — pick a kit + voice (+ template)
3. Editor — switch kit / voice · save-as-template
```

Starting at the dashboard nails the anatomy first; the other two reuse those same pieces.

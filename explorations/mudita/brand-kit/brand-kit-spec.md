# Brand Kit — spec

**Status:** In progress · **Owner:** Mudita · **Updated:** 11 Jun 2026
**Grounding, one-off decisions & todos →** [grounding](grounding.html) · **Phasing →** [phasing-spec](phasing-spec.html)

The design source of truth for the Brand Kit feature — what a kit is, where it surfaces, and the
decisions every Brand Kit prototype should match. Code reality and prototype-only notes live in the
grounding appendix (linked above), not here.

---

## Why

Agencies and consultancies — McKinsey, Bain, MetaLab, Pentagram — run many clients, each with its
own identity, so they need **many** brand kits in one workspace. Product companies — Duolingo,
Coca-Cola — run **one**. Either way, a brand kit lets a workspace lock its identity once — org
story, fonts, colours, logos, voice, templates, assets — so every generated deck comes out on-brand
by default, instead of being re-styled by hand each time.

---

## What a brand kit is made of

```
BRAND KIT   (workspace-scoped · many per workspace · exactly one is default)
│
├─ Org info ....... structured blocks (company · audiences · proof · team…) → grounds AI content
├─ Mood ........... a starting mood (1 of ~50)
├─ Font pairing ... title + body        ┐ override, on top of ANY mood
├─ Colour palette . brand colours        ┘
├─ Logos .......... full-colour / reversed / dark / mono (multiple)
├─ Voices ......... many (Exec · Marketing · Sales) — one per deck; kit has a default
├─ Templates ...... saved decks: locked narrative + refresh-able slots
└─ Assets ......... images → collection (P1) → smart library, AI-retrieved (P2)
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
      BRAND KIT:   font pairing   +   colour palette
      (mood-agnostic — they survive when the user swaps to a different mood)
```

Because the overrides are mood-agnostic, a user can change the mood mid-deck and keep their brand
intact. A **"custom mood"** is never built from scratch — it's just a preset with the kit's fonts +
colours applied and saved. We never expose the granular layers (layouts, decor, image masks).

**No icons — deliberately.** A partial brand icon set mixed with our default set breaks visual
consistency, so icons are out of scope.

---

## What each component holds

The fields per component. **Phase 1** is the identity layer (org · fonts · colours · logos · voices +
a scraped image collection); mood, templates and the smart asset library are **Phase 2** — see the
[phasing spec](phasing-spec.html). Everything is **industry-agnostic** — the same fields serve a
consultancy, an agency, a CPG brand or a non-profit.

### Org info — *grounds the AI's content*

| Block | Captures |
|---|---|
| **Company** | name + what you are (one line) |
| **Field** | the sector you work in |
| **Who you serve** | businesses · consumers · public · which sectors |
| **Tagline** | the one verbatim line |
| **What you offer** | products · services · practice areas |
| **Audiences** | who you present *to* — clients · investors · partners · public |
| **Positioning** | what you stand for / the core promise |
| **Differentiators** | what sets you apart |
| **Competitors / peers** | who you're measured against |
| **Proof points** | key numbers · notable clients · case studies · awards · impact |
| **Team / people** | names · roles · short bios · **headshots** |
| **Mission / vision** | the north star |

*Proof points and Audiences carry the most weight — they fill KPI / logo slides with real data and
tune the whole deck to the room.*

### Font pairing — *overrides the mood's fonts*

| Field | Captures |
|---|---|
| **Title font** | family · weight · source |
| **Body font** | family · weight · source |
| *Display / accent (opt.)* | covers · big numbers |
| **Source** | a Google font, **or upload a licensed / custom font** (.woff2 / .otf) |
| **Fallback** | web-safe substitute |

*Custom-font upload is essential — most brands run licensed or bespoke faces that aren't on Google.*

### Colour palette — *light roles, not a flat list*

| Role | Used for |
|---|---|
| **Primary** | hero brand colour — fills, key moments |
| **Secondary** | supporting brand colour(s) |
| **Accent** | highlights · callouts · CTAs |
| **Ink** | body text (a dark) |
| **Surface** | backgrounds (a light) |
| **+ more** | the rest of the palette, untagged |

Each colour = **hex · name · role**. Import **auto-assigns** the roles (most-used → Primary, text →
Ink, page background → Surface). Gradients and contrast-pairing are computed / optional, not fields.

### Logos — *a set of variants*

| Variant | For |
|---|---|
| **Full colour** | primary, and the kit's identity mark *(required)* |
| **Reversed / light** | dark backgrounds |
| **Dark / mono** | light backgrounds / single-colour |
| *Mark / icon-only (opt.)* | the symbol alone — corners · footers · favicons |

Per logo: transparent file (SVG preferred). The system **auto-picks the variant by slide
background** (override available). Clear-space / min-size use sensible defaults, not fields.

### Voices — *flat; N per kit, one default*

| Field | Captures |
|---|---|
| **Name** | the label — Exec · Marketing · Sales |
| **Use it for** | the context — board · sales · social · client-facing |
| **Traits** | 3–5 adjectives |
| **How it sounds** | a short paragraph |
| **Examples** | 2–3 real on-brand lines *(the anchor)* |
| **Avoid** | banned words · off-brand phrases & claims |
| **Dials** | Formality · Length · POV *(+ optional Claims)* |

**Setup is extraction-first.** People can't describe their voice from a blank box — so we **draft
each voice from the brand's imported site / decks**, inferring the dials and pulling their **real
sentences as the examples**; the user reacts and tweaks. Fallbacks: a library of **role presets**
(Exec · Marketing · Sales · Founder · Social · IR), and **calibrate-by-recognition** (dials with a
live preview · "which sounds like you?" · trait chips) — never a "write your guidelines" field.

### Images / Assets

- **Phase 1** — a scraped **image collection**: per image = file / url · source (scraped page ·
  uploaded). Browse + manually insert.
- **Phase 2** — the smart library on top: one **auto-tagging** pass + **AI retrieval** by relevance,
  plus uploads and curation.

### Mood · Templates *(Phase 2)*

- **Mood** — a selected preset (1 of ~50); fonts + colours come from the kit. A saved "custom mood"
  = name + preset. No builder.
- **Templates** — a saved deck bound to the kit: name · thumbnail · which blocks are locked narrative
  vs. refresh slots.

---

## Where it lives (IA)

A brand kit is **workspace-scoped** — many per workspace, exactly one default, **visible to everyone
in the workspace and selectable on any deck**. The entry point is a **"Brand Kits"** item in the
sidebar, right under "Created by Me".

The **manage** surface reuses the existing sidebar as the kit navigator — no second rail — and the
selected kit's detail fills the main area:

```
BRAND KITS   (the sidebar becomes the kit nav)
┌ sidebar ─────────┬ detail (fills main) ────────────────┐
│ workspace         │  [logo] Kit name          ★ Default │
│ ← Back to Home    │  ▾ Org info                          │
│ Brand Kits    [+] │  ▸ Look & feel  (mood · fonts · colours + live preview)
│ ▸ Kit A  ★        │  ▸ Logos                             │
│   Kit B           │  ▸ Voices                            │
│   Kit C (no logo) │  ▸ Templates                         │
│ ─────────         │  ▸ Assets                            │
│ settings          │                                      │
└───────────────────┴──────────────────────────────────────┘
```

- **Within a kit: preview-rich accordions.** A collapsed header shows a summary/thumbnail of that
  section; expanding it reveals the editor. (Accordions over tabs/panes — better discovery.)
- **Sections are flat**, with one exception: **mood + fonts + colours** group into a single
  **"Look & feel"** section (they stack into the visual system) with a live preview slide.
- **Kit identity = the colour logo**, with an **illustrated pictogram fallback** when a kit has no
  logo yet.

**Setting up a kit.** A kit can be **bootstrapped by import** — drop in past PowerPoint decks, a brand
book / guidelines PDF, or just a website URL. We **scrape the whole site for images** (every page, not
just the hero) to seed the asset collection, and extract fonts, colours, logos, voice and the org
blocks to **pre-fill the modules**; the user then edits. Building from scratch stays available.
(A Phase 1 capability — see the [phasing spec](phasing-spec.html).)

The **first-run flow** (FTUE): empty Brand Kits → **add sources** (URL / deck / brand book) → a
**live reveal** of what we found (logo · palette · fonts · images · voices · profile) → **land in the
filled kit**, every value provenance-tagged. The success state **auto-generates a short sample deck in
the brand** — no button, just shown — as proof it works. Prototype:
[brand-kit-ftue](brand-kit-ftue.html).

---

## The three touchpoints

### 1 · Creation flow — pick a kit before generating

```
Create a deck
  └─ pick a brand kit            (workspace default pre-selected)
       ├─ pick a voice           (kit's default voice pre-selected)
       ├─ optionally start from one of the kit's templates
       └─ the kit primes generation: org info · mood · fonts · colours · logo · assets
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
            org info · look & feel (mood · fonts · colours) ·
            logos · voices · templates · assets
```

---

## Open questions

- **Mood in Phase 1.** Does a Phase-1 kit **pin a default mood** (pick from the ~50 presets), or stay
  fully mood-agnostic — reserving mood selection for Phase 2?
- **Re-theme scope.** Switching kit / voice in the editor re-applies to **existing** slides (full
  re-theme) or only to **new** ones generated afterward?
- **Kit opt-out.** New decks start from the default kit — can a deck opt out entirely (pure mood,
  no brand)?
- **Templates binding** *(Phase 2)*. Does a saved template carry its own voice / mood, or inherit the
  kit it's opened under?
- **Org → team.** The model has Workspace + Projects but no Team; team-scoped kits would need a
  `Team` entity first. Out of v1 — noted so we don't design it away.

---

## Build order & status

The order to *design the surfaces* so each de-risks the next. Which **components** ship when is a
separate axis — see the [phasing spec](phasing-spec.html).

```
1. Dashboard — manage a kit     ✓ filled state + FTUE built
2. Creation flow — pick a kit + voice (+ template)
3. Editor — switch kit / voice · save-as-template
```

Starting at the dashboard nails the anatomy first; the other two reuse those same pieces.

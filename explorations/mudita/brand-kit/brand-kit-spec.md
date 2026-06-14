# Brand Kit — spec

**Status:** In progress · **Owner:** Mudita · **Updated:** 12 Jun 2026
**Grounding, one-off decisions & todos →** [grounding](grounding.html) · **Phasing →** [phasing-spec](phasing-spec.html)

The design source of truth for the Brand Kit feature — what a kit is, where it surfaces, and the
decisions every Brand Kit prototype should match. Code reality and prototype-only notes live in the
grounding appendix (linked above), not here.

**Plans.** A brand kit is a **Pro** feature. **Brand knowledge** — the company document corpus we use
during generation — is a **Gold** feature. A custom, design-team-built kit is a separate **paid
service** (see *Two ways to get a kit*).

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
BRAND KIT   (workspace-scoped · many per workspace · exactly one default · a Pro feature)
│
├─ Org info ....... structured profile blocks (company · audiences · proof · team…)
├─ Brand voice .... authentic tone + voice rules (one voice, for now)
├─ Mood ........... a starting mood (1 of ~50)
├─ Font pairing ... title + body        ┐ override, on top of ANY mood
├─ Colour palette . brand colours        ┘
├─ Logos .......... full-colour / reversed / dark / mono (multiple)
├─ Templates ...... saved decks: locked narrative + refresh-able slots
└─ Assets ......... images → collection (P1) → smart library, AI-retrieved (P2)
                                                       (no icons — by design)

BRAND KNOWLEDGE  (Gold)  a corpus of the company's docs → retrieved during generation (RAG).
                         Deeper than Org info; one upload feeds both — see below.
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

### Company knowledge — *profile vs. corpus*

What the AI knows about you comes in **two depths**:

- **Profile** = **Org info** (above) — the curated, structured gist: a dozen blocks the user confirms,
  **always injected** into every deck. *(Pro.)*
- **Brand knowledge** — the **deep corpus**: drop in your documents (reports, decks, product docs,
  case studies) and we use them to inform generation, **retrieving what's relevant per slide**. To the
  user it's "share what your company knows"; under the hood it's a knowledge graph / RAG. *(Gold.)*

**They're the same material at two depths** — one job, not two: a single upload **distils into the
Profile** (editable gist) *and* **builds the Brand-knowledge corpus** (retrieved depth). Profile is
the always-on summary; Brand knowledge is everything, pulled in when relevant.

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

### Brand voice — *one voice per kit (for now)*

A kit has **one brand voice for now** (multiple voices by team — Exec / Marketing / Sales — is a later
expansion). The voice is two halves: **who you are**, and **how that shows up on a slide**.

**Authentic voice** *(the personality)*

| Field | Captures |
|---|---|
| **Traits** | 3–5 adjectives |
| **Examples** | 2–3 real on-brand lines *(the anchor)* |
| **Avoid** | banned words · off-brand phrases & claims |
| **Dials** | Formality · Length · POV · Claims (measured ↔ bold) |

**Voice rules** *(how the voice writes copy — the part that makes it feel on-brand)* — **⚠ being rescoped, see below**

The bridge from "who you are" to on-slide copy. **The test for a voice rule: it must hold true on
*every* slide, regardless of slide type.** That test is what the earlier draft got wrong (see the
rescope note) — the rules below are the corrected, type-independent set.

*Title rules* — generic constraints on how a title is phrased, **not** a fixed template:

| Rule | What it enforces | Example |
|---|---|---|
| **Active voice** | subject acts, not acted-upon | "We cut waste 30%" — not "Waste was cut by 30%" |
| **Fact-led** | assert something, don't just name a topic | "Margin is up four points" — not "Margin overview" |
| **No gerund heads** | don't open with an *-ing* verb | "Cut returns" — not "Reducing returns" |
| **Case** | sentence case vs Title Case (a real house style) | Patagonia → sentence case |
| **End punctuation** | period on titles, or none | Patagonia → none |
| **Length** | a terseness ceiling (≈ N words) | ≤ 8 words |

*Body / copy rules* — also type-independent:

| Rule | What it enforces |
|---|---|
| **Person / POV** | first-person plural ("we"), second ("you"), or impersonal — held consistent |
| **Contractions** | "we'll" vs "we will" (formality) |
| **Plain language** | enforce the banned-word / jargon list from **Avoid**; cap sentence length |

**What is *not* a voice rule** (this is the rescope's core point): **body density** (sparse vs
detailed) and **bullet form** (fragments / metric-led / verb-led) are **context-dependent** — a vision
slide wants prose, a data slide wants terse metrics. They depend on slide *type* and the active
*mood / layout*, so they live there, **not** as fixed kit-level voice levers. Trying to pin them at the
kit level fights the content.

> **🔧 Rescoped (12 Jun 2026 · checklist confirmed 14 Jun 2026).** The first lever model (title =
> takeaway/topic/question, body = sparse/supported, bullet = metric/verb/plain) was **too specific and
> per-slide** — it templated content that varies by slide type. The corrected model above is
> **always-true phrasing guardrails** (active voice, fact-led, no gerund heads, case, POV, plain
> language), with density/form pushed down to mood + slide type. **UI = an on/off checklist** (resolved
> over dials), grouped **Titles / Copy**, each rule a checkbox with a one-line example, driving a
> **live preview slide** that rewrites on toggle — prototyped in `brand-kit-ftue.html` (landed →
> Brand voice). The nine rules: *active voice · fact-led · no gerund openers · sentence case · no end
> punctuation · keep titles short* (Titles); *first person · contractions · plain language* (Copy).
> Defaults are inferred from the authentic voice. Open: the couple of genuinely gradient rules (title
> length, formality) may later want a slider rather than a binary box.

**Setup is extraction-first** — we draft the authentic voice from the brand's imported site / decks,
infer the rules, and show a live preview. Never a blank "describe your voice" box.

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

**Setting up a kit — build-it-yourself is the default.** The first screen shows the build-it-yourself
inputs **directly**: one or more **website URLs** and a **file drop** — brand book, past decks, *and*
company docs (PRDs, internal documentation). We scrape the whole site for images, extract fonts,
colours, logos, voice and the org blocks to **pre-fill the modules**, and the company docs **seed
Brand knowledge** (the corpus we keep pulling from). *Have us build it* — the in-house design-team
service — is a **separate, premium-styled card**, not an equal option; it routes to a **pricing page**.
(A Phase 1 capability — see the [phasing spec](phasing-spec.html).)

The **first-run flow** (FTUE): the setup screen → **Build my kit** → a **live reveal** of what we
found → **land in the filled kit**. The landing **leads with "A sample deck in your brand"** — a
**grid** of a few on-brand slides (~2 rows) — as the proof. No provenance banner, and **no big
page-header** (the sidebar already identifies the kit); *Make a deck / Regenerate* are **secondary**.
The sections then follow in order: **Look & feel · Brand voice · Logos · Brand knowledge · Org info ·
Images**. Prototype: [brand-kit-ftue](brand-kit-ftue.html).

**The sample deck adapts to the company.** Its slide types follow the **company type / user role** —
an agency → a services overview; a product company → a sales / product deck; leadership → a pitch
deck. Keep it to a few simple archetypes.

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

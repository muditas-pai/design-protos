# Brand Kit — spec (V2)

**V2** · full scope · **Owner:** Mudita · **Updated:** 15 Jun 2026 · **V1 →** [v1 spec](brand-kit-spec.html)
**Voice detail →** [brand-voice-spec](brand-voice-spec.html) · **Grounding →** [grounding](grounding.html) · **Proto →** [V2 FTUE](brand-kit-ftue-v2.html)

---

## What it is

- A **per-workspace** kit that makes every deck come out on-brand.
- A workspace can hold **multiple kits**; **one is the workspace default** (used unless a deck picks another).
- **Pro** feature. **Brand knowledge** (the knowledge graph) is **Gold**. A design-team-built kit is a separate **paid service**.
- One kit holds **one voice**.

---

## What changed from V1

| Module | V1 | V2 |
|---|---|---|
| **Look & feel** | Typography · Colour · **Mood** · sample deck | **Typography · Colour only** (mood + deck removed) |
| **Brand voice** | personality · 5 sliders · lexicon · live preview | **personality + words only** (sliders + preview removed) |
| **Logos** | 4 context slots | **3 types × 3 contexts** (+ icon-only, + wordmark-only) |
| **Templates** | manual add + import | **4 ways in** (library · existing deck · prompt · import) |
| **Brand knowledge** | editable doc list | **greyed/locked docs + Gold knowledge-graph upsell** |
| **Org info** | fields + team (name · role) | + **team photos** |
| **Images** | library | + **re-run auto-tagging** (costs credits) |

---

## Setup (FTUE)

1. Paste **company URLs** + drop files (brand book · past decks · internal docs).
2. We **extract** fonts, colours, logos, voice, org info; **scrape the whole site** for images.
3. **Live reveal** of what we found.
4. Land in a **filled, editable kit**.

*"Have us build it"* = a premium, done-for-you card → pricing.

---

## Where it lives

| Touchpoint | Job | Status |
|---|---|---|
| **Dashboard** | manage the kit (the accordion) | ✅ prototyped |
| **Creation flow** | pick a kit (+ a mood for the deck) before generating | ▢ to design |
| **Editor** | switch kit / voice mid-deck · save deck as template | ▢ to design |

> **Mood** is no longer a kit property — it's chosen per deck at **creation time**, not stored on the kit.

---

## The kit at a glance

```
BRAND KIT
├─ Look & feel ──── Typography · Colour
├─ Brand voice ──── Who we are / are not · Words we use / avoid
├─ Logos ───────── Full lockup · Icon only · Wordmark only   (each: light · dark · mono)
├─ Templates ───── library · existing deck · prompt · import
├─ Brand knowledge  (Gold) ── documents → knowledge graph
├─ Org info ─────── company details + team (with photos)
└─ Images ──────── library + auto-tagging
```

---

## Modules — what each holds + what you can do

Everything is **edit-in-place** with full create / update / delete and an inviting empty state.

| Module | Holds | Edit (C · U · D) |
|---|---|---|
| **Typography** | title + body font | swap font · remove a face · add one back |
| **Colour** | ordered palette | click a swatch to recolour · add · remove |
| **Brand voice** | personality + words | see voice table ↓ |
| **Logos** | 3 types × {light · dark · mono} | each slot **fetched from docs** or **uploaded** · replace · remove |
| **Templates** | saved / imported decks | add via library · existing deck · prompt · import · remove |
| **Brand knowledge** | documents (Gold) | add docs · the **graph itself is Gold** (locked until upgrade) |
| **Org info** | company fields **+ team** (name · role · **photo**) | edit · add · remove · upload a member photo |
| **Images** | media library | add · remove · **re-run auto-tagging** (costs credits) |

---

## Brand voice (V2) — two halves  ·  *background → [brand-voice-spec](brand-voice-spec.html)*

```
WHO WE ARE          WHO WE ARE NOT          WORDS WE USE        WORDS WE AVOID
3–5 attribute chips · the anti-attributes   ·   favour list   ·   ban list
```

- **No dimension sliders, no live preview** (both removed in V2).
- Just **personality** (who we are / are not) and **lexicon** (words we use / avoid).

---

## Logos (V2)

```
              On light     On dark      Monochrome
Full lockup     ▣            ▣             ＋
Icon only       ＋           ＋            ＋
Wordmark only   ▣            ＋            ＋
```

- **No auto-generation.** We fetch what we can from the user's docs (▣); the rest the user uploads (＋).
- Three **types** — full lockup · icon only · wordmark only — each on **light**, **dark**, and **monochrome**.

---

## Templates (V2)

Four ways in — templates are **not** pulled from the site:

1. **Browse library** — pick from the tool's template library.
2. **Use a presentation** — mark an existing deck as a template.
3. **Start from a prompt** — generate a fresh one.
4. **Import a deck** — PPT · Google Slides · PDF.

---

## Brand knowledge (V2)

- Show the documents we already have, **greyed + locked**.
- Message: *upgrade to **Gold** and we build a **knowledge graph** from them, so the AI fetches from your grounding knowledge far more accurately.*
- Adding more documents is allowed; the **graph** is the Gold unlock.

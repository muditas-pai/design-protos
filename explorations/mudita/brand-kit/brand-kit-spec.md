# Brand Kit — spec

**V1** · full scope · **Owner:** Mudita · **Updated:** 15 Jun 2026 · *changes after this → v2+*
**Voice detail →** [brand-voice-spec](brand-voice-spec.html) · **Grounding →** [grounding](grounding.html) · **Proto →** [FTUE](brand-kit-ftue.html)

---

## What it is

- A **per-workspace** kit that makes every deck come out on-brand.
- Visible to everyone in the workspace; selectable on any deck.
- A workspace can hold **multiple kits**; **one is the workspace default** (used unless a deck picks another).
- **Pro** feature. The **Brand knowledge** doc-corpus is **Gold**. A design-team-built kit is a separate **paid service**.
- One kit holds **one voice** (multiple voices by team is a later expansion).

---

## Setup (FTUE)

1. Paste **company URLs** + drop files (brand book · past decks · internal docs).
2. We **extract** fonts, colours, logos, voice, org info; **scrape the whole site** for images.
3. **Live reveal** of what we found.
4. Land in a **filled kit + a sample deck in your mood** — all editable.

*"Have us build it"* = a premium, done-for-you card → pricing.

---

## Where it lives

| Touchpoint | Job | Status |
|---|---|---|
| **Dashboard** | manage the kit (the accordion) | ✅ prototyped |
| **Creation flow** | pick a kit + mood before generating | ▢ to design |
| **Editor** | switch kit / voice mid-deck · save deck as template | ▢ to design |

---

## The kit at a glance

```
BRAND KIT
├─ Look & feel ──── Typography · Colour · Mood   → a sample deck
├─ Brand voice ──── Personality · Dimensions · Lexicon   → a live preview slide
├─ Logos ───────── marks for light · dark · mono (each)
├─ Templates ───── added manually / imported (PPT · Slides · PDF)
├─ Brand knowledge  (Gold) ── documents → generation corpus
├─ Org info ─────── company details + team
└─ Images ──────── scraped / uploaded library
```

---

## Modules — what each holds + what you can do

Everything is **edit-in-place** with full create / update / delete and an inviting empty state.

| Module | Holds | Edit (C · U · D) | Empty state |
|---|---|---|---|
| **Typography** | title + body font | swap font (inline dropdown) · remove a face · add one back | No fonts set → *Add fonts* |
| **Colour** | ordered palette | click a swatch to recolour · add · remove | No colours yet → *Add a colour* |
| **Mood** | 1 preset (of ~50) | *Change* → greyscale picker | (always set) |
| **Brand voice** | personality · 5 sliders · lexicon | see voice table ↓ | (always set) |
| **Logos** | 4 slots — **on light · on dark · mono of each** | each slot is **fetched from docs** or **uploaded** · replace · remove | empty slots show an *Upload* affordance |
| **Templates** | saved / imported decks | add manual · import PPT / Slides / PDF · remove | No templates → *Add / import* |
| **Brand knowledge** | documents (Gold) | upload · remove | No documents → *Add* |
| **Org info** | company fields **+ team** (name · designation) | edit · add · remove (both) | No company info → *Add* |
| **Images** | scraped / uploaded library | add · remove (per image) | No images → *Add* |

**Logos — no auto-generation.** We don't synthesise variants. We fetch what we can from the user's docs; the rest the user uploads. The target set is a mark that works **on light**, **on dark**, and **monochrome** for both.

---

## Mood — the override model

```
MOOD (a preset)                  KIT overrides           RESULT
layout · padding · corners       font pairing            same structure,
decor · image masks · anim   +   colour palette      =   in your brand's
└─ stays as the preset           └─ the only override     colour + type
```

1. **No mood builder.** A "custom mood" = a preset + the kit's font/colour, **saved**. Users never touch the granular layers.
2. **Picker is greyscale + 3 descriptor words** (e.g. *Monochrome News → Minimal · high-contrast · sharp*) so you judge **structure, not colour**.
3. Selecting a mood **re-themes the sample deck live** — the kit's colours + fonts carry over.

---

## Brand voice — 3 layers  ·  *full model → [brand-voice-spec](brand-voice-spec.html)*

| Layer | What | Control |
|---|---|---|
| **A · Personality** | 3–5 attribute chips + a "not this" set | editable chips |
| **B · Dimensions** | 5 sliders, **4 steps · no neutral** (always a lean) | sliders |
| **C · Lexicon** | words to **favour** / **avoid** | editable token lists |

The five dimensions — 2 rhetoric · 3 personality:

`Evidence` Data ↔ Story · `Conviction` Measured ↔ Bold · `Warmth` Composed ↔ Warm · `Humor` Serious ↔ Playful · `Polish` Plainspoken ↔ Refined

→ A **live preview slide** rewrites on every change. *(On-brand examples and POV were considered and cut — see the voice spec.)*

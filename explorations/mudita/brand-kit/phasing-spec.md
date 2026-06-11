# Brand Kit — phasing spec

**Status:** In progress · **Owner:** Mudita · **Updated:** 11 Jun 2026
**Main spec →** [brand-kit-spec](brand-kit-spec.html) · **Grounding →** [grounding](grounding.html)

Ship in two phases. **Phase 1** is a *thin slice of look & feel* — just enough brand to make any deck
come out on-brand, set up in seconds. **Phase 2** goes deeper — the heavier, build-something tooling.

---

## The split

```
PHASE 1 — a thin slice of look & feel     PHASE 2 — go deeper
· Org info                                · Mood       pick a preset → brand font/colour
· Fonts                                   · Templates  save-as-template + refresh
· Colours                                 · Assets     smart library (tag + AI-retrieve)
· Logos
· Voices
· Images  (scraped on setup)
```

Phase 1 is fill-in-the-fields; Phase 2 adds the heavier pieces — a template engine and a tagged
media library. (Mood stays a simple preset pick — never a builder.)

---

## Phase 1 — thin slice of look & feel

The brand basics, riding on top of whatever mood a deck uses (font + colour are mood-agnostic
overrides — see the [main spec](brand-kit-spec.html)). No mood ownership yet.

**Set up by import.** Drop in past decks (.pptx), a brand book (PDF), or a website URL → we extract
fonts, colours, logos, voice and an org blurb to pre-fill, and **scrape every page of the site for
images** (à la Mutiny) into a starter collection. Best-effort, provenance-tagged, fully editable;
building from scratch stays available.

---

## Phase 2 — go deeper

- **Mood** — pick a default mood from the ~50 presets. A **"custom mood"** is just that preset with the
  brand's font + colour applied and saved — **never** a builder for layouts, decorative elements or
  image masks. (Those granular layers are ours; users never touch them.)
- **Templates** — save any deck as a template into the kit + refresh per lead / industry.
- **Assets** — the smart library on the Phase-1 image collection: auto-tag + AI-retrieve, upload more.

---

## Open question

Does a Phase-1 kit **pin a default mood** (pick from the ~50 presets), or stay fully mood-agnostic —
reserving mood selection for Phase 2?

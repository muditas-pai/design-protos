# Brand Kit — phasing spec

**Status:** In progress · **Owner:** Mudita · **Updated:** 11 Jun 2026
**Main spec →** [brand-kit-spec](brand-kit-spec.html) · **Grounding →** [grounding](grounding.html)

Ship in two phases. **Phase 1** is a *thin slice of look & feel* — just enough brand to make any deck
come out on-brand, set up in seconds. **Phase 2** goes deeper — the heavier, build-something tooling.

---

## The split

```
PHASE 1 — a thin slice of look & feel     PHASE 2 — go deeper
· Org info                                · Mood       pick + build CUSTOM moods
· Fonts                                   · Templates  save-as-template + refresh
· Colours                                 · Assets     smart library (tag + AI-retrieve)
· Logos
· Voices
· Images  (scraped on setup)
```

Phase 1 is fill-in-the-fields; Phase 2 is systems — a mood builder, a template engine, a tagged
media library.

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

- **Mood** — pick a starting mood, and build **custom moods** (the big one).
- **Templates** — save any deck as a template into the kit + refresh per lead / industry.
- **Assets** — the smart library on the Phase-1 image collection: auto-tag + AI-retrieve, upload more.

---

## Open question

Does a Phase-1 kit **pin a default mood** (pick from the existing ~50), or stay fully mood-agnostic —
reserving only *custom* moods for Phase 2?

# Brand Kit — grounding

**Type:** Shared grounding for this folder — reference, **not** source of truth · **Owner:** Mudita · **Updated:** 10 Jun 2026

The shared context for the Brand Kit work in this folder. Every spec and proto here can draw on it,
but none should treat it as gospel: it covers how the feature maps to today's `presentation-services`
code, one-off prototype decisions, and a running TODO. It **ages with the code** — true when
written; verify before relying.

---

## Where it lives in presentation-services (code reality)

Mapped 9 Jun 2026 — verify against the repo before building.

- **The `BrandKit` table already exists** — `workspace_id`, `name`, `is_default`, and a free-form
  `payload` (JSONB). One **"Default"** kit is auto-created per workspace; the DB enforces exactly
  one default per workspace. **No endpoints, no UI yet** — the empty `payload` is what the spec defines.
- **Workspace = tenant = "org."** There is **no `Team` entity** — the closest thing is **Projects**
  (optional sub-groupings inside a workspace). So "org → teams" doesn't map to the data yet.
- **Templates + the refresh flow already exist** in the main app
  (`pitchdeckdoclist/.../templateflow/`; server route `POST /docs/pra/refreshtype` detects per-slide
  which parts are data vs. narrative). They're just **not bound to a brand kit** — the only new
  template work is the **binding** plus a **"save as template"** action.
- **Moods** are a known product concept (~50). **Voice** today is a single free-text `creator_role`
  hint passed to the generator. **Fonts / colors / logos / assets are not modeled** — greenfield.

So the whole `payload` shape is ours to define, on a table that already reserved the right place.

---

## Decided (locked product decisions)

The settled product calls behind the spec — recorded here so the spec stays a clean description.

| Question | Decision |
|---|---|
| **Scope** | Workspace-level. Every kit is visible to everyone in the workspace and selectable on any deck. |
| **Mood coupling** | A kit overrides only **font pairing + color palette** on top of the active mood. Every other mood property — layout, padding, corners, SVG decor, image masks, animation — is **never** overridden. The kit's mood is a *starting point*, not a lock. |
| **Templates — phase** | **Deferred to Phase 2** (a creation subsystem, with custom moods + assets); was earlier slated for v1. They already exist in the app; the work is the brand-kit binding + a "save as template" action. See the [phasing spec](phasing-spec.html). |
| **Assets** | Upload → one **auto-tagging** pass → assets are both **AI-retrieved** (by relevance) and **hand-inserted**. |
| **Icons** | **Out of scope.** A partial brand icon set mixed with our default set breaks visual consistency. |

---

## One-off decisions (prototype / demo choices)

These are prototype and demo choices, **not** product decisions — they live here, not in a spec.

- **Demo framing:** workspace = **"Atlas Studio"** (a multi-brand / agency workspace) so several
  unrelated kits read coherently. Demo kits: **Coca-Cola** (default), **Patagonia**, **smartwater**
  (the no-logo / not-set-up case).
- **Real logos** are vendored into `assets/` as single-path SVGs and recolored per variant via CSS
  `mask` + `background-color` (Coca-Cola from Simple Icons; Patagonia from Wikimedia Commons —
  apparel brands aren't in Simple Icons). Internal mock realism only, not official artwork.
- **Mood thumbnails** are real mini-slides drawn at 320×180 inside an SVG `<foreignObject>` and
  scaled by the viewBox. (First tried CSS container queries — `cqw` + `aspect-ratio` on a flex box
  collapsed the slide; `<foreignObject>` is the robust fix.)
- **Asset thumbnails** are picsum photos with an `onerror` gradient fallback (picsum is flaky).
- The manage surface **reuses the dashboard sidebar** as the kit nav (with "Back to Home") rather
  than adding a second rail.

---

## TODO / open threads

- [ ] Build the **zero state** (empty Brand Kits surface) and the **FTUE** (create-first-kit flow).
- [ ] Resolve the spec's open questions (Voices shape · Asset tag taxonomy · logo-variant
      selection · re-theme scope on switch · kit opt-out).
- [ ] Deep **library views** for Templates and Assets (currently a sample grid + "View all" stub).
- [ ] Real brand-logo artwork (current marks are simplified Simple Icons / Wikimedia versions).
- [ ] Define the **"save deck as template → kit"** metadata (name, thumbnail, captured voice/mood).

# Brand Kit — grounding

**Type:** Shared grounding for this folder — reference, **not** source of truth · **Owner:** Mudita · **Updated:** 12 Jun 2026

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
- **Extraction infra partly exists.** `UploadedFile` stores uploads with extracted `raw_content`
  (used today for doc-to-deck). The **set-up-by-import** flow (PPTX / PDF / website → pre-fill the
  kit) can build on this rather than starting cold.
- **Brand knowledge / RAG is greenfield.** No knowledge-graph or retrieval pipeline exists for brand
  context yet — today's doc-to-deck just stuffs one file's `raw_content` into the prompt, not a
  persistent per-company corpus. Brand knowledge is a **new system** (a Gold feature).

So the whole `payload` shape is ours to define, on a table that already reserved the right place.

---

## Decided (locked product decisions)

The settled product calls behind the spec — recorded here so the spec stays a clean description.

| Question | Decision |
|---|---|
| **Scope** | Workspace-level. Every kit is visible to everyone in the workspace and selectable on any deck. |
| **Mood coupling** | A kit overrides only **font pairing + color palette** on top of the active mood. Every other mood property — layout, padding, corners, SVG decor, image masks, animation — is **never** overridden. The kit's mood is a *starting point*, not a lock. **No mood builder** — a *custom mood* = a preset + the kit's font/colour, saved; users never edit the granular layers. |
| **Templates** | In scope now (no longer deferred). Templates already exist in the app; the work is the brand-kit **binding** + a "save as template" action. FTUE just adds manual + import-from-deck. |
| **Assets** | Upload → one **auto-tagging** pass → assets are both **AI-retrieved** (by relevance) and **hand-inserted**. |
| **Image scrape** | Set-up-by-import scrapes the **whole site** for images (every page, not just the hero) to seed the asset collection — inspired by **Mutiny**. The collection is in scope; **tagging + AI retrieval** are still stubbed. |
| **Icons** | **Out of scope.** A partial brand icon set mixed with our default set breaks visual consistency. |
| **Plans / gating** | A brand kit is a **Pro** feature. **Brand knowledge** (the doc corpus / RAG) is **Gold**. A custom, design-team-built kit is a separate **paid service**. |
| **Custom kit** | "Request a custom kit" routes to a **pricing page** — the in-house presentations.ai design team builds the kit for the company (a done-for-you service, distinct from the plan tiers). |
| **Voice scope** | **One voice per kit, for now.** Multiple voices by team (Exec / Marketing / Sales) is a later expansion. |
| **Brand voice shape** | Two halves — **authentic voice** (traits · examples · avoid · dials) + **voice rules** that drive on-slide copy. **Rescoped 12 Jun 2026:** rules must be *type-independent phrasing guardrails* (active voice · fact-led · no gerund heads · case · POV · plain language), **not** per-slide content templates. Density (sparse/detailed) and bullet form (metric/verb/plain) are **context/mood-dependent**, so they live with the slide type + mood, not as kit voice levers. FTUE voice UI is authentic-voice + sample only; rules UI deferred until the model is confirmed. |
| **Brand knowledge** | A **knowledge graph / RAG** from a user file dump, used in slide generation. User-facing name = "Brand knowledge," not "knowledge graph." One upload distils the structured **Org-info profile** (Pro) *and* builds the deep corpus (Gold) — same material, two depths. |
| **FTUE — setup** | Build-it-yourself is the **default** — the first screen shows the inputs directly (**multiple URLs** + a **file drop** for brand book / decks / **company docs** — PRDs, internal docs). Company docs **seed Brand knowledge**. "Have us build it" is a **premium, visually-distinct card**, not an equal option. |
| **FTUE — landing** | Leads with **"A sample deck in your brand"** (a **grid**, ~2 rows). **No** provenance banner; **no** big kit page-header (the sidebar identifies the kit). *Make a deck / Regenerate* are **secondary**. Section order: **Look & feel · Brand voice · Logos · Brand knowledge · Org info · Images**. |
| **Sample deck** | Slide types **adapt to company type / role** — agency → services; product co → sales/product; leadership → pitch. Keep to a few simple archetypes. |

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

- [x] **Zero state + FTUE built** (`brand-kit-ftue.html`) — zero → add sources → live reveal →
      filled kit + auto sample deck.
- [ ] Resolve the spec's open questions (mood-in-P1 · re-theme scope · kit opt-out · templates binding).
- [x] **Mood switcher built into the FTUE Look & feel** — shows only the current mood + a **Change**
      button → a picker modal of greyscale thumbnails (**+ 3 descriptor words**) so users judge
      structure, not colour. Selecting a mood **re-themes the sample deck live** (6 slides re-style to
      the mood's layout/decor while the kit's own colours + fonts carry over — the spec's override
      model). Slide styling is CSS-var-driven (`--bc/--bc2/--bc3/--bink/--bf/--bfb` from the kit).
      (Pulled forward from Phase 2 per design call.)
- [x] **Templates section added (manual + import).** No auto-generation from the site — empty state with
      "Add a template" + import-from-PowerPoint/Google-Slides/PDF. Library view still a stub.
- [x] **Team members in Org info** — a Team sub-section (name + designation), separate from the k/v
      company-details fields.
- [ ] Prototype **"request a custom kit" → pricing** handoff (the done-for-you service).
- [ ] Prototype the **Brand-knowledge** upload surface + the Pro/Gold gating UI.
- [x] **Reframed brand voice into a three-layer model** (personality · dimension sliders · lexicon) —
      replaces the nine-rule checklist, which mixed abstraction levels. On-brand examples were trialled
      as a Layer D and **cut** (low-friction over max LLM fidelity — reversible). Full model + research
      basis in the [brand-voice spec](brand-voice-spec.html); voice panel rebuilt in `brand-kit-ftue.html`.
- [x] **Dimension set reworked (blend of rhetoric + personality).** Five **five-stop** sliders:
      Evidence (Data↔Story) · Conviction (Measured↔Bold) · Warmth (Composed↔Warm) · Humor
      (Serious↔Playful) · Polish (Plainspoken↔Refined). Dropped the register/length-heavy set (it
      collapsed to two axes); each slider now passes the no-negative-pole + voice-not-tone tests.
      Conviction kept as *epistemic culture* (constant across deck types), not a pitch-only trait.
- [ ] Draft the **attribute → slider-default** inference table (which adjective nudges which track, how far).
- [ ] Decide whether the leans (stops 1 & 3) need distinct phrasing from the ends, or 3 stops suffice.
- [ ] Deep **library views** for Templates and Assets (currently a sample grid + "View all" stub).
- [ ] Real brand-logo artwork (current marks are simplified Simple Icons / Wikimedia versions).
- [ ] Define the **"save deck as template → kit"** metadata (name, thumbnail, captured voice/mood).

# Deal Room + Analytics — grounding

**Type:** Shared grounding for this folder — reference, **not** source of truth · **Owner:** Mudita · **Updated:** 20 Jul 2026

The shared context for the Deal Room and Share Analytics work in this folder. Every spec and proto here can draw on it, but none should treat it as gospel: it captures the product scope, the competitive framing, the object model to design against, the locked calls, and the open threads. It **ages** as the product decisions firm up: true when written, verify before relying.

---

## What we're building

Two features, one shared foundation. **Analytics is the engine; the Deal Room is the body it goes in.** Analytics tracks engagement on any shared deck; the room wraps a deck plus supporting assets plus a Mutual Action Plan into one branded, per-deal link, and reuses the same analytics inside it.

```
                 ┌───────────────────────────────────┐
                 │   SHARED FOUNDATION (build first)  │
                 │   tracked link · viewer identity ·  │
                 │   event capture · notifications     │
                 └──────────────┬────────────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                            ▼
  ┌────────────────┐                          ┌────────────────┐
  │  A. ANALYTICS  │  ships first, standalone │  B. DEAL ROOM  │
  │  on any shared │  ───────────────────────►│  wraps deck +  │
  │  deck link     │  room reuses it whole    │  assets + MAP  │
  └────────────────┘                          └────────────────┘
```

**Sequence:** Foundation → A (analytics on a shared deck link) → B (room). A is live value on its own and de-risks the tracking pipeline before any room chrome is built.

**Why now / why us:** PAI already makes the deck and already emits slide-level events. Trumpet and Aligned wrap decks they did not make; PAI *makes* the deck. The wedge is a **deck-native deal room**: thin on room chrome, deep on the two things deck ownership uniquely unlocks (per-slide analytics + a zero-seam make-to-share flow). See *Competitive landscape* below.

---

## Two analytics contexts (identity is inverse to reach)

The same event pipeline feeds two different *read* models. The more public the deck, the less you can (or need to) know who is viewing.

```
CONTEXT 1 — PUBLISHED DECK              CONTEXT 2 — DEAL ROOM
broadcast to the world                  1:few, a named account
─────────────────────────────          ─────────────────────────────
audience: unknown, many                 audience: a specific buying committee
gating:   none, anonymous fine          gating:   you WANT to know who
analytics: AGGREGATE                    analytics: PER-PERSON
  views, geo, slide drop-off              who opened, forwarding detection
  (YouTube-stats style)                   (DocSend-style tracked link)
identity: irrelevant                    identity: the whole point
```

Same events underneath: Context 1 counts anonymous views; Context 2 attributes them to people. This also resolves the *room-viewer surface* question: Context 1 reuses the existing shared-deck viewer; Context 2 gets the bespoke room surface (deck as one tile, MAP as the spine).

---

## Feature A — Share Analytics

Turns a shared deck link into engagement signal for the owner.

| In V1 | Out (later) |
|---|---|
| tracked share link per deck | CRM write-back (V2) |
| open / no-open state | A/B deck comparison |
| per-slide time + revisits | predictive deal scoring |
| viewer identity (skippable soft name prompt, deal-room context) | heatmap replays |
| aggregate views for published decks (anonymous) | verified email gate |
| **new-viewer detection (forwarding ★)** | team-wide analytics roll-up |
| link controls: expiry, revoke | |
| owner notification on first open | |
| per-deck analytics view (owner-only) | |

**Non-negotiable:** new-viewer detection. A viewer on an email domain the seller has not seen means the deck got forwarded up the buying committee. That signal justifies the whole feature; do not cut it.

**Surfaces to design:** the share dialog (link + gate + expiry), the analytics panel (per-deck: who, when, which slides), the notification (in-app + email).

---

## Feature B — Deal Room

A per-deal, branded container. One link that survives the forward, arms the champion, and carries the Mutual Action Plan.

| In V1 | Out (later / V2) |
|---|---|
| room object, one branded link/deal | proposal + e-signature |
| contents: PAI deck(s) + uploaded files + links + embedded video | Salesforce sync (all tiers) |
| Mutual Action Plan (rows: owner · due · state) | full onboarding/renewal hub |
| MAP item states: todo / in-progress / blocked / done | stakeholder-map visualization |
| MAP row visibility: shared \| internal-only | buyer-side comment threading |
| room states: Draft→Active→Stalled→Won/Lost→Archived (+ clone) | AI room autofill |
| asymmetric permissions (seller / champion / committee) | |
| analytics surfaced inside the room (reuses A, room-scoped) | |
| auto-stall on inactivity | |
| close-lost with reason capture | |

**Surfaces to design:**

```
1  Room builder (seller)    — assemble assets, scaffold MAP from template,
                              set branding, invite
2  Room viewer (buyer)      — the shared experience; deck front and center,
                              MAP as the progress spine, contribute lightly
3  MAP editor               — add/reorder/own rows, internal-only toggle
4  Room dashboard (seller)  — all my rooms × state × health (stalled flags)
5  Room analytics (in-room) — engagement scoped to this deal
```

---

## Shared foundation (build once, both consume)

```
tracked link + access control  → gate, expiry, revoke, per-link identity
viewer identity model          → anon → email-known → returning-viewer
event capture pipeline         → open, slide-view, dwell, MAP-tick, download
                                 (PAI already emits slide events — extend, don't rebuild)
notification service           → "X opened", "new viewer", "room stalled"
```

The leverage: PAI already instruments slides. The foundation is mostly *surfacing and attributing* events that exist today, not a new pipeline. That is why A can ship fast.

---

## The object model (design spine)

Two coordinated state machines run at different speeds: the **Room** (the container) and the **MAP item** (each checklist row). Many item transitions happen inside a single room state.

### Room lifecycle

```
                    ┌─────────┐
                    │  DRAFT  │  seller builds it; not shared yet
                    └────┬────┘  (assets in, MAP scaffolded from template)
                         │ seller shares link
                         ▼
              ┌──────────────────────┐
      ┌──────►│        ACTIVE        │◄──────┐
      │       │ shared; opens, ticks, │       │ buyer re-opens /
      │       │ comments happening    │       │ seller re-engages
      │       └───────┬──────┬────────┘       │
      │  seller       │      │  no activity   │
      │  re-engages   │      │  14+ days      │
      │       ┌───────┘      └───────┐        │
      │       │                      ▼        │
      │       │              ┌──────────────┐ │
      │       │              │   STALLED    │─┘
      │       │              │ auto-flag;   │
      │       │              │ reversible   │
      │       │              └──────┬───────┘
      │       │                     │ seller marks closed-lost
      │  all "close" steps          │
      │  ticked / order signed      │
      ▼       ▼                     ▼
  ┌────────────────┐        ┌────────────────┐
  │      WON       │        │      LOST       │
  │ deal closed;   │        │ closed-lost;    │
  │ order form in  │        │ reason logged   │
  └───────┬────────┘        └───────┬────────┘
          │                         │
          │ freeze / hand off       │ freeze
          ▼                         ▼
        ┌─────────────────────────────┐
        │          ARCHIVED           │  read-only record.
        │  read-only. can CLONE → new │  clone seeds the next
        │  DRAFT for renewal/expansion│  renewal/expansion room
        └─────────────────────────────┘
```

Transitions to design deliberately:

- **Active → Stalled** is **automatic** (inactivity timer), reversible, non-destructive. A nudge, not a verdict. This is what catches the silent fizzle, which is how most dead deals actually end (nobody sends a "we're not buying" email).
- **→ Lost** is **explicit** (seller acts) and **captures a reason**. That reason data is valuable in aggregate.
- **Won/Lost → Archived** freezes to read-only. **Clone** is the bridge to next year (School A, below): no year-round hub needed.

### MAP-item lifecycle (each row runs this independently)

```
   ┌──────────┐  owner starts     ┌──────────────┐  owner ticks   ┌──────┐
   │ TODO      │─────────────────►│ IN PROGRESS   │───────────────►│ DONE │
   │ not started│                  │ being worked  │                └──────┘
   └────┬──────┘                   └──────┬────────┘
        │                                 │ blocked (legal delay,
        │ seller/buyer                    │ waiting on approval)
        │ removes / de-scopes             ▼
        ▼                          ┌──────────────┐
   ┌──────────┐                    │   BLOCKED     │  ← the row to
   │ REMOVED   │                   │ visible risk  │    surface to the seller
   └──────────┘                    └──────────────┘
```

Each item carries three attributes that drive the UI:

```
  owner:      seller | buyer | both        ← who's accountable
  due:        date                          ← drives "overdue" styling
  visibility: shared | internal-only        ← seller-backstage toggle
```

### Permissions — flat buyer access (matches the norm)

**Decided 20 Jul 2026.** Benchmarking Pitch, Trumpet, and Aligned showed the industry treats the buyer side as **one flat tier**: anyone with the link can view *and* interact (tick the MAP, comment). None of them gate buyer actions behind an invited-"champion" role. We match that. The only asymmetry kept is **seller vs buyer-side**, plus the seller-only internal-row toggle.

```
                        │ SELLER │ ANY BUYER-SIDE VIEWER
                        │ (owner)│ (incl. champion + committee, flat)
────────────────────────┼────────┼──────────────────────────────
view room + assets      │   ✓    │   ✓
view SHARED map rows    │   ✓    │   ✓
view INTERNAL rows      │   ✓    │   ✗   ← the one asymmetry (seller backstage)
tick / check a map row  │   ✓    │   ✓   ← open to anyone in the room
comment / ask           │   ✓    │   ✓
add / edit / reorder rows│  ✓    │   ✗   ← seller structures the plan
change room state        │   ✓   │   ✗
────────────────────────┴────────┴──────────────────────────────
```

**Champion vs committee is an analytics/identity distinction, not an access tier** — it describes *who* a viewer is (named advocate vs unknown forwarded viewer, surfaced in engagement data), not what they're allowed to do. Asymmetric buyer roles (invited-champion can edit, others can't) were considered and **cut for V1** as more permission UI than the incumbents found worth building; revisit later if needed.

### Access vs role (two separate concepts)

```
1. ACCESS  (authentication) → can you OPEN the room at all?
2. ROLE    (authorization)  → once in, what can you DO?
```

**Access** is a friction dial the seller picks per room:

```
LEVEL 0  anyone with the link       zero friction, fully anonymous
LEVEL 1  name prompt (soft)         "who's viewing?" self-declared, skippable
LEVEL 2  email capture (soft gate)  enter email to view, not verified
LEVEL 3  email verification (OTP)   code to inbox → verified identity
LEVEL 4  allowlist / SSO            only invited addresses/domains
LEVEL 5  password                   shared secret, no identity
```

The tension: **security fights forwarding, and forwarding is the best signal.** A Level-4 allowlist *kills* forwarding (the CFO isn't on the list, so the champion can't forward to them, so "the CFO opened it" never fires). **V1 default = Level 1, skippable** — anyone with the link gets in (forwarding survives), but the room asks who they are (identity captured most of the time). Hard gates (3–4) are an **opt-in per room** for security-sensitive deals, accepting they suppress forwarding.

**Role** is just seller vs buyer-side (flat), so no login is needed to know it:

```
WHO                → CAN DO
──────────────────────────────────────────────────────────
seller (owner)     → everything: build, invite, edit MAP, room state,
                     see internal rows
any buyer-side     → view shared assets + shared MAP, tick rows, comment.
viewer (flat)        no editing the plan structure, no internal rows,
                     no room-state changes
```

The champion is identified in *analytics* (a named, invited viewer vs an unknown forwarded one), which is how the norm does it — not as a separate permission level. Internal-only MAP rows stay seller-side.

---

## The three roles (why the room exists)

```
CHAMPION            ECONOMIC BUYER         END USERS
day-to-day          controls the budget,   will actually use PAI;
advocate; usually   says the final yes;    their enthusiasm is
can't sign          often never met        ammo for the champion
     │                     │                     │
   "I want this" ──► "approve the $" ──► "we'll use it"
```

B2B deals average roughly 6–10 people on the buying side. The champion is one of them. The room's whole job is to travel from the champion outward to the rest of the committee, especially the **economic buyer** (budget authority, usually unseen by the seller). The Mutual Action Plan is the tool the champion uses to sell internally, and every open by a new viewer is a signal the deal reached someone new.

---

## Competitive landscape

Both incumbents are dedicated Digital Sales Room (DSR) products with a multi-year head start, so on the room itself they out-feature a V1. Neither makes the deck.

```
                              OUR V1      TRUMPET      ALIGNED
                              SCOPE       ("Pods")     ("DSR")
─────────────────────────────────────────────────────────────────
Room / container              core        deep         solid
Mutual Action Plan            core        yes          their core
  ├ stakeholder mapping       not yet     basic         deep
  └ internal-only rows        planned     yes           yes
Share analytics               core        engagement    engagement
  └ forwarding / new-viewer   planned     scoring       scoring
Brand / design customization  Brand Kit   microsite     functional
The DECK itself               NATIVE      embed/link    embed/link
Proposal + e-sign             no          built-in      built-in
CRM sync (SF / HubSpot)       no (V2)     deep          deep
Onboarding / post-sale hub    no          full          yes
```

- **Trumpet** — design-forward microsite builder. "Pods" are drag-and-drop rooms of widgets. Full-funnel positioning (pre-sale → onboarding → renewal). Wedge: customization + buyer experience.
- **Aligned** — process-forward buyer-enablement tool. Gravity is the MAP + stakeholder mapping, built for complex many-person deals. Wedge: deal-execution rigor.

**Posture:** not "build a better Aligned." The differentiator is the **deck-native deal room** — the obviously-right room for a deck that already lives in PAI, with analytics a layer deeper (per-slide) because PAI owns the artifact. Match them only on the MAP, because the MAP is what makes it a sales tool rather than a shared folder. They win where a team needs day-one CRM sync or Aligned-grade stakeholder rigor; those are not the first customers.

**Design stance — opinionated, not a builder.** Trumpet and Qwilr are drag-and-drop microsite builders: the seller lays out a web page. We deliberately **do not** do that. The room is an **opinionated, templated layout in the Pitch mold** — PAI makes the design calls, the seller drops content in. The room does not need to be a freeform web page. This drops the entire page-builder surface (expensive, off-brand) and leans on PAI's existing strength in opinionated layout. (See the *Room design approach* row in Decided.)

### Benchmarks

Where to look, and what for. Design north star is **Pitch's opinionated approach**, not the builders.

```
★★★  DocSend (Dropbox)   the canonical share-analytics model — Feature A's
                         reference (who viewed, which slide, forwarding). Study first.
★★★  Pitch               design north star: opinionated, templated, on-brand.
                         Also the access-controls model we matched.
★★   DocSend / Papermark Papermark = open-source DocSend; the plumbing is
                         inspectable (link controls, view tracking, access).
★★   Recapped / Recall   MAP-first — deepest reference for mutual-action-plan mechanics.
★★   Dock (dock.us)      structured (not freeform) room UX + onboarding handoff.
★     Storydoc            deck-native + engagement analytics; adjacent competitor.
```

Boundary / anti-examples (what we are NOT building):

```
Qwilr, Trumpet, Flowla   drag-and-drop webpage/microsite builders. We reject the
                         freeform-page model. (Qwilr's visual quality also reads
                         dated per design review — not a craft reference.)
GetAccept                broad DSR + e-sign; useful "full-scope" map, heavier than V1.
Highspot/Seismic/Showpad enablement-hub incumbents; context only, not a model to copy.
```

Space churns (acquisitions, renames) — confirm a product is still live before a deep dive. DSR-natives (Trumpet/Aligned/Pitch) verified 20 Jul 2026; the rest are from prior knowledge.

---

## Decided (locked calls)

| Question | Decision |
|---|---|
| **V1 scope** | Two features: Share Analytics + Deal Room. Ship analytics first (standalone on a shared deck link), then the room reuses it. |
| **Salesforce sync** | **V2, all tiers.** V1 room stands alone with no CRM dependency. (Tier 1 read/prefill rides the existing Data Refresh connector; Tier 2 write-back needs write scope + per-rep identity, a separate build.) |
| **Post-sale model** | **School A** — room freezes to a read-only record on close; renewal spins up a fresh room, optionally cloned from the last. Not the School B year-round account hub (that drags toward being a CS tool). Onboarding handoff = export / transfer-owner, not a new mode. |
| **Brand lock** | Already covered by the existing **Brand Kit** feature; not re-scoped here. |
| **Deal death** | Two states, not one: **Stalled** (automatic, from inactivity, reversible, a nudge) and **Closed-lost** (explicit, seller-set, logs a reason). Designing only the explicit close would miss ~90% of dead deals, since nobody clicks it. |
| **Room creation point** | Default at the **demo → proposal boundary** (a real opportunity + a named champion + a polished deck worth wrapping). Power users may create earlier (post-discovery) for more engagement history. |
| **MAP editing** | Seller owns and maintains it (~80% of the time), scaffolds from a template. Buyer contributes lightly (tick, comment, suggest a row) but can't restructure. Buyer co-editing is the healthy-deal signal. |
| **Forwarding detection** | In scope for V1 and non-negotiable — it is the signal that makes analytics worth building. |
| **Two analytics contexts** | Published decks (social/email) = aggregate, anonymous, ungated. Deal-room decks = per-person, identity-attributed. Same event pipeline, two read models. |
| **Email gate** | **Skipped in V1.** No verified email gate on either context. |
| **Anonymous viewing** | **Allowed.** |
| **Room access (deal room)** | **V1 default = Level 1 soft name prompt, skippable** — link-open + "who's viewing?" that a viewer can skip. Preserves forwarding while capturing identity most of the time. Hard gates (email verification, allowlist/SSO, password) are opt-in per room, deferred past V1. Matches Pitch/Trumpet/Aligned (all open-by-default, gates opt-in). |
| **Buyer-side roles** | **Flat — match the norm** (decided 20 Jul 2026 after benchmarking). Anyone with the link views + interacts (tick MAP, comment); no invited-champion access tier. Champion vs committee is an *analytics/identity* label, not a permission level. Only asymmetry kept: seller vs buyer-side + the seller-only internal-row toggle. |
| **Room viewer surface** | Two surfaces, not one: published deck reuses the existing shared-deck viewer; the deal room is a bespoke surface (deck as one tile, MAP as the spine). |
| **MAP in V1** | **Full** — owner · due · states (todo/in-progress/blocked/done) · internal-only visibility. Not the lite checkbox-only version. |
| **Room design approach** | **Opinionated + templated (Pitch-style), NOT a customizable webpage/microsite builder (Qwilr/Trumpet-style)** (decided 20 Jul 2026). The room is a well-designed fixed layout the seller drops content into; PAI makes the design calls. Kills the drag-and-drop page-builder surface entirely — the most expensive, least on-brand part of the competitors. Plays to PAI's strength in opinionated layout. The room does **not** need to be a freeform web page. |

---

## Open decisions — resolved 20 Jul 2026

The four V1 forks are now settled (see the Decided table):

1. **Email gate** → **skipped in V1.**
2. **Room viewer surface** → **two surfaces** (published deck reuses the shared-deck viewer; deal room is bespoke), per the two-context model.
3. **MAP in V1** → **full** (owner/due/blocked/internal-only).
4. **Anonymous viewing** → **allowed.** Deal-room default is a skippable soft name prompt (Level 1); hard gates are opt-in per room, deferred.

Still genuinely open (not V1-blocking):

- Exact **inactivity window** for auto-stall (placeholder: 14 days).
- Whether **hard gates** (email-verify / allowlist / password) land in V1.5 or V2.
- How a viewer gets **promoted** to champion (seller action UI).

---

## Where it maps to presentation-services (code reality)

**Not yet mapped.** The one dependency already identified: PAI emits **slide-level view events** today (the same instrumentation the dashboards read), so the analytics foundation is largely *surface + attribute* rather than a new event pipeline. Before building, trace in `presentation-services`:

- the existing slide-view / deck-share event schema (what's emitted, keyed how)
- whether a shareable-link + access-control primitive already exists
- the workspace / seat model the room's permissions map onto
- notification plumbing (in-app + email) already in place

TODO below tracks this.

---

## TODO / open threads

- [ ] **Map to `presentation-services`** — event schema, share-link primitive, workspace/seat model, notification plumbing.
- [ ] Resolve the four open decisions (email gate default · room-viewer surface · MAP full-vs-lite · anonymous viewing).
- [ ] Turn the locked scope into clean specs (start with whichever surface leads: likely the **share dialog + analytics panel**, since A ships first).
- [ ] Prototype **Room viewer (buyer)** — deck front and center, MAP as the progress spine.
- [ ] Prototype **Room dashboard (seller)** — rooms × state × health, stalled flags.
- [ ] Define the **MAP data model** as a spec (item object, states, owner/due/visibility, template scaffold).
- [ ] Design the **stalled → re-engage** nudge (the fizzle-catcher).
- [ ] Design the **close-lost reason capture** (aggregate "why deals die" data).
- [ ] Revisit **Salesforce Tier 1 prefill** once V1 room exists (rides the Data Refresh connector).

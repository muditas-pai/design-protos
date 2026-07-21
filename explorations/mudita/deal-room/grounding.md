# Deal Room — grounding

**Type:** Shared grounding for this folder — reference, **not** source of truth · **Owner:** Mudita · **Updated:** 21 Jul 2026

The **deal room** itself: a per-deal, branded container that wraps a PAI deck plus supporting assets plus a Mutual Action Plan into one link. Engagement analytics was **split out into its own project** on 21 Jul 2026 — the room *consumes* that engine but does not own it. For everything about tracked links, viewer identity, event capture, the per-slide dashboard, and the access friction-dial, see the [Deck Analytics grounding](../deck-analytics/grounding.html). This folder covers the room, the MAP, room-specific access/roles, and the room's design stance.

---

## What this is

A deal room collapses the scattered "I'll email you the deck, oh and the pricing, oh and that case study" into **one persistent, branded link per prospect**. It survives the forward (stays branded + current when the champion sends it up the committee), arms the champion to sell internally, and carries the Mutual Action Plan.

```
        ┌─────────────────────────────────────────┐
        │   DEAL ROOM  ·  "PAI × Acme Corp"        │
        │   one link, lives for the whole deal      │
        ├─────────────────────────────────────────┤
        │  📊 The PAI deck        (live, native)    │
        │  💰 Pricing / proposal                    │
        │  📄 Case study, security doc              │
        │  ✅ Mutual Action Plan / next steps       │
        │  🎥 Recorded demo / video                 │
        └─────────────────────────────────────────┘
```

**The wedge:** PAI *makes* the deck. Trumpet and Aligned wrap decks they didn't make. The room doesn't need to beat theirs on widgets or CRM depth — it needs to be the *obviously right* room for a deck that already lives in PAI.

---

## Why the room exists (the three roles)

```
CHAMPION            ECONOMIC BUYER         END USERS
day-to-day          controls the budget,   will actually use PAI;
advocate; usually   says the final yes;    their enthusiasm is
can't sign          often never met        ammo for the champion
     │                     │                     │
   "I want this" ──► "approve the $" ──► "we'll use it"
```

B2B deals average roughly 6–10 people on the buying side. The champion is one of them. The room's whole job is to travel from the champion outward to the rest of the committee, especially the **economic buyer** (budget authority, usually unseen by the seller). The Mutual Action Plan is the tool the champion uses to sell internally.

---

## What's in V1

| In V1 | Out (later / V2) |
|---|---|
| room object, one branded link/deal | proposal + e-signature |
| contents: PAI deck(s) + uploaded files + links + embedded video | Salesforce sync (all tiers) |
| Mutual Action Plan (rows: owner · due · state) | full onboarding / renewal hub (School B) |
| MAP item states: todo / in-progress / blocked / done | stakeholder-map visualization |
| MAP row visibility: shared \| internal-only | AI room autofill |
| room states: Draft→Active→Stalled→Won/Lost→Archived (+ clone) | |
| flat buyer access + seller/buyer asymmetry | |
| in-room analytics (room-scoped slice of Deck Analytics) | |
| auto-stall on inactivity | |
| close-lost with reason capture | |

**Surfaces to design:**

```
1  Room builder (seller)    — pick a room template, drop in deck + assets,
                              scaffold MAP, set branding, invite
2  Room viewer (buyer)      — bespoke room surface; deck front and center,
                              MAP as the progress spine, contribute lightly
3  MAP editor               — add/reorder/own rows, internal-only toggle
4  Room dashboard (seller)  — all my rooms × state × health (stalled flags)
5  In-room analytics        — engagement scoped to this deal (see Deck Analytics)
```

---

## The object model (design spine)

Two coordinated state machines at different speeds: the **Room** (container) and the **MAP item** (each checklist row).

### Room lifecycle

```
                    ┌─────────┐
                    │  DRAFT  │  seller builds it; not shared yet
                    └────┬────┘
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
  │ order form in  │        │ reason logged   │
  └───────┬────────┘        └───────┬────────┘
          │ freeze / hand off       │ freeze
          ▼                         ▼
        ┌─────────────────────────────┐
        │          ARCHIVED           │  read-only record.
        │  can CLONE → new DRAFT for  │  clone seeds the next
        │  renewal / expansion        │  renewal room
        └─────────────────────────────┘
```

- **Active → Stalled** is **automatic** (inactivity timer), reversible, a nudge not a verdict — it catches the silent fizzle (how most dead deals actually end).
- **→ Lost** is **explicit** and **captures a reason** (valuable in aggregate).
- **Won/Lost → Archived** freezes to read-only; **clone** is the bridge to next year (School A).

### MAP-item lifecycle (each row runs this independently)

```
   ┌──────────┐  owner starts     ┌──────────────┐  owner ticks   ┌──────┐
   │ TODO      │─────────────────►│ IN PROGRESS   │───────────────►│ DONE │
   └────┬──────┘                   └──────┬────────┘                └──────┘
        │ de-scoped                       │ blocked (legal delay,
        ▼                                 ▼  waiting on approval)
   ┌──────────┐                    ┌──────────────┐
   │ REMOVED   │                   │   BLOCKED     │  ← surface to the seller
   └──────────┘                    └──────────────┘
```

Each item carries three attributes:

```
  owner:      seller | buyer | both        ← who's accountable (a label)
  due:        date                          ← drives "overdue" styling
  visibility: shared | internal-only        ← seller-backstage toggle
```

---

## Access & roles

Access model + the friction-dial ladder are shared across all deck channels and live in the [Deck Analytics grounding](../deck-analytics/grounding.html). Room-specific calls:

- **Room access default = Level 1, skippable soft name prompt.** Link-open + "who's viewing?" that a viewer can skip. Preserves forwarding while capturing identity most of the time. Hard gates (email-verify / allowlist / password) are opt-in per room, deferred past V1.
- **Buyer access is FLAT (matches the norm).** Benchmarking Pitch / Trumpet / Aligned showed the buyer side is one tier: anyone with the link views *and* interacts (tick the MAP, comment). No invited-"champion" access level.

```
                        │ SELLER │ ANY BUYER-SIDE VIEWER
                        │ (owner)│ (champion + committee, flat)
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

**Champion vs committee is an analytics/identity label, not an access tier** — it describes *who* a viewer is (named advocate vs unknown forwarded viewer, surfaced in engagement data), not what they can do.

---

## Design stance — opinionated, not a builder

Trumpet and Qwilr are **drag-and-drop microsite builders**: the seller lays out a web page. We deliberately **do not** do that.

```
   THEM (builder)                    US (opinionated)
   seller designs a page             seller drops content into a
   drag-drop widgets, freeform       well-designed fixed template
   → off-brand, expensive surface    → PAI makes the design calls
```

The room is an **opinionated, templated layout in the Pitch mold**. It does not need to be a freeform web page. This drops the entire page-builder surface (the most expensive, least on-brand part of the competitors) and leans on PAI's existing strength in opinionated deck layout. So the **Room builder** becomes "pick a template, drop in deck + assets + MAP," not "design a site."

---

## Competitive landscape

```
                              OUR V1      TRUMPET      ALIGNED
                              SCOPE       ("Pods")     ("DSR")
─────────────────────────────────────────────────────────────────
Room / container              core        deep         solid
Mutual Action Plan            core        yes          their core
The DECK itself               NATIVE      embed/link    embed/link
Design model                  opinionated builder      functional
Proposal + e-sign             no          built-in      built-in
CRM sync (SF / HubSpot)       no (V2)     deep          deep
Onboarding / post-sale hub    no (School A)full          yes
```

- **Trumpet** — design-forward microsite *builder* (drag-drop Pods). Full-funnel. Wedge: customization.
- **Aligned** — process-forward buyer-enablement. Gravity is MAP + stakeholder mapping. Wedge: deal rigor.

**Posture:** not "build a better Aligned." The differentiator is the **deck-native, opinionated room** for a deck that already lives in PAI. Match them only on the MAP — that's what makes it a sales tool rather than a shared folder. They win where a team needs day-one CRM sync or Aligned-grade stakeholder rigor; those are not the first customers.

### Benchmarks

Design north star is **Pitch's opinionated approach**, not the builders.

```
★★★  Pitch               design north star: opinionated, templated, on-brand.
                         Also the access-controls model we matched.
★★   Recapped / Recall   MAP-first — deepest reference for mutual-action-plan mechanics.
★★   Dock (dock.us)      reference for the DEFERRED scope (School B account hub,
                         order forms, onboarding handoff), NOT the V1 model. Its
                         "one link, sell→onboard→portal" is exactly what we cut.
```

Anti-examples (what we are NOT building): **Qwilr, Trumpet, Flowla** — drag-and-drop webpage builders; we reject the freeform-page model (Qwilr's visual quality also reads dated per design review). DocSend is the analytics reference and lives in the [Deck Analytics grounding](../deck-analytics/grounding.html). *(Dropped: Papermark — doc-sharing / data-room tool, wrong use case.)*

Space churns (acquisitions, renames) — confirm a product is still live before a deep dive. DSR-natives verified 20 Jul 2026.

---

## In-room analytics

The room shows a **room-scoped slice** of the Deck Analytics dashboard: engagement filtered to this deal (who on the committee opened, per-slide dwell, forwarding to a new viewer, MAP progress). Same engine, same events — see the [Deck Analytics grounding](../deck-analytics/grounding.html). Nothing analytics-specific is built here.

---

## Decided (locked calls)

| Question | Decision |
|---|---|
| **Analytics split out** | Engagement analytics is its own project (21 Jul 2026); the room consumes it. This folder is the room only. |
| **Salesforce sync** | **V2, all tiers.** V1 room stands alone, no CRM dependency. |
| **Post-sale model** | **School A** — room freezes to a read-only record on close; renewal spins up a fresh room, optionally cloned. Not the School B year-round hub (that drags toward a CS tool). Onboarding handoff = export / transfer-owner, not a new mode. |
| **Brand lock** | Covered by the existing **Brand Kit** feature; not re-scoped here. |
| **Deal death** | Two states: **Stalled** (automatic, from inactivity, reversible) and **Closed-lost** (explicit, seller-set, logs a reason). Explicit-only would miss ~90% of dead deals. |
| **Room creation point** | Default at the **demo → proposal boundary** (real opportunity + named champion + polished deck). Power users may create earlier. |
| **MAP** | **Full** — owner · due · states (todo/in-progress/blocked/done) · internal-only visibility. Not the lite checkbox-only version. Seller owns + scaffolds from a template; buyer contributes (tick, comment). |
| **Buyer-side roles** | **Flat — match the norm.** No invited-champion access tier; champion/committee is an analytics label. Only asymmetry: seller vs buyer + the seller-only internal-row toggle. |
| **Room access default** | Level 1 skippable soft name prompt; hard gates opt-in, deferred. |
| **Room viewer surface** | Bespoke room surface (deck as one tile, MAP as the spine) — distinct from the plain shared-deck viewer used for public decks. |
| **Design approach** | Opinionated + templated (Pitch-style), NOT a drag-and-drop webpage builder. Kills the page-builder surface. |

---

## Open decisions (not V1-blocking)

- Exact **inactivity window** for auto-stall (placeholder: 14 days).
- Whether **hard gates** (email-verify / allowlist / password) land in V1.5 or V2.
- **Room template** set — how many starting layouts, and how a seller picks.
- The **MAP template** scaffold — what a default action plan ships with.

---

## Where it maps to presentation-services (code reality)

**Not yet mapped.** The room needs: a per-deal container object, the MAP data model, a room-scoped view of the analytics events (owned by Deck Analytics), and the workspace / seat model its permissions map onto. Before building, trace in `presentation-services` alongside the Deck Analytics mapping.

---

## TODO / open threads

- [ ] **Map to `presentation-services`** — container object, workspace/seat model, how a room references decks + the analytics event stream.
- [ ] Prototype **Room viewer (buyer)** — deck front and center, MAP as the spine, opinionated template.
- [ ] Prototype **Room builder (seller)** — pick-a-template + drop-in content (no page builder).
- [ ] Prototype **Room dashboard (seller)** — rooms × state × health, stalled flags.
- [ ] Define the **MAP data model** as a spec (item object, states, owner/due/visibility, template scaffold).
- [ ] Design the **stalled → re-engage** nudge and the **close-lost reason capture**.
- [ ] Decide the **room template** set (layouts + how the seller picks).

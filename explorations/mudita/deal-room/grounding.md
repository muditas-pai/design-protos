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

## Feature A — Share Analytics

Turns a shared deck link into engagement signal for the owner.

| In V1 | Out (later) |
|---|---|
| tracked share link per deck | CRM write-back (V2) |
| open / no-open state | A/B deck comparison |
| per-slide time + revisits | predictive deal scoring |
| viewer identity (optional email gate) | heatmap replays |
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

### Permissions (asymmetric)

```
                        │ SELLER │ CHAMPION │ COMMITTEE / viewer
────────────────────────┼────────┼──────────┼───────────────────
view room + assets      │   ✓    │    ✓     │   ✓
view SHARED map rows    │   ✓    │    ✓     │   ✓
view INTERNAL rows      │   ✓    │    ✗     │   ✗
tick a row they own     │   ✓    │    ✓     │   ✗
comment / ask           │   ✓    │    ✓     │   ✓ (optional)
add / edit / reorder rows│  ✓    │  limited*│   ✗
change room state        │   ✓   │    ✗     │   ✗
────────────────────────┴────────┴──────────┴───────────────────
  *champion can add / suggest a row but can't restructure the
   seller's plan — the "buyer adopted my process" signal, kept safe.
```

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

---

## Open decisions (resolve before design starts)

These change what gets drawn:

1. **Email gate — default on or off?** Gate = better identity + forwarding data; adds buyer friction. (Lean: off by default, one-click on.)
2. **Room viewer — new surface, or an evolved "shared deck" page?** Reusing the share page is faster; a bespoke room reads more premium.
3. **MAP in V1 — full (owner/due/blocked/internal-only) or lite (just checkable rows)?** Lite ships faster but loses the mutual-commitment value that makes it a sales tool.
4. **Anonymous viewing allowed at all,** or is every viewer at least name-prompted?

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

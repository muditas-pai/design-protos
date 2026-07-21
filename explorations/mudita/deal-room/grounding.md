# Deal Room — grounding

**Type:** Shared grounding for this folder — reference, **not** source of truth · **Owner:** Mudita · **Updated:** 21 Jul 2026

The **deal room** itself: a per-deal, branded container that wraps a PAI deck + supporting assets + a Mutual Action Plan into one link. Engagement analytics is its own project — the room *consumes* it. See the [Deck Analytics grounding](../deck-analytics/grounding.html).

---

## Who is this for?

**Sales only** (unlike Analytics, which also serves Marketing + Leadership). The primary user is the **Account Executive** running a deal. Relevant *after* a deck exists, at the point the seller is working an opportunity.

| Role | Use |
|---|---|
| **Sales / AE** | the whole feature — run a live deal through one branded room |
| *Sales Engineer (adjacent, later)* | POC / pilot rooms — Phase 2 |
| *Customer Success (adjacent, later)* | onboarding handoff — Phase 2 (School B) |

**When it's relevant:**

```
CREATE FLOW  →  deck exists  →  seller working a deal  →  wraps it in a room
(not here)                       (demo → proposal stage)
```

The three roles the room must serve on the *buyer* side (why it exists):

```
CHAMPION ──► ECONOMIC BUYER ──► END USERS
your advocate   controls budget,   will use PAI;
(can't sign)    says final yes      their buy-in = champion's ammo
```

The room's job is to travel from the champion outward to the committee (avg ~6–10 people), especially the unseen economic buyer. The Mutual Action Plan is how the champion sells internally.

---

## Who are the incumbents?

**Trumpet** (Pods), **Aligned** (DSR), **Dock**, **GetAccept**, plus **Pitch** on the design side.

## What are they doing?

- **One branded link per deal** bundling deck + assets + next steps.
- **Mutual Action Plan** — a shared checklist of steps to close.
- **Engagement tracking** inside the room.
- **Content bundling** — PDFs, videos, links, embeds.
- **(Trumpet/Qwilr) drag-and-drop page builder** — seller lays out a microsite.
- **(Dock) full journey** — sell → onboard → portal from one link; order forms / e-sign.

## What's relevant to us?

- the **one-link-per-deal container** + **Mutual Action Plan** (this is the core)
- **content bundling** (deck + assets)
- **room-scoped engagement** (reuse Deck Analytics)
- **room lifecycle** (draft → active → stalled → won/lost → archived)

**Not** relevant for V1: the page-builder, CRM sync, e-sign/order forms, the year-round hub. (See Phase 2.)

## What we play up (we're a presentation tool)

```
THEM: wrap a deck they didn't make (embed/link), let the seller build a page
US:   the deck is a LIVE NATIVE object, in an OPINIONATED templated room
```

- **Deck-native.** The most important object in the room (the deck) is ours — live, current, per-slide tracked. Theirs is a linked PDF.
- **Opinionated, not a builder.** We ship a well-designed room template; the seller drops content in. PAI makes the design calls — playing to our strength in opinionated layout, and killing the expensive off-brand page-builder surface.
- **Zero seam.** Make the deck → wrap it in a room → share, in one product.

---

## Touchpoints across the app

Entry from the **editor** and **dashboard**, not the create flow.

```
EDITOR                          DASHBOARD                        TOPBAR
[ Share ] ─► "Create deal room" "Deal rooms" tab (left nav)      🔔 bell
             from this deck      └ tiles, one per room            └ "room opened"
deck card ⋯ → Add to deal room  └ click a tile → room detail      └ "room stalled"
                                   (add deck/assets/MAP, invite,
                                    see engagement)
                                 + New deal room (empty → add deck)
```

**Dashboard placement (your direction):** a new **Deal rooms** tab in the left side-panel nav (sits beside Analytics). Landing = a **set of tiles, one per deal room**; click a tile to go *into* the room and make add-ons.

```
LEFT NAV                 DEAL ROOMS TAB (tiles)          ROOM DETAIL (inside)
─────────                ────────────────────            ─────────────────────
Home                     ┌────────┐ ┌────────┐           deck · assets · MAP
Created by Me            │ Acme   │ │ Globex │           invite · engagement
▸ Analytics              │ ●active│ │ ⚠stalld│    →      state (active/won/lost)
▸ Deal rooms ◄ new       └────────┘ └────────┘
Templates …              ┌────────┐ + New room
                         │ Initech│
                         │ ✓ won  │
                         └────────┘
```

---

## What content can go in a room?

The deck is native; everything else is an attachment. Analytics we can capture varies by type.

| Type | Examples | Analytics |
|---|---|---|
| **PAI deck** (native ★) | the pitch, the proposal | per-slide dwell, drop-off (full) |
| **PDF** | case study, one-pager, security doc, contract | per-page views (if rendered) |
| **Video** | uploaded, or embedded Loom / YouTube / Vimeo | watch % (embed-dependent) |
| **Image** | logos, screenshots, diagrams | viewed |
| **Link / URL** | external resource, scheduling link | click-through |
| **Document** | docx / pptx / xlsx as a downloadable file | opened / downloaded |

*(Later: native pricing table, e-sign order form — Phase 2.)*

---

## Room templates & theming

Two separate axes — keep them distinct in the design. Both are pre-made (no page building).

```
1. TEMPLATE = STRUCTURE    which blocks the room has + their order
2. THEME    = BRAND SKIN    colors · fonts · logo · cover style
```

### Structure templates (a few archetypes)

Opinionated layouts by deal shape (like the Brand Kit sample-deck archetypes — keep to a few). The seller picks one, then adds/removes/reorders blocks within it; never lays out a page from scratch.

```
TEMPLATE                 DEFAULT BLOCKS
──────────────────────────────────────────────────────────────
Standard deal room       cover · deck · pricing · case study · MAP
Lightweight / follow-up  cover · deck · next steps (mini-MAP)
Enterprise / security    cover · deck · security & legal · MAP · contacts
Renewal / expansion      cover · deck · results-so-far · MAP   (clone target)
```

**Hero content (Pitch-style).** One piece of content is the room's **hero** — featured up top, larger — and the rest sits beneath it, reorderable. The deck is the hero by default (it's what the room is built around), but the seller can promote any asset (e.g. a personalized video intro, or a case study for a warm referral). So the layout is: **1 hero + an ordered stack below**, not a flat grid — which keeps the room opinionated and focused rather than a wall of tiles.

### Theme = Brand Kit driven

Pitch ships room themes; ours are **Brand Kits**. The [[brand-kit]] payload already models `{ fonts, colors, logo }` at the workspace level, so the room theme just *reads the same kit* — no new theming system, same override the deck uses (font pairing + palette + logo).

```
THEME PICKER
  has Brand Kit(s)   → pick which kit → room adopts its colors/fonts/logo
  multiple kits      → picker (agency / multi-brand, e.g. Patagonia Sales)
  no Brand Kit       → a few neutral default themes (Pitch-style)
  smart default      → inherit the DECK's kit, so room + deck already match
                       (zero extra clicks on the common path)
```

**The smart default is the point:** if the deck was built with a Brand Kit, the room opens already wearing it. Picking a kit is only for overriding or the no-kit case. Guarantees the room and the deck it wraps are visually coherent, for free.

```
   Brand Kit ──┬──► the DECK's theme  (today)
               └──► the ROOM's theme  (new — same payload, same override)
```

---

## Phase 1 — features + user stories

Grouped by flow. Kept simple.

**Creating a room**
- As a seller, I can create a deal room from a deck (in editor or dashboard).
- As a seller, I can name the room for a specific account.
- As a seller, I can pick a room template — a structure archetype (no page building).
- As a seller, I can theme the room with one of my Brand Kits.
- As a seller with no Brand Kit, I can pick a default theme.
- As a seller, I get the room pre-themed to match the deck's Brand Kit by default.

**Adding content**
- As a seller, I can add my PAI deck to the room.
- As a seller, I can upload a PDF (case study, one-pager, security doc).
- As a seller, I can add a video (upload or embed a link).
- As a seller, I can add images.
- As a seller, I can add external links.
- As a seller, I can set one piece of content as the hero (featured) of the room.
- As a seller, I can reorder the other content beneath the hero.
- As a seller, I can remove content from the room.

**Mutual Action Plan**
- As a seller, I can add a checklist of next steps.
- As a seller, I can give each step an owner and a due date.
- As a seller, I can mark a step internal-only, hidden from the buyer.
- As anyone in the room, I can tick a step as done.
- As anyone in the room, I can comment on a step.
- As a seller, I can see a step flagged as blocked.
- As a seller, I can start the plan from a template.

**Sharing & access**
- As a seller, I can share one room link.
- As a seller, I can optionally ask viewers for their name (skippable).
- As a seller, I can optionally add a password (opt-in, per room).

**Managing rooms**
- As a seller, I can see all my rooms as tiles in the Deal rooms tab.
- As a seller, I can see each room's state and health (active / stalled).
- As a seller, I can mark a room closed-won.
- As a seller, I can mark a room closed-lost with a reason.
- As a seller, I can see engagement for the room (in-room analytics).
- As a seller, I can clone a room to start a renewal / new deal.

**Buyer experience**
- As a buyer, I can open the room link with no login.
- As a buyer, I can view the deck and all materials in one place.
- As a buyer, I can see the action plan and what's next.

---

## Phase 2 and beyond (directions, not stories)

- Salesforce / HubSpot sync — prefill a room from an Opportunity + write engagement back
- Proposal + e-signature / order forms signed in the room
- School B — onboarding / renewal hub; room converts sell → onboard → portal (Dock-style)
- Stakeholder-map visualization of the buying committee
- AI room autofill / per-account personalization
- Buyer-side comment threads / async Q&A
- Deal-room template library + MAP templates by deal type
- Sales Engineer POC rooms; CS onboarding rooms
- Scheduling / calendar embed; native pricing table

---

## Reference

### Room lifecycle

```
DRAFT ─► ACTIVE ⇄ STALLED ─► WON / LOST ─► ARCHIVED ─(clone)─► new DRAFT
        (auto-stall after     (lost logs      (read-only
         14d inactivity)       a reason)        record)
```

- **Active → Stalled** is automatic + reversible (catches the silent fizzle).
- **→ Lost** is explicit + captures a reason.
- **Won/Lost → Archived** freezes; **clone** seeds next year (School A).

### MAP item lifecycle

```
TODO ─► IN PROGRESS ─► DONE      (+ BLOCKED = visible risk, REMOVED = de-scoped)
attributes: owner (seller|buyer|both) · due date · visibility (shared|internal-only)
```

### Access & roles (flat buyer access — matches the norm)

Access default = **Level 1 skippable soft name prompt** (friction dial shared with [Deck Analytics](../deck-analytics/grounding.html); hard gates opt-in). Buyer side is **one flat tier** — anyone with the link views *and* interacts.

```
                        │ SELLER │ ANY BUYER-SIDE VIEWER (flat)
────────────────────────┼────────┼──────────────────────────────
view room + assets      │   ✓    │   ✓
view SHARED map rows    │   ✓    │   ✓
view INTERNAL rows      │   ✓    │   ✗   ← the one asymmetry
tick / comment          │   ✓    │   ✓
edit/reorder rows, state│   ✓    │   ✗
```
Champion vs committee is an *analytics label*, not an access tier.

### Design stance

Opinionated + templated (Pitch mold), **not** a drag-and-drop webpage builder (Qwilr/Trumpet). Room builder = pick a template + drop in content.

### Benchmarks

Design north star **Pitch**. **Recapped/Recall** = MAP mechanics. **Dock** = reference for the *deferred* scope (School B, order forms), not V1. Anti-examples: Qwilr/Trumpet/Flowla (builders). DocSend lives in Deck Analytics.

---

## Decided (locked calls)

| Question | Decision |
|---|---|
| **Roles** | Sales only (AE). SE / CS adjacent, Phase 2. |
| **Analytics** | Its own project; the room consumes a room-scoped slice. |
| **Salesforce sync** | V2, all tiers. V1 stands alone. |
| **Post-sale model** | School A (freeze + clone). Not the School B year-round hub. |
| **Brand lock** | Existing Brand Kit feature; not re-scoped. |
| **Deal death** | Stalled (auto) + Closed-lost (explicit, reason logged). |
| **Room creation point** | Default at demo → proposal boundary; power users earlier. |
| **MAP** | Full (owner · due · states · internal-only). Seller owns; buyer contributes. |
| **Buyer-side roles** | Flat — match the norm; champion = analytics label. |
| **Design approach** | Opinionated + templated, NOT a page builder. |
| **Dashboard home** | Own **Deal rooms** tab; tiles → room detail. |
| **Entry points** | Editor Share / deck menu + dashboard; not the create flow. |

## Open decisions (not V1-blocking)

- Exact **inactivity window** for auto-stall (placeholder: 14 days).
- Whether **hard gates** (email-verify / allowlist / password) land in V1.5 or V2.
- **Room template** set — how many layouts, how the seller picks.
- **MAP template** scaffold — what a default plan ships with.

## Where it maps to presentation-services (code reality)

**Not yet mapped.** Needs: a per-deal container object, the MAP data model, a room-scoped view of the analytics events (owned by Deck Analytics), the workspace / seat model for permissions. Trace in `presentation-services` alongside the Deck Analytics mapping.

## TODO / open threads

- [ ] **Map to `presentation-services`** — container object, workspace/seat model, deck + event references.
- [ ] Prototype **Room viewer (buyer)** — deck front and center, MAP as the spine, opinionated template.
- [ ] Prototype **Room builder (seller)** — pick-a-template + drop-in content.
- [ ] Prototype **Deal rooms tab** — tiles + room detail.
- [ ] Define the **MAP data model** spec.
- [ ] Design the **stalled → re-engage** nudge + **close-lost reason capture**.
- [ ] Decide the **room template** set.

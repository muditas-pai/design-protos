# Deal Room — grounding

**Type:** Shared grounding for this folder — reference, **not** source of truth · **Owner:** Mudita · **Updated:** 22 Jul 2026

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

- the **one-link-per-deal container** + a **simple next-steps checklist** (this is the core)
- **content bundling** (deck + assets, with a hero)
- **room-scoped engagement** (reuse Deck Analytics)
- **minimal room lifecycle** (draft → active → archived)

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

## Positioning (2×2)

A reference frame for where PAI sits and where these features move us. Axes chosen so **revenue is deliberately not one** (it's a lagging output, not a position):

```
X — MAKE the content ⟷ MOVE it       (creation ⟷ distribution & tracking)
Y — single artifact (point tool) ⟷   whole deal / revenue workflow (platform)
```

```
                    WHOLE DEAL / REVENUE WORKFLOW (platform)
                                   ▲
   ┌───────────────────────────────┼───────────────────────────────┐
   │  ░ WHITESPACE ░                │  Highspot · Seismic (enablmnt) │
   │  no deck-maker has a room —    │  PandaDoc · GetAccept (+e-sign)│
   │  the DEAL ROOM wedge           │  Trumpet·Aligned·Dock·Flowla·  │
   │  ↑ PAI heads up here           │  Recapped (DSR — deal workflow)│
 MAKE ─────────────────────────────┼───────────────────────────────── MOVE
   │ Pitch ··· Gamma · Beautiful.ai ····⟶ DocSend · Papermark       │
   │ (pure     Qwilr · Storydoc · ● PAI   (share + track one doc)   │
   │  create)  └─ ANALYTICS = table-stakes ─┘ (contested, not a wedge)│
   └───────────────────────────────┼───────────────────────────────┘
                                   ▼
                    SINGLE ARTIFACT (point tool)
```

**We sit bottom-left** with the deck-makers. Two different moves:

- **Analytics = table-stakes, not a wedge.** Gamma, Beautiful.ai and Qwilr already track — the creation corner has slid right into analytics. Ship it to complete the make→share→track loop and not look dated, but it won't differentiate PAI *from them*. (Beautiful.ai has even added Salesforce — the first step onto the diagonal.)
- **The Deal Room IS the wedge.** No deck-maker has a room + MAP; it's creation-side whitespace, *and* the move the DSRs can't easily counter (no native deck). PAI and the DSRs approach that space from **opposite corners** — they have the workflow but can't make a deck; we make the deck and add the workflow. Creation is the harder half to bolt on, so the creation corner is the stronger launch position.

---

## Touchpoints across the app

Entry from the **editor** and **dashboard**, not the create flow.

```
EDITOR                          DASHBOARD                        TOPBAR
[ Share ] ─► "Create deal room" "Deal rooms" tab (left nav)      🔔 bell
             from this deck      └ tiles, one per room            └ "room opened"
deck card ⋯ → Add to deal room  └ click a tile → room detail      └ "new viewer"
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
▸ Analytics              │ active │ │ quiet  │    →      (active / archived)
▸ Deal rooms ◄ new       │ 2d ago │ │ 15d ago│
Templates …              └────────┘ └────────┘
                         + New room  ("quiet" = passive age hint, not a state)
```

---

## Room anatomy (taxonomy)

The standard components of a deal room, synthesized across Pitch / Trumpet / Aligned / Dock. Read as **chrome** (structural, ~always there), **content blocks** (the body), and **optional widgets** (add as needed).

```
┌─────────────────────────────────────────────────────┐
│ [SellerLogo] ✕ [BuyerLogo]            👤👤 3 viewing │ ← co-brand header + presence
├─────────────────────────────────────────────────────┤
│ Acme × PAI — Evaluation                              │ ← title + description
│ Everything for our pilot, in one place.              │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │             HERO CONTENT  (the deck)            │ │ ← hero
│ └─────────────────────────────────────────────────┘ │
│  ▸ Pricing.pdf   ▸ Case study   ▸ Demo video        │ ← content list
├─────────────────────────────────────────────────────┤
│ NEXT STEPS      ☑ Kickoff   ☐ Security   ☐ Sign     │ ← next steps (simple checklist)
├─────────────────────────────────────────────────────┤
│ 👤 Your contact — Sam, AE   [✉ email] [📅 book call] │ ← contact widget
└─────────────────────────────────────────────────────┘
```

```
CHROME (structural)              CONTENT BLOCKS       OPTIONAL WIDGETS (Phase 2+)
─────────────────────            ──────────────       ──────────────────────────
co-brand header (seller×buyer)   hero content         welcome video · book-a-meeting
room title + description         content list         CTA button · FAQ / Q&A
presence / participants          next steps (MAP)     testimonials · customer logos
contact / rep card                                    case studies · pricing / proposal
                                                      security & compliance · team /
                                                      stakeholders · comments · process
                                                      timeline · downloads · e-sign
```

**Phase 1 taxonomy = the six essentials** (a complete, credible room, nothing more):

```
1 co-brand header   (seller × buyer logo)
2 title + description
3 presence          (avatars of who's in the room)
4 hero + content list
5 next steps        (the simple checklist)
6 contact card      (rep name / photo / email + book-a-call)
```

Everything in the optional column is Phase 2+, added as blocks when there's demand. **Book-a-meeting** is the first candidate to pull forward (advancing to the next conversation is the room's whole job).

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

## Room structure & theming

Two axes, kept distinct — both pre-made (no page building):

```
1. STRUCTURE   the room's blocks + their order
2. THEME       brand skin (colors · fonts · logo · cover style)
```

### Builder reference (Pitch, 21 Jul 2026)

Pitch's room builder — the seller edits the room in place. Left rail = message + **Action items** (their MAP) + **Resources** + **Get in touch** (contact); center = the **hero deck** with an **Add a highlight** grid beneath; top-right = presence, analytics, a **theme** control, Preview, Share.

**Theme popover** — presets (White · Light · Dark · Custom) + an accent-color picker. This is the lever we replace with **Brand Kits**: instead of loose presets, the room reads the deck's kit (fonts · palette · logo) so room and deck already match.

![Pitch room builder with the theme popover open — White / Light / Dark / Custom presets and an accent-color swatch, over a dark room with the hero deck and left-rail action items, resources, and contact](assets/pitch-room-builder-theme.png)

**Content grid** — hero deck up top, then a 2-up grid of additional "highlights" (another deck, an image). Note this is a **grid** beneath the hero; our stance keeps it a **single ordered stack** (1 hero + a reorderable list), more opinionated and focused than a wall of tiles. Their co-brand sits as two app icons top-left (here Pitch × LinkedIn).

![Pitch room builder with content filled — the Scale-Up Pitch Deck hero, a two-up grid of extra content tiles below (an Agency-name deck and a "The Shift" image), left rail with action items, resources, and contact](assets/pitch-room-builder-content.png)

### Phase 1: one default structure + hero content

Phase 1 ships **a single opinionated room layout** — no choice of structure templates yet (deferred, see below). The seller drops content into that one layout.

**Hero content (Pitch-style).** One piece of content is the room's **hero** — featured up top, larger — with the rest in an ordered, reorderable stack beneath, then the MAP. The deck is the hero by default (it's what the room is built around), but the seller can promote any asset (a personalized video intro, a case study for a warm referral). So the layout is **1 hero + an ordered stack**, not a flat grid — opinionated and focused, not a wall of tiles.

### Theme = Brand Kit driven (Phase 1)

Pitch ships room themes; ours are **Brand Kits**. The [[brand-kit]] payload already models `{ fonts, colors, logo }` at the workspace level, so the room theme just *reads the same kit* — no new theming system, same override the deck uses (font pairing + palette + logo).

```
THEME PICKER
  has Brand Kit(s)   → pick which kit → room adopts its colors/fonts/logo
  multiple kits      → picker (agency / multi-brand, e.g. Patagonia Sales)
  no Brand Kit       → a neutral default theme
  smart default      → inherit the DECK's kit, so room + deck already match
                       (zero extra clicks on the common path)
```

**The smart default is the point:** if the deck was built with a Brand Kit, the room opens already wearing it. Picking a kit is only for overriding or the no-kit case. Room + deck coherent, for free.

```
   Brand Kit ──┬──► the DECK's theme  (today)
               └──► the ROOM's theme  (new — same payload, same override)
```

### Deferred: structure templates (Phase 2/3)

A *choice* of layout archetypes by deal shape — not in Phase 1; one default layout covers the common case. Revisit later:

```
Standard deal room       cover · deck · pricing · case study · MAP
Lightweight / follow-up  cover · deck · next steps (mini-MAP)
Enterprise / security    cover · deck · security & legal · MAP · contacts
Renewal / expansion      cover · deck · results-so-far · MAP
```
Plus custom saved templates. Theming (Brand Kit) stays Phase 1; only the multi-structure picker is deferred.

---

## Phase 1 — features + user stories

Grouped by flow. Kept simple.

**Creating a room**
- As a seller, I can create a deal room from a deck (in editor or dashboard).
- As a seller, I can give the room a title and a short description.
- As a seller, I can set the co-brand header (my logo + the buyer's).
- As a seller, I can theme the room with one of my Brand Kits.
- As a seller with no Brand Kit, I can pick a default theme.
- As a seller, I get the room pre-themed to match the deck's Brand Kit by default.
- As a seller, I can add my contact card (name, photo, email, book-a-call).

**Adding content**
- As a seller, I can add my PAI deck to the room.
- As a seller, I can upload a PDF (case study, one-pager, security doc).
- As a seller, I can add a video (upload or embed a link).
- As a seller, I can add images.
- As a seller, I can add external links.
- As a seller, I can set one piece of content as the hero (featured) of the room.
- As a seller, I can reorder the other content beneath the hero.
- As a seller, I can remove content from the room.

**Next steps (simple checklist — the Phase 1 MAP)**
- As a seller, I can add a list of next steps.
- As a seller, I can edit or remove a step.
- As a seller, I can reorder the steps.
- As anyone in the room, I can tick a step as done.

*(Owners, due dates, blocked state, internal-only rows, and comments on a step → E2. See Phase 2.)*

**Sharing & access**
- As a seller, I can share one room link.
- As a seller, I can optionally ask viewers for their name (skippable).
- As a seller, I can optionally add a password (opt-in, per room).

**Managing rooms**
- As a seller, I can see all my rooms as tiles in the Deal rooms tab.
- As a seller, I can see when each room was last active (a passive age hint).
- As a seller, I can see engagement for the room (in-room analytics).
- As a seller, I can archive a room when I'm done with it.
- As a seller, I can clone a room to start a renewal / new deal.

*(Closed-won / closed-lost + reason capture → E2, when there's a reporting roll-up to feed.)*

**Buyer experience**
- As a buyer, I can open the room link with no login.
- As a buyer, I can view the deck and all materials in one place.
- As a buyer, I can see the action plan and what's next.

---

## Phase 2 and beyond (directions, not stories)

- **Rich Mutual Action Plan** — per-step owners, due dates, blocked state, internal-only rows, comments on a step (the full model, deferred from Phase 1)
- **Room lifecycle reporting** — closed-won / closed-lost + reason capture, once there's a roll-up to feed
- **Optional room widgets** — book-a-meeting, CTA button, welcome video, FAQ / Q&A, testimonials / customer logos, case studies, pricing / proposal, security & compliance, team / stakeholders, comments, process timeline, downloads
- Salesforce / HubSpot sync — prefill a room from an Opportunity + write engagement back
- Proposal + e-signature / order forms signed in the room
- School B — onboarding / renewal hub; room converts sell → onboard → portal (Dock-style)
- Stakeholder-map visualization of the buying committee
- AI room autofill / per-account personalization
- Room **structure templates** — a choice of layout archetypes by deal shape (Standard / Lightweight / Enterprise / Renewal), plus custom saved templates
- MAP templates by deal type
- Sales Engineer POC rooms; CS onboarding rooms

---

## Reference

### Room lifecycle (Phase 1 — minimal)

```
DRAFT ─► ACTIVE ─► ARCHIVED ─(clone)─► new DRAFT
building  shared   seller shelves it manually (read-only record)
```

- No Won / Lost / reason capture in Phase 1 — those are reporting value, not user value (→ E2).
- "Quiet for N days" is a **passive age hint** on the tile, not a formal Stalled state.
- **Clone** seeds the next deal / renewal (School A).

### Next steps — the Phase 1 MAP (simple list)

```
a single ordered list of steps ·  each step: a title + done/not-done
seller edits the list · a viewer can tick a step, but ticking is attributable
(the tick captures who — see Access & roles → "ticking = the moment identity is required")
```

E2 adds the rich model: per-step owner · due date · BLOCKED state · internal-only visibility · comments. Once steps have **owners**, only the assigned person completes their step, and seller-side steps ("Send security docs" — rep ticks) split from buyer-side steps ("Complete internal review" — buyer ticks).

### Access & roles (the governance boundary is look ⟷ act, not champion ⟷ viewer)

Access default = **Level 1 skippable soft name prompt** (friction dial shared with [Deck Analytics](../deck-analytics/grounding.html); hard gates opt-in). Buyer side is **one flat tier** — anyone with the link views *and* interacts. **No buyer ever logs into PAI** (confirmed universal norm — [see benchmark](#roles--access-benchmark-22-jul-2026)).

But "flat interaction" does **not** mean anonymous ticking. The governance line is drawn between **viewing** (frictionless, anonymous OK) and **acting** (must be attributable to a person):

```
                        │ SELLER │ ANY BUYER-SIDE VIEWER (flat)
────────────────────────┼────────┼──────────────────────────────
view room + assets      │   ✓    │   ✓   (anonymous is fine)
view next steps         │   ✓    │   ✓   (anonymous is fine)
tick a step             │   ✓    │   ✓   ← but the tick captures WHO (see below)
edit content / steps    │   ✓    │   ✗
archive / clone room    │   ✓    │   ✗
```

Champion vs committee is an *analytics label*, not an access tier. (Internal-only rows arrive with the rich MAP in E2.)

**Ticking = the moment identity is required (the Phase 1 governance model).** Governance in a no-login world isn't a role gate or a login — it's **attribution**. You don't gate *who* is allowed to tick up front; you make every tick *attributable* after the fact. Viewing stays anonymous; the act of ticking is what triggers identity capture, just-in-time, at the point of consequence rather than at the door:

```
Anonymous viewer taps a checkbox
        │
        ▼
┌─────────────────────────────────────────────┐
│  You're marking "Security review" done.      │   ← just-in-time prompt
│  Who should we say completed it?             │     (name; email if the dial wants)
│  [ Name ______ ]                             │     remembered for the visit
└─────────────────────────────────────────────┘
        │
        ▼
☑ Security review · completed by Sam (Meridian) · 3 Jul   ← stamped · visible · reversible
```

Why this beats both alternatives:

- **vs. flat anonymous ticking** — closes the accountability hole (a forwarded link can no longer tick as a ghost; every tick is named + timestamped, visible to the seller and in analytics).
- **vs. champion-only ticking** — a champion-only gate breaks the room's whole job (the champion circulates it so committee members act). No incumbent enforces it. Look-vs-act keeps committee action open while still naming who acted.
- **Reversible + auditable** — a tick isn't destructive; the seller (and the person who ticked) can un-tick. Lower stakes than a hard gate implies, which is why door-level gating is overkill.
- **The identity captured at first tick is the same one that powers the domain-inference label** (§ below) — so ticking naturally sorts people into same-company stakeholder vs external.

**The seller's ticking dial (Share panel, next to the viewing dial).** How much identity a tick demands is the seller's call:

```
WHO CAN TICK           friction
─────────────────────  ────────
Anyone (just a name)   ● default   ← low, but every tick is still named
Verified email                     ← medium
Only the buyer domain              ← high (locks out personal emails / forwards)
Only the step's owner  (E2)        ← needs the rich MAP (per-step owners)
```

**Defining "the buyer team" — infer, don't gate.** Don't force a work-email domain to define who's on the buyer side. Default stays anonymous / soft name. When a seller *does* turn on email capture, match the entered domain against the buyer company (already known from the co-brand header) to label people **same-company stakeholder** vs **external / personal-email** — an analytics label, for free, with no hard gate. Anonymous stays the default; the seller who wants attribution turns the dial up.

**Seller side — flat team edit (Phase 1).** Anyone on the seller workspace can edit any deal room (matches Pitch's shared-workspace model). Trumpet and HubSpot default *tighter* (owner-scoped, opt into team sharing) to stop reps clobbering each other's live deals at scale — so **owner-scoping is the E2 lever** if large teams ask. Cheap to tighten later, painful to loosen, so ship flat.

**The hard email gate (reference · Pitch, 21 Jul 2026).** The opt-in top of the friction-dial: when a room requires an email, the buyer hits a full-screen threshold *before* the room renders. Pitch's version:

![Pitch's email gate — a floating lock illustration on a bare black canvas, "This room requires you to enter an email to open", a consent line, an email field, a "Remember for next visit" checkbox, and an "Agree and continue" button](assets/pitch-email-gate.png)


```
[ 🔒 lock ]           on a bare black canvas, no room context
This room requires you to enter an email to open
Your email will be shared with the creator of this room and their collaborators.
[ Email ______________ ]
[✓] Remember for next visit
[ Agree and continue ]
```

- one email field · an explicit **consent line** (email shared with creator + collaborators) · a **remember-me** toggle so it's a one-time cost · a single continue action.

Our take (**not built** — this is the deferred hard gate, see Open decisions):

- **Show the room, then ask.** Put the **co-brand header + room title above the field** so it reads as a threshold into a *named space* (Vantage × Meridian), not an anonymous paywall. Pitch's naked lock throws away the one thing we have that they don't: a branded, deck-native room.
- **Navy action button** (brand: navy = action), not an indigo fill.
- The email captured here becomes the viewer's **identity for room-scoped analytics** — it's what turns an anonymous viewer into the champion / committee label.
- Keep the consent line honest and the remember-me default on. (Screenshot on file: `assets/pitch-email-gate.png`.)

### Room link options (the Share panel · Pitch reference)

Everything the seller sets on the room's shareable link lives in **one panel** (Pitch calls it "Link to <room>"). Two groups: **analytics** (what the room collects) and **access** (the friction-dial). The reference set, from Pitch's link modal (21 Jul 2026):

```
URL                              editable slug → full link preview
─ Analytics ─
Collect engagement analytics   ● on    visit duration · per-slide drop-off · attachment clicks
Get visitor consent            ○ off  (ⓘ) show a consent prompt before tracking
─ Access ─
Require passcode               ○ off
Require visitor email          ● on
```

Our take:

- **Collect engagement analytics** is the master switch, **on by default** — the room is a tracked surface. Analytics itself is owned by [Deck Analytics](../deck-analytics/grounding.html); the room just flips collection on its link and reads the room-scoped slice. Off = a plain, untracked share.
- **Consent** is a *child* of collect: it dims/disables when collect is off. On = the viewer sees a consent prompt before any tracking (GDPR / privacy-sensitive deals); off = silent tracking, the seller's call.
- Sits in the **same panel as the access friction-dial** (soft name prompt default · email gate · passcode), so the seller tunes "how much do I ask / how much do I watch" in one place.
- **Baked into `room-builder.html`** — the Share slide-over now leads with an Analytics group, then Access.

### Design stance

Opinionated + templated (Pitch mold), **not** a drag-and-drop webpage builder (Qwilr/Trumpet). Room builder = pick a template + drop in content.

### Benchmarks

Design north star **Pitch**. **Recapped/Recall** = MAP mechanics. **Dock** = reference for the *deferred* scope (School B, order forms), not V1. Anti-examples: Qwilr/Trumpet/Flowla (builders). DocSend lives in Deck Analytics.

### Roles & access benchmark (22 Jul 2026)

Benchmarked Pitch, HubSpot, Trumpet, Aligned on buyer access + who-can-tick + seller/team scope. **Three things are unanimous:** no buyer ever logs into the vendor's product (anonymous link is the floor); identity (email/domain) is an opt-in dial the seller turns up, never forced by default; interaction (tick/comment/upload) is not gated behind a *role* — nobody restricts ticking to "the champion."

| | Buyer login? | Identity gates (opt-in, on top of anon) | Who ticks MAP steps | Champion vs others |
|---|---|---|---|---|
| **Pitch** | Never | email · passcode · expiry (no domain on view links) | view-only on open links; comment needs a guest invite | no buyer-side roles |
| **Trumpet** | Never | No-email / Email / Verified-email · password · expiry · per-recipient links | **any viewer, no account**; each step has an owner (buyer or seller); "Control permissions" setting | no formal champion role |
| **HubSpot** | Never | email-gate only (ties view → CRM contact); no passcode/domain | **native: none** — buyer interactivity is all third-party (Arrows/GetAccept) | none native |
| **Aligned** | Never | password · email-verify · email/domain whitelist · SSO (ent) | **two-sided MAP** — both sides assign & complete tasks, no login | **champion is first-class** (champion workflows), surfaces known vs new stakeholders; not a hard gate |

**What we took from it:** confirmed no-login for buyers; kept the flat buyer tier; but moved the governance boundary to **look ⟷ act** (ticking captures identity) rather than leave ticking anonymous — a genuinely better default than the flat benchmark, not a compromise. Seller side: flat team edit (Pitch model) for Phase 1; owner-scoping (Trumpet/HubSpot default) is the E2 lever.

---

## Decided (locked calls)

| Question | Decision |
|---|---|
| **Roles** | Sales only (AE). SE / CS adjacent, Phase 2. |
| **Analytics** | Its own project; the room consumes a room-scoped slice. |
| **Salesforce sync** | V2, all tiers. V1 stands alone. |
| **Post-sale model** | School A (freeze + clone). Not the School B year-round hub. |
| **Brand lock** | Existing Brand Kit feature; not re-scoped. |
| **Room lifecycle** | Minimal: Draft → Active → Archived (+ clone). No Won/Lost/reason in Phase 1 (→ E2); "quiet" is a passive age hint, not a state. |
| **Room creation point** | Default at demo → proposal boundary; power users earlier. |
| **MAP (next steps)** | **Simplified to a single checklist** for Phase 1: title + done, seller edits. Rich model (owners · due · blocked · internal-only · comments) → E2. |
| **Who can tick a step** | **Look ⟷ act boundary:** viewing is anonymous-OK; **ticking captures identity** (name; email per dial), stamped + reversible. Not champion-only, not anonymous. Seller has a ticking dial (anyone-named → verified email → buyer domain → step owner [E2]). |
| **Room anatomy** | Phase 1 chrome = co-brand header · title + description · presence · hero + content list · next steps · contact card. Optional widgets (book-a-meeting, video, CTA, FAQ, testimonials, security, team, comments, timeline) → Phase 2. |
| **Buyer-side roles** | Flat — match the norm; champion = analytics label. "Buyer team" is **inferred** (email domain vs co-brand buyer), never a hard gate. No buyer login. |
| **Seller-side roles** | **Flat team edit** (Pitch model) for Phase 1 — anyone on the workspace edits any room. Owner-scoping → E2 lever. |
| **Design approach** | Opinionated + templated, NOT a page builder. |
| **Dashboard home** | Own **Deal rooms** tab; tiles → room detail. |
| **Entry points** | Editor Share / deck menu + dashboard; not the create flow. |

## Open decisions (not V1-blocking)

- The **"quiet" threshold** — how many days of no activity before the tile shows the age hint.
- Whether **hard gates** (email-verify / allowlist / password) land in V1.5 or V2.
- Whether **book-a-meeting** gets pulled into Phase 1 (the strongest optional widget).
- What the **single default room layout** looks like (the one Phase 1 structure).

## Where it maps to presentation-services (code reality)

**Not yet mapped.** Needs: a per-deal container object, the MAP data model, a room-scoped view of the analytics events (owned by Deck Analytics), the workspace / seat model for permissions. Trace in `presentation-services` alongside the Deck Analytics mapping.

## TODO / open threads

- [ ] **Map to `presentation-services`** — container object, workspace/seat model, deck + event references.
- [ ] Prototype **Room viewer (buyer)** — deck front and center, MAP as the spine, opinionated template.
- [x] Prototype **Room builder (seller)** — WYSIWYG inline canvas (`room-builder.html`, 21 Jul 2026): all six Phase-1 essentials, live Brand-Kit re-skin, share friction-dial.
- [ ] Prototype **Deal rooms tab** — tiles + room detail.
- [ ] Define the **MAP data model** spec.
- [ ] Design the **stalled → re-engage** nudge + **close-lost reason capture**.
- [ ] Decide the **room template** set.

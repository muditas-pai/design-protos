# Deck Analytics — grounding

**Type:** Shared grounding for this folder — reference, **not** source of truth · **Owner:** Mudita · **Updated:** 21 Jul 2026

Engagement analytics for **any shared deck, on any channel**. Analytics is the engine; the [Deal Room](../deal-room/grounding.html) is one consumer of it. This doc owns the tracked-link + identity + event-capture + dashboard layer.

---

## Who is this for?

Relevant to **three roles**, all *after* a deck exists and *when the user signals intent to share* (the Share button). Not part of the create flow.

| Role | What they share | What analytics gives them |
|---|---|---|
| **Sales** | proposals / decks to prospects (deal room, cold email, follow-up) | who engaged, forwarding, which slides — time follow-ups, gauge deal health |
| **Marketing** | published / broadcast decks (social, campaigns, embeds, newsletters) | reach, source, geo, completion — what content lands |
| **Leadership** | (portfolio view) team + content performance | which decks / teams perform — the roll-up (mostly Phase 2) |
| *Founders (adjacent)* | investor decks / fundraising sends | who opened, forwarded to partners, dwell on traction — fundraising signal |

**When it's relevant:**

```
CREATE FLOW  →  deck exists  →  user hits SHARE  ←── the signal that turns analytics on
(not here)                       │
                                 └─ a tracked link is born → analytics starts
```

---

## Who are the incumbents?

**DocSend** (Dropbox) is the canonical reference. **Pitch** ships share-link analytics on presentations. **Papermark** (open-source DocSend). Every DSR (Trumpet, Aligned) bundles engagement tracking too.

## What are they doing?

- **Tracked links** — a shareable link per doc/deck instead of an attachment.
- **Page/slide-level analytics** — time per page, drop-off, completion.
- **Per-viewer identity** (opt-in) — require email; see who viewed.
- **Forwarding signal** — a new viewer/domain = the deck traveled.
- **Link controls** — expiry, passcode, download on/off.
- **Notifications** — "someone viewed your doc."

## What's relevant to us?

Basically all of it — this *is* the feature. The parts we take:

- tracked link per deck, per-slide dwell + drop-off, completion
- per-viewer identity when known; **forwarding / new-viewer detection** (the flagship)
- aggregate reads for public decks (views, source, geo)
- link controls (expiry, revoke, download toggle) — gates opt-in, low by default
- first-open + new-viewer notifications

## What we play up (we're a presentation tool)

```
THEM: analytics on a deck they didn't make (a linked PDF they can't see into)
US:   analytics on a LIVE, NATIVE PAI deck we own end-to-end
```

- **Per-slide is native, not bolted on.** We already emit slide-level events — competitors reverse-engineer page views from a PDF; we have the real thing.
- **One surface: make → share → track.** No export, no second tool. The Share button on the deck you just built starts the analytics.
- **Distribution-agnostic from day one.** Same tracked link serves a social post, a cold email, and a deal room — because we own the deck object across all of them.

---

## Touchpoints across the app

Entry is from the **editor** and **dashboard**, never the create flow. The **Share button is the primary signal.**

```
EDITOR                         DASHBOARD                         TOPBAR
[ Share ] ─► create tracked    "Analytics" tab (left nav)        🔔 bell
             link (analytics    └ snapshot: recently frequented   └ "X opened
             begins)              / shared decks + mini-stats        your deck"
[ ⋯ ] View analytics           └ click a deck → deep view         └ "forwarded to
                                  (per-slide heat, drop-off,          a new viewer"
                                  who, source, timeline)
deck card ⋯ menu → View analytics (from any deck list)
```

**Dashboard placement (your direction):** a new **Analytics** tab in the left side-panel nav (sits with Home · Created by Me). Landing = a **snapshot of your most recently frequented decks** with at-a-glance stats; click a deck to open its **deep view**.

```
LEFT NAV                 ANALYTICS TAB (landing)              DEEP VIEW (per deck)
─────────                ────────────────────────            ─────────────────────
Home                     ┌─ Acme pitch   ▁▃▅ 42 views ─┐     who · when · per-slide
Created by Me            ├─ Q3 board deck ▁▁▂ 8 views  ─┤ →   heat · drop-off curve
▸ Analytics  ◄ new       └─ Cold outreach ▅▅▇ 130 views┘     · source · open timeline
▸ Deal rooms ◄ new       (recent / frequented snapshot)
Templates …
```

---

## Phase 1 — features + user stories

Grouped by flow. Kept deliberately simple.

**Sharing a deck (creating a tracked link)**
- As a user, I can hit Share on my deck to create a trackable link.
- As a user, I can set the link to expire, or revoke it.
- As a user, I can allow or block PDF download.
- As a user, I can optionally ask viewers for their name (skippable).

**Seeing a deck's analytics**
- As a user, I can see how many people viewed my deck (and how many unique).
- As a user, I can see which slides they spent time on.
- As a user, I can see the drop-off — where people stopped.
- As a user, I can see the completion rate.
- As a user, I can see *who* viewed it, when their identity is known.
- As a user, I can see when a new/unknown viewer opened it (it was forwarded).
- As a user, I can see where views came from (source + geo) for public decks.

**Getting notified**
- As a user, I get notified when someone first opens my deck.
- As a user, I get notified when a new/unknown viewer opens it.

**Finding analytics in the app**
- As a user, I can open an Analytics tab in the dashboard.
- As a user, I can see my recently shared / frequented decks at a glance.
- As a user, I can click a deck to open its deep analytics.
- As a user, I can open a deck's analytics from its card menu.

---

## Phase 2 and beyond (directions, not stories)

- CRM write-back — engagement logged to Salesforce / HubSpot
- Team + account roll-up; leadership performance dashboards
- A/B deck comparison
- Predictive intent / deal scoring
- Session replay / scrub of a viewing session
- Verified email gate (Level 3), allowlist / SSO, password
- Per-recipient tracking for marketing broadcasts (UTM stitching)
- "Your decks" benchmarks (this deck vs your average)
- Deeper per-content-type analytics (video watch %, PDF page depth)

---

## Reference

### Identity is inverse to reach

```
REACH   large  ●──────────────────────────────●  small
IDENTITY anonymous ●────────────────────────●  fully known

 public/social  marketing  embed  cold email  investor  deal room
 └── AGGREGATE reads ────────────┘  └──── PER-PERSON reads ────┘
    "how many, from where"            "who, which slide, forwarded?"
```

### Distribution taxonomy (channels a deck travels)

Deal room · public/social post · cold email (1:1) · investor send · embed (site/blog/Notion) · marketing broadcast (list/newsletter/link-in-bio) · post-meeting follow-up · in-person/QR. Same events; identity + gating shift per channel.

### Two read models

- **Aggregate** (public end) — views, unique visitors, source, geo, drop-off, completion.
- **Per-person** (targeted end) — who opened, per-slide dwell, revisits, forwarding.

### Metrics catalogue

```
UNIVERSAL     opens · unique viewers · per-slide dwell · completion %
              · drop-off curve · device · geo · source/referrer
PER-PERSON    who · their dwell · revisits · forwarding/new-viewer · CTA clicks
DERIVED       downloads (if allowed) · time-to-open (send → first view)
```

### Access friction dial (shared with rooms)

```
L0 open link · L1 soft name (skippable) · L2 email capture · L3 email verify
· L4 allowlist/SSO · L5 password
```
Gates fight forwarding (the best signal), so V1 keeps them **opt-in**, defaults low, never forces identity. Matches Pitch/Trumpet/Aligned.

---

## Decided (locked calls)

| Question | Decision |
|---|---|
| **Ships first, standalone** | Before the deal room; live value on any shared deck; de-risks the pipeline. |
| **Roles** | Sales · Marketing · Leadership (+ Founders adjacent). |
| **Two read models** | Aggregate (public) + per-person (targeted) over one event stream. |
| **Email gate** | Skipped in V1; no verified gate on any channel. |
| **Anonymous viewing** | Allowed everywhere; identity is never a wall. |
| **Forwarding detection** | In scope, V1, non-negotiable. |
| **Reuse existing events** | Build on PAI's slide-view instrumentation; extend, don't rebuild. |
| **Dashboard home** | Own **Analytics** tab in the left nav; landing = recent-decks snapshot → deep view. |
| **Entry points** | Editor Share button (primary signal) + dashboard; not the create flow. |

## Open threads / TODO

- [ ] **Map to `presentation-services`** — slide-view / deck-share event schema, share-link primitive, notification plumbing.
- [ ] Define **per-slide dwell** (active-tab time vs raw; slide left open).
- [ ] Design the **share dialog** (likely the first spec).
- [ ] Design the **Analytics tab** — recent-decks snapshot + the deep per-deck view.
- [ ] Define **forwarding / new-viewer detection** mechanics without a hard gate.
- [ ] Decide **UTM / source attribution** for public + marketing channels.
- [ ] Confirm the **anonymous → known** identity-stitch model.

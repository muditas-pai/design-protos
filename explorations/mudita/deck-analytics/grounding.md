# Deck Analytics — grounding

**Type:** Shared grounding for this folder — reference, **not** source of truth · **Owner:** Mudita · **Updated:** 21 Jul 2026

Engagement analytics for **any shared deck, on any channel** — not just decks inside a deal room. Split out of the Deal Room project on 21 Jul 2026 because analytics is the **engine** that serves many deck use cases (public posts, cold email, investor sends, embeds, and deal rooms alike); the deal room is just one consumer. This folder owns the tracked-link + identity + event-capture + dashboard layer. The room-specific work lives in the [Deal Room grounding](../deal-room/grounding.html).

---

## The core idea

One engine, many surfaces. PAI already emits **slide-level view events** (the same instrumentation the dashboards read), so this is largely *surface + attribute* rather than a new pipeline.

```
                ┌─────────────────────────────┐
                │   DECK ANALYTICS (engine)   │
                │  tracked link · identity ·   │
                │  event capture · dashboard   │
                └──────────────┬──────────────┘
        one consumer among many │
   ┌───────────┬───────────┬────┴─────┬───────────┬──────────┐
   ▼           ▼           ▼          ▼           ▼          ▼
 deal room  public /   cold email  investor    embed     marketing
            social post            send                  broadcast
```

---

## Where decks travel (distribution taxonomy)

The relevant use cases for a shared deck, and what analytics means for each. Identity and gating shift by channel; the underlying events are the same.

| Distribution mode | Audience | Identity | Analytics that matter | Gating |
|---|---|---|---|---|
| **Deal room** | 1:few, named account | per-person | who opened, per-slide dwell, **forwarding**, MAP-linked engagement | soft prompt (default) |
| **Public / social post** | broadcast, anonymous, large | none | views, unique visitors, source/referrer, geo, slide drop-off, completion | none |
| **Cold email (1:1 outbound)** | one recipient (you know who you sent to) | known-ish | opened?, which slides, revisits, forwarded? | none / soft |
| **Investor send (fundraising)** | a few named investors | per-person, high stakes | who opened, forwarding to partners, dwell on traction/financials, revisits | often email/soft |
| **Embedded (site / blog / Notion)** | site visitors, anonymous | none | in-context impressions, engagement, drop-off | none |
| **Marketing broadcast (list / newsletter / link-in-bio)** | large list, semi-known | aggregate (+ optional per-recipient via UTM) | opens, source, geo, completion | none |
| **Post-meeting follow-up** | the people in the meeting | known | revisits, which slides re-opened, forwarding | none / soft |
| **In-person / QR / event** | attendees, anonymous | none | scans, geo, device, completion | none |

---

## Identity is inverse to reach

The organizing principle. The more public a deck, the less you can (or need to) know who is viewing — so the *read model* slides from aggregate to per-person along the same axis.

```
REACH   (how many)   large  ●──────────────────────────────●  small
IDENTITY (who)       anonymous ●────────────────────────●  fully known

  public/social   marketing   embed   cold email   investor   deal room
  ●──────────────●──────────●───────●───────────●──────────●
  └─ AGGREGATE reads ─────────────┘   └──── PER-PERSON reads ────┘
     "how many, from where,              "who, which slide,
      how far did they get"               did they forward it"
```

**Two read models over one event stream:**

- **Aggregate** (public end) — counts anonymous activity: views, unique visitors, source, geo, drop-off, completion.
- **Per-person** (targeted end) — attributes activity to people: who opened, their per-slide dwell, revisits over time, forwarding / new-viewer detection.

---

## Metrics catalog (what we can measure)

```
UNIVERSAL (any mode, even anonymous)
  opens / views · unique viewers · per-slide dwell · completion %
  · slide drop-off curve · device · geo · source / referrer
PER-PERSON (when identity is known)
  who opened · their per-slide dwell · revisits over time
  · forwarding / new-viewer detection · CTA / link clicks
CONTROLS-DERIVED
  downloads (if allowed) · time-to-open (send → first view)
```

**Forwarding / new-viewer detection is the flagship signal** and non-negotiable for V1: a viewer on an email domain the owner has not seen means the deck traveled to someone new (up a buying committee, out to an investor's partners). It is the single most valuable thing analytics surfaces.

---

## The engine (shared foundation, build once)

```
tracked link + access control  → per-share link, gate, expiry, revoke
viewer identity model          → anon → soft-named → email-known → returning
event capture pipeline         → open, slide-view, dwell, completion, download,
                                 CTA-click  (PAI already emits slide events)
notification service           → "opened", "new viewer / forwarded", milestones
```

---

## Link access controls (the friction dial)

Access is a per-share dial the owner sets; the default varies by channel. Public posts sit at Level 0; a deal room defaults to Level 1 (see Deal Room grounding).

```
LEVEL 0  anyone with the link       zero friction, fully anonymous
LEVEL 1  name prompt (soft)         "who's viewing?" self-declared, skippable
LEVEL 2  email capture (soft gate)  enter email to view, not verified
LEVEL 3  email verification (OTP)   code to inbox → verified identity
LEVEL 4  allowlist / SSO            only invited addresses / domains
LEVEL 5  password / passcode        shared secret, no identity
```

**The tension: gating fights forwarding, and forwarding is the best signal.** Hard gates (3–5) suppress the forward you most want to detect. So V1 keeps gates **opt-in**, defaults low, and never forces identity. This matches Pitch / Trumpet / Aligned (all open-by-default, gates opt-in).

---

## Surfaces to design

```
1  Share dialog        — create a tracked link for a deck; pick access level,
                         expiry, download toggle. One dialog, any channel.
2  Analytics dashboard — per deck: aggregate summary + per-person list (when
   (per deck)            identity), per-slide heat, drop-off curve, source
                         breakdown, open timeline.
3  Notifications        — first open, new-viewer / forward, milestones (in-app + email).
```

The deal room surfaces its **own room-scoped slice** of this dashboard inside the room — same data, filtered to the deal (see Deal Room grounding).

---

## V1 scope

| In V1 | Out (later) |
|---|---|
| tracked share link per deck (any channel) | CRM write-back (V2) |
| aggregate reads (views, unique, source, geo, drop-off, completion) | A/B deck comparison |
| per-person reads when identity known | predictive deal / intent scoring |
| per-slide dwell + revisits | session replay / heatmap scrub |
| **forwarding / new-viewer detection ★** | multi-deck / account roll-up |
| link controls: expiry, revoke, download toggle | verified email gate (Level 3) |
| optional skippable soft name prompt (Level 1) | allowlist / SSO / password (Levels 4–5) |
| owner notification on first open + new viewer | |
| per-deck analytics dashboard (owner-only) | |

---

## Decided (locked calls)

| Question | Decision |
|---|---|
| **Ships first, standalone** | Analytics ships before the deal room — it is live value on any shared deck, and de-risks the tracking pipeline. The room reuses it whole. |
| **Two read models** | Aggregate (public/anonymous) + per-person (targeted/identified) over one event stream. Read model follows the channel, not a separate build. |
| **Email gate** | **Skipped in V1.** No verified email gate on any channel. |
| **Anonymous viewing** | **Allowed** everywhere. Identity is a nice-to-have, never a wall. |
| **Forwarding detection** | In scope, V1, non-negotiable — the signal that justifies the feature. |
| **Reuse existing events** | Build on PAI's existing slide-view instrumentation; extend, don't rebuild. |
| **Distribution-agnostic** | One tracked-link + dashboard model serves deal room, public/social, cold email, investor send, embed, marketing — not a per-channel product. |

---

## Open threads / TODO

- [ ] **Map to `presentation-services`** — the existing slide-view / deck-share event schema (what's emitted, keyed how), whether a shareable-link primitive exists, notification plumbing.
- [ ] Decide the **per-slide dwell** definition (active-tab time vs raw time; how to handle a slide left open).
- [ ] Design the **share dialog** (Feature spec 1 — likely the first spec, since analytics ships first).
- [ ] Design the **per-deck analytics dashboard** — aggregate + per-person, per-slide heat, drop-off curve.
- [ ] Define **forwarding / new-viewer detection** mechanics (how a new identity on a link is detected without a hard gate).
- [ ] Decide **UTM / source attribution** handling for the public + marketing channels.
- [ ] Confirm the **anonymous → known** identity-stitch model (does a soft-named viewer merge with a later verified one).

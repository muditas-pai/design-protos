# Feature Nudge System — Spec

**Owner:** Mudita · **Drafted:** 3 Jul 2026 · **Status:** v0 draft for eng/DS review

**Primary goal:** boost payment conversions.
**Secondary goal:** discoverability of new features.

Grounding: **[first-session-qualification](../resources/investigations/first-session-qualification/first-session-qualification.md)** — first-hour behaviour + signup context predicts 7-day conversion (ROC-AUC ≈ 0.88, PR-AUC ≈ 0.17 — ranking is trustworthy, absolute P is not). Interactive: [Feature → P explorer](../resources/investigations/first-session-qualification/engineering/feature-p-explorer-preconv.html) (pre-conversion model, the trustworthy one). Companion explainer: [understanding-auc-and-p](../resources/articles/understanding-auc-and-p/understanding-auc-and-p.md). Also on GitHub: [resources/investigations/first-session-qualification](https://github.com/dhruv-saxena/PAI/tree/main/resources/investigations/first-session-qualification).

---

## 1. Core principles

1. **Propensity ≠ persuadability.** High-P users often convert anyway. The target is the *persuadable middle* — real intent + a stall. Only an uplift A/B proves a nudge works; the system ships as an experiment from day one.
2. **A score crossing a line makes a nudge *eligible*. A gated decision at a completed-action seam makes it *shown*.** Nothing fires on threshold-crossing.
3. **Relevance decides which. Arbitration decides which one. Governance decides whether and when.**
4. **Not nudging is a first-class outcome.** High P + no router match → hold, stay armed, log the gap.
5. **Spend the least loudness that lands the message.**

---

## 2. Architecture

```
 events ──► SCORER ──► P ──► worth nudging? (gate) ─────────┐
                                                            ▼
 curated intent signals ──► ROUTER (per-nudge want scores) ──► ARBITRATION ──► GOVERNANCE ──► 1 slot
                                                              (pick ≤1)       (caps,          in UI
 static profile ──► fallback only                                              cooldowns,
                                                                               seams)
```

| Layer | Job | Notes |
|---|---|---|
| **Scorer** | *whether* this user is worth a nudge | The P model. All predictive features allowed, including engagement proxies (language select, session time). **v3 — not on the v1 critical path** (see §8). |
| **Router** | *which* nudge | Per-nudge "want scores" bumped by curated intent events. A feature is admitted only if it passes the JTBD test: *"does doing X reveal a job a paid feature satisfies?"* Engagement proxies barred. v1 = deterministic rules emitting scores; v2 = weighted accumulator with time-decay, trained on v1 instrumentation. |
| **Arbitration** | *which one* | Highest want-score wins. Structurally emits ≤ 1. Tiebreak: conversion candidate beats discoverability candidate. |
| **Governance** | *whether / when* | Caps + seams + memory (§6). Sits above all content logic. |

---

## 3. Nudge catalog

| Nudge | Trigger signals (router) | JTBD | Min. vessel | First-session? |
|---|---|---|---|---|
| **Export editable PPT** | export click / export-paywall hit | "I need this in PowerPoint" | one-liner | ✅ **v1** |
| **Remove P.AI branding** | published link, shared externally, export done | "this goes to a client/audience" | one-liner | ✅ **v1** |
| **Invite a teammate** | shared deck, team/company email domain, manager+ role | "this is a team deck" | one-liner | ✅ |
| **Set up a Brand Kit** | manual re-styling (colours/fonts), logo upload, marketing role | "must look on-brand" | demo/video | ✅ |
| **Use better AI models** | regen loops, prompt re-edits (quality churn) | "output isn't good enough" | one-liner + example | ✅ |
| **Analyze performance** | shared/published earlier, returned to check | "did people engage?" | short demo | later lifecycle |
| **Update data weekly** | inserted charts/data, finance/ops role, repeat visits | "recurring report" | short demo | later lifecycle |
| **Set up knowledge graph** | multiple doc uploads, heavy doc-to-deck | "feed it my knowledge" | demo/video | later lifecycle |
| **Hire an expert** | struggle signals (regen loops + abandons) at high-stakes role | "just do it for me" | rich card | later lifecycle |

Later-lifecycle nudges must never show to a first-session user — the job can't exist yet.

---

## 4. Show moments — completed-action seams

"Natural pause" is the wrong frame; the right one is **an action just completed**. The event is both the trigger and the show-moment.

```
 SEAM (ok to show)                      MID-ACTION (never)
 ─────────────────                      ──────────────────
 share succeeded / link published        typing, dragging, editing
 export finished                         deck mid-generation
 deck generation finished                any dialog in active use
 returned to dashboard
 idle > N seconds in editor
```

Preferred pattern: **ride the surface the action already opened** (e.g. the share-success panel hosts the Remove-branding nudge). No new interruption to justify; intent is freshest.

---

## 5. Manifestations

Loudness ladder:

```
 whisper ──────────────────────────────────────────► shout
 Tooltip     In-moment embed     PIP card      Blocking modal + video
             (rides open surface) (bottom-right,
                                   ambient)
```

**Selection = three dials:**

1. **Moment** — if the triggering action opened a surface → **embed. Done.**
2. **Feature sets the floor** — the smallest vessel that can carry the content (Remove branding fits a line → tooltip possible; knowledge graph needs a demo → tooltip impossible).
3. **Signal weights set the volume** — weak/single signal → whisper; strong/corroborated/paywall-stall → louder.

```
 earned loudness ≥ feature's minimum vessel  →  show at that loudness
 earned loudness < feature's minimum vessel  →  HOLD, wait for more signal
```

Blocking modal + video: only when confidence **and** value are both high **and** the content needs a demo. Rare by design.

---

## 6. Governance rules

- **One slot.** Only arbitration writes to it. One nudge on screen, ever.
- **Session cap:** ≤ 1 nudge per session (revisit after v1 data).
- **Cooldown:** after any show or dismiss → suppress all nudges for the rest of the session (v1; tune later).
- **Seams only:** never mid-action (§4).
- **Dismissal memory:** dismissed nudge → don't re-show ≥ 14 days; repeated dismissals → global back-off.
- **Discoverability profile** (v3): same pipeline, different settings — no P-gate, free features, tooltip/embed tiers only, gentler cadence, success = feature adoption not payment. Conversion candidates win arbitration ties.

---

## 7. Instrumentation (build with v1, non-negotiable)

Events, all carrying `nudge_id`, `manifestation`, `trigger_signal`, `session_id`, `variant`:

| Event | When |
|---|---|
| `nudge_eligible` | a want-score crosses eligibility (even if never shown) |
| `nudge_shown` | rendered in the slot |
| `nudge_clicked` | CTA engaged |
| `nudge_dismissed` | explicit dismiss |
| `nudge_converted` | payment within 7 days, attributed to last-shown + any-shown |
| `nudge_held` | eligible but governance/vessel-floor blocked it (with reason) |
| `nudge_gap` | high-intent user matched **no** router rule (with top features) — the blind-spot health metric |

`nudge_gap` review is a standing ritual: many gaps = router blind spot (add a rule) or proxy-inflated scoring (tighten features).

---

## 8. Rollout

```
 v1  PROVE IT   2 nudges (Remove branding, Export PPT) · embed-only · seams:
                share-success + export-paywall · deterministic router · full
                instrumentation · shipped AS an A/B (50/50 holdout)
                → no ML dependency. Intent signals alone are high-precision.

 v2  WIDEN      + Invite teammate, Better models, Brand Kit · + tooltip & PIP
                tiers · weighted router with decay, trained on v1 data

 v3  SMARTEN    + live P-gate for louder manifestations (needs: real-time
                feature computation, prior-correction + calibration, multi-
                cohort re-run) · + discoverability governance profile ·
                + later-lifecycle nudges
```

**v1 A/B:** primary metric = 7-day payment conversion, treatment vs holdout, cohort = users who hit a v1 seam. Secondary: nudge CTR, dismissal rate, export/branding feature adoption. Per-nudge attribution via `variant` + `nudge_id`.

---

## 9. Open questions

- [ ] Cooldown/caps values — v1 defaults above are guesses; tune on data.
- [ ] Arbitration tiebreak beyond conversion-beats-discoverability (recency? scarcity?).
- [ ] Mobile: signals differ (mobile is a *negative* static signal in the P model) — do v1 seams even fire enough on mobile to matter?
- [ ] Copy/tone per `pai-visual-language` — how salesy is too salesy? Answer in mockups.
- [ ] Pricing interplay: does a nudge deep-link to checkout, feature page, or trial?
- [ ] Real-time scoring feasibility + cost (blocks v3 only).

## 10. Design to-dos (Mudita)

- [ ] Mock the share-success embed (Remove branding) — the flagship moment.
- [ ] Mock the export-paywall embed (Export PPT).
- [ ] Define the PIP card + tooltip patterns for v2.
- [ ] Dismissal affordance + "don't show again" pattern.

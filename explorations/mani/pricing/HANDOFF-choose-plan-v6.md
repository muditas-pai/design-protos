# Choose your plan, v6 — developer handoff

Upgrade modal shown to free users when they hit a paid feature, or from the trial funnel.
Prototype is one self-contained HTML file, no build step, no dependencies beyond two CDN links (Inter, Phosphor icons).

| | |
|---|---|
| Source | `explorations/mani/pricing/trial-choose-plan-sep-2026-v6.html` |
| Live | https://muditas-pai.github.io/design-protos/explorations/mani/pricing/trial-choose-plan-sep-2026-v6.html?tier=2 |
| Embedded copy (trial funnel) | `explorations/mani/7-day-trial-v6/pricing.html` |
| Funnel demo | https://muditas-pai.github.io/design-protos/explorations/mani/7-day-trial-v6/editor.html?state=present |
| Figma | file `FilrWEhw4GFBJqKUpKabCa`, node `1178-21215` ("free trail") |
| Checkouts it hands off to | `checkout-trial-sep-2026.html`, `checkout-buy-sep-2026.html` |

The two HTML files are the same component. `pricing.html` only adds the iframe host hooks (see "Trial funnel integration").

---

## 1. Frame and layout

```
dp-box  1176 x 620, radius 6, white, overflow hidden
├── pane-l  806 wide, padding 0            (media, full bleed)
│   ├── preview   flex 1, fills to the modal top/left/right edge, no radius
│   │   └── avail strip  absolute, left 18 / bottom 18
│   ├── tabs-wrap 100%, margin 18 top/bottom, edge mask 28px left / 40px right
│   └── foot-l    100%, height 66, 1px top border, padding 0 24
└── pane-r  370 wide, background #f5f9ff, 1px left border, padding 22 20 0
    ├── ttl-row (title + offer timer pill)
    ├── ttl-sub  (close nudge only)
    ├── #cards
    ├── ctas     sticky bottom 52 (tier 1: bottom 0)
    ├── ex-alt   (tier 4 only)
    └── foot-r   sticky bottom 0, height 52 (tier 2 only)
```

`dp-close` (28px round button) sits **outside** the box, top-right of the stack, 10px gap.

`pane-r` is the scroll container (`overflow-y: auto`, hidden scrollbar). Its children are `flex: none` so an
expanded feature list never squashes the header. CTA block + trust badges are sticky, so they stay pinned to the
bottom while the cards scroll behind them.

Responsive: below 1246px the box is `min(1176px, 100vw - 70px)` and `pane-l` becomes fluid; below 900px the two
panes stack; below 520px the box is `100vw - 32px`.

---

## 2. Tokens

**Colour**

| Token | Value | Used for |
|---|---|---|
| Primary | `#005EFF` | buy button, selected card, radio, credit text |
| Primary deep | `#0055ED` | credit chip text, active tab |
| Primary tint | `#e8f0fe` | credit chip, tab fill wipe |
| Ink | `#171717` | titles, Team pill |
| Body | `#404040` | feature rows |
| Muted | `#525252` / `#737373` | sub-copy, notes |
| Hairline | `#e5e5e5` | card border |
| Hairline hover | `#c9cdd2` | card hover border |
| Plan pane bg | `#f5f9ff` | right column |
| Gold | `#c9932a` | Gold pill |
| Navy outline | `#0A1925` | secondary button border |
| Eyebrow | `radial-gradient(55% 220% at 50% 50%, #2F7BFF, #0B1FBB 62%)` | close nudge band |
| Timer pill | `linear-gradient(96deg, #00225C → #74A6FF)` | offer pill and "20% off" title text |

**Radius** 6px everywhere (modal, cards, tabs, eyebrow top corners); buttons 4px; pills and chips 999px.

**Type** Inter. Title 18 / 500 (24 in the close nudge). Plan name and price 16 / 500. Feature row 13 / 1.5.
Tab 13.5 / 500. Note 11.5. Availability pill 10 / 700 / 0.04em, uppercase.

**Plan card** (identical on the checkout pages — keep them in sync):
`background #fff; border 1px #e5e5e5; radius 6; padding 18; gap 12 to the radio; 8px between cards`.
Selected: `border-color #005eff; box-shadow inset 0 0 0 1px #005eff, 0 0 0 1px #e6efff, 0 1px 2px 0 #e6efff`.
Radio 16px, `1.5px #d4d4d4`; selected `5px solid #005eff`.

---

## 3. Components

**Media pane.** Full-bleed 16:9 stills and videos, `object-fit: cover`. One `.pv-item` per feature, cross-faded
by opacity (.3s). Videos are `muted playsinline preload="auto"`, webm first where it exists, mp4 fallback.
All mp4s must be written with `faststart` (moov atom at the front) or the first frame renders blank.

**Tab strip.** One button per feature, rendered three times so the strip can scroll forward forever; after the
strip settles it rewinds one copy width. Wheel, drag and arrow keys are disabled by design: the strip only moves
on its own or on a click. Active tab: `#cfe0ff` border, `#0055ED` label, filled icon variant. The `.fill` span is
a left-to-right wipe animated with the Web Animations API for exactly the remaining clip duration.

**Availability strip.** White rounded panel over the video, bottom-left. One solid pill per plan that includes the
current feature: dot (white, 6px) + plan name, background in the plan colour, white text.

**Logo marquee.** `foot-l`, 120s linear loop, list duplicated for a seamless wrap, paused on hover, masked 24px
at both ends.

**Plan card.** Radio + name + price on one row, optional description, credit chip, optional credit note
("3x Pro", solid `#005EFF`), then the feature list. Optional `Best value` tag floats on the top edge.

**Feature list.** Only the selected card shows its list. Collapse uses a CSS grid trick:
`.c-feats { grid-template-rows: 0fr }` → `1fr` with a single `<ul>` child that carries `overflow: hidden; min-height: 0`.
Open is slow ease-out (.5s), close is fast ease-in (.26s). Rows fade up one after another, 60ms apart.
Lists for Gold and Team start with a medium-weight lead line, "Everything in Pro, plus" / "Everything in Gold, plus"
(the industry pattern: Sprig, Vanta), followed by only the additive features.

**CTA block.** Primary buy button `#005EFF` with a slow light sweep every 3s. Secondary trial button is white with a
`1.5px #0A1925` outline. Both 38px tall, full width.

**Close nudge (tier 2 and Students).** First click on the close button does not close: an eyebrow band slides out
of the top of the modal ("Before you go, 20% off for the next hour"), the title swaps to "20% off, just for you",
prices roll down on an odometer (one column per digit, a 0-9 stack twice over so a digit can roll through 9), the
struck-through old price slides in from the right after the roll, and a 59:56 countdown pill appears next to the
title. A second close really closes.

---

## 4. Behaviour

- **Autoplay show.** Features advance on their own: videos on `ended` (25s safety cap), stills after 3500ms.
  Hovering the preview pauses video, timer and the tab wipe; leaving resumes with the time that was left.
- **Selecting a plan** opens its feature list, closes the previous one, repaints the buy button label
  ("Buy Gold at 20% OFF"), and scrolls the card just clear of the pinned CTA if it would sit behind it
  (`scrollTo({behavior:'smooth'})` with an instant fallback after 380ms, because the pane has `scroll-behavior: smooth`).
- **Scroll affordance.** While there is more content below, the pane bottom is masked and the CTA block takes a
  soft top shadow (`.pane-r.has-more`). Recomputed on scroll, resize, transition end and via `ResizeObserver`.
- **Opening cascade** runs once on first open only (`body.enter`, removed after 1200ms): title, sub, cards, CTA,
  badges, 60ms apart. Switching tabs does not replay it.
- **Students mode** (tiers 3 and 4) hides the features that are not in Pro from the show and the tab strip.

---

## 5. Variants

Selected with `?tier=`. `body` classes drive the CSS.

| Tier | Meaning | Plans | Body classes | Notes |
|---|---|---|---|---|
| 1 | 7 day trial + 20% off | Pro / Gold / Team | (none) | trial CTA + buy at 20% off; trust badges hidden for breathing room |
| 2 | No trial, full price | Pro / Gold / Team | `tier2` | buy only; 20% appears after the close nudge |
| 3 | Students | Student Plan + Pro | `tier2 students` | annual, no trial; close nudge drops $12 → $9.60 |
| 4 | Student + export | Student Plan (+ single export block) | `tier2 students two-up` | one-time export alternative under the card |

Note for implementation: `body.tier2` really means "no trial CTA", so tiers 3 and 4 carry it too. Rename when porting.

**URL params:** `tier` (1-4, default 2), `plan` (`pro|gold|team|student`), `closed=1` (return from a closed checkout).

---

## 6. Data

Two arrays near the top of the script are the whole content model.

```js
FEATURES = [{ key, label, icon, dots:['pro','gold','team'], video | img, mp4Only?, zoom? }]
PLANS    = [{ key, name, credits, creditNote?, base, off, desc?, tag?, lead?, feats:[[icon, label]] }]
```

`dots` drives the availability pills and which features Students mode hides. `base` is the list price, `off` the
discounted one (prices are rendered as `$base` struck + `$off/mo` whenever an offer is active).
Current numbers: Pro 20 → 16, Gold 50 → 40, Team 60 → 50, Student 12 → 9.60, single export $75.
Credits: Pro 5,000, Gold 15,000 (3x Pro), Team 20,000, Student 1,500.

---

## 7. Trial funnel integration

`7-day-trial-v6/pricing.html` is the same file inside an iframe, plus:

- Extra params: `embed=1` (transparent background, blurred scrim), `bare=1` (no scrim, no close button, for the
  inline editor blocker), `noclose=1`, `title=` (names the modal on tier 1, e.g. "Export presentations").
- `.dp-stack` scales by `--fit` so the 1176x620 design fits any frame.
- Messages posted to the parent: `trial-pricing-close`, `trial-tier-changed {tier}`,
  `trial-plan-selected {kind:'trial'|'buy', plan, query}`, `trial-pres-key {key}` (left/right arrows).
  The host swaps in the matching checkout instead of navigating.

---

## 8. Assets

Under `pricing/assets/`:

- `feature-modal/` — `trigger_export`, `trigger_brandkit`, `trigger_knowledge`, `trigger_assign_invite`,
  `trigger_analytics`, `trigger_fontpair` (mp4, some with webm) and stills `triggeraimodels.jpg`,
  `triggerproject.jpg`, `triggercolorsmeetandpresent.jpg`, `triggermeetandedit.jpg`, `triggerpromodelupgrade.jpg`.
- `export-ppt/logos/` — 9 customer logos (svg) for the marquee.
- `checkout/` — `badge-heart.svg`, `badge-gdpr.svg`, `badge-soc2.svg`, `editor-bg.jpg` (prototype backdrop only).

Fonts and icons load from CDN: Inter (Google Fonts), Phosphor Icons 2.1.1 regular + fill.

---

## 9. Prototype-only, drop when porting

- `.tier-bar` at the top of the page (variant switcher) and its `setTier` handler.
- `.closed-note` / `#reopen` (shows "Modal closed" instead of really closing).
- `body { background: url(assets/checkout/editor-bg.jpg) }` — a still of the editor for context.
- The Agentation `<script type="module">` block at the end of the file.
- `?cb=` cache-buster params in any shared link.

## 10. Known gaps for engineering

- Cards use `role="radio"` on a div with click and Space/Enter handling; wrap in a real `radiogroup` with proper
  roving focus when building for production.
- The autoplay show has no reduced-motion guard yet: add `@media (prefers-reduced-motion: reduce)` to stop the
  marquee, the sweep, the odometer and the auto-advance.
- The countdown is cosmetic (always restarts at 59:56) and is not tied to any server-side offer.
- Prices, credits and feature copy are hard-coded in the two arrays; they should come from the plan API.

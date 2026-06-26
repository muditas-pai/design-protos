# 7 Day Trial v2: Developer Handoff

**Owner:** Mani (design) · **Status:** Ready for dev review · **Updated:** 26 Jun 2026

Trial funnel rebuilt on a capped trial-credit model. Trial grants a small credit
cap (Pro 500 / Gold 1,000) after the card is added. Full plan credits unlock only
after day 7, or instantly if the user activates the full plan early. Self-contained
HTML protos; no backend. This doc maps every screen, query param, flow, and
cross-frame contract for implementation.

## 1. Credit model

| Plan | Trial credits (day 0 to 7) | Full credits (after day 7 / on activate) | Annual price | Tax (10%) |
|---|---|---|---|---|
| Pro (individual) | 500 | 5,000 | $240 | $24 |
| Gold (individual) | 1,000 | 50,000 | $1,200 | $120 |
| Pro Team | none (direct buy) | 15,000 credit pool | from $648/yr | n/a |
| Gold Team | none (direct buy) | 150,000 credit pool | from $3,240/yr | n/a |

Rules:
1. Trial credits granted only after card added and trial started.
2. Trial credits exhausted mid-trial: prompt immediate charge (card on file).
3. Not cancelled before day 7: auto-charge at trial end.
4. After day 7 (or early activate): full plan credits unlock.
5. Individual plans are annual only. No monthly toggle.
6. Teams use a shared credit pool with unlimited seats and a volume discount
   ladder (10/20/30/40/50 percent). Teams are direct buy, no trial.

## 2. Screen inventory

All paths relative to `explorations/mani/7-day-trial-v2/`.

| # | Screen | File | Key query params |
|---|---|---|---|
| 1 | Flow shell (iframe router) | `index.html` | none |
| 2 | Pricing | `pricing.html` | `?modal=1` `?teamonly=1` `?view=team` |
| 3 | Checkout (individual trial) | `checkout.html` | `?ctx=modal\|flow` `?plan=gold` |
| 4 | Team checkout (direct buy) | `checkout-team.html` | `?ctx=modal\|flow` `?plan=pro\|gold` `?credits=N` |
| 5 | Dashboard: free user | `dashboard-trial.html` | none |
| 6 | Dashboard: active trial | `dashboard-active-trial.html` | `?scenario=credits-empty\|pro-to-gold` |
| 7 | Settings: free user | `settings-trial.html` | none |
| 8 | Settings: active trial | `settings-trial-active.html` | `?plan=gold` |
| 9 | Settings: paid | `settings-active.html` | none |
| 10 | Editor (trial) | `editor-trial.html` | `?state=ready` |

## 3. Pricing page (`pricing.html`)

- Annual only. Both Monthly/Annual per-card toggles removed; `getProPeriod()`
  pinned to `annual`.
- Audience switcher (top segmented control): Individual / Teams.
- Individual cards (Pro, Gold) show the trial-credit sub-note under the credit
  line: "500 trial credits for 7 days, full after" (Gold: 1,000).
- Team cards use a credit-pool dropdown picker. `TEAM_PLANS`:
  - Pro: unit 5,000 @ $20, options [15k, 25k, 50k, 75k, 100k]
  - Gold: unit 50,000 @ $100, options [150k, 250k, 500k, 750k, 1M]
  - `OFFER_LADDER = [0.10, 0.20, 0.30, 0.40, 0.50]` indexed by option position.
  - `annual = floor(units * list * (1 - offer)) * 12`.
- `window.__teamState` is exposed so hosts can read the selected pool at click time.

### Query params
- `?modal=1`: embedded-in-modal styling hook (host injects scrollbar/close hiding).
- `?teamonly=1`: forces the Teams view, hides the audience switcher, and retitles
  the page to "Invite your team. Pick a team plan that scales with you". Runs after
  team renderers initialise (must, or `renderCompareSummary()` throws on `teamState`).
- `?view=team`: defaults to the Teams view without hiding the switcher.

### CTA routing (standalone, when not iframed)
- Individual Pro/Gold "Try for Free" to `checkout.html` (`?plan=gold` for Gold).
- Team "Buy Pro/Gold Team" to `checkout-team.html?plan=...&credits=...`.
- Guarded by `if (window.self !== window.top) return;` so the host routes when iframed.

## 4. Individual checkout (`checkout.html`)

Plan-aware via `?plan` (default `pro`). `applyPlan()` swaps copy/figures for Gold.

| Field | Pro | Gold |
|---|---|---|
| Title | Add billing details for Pro | Add billing details for Gold |
| Plan row | Pro Annual (1 seat) $240 | Gold Annual (1 seat) $1,200 |
| Tax (10%) | $24 | $120 |
| Due today | $0 (7-day free trial) | $0 |
| Due at trial end | $264.00 | $1,320.00 |
| Trial credits | 500 | 1,000 |
| Full credits | 5,000 | 50,000 |

- Credit lines read "Full plan credits (5,000) after the trial ends" (no "/mo").
- `?ctx=modal`: hides the close circle, keeps the back circle (host owns close).
- Back/close/success post messages: see section 8.

## 5. Team checkout (`checkout-team.html`)

Direct buy, no trial. Paddle-style two-column (order summary + payment form).
Total due today = full annual amount, computed from `?plan` + `?credits` using the
same `TEAM_PLANS` / `OFFER_LADDER` model as pricing. `?ctx=modal` keeps the back
circle (host owns close).

## 6. Active-trial dashboard (`dashboard-active-trial.html`)

### Topbar trial pill (right side)
Single rounded pill: animated fire + "Trial: 500 credits left" + blue
"Activate full credits" button. Fire flicker + number bump animations are CSS only.

### Activate / scenario modal (one modal, three scenarios)
Driven by `?scenario`. Content set from a `SCENARIOS` config; summary + agree
checkbox + Confirm Payment (disabled until the Terms box is ticked).

| Scenario | Trigger | Title | Plan / Due | Unlock |
|---|---|---|---|---|
| (default) | Topbar button | Activate full Pro plan now? | Pro $240 | 5,000 |
| `credits-empty` | Auto-open + any credit action (prompt, pills); pill shows "0 credits left" | You're out of trial credits | Pro $240 | 5,000 |
| `pro-to-gold` | Auto-open (hit a Gold feature on Pro trial) | Upgrade from Pro to Gold | Gold $1,200 | 50,000 |

On Confirm: trial pill hides, success toast fires (scenario-specific copy).

### Invite teammate to team flow
Sidebar "Invite new members" to email entry to **team-only pricing modal**
(`pricing.html?modal=1&teamonly=1`) to **Buy Team** to compact agree-and-pay confirm
(summary + Terms checkbox + Confirm Payment). On confirm: toast
"Pro Team activated. Invite sent to {email}." No separate per-seat screen.

## 7. Active-trial settings (`settings-trial-active.html`)

- `?plan=gold` renders the Gold variant (1,000 trial / 50,000 full / $1,200).
- Billing panel shows trial credits now (Pro 500 / Gold 1,000) with the note
  "Trial credits, full plan credits (5,000) unlock after day 7".
- "Activate your full plan now" card to confirm modal (order summary + Terms
  checkbox + Confirm Payment). On confirm: credits unlock to full everywhere
  (card, profile menu, note), card hides, toast fires.
- The redundant "Upgrade" button next to the plan name was removed.
- Checkout opened from here uses `?ctx=modal`; Back loads `pricing.html?modal=1`
  into the same modal frame, and pricing CTAs route back to checkout in-modal.

## 8. Cross-frame contract (postMessage)

The flow shell (`index.html`) and the dashboard/settings hosts embed pricing and
checkout in iframes. Messages from the embedded page to its host:

| Type | Meaning | Host action |
|---|---|---|
| `trial-plan-selected` | plan chosen in pricing | open checkout |
| `trial-checkout-back` | back pressed in checkout | reload pricing into the frame |
| `trial-checkout-close` | close pressed in checkout | close the modal |
| `trial-open-deck` | success, continue | close modal, open editor `?state=ready` |
| `trial-exit` | exit editor | back to dashboard |

Checkout context is set by `?ctx=modal` (host modal) or `?ctx=flow` (flow shell).
Standalone (no `ctx`) navigates with `location.href`.

## 9. Edge cases and known gaps

- Team Gold routes by button id (`gold-team-cta`); only the individual Gold card
  carries `#gold-card`. Keep team CTAs id-based.
- `?teamonly=1` logic must run after team renderers initialise (ordering matters).
- Scenario auto-open uses a 350ms timer so the modal is visible on direct links.
- Paid dashboard (`dashboard.html`) was removed from this set.

## 10. Design system

Built on `design-system/` (pai.tailwind.js, pai.css). Navy `#0A1925` = action,
orange `#FF5500` = brand/upsell, blue `#2563eb` = the trial-activate accent button.
No local asset files except the editor/dashboard thumbnails already bundled.

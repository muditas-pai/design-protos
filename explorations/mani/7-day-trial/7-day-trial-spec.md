# 7-Day Trial flow — dev handoff

New-user trial funnel that converts during the "waiting for my deck" moment. Slides generate
behind the pricing page; the deck stays locked until the user starts a free trial.

**Live prototype:** [Full flow](https://muditas-pai.github.io/design-protos/explorations/mani/7-day-trial/index.html) ·
[Generation screen](https://muditas-pai.github.io/design-protos/explorations/mani/7-day-trial/editor-trial.html) ·
[Deck-ready state](https://muditas-pai.github.io/design-protos/explorations/mani/7-day-trial/editor-trial.html?state=ready) ·
[Dashboard](https://muditas-pai.github.io/design-protos/explorations/mani/7-day-trial/dashboard-trial.html) ·
[Pricing](https://muditas-pai.github.io/design-protos/explorations/mani/7-day-trial/pricing.html) ·
[Checkout](https://muditas-pai.github.io/design-protos/explorations/mani/7-day-trial/checkout.html)

**Figma:** AMJ-26 Growth — [checkout node 868-6044](https://www.figma.com/design/iuz5SLIPsMDKLgEPdBmq6W/AMJ-26---Growth?node-id=868-6044)

## Flow map

```
Persona (role select)
  → Prompt (describe deck / upload)
    → Generation screen (editor shell)
        · slides stream into the left filmstrip (10 slides)
        · pricing page fills the canvas; deck NOT shown
        · Try for Free → Checkout (full screen) → Success → deck-ready editor
        · Exit (top-right, inside pricing box) → Dashboard
Dashboard
  · 1 existing presentation → click → editor reopens in deck-ready state
  · prompt field / Upload / Import / Try Pro → Pricing modal
  · PRO-gated sidebar items (Create project, Invite new member) → Premium-features modal
      → Try Pro for Free → Checkout (in modal)
  · Hire an Expert (sidebar or prompt pill) → hire-an-expert page → close → back to Dashboard
Pricing modal: Try for Free → Checkout swaps in the SAME modal
Checkout success → "Continue to your deck" → deck-ready editor
```

## Screens & states

### 1. Generation screen (`editor-trial.html`)
- Editor shell: left filmstrip (10 thumbs, shimmer → filled as slides stream), canvas right.
- Pricing page fills the canvas edge to edge (native width ≥1280px; downscales when narrower;
  <768px box width switches to the pricing page's mobile layout).
- Loader is a fixed-footprint toast pill (410px) centered on the pricing box, 76px above its
  bottom logo marquee: label swaps in place, progress bar never moves.
  Steps: "Choosing layouts…" → "Writing your content…" → "Designing slide n of 10…" → done.
- Title in all states: **"Start your free trial to view your slides"**.
- After all 10 slides: loader hides, layout does not shift. Clicking a filled thumb shows the
  tooltip **"Start your free trial to view your slides"** (springs in from the left, no arrow).
- Exit button inside the pricing box, 20px from the top-right corner.
- `?state=ready` reopens this screen with all slides loaded and no loader (used when opening
  the existing presentation from the dashboard).

### 2. Pricing (`pricing.html`, duplicated from the pricing key screen)
- Basic plan removed everywhere (cards + sticky summary + comparison table = Pro and Gold only).
- Monthly/Annual segs inside each card, **linked** (changing either updates both). Monthly default.
- Monthly: Pro $40/mo, Gold $200/mo, cadence "Billed monthly", credits "1,000 / 5,000 Credits per month".
- Annual: Pro $20/mo ($240 billed annually), Gold $100/mo ($1,200 billed annually), credits 5,000 / 50,000.
- Green badge "7-day free trial" beside every price. All CTAs **Try for Free**
  (cards, sticky summary, team cards). Teams keeps **Talk to Sales** for Enterprise.
- No "(incl. tax)" anywhere; dollar amounts carry $ and thousands commas.

### 3. Checkout (`checkout.html`) — matches Figma 868-6044
- Gray page, two floating white cards; circular back + close outside (hidden in modal context —
  the modal supplies its own external ✕).
- Left: "Add billing details for Pro", order rows (Pro Annual $240 / Subtotal $240 / Tax(10%) $24),
  timeline (blue dot "Due today" + green "7-day free trial" badge + $0; hollow dot "Due Jun 18, 2026"
  $264.00, sub "7-day free trial ends"), then green-check list (no heading, 12px rows):
  - Billing automatically starts after free trial ends
  - Cancel before Jun 18 to avoid getting billed
  - 1,000 AI credits per month.
  - Full Pro access.
- Right: Payment method (Card active / SEPA Debit), card details with brand icons, expiration,
  CVC, Country/Territory select, Stripe legal line, CTA **Get your free trial**,
  "Powered by stripe | Terms Privacy".
- Success modal: invoice header + orange promo panel + **Continue to your deck** → deck-ready editor.
- Contexts via query param: `?ctx=flow` (full-flow iframe), `?ctx=modal` (dashboard modal), none (standalone).

### 4. Dashboard (`dashboard-trial.html`, duplicated from the dashboard key screen)
- Recent grid trimmed to ONE presentation (McKinsey card) → opens editor `?state=ready`.
- Topbar: "🚀 Start your trial for $0" + blue **Try Pro** button.
- Pricing modal: centered card (min(1120px, 94vw) × min(86vh, 820px)), backdrop blur, close
  floating outside top-right, pop/fade open-close animation. Title injected:
  **"Start your 7 day free trial. Choose a plan"**.
- Premium-features modal ("Upgrade for premium features"): left feature list (Projects, Export
  presentations, Analytics, Invite team members, Font pair, Color palette, Assign slide) with
  active row showing its sub-line + preview swap on the right; CTA **Try Pro for Free** → checkout
  in the modal. Sidebar triggers preselect their tab (Create project → Projects, Invite → Invite).

## Cross-frame messages (postMessage contract)

| Message | Sent by | Handled by |
|---|---|---|
| `trial-plan-selected` | pricing CTA (Try for Free / Buy) | index → full-screen checkout |
| `trial-exit` | editor Exit | index → dashboard view |
| `trial-open-deck` | checkout success | dashboard/index → editor `?state=ready` |
| `trial-checkout-back` | checkout back | modal → pricing; flow → pricing view |
| `trial-checkout-close` | checkout ✕ | modal closes; flow → dashboard |

## Copy strings (final)

- Pricing title, all states: `Start your free trial to view your slides`
- Modal pricing title: `Start your 7 day free trial. Choose a plan`
- Thumb tooltip: `Start your free trial to view your slides`
- Trial badge: `7-day free trial` · CTA: `Try for Free` / `Get your free trial` / `Try Pro for Free`
- Loader steps: `Choosing layouts… / Writing your content… / Designing slide n of 10…`

## Files

| File | Role |
|---|---|
| `index.html` | Flow shell: persona, prompt, view router, iframes |
| `editor-trial.html` | Generation screen (clone of Mudita's editor-to-present + trial overrides) |
| `pricing.html` | Trial pricing (duplicate of pricing key screen, trimmed) |
| `checkout.html` | Checkout + success modal (single source for all contexts) |
| `dashboard-trial.html` | Trial dashboard (duplicate of dashboard key screen + modals) |
| `assets/` | Vendored logos, trust badges, feature previews |

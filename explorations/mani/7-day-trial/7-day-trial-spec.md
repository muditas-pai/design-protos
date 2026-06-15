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
  · PRO-gated sidebar item (Create project) → Premium-features modal
      → Try Pro for Free → Checkout (in modal)
  · Hire an Expert (sidebar or prompt pill) → hire-an-expert page → close → back to Dashboard
  · sidebar Workspace settings → Settings page (General / Members / Billing / Profile)
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
  in the modal. Sidebar trigger preselects its tab (Create project → Projects).
  "Invite new member" is hidden from the trial dashboard sidebar.

### 5. Settings (`settings-trial.html`) — free / pre-checkout user

- Sidebar: Workspace Settings (General, Members, Billing) + Profile Settings (Profile).
  Groups and Developer Console hidden for trial users.
- Top bar: "Upgrade" button (opens checkout in a modal); no trial pill or countdown.
- **General**: workspace avatar (camera upload) + Workspace Name field. Nothing gated.
- **Members**: "Invite to workspace" box hidden. "Workspace members · 1 Member · 0 Guests",
  owner row only (Owner role), Guests tab shows "No guests". No role/remove actions.
- **Billing**: header "Free · 1 Editor · 100 Credits", Upgrade button, credits card
  ("100 credits left" + View credit history). "Need more credits?" rows: Pro $40 and Gold $200
  per user/month only (no Basic), green "7-day free trial" badge, each row opens checkout.
  No payment-method section, no invoice history.
- **Profile**: photo, first/last name, email (read-only), change password, role (read-only),
  language select, Delete Account.
- Every paid action opens the single `checkout.html` in a modal (`ctx=modal`); success →
  `trial-open-deck` → editor `?state=ready`.

### 5b. Settings — trial-activated user (`settings-trial-active.html`)

Same shell as 5, post-checkout (full Pro) differences:
- Top bar has **no** Upgrade button and no trial pill — identical to a paid Pro user.
  Sidebar workspace chip shows a "Pro Trial" tag.
- **Members**: "Invite to workspace" box is **visible and working** (Pro includes team invites).
- **Billing**: header "Pro Trial · Trial ends Jun 18, 2026", Upgrade button (converts to paid now).
  Credits "1,000 credits left". "Need more credits?" shows **Gold only** (already on Pro path).
  Trial & billing card: timeline ("Paid today $0" + 7-day badge → "Due Jun 18, 2026 $264.00,
  billing starts automatically"), payment method on file (VISA ···· 4242), "Cancel trial" link.
- General and Profile identical to 5.
- Avatar opens a profile dropdown: name + email, "1,000 credits left", Your Account (→ Profile),
  Language, Sign out.

### 5c. Settings — paid subscriber (`settings-active.html`)

Post-conversion Gold subscriber (no trial):
- Sidebar workspace chip shows a "Gold" tag. Top bar clean (no trial chip), avatar profile
  dropdown shows "250.2k credits left".
- **Billing**: header "Gold · $6,000/year · 5 seats · 250,000 Credits", Upgrade button.
  - Invoice card: "$6,000 paid Jun 8, 2026", upcoming "$6,000 on June 8, 2027", View all invoices.
  - Subscription Renewal card: "Next billing date June 8, 2027" + Cancel renewal.
  - Credits card: "250.2k credits left", credit packs (2,500 → $24, 5,000 → $36).
- Members / General / Profile same as 5b.

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
| `settings-trial.html` | Settings for the free / pre-checkout user (invite hidden, Free billing) |
| `settings-trial-active.html` | Settings for the trial-activated user (invite visible, Pro Trial billing) |
| `settings-active.html` | Settings for the paid Gold subscriber (invoices, renewal, credit packs) |
| `assets/` | Vendored logos, trust badges, feature previews |

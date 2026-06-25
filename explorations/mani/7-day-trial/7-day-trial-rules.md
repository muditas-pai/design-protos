# 7 Day Trial Proto: Rules Document

Step-by-step behaviour rules for the 7-day trial, screen by screen and state by state.
Pairs with the [flow spec](7-day-trial-spec.html) (which covers visual layout); this doc covers
**what each action does** and how the two user states differ.

Two user states:
- **State A — Free user**: exited generation, deck locked, never paid.
- **State B — In-trial user**: completed checkout, full Pro, 7-day clock running.

---

## State A — Free user (deck locked, not paid)

### Free user exits generation and lands on the dashboard
1. User clicks Exit (text button inside the pricing box) or the corner X (top-right of the Generation screen). Either one opens a **warn-on-exit confirm modal** first, never a direct exit.
   - Modal: title "Are you sure you want to leave?", subtitle "Your deck stays saved but locked. Start your free trial to view your slides." Buttons: "Leave" (leaves) / "Start your free trial and view your slides" (stays). Close (X) floats outside the card, top-right.
   - Leave → proceeds to the dashboard. Start your free trial and view your slides / X / Esc / backdrop click → stays on the Generation screen.
2. On Leave, generation continues to completion in the background. The deck is saved either way, no progress is lost.
3. User lands on the Dashboard in the free / locked state.
4. Recent section shows exactly one presentation: the deck they just generated.
5. The deck stays locked. Clicking its card reopens the Generation screen in ready state: all 10 slides loaded in the filmstrip, no loader, pricing page still filling the canvas, title "Start your free trial to view your slides".
6. Top bar shows "🚀 Start your trial for $0" plus a blue "Try Pro" button.
7. Conversion re-entry points on the dashboard:
   - Prompt field, Upload & share link, Import PPT, Try Pro: all open the pricing modal (title "Start your 7 day free trial. Choose a plan").
   - "Try for Free" in the modal swaps Checkout into the same modal.
   - PRO-tagged sidebar item (Create project) opens the premium features modal, CTA "Try Pro for Free" leads to Checkout.
8. Hire an Expert (sidebar or prompt pill) opens the Hire an Expert page. Closing it returns to this dashboard.
9. Checkout success anywhere unlocks the deck: "Continue to your deck" opens the editor with slides visible.

### Settings panel — free user (`settings-trial.html`)

**Sidebar**
1. Workspace Settings: General, Members, Billing.
2. Profile Settings: Profile.
3. Hidden: Groups, Developer Console.
4. "Back to Home" returns to the dashboard.
5. Workspace switcher keeps the "Upgrade" link next to the workspace name.

**Top bar (every settings page)**
1. No badges, no countdown pill.
2. Blue "Upgrade" button (top right) opens checkout.
3. Search, help, notifications, profile menu (logout) unchanged.

**General**
1. Workspace avatar with camera button to upload a logo. Editable.
2. Workspace Name field. Editable.
3. Nothing gated, nothing hidden.

**Members**
1. "Invite to workspace" box hidden (no email field, no Invite button).
2. Title and count stay: "Workspace members · 1 Member · 0 Guests".
3. Members list shows the owner row only (name, email, role Owner). Guests tab shows "No guests".
4. No role change or remove actions.

**Billing**
1. Plan header: Free.
2. "Upgrade" button (top right) opens checkout.
3. Credits card: "100 credits left", progress bar, "View credit history" link.
4. "Need more credits?" rows: Pro and Gold only, no Basic.
5. Dollar pricing, monthly default: Pro $40, Gold $200 per user/month, green "7-day free trial" badge per row.
6. Each plan row CTA opens checkout (same `checkout.html`, modal context).
7. No payment method section, no invoice history.

**Profile**
1. Profile photo with upload. Editable.
2. First name, last name. Editable.
3. Email. Read only.
4. Password with "Change password" button.
5. Role. Read only.
6. Language selector.
7. Delete Account stays. Deleting removes the account, nothing charged.

---

## State B — In-trial user (checkout done, days 1 to 7, full Pro)

### Global state
1. User has full Pro access. Nothing is locked.
2. Credits per the plan picked: monthly Pro 1,000 / Gold 5,000 per month; annual Pro 5,000 / Gold 50,000.
3. Trial runs 7 days from checkout. Billing starts automatically on the trial-end date unless cancelled.
4. Cancel any time before the trial-end date: nothing charged, account drops to Free at trial end, credits reset to 0. On reactivation, the plan's credit allowance is restored.

### Top bar (everywhere)
1. No trial pill, no countdown, no badges. Top bar looks identical to a paid Pro user: search, help, notifications, avatar.
2. No Upgrade button in the top bar.
3. Trial status lives in one place only: Settings → Billing.

### Editor
1. Deck fully visible and editable. No pricing page, no lock, no tooltip.
2. Filmstrip thumbs click through to slides normally.
3. All Pro features active: export, analytics, font pairs, color palettes, assign slide.

### Dashboard (`dashboard-active-trial.html`)
1. Unlocked full-Pro dashboard. All presentations open; prompt / Upload / Import / pills work, no pricing modal.
2. Top bar: search, help, notifications, avatar only. No Gold upsell (trial users are not upsold to Gold here), no trial countdown, no badges.
3. Sidebar foot: Workspace settings + Invite new members.
4. In the proto, only Workspace settings and Invite new members are clickable; every other item is inert (demo focus).
5. Workspace settings → `settings-trial-active.html`. (Settings "Back to Home" returns here.)

### Invite a new member (adds a seat — see Billing Case 2)
1. Sidebar "Invite new members" → "Invite members" popup: emails field, Invite button, "Copy invite link".
2. Invite → "Add more seats" modal: "Add 1 seat to invite a new member", "Billed on day 7 (Jun 18, 2026): $240.00", "$0 due today" note, agree checkbox ("charged $240.00 on day 7 with your billing"), Cancel / Confirm Payment.
3. Confirm Payment → seat added and billed on the day-7 date (not today). Toast confirms it bills on day 7.
4. Leaving the seats modal (X or Cancel) → "Exit checkout?" confirm. Cancelling means the seat is not added, so you cannot invite this new member. Leave Page discards; Complete Purchase returns to the seat modal.

### Settings panel — active user (`settings-trial-active.html`)

**Sidebar**
1. Workspace Settings: General, Members, Billing. Profile Settings: Profile. Hidden: Groups, Developer Console.
2. Workspace chip shows "Pro".
3. "Back to Home" → the active dashboard (`dashboard-active-trial.html`).

**Top bar (every settings page)**
1. No badges, no countdown pill, no Upgrade button in the top bar.
2. Avatar opens a profile dropdown: name + email, "5,000 credits left", Your Account (→ Profile), Language, Sign out.

**General**
1. Workspace avatar with camera button to upload a logo. Editable.
2. Workspace Name field. Editable.

**Members**
1. "Invite to workspace" box visible and working (Pro includes team invites).
2. Owner row shows in the Members list. Guests tab shows "No guests" until someone is invited.

**Billing** (Gold-style card layout, $)
1. Plan header: "Pro · $240/year · 1 seat · 5,000 Credits", Upgrade button (top right).
2. Invoice card: "$240 paid Jun 16, 2026", upcoming "$240.00 on June 16, 2027", "View all invoices".
3. Subscription Renewal card: "Next billing date June 16, 2027" + "Cancel renewal" → confirm modal ("Cancel renewal?": keeps Pro access until the period end, then drops to Free and credits reset to 0).
4. Credits card: "5,000 credits left", progress bar, "View credit history". "Need more credits?" packs: 2,500 → $24, 5,000 → $36, and Get Gold (50,000 credits, $100/user/month, $1,200 billed annually).

**Profile**
1. Same as State A: photo, first/last name, email (read only), change password, role (read only), language, Delete Account.

### Gold subscriber variant
The Gold paid subscriber uses the same card layout with Gold values in `settings-active.html` (invoices, subscription renewal, one-off credit packs).

---

## Billing use cases

### Case 1 — Upgrade Pro trial to Gold mid-trial
1. User is on a Pro trial (7-day clock already running).
2. User switches the plan to Gold during the trial (example: on day 4 of 7). This switch **is** supported.
3. The plan changes to Gold immediately. Gold features and Gold credit allowance apply from the switch.
4. On day 7, the user is charged the **Gold** price (not Pro). No proration, no separate charge for the days already spent on Pro.
5. **Trial-end date: under review.** Server side is still confirming whether switching the plan mid-trial keeps the original trial-end date or resets it. Need more trial-date data before locking this. Treat "same 7-day window" as the intended default, not yet final.
6. Downgrade Gold → Pro during trial follows the same plan-switch rule, charged the Pro price on day 7.

### Case 2 — Add users to a workspace during the trial
1. Workspace owner activates a Pro trial for 1 user license (example: Mani).
2. Owner adds more users to the workspace during the trial (example: Tejas and Muditha added on day 3). Adding seats **is** supported.
3. New users get Pro trial access immediately, under the **same** 7-day clock as the owner. No separate trials, no reset.
4. Seats are billed per user. The new users are added to the single trial invoice, not charged separately.
5. On day 7, the workspace is charged for the **number of active seats** at the plan price.
6. Example (Pro annual, $240 per user): Mani $240 + Tejas $240 + Muditha $240 = **$720** for 3 users, charged once on day 7.
7. **Seats can only increase.** Decreasing seats mid-trial is not allowed (server does not support removing a seat). The day-7 charge reflects the seat count, which only goes up.

### Shared rules for both cases
1. One trial, one clock, one charge on day 7. Plan changes and seat additions adjust the **amount** charged on day 7.
2. The day-7 total always reflects the final plan and final seat count at trial end.
3. Cancel before day 7: nothing charged, regardless of plan switches or seats added.
4. Open item: whether a mid-trial plan switch resets the trial-end date (Case 1, point 5) is pending server confirmation.

---

## Global rules
1. The deck is never visible until checkout succeeds. Every path to the slides goes through "Try for Free".
2. Single checkout source (`checkout.html`) handles every paid action across both states (standalone, flow full screen, dashboard / settings modal). Context controls back/close behaviour only, never layout or copy.
3. One currency everywhere: $.
4. Copy voice: "Start your free trial to view your slides" (generation title + thumb tooltip), "7-day free trial" (badge), "Try for Free" / "Get your free trial" / "Try Pro for Free" / "Upgrade" (CTAs).
5. Closing or backing out never loses the generated deck. It stays as the one locked presentation on the dashboard.
6. No Gold upsell in the app chrome for trial users: no "Upgrade to Gold" / "Unlock" pills in the top bar. Gold appears only inside Settings → Billing, as an optional credit-pack / plan row ("Get Gold · 50,000 credits").

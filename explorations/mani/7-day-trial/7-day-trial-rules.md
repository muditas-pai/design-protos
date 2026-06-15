# 7-Day Trial: Rules Document

Step-by-step behaviour rules for the 7-day trial, screen by screen and state by state.
Pairs with the [flow spec](7-day-trial-spec.html) (which covers visual layout); this doc covers
**what each action does** and how the two user states differ.

Two user states:
- **State A — Free user**: exited generation, deck locked, never paid.
- **State B — In-trial user**: completed checkout, full Pro, 7-day clock running.

---

## State A — Free user (deck locked, not paid)

### Free user exits generation and lands on the dashboard
1. User clicks Exit (inside the pricing box, top right corner of the Generation screen).
2. Generation continues to completion in the background. The deck is saved either way, no progress is lost.
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
4. Cancel any time before the trial-end date, nothing charged, account drops to Free at trial end.

### Top bar (everywhere)
1. No trial pill, no countdown, no badges. Top bar looks identical to a paid Pro user: search, help, notifications, avatar.
2. No Upgrade button in the top bar.
3. Trial status lives in one place only: Settings → Billing.

### Editor
1. Deck fully visible and editable. No pricing page, no lock, no tooltip.
2. Filmstrip thumbs click through to slides normally.
3. All Pro features active: export, analytics, font pairs, color palettes, assign slide.

### Dashboard
1. All presentations open normally.
2. Prompt field, Upload, Import, pills: all work, no pricing modal.
3. No "Start your trial for $0" topbar text.
4. No premium features modal gates: Create project and other Pro items just work.
5. Hire an Expert opens the hire page, same as before.

### Settings panel — active user (`settings-active.html`)

The active user (in-trial or paid) uses one settings view, modelled on the Gold subscriber.

**Sidebar**
1. Workspace Settings: General, Members, Billing.
2. Profile Settings: Profile.
3. Hidden: Groups, Developer Console.
4. "Back to Home" is a non-navigating placeholder (does not return to the locked trial dashboard).
5. Workspace switcher shows the plan tag (e.g. "Gold"), no "Upgrade" link.

**Top bar (every settings page)**
1. No badges, no countdown pill, no Upgrade button. Identical to a paid Pro user.
2. Avatar opens a profile dropdown: name + email, credits left, Your Account (→ Profile), Language, Sign out.

**General**
1. Workspace avatar with camera button to upload a logo. Editable.
2. Workspace Name field. Editable.

**Members**
1. "Invite to workspace" box hidden for now.
2. Owner row shows in the Members list. Guests tab shows "No guests".

**Billing**
1. Plan header: Gold, sub line "$6,000/year · 5 seats · 250,000 Credits". Upgrade button (top right).
2. Invoice card: last invoice ("$6,000 paid Jun 8, 2026"), upcoming ("$6,000 on June 8, 2027"), "View all invoices".
3. Subscription Renewal card: "Next billing date June 8, 2027" + "Cancel renewal".
4. Credits card: "250.2k credits left", progress bar, "View credit history". "Need more credits?" one-off credit packs (2,500 → $24, 5,000 → $36).

**Profile**
1. Same as State A: photo, first/last name, email (read only), change password, role (read only), language, Delete Account.

---

## Billing use cases

### Case 1 — Upgrade Pro trial to Gold mid-trial
1. User is on a Pro trial (7-day clock already running).
2. User switches the plan to Gold during the trial (example: on day 4 of 7).
3. The trial clock does **not** reset. The same 7-day window continues from the original start date.
4. The plan changes to Gold immediately. Gold features and Gold credit allowance apply from the switch.
5. On day 7, the user is charged the **Gold** price (not Pro). No proration, no separate charge for the days already spent on Pro.
6. Downgrade Gold → Pro during trial follows the same rule: same clock, charged the Pro price on day 7.

### Case 2 — Add users to a workspace during the trial
1. Workspace owner activates a Pro trial for 1 user license (example: Mani).
2. Owner adds more users to the workspace during the trial (example: Tejas and Muditha added on day 3).
3. New users get Pro trial access immediately, under the **same** 7-day clock as the owner. No separate trials, no reset.
4. Seats are billed per user. The new users are added to the single trial invoice, not charged separately.
5. On day 7, the workspace is charged for **all** active seats at the plan price.
6. Example (Pro annual, $240 per user): Mani $240 + Tejas $240 + Muditha $240 = **$720** for 3 users, charged once on day 7.
7. Removing a user before day 7 drops their seat from the day-7 charge. Only seats active at trial end are billed.

### Shared rules for both cases
1. One trial, one clock, one charge on day 7. Plan changes and seat changes only adjust the **amount** charged on day 7, never the date.
2. The day-7 total always reflects the final plan and final seat count at trial end.
3. Cancel before day 7: nothing charged, regardless of plan switches or seats added.

---

## Global rules
1. The deck is never visible until checkout succeeds. Every path to the slides goes through "Try for Free".
2. Single checkout source (`checkout.html`) handles every paid action across both states (standalone, flow full screen, dashboard / settings modal). Context controls back/close behaviour only, never layout or copy.
3. One currency everywhere: $.
4. Copy voice: "Start your free trial to view your slides" (generation title + thumb tooltip), "7-day free trial" (badge), "Try for Free" / "Get your free trial" / "Try Pro for Free" / "Upgrade" (CTAs).
5. Closing or backing out never loses the generated deck. It stays as the one locked presentation on the dashboard.

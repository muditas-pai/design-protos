# Slide limit & upgrade logic

Reference for when the slide-limit gate fires and what the upgrade prompt offers, across
standard and trial users. This is the logic behind the [free-slide-limit-card](crazy8s.html).

## Plan limits

| Plan | Slide limit |
|------|-------------|
| Free | 15 |
| Pro | 60 |
| Gold | 99 (advertised limit / hard cap) |

## Group 1 — Standard users (no trial)

### Free users

- **< 15 slides** → No gate. Proceed to presentation.
- **> 15 slides** → Prompt: continue with first 15 slides, upgrade to Pro (60 slides), or upgrade to Gold (99 slides). Selecting an upgrade opens the checkout modal directly.

### Pro users

- **< 60 slides** → No gate. Proceed to presentation.
- **> 60 slides** → Prompt: continue with first 60 slides, or upgrade to Gold (99 slides). Selecting an upgrade opens the checkout modal directly.

## Group 2 — Trial users (7-day trial)

**There is no free trial tier.** A trial user can only get as far as *creating* a presentation. The finished presentation is never shown on a free trial — its **visibility is always gated behind upgrading to a paid plan** (Pro or Gold). The 7-day trial gates the **visibility of the completed presentation**, not the upload or the creation.

So the flow for every trial user is the same: create → the presentation generates → paywall → upgrade to a paid plan to view. There is no state in which a trial user sees the presentation without upgrading. What the upgrade unlocks depends on the plan and the slide count.

### Trial on a Free account

- **Any slide count** → creation is allowed and the presentation generates, but nothing is shown. The paywall appears after generation with Pro and Gold upgrade options.
- **Upgrade to Pro** → view up to 60 slides (the first 60 if the presentation is larger).
- **Upgrade to Gold** → view up to 99 slides.

Regardless of slide count, a Free-account trial user cannot view the presentation without upgrading — the free trial only ever produces a gated, unviewable presentation.

### Trial on a Pro account

- **< 60 slides** → creation allowed and the presentation generates; visibility is gated behind the paywall (upgrade to Pro or Gold to view).
- **> 60 slides** → gate triggers at upload. Prompt: continue with first 60 slides, or upgrade to Gold (99 slides).

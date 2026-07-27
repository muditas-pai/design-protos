# Analytics v1

Engagement analytics for a shared deck. v1 is deliberately small: **one published link per deck**, three metrics, each with a per-viewer breakdown, and three entry points. Fuller scope (source/geo, notifications, deal-room analytics) lives in the [Deck Analytics grounding](grounding.html) and is out of v1.

**Source:** Linear [PRE-105](https://linear.app/design-fontend/issue/PRE-105/analytics-v1) · **Owner:** Mudita · **Relates to:** [grounding](grounding.html) · prototype [deck-analytics-modal](deck-analytics-modal.html)

## The model: one published link

- Every deck has **exactly one published link**.
- The user must **explicitly publish** it, the link is not created automatically.
- **Publishing the link is what turns analytics on.** Analytics are the analytics *for that link*.
- Before a deck is published there is no link and no analytics.

```
deck  ──(user clicks Publish)──►  one published link  ──►  analytics for that link
(no link yet, no analytics)
```

## The three metrics

v1 focuses on three metrics only. Each is shown for the deck as a whole, and each has a per-viewer breakdown (see below).

| # | Metric | What it answers |
|---|---|---|
| 1 | **Median time per slide** | How long viewers spent on each slide |
| 2 | **Engagement across slides** | Where viewers drop off, slide by slide |
| 3 | **Views** | How many times the deck has been viewed (total views) |

## Per-viewer breakdown

Every metric follows the same shape: the **aggregate** for the metric, then a **table of all viewers** beneath it. Clicking a viewer opens **their detailed breakdown** for that metric.

```
[ metric: aggregate view ]        ← e.g. median time per slide, drop-off, total views

VIEWERS                           ← table of everyone who viewed the published link
  Visitor from London   …        │
  Visitor from Mumbai   …        │ ── click a viewer ──►  [ that viewer's detailed breakdown ]
  …                              │
```

## Touchpoints

Three entry points into analytics.

### 1. Editor — top right

A new **"Analytics"** option in the editor's top-right, **next to the Present button**.

```
top-right of the editor:   … [ Share ]  [ Analytics ]  [ ▶ Present ]
                                          └ new
```

### 2. Share — when publishing the link

In **Share → external share** (where the user publishes the link), show a **card that introduces the analytics feature** — so publishing and "you now get analytics" are connected in the same moment.

### 3. Dashboard — deck context menu

On the dashboard, **right-click / open the context menu on any deck** → a **"View analytics"** option. It sits **within the first few options**, **not** tucked inside the three-dot "more" menu.

```
right-click a deck:
  ┌───────────────────────┐
  │ Open                   │
  │ View analytics    ◄ here (top-level, not under ⋯)
  │ Rename                 │
  │ …                      │
  └───────────────────────┘
```

## Not in v1

Kept out to keep v1 small (see the grounding for the full picture): source / geo, notifications, link controls beyond publish, and deal-room (room-scoped) analytics.

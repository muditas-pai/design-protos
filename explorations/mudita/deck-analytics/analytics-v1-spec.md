# Analytics v1

Engagement analytics for a shared deck. Deliberately lean v1. Fuller scope (source/geo, notifications, deal-room analytics) lives in the [grounding](grounding.html).

**Source:** Linear [PRE-105](https://linear.app/design-fontend/issue/PRE-105/analytics-v1) · [Figma handoff](https://www.figma.com/design/OywpgPNGvoFAIS4haGGehy/JAS--26---Handoff?node-id=334-6658) · prototype [deck-analytics-modal](deck-analytics-modal.html)

## Model

- One published link per deck. The user must publish it explicitly. Publishing is what turns analytics on; analytics are for that link.

## Metrics (3)

Each has a viewers table beneath it; click a viewer to see their detailed breakdown.

1. Median time per slide
2. Engagement across slides (where viewers drop off)
3. Views (total)

## Touchpoints

- **Editor:** "Analytics" button, top-right, next to Present.
- **Share (external / publish):** a card introducing the analytics feature.
- **Dashboard:** "View analytics" in the deck's right-click menu, top-level (not inside the ⋯ more-menu).

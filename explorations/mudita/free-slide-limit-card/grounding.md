# grounding — free-slide-limit-card

A chat-flow card that tells a **Free-tier** user their uploaded PPT exceeds the slide limit,
so we'll build a deck from the **first 15 slides** — and shows the upgrade path if they want
the whole thing. Explored via crazy8s; keep the UI simple/clean, focus on the **messaging**.

## The scenario

- User uploads a `.pptx` with e.g. **30 slides** (any number over 15).
- **Free** builds **15 slides**. **Basic & Pro → up to 60**. **Gold → up to 99**.
- We build the first 15 now; upgrading unlocks the rest.

## Where it lives (integration point)

`src/chat/PptxImportChatFlow.jsx` — appears **after Level 1 ("What do you want to do") and
before Level 2**, as a card in the same conversational stream (`PptxQuestionFlowCard` family).
Slide count is known from the upload response (`response.slideCount`), so this can gate here.

## Card pattern to match (from PptxQuestionFlowCard)

- Card sits inline in the chat thread (not a modal). Header = title `text-body-lg-medium` +
  description `text-body-base-regular text-text-secondary`.
- Option rows: `rounded-xl`, an emoji/icon badge (`w-7 h-7 rounded-md bg-bg-primary
  shadow-elevation-02`), a label, a tertiary tagline; **navy `darkblue-500`** = selected/action.
- Upgrade CTA dispatches `EVENT_UPGRADE_PLAN` (`entryPointElement: "SlideCount"`).
- Built on `design-system/` tokens (navy `#0A1925` = action, orange = brand/upsell only).

## Voice & tone (from the Voice and Tone Guide)

- **"We" language**, specific, short/direct, **positive framing**, benefits over features.
- **State the fact, don't scold**: "Your presentation has 30 slides." — never "you've exceeded…".
- **No unnecessary apologies** ("Sorry, but you'll need to upgrade" ❌ → "Ready to keep all 30?" ✅).
- **No false urgency / scarcity.** Pricing moments may be *mildly* playful ("Ready to go bigger?").
- Consistent term: **"presentation"** (not deck/slides/PPT interchangeably).

### Copy direction (crazy8s should vary the framing)

- Fact: *"Your presentation has 30 slides."*
- What we'll do: *"Free presentations include 15 slides. We'll build your first 15 now."*
- Path up (capability, not restriction): *Basic & Pro — up to 60 slides · Gold — up to 99.*
- Actions: primary *"Continue with 15"* (positive) + navy *"See upgrade options"*.

## TODO

- [ ] crazy8s round 1 — 8 simple, messaging-forward variations. Pick a direction.
- [ ] Real numbers/tiers confirmed with product before dev.

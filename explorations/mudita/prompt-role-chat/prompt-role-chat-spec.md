# Prompt → Role → Chat — behaviour & states

A behaviour spec for the create flow: type a prompt, tailor the deck to a role, then land in
chat. This is **not** an implementation guide (the prototype is throwaway HTML/CSS) — it exists so
the states and their nuances survive the rebuild. Read it as "what should be true," not "how to
build it." Where a detail is easy to lose in translation, it's called out as a **Nuance**.

Prototype: `prompt-role-chat.html`. Figma origin: JAS — Working file, node `160-1834`.

## The flow at a glance

```
  PROMPT (landing)            ROLE STAGE                         CHAT
  ┌───────────────┐  Continue ┌───────────────┐  Create        ┌───────────────┐
  │ big title     │ ────────▶ │ small title   │  Presentation  │ prompt as 1st │
  │ full prompt   │           │ collapsed     │ ─────────────▶ │ message +     │
  │ box (focused) │ ◀──────── │ prompt + role │                │ brand loader  │
  │ + suggestions │   Back    │ selection     │                │               │
  └───────────────┘           └───────────────┘                └───────────────┘
```

Three things drive almost every decision:

- **Roles do not depend on the prompt.** A role is *who the user is* (a fixed set of job functions),
  not *what they're making*. So editing the prompt never re-runs or re-filters anything.
- **One primary action per screen.** On the landing it's **Continue**; in the role stage it's
  **Create Presentation**. Nothing competes with them.
- **The prompt is always preserved** as the user moves between states — collapsing, editing, going
  back, or entering chat never loses their text.

## Screen 1 — Prompt (landing)

The entry surface. The user describes their deck.

- **Title** is large here ("Describe your deck, or upload a file").
- **Prompt box** is the full compose box: a Brand Kit promo row on top, a roomy multi‑line input,
  and a row of actions (Upload files / slide count / model / settings) with a **Continue** button on
  the right.
- Below the box: quick action chips (Import PowerPoint, Hire an Expert, Use a Template, Refresh Data)
  and a list of example prompts.
- **Continue** is disabled until there's text. Example prompts fill the box and proceed in one tap.

| Trigger | Result |
|---|---|
| Type text | Continue becomes enabled |
| Continue (or an example prompt) | Go to the Role stage — **immediately**, no loading step (see Nuance) |

**Nuance — no "reading your prompt" loader.** Because roles don't depend on the prompt, there's
nothing to process before showing them. Continue reveals the role section right away. Don't add a
spinner/shimmer here.

## Screen 2 — Role stage

Same screen, restructured: the prompt **collapses** to make room for role selection.

What changes on entry from the landing:

- **Title shrinks** to the smaller size and stays the same size as the "Tailor this deck to your
  role" heading — the whole screen reads calmer and more compact.
- **Prompt box collapses** to a single line (see *The prompt box* below).
- The action chips and example prompts are **replaced** by the role section.
- **"Create Presentation" is not shown yet.** It only appears once a role is chosen.

### The prompt box has three states

```
  FULL (landing / focused)     COLLAPSED (resting)          ACTIVE (editing in place)
  ┌────────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐
  │ Brand Kit row          │   │ Brand Kit row          │   │ Brand Kit row          │
  │ ┌────────────────────┐ │   │ prompt text (1 line…)  │   │ ┌────────────────────┐ │
  │ │ multi-line input   │ │   │ actions · (no button)  │   │ │ editable input     │ │
  │ │                    │ │   └────────────────────────┘   │ │ (text preserved)   │ │
  │ actions · [Continue] │ │                                │ actions · (no button)│ │
  └────────────────────────┘                                └────────────────────────┘
```

- **Full** — the landing state. Multi-line, focused, with the **Continue** button.
- **Collapsed** — the resting state in the role stage. Sleeker: one line of prompt text (truncated
  with "…" if long), body-size. It **keeps the Brand Kit row and the actions row** — it's a
  condensed version of the box, not a stripped-down pill. It has **no button** on the right.
- **Active** — the user tapped the collapsed box to edit. It re-opens as the editable box (text
  preserved, focused), roles still visible below. Also **no button** on the right.

Transitions between prompt states:

| From | Trigger | To | Notes |
|---|---|---|---|
| Collapsed | Tap the collapsed prompt | Active (editing) | **Stays on the role screen — roles remain below.** Does *not* return to the landing. |
| Active | Click/focus anywhere outside the box | Collapsed | The edit is kept automatically. **There is no Save button.** |
| Collapsed / Active | **Back** (top-left) | Full (landing) | Returns to the landing with the example prompts, text preserved. **Back is the only way back to the landing.** |

**Nuance — tapping the prompt ≠ going back.** Tapping the collapsed prompt edits it *in place*
(roles stay). Only the **Back button** returns to the landing (with suggestions). These are two
different intents and must not be conflated.

**Nuance — no Save button, editing is implicit.** The user just edits and moves on; the box commits
the edit whenever focus leaves it. Don't introduce a Save/confirm affordance.

### Role selection

Twelve roles shown as equal-width cards in a 3‑wide grid: Consulting, HR, Product, Design, Sales,
Engineering, Marketing, Finance, Investor, Legal, Operations, Communications. Each card is an emoji +
the role name. **The full set is always shown — roles are never filtered or reordered by the prompt.**

Picking a designation within a role:

```
  Tap a role card ──▶ a menu opens over that card (same width):
                      ┌─────────────────────────┐
                      │ 🔍 Your designation      │   ← search field, autofocused
                      ├─────────────────────────┤
                      │ Account Executive        │
                      │ Sales Manager      ◀──── │   ← highlighted (keyboard/hover)
                      │ Sales Development Rep    │
                      │ …                        │
                      └─────────────────────────┘
  Type to filter · ↑/↓ to move · Enter to pick · Esc to close · click a title to pick
```

- The menu **overlays the tapped card** and matches its width (it belongs to that card).
- The list is the titles for that role. **Any typed title is accepted** (a free-text entry appears
  so the user is never blocked by a missing option).
- Picking a title **selects that card** and closes the menu. It does **not** navigate anywhere.

The **selected card** state:

- The leading **emoji is replaced by a check** — this keeps the card the exact same width (no extra
  element is added).
- The label shows the **chosen title**, truncated with "…" if it's longer than the card. **The card
  never grows or reflows the row.**
- The card gets a selected outline.
- Only one role can be selected. Picking a title in a different role moves the selection there; the
  previous card reverts to its plain emoji + role name.

```
  unselected            selected
  ┌────────────────┐    ┌────────────────┐
  │ 📈 Sales       │ ─▶ │ ✓ Sales Manager│   emoji → check, title truncates,
  └────────────────┘    └────────────────┘   width unchanged
```

**Nuance — reopening a selected role shows the pick on top, already highlighted.** If a role is
already selected and the user taps it again to change it, its menu opens with **the previously
chosen title pinned to the very top of the list AND shown as the highlighted item.** This guarantees
their current choice is the first thing they see (never scrolled off), and Enter re-confirms it. This
must survive the rebuild — it's easy to lose and it's the difference between "where's my choice?" and
"there it is."

### Create Presentation (the CTA)

| Question | Answer |
|---|---|
| When does it appear? | **Only after a role is selected.** Not while the user is still browsing/picking. |
| Where does it sit? | Follows the role grid with a comfortable gap when everything fits on screen. |
| What if the content is taller than the screen? | It becomes **pinned to the bottom** (with a soft frosted fade) so it's always reachable. |
| What does it do? | **Always goes to Chat.** Always. See Nuances. |

**Nuance — the button appears only after a role is chosen.** Before selection there's no CTA on
screen. (This also keeps a designation menu from ever colliding with a button that isn't there yet.)

**Nuance — Create Presentation ALWAYS goes to chat.** Even if the user is mid-edit in the prompt box
when they click it. It must not "just collapse the box and stay." It commits whatever they've typed
and proceeds to chat, carrying the latest prompt text as the first message. Clicking Create is never
ambiguous — it always leaves for chat.

## Screen 3 — Chat

The generation view.

- The **prompt is the first message**, right-aligned as the user's bubble — using the *latest* prompt
  text (including any last-second edit made before Create).
- Directly below it, a **brand loader** with a status label. The loader animates (the mark builds,
  then spins) and the label cycles through stages (e.g. "Mulling over a few directions…" →
  "Structuring your outline…" → "Designing your slides…") to show progress.
- From here the real chat/generation continues.

## Full state map

```
                         ┌──────────────────────────── Back ───────────────────────────┐
                         ▼                                                              │
                    ┌─────────┐   Continue    ┌───────────────────────────────────────┐│
   (open flow) ───▶ │ LANDING │ ────────────▶ │ ROLE STAGE                            ││
                    └─────────┘               │                                       ││
                                              │  prompt: COLLAPSED ⇄ ACTIVE (tap/blur)││
                                              │  role:   none → picking → SELECTED    ││
                                              │  CTA:    hidden ──(role picked)──▶ shown
                                              └───────────────────────────────────────┘
                                                        │ Create Presentation (any time it's shown)
                                                        ▼
                                                    ┌──────┐
                                                    │ CHAT │
                                                    └──────┘
```

## Checklist — the nuances that must not get lost

- [ ] **No loader** between Continue and the roles — roles appear immediately.
- [ ] Title is **large on landing, small in the role stage**.
- [ ] Collapsed prompt **keeps the Brand Kit row + the actions row**; it's a condensed box, not a pill.
- [ ] Collapsed/active prompt has **no Save (or any) button**; editing commits on blur.
- [ ] **Tapping the prompt edits in place** (roles stay); **Back** is the only route to the landing.
- [ ] Roles are **never filtered or reordered by the prompt** (ranking is an allowed future option; filtering is not).
- [ ] Selected card: **emoji → check, title truncates, width fixed**, row never reflows.
- [ ] **Reopen a selected role → the chosen title is pinned to the top and pre-highlighted.**
- [ ] Any typed designation is accepted (free-text fallback).
- [ ] **Create Presentation shows only after a role is picked.**
- [ ] Create is **static below the roles**, or **pinned to the bottom on overflow**.
- [ ] **Create always goes to chat**, even mid-edit, carrying the latest prompt text.
- [ ] Chat opens with the **prompt as the first message** + the animated brand loader.

## Open questions / future

- **Role ranking (not filtering).** Floating the 2–3 most-likely roles to the top based on the prompt
  is the one prompt↔role coupling that could help. Optional; the current spec keeps a fixed order.
- **Confirm the 12 roles + emoji** against the real onboarding role set.

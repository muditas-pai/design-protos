# Presentation score · engineering spec

Draft, 25 Nov 2026. What we're building, how the score works, and how the panel behaves, for engineering.

- **Prototype:** https://muditas-pai.github.io/design-protos/explorations/mudita/presentation-score/score-panel.html
- **Scoring rubric (full anchors and calibration):** https://muditas-pai.github.io/design-protos/explorations/mudita/presentation-score/rubric-spec.html
- **Code mapping and running notes:** `grounding.md` in this folder (ages with the code, check before trusting)

The prototype's bottom-right "Prototype controls" box is demo-only. Use it to switch plan (Free, Pro, Gold) and the entry mode, and to replay generation.

## In one paragraph

After a presentation is generated, we score it out of 100 against the user's goal, and show what would raise the score. Every finding falls into one of three kinds: **we fix it** (one click, costs credits), **it needs you** (real data or images only the user has), or **it's on a paid plan** (brand kit, designer review). The panel is a to-do list the user works through while editing, so it stays open and updates in place as things get fixed.

## Why we're building it

A generated deck can look finished and still fail at its job: no clear ask, label titles, unsourced numbers, empty placeholders. Users can't easily see that. The score does three things:

1. **Tells the user if the deck will work**, not just if it looks good. Objective, storyline and evidence carry 70 of the 100 points, so a pretty deck with no ask scores low.
2. **Turns the gap into actions.** Every lost point maps to a fix the user can take.
3. **Shows where a plan helps**, honestly: the points a plan adds are listed like any other fix, not hidden behind a lock icon.

## The flow

```
 generate deck
      │
      ▼
 slides stream in ── status pill: "Generating your slides · Slide n of 9"
      │
      ▼
 scoring ─────────── status pill: "Checking your presentation"
      │              Score button appears in the top bar with a spinner
      ▼
 score ready
      │
      ├── entry A: panel opens on its own
      │      └── user closes it ──► one-time hint under the Score button:
      │                              "Your score and fixes stay here."
      │
      └── entry B: coachmark under the Score button
             "Your presentation scores 53. We found 9 fixes we can make
              for you, and 3 that need your input."   [See fixes] [Later]
```

Both entries are in the proto. **We haven't picked one yet** (see open questions). After either, the Score button stays in the top bar for good.

## The scoring model

### Step zero: the goal

We score against a goal: the audience and what they should do. It's inferred from the prompt and slides (*Investors back your Series A*), shown at the top of the panel, and editable. Saving a new goal re-scores the deck. If we can't infer a goal, we ask before scoring.

### Five dimensions, weighted

Each dimension is judged 1 to 5 against written anchors, then weighted. Level 5 earns the full weight, level 1 earns nothing, and levels in between scale evenly.

| Dimension | The question it answers | Weight |
|---|---|---|
| Objective and ask | Is it clear what you want your audience to do, and by when? | 20 |
| Storyline | Do the slides lead with the answer, and do the titles alone tell the story? | 25 |
| Evidence and insight | Is every key claim backed by data, with a source and a clear so-what? | 25 |
| Audience fit | Are the depth and language right for these people, and are their concerns answered? | 15 |
| Slide design | Is each slide easy to read, consistent and on brand? | 15 |

```
Objective   ████████████     20
Storyline   ███████████████  25
Evidence    ███████████████  25
Audience    █████████        15
Design      █████████        15
```

Points from a level: `points = weight × (level − 1) / 4`. In the panel we show points; the level is derived from them for the anchor text: `level = 1 + round(4 × points / weight)`.

The anchors for each level, the must-haves per presentation type (investor pitch, sales, internal decision, report) and how we calibrate are in the rubric spec. That doc is the source of truth for **how a level is set**; this one is about **what the product does with it**.

### Bands

| Score | Band | Tone |
|---|---|---|
| 90 to 100 | Ready to present | green, with a check |
| 80 to 89 | Strong | green, with a check |
| 60 to 79 | Good draft | neutral |
| 0 to 59 | Needs work | amber |

### Every finding carries its points

A finding is worth exactly the points its dimension would gain if it were fixed. The score is the sum of the five dimensions; each dimension is its current points plus the points of the findings already done. Capped at 100.

The proto's sample deck, to show how the parts add up:

```
now             ███████████████████████████            53  Needs work
+ we fix        ██████████████                        +28  → 81 Strong
+ needs you     █████                                  +9  → 90 Ready to present
+ paid plans    ██                                     +3  → 93
```

**Rule for the backend:** the points across all open findings in a dimension can't push that dimension past its weight. The panel trusts the numbers it's given and adds them up.

## The three kinds of fix

| Kind | What it is | How it's done | Cost | Examples in the proto |
|---|---|---|---|---|
| **We fix** (`auto`) | Something the agent can change on its own | Checklist, one button runs all checked fixes | Credits per fix | End on a clear ask · Make titles state the point · Cite the market numbers · Use one heading font |
| **Needs you** (`manual`) | Real data or real images we must not invent | The row title is the action: fill in on the slide, or upload | Free | Fill in your traction numbers · Add a screenshot of your app · Add team photos |
| **Upgrade** (`plan`) | A fix that needs a paid plan | Upgrade card with one button. After upgrading the fix moves into *We fix* | The plan | Apply your brand kit (Pro) · Get a designer's review (Gold) |

A finding's kind depends on the user's plan: a `plan` finding is shown as **Upgrade** when the plan doesn't allow it, and as **We fix** when it does.

What we never do for the user: invent numbers, generate fake product screenshots, or generate team faces. Those are always *Needs you*.

## Data the panel needs

One payload per scoring run. Field names are suggestions; the shape is what matters.

```jsonc
{
  "goal": "Investors back your Series A",
  "goal_inferred": true,
  "score": 53,                         // 0..100, sum of dimension points
  "dimensions": [
    { "id": "objective", "points": 6,  "weight": 20 },
    { "id": "storyline", "points": 17, "weight": 25 },
    { "id": "evidence",  "points": 10, "weight": 25 },
    { "id": "audience",  "points": 11, "weight": 15 },
    { "id": "design",    "points": 9,  "weight": 15 }
  ],
  "findings": [
    {
      "id": "ask",
      "type": "auto",                  // auto | manual | plan
      "dimension": "objective",
      "points": 8,
      "slides": [9],                   // empty = applies to every slide
      "credits": 4,                    // auto and plan only
      "title": "End on a clear ask",
      "why": "Your last slide says Thank you. We'll state the raise and what it pays for, so investors leave knowing the next step."
    },
    {
      "id": "traction",
      "type": "manual",
      "dimension": "evidence",
      "points": 5,
      "slides": [6],
      "action": "fill",                // fill | upload | upload_many
      "target": "traction",            // the element on the slide to highlight
      "title": "Fill in your traction numbers",
      "why": "Slide 6 has three empty numbers. Only you know these."
    },
    {
      "id": "brandkit",
      "type": "plan",
      "plan": "pro",                   // pro | gold
      "dimension": "design",
      "points": 2,
      "slides": [],
      "title": "Apply your brand kit",
      "why": "We'll add your logo, colors and fonts to every slide."
    }
  ]
}
```

Plus, per user: plan, credit balance. Per finding over time: `done`, `skipped`, and for `auto` fixes, enough to undo.

`title` and `why` are user-facing copy. They follow `VOICE_TONE.md`: "we" language, short and specific, name the slide and the actual problem ("84 words", "says Thank you"), no em dashes.

## The panel, top to bottom

```
┌ Presentation score ─────────────────── ✕ ┐
│ 53 / 100                     Needs work  │  hero
│ Goal  Investors back your Series A   ✎   │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒░░░·                   │  one bar, four segments
├──────────────────────────────────────────┤
│ We fix 9 │ Needs you 3 │ Upgrade 2        │  sticky jump nav
├──────────────────────────────────────────┤
│ WE CAN FIX THESE                 +28 pts │  section band
│ ☑ End on a clear ask              +8 pts │
│   Your last slide says Thank you…        │
│   Objective and ask · Slide 9            │
│ ☑ …                                      │
│ [ ✦ Fix 9 issues   +28 pts · 22 credits ]│
│   You have 120 credits. You can undo any fix.
├──────────────────────────────────────────┤
│ THESE NEED YOU                    +9 pts │
│ ▢ Fill in your traction numbers →  +5 pts│
│ ▢ Add a screenshot of your app ↑   +3 pts│
├──────────────────────────────────────────┤
│ AVAILABLE ON PAID PLANS           +3 pts │
│ ┌ Pro ─────────────────────────────────┐ │
│ │ Your presentation could reach 83     │ │
│ │ with Pro                             │ │
│ │ [slide 1 now] → [with your brand kit]│ │
│ │ Apply your brand kit         +2 pts  │ │
│ │ [ Upgrade to Pro ]                   │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ ✓ Done 4                               ˅ │  accordion
│ ▤ How we score                         ˅ │  accordion
└──────────────────────────────────────────┘
```

### Hero

- **Score** large, `/ 100` and the band tag on one baseline. Numbers use tabular figures.
- **Goal** line with a pencil button. Edit inline, Enter saves, Escape cancels. Saving shows a toast: "Goal saved. We'll score against it from now on." and should re-score.
- **The bar** has four segments in order: now · we fix · needs you · plan. Segment width is points (1 pt = 1% of the bar). Hovering a segment dims the others and shows a tooltip with the section name and its points. Clicking a segment (other than *now*) scrolls to that section.

### Jump nav

Sticky under the hero. One tab per kind that has open findings, each with a count. Hidden when only one kind is left. It **scrolls**, never filters. The active tab follows scroll position.

### We can fix these

- Each row: checkbox, title, why, then a meta line with the dimension name and slide links ("Slides 4, 7", or "All slides"), points on the right.
- **All checked by default.** The button lives at the end of this section (the checkboxes only apply here): `Fix N issues`, with `+pts · N credits` underneath, recalculated as the user checks and unchecks. None checked: disabled, "Pick a fix above".
- Under the button: "You have N credits. You can undo any fix."
- Fixes the user just unlocked by upgrading slide in with an entrance animation and are checked.

### These need you

- The **title is the action** (link style, with an arrow for fill-in or an upload icon for uploads). No separate button.
  - `fill`: go to the slide, flash the target area, focus the first empty field. Enter moves to the next field. When every field is filled, the finding completes on its own.
  - `upload`: file picker, then go to the slide and place the image.
  - `upload_many`: multi-file picker (team photos fill in order).
- Partial progress shows in the meta line ("2 of 3 added").
- Placeholders on the slide itself are clickable too (the empty screenshot box, the dashed team circles).

### Available on a paid plan

- One indigo card. Eyebrow with the plan, then **setup → payoff**: "Your presentation could reach *83 with Pro*". The reachable number is today's score plus every *We fix* plus every plan finding up to that plan.
- If the brand kit is one of the findings, a before/after of slide 1 (now, with your brand kit).
- The list of plan findings with points. A finding from a higher plan than the button's carries its own plan tag.
- One button, "Upgrade to Pro" (or Gold), opens the upgrade modal.
- Section title: "Available on Pro", or "Available on paid plans" when it mixes Pro and Gold.

### Done

Accordion with a count. Each fixed item: check, title, and **Undo** for *We fix* items, or the points earned for *Needs you* items. Skipped items show "· skipped" with **Restore**. Opening it scrolls just enough to show all of it.

### How we score

Accordion. One block per dimension: name, "**6** of 20 pts", a thin bar, and the dimension's question underneath. Opening it scrolls it into view.

### Nothing left

When all three kinds are empty: a green check, "Nothing left to fix", "We'll check again when you change a slide."

## Interactions across the editor

| Where | What happens |
|---|---|
| **Score button** (top bar, before Share) | Gauge icon, "Score", the number coloured by band. Spinner and a skeleton number while scoring. A dot when *We fix* items are waiting and the panel is closed. Toggles the panel. |
| **Filmstrip badges** | Slides with open findings get a small badge on the thumbnail, only while the panel is open: a wand icon for *We fix*, a pencil for *Needs you*, both if both. Hover lists the fixes on that slide. Click goes to the slide, opens the right section and flashes the row. |
| **Row hover** | Highlights the thumbnails of the slides that row affects. |
| **Slide link in a row** | Goes to the slide and flashes the area the finding is about. |
| **Running fixes** | The panel scrolls to the top, checkboxes lock, the button reads "Fixing 3 of 9" with a spinner. Each row's checkbox turns into a spinner, then a check. After each fix: score tweens up, credits drop, the affected thumbnails show a quick refresh shimmer, the canvas re-renders if it's on that slide. At the end the done rows collapse and a toast reads "We fixed 9 issues. 22 credits used." with **Undo** (6 seconds). |
| **Undo** | From the toast: reverts the whole batch and refunds the credits. From Done: reverts one fix. Undone fixes go back into the list, checked. |
| **Completing a *Needs you* item** | Row collapses, toast: "Screenshot added. Your score is now 84." |
| **Upgrade** | Modal: plan tag, "Your presentation can reach N. / Pro gets it there in one click.", the plan findings, a line on the rest of the plan, "Upgrade to Pro", "Not now". After upgrading: panel opens (if closed), scrolls to top, plan findings appear in *We fix*, checked, toast: "You're on Pro. We added 1 fix to your list." |
| **Panel and other panels** | One right-hand panel at a time (opening Style closes Score). **Clicking outside does not close the Score panel**: it's a list you work through while editing. Escape or ✕ closes it. |
| **Score number changes** | Always tweens (about 0.5 to 0.7 s, ease-out), in the panel and the top bar together. |

## Plans and credits

| | Free | Pro | Gold |
|---|---|---|---|
| Score + all findings visible | ✓ | ✓ | ✓ |
| *We fix* (credits) | ✓ | ✓ | ✓ |
| *Needs you* | ✓ | ✓ | ✓ |
| Apply your brand kit | Upgrade | ✓ in *We fix* | ✓ in *We fix* |
| Designer's review | Upgrade | Upgrade (Gold) | ✓ in *We fix* |

Credit costs in the proto are placeholders (2 to 8 per fix, 120 to start). Plan fixes cost 0 credits in the proto ("included"). Real numbers come from presentation-services.

## Visual notes

- The panel uses the **live V2 editor** values, not `design-system/` (which is behind): indigo `#3427FF` for the primary action and for upgrade, system font stack, V2 greys. Values are in the proto's `:root` block.
- Points read "+4 pts" everywhere, in indigo for anything still to gain.
- Section headers are full-width grey bands with an uppercase label so they don't read as rows. Rows are full width with hairline dividers.
- Dock width 380px.

## Not in scope

- **Delivery** (how it's presented in the room, speaker notes, pacing). The score covers the slides people see or are sent.
- **Audience-side data** (asking share-link viewers what the main message was). Later phase, described in the rubric spec.
- **Quick checks** in the panel (elevator sentence, titles-only view). Tried and dropped: they repeated the ask and titles fixes. The tests still exist as how the model sets levels.
- **Score caps / gates.** Tried and dropped as too complex. The ask's weight does the work.

## What exists in the app today

`pitchdeckdoclist/src/editor/core/view/editor/deckscore/DeckScorePanel.jsx` on `new_dev_migration` (12 Oct 2026) has a sample-data panel with the same three kinds, but a different rubric (6 dimensions, 17 checks), tabs instead of one scroll, and two entry buttons in `TopMenu.jsx`. Both are gated to premium and standard tiers. There's no scoring backend. The differences from this proto are tabled in `grounding.md`.

## Open questions

| Question | Who |
|---|---|
| Entry after generation: open the panel on its own, or the coachmark only? | Design + PM |
| Which *We fix* items are truly one-click with today's agent (title rewrites, font unify, source lookup, chart takeaways)? | Eng |
| Does the score re-run after manual edits, on a timer, or only on request? The empty state promises "We'll check again when you change a slide." | Eng + Design |
| Do efficient and fast decks get a score? The live code hides it on those tiers. | PM |
| Real credit cost per fix. | Eng + PM |
| Gold designer review isn't instant. It needs a requested / in progress state, not a one-click fix. | Design |
| Should weights shift by presentation type (a report has a softer ask than a pitch)? | Design + Eng |
| Audience fit and parts of Storyline are model judgements. Can a user dispute a level? | Design |
| Is "Skip" needed for *Needs you* items? Done supports skipped + Restore, but the current rows have no Skip button. | Design |

## Known copy fix in the proto

The scoring status line says "Story, design, content and delivery". Delivery was dropped from the rubric; the line should name the five dimensions or say something shorter.

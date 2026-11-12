# Presentation score rubric

Draft, 12 Nov 2026. How we score a presentation out of 100, and which kind of fix each check leads to in the score panel (`score-panel.html`).

## The idea

The score answers one question: **will this presentation get its audience to do the thing it's for?**

So most of the points sit on the outcome and the proof behind it. Hygiene (brand, consistency, readability) still counts, but a polished deck with no clear ask can't score well.

```
Outcome    ████████████████████  40 pts  one clear result
Evidence   █████████████████▌    35 pts  data behind it
Hygiene    ████████████▌         25 pts  brand, consistency
```

## Step zero: name the outcome

Everything is scored against a stated outcome, so we set it before scoring.

- We infer the **presentation type** and the **outcome** from the prompt and the slides, for example *Investor pitch · Investors commit to a $12M Series A*.
- It shows at the top of the score panel as **Goal**, and the user can edit it. Editing the goal re-scores the deck.
- If we can't tell what the outcome is, we ask before scoring. A score without a goal would only measure polish.

## 1. Outcome · 40 pts

Does every part of the presentation push toward one clear result?

| Check | Pts | What we look for | Fix kind |
|---|---|---|---|
| Specific ask | 10 | The presentation says what the audience should do, with a number or date where it applies: *raise $12M*, *approve the Q3 budget*, *sign by 30 Jun 2027*. | We fix (draft it from the content). Needs you if the amount or date isn't anywhere in the deck. |
| Ask placed well | 5 | The ask is previewed in the first three slides and restated on the last one. Not a *Thank you* slide. | We fix |
| Every slide earns its place | 10 | Each slide supports the outcome. We flag slides that are off topic or repeat another one. | We fix (cut or merge, with the user's OK) |
| Story order | 8 | The order fits the presentation type. For a pitch: problem, solution, proof, ask. | We fix (reorder) |
| Objections answered | 7 | The obvious *why not* for this audience has an answer: risk, competition, cost, timing. | We fix (draft the slide). Needs you for facts we don't have. |

## 2. Evidence · 35 pts

Is there enough real data to support the outcome?

| Check | Pts | What we look for | Fix kind |
|---|---|---|---|
| Required proof present | 15 | Everything on the checklist for this presentation type (below). Each missing item costs an equal share of the 15. | Needs you (only the user has the real data) |
| Claims are specific | 6 | Numbers instead of adjectives: *82% gross margin*, not *high margins*. | We fix where the number is already in the deck. Needs you otherwise. |
| Claims are sourced | 5 | Market sizes and other third-party figures name a source. | We fix (find and cite the source) |
| No placeholders | 5 | No *XX*, sample text, empty charts or *Your logo here*. | Needs you |
| Real product and people | 4 | Product screenshots and team photos are real, not generated. | Needs you |

### Required proof by presentation type

| Type | Outcome | Must have |
|---|---|---|
| Investor pitch | Funding | Problem and its size, product, traction, business model, market, competition, team, use of funds |
| Sales or proposal | A purchase | The customer's problem, how we solve it, proof (case study, customer logos, results), pricing, next step |
| Internal decision | Approval | Context, options compared, recommendation, cost and impact, risks, timeline |
| Report or update | Alignment | Goals against results, key metrics with their trend, what changed, next steps |

Types we don't recognise fall back to a short generic list: a clear claim, at least one piece of data behind it, a next step.

## 3. Hygiene · 25 pts

Does it look like one coherent, on-brand presentation that is easy to read?

| Check | Pts | What we look for | Fix kind |
|---|---|---|---|
| Brand applied | 6 | Logo, brand colours and brand fonts from the brand kit. | Upgrade (brand kit is on Pro). We fix if the user already has a kit. |
| Readable slides | 5 | About 40 words or fewer per slide, a title that states the takeaway, labelled charts. | We fix |
| Type consistency | 4 | Two font families at most, one heading style, one body size. | We fix |
| Layout consistency | 4 | Shared margins and alignment, repeated elements (logo, footer, slide number) in the same place. | We fix |
| Colour consistency | 3 | Colours come from the theme or the brand palette. | We fix |
| Mechanics | 3 | Spelling, slide numbers, the same date and number format throughout. | We fix |

## Caps: the outcome comes first

Two caps stop polish from hiding a missing point:

| If | The total can't go above | Why |
|---|---|---|
| There is no specific ask | 69 (Good draft) | A presentation without an ask isn't ready, however good it looks. |
| More than half the required proof is missing | 79 (Good draft) | It can't be Strong until the claims have data behind them. |

The panel says when a cap applies, for example *Add a clear ask to go past 69*.

## Bands

| Score | Band |
|---|---|
| 90 to 100 | Ready to present |
| 80 to 89 | Strong |
| 60 to 79 | Good draft |
| 0 to 59 | Needs work |

## How this maps to the panel

- **Fix kinds** come straight from the tables: *We fix* goes to the checklist, *Needs you* to the user's list, *Upgrade* to the plan card.
- **How we score** shows the three areas (Outcome, Evidence, Hygiene) instead of today's four placeholder categories.
- **Goal** is new: one line at the top of the panel with the inferred outcome and an edit button.

## Open questions

- Who confirms the outcome when we infer it wrong, and does editing it cost credits to re-score?
- Should the weights shift by type? A report or update has a softer ask than a pitch.
- Do efficient and fast decks get the full rubric, or hygiene only? (The live code hides the score on those tiers.)
- *Every slide earns its place* and *Objections answered* need a model judgement. How do we show the reasoning so users trust it?

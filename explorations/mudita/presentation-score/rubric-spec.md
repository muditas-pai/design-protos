# Presentation score rubric

Draft, 12 Nov 2026. How we score a presentation, and which kind of fix each finding leads to in the score panel (`score-panel.html`).

## The premise

A presentation is good to the extent that it gets a specific audience to **understand, believe and act on** something. Every check below connects back to that. Objective, storyline and evidence carry 70 of the 100 points, so a deck without a clear ask or the data behind it scores low however good it looks. If it doesn't, we'd be scoring how slides look instead of whether they work.

## Outcomes and drivers

| | Outcome measures | Driver measures |
|---|---|---|
| What | Did it work? The decision was made, the budget approved, the audience recalls the message a day later. | Things we can assess in the slides, before they're presented or sent, that predict the outcome. |
| When we have it | Late, and noisy: a great deck can still lose to politics. | Right away, in the editor. |
| What we do with it | Check that the drivers are the right ones (see Calibration). | **This is the score in the panel.** |

## Step zero: the goal

We score against a stated goal, so we set it first: the audience, and what they should do. We infer it from the prompt and slides, for example *Investors · commit to a $12M Series A*. It shows at the top of the panel and the user can edit it. If we can't tell, we ask before scoring.

The score covers the presentation itself, the slides people see or are sent. How it is delivered in the room is out of scope.

## The five dimensions

Each dimension is scored 1 to 5, then weighted. A 5 earns the full weight, a 1 earns nothing, and the levels in between scale evenly.

| Dimension | What it asks | Weight |
|---|---|---|
| Objective and ask | One clear purpose and an explicit request or takeaway? | 20 |
| Storyline | Leads with the answer, flows logically, and the titles alone tell the story? | 25 |
| Evidence and insight | Claims supported, numbers sourced, the *so what* stated? | 25 |
| Audience fit | Depth, jargon and framing right for these people and their concerns (risk, cost, time)? | 15 |
| Slide design | One idea per slide, readable charts, no clutter, consistent and on brand? | 15 |

```
Objective   ████████████  20
Storyline   ███████████████  25
Evidence    ███████████████  25
Audience    █████████  15
Design      █████████  15
```

The deck has to work without a speaker (it often gets forwarded), so storyline and evidence carry the most weight.

## Anchors: what each level looks like

A 1 to 5 scale only means something if each level describes what we can observe. These anchors are what make two reviewers, or a reviewer and the model, give the same score.

### Objective and ask

| 1 | 3 | 5 |
|---|---|---|
| A reader can't say what the presenter wants. | There is an ask, but it is vague (*we should consider…*) or only appears at the end. | The ask is on the first two or three slides, specific (who, what, by when, how much), and every section supports it. |

### Storyline

| 1 | 3 | 5 |
|---|---|---|
| Slides are a list of topics. The titles alone say nothing. | A logical order exists, but the answer comes late and some titles are labels (*Market*, *Team*). | Leads with the answer, follows situation, complication, resolution, and the titles read as one argument. |

### Evidence and insight

| 1 | 3 | 5 |
|---|---|---|
| Claims are unsupported, or slides have placeholders (*XX*, empty charts). | Most claims have numbers, but some are unsourced and charts leave the *so what* to the audience. | Every key claim has data, third-party numbers are sourced, and each chart states its implication. Nothing the goal needs is missing. |

What *nothing missing* means depends on the presentation type:

| Type | Must have |
|---|---|
| Investor pitch | Problem and its size, product, traction, business model, market, competition, team, use of funds |
| Sales or proposal | The customer's problem, how we solve it, proof (case study, results), pricing, next step |
| Internal decision | Context, options compared, recommendation, cost and impact, risks, timeline |
| Report or update | Goals against results, key metrics with their trend, what changed, next steps |

### Audience fit

| 1 | 3 | 5 |
|---|---|---|
| Written for the author: jargon, the wrong depth, none of the audience's concerns addressed. | Mostly the right level, but some jargon or detail misses these people, and one obvious concern goes unanswered. | Depth and language fit this audience, and their likely concerns (risk, cost, time) are answered before they ask. |

### Slide design

| 1 | 3 | 5 |
|---|---|---|
| Crowded slides, unreadable charts, mixed fonts and colours, off brand. | Mostly clean, but a few dense slides or inconsistent styles. Brand partly applied. | One idea per slide, readable charts, a consistent hierarchy, and the brand kit (logo, colours, fonts) applied throughout. |

## Quick tests

The framework's diagnostic tests, run by us on every deck and shown in the panel as things the user can look at, not only as numbers.

| Test | What we do | Feeds |
|---|---|---|
| Headline test | Show the slide titles alone, as a list. Do they read as an argument? | Storyline |
| Elevator test | We write the core message in one sentence. The user confirms it matches what they meant, or corrects it. | Objective and ask |
| So-what test | For every chart, check that the slide states what it means. | Evidence and insight |
| Cold reader test | Flag slides that only make sense with a speaker there (bare charts, undefined acronyms). | Storyline, Audience fit |

The elevator sentence is also the **intended message** we compare against what the audience actually took away (below).

## Audience-side data (later phase)

When a deck is shared as a link, viewers can be asked one optional question at the end: *What's the main message, in your own words?* We compare the answers with the elevator sentence and show the presenter the gap between the message they meant and the message that landed. Of everything here, this gap tells the presenter the most.

## Calibration

1. **Agree on anchors.** Several reviewers and the model score the same three or four sample decks. Where they disagree, refine the anchors until the scores converge.
2. **Check against outcomes.** Over a few months, compare scores with the outcomes we can see: the *message received* gap, share-link engagement, and a short *Did it work?* prompt to the user after the presentation date.
3. **Adjust.** If a dimension doesn't track outcomes, lower its weight or redefine it.

## How this maps to the panel

| Dimension | Typical findings | Fix kind |
|---|---|---|
| Objective and ask | Missing or vague ask, ask only at the end | We fix (draft it). Needs you if the amount or date isn't in the deck. |
| Storyline | Label titles, answer comes late, off-topic slides | We fix (rewrite titles, reorder, cut with the user's OK) |
| Evidence and insight | Missing proof, unsourced numbers, chart without a *so what* | Needs you for real data. We fix sources and chart takeaways. |
| Audience fit | Jargon, unanswered concern | We fix (rewrite, draft a slide). Needs you for facts. |
| Slide design | Dense slides, inconsistent fonts, brand not applied | We fix. Upgrade for the brand kit. |

Panel changes this needs:

- A **Goal** line at the top.
- **How we score** lists the five dimensions, each with its 1 to 5 level and the anchor text for that level.
- A **titles only** view for the headline test, and the **elevator sentence** with a confirm or edit action.

## Open questions

- Do efficient and fast decks get the full rubric? The live code hides the score on those tiers.
- Should weights also shift by presentation type (a report has a softer ask than a pitch)?
- Audience fit and parts of Storyline are model judgements. We show the anchor text for each level so users can see why, but should a user be able to dispute a level?

# Presentation score · grounding

Volatile reference for `explorations/mudita/presentation-score/`. Ages with the code. Written 2 Nov 2026.

## What exists in the app today

- `pitchdeckdoclist/src/editor/core/view/editor/deckscore/DeckScorePanel.jsx` + `deckScoreSample.js`
  (on `new_dev_migration`, added by madhupitchdeck, 12 Oct 2026). **Sample data only, no scoring backend.**
- Same three kinds as this proto: one-click fixes (with a credit cost), manual (`manual: true`, "Go to it"),
  and locked (`locked: "paid" | "pro" | "expert"`).
- Rubric there: 6 dimensions (data, story, read, brand, fit, deliver), 17 checks, bands Needs work / Good draft / Strong / Ready.
- Entry: `TopMenu.jsx` has two triggers, `#reviewbtn` (shield icon + score, left of the bar) and `#deckscorebtn` (right side).
  Both are gated: shown only on `premium` / `standard` deck tiers (`GET /outline` `tier`), never on efficient / fast decks.
  Review runs once per deck (`review_done`).
- One right-hand panel at a time: opening Deck Score closes Credits and History (`toggleDeckScore`).
- `EditorSidePanel` closes on any outside pointer press.
- None of this showed on the live app (app.presentations.ai, Pro workspace, 2 Nov 2026): the header had no score or review button.

## How this proto differs (deliberately, fresh take)

| | Live sample panel | This proto |
|---|---|---|
| Structure | Tabs: Improve · Breakdown · Rubric | One scroll: score, then the 3 kinds as groups, breakdown folded at the bottom |
| Score visual | Ring + stacked bar | Large number + stacked bar (now · our fixes · your input · plan), legend in a 2×2 grid |
| One-click fixes | Fixed one card at a time | Checklist, all checked by default, one sticky "Fix N issues" button with points + credits |
| Manual fixes | "Go to it" | Inline action: upload in the panel, or jump to the slide and highlight the empty spot. Can be skipped |
| Locked | Mixed into the list | Own tinted card + one "Upgrade to Pro" button. After upgrading, the fix moves into the one-click list |
| Outside click | Closes the panel | Panel stays open: it's a to-do list you work through while editing slides |
| Entry | Button in top bar | "Score 68" button before Share, permanent once scored, with a dot while one-click fixes are waiting |

## Entry after generation (the two options asked for)

```
generation done ─┬─ Open the panel ─► user closes it, or opens Style ─► one-time hint under the Score button
                 └─ Tooltip only   ─► coachmark under the Score button: "See fixes" / "Later"
```

## Prototype decisions (not product decisions)

- Base score 68. One-click fixes add 14, manual add 8, Pro adds 5, Gold adds 2, for a maximum of 97.
- 4 categories of 25 (Story, Design, Content, Delivery) instead of the live 6. Open question.
- Credits: 120 to start, one-click fixes cost 2 to 8 each. Fixes unlocked by a plan are included.
- Plan colours: live V2 uses indigo `#3427FF` for both the primary action and Pro/upgrade, so the proto does too.
  This conflicts with `pai-visual-language`, which says navy for actions and Brand Blue for growth. The editor has moved on; the skill hasn't.
- `design-system/` is behind the live V2 editor (font, primary colour, greys). The proto uses V2 values in a local `:root` block.

## TODO / open questions

- [ ] Which fixes are really one-click with today's agent (rewrite, font unify, source lookup, speaker notes)?
- [ ] Does the score re-run after manual edits, or only on request?
- [ ] Tier gate: should efficient / fast decks get a score at all (live hides it)?
- [ ] Credit cost per fix: real numbers from presentation-services.
- [ ] Gold "designer review" is not instant. Needs a requested / in progress state.

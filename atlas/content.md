---
owner: Dhruv
as_of: 31 Jul 2026
source: hand-kept — each entry is a real string or number someone signed off, not a guess
---

# content

Every user-visible string and number an artifact may show. `atlas-build` resolves
`{{content:<dotted.key>}}` against this file at generation time and substitutes the value
literally. Nothing here is fetched at runtime — the built artifact carries plain text.

**A key that is not in this file is not invented.** The token survives into the artifact and the
build halts with the missing keys printed. That is the working path: add the lines, re-run.

## Format

One entry per line: `dotted.key = value`

- The **whole** dotted key is written on every line. Headings below are for humans only — lookup
  is a flat map, so a heading can be renamed or a line moved without breaking anything.
- Everything after the **first** `=` is the value, trimmed. No quotes. No multi-line values — a
  paragraph is one long line.
- Values are literal text. A number is just its text, in the form it should appear on screen
  (`25`, `1,200`, `4.5x`) — formatting is content, not code.
- Lines starting `#` are comments. Blank lines are ignored.
- Keys are unique across the file. A duplicate is an error, not an override.

## Adding to it

Append the line under whichever `##` heading it belongs to, or start a new heading. Bump `as_of`.
If the value came from somewhere — a spreadsheet, a billing system, a legal review — say where in
`source` or in a `#` comment above the line. Then re-run `atlas-build`; the halt clears itself.

---

## action

Labels for controls that mean the same thing everywhere.

action.save = Save changes
action.cancel = Cancel
action.close = Close
action.retry = Try again
action.back = Back

## empty.library

The empty state of a list nobody has put anything in yet.

empty.library.title = Nothing here yet
empty.library.body = Anything you make shows up here.
empty.library.cta = Make your first one

## notify.saved

The confirmation that follows a successful save.

notify.saved.title = Saved
notify.saved.body = Your changes are live for everyone on the team.

## onboarding.name

The step that asks a new person what to call them.

onboarding.name.question = What should we call you?
onboarding.name.hint = You can change this later in settings.

## limit

Numbers that appear in copy. Each one needs a source.

# from the seat model, reviewed 31 Jul 2026
limit.seats.max = 25
limit.upload.size = 100 MB

---

# Added 31 Jul 2026 to clear the halt on run
# explorations/dhruv/feature-gate-pricing-modal/runs/2026-07-31-01.
# PLACEHOLDER VALUES — plausible in shape, signed off by nobody. Replace before this
# artifact is shown to anyone. Source for the figures: none yet.

## gate.features

The flat list of what paying opens up, in display order.

gate.features.1.name = Brand kit
gate.features.1.line = Your fonts, colours and logo applied to every deck you make.
gate.features.2.name = Analytics
gate.features.2.line = See who opened a deck, which slides they stayed on, where they stopped.
gate.features.3.name = Custom templates
gate.features.3.line = Save any deck as a starting point the whole team can reach for.
gate.features.4.name = Advanced export
gate.features.4.line = Editable PowerPoint and print-ready PDF, with your fonts embedded.
gate.features.5.name = Shared workspace
gate.features.5.line = One place your team's decks live, everyone always on the latest.

## offer

The running discount.

offer.discount.percent = 40%
offer.savings.pro = $71
offer.savings.gold = $143

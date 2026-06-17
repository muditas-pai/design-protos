# Applied thumbnail

A single thumbnail, pinned to the top of the theme picker, that always shows the deck's
**currently applied** mood. It's a live mirror, not a saved option — override the colour or
font and it updates with the deck.

Demoed in [editor-theme-panel](editor-theme-panel.html).

## Why

The picker lists moods to choose from, but never shows *what's on the slides right now* — so the
canvas and the picker can disagree, especially once a user tweaks a mood's colour or font. The
applied thumbnail is the one place that's always true.

## Anatomy

- **Pill** — `Currently applied` (adapts: light pill on dark moods, dark pill on light).
- **Title** — the applied mood name.

## Title states

- Untouched mood → the mood name (*Mosaic Grid*).
- Palette or font overridden → `<mood> (modified)` (*Mosaic Grid (modified)*) — it keeps the
  lineage, never resets to a generic "Custom theme".

## Rules

- One thumbnail, always present, always live.
- Fixed position — switching moods never reflows the list below.
- The applied mood may also appear in the list below; that repetition is fine (don't hide it —
  hiding made the list jump).

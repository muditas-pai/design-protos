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
- **Descriptor** — the mood's one-liner (*Editorial · high contrast*), or the live `palette · font`
  once modified.
- **Motif** — the card uses the mood's *layout blueprint*, not a generic swatch.

## A mood is a blueprint

Each mood carries a motif that the thumbnail adopts and re-skins from the live theme:

| Mood | Motif |
|---|---|
| Monochrome News | radial gradient |
| Pastel Glass | light, centred name + accent underline |
| Split Pastel | half-and-half vertical block + text |
| Mosaic Grid | colour tiles + name |

## State = motif · palette · font

- **Apply a mood** → sets all three (adopts the blueprint).
- **Override the palette** → only colours change; the motif stays (Split's block recolours, tiles
  recolour). Same for **font**.
- The thumbnail, the focused slide, and every other slide thumbnail repaint together.

## Title states

- Untouched mood → the mood name (*Mosaic Grid*).
- Palette or font overridden → `<mood> (modified)` (*Mosaic Grid (modified)*) — it keeps the
  lineage, never resets to a generic "Custom theme".

## Rules

- One thumbnail, always present, always live.
- Fixed position — switching moods never reflows the list below.
- The applied mood may also appear in the list below; that repetition is fine (don't hide it —
  hiding made the list jump).

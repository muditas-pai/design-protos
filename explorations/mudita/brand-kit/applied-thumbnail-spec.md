# Applied thumbnail

A single thumbnail, pinned to the top of the editor **Theme → Design** tab, that always shows
the deck's **currently applied** mood. It's a live mirror, not a saved option — change anything
and it updates with the deck.

See it in [editor-theme-panel](editor-theme-panel.html). Context: [grounding](grounding.html).

## Why

A brand kit re-themes any deck. Before this, the panel listed kits and moods but never showed
*what's on the slides right now* — the canvas and the panel could disagree. The applied thumbnail
is the one place that's always true.

## Anatomy

- **Pill** — `Currently applied` (adapts: light pill on dark moods, dark pill on light).
- **Title** — the applied mood/kit name (e.g. *Patagonia*, *Mosaic Grid*).
- **Descriptor** — the mood's one-liner (*Editorial · high contrast*), or the live `palette · font`
  once modified.
- **Motif** — the card uses the applied mood's *layout blueprint*, not a generic swatch.

## A mood is a blueprint

Each mood carries a motif that the thumbnail adopts and re-skins from the live theme:

| Mood | Motif |
|---|---|
| Monochrome News · Patagonia | radial gradient |
| Pastel Glass | light, centred name + accent underline |
| Split Pastel | half-and-half vertical block + text |
| Mosaic Grid · Tessera | colour tiles + name |

## State = motif · palette · font

- **Apply a kit or mood** → sets all three (adopts the blueprint).
- **Change the palette** → only colours change; the motif stays (Split's block recolours, tiles
  recolour). Same for **font**.
- The thumbnail, the focused slide, and every filmstrip thumbnail repaint together.

## Title states

- Untouched preset → the preset name (*Patagonia*).
- Palette or font overridden → `<base> (modified)` (*Patagonia (modified)*) — it keeps the lineage,
  never resets to a generic "Custom theme".

## Rules

- One thumbnail, always present, always live.
- Fixed position — switching themes never reflows the cards below.
- The applied preset may also appear in its list below; that repetition is fine (don't hide it —
  hiding made the list jump).

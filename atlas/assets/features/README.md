# assets/features/

Eighteen pieces of media, one per paid feature — the picture an Upgrade modal shows next to its
pitch. Every feature has a `<slug>.jpg` at 1200 × 676. Three also ship a clip, and for those the
still **is** the clip's first frame, so one file is both the fallback and the `poster`.

This folder was `feature-modals/`. The media is not modal-only: a tile, a card, an empty state, a
banner, a paywall row — anywhere a feature is being sold, the picture comes from here.

Sizes and the `<video>` markup live in [`../README.md`](../README.md). This file is the roster and
the picking rule.

## The eighteen

Named for what each one sells, not for the trigger that fires it — every source file was called
`trigger…`, which inside a folder where they all are carries no information.

| File | Feature | What is in the frame | Kind |
|---|---|---|---|
| `ultra-models.jpg` | Ultra AI models | Isometric stack of translucent cards, an ULTRA pill on top, blue streak ground | illustration |
| `pro-models.jpg` | Pro AI models | The same stack, a PRO pill | illustration |
| `brand-kit.jpg` | Brand kit | A yellow *Brand Guidelines* card over a cyan card carrying a large **Aa** | illustration |
| `colours.jpg` | Custom colours | A fanned paint-chip deck, teal through orange | illustration |
| `fonts.jpg` | Custom fonts | Three **Ag** tiles, three different typefaces | illustration |
| `export.jpg` + clip | Export | An *Export Presentation* button inside concentric glow frames | illustration |
| `templates.jpg` | Templates | A fanned stack of template covers with a *Use template* cursor | slides |
| `long-decks.jpg` | Long decks | Many slide cards overlapping deep into the frame | slides |
| `refresh-from-source.jpg` | Refresh from source | A deck with a refresh icon, wired to Excel, Sheets, PowerPoint and PDF icons | slides |
| `assign-slides.jpg` | Assign slides | Two slides with avatar chips pinned to them | slides |
| `meet-and-edit.jpg` | Meet and edit | A slide under two named live cursors — *Increase font size*, *Change the color* | slides |
| `invite-members-free.jpg` | Invite members, free plan | Dark slides under two named cursors, free-plan variant | slides |
| `projects.jpg` | Projects | The Marketing project, deck cards in a grid, sidebar | product UI |
| `project-knowledge.jpg` | Project knowledge | A *Project knowledge* panel, mixed file types uploading | product UI |
| `comments.jpg` | Comments | A comment thread beside a dark slide, three commenters | product UI |
| `meet-and-present.jpg` | Meet and present | Presenting view — one big slide, a filmstrip, a 2/10 pager | product UI |
| `analytics.jpg` + clip | Analytics | *Total watch time 25m 29s*, a histogram, viewer avatars | product UI |
| `invite-members.jpg` + clip | Invite members | A dashboard chart panel, a cursor, a comment bubble | product UI |

`invite-members` and `invite-members-free` are two assets for related triggers; the `-free` one is
the free-plan variant and came as a still only.

## Kind decides how safely it travels

The third column is the one that matters when you are reaching for a picture that was not made for
your screen.

| Kind | | Ages |
|---|---|---|
| **illustration** | No product UI at all — 3D objects on a blue ground | Never dates. Nothing in it can contradict a screen |
| **slides** | Deck imagery only, no app chrome | Safe. Slides are content, and content is meant to differ |
| **product UI** | Real app chrome — sidebars, panels, toolbars | Dates with the product, and will disagree with a screen that draws today's chrome beside it |

## Using one for a feature that is not on this list

**Do it.** A feature being sold in a modal, a tile, an upsell row or a locked empty state gets a
real picture from this folder rather than a grey box, a stock icon or a fresh download. A grey box
tells a judge nothing about whether the layout works at the real aspect ratio.

Two rules, and they are the whole thing:

1. **Pick by what the feature sells, not by what it is called.** The table below maps the pitch to
   the nearest asset.
2. **Prefer an `illustration`, then `slides`, then `product UI`.** A stand-in that shows app chrome
   is claiming your feature lives in a screen that may not exist. An abstract one claims nothing.

| The new feature sells | Stand in with |
|---|---|
| an AI capability, a model tier, anything about the engine | `ultra-models` · `pro-models` |
| visual customisation — theme, palette, typography, identity | `brand-kit` · `colours` · `fonts` |
| a content library — layouts, starters, anything you pick from | `templates` |
| getting content out — download, share link, publish, print | `export` |
| bringing content in, or keeping it in sync | `refresh-from-source` |
| working with other people on the same deck | `meet-and-edit` · `comments` · `assign-slides` |
| presenting, or an audience watching | `meet-and-present` |
| measurement, reporting, anything with a number in it | `analytics` |
| a limit being lifted — longer, more, bigger | `long-decks` |
| seats, teams, membership | `invite-members` |
| organisation — folders, spaces, workspaces, sources | `projects` · `project-knowledge` |

**Say so in the handover.** A stand-in is a build decision, not a specific — write which asset you
borrowed and for which feature, so a reviewer knows the picture is placeholder and the layout is
not. It never becomes a reason to invent a feature name, a price or a limit; those still stop the
build.

## index.json

```js
const { features } = await fetch("assets/features/index.json").then(r => r.json());
const media = features.find(f => f.slug === "export");   // → { still, clip: {mp4, webm}, … }
```

Each entry carries `slug`, `label`, `still`, `source`, an optional `clip` and `poster`, plus `kind`,
`shows` and `sells` — the three columns above, so a build can resolve a stand-in without a human
reading this file. Every one is 16:9 within a pixel; set `aspect-ratio: 16/9` and nothing
letterboxes.

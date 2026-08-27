# Starter deck: content written to the Glaze layouts

**Type:** Content spec, stable design intent · **Owner:** Mudita · **Updated:** 27 Aug 2026

The ten slides from [starter-deck-spec.md](starter-deck-spec.html), rewritten so each one lands on a
layout that actually exists, with copy inside the character bands the product uses to pick that
layout. Read against [grounding.md](grounding.html) for where all of this comes from in the code.

---

## How to use this

Generate the deck, then check each slide got the layout named below. Where it did not, Remix that
slide and pick it by hand. The copy here is written so the layout is the natural fit, not a fight.

```
   write to the node count  ──►  generate  ──►  check slide by slide  ──►  remix the misses
        (hard gate)                                                          (should be few)
```

**Two gates, and only one of them is hard.**

| Gate | What it is | What happens if you miss |
|---|---|---|
| **Node count** | Every layout declares `ai-min` to `ai-max`. A node is one row: one bullet, one step, one metric, one team member | The layout is not offered at all. Not a downgrade, an absence |
| **Text length** | The longest heading and the longest body across all nodes get bucketed S/M/L/X, and the layout's `taghint` has to contain that code | The layout is still offered but ranks lower, so you get a denser one you did not want |

The second one has a consequence worth knowing: **the longest item sets the code for the whole
slide.** One node with a runaway description drags every other node into a denser layout. Even
lengths are what keep a layout stable, which is a writing rule, not a design one.

---

## The character contract

Read from `MenuParser.js` (`getHintForTitles`, `getHintFromOutline`), which mirrors the Python
backend's `utils.py`. Bands, drawn to scale:

```
SLIDE TITLE, when there is a subtitle
  S ████████                       0 to 20
  M ████████████                  21 to 30
  L ██████████████████            31 to 45     ← avoid
  X ████████████████████████      46 and up    ← avoid

SLIDE TITLE, on its own
  S ██████████                     0 to 25
  M ████████████████████████      26 to 60
  L ██████████████████████████…   61 to 120

SLIDE SUBTITLE
  S ████████████                   0 to 30
  M ████████████████████████████  31 to 70
  L …                             71 to 100

NODE HEADING, when the node has a body      NODE BODY
  S ████████         0 to 20                  S ████████████        0 to 40
  M ████████████    21 to 30                  M ████████████████   41 to 90
  L ████████████…   31 to 60   ← avoid        L …                  91 to 160  ← avoid

NUMBERS on a node (D-codes)
  D1  1 to 5 chars   D2  6 to 11   D3  12 to 17   D4  18 to 24
```

The two letters concatenate. A slide whose longest heading is 24 characters and longest body is 50
gets code `MM`, and only layouts whose taghint lists `MM` at that node count are ranked well.

**Stay in S and M everywhere.** L and X exist for decks that were written before anyone thought
about layout, and they buy density you do not want on a first-run deck.

---

## What Glaze actually offers

**861 layout variations, across 63 layouts, in 9 categories** (counted from the live qc1 catalog,
`glaze-template-menu.json`). The Insert menu in the editor is these nine categories exactly.

Worth knowing before you commit to Glaze: **the catalog is very nearly mood-invariant.** Comparing
the bundled copies, glaze, dewdrop, rhyme_v2 and pitch share about 800 variations and differ by one
or two. A mood swaps CSS, color and shapes, not the layout inventory. So content written to these
layouts survives a mood change, and picking Glaze is a look decision rather than a structural one.

Node ranges are the AI ranges (`ai-min` to `ai-max`), which is correct because the guard that would
have used the wider `min`/`max` is commented out in `checkForNodes`. "any" means the layout declares
no count and takes what it is given.

| Category | Layout | Variations | Node range | aiGraphicType |
|---|---|---|---|---|
| List | **Unordered List** | 73 | 1 to 16 | `list_with_subpoints`, `list_with_description` |
| List | **Ordered List** | 43 | 2 to 16 | `list_with_description`, `simple_list` |
| List | **Agenda** | 11 | 2 to 16 | `agenda_slide`, `simple_list` |
| List | **Icon List** | 49 | 2 to 15 | `list_with_description`, `simple_list` |
| List | **Image List** | 31 | 1 to 8 | `list_with_description`, `simple_list` |
| List | **Metric List** | 109 | 1 to 8 | `kpi_block`, `kpi_block_with_subpoints` |
| Diagram | **Process** | 56 | 2 to 8 | `diagram`, `list_with_description` |
| Diagram | **Timeline** | 20 | 2 to 10 | `timeline`, `roadmap` |
| Diagram | **Circular** | 56 | 2 to 8 | `diagram`, `venn_diagram` |
| Diagram | **Venn** | 6 | any | `venn_diagram`, `diagram` |
| Diagram | **Funnel** | 13 | 2 to 6 | `diagram`, `kpi_block` |
| Diagram | **Pyramid** | 32 | any | `diagram`, `kpi_block` |
| Diagram | **Steps** | 8 | 3 to 6 | `diagram` |
| Diagram | **Relationship** | 7 | 4 to 6 | `diagram` |
| Diagram | **Layers** | 19 | 2 to 7 | `diagram` |
| Diagram | **SWOT** | 5 | any | `swot_matrix` |
| Diagram | **Market size** | 2 | any | `tam_sam_som_block` |
| Diagram | **Comparison** | 17 | 1 to 5 | `comparison`, `multi_column_list` |
| Data | **Column Chart** | 28 | 2 to 24 | `chart`, `multi_series_chart` |
| Data | **Bar Chart** | 14 | 1 to 24 | `chart`, `multi_series_chart` |
| Data | **Radial Chart** | 13 | 2 to 10 | `chart` |
| Data | **Currency Chart** | 1 | 2 to 10 | `chart` |
| Data | **Line Chart** | 7 | 8 to 24 | `chart`, `multi_series_chart` |
| Data | **Bump Chart** | 1 | 3 to 8 | `multi_series_chart` |
| Data | **Area Charts** | 6 | 8 to 24 | `chart`, `multi_series_chart` |
| Data | **Scatter Chart** | 1 | 3 to 30 | `multi_series_chart` |
| Data | **Bubble Chart** | 1 | 6 to 20 | `multi_series_chart` |
| Data | **Waterfall Chart** | 1 | 4 to 24 | `chart` |
| Data | **Dumbbell Chart** | 2 | 4 to 12 | `multi_series_chart` |
| Data | **Funnel Chart** | 6 | 4 to 8 | `multi_series_chart` |
| Data | **Radar Chart** | 1 | 4 to 8 | `multi_series_chart` |
| Data | **Polar Area Chart** | 1 | 3 to 5 | `multi_series_chart` |
| Data | **Circular Bar Chart** | 1 | 4 to 24 | `multi_series_chart` |
| Data | **Gauge Chart** | 1 | 1 to 1 | `chart` |
| Data | **Kagi Chart** | 1 | 6 to 100 | `chart` |
| Data | **Box Plot** | 1 | 3 to 10 | `multi_series_chart` |
| Data | **Candlestick** | 1 | 2 to 34 | `multi_series_chart` |
| Data | **Waffle Chart** | 1 | 1 to 1 | `chart` |
| Data | **Pictorial Rectangle** | 2 | 4 to 24 | `chart` |
| Data | **Mini Charts** | 1 | 3 to 5 | `mini_chart` |
| Data | **Table** | 9 | any | `table` |
| Concept | **Challenges** | 10 | any | `diagram` |
| Concept | **Solutions** | 11 | 4 to 6 | `diagram` |
| Concept | **Foundations** | 11 | 3 to 6 | `diagram` |
| Concept | **Goals** | 8 | any | `diagram` |
| Concept | **Growth** | 6 | 2 to 4 | `diagram` |
| Concept | **Flow** | 8 | any | `diagram` |
| Concept | **Comparison** | 7 | any | `diagram`, `kpi_block` |
| Concept | **Choice** | 5 | any | `diagram` |
| Concept | **Announcement** | 4 | any | `diagram` |
| Concept | **Finance** | 3 | any | `diagram` |
| Concept | **Achievement** | 5 | 2 to 6 | `diagram` |
| Media | **Images** | 16 | 1 to 3 | `image`, `titleandsubtitle` |
| Media | **Devices** | 13 | 3 to 5 | `mockup`, `list_with_description` |
| Media | **Logos** | 15 | 2 to 4 | `logogrid` |
| Media | **Memes** | 1 | 2 to 2 | `meme_bullet_points` |
| Text | **Text** | 11 | 1 to 1 | `titleandsubtitle` |
| Text | **Presenter** | 4 | any | `presenter` |
| Text | **Section Break** | 1 | any | `section_number` |
| People | **People** | 18 | 1 to 6 | `team_slide` |
| Quote | **Quote** | 24 | 1 to 6 | `quotes` |
| Quote | **Testimonial** | 8 | 1 to 6 | `testimonials` |
| Preset Templates | **Templates** | 14 | 1 to 24 | `list_with_subpoints`, `simple_list` |

---

## Why the bands are not advice

Every shrink-to-fit implementation in the editor exists and **none of them is wired up**.
`TextUtils.setTextChangeListner` has zero callers. `TextEditorUtils.getAutoFitFontSize` has zero
callers. `ResponsiveChartHelper.adjustFontSize` is called from two commented-out lines.
`react-diagrams-lib`'s `fitFontToContainer` has been gutted to an early `return`.

So text that overflows its container just overflows. Nothing catches it. **Picking a template sized
for your text up front is the only thing standing between this deck and a clipped line**, which is
what turns the character bands above from a nicety into the actual mechanism.

Three more limits that bite, none of them visible in the UI:

| Thing | Limit | Note |
|---|---|---|
| Chart value text | **10 characters**, a hard `substr` | Keep numbers short. A labelled value will not survive |
| Items per graphic | 3 to 4 comfortable, 6 is the upper normal | Slides 3 and 6 sit at 5 and 6, deliberately, and are the two to check first |
| Graphics per slide | 2 when generated, 3 when inserted by hand | Slide 7 spends both on a chart plus its conclusion |

There is also a downgrade rule worth knowing: writing too few items makes the generator drop to a
plainer layout. `concept_metaphor`, `illustrated_framework` and `process_diagram` all fall back to a
plain list below two items. Under-writing a slide is how you lose the diagram you wanted.

---

## The ten slides

Every string below sits in the S or M band for its slot, verified against the buckets rather than
estimated. `nodes` is what to write, and it is the hard gate.

---

### 1 · Cover

`Text / Text` · variation **Headline** · `titleandsubtitle` · no nodes · code **MM**

| Slot | Copy | Chars |
|---|---|---|
| Title | Made here, in four minutes | 26, M |
| Subtitle | Here is how, and how to do it better than we did. | 48, M |

Deck name in the dashboard grid: **Start here**. Slide layout pattern `single-cover-title`.

---

### 2 · The mess

`Diagram / Comparison` · `comparison` · **2 nodes** · code **SM**

| Heading | Body |
|---|---|
| What you paste | Half-formed notes, an open question, a number you are not sure about. |
| What you get back | A structured outline you can correct, with your own words still in it. |

Two nodes is the floor for Comparison, and it is the right count: the slide is an argument with two
sides, not a list. The left node's body has to *read* like real notes, so keep the ragged phrasing
when you edit it.

---

### 3 · Five ways in

`List / Icon List` · variation **Grid Icon Detailed Points** · `list_with_description` · **5 nodes** · code **SM**

| Heading | Body |
|---|---|
| A prompt | One line about the deck you want. Good when you are starting cold. |
| An outline | Your section headings, in order. We fill them in. |
| A PowerPoint | Bring an old deck. We rebuild it rather than re-skin it. |
| Notes and documents | A brief, a transcript, a doc. Paste it or upload it. |
| A template | Someone has already worked out what a good one covers. |

Five is inside the 5 to 10 range for this variation but one past the comfortable four, so this is the
first slide to eyeball. If it looks tight, **Grid Icon Multirow Points** takes the same five.

Order is deliberate: prompt first because it costs least, template last because it changes the
outcome most and last is what stays in the head.

---

### 4 · Brand

`List / Image List` · variation **Horizontal** · `list_with_description` · **3 nodes** · code **SM**

| Heading | Body |
|---|---|
| Your logo | Light and dark, picked automatically per slide. |
| Your colors and type | Read from your site, editable when we get it wrong. |
| Your voice | How you write, so the words sound like you too. |

The three images are the demonstration: **the same slide rendered in three different brands.** If
they are three unrelated pictures the slide says nothing. Voice is third because it is the one nobody
expects a brand feature to cover.

---

### 5 · Edit by asking

`List / Icon List` · variation **Vertical** · `list_with_description` · **3 nodes** · code **MM**

| Heading | Body |
|---|---|
| Cut this to three points | The slide reflows. Nothing else in the deck moves. |
| Make the tone less formal | Same facts, different register, same layout. |
| Add a pricing slide after this | It arrives in your theme, in the right place. |

The headings are the requests, written the way someone would type them. The bodies all say a version
of the same thing on purpose: **nothing else moves.** That fear is why people will not try AI editing
on a deck they have already put work into.

"Add a pricing slide after this" is 30 characters, the top of the M band exactly. Do not lengthen it.

---

### 6 · Remix

`List / Image List` · variation **Grid** · `list_with_description` · **6 nodes** · code **SS**

| Heading | Body |
|---|---|
| Vertical list | When order matters more than shape. |
| Icon grid | When the points are parallel. |
| Process flow | When one thing leads to the next. |
| Metric blocks | When the numbers are the point. |
| Image cards | When each point has a picture. |
| Timeline | When the points are dates. |

Six is the upper normal, which is why this one is written down to `SS`: the shortest copy in the deck,
because six nodes need the room. **The six images must show the same content in six layouts**, and
that only reads if the text inside them stays legible. If it does not, drop to four and lose Metric
blocks and Timeline.

---

### 7 · Share and learn

`Data / Column Chart` · `chart` · **10 categories, 1 series** · code **MM**

| Slot | Copy |
|---|---|
| Title | Send a link. Learn what landed |
| Subtitle | Slide 6 lost half the room. That is the one to rewrite. |

Chart data, percentage of viewers who reached each slide:

```
 1  ####################  100
 2  ###################    96
 3  ##################     92
 4  #################      88
 5  ################       81
 6  ########               42   <- the cliff
 7  #######                38
 8  #######                35
 9  ######                 33
10  ######                 31
```

Ten categories fits `columnSimpleRectangle`, which takes up to 12. Values stay two digits, well
inside the 10-character truncation on chart values.

**The subtitle is the slide.** A drop-off chart on its own is a dashboard. A drop-off chart with the
decision already read out of it is the argument for why analytics matters, and it sets up slide 9.

---

### 8 · When your team joins

`List / Icon List` · variation **Icon And Title In Card** · `list_with_description` · **3 nodes** · code **MM**

| Heading | Body |
|---|---|
| Invite your team | They edit, comment and reuse what you built. |
| One brand kit for everyone | Nobody has to ask what the hex was. |
| Save a deck as a template | The next person starts from your best one. |

Two of the brief's seven sections compressed to two lines, deliberately. Someone with zero decks does
not have a team problem yet, and full sections would push slide 9 past where anyone reads.

---

### 9 · The loop

`Diagram / Circular` · variation **Loop Sequence** · `diagram` · **4 nodes** · code **MM**

| Heading | Body |
|---|---|
| Make it | Paste what you have. Fix what we got wrong. |
| Send it | One link, not an attachment. |
| See where it lost people | Per slide, not just a view count. |
| Change those two slides | Then send it again. |

Four nodes is both the Loop Sequence default and the diagram engine's own default maximum, so this is
the safest layout in the deck. Loop Sequence over Process because the shape has to close: the point
is that it comes back around.

The fourth step is specific on purpose. "Iterate" is advice nobody acts on. "Change those two slides"
is a task.

---

### 10 · One thing to do next

`Text / Text` · variation **Headline** · `titleandsubtitle` · no nodes · code **MM**

| Slot | Copy | Chars |
|---|---|---|
| Title | Start with the one you owe | 26, M |
| Subtitle | Paste your notes. We will take it from there. | 45, M |

Closes on the cover's treatment, so the deck reads as a thing rather than a list. One action. Every
extra link here costs the first one, and eight slides have already offered the rest.

---

## Generating it

Paste this into the create box with Glaze selected, then check slide by slide against the tables
above and Remix the misses.

```
A ten slide deck called "Start here" that teaches a new Presentations.AI
user how to get a good deck made. Keep it to exactly ten slides, in this
order, every heading under 30 characters and every description under 90.

1. Cover. Title "Made here, in four minutes", subtitle "Here is how, and
   how to do it better than we did."
2. A two column comparison, "We would rather have your mess": what you
   paste (half-formed notes) versus what you get back (a structured
   outline you can correct).
3. Five ways to start, as an icon grid with five points: a prompt, an
   outline, a PowerPoint, notes and documents, a template. One short line
   each on when it is the right way in.
4. Three part image list on setting your brand once: your logo, your
   colors and type, your voice.
5. Three example editing requests, as a vertical icon list: cut this to
   three points, make the tone less formal, add a pricing slide after
   this. Each with one line saying nothing else in the deck moves.
6. Six layout options as an image grid, one short line each on when to
   use it: vertical list, icon grid, process flow, metric blocks, image
   cards, timeline.
7. A column chart, "Send a link. Learn what landed", ten slides on the x
   axis and percentage of viewers reaching each one: 100, 96, 92, 88, 81,
   42, 38, 35, 33, 31. Subtitle "Slide 6 lost half the room. That is the
   one to rewrite."
8. Three cards, "Work that outlives one deck": invite your team, one
   brand kit for everyone, save a deck as a template.
9. A four step circular loop, "A deck is finished when it works": make
   it, send it, see where it lost people, change those two slides.
10. Closing slide. Title "Start with the one you owe", subtitle "Paste
    your notes. We will take it from there."

Voice: plain, short sentences, "we" language, no hype, no exclamation
marks, no em dashes. Never use the word AI on any slide.
```

**Check these four first**, in this order, because they are where it will go wrong:

1. **Slide 6** got a six-up grid and the text inside the six images is still readable.
2. **Slide 3** got a five-point grid rather than falling back to a plain list.
3. **Slide 7** got a column chart with ten bars and one series, not a table.
4. **Slide 9** got a closed loop rather than a left-to-right process.

---

## Caveats

- **The four minutes on slide 1 has to be true.** Time this deck from prompt to sendable before it
  ships. If it is not defensible, cut the title to "Made here" and let the subtitle carry the rest.
- **"We rebuild it rather than re-skin it"** on slide 3 is the strongest line in the deck and the one
  most likely to overpromise. Check what PPT import does today.
- **Node counts are from the live qc1 catalog on 27 Aug 2026.** The bundled repo copy already differs
  slightly (about 800 variations against 861), so re-check before building rather than trusting these
  numbers months from now.
- **Slide 4 needs three real brand renders and slide 6 needs six real layout renders.** Neither is
  something the generator can produce. Both are images to make and drop in.

---

## Related

- [starter-deck-spec.md](starter-deck-spec.html), the design intent these ten slides carry, including
  the action on each slide and the two problems that pattern runs into
- [grounding.md](grounding.html), where the layout system, the character buckets and the plan gates
  live in the code

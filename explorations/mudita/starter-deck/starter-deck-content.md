# Starter deck: content written to the Glaze layouts

**Type:** Content spec, stable design intent · **Owner:** Mudita · **Updated:** 27 Aug 2026

The ten slides from [starter-deck-spec.md](starter-deck-spec.html), written so each one lands on a
layout that actually exists, with copy inside the character bands the product uses to pick that
layout. Read against [grounding.md](grounding.html) for where all of this comes from in the code, and
[layout-reference.html](layout-reference.html) for what happened when it was generated.

**The copy is instructional.** This is a tutorial someone works through, not a feature tour they
read. Every point names a real control, says where it is, and says what happens when they press it.
The reader is expected to be doing each step on this deck as they go, which is what the cover
promises them.

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

**Instructional, not descriptive.** Every node heading is an action naming a control that actually
exists in the product, and every body says where that control is and what happens when you press it.
The reader is expected to be doing this on the deck in front of them, which is what slide 1 promises.

Two rules that fall out of that and govern all the copy below:

- **Name the control exactly as the interface labels it.** `Import PowerPoint`, `Upload files, or
  links`, `Use a Template`, `Edit with AI`, `Make shorter`, `Redesign slide`, `Invite new members`,
  `Share`, `Export as PPT`. A paraphrase sends the reader hunting, which is the one thing a tutorial
  cannot afford. All of these were read off qc1 on 27 Aug 2026 and want re-checking when the UI moves.
- **Say where it is before you say what it does.** "Left sidebar, under Created by me" costs eleven
  words and saves the reader the search. Location first, effect second.

Every string is inside the S or M band for its slot, verified rather than estimated.

---

### 1 · Cover

`Text / Text` · variation **Headline** · `titleandsubtitle` · no nodes · code **MM**

| Slot | Copy | Chars |
|---|---|---|
| Title | Made here, in four minutes | 26, M |
| Subtitle | Try every step on this deck as you read. | 40, M |

The subtitle changed from a claim to an instruction, and it is the most important edit in this pass.
It sets the contract for the other nine slides: this is a thing to do, not a thing to read. Without
it, slide 5 telling you to press a button reads as a description of a button.

Deck name in the dashboard grid: **Start here**.

---

### 2 · The mess

`Diagram / Comparison` · `comparison` · **2 nodes** · code **MM**

| Heading | Body |
|---|---|
| Type into the prompt box | On Home. Paste notes, drop a file, or add a link. |
| Get an outline back | Sections in order. You correct it instead of writing it. |

The left node is now the action and the right node is the payoff, which is a better use of a two
column layout than two halves of a claim. "You correct it instead of writing it" is the sentence
doing the persuading, so protect it if anything has to be cut.

---

### 3 · Five ways in

`List / Icon List` · variation **Grid Icon Detailed Points** · `list_with_description` · **5 nodes** · code **MM**

| Heading | Body |
|---|---|
| Type a prompt | The box in the middle. One line is enough to start. |
| Paste an outline | Same box. Your headings, in the order you want them. |
| Import PowerPoint | The button below. We rebuild the deck, not re-skin it. |
| Upload files, or links | Inside the box. Briefs, transcripts, docs, a URL. |
| Use a Template | Next to Import PowerPoint. Starts from a proven shape. |

Slide title becomes **"Five ways in, all on Home"**, which does real work: it tells the reader every
one of the five is reachable without leaving the screen they are on.

Three of the five headings are now verbatim button labels. That is deliberate, and it is why this
slide survives the reader looking away and back.

---

### 4 · Brand

`List / Image List` · variation **Horizontal** · `list_with_description` · **3 nodes** · code **MM**

| Heading | Body |
|---|---|
| Open Brand kit | Left sidebar, under Created by me. Give us your site. |
| Fix what we got wrong | Logo, colors, type and voice all stay editable. |
| Switch it on per deck | The For your brand toggle above the prompt box. |

The third node is the one nobody discovers on their own: the brand kit strip sits at the top of the
prompt box with a live toggle, so a kit can be on for one deck and off for the next. It is the
single most useful thing on this slide and it was missing from the descriptive version.

Still needs three hand-made images of one layout in three brands.

---

### 5 · Edit by asking

`List / Icon List` · variation **Vertical** · `list_with_description` · **3 nodes** · code **SM**

| Heading | Body |
|---|---|
| Open Edit with AI | Bottom toolbar of the editor. Try the Write tab. |
| Press Make shorter | This slide reflows. Nothing else in the deck moves. |
| Or type your own | Search AI action takes a plain request, five credits. |

**This is the slide the whole instructional turn was for.** The old version listed three requests you
might type. This one walks the reader to a real button, has them press it, and tells them what will
happen before it does.

`Make shorter` is the right first action to name: it is unmistakable, instant, and reversible, so the
reader's first use of AI editing cannot go wrong. Naming the credit cost is honest and stops the
reader feeling ambushed the second time.

---

### 6 · Remix

`List / Image List` · variation **Grid** · `list_with_description` · **6 nodes** · code **SS**

| Slot | Copy |
|---|---|
| Title | The first layout is a guess |
| Subtitle | Edit with AI, then Design, then Redesign slide. |

| Heading | Body |
|---|---|
| Vertical list | When order matters more than shape. |
| Icon grid | When the points are parallel. |
| Process flow | When one thing leads to the next. |
| Metric blocks | When the numbers are the point. |
| Image cards | When each point has a picture. |
| Timeline | When the points are dates. |

At six nodes there is no room for instruction inside the nodes, so **the subtitle carries the whole
route**: `Edit with AI` → `Design` → `Redesign slide`. That path is not guessable. Remix used to live
on the slide and now sits three clicks deep behind an AI actions panel, and the editor's own tooltip
admits it ("Remix & Layout have moved here"). Spelling out the three steps is the difference between
this feature being found and not.

Nodes stay at `SS`, the shortest copy in the deck, because six of them need the room.

---

### 7 · Share and learn

`Data / Column Chart` · `chart` · **10 categories, 1 series** · code **MM**

| Slot | Copy |
|---|---|
| Title | Slide 6 lost half the room |
| Subtitle | Press Share, top right, to start seeing this on yours. |

**The title and subtitle swapped jobs.** The conclusion moved up into the title, where it is the
first thing read, and the subtitle became the instruction. The old arrangement buried the only
sentence that explains why analytics is worth anything.

```
 1  ####################  100
 2  ###################    96
 3  ##################     92
 4  #################      88
 5  ################       81
 6  ########               42   <- the cliff the title names
 7  #######                38
 8  #######                35
 9  ######                 33
10  ######                 31
```

`Share` is top right in the editor, next to `Present` and `Export as PPT`. Naming its neighbours is
worth the characters, because three buttons sit together and only one of them starts analytics.

---

### 8 · When your team joins

`List / Icon List` · variation **Icon And Title In Card** · `list_with_description` · **3 nodes** · code **SM**

| Heading | Body |
|---|---|
| Invite new members | Bottom of the left sidebar. They edit and comment. |
| Share one brand kit | Everyone in the workspace builds from the same one. |
| Save as template | Editor overflow menu. Your best deck becomes a start. |

`Invite new members` is verbatim from the left nav. `Save as template` lives in the editor's overflow
menu and is close to undiscoverable, so naming the menu is the whole value of that line.

Watch the composition on this one. When generated it came out correct but pinned to the bottom under
half a slide of white, so it needs a Remix or a manual nudge.

---

### 9 · The loop

`Diagram / Circular` · variation **Loop Sequence** · `diagram` · **4 nodes** · code **MM**

| Heading | Body |
|---|---|
| Make it | Paste what you have. Fix what we got wrong. |
| Send it | Press Share, not Export as PPT. |
| See the drop-off | Reopen the deck. Analytics sits in the same menu. |
| Change those two slides | Then send the same link again. |

**"Press Share, not Export as PPT" is the most useful line on the slide.** Those two buttons sit
side by side, the export is the habit people arrive with, and taking the export kills the loop this
slide is about. Naming the wrong button is what makes the right one stick.

"Then send the same link again" replaces the vaguer close: the link is stable, so the reader does not
need to redistribute anything, and that is the fact that makes iterating cheap.

---

### 10 · One thing to do next

`Text / Text` · variation **Headline** · `titleandsubtitle` · no nodes · code **MM**

| Slot | Copy | Chars |
|---|---|---|
| Title | Start with the one you owe | 26, M |
| Subtitle | Go Home, then type into the prompt box. | 39, M |

Closes on the cover's treatment. One action, and it now names where that action happens rather than
gesturing at it.

---

## The controls this deck names

Everything the copy points at, so it can be re-checked in one pass when the UI moves. All read off
qc1 on 27 Aug 2026.

| Slide | Control | Where it is |
|---|---|---|
| 2, 3, 10 | The prompt box | Home, centre of the screen |
| 3 | `Upload files, or links` | Inside the prompt box, bottom left |
| 3 | `Import PowerPoint` | Quick actions row, below the prompt box |
| 3 | `Use a Template` | Same row, third from the left |
| 4 | `Brand kit` | Left sidebar, third item, under `Created by me` |
| 4 | The brand kit toggle | Strip above the prompt box, reads "For your brand" |
| 5, 6 | `Edit with AI` | Editor bottom toolbar, third button |
| 5 | `Write` tab, `Make shorter` | Inside the Edit with AI panel |
| 5 | `Search AI action` | Bottom of that panel. Five credits per action |
| 6 | `Design` tab, `Redesign slide` | Same panel, the Remix entry point |
| 7, 9 | `Share` | Editor top right, between `Present` and `Export as PPT` |
| 8 | `Invite new members` | Bottom of the left sidebar |
| 8, 9 | Overflow menu | Editor top right, far right of `Export as PPT` |

**Re-check this table before the deck ships.** A tutorial that points at a button which has moved is
worse than one that never pointed at all, and Remix has already moved once.
## Generating it

Paste this into the prompt box with Glaze selected. Then check slide by slide against the tables
above and Remix the misses.

**Expect the copy not to survive.** When this was run on 27 Aug 2026 the layouts landed on nine of
ten slides and almost every string came back rewritten and much shorter. On an instructional deck
that is worse than it sounds: "Left sidebar, under Created by me" is the half that gets cut, and
without it the line stops being an instruction. See the
[layout reference](layout-reference.html) for what actually arrived.

So generate for structure, then **type the real strings in by hand**. The prompt below is a way to
get ten correctly shaped slides, not a way to get this copy.

```
A ten slide tutorial deck called "Start here" that teaches a new
Presentations.AI user by having them do each step as they read. Keep it to
exactly ten slides, in this order, every heading under 30 characters and
every description under 90.

Write every point as an instruction: the heading is an action naming a real
button, the description says where that button is and what happens. Do not
paraphrase button names.

1. Cover. Title "Made here, in four minutes", subtitle "Try every step on
   this deck as you read."
2. Two column comparison, "We would rather have your mess": typing into the
   prompt box on Home, versus getting an outline back that you correct
   instead of write.
3. Icon grid, five points, titled "Five ways in, all on Home": type a
   prompt, paste an outline, Import PowerPoint, Upload files or links, Use
   a Template. Each says where it is on the Home screen.
4. Three part image list, "Set your brand once": open Brand kit in the left
   sidebar, fix what we got wrong, switch it on per deck with the toggle
   above the prompt box.
5. Three point vertical icon list, "Ask for the change": open Edit with AI
   in the editor's bottom toolbar, press Make shorter, or type your own
   into Search AI action.
6. Six layout options as a grid, title "The first layout is a guess",
   subtitle "Edit with AI, then Design, then Redesign slide.": vertical
   list, icon grid, process flow, metric blocks, image cards, timeline.
   One short line each on when to use it.
7. A column chart titled "Slide 6 lost half the room", subtitle "Press
   Share, top right, to start seeing this on yours." Ten slides on the x
   axis, percentage reaching each: 100, 96, 92, 88, 81, 42, 38, 35, 33, 31.
8. Three cards, "Work that outlives one deck": Invite new members, share
   one brand kit, save as template from the editor overflow menu.
9. A four step circular loop, "A deck is finished when it works": make it,
   send it with Share not Export as PPT, see the drop-off, change those two
   slides.
10. Closing slide. Title "Start with the one you owe", subtitle "Go Home,
    then type into the prompt box."

Voice: plain, short sentences, "we" language, no hype, no exclamation
marks, no em dashes. Never use the word AI on any slide. Never write
"mark" when you mean a logo.
```

**Check these five first**, because they are where it went wrong last time:

1. **Slide 7** got a column chart with ten bars. Last run it produced a one-value gauge and silently
   discarded nine data points.
2. **Slide 8** is not pinned to the bottom of the frame under a band of white.
3. **Slide 6** got a six-up grid with the subtitle's three step route intact.
4. **Slide 3** got a five point grid rather than falling back to a plain list.
5. **Every control name survived verbatim.** This is the new one, and it is the check that matters
   most on an instructional deck.

---

## Caveats

- **The four minutes on slide 1 has to be true.** Time this deck from prompt to sendable before it
  ships. If it is not defensible, cut the title to "Made here" and let the subtitle carry the rest.
- **"We rebuild it rather than re-skin it"** on slide 3 is the strongest line in the deck and the one
  most likely to overpromise. Check what PPT import does today.
- **The control names age faster than anything else here.** Remix has already moved once, from the
  slide into an AI actions panel. Re-check the controls table above before the deck ships, and
  again whenever the editor toolbar changes.
- **Node counts are from the live qc1 catalog on 27 Aug 2026.** The bundled repo copy already differs
  slightly (about 800 variations against 861), so re-check rather than trusting these months from now.
- **Slide 4 needs three real brand renders and slide 6 needs six real layout renders.** Neither is
  something the generator can produce. Both are images to make and drop in.
- **Replace every stock image.** The generated run reached for studio speakers, a green app icon and
  a paper-craft photo on a blue cutting mat, none related to their slide.

---

## Related

- [layout-reference.html](layout-reference.html), the ten slides generated and captured, with a
  scoreboard of which layout each one landed on
- [starter-deck-spec.md](starter-deck-spec.html), the design intent these ten slides carry, including
  the action on each slide and the two problems that pattern runs into
- [grounding.md](grounding.html), where the layout system, the character buckets and the plan gates
  live in the code

# annotate

Open a proto, drive it to the state you care about, press **Shift+C**, click
things and say what you notice. Notes land in an `annotations.jsonl` beside the
proto.

```
python3 tools/annotate/serve.py
open http://localhost:8901/<path/to/proto.html>        # then press Shift+C
open http://localhost:8901/tools/annotate/sheet.html   # every note so far
open http://localhost:8901/tools/annotate/system.html  # how the whole thing works
```

A proto's URL is just its path. There is no index to go through: you open the
screen you were going to open anyway.

## Using it

| | |
|---|---|
| **Shift+C** | turns annotation mode on and off |
| hover | outlines the element under the cursor |
| scroll | scrolls the proto, as it normally would |
| **alt + scroll**, or up and down arrows | change grouping level, so you can annotate the button, the button row, the modal or the whole screen |
| click | opens one text box |
| Enter | saves. Esc cancels |
| click a marker | reopens that note to edit, with a Delete button |

Editing keeps the note's anchor, its hash and when it was first made. Only the
words change: the hash records which version of the file the judgement was made
against, so rewording is not the same event as re-anchoring.

Level-change takes the modifier rather than the other way round because most
protos are taller than the viewport, and a tool that cannot reach the bottom of
a pricing page cannot annotate one.

One text box on purpose. No category, no severity, no altitude. Those get
inferred later, when the notes are turned into rules, and shown back to you
before anything is written.

## Mode, and why it is a mode

With annotation mode **off** the proto is untouched: it clicks, animates and
navigates exactly as it does without the server. So you drive the flow to the
step you want to talk about, and only then turn annotation on. Markers are
recorded against `location.hash`, so a note made on `#step-2` only draws on
`#step-2`.

With it **on**, clicks select instead of activating. That is the whole trade,
and it is why the mode has to be leaveable.

## What it will not do

**It never writes to the proto.** `serve.py` adds one script tag on the way out
of the server; the file on disk is untouched, and the hash the annotator records
is taken from the raw bytes before injection, so the freeze check describes the
file rather than what the browser was handed.

All the tool's own chrome lives in a shadow root, so the proto's DOM stays clean
and a stored selector keeps meaning what it meant.

That is deliberate. An annotated proto is frozen: to iterate on the design you
make a new copy rather than editing an annotated one. If a frozen file is edited
anyway, the bar says so in amber and names how many notes predate the change.

**The trade:** no injection means no Shift+C, so annotation only works through
`serve.py`. Opening a proto from Finder or on GitHub Pages gets you the proto,
plain, exactly as before.

## The contact sheet

`sheet.html` shows every note in the repo with a picture of what it is about.

The picture is **the real proto in an iframe**, scaled and offset so the
annotated element is in frame, with the element marked. Not a raster, because a
note anchors by CSS selector: the thing worth showing is the DOM the selector
resolves against. A screenshot could not be re-anchored, re-measured or linted,
and would go stale without saying so.

It shows a **region** around the element rather than a tight crop. Most
judgements are about an element in its context, and a crop of a subtitle cannot
show that it repeats the title. For the same reason the mark has a minimum
size: a divider is one pixel tall, and a one-pixel outline is a thing nobody
can find.

Protos load only as their cards come into view, so a long sheet does not boot
two hundred protos at once.

## The record

```json
{"id":"8750e4f6","proto":"…/cancel-flow.html","hash":"3b73fad92d704562",
 "state":"#step-2","viewport":[1440,856],
 "selector":"div.flow > section.step:nth-of-type(2) > …",
 "tag":"div","classes":["pill"],"text":"Till 10 Jul 2027",
 "rect":[822,349,85,16],"note":"the Till date pill repeats on every row",
 "at":"2026-07-31T08:00:00Z"}
```

`id` is the note's own identity. Position in the file is not one: deleting the
second note renumbers everything after it, and anything holding a reference —
a contact-sheet card, a crop on disk — would silently re-point at the wrong
judgement.

`state` is the proto's hash fragment at the time, so markers only draw on the
state they were made in. Selectors skip runtime classes (`is-active` and the
like) because those describe the moment rather than the element. `rect` is in
**document** coordinates, not client, so it still means something when the note
was made halfway down a long page.

## One store per folder

All the protos in a problem folder share one `annotations.jsonl`, so there is a
single file to read, grep and diff per problem rather than one per screen.

The annotator only ever holds the notes for the proto you are looking at, so
saving is a **merge, not a write**: `serve.py` replaces the lines whose `proto`
matches and keeps every other line untouched, writing through a temp file so an
interrupted save cannot truncate the store. A line it cannot parse is kept
rather than dropped.

Without the server, **Copy for Claude** produces the same instruction in words,
so the paste path merges too.

## Where this stops

Capture and storage is the whole job here. Turning notes into rules — clustering
repeats, promoting one into a lint check, a visual-language line, an
anti-pattern row or an `exemplars.json` entry — belongs to the harness, so
`annotations.jsonl` is the interface rather than the halfway point. Keep the
record self-describing for that reason.

### Two known gaps

**State is only captured if the proto puts it in the hash.** `state` is
`location.hash` and nothing else, so a modal opened by a button that does not
change the URL records `state: ""`, and the note will not re-resolve on the
next visit. Every proto in the corpus today is either hash-driven or static, so
this has not bitten yet. It will, on the first click-driven state.

**Grouping levels walk the DOM, not the design.** On a Tailwind-heavy proto,
alt+scroll steps through layout wrappers rather than the button row, the card,
the modal. Own screens read well; imported ones read as `div.demo-bar ›
div.demo-seg › button`.

Both are answered by the same idea, which is why it is worth doing once and
properly: **serialise the rendered DOM at annotation time** rather than
pointing at a live file. A snapshot bakes the state in, and it is also the only
way an exploration built in the React app can be annotated here, where its
dependencies do not exist. Serialise, never rewrite: this repo already judges
hand-translating React to HTML "well under 80% accurate".

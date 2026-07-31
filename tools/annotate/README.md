# annotate

Point at a proto, click things, say what you notice. Notes land in an
`annotations.jsonl` beside the proto.

```
python3 tools/annotate/serve.py
open http://localhost:8901/tools/annotate/annotate.html
```

Without the server it still works from GitHub Pages, but Save has nothing to
write to, so use **Copy for Claude** and paste the result into Claude Code.

## Using it

| | |
|---|---|
| hover | outlines the element under the cursor |
| scroll, or up and down arrows | change grouping level, so you can annotate the button, the button row, the modal or the whole screen |
| click | opens one text box |
| Enter | saves. Esc cancels |
| click a marker | delete that note |

One text box on purpose. No category, no severity, no altitude. Those get
inferred later, when the notes are turned into rules, and shown back to you
before anything is written.

## What it will not do

**It never touches the proto.** No script is injected, no attribute written.
Every bit of chrome is drawn in the wrapper page and positioned over the
iframe; hit testing just reads the iframe's DOM.

That is deliberate. An annotated proto is frozen: to iterate on the design you
make a new copy rather than editing an annotated one. Each note records the
proto's content hash, so if a frozen file is edited anyway the top bar says so
in amber and names how many notes predate the change.

## The record

```json
{"proto":"…/cancel-flow.html","hash":"3b73fad92d704562","state":"#step-2",
 "viewport":[1440,856],"selector":"div.flow > section.step:nth-of-type(2) > …",
 "tag":"div","classes":["pill"],"text":"Till 10 Jul 2027",
 "rect":[822,349,85,16],"note":"the Till date pill repeats on every row",
 "at":"2026-07-31T08:00:00Z"}
```

`state` is the proto's hash fragment at the time, so markers only draw on the
state they were made in. Selectors skip runtime classes (`is-active` and the
like) because those describe the moment rather than the element.

## Not built yet

Element crops via Playwright, the contact sheet, and the digest step that turns
notes into lint rules, visual-language lines and exemplars.json entries. Those
come once there are real annotations to shape them against.

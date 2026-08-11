# designs/

One folder per feature: `designs/<feature>/`.

`<feature>` is a slug for the thing being designed — lowercase, hyphenated, no dates, no version
numbers, and nothing about who did it or when. The folder outlives any one attempt, so it is named
after the problem rather than the try.

```
designs/<feature>/
├── brief.md                what it has to do            /atlas-brief
├── <feature>.html          the design itself
├── annotations.jsonl       every note on every screen in this folder
├── assets/                 only what the designs here reference
└── runs/<run-id>/          one per attempt, run-id is YYYY-MM-DD-NN
    └── checklist.json      what it is scored against     /atlas-checklist
```

Many runs against one brief is the ordinary case. They stay under `runs/` so the folder is still
readable after the tenth attempt.

## Annotating

`python3 tools/annotate/serve.py`, open a design through it, press Shift+C. Notes land in that
folder's `annotations.jsonl`. Full mechanism: `tools/annotate/README.md`.

**A design with notes against it is frozen.** Every note stores a CSS selector into the DOM plus
the file's content hash; freezing is what keeps those selectors exact. To change it, duplicate to
`<name>-v2.html` in the same folder and change that. Editing an annotated design silently points
real judgement at the wrong elements.

## What is here now

Four designs carried over from `muditas-pai/design-protos`, with the notes already on them. They
are snapshots — they stopped tracking their originals the moment they landed.

| Feature | Notes |
|---|---|
| `cancel-flow` | 8 |
| `deck-ready-modal-expanded` | 7 |
| `gold-50-off-modal` | 6 |
| `checkout-with-offer` | 3 |

`deck-ready-modal-expanded` never loaded the design system, so the linter reports `adopted=false`
and its findings mean nothing. Its notes still read fine.

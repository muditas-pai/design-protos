# design-protos

Self-contained HTML prototypes for presentations.ai, built with Claude. Open any file
directly in a browser (all assets load from CDNs), or browse the live, rendered versions
on GitHub Pages: **https://muditas-pai.github.io/design-protos/**

> **Building protos here?** Read [`CLAUDE.md`](CLAUDE.md) — it's the guide Claude follows
> for scaffolding protos with the design system.

## Annotating a proto

Say what's wrong with a screen, on the screen, and have it stick.

```bash
python3 tools/annotate/serve.py          # http://localhost:8901
```

Open any proto through that server and press <kbd>Shift</kbd>+<kbd>C</kbd>. Hover to outline
an element, **alt + scroll** to change level (the button, the button row, the whole modal),
click to write a note. Click a marker to edit or delete it. Save writes the note beside the
proto and commits and pushes it, so a note you make is a note everyone has.

Annotation mode is a mode on purpose: with it off the proto behaves normally, so drive the
flow to the state you care about first, then turn it on. Notes are recorded against that state.

- **Everything noted so far:** [`tools/annotate/sheet.html`](https://muditas-pai.github.io/design-protos/tools/annotate/sheet.html)
  — works on Pages, no server needed, so it is a link you can just send someone
- **How the whole thing works:** [`tools/annotate/system.html`](https://muditas-pai.github.io/design-protos/tools/annotate/system.html)
  — static, so this one opens on Pages
- **Full reference:** [`tools/annotate/README.md`](tools/annotate/README.md)

Two things to know. **Annotation needs the local server** — it works by injecting the annotator
as the page is served, which is what lets it never write to your proto. On GitHub Pages the
protos are view-only. And **an annotated proto is frozen**: to change the design, duplicate it
to a v2 and change that. See [`CLAUDE.md`](CLAUDE.md#never-edit-an-annotated-proto--fork-a-v2).

## design-system/
A browser-ready port of the production presentations.ai design system (Tailwind tokens +
UI components) — no React, no build step. Reference: [`design-system/README.md`](design-system/README.md).
Start with the **[components gallery](https://muditas-pai.github.io/design-protos/design-system/components.html)**
or copy `design-system/template.html` for a new proto.

## Editor → Presentation View transition
The stitched flow: the Editor loads (shimmer → generation loader → slides stream in),
auto-opens the Presentation view (big slide-1 intro, subtle transitions), and on close
returns to the full Editor with the right panel running its loading → refine state.

- **editor-to-present.html** — the main prototype.
- **loader-1.html / loader-2.html / loader-3.html** — the three explorations for the
  horizontal "generation" loader below the focus slide (Option 2 is wired into the main).

## Editor Sandbox
- **editor-sandbox.html** — editor with the right-side chat/refine panel
  (loading streak → checklist → refine steady state).

## Presentation View — Last Slide
- **present-end.html** — full-screen presentation player and its end-of-deck state
  (toast, bottom bar, export/options modal).

# design-protos

Self-contained HTML prototypes for presentations.ai, built with Claude. Open any file
directly in a browser (all assets load from CDNs), or browse the live, rendered versions
on GitHub Pages: **https://muditas-pai.github.io/design-protos/**

> **Building protos here?** Read [`CLAUDE.md`](CLAUDE.md) — it's the guide Claude follows
> for scaffolding protos with the design system.

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

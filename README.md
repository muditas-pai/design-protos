# muditas-protos

Self-contained HTML prototypes (open any file directly in a browser — all assets
load from CDNs).

## Editor to Presentation View transition
The stitched flow: the Editor loads (shimmer → generation loader → slides stream in),
auto-opens the Presentation view (big slide-1 intro, subtle transitions), and on close
returns to the full Editor with the right panel running its loading → refine state.

- **Editor to Presentation View transition.html** — the main prototype.
- **loader-option-1-ticker.html / -2-progress.html / -3-steps.html** — the three
  explorations for the horizontal "generation" loader below the focus slide
  (Option 2, the label + progress line, is the one wired into the main proto).

## Editor Sandbox
- **editor-chat-sandbox-v10.html** — the editor with the right-side chat/refine panel
  (loading streak → checklist → refine steady state).

## Presentation View - Last Slide
- **present-end-sandbox-v2.html** — the full-screen presentation player and its
  end-of-deck state (toast, bottom bar, export/options modal).

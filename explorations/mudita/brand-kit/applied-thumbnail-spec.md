# Applied thumbnail

A single thumbnail, pinned to the top of the theme picker, that always shows the deck's
**currently applied** mood. It's a live mirror, not a saved option.

Demoed in [editor-theme-panel](editor-theme-panel.html).

## Rules

- One "Applied" thumbnail, always present at the top, always live.
- Update the **colour palette** → the new colours show up in the "Applied" thumbnail.
- Update the **font** → the new font shows up in the "Applied" thumbnail.
- Once the palette or font is overridden, the title reads `<mood> (modified)`.
- Fixed position — switching moods never reflows the list below.
- The applied mood may also appear in the list below; that repetition is fine.

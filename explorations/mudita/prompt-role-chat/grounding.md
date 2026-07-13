# grounding — prompt-role-chat

The **Prompt → Role → Chat** onboarding-into-create flow, prototyped straight from the JAS Figma
(**JAS — Working file**, node `160-1834`). This is the *literal Figma interaction*, not the
soft-capture rethink that lives in `../onboarding-role-in-chat/`. Both fold role capture into the
create screen; this one follows the handoff frames beat for beat.

## The flow (from Figma frames, left → right)

```
[1] Prompt screen           [2] Loader (3s)          [3] Role options           [4] Chat
    full prompt box    →     shimmer sweeps      →    prompt shrinks to     →    prompt sent as
    + toolbar                over the typed           a pill at top;             first message,
    + Create Presentation    text; box shrinks        12 role cards (3×4)        loader below
                                                       "Tailor this deck
                                                        to your role"
                                                            │ tap a card
                                                            ▼
                                                       card becomes an in-place
                                                       dropdown: search
                                                       "Your designation" +
                                                       related titles
                                                            │ Enter / pick
                                                            ▼
                                                          → [4] Chat
```

### The beats, precisely

1. **Prompt screen** — replicated from JAS `160:1595`: title "Describe your deck, or upload a file",
   the dark-ringed prompt box (Brand-Kit bar · textarea · Upload / Slides / Model / gear toolbar ·
   **Create Presentation**), 4 action pills, and the "Marketers are creating presentations for"
   suggestion rows. (Reused verbatim from `../onboarding-role-in-chat/prompt-screen-role-flow.html`.)
2. **Loader (~3s)** — no spinner card. The prompt box **collapses to just the text the user wrote**
   and a **shimmer sweeps across that text** while the box shrinks and lifts. (Figma `160:1835`.)
3. **Role options** — the prompt box stays (editable) at top; below it "Tailor this deck to your role"
   and the 12 roles as **hug-content chips in a centred wrap** (Consulting · HR · Product · Design ·
   Sales · Engineering · Marketing · Finance · Investor · Legal · Operations · Communications), each
   with an emoji. (Figma `160:1957` was an equal-width 3×4 grid; switched to a wrap so a selected chip
   can grow to its title and the rest reflow around it without shifting the whole row.)
4. **In-place dropdown** — tapping a card turns *that cell* into a dropdown **in its own spot**
   (Figma `183:766`): a search field ("Your designation") with the role's related titles below,
   first one highlighted. It floats over the cards beneath it. Type to filter; **Enter** (or click)
   on a title → chat.
5. **Chat** — the prompt is sent as the **first user message** (right-aligned bubble); a loader sits
   right below it and the chat continues. (Figma `184:980`.) The loader is **Tyo's `PaiLoader`**
   (inlined from `../../tyo/loader/chat-prototype.html`, settled config: 20px · speed 1.5 · linear ·
   transparent) — it mounts as the logo cascade then morphs to the spinner; the label + spinner phase
   cycle together ("Mulling over a few directions…" → "Structuring your outline…" → "Designing your slides…").

## Prototype decisions

- **One morphing screen** for beats 1→3 (the prompt box is the same element shrinking), then a hard
  cut to the chat stage — mirrors how the Figma frames are laid out.
- **Designations are invented per role** (sensible title ladders); Marketing matches the Figma
  sample exactly (Marketing Manager · Brand Manager · Performance Marketing Manager first). Free-text
  entry falls through so any typed title is accepted.
- **Keyboard**: ↑/↓ move the highlight in the dropdown, Enter selects, Esc closes.
- Navy `#0A1925` is the Create action; the flow otherwise stays monochrome per brand voice.

## Source

- Figma: JAS — Working file, `FilrWEhw4GFBJqKUpKabCa`, node `160-1834` (frames `160:1595`,
  `160:1835`, `160:1957`, `183:766`, `184:980`).
- Styling atoms lifted from `../onboarding-role-in-chat/prompt-screen-role-flow.html` (prompt box,
  pills, suggestion rows, shimmer, PAI mark).

## TODO

- [ ] Review the loader→role and dropdown-open motion with the designer.
- [ ] Confirm the 12 roles + emoji set against the real `onboardingData.roleOptions`.
- [ ] Decide whether Enter-on-title should hard-navigate or first confirm the picked title.

# brief: loop-check

**This screen exists to prove the loop runs here, not to be shipped.** It was drawn as
the last step of vendoring atlas into design-protos: draw from `templates/screen.html`,
lint to zero errors, render both states, look at the pictures. It is kept as the worked
example a teammate can read before their first real one, and as the thing to re-run when
something in `atlas/` looks broken.

Delete it freely. Nothing points at it.

## What it is

The modal a person sees when the presentation they asked for has finished building.
Two states, both real:

| state | what it is |
|---|---|
| `default` | the presentation is ready. Cover slide, open it or download it |
| `building` | still going. Named progress, and a way out |

## What has to be true

- **One hero.** In `default` the filled "Open in editor" carries it. In `building` the
  progress bar does, and there is no filled action at all.
- **A real picture, never a grey rectangle.** The cover is `assets/decks/refresh-capabilities/card/01.jpg`
  at `card` size, which covers 452px of modal at 2x.
- **No invented specific.** Fifteen slides is what `assets/decks/index.json` says the deck
  has. No price, no plan name, no limit appears.
- Copy follows `VOICE.md`: leads with the action, "we" language, "presentation" as the term.
  "PPT" names the export format only.

## Decided against

- **A deck title under the cover.** The headline already says what this is, and the deck's
  own name is a second fact doing no work.
- **A filled action in `building`.** Two states with a filled button in each would say the
  screen is asking for the same decision twice.

## Not done

Steps 3 (explore) and 7 (blind judge) of `AGENTS.md` were skipped on purpose: the shape
was pinned by the brief, and a throwaway that exists to test a toolchain does not spend a
judge. **A real screen does both.**

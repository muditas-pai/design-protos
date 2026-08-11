# render

How to run it, and what surprised us while building it.

```
tools/render/
  render.py         the whole stage
  test_render.py    the smoke test — run it after changing render.py
  fixtures/         nine tiny screens, one fault each
```

One file for the stage, because it opens a browser and takes pictures. `tools/lint/` has five
because it derives a vocabulary from a design system; there is nothing here to factor out.

---

## Run it

```sh
tools-python tools/render/render.py designs/<feature>/runs/<run-id>/passes/<n>
```

`tools-python` is the shared environment that holds Playwright — see `~/setup/terminal-setup.md`.
A bare `python` will not have it, and the script says so rather than failing obscurely.

| flag | default | |
|---|---|---|
| `--width` | every entry in the checklist's `viewports` | capture width, repeatable |
| `--height` | `900` | the screen height a design is judged to fit on |
| `--margin` | `48` | air round the frame |
| `--timeout` | `15` | seconds a state gets to become ready |

**Writes** `states/<state>@<width>.png` and `render.json` into the pass directory. A picture taken
with a setting off its default is named `<state>~<setting>-<value>@<width>.png`. Exit is 0 when the render
finished, whatever it found; 1 only when the stage could not do its job, and then the reason is in
`render.error.json`.

---

## What it needs from the artifact

Three things, all of them the build's job (§7):

- **`?state=<name>`** switches the screen, using the checklist's state names verbatim.
- **`window.__atlasReady`** — a promise that settles when everything has painted.
- **`data-atlas-frame`** on the outermost element of the designed thing, exactly once. It includes
  controls that belong to the design but sit off its surface: the one existing artifact puts its
  close button outside the modal, and a frame drawn round the modal alone clips it.
- **`window.__atlas`** — `{ states: [...], params: { ... } }`. What the screen says it is: the
  states it builds, and any other URL setting that changes the picture, with its values.

**The declaration is the contract; the handover comment is not.** The render reads
`window.__atlas` and cannot read prose. A setting documented only in a comment is never
photographed, and every requirement resting on it stays unjudgeable. An artifact that declares
nothing still renders — the checklist's states are used — and the fallback is recorded in `drift`.

**`drift` is where the two sources disagree.** The checklist says what was asked for; the artifact
says what was made. A state in one and not the other is named in both directions, and the render
photographs what actually exists rather than wasting a shot on a state nobody built.

Miss any of them and the state comes back `failed` with the reason, rather than producing a
plausible picture of the wrong thing.

---

## Three things that bit, and are now the reason the code looks like this

**`Request.redirected_to` is `None` inside a `response` handler.** It reads like the tidy way to
drop a redirect hop, and it silently does nothing — the request it would point at has not been made
yet. The first prototype of this stage failed a perfectly good screen because
`cdn.tailwindcss.com` answers 302 to a versioned URL that answers 200. A 3xx **is** a hop, and that
is the test the code uses.

**`page.evaluate` has no timeout and awaits a returned promise forever.** Awaiting
`window.__atlasReady` directly hangs the entire render on one artifact that never resolves, which
is exactly what the timeout exists to prevent. It is raced against a `setTimeout` instead.

**Resizing the window to fit the frame changes the layout you are photographing.** A 640px frame
sets a 736px window, which is below Tailwind's `md` — so the capture is the mobile layout, filed
under the desktop width. The picture is clipped to the frame instead. Nothing reflows, so there is
nothing to re-measure.

---

## Why `file://` and not a local server

Chromium reports a missing local file as a `requestfailed` with `ERR_FILE_NOT_FOUND`, so a server
buys nothing — and the scheme is the classifier the stage needs. A path inside the repo failing is
the artifact being wrong and the fixer can correct it; a remote host failing is transient and
nobody can edit it. The first goes in `render.json` as a finding, the second in `render.error.json`
as a re-run.

---

## Test it

```sh
tools-python tools/render/test_render.py
```

Runs the real command line against nine fixtures and asserts what came back. Takes a few seconds,
needs no network, and prints a line per check.

**One fault per file, on purpose.** They cannot share one: a hanging `__atlasReady` masks every
other fault, and marker count cannot vary by state because `querySelectorAll` finds a hidden
element as readily as a shown one.

| fixture | what must happen |
|---|---|
| `clean.html` | two states, two pictures, 560px wide, nothing complained about |
| `clean.html` + `checklist-two-widths.json` | four pictures; the narrow ones are narrower |
| `params.html` | a URL setting that is not a state — every value gets a picture |
| `drift.html` | artifact and checklist disagree; both directions named, neither fatal |
| `tall.html` | a design taller than its screen; the gap is reported in pixels |
| `clean.html` + `checklist-ghost.json` | the real state renders; the state nobody built is reported as drift, not photographed |
| `no-frame.html` | every state fails saying `found 0`, and no pictures are taken |
| `two-frames.html` | every state fails saying `found 2` |
| `missing-asset.html` | a finding in `render.json`; **no** `render.error.json` |
| `remote-asset.html` | `render.error.json` and exit 1; **no** `render.json` |
| `never-ready.html` | every state fails at the timeout and the run terminates |

**`clean.html` carries the breakpoint trap.** Its card is white above 767px and red below. A render
that resized the window to the frame would sit at 560, photograph a red card, and file it under
1440 — so the suite reads the actual pixel rather than trusting the picture's dimensions, which are
identical either way.

### It was checked against its own failure

A suite that cannot go red is decoration. Four bugs were reintroduced deliberately, one at a time:
capture by resizing instead of clipping, accept any number of frame markers, stop looking for the
unknown-state banner, and treat a remote failure as a local finding. The first, third and fourth
turned the suite red immediately.

**The second did not**, and that was a hole in the test rather than the tool: with no
`render.json` written, every check under `if rep:` was skipped and the run reported green. The
no-frame and two-frames cases now assert that a finding was recorded *and* that no stage error was,
before looking at anything else. All four mutations are caught now.

---

## Also verified by hand

Against the real artifact at `designs/feature-gate-pricing-modal/runs/2026-07-31-01/passes/2`:
fourteen pictures, seven states at 390 and 1440. All seven at 390 came back taller than the screen,
between 86px and 194px over — the defect that previously needed a judge driving a live browser to
find.

# atlas — handoff

Written 31 Jul 2026. Read this before touching anything.

## Where you are

Repo `muditas-pai/design-protos`, branch `atlas`, worktree at
`~/PAI-design/.claude/worktrees/atlas`. Branched from main, so Mudita's work is already in.

`EnterWorktree` cannot register this worktree — that tool only manages worktrees inside the PAI
vault. Work by path. It all works.

## What atlas is

A harness that takes a design brief and produces a screen in the house style, with independent
review, and writes the judgement spent on it back so the next run starts smarter.

The pipeline, and where it stops today:

| | | |
|---|---|---|
| `/atlas-brief` | vague ask → `brief.md` | built |
| `/atlas-checklist` | any brief → `checklist.json`, ratified at a gate | built |
| `/atlas-build` | checklist → an HTML artifact | built |
| render | states → PNGs + a DOM per state | **not built** |
| lint | source checks, then rendered checks | **not built** |
| two judges | does it look right / does it solve the brief | **not built** |
| adjudicate | merge findings, route to deliver, correct, or halt | **not built** |
| harvest | write the judgement back | **not built** |

Everything after `atlas-build` was deliberately deleted, not lost — see *The old branch* below.

## Decisions already made — do not re-litigate

- **Skills reason; scripts do not get a vote.** The renderer reports whether a state was reachable
  precisely because it cannot have an opinion.
- **brief and checklist stay separate skills.** The checklist stage works on a PRD from anywhere,
  not just our own brief. That is the whole argument for the split.
- **The checklist is a scoring rubric, never a plan.** It says what must be true of the finished
  thing. A plan can be fully executed and still be wrong, and a judge handed a plan grades
  adherence to the plan.
- **One claim per id — split on "and".** A requirement reading "dismissible by the close control
  and dismissing returns them to what they were doing" had the renderer report reached and the
  judge report met, both correct about their own half, second half never checked by anyone.
- **States are free-form strings**, not a five-value enum. A real brief named seven.
- **`source` names the brief section** a requirement came from, which makes coverage checkable at
  the gate. The old `"template"` value is dead.
- **`examples.json` holds Do's and Don'ts in one file.** Rows point at files that already exist,
  never copies. A Don't carries `element`, `problem`, `instead` — a Don't with no instruction gets
  rediscovered every run. Both kinds reach *generation*, not just a later judge.
- **Content gaps halt the run.** A string or number missing from `atlas/content.md` is emitted as
  `{{content:key}}` and stops the build rather than being invented. This is the intended path.
- **Motion is freezable, not banned.** `?freeze=1` by default so a renderer that forgets the flag
  still gets a stable image; `&freeze=0` restores real motion for a human.
- **No canonical replica app.** baby-PAI was built, spiked and argued out — ten small annotated
  prototypes instead. A replica drifts invisibly and a stale anchor produces confident wrong
  judgements.
- **Mudita's `tools/annotate/` replaces agentation outright.** Standalone, no CDN. It records the
  file `hash` a judgement was made against, and which `state` the proto was in — neither of which
  agentation could do. The 500-line re-anchoring glue we wrote for agentation is dead.

## What is open

- **`atlas/examples.json` is empty**, so every build is unanchored and says so. Mudita's 13 protos
  in `explorations/mudita/design-harness/` are the obvious first rows. **Highest leverage thing
  missing.**
- **`annotations.jsonl` has no way to mark a Do.** All four of Mudita's notes are corrections.
  Do's are what get few-shot into a build. Ask her.
- **The digest is unbuilt** — `annotations.jsonl` → lint rules and judge rubric rows. That is the
  question Mudita asked and it has not been answered.
- **The fixture artifact was built against the old design system.** `pai.css` went 237 → 513 lines
  on main. Re-run to see what the token changes did.
- **`reach` came out null 53 times out of 53** on the one real run, because a brief written in
  prose never names a control. Fixed upstream — `atlas-brief` standing question 11 asks what the
  controls are called — but that fix is unproven.
- **The gate does not survive a long checklist.** 53 rows from a 134-line brief; nobody reads row
  38. Mitigated by grouping the table by state and showing only what changed on a re-run. Still
  the weakest part of the design, and the gate is what makes the product judge mean anything.
- **There is no eval.** Nothing tells us whether the accumulated rules improve output. Without
  running a build with and without its guidance and comparing, this piles up confident nonsense at
  exactly the same rate as no system at all. Three independent sources landed on this.

## The fixture

`explorations/dhruv/feature-gate-pricing-modal/` — a feature-gate pricing modal, taken end to end:
`brief.md` → `runs/2026-07-31-01/checklist.json` (53 requirements, 7 states, 4 not checkable) →
`artifact.html`. The only end-to-end proof there is. Re-run it when a part changes.

Serve from the repo root and load `?state=default` — states are `default`, `no-offer`,
`offer-part-spent`, `offer-expired`, `pending`, `already-on-pro`, `video-unavailable`.

Its content values are **placeholder and marked as such** in `atlas/content.md`. Nobody signed off
on those numbers.

## The old branch

`design-harness` at `9724eae`, pushed. Holds everything cut in the restart: the original harness
spec and its canon variant, the system diagram's ancestor, `pai-lint.py` (7 source checks working,
5 rendered checks that never once ran), the agentation glue with its test suite, the baby-PAI
spike, and the one hand-driven run from 25 Jul. Recover from there rather than rebuilding.

## Working notes

- The user is the CPO. Be pithy — lead with the answer, no recap at the end.
- Long or noisy work goes to a subagent; the main thread stays clean for the design conversation.
- Verify before claiming. Serve it, load it, screenshot it. Do not report a pass you did not see.
- `python3 -m http.server` from the **repo root**, not the artifact's folder — the design-system
  relative paths need it.

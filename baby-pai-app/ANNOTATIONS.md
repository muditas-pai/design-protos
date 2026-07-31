# Annotations — defining what is good, in a form that becomes rules

A way to pin located judgements onto screens, keep them in the repo, see them on
the running app, and turn the recurring ones into lint checks, style rules or
checklist defaults.

The point is not comments. It is that the harness has no corpus of *good* and
*not good* on day one, and no mechanism for a designer's eye to become a rule.
This is that mechanism.

**Built and running as a spike.** `Shift-C` on any route to see and author;
`npm run annotations` for the review packet; `-- --check` to validate in CI.

In-browser authoring writes straight to the repo. A dev-only Vite middleware
(`vite-plugin-annotations.js`) accepts a POST and appends to the co-located
file, so a note you pin becomes a diff you can read in a PR. Paths are
constrained to `src/**` and `*.annotations.json`, and it is not mounted in a
build.

---

## The shape

```
  capture              evidence            analysis           decision        home
  ───────              ────────            ────────           ────────        ────
  a designer     →  *.annotations.json  →  cluster by     →   you accept  →  lint rule
  pins a note       co-located, globbed    rule slug          or reject      style rule
  to an element                            across surfaces                   checklist default
                                           ↓                                 content fix
                                        review packet                        exemplar row
```

**Automation ends at the review packet.** Nothing becomes a rule without a
person saying so. Borrowed from Vercel's intake, and it matters more than it
sounds — see *Collector and judge are separate* below.

---

## Three surfaces, three jobs

| Surface | Carries | Feeds |
|---|---|---|
| **canonical screens** | mostly `good` | the ✅ side, exemplar candidates |
| **anti-pattern explorations** | `bad` | the ❌ side, known-failure matching on day 1 |
| **real explorations** | mixed critique | recurrence counts, which is what promotes a rule |

Canonical screens are all dos by construction, so the don'ts need somewhere to
live. The harness spec **considered and cut** an `examples/bad/` folder, on the
grounds that *"a rejection becomes a row in the anti-pattern table, pointing at
the file where it already sits"*.

That reasoning holds and we don't need to break it. Author the bad screens as
**explorations that are deliberate don'ts**:

```
src/explorations/anti-patterns/one-emphatic-action/V1.jsx
src/explorations/anti-patterns/density/V1.jsx
```

They are then real files sitting where they sit, anti-pattern rows point at them
exactly as specified, and the empty corpus problem goes away. No new folder
concept, no contradiction.

---

## An annotation

Capture writes a small core. Everything else is added later by the analysis
pass, so an annotation grows rather than arriving complete.

```json
{
  "at": {
    "region": "sidebar.workspace",
    "selector": "#root > div.app > aside.sidebar > nav.nav:nth-of-type(2) > button.nav-item:nth-of-type(2)",
    "tag": "button", "classes": ["nav-item"],
    "text": "Create project Pro",
    "route": "/dashboard"
  },
  "verdict": "bad",
  "note": "Create project carries a PRO badge but stays fully enabled, so a free user only learns it is gated after clicking",
  "status": "proposed", "author": "mudita",
  "as_of": "2026-07-30", "still_valid": true
}
```

**That's the whole capture contract: where, which way, and what you saw.** The
`rule`, `why` and `instead` below are *enrichment* — an LLM reading the packet
proposes them and you rule on it. Making a person type a rule slug while
looking at one screen is asking them to cluster a corpus they can't see.

### Enriched form

```json
{
  "anchor": "sidebar.upgrade-badge",
  "verdict": "bad",
  "note": "a brand-blue badge next to the topbar's brand-blue Upgrade button puts two equally weighted upgrade affordances on one surface",
  "instead": "neutral badge; keep one emphatic upgrade affordance per surface",
  "why": "one emphatic action per surface",
  "rule": "one-emphatic-action",
  "pairs": "canonical/dashboard#topbar.upgrade",
  "status": "proposed",
  "author": "mudita",
  "as_of": "2026-07-30",
  "still_valid": true
}
```

| Field | Does what |
|---|---|
| `at` | the located element, captured automatically (see *Anchors*) |
| `verdict` | `good` or `bad`. Good is first-class — it is half the job |
| `note` | the observation. Must pass the bar below |
| `instead` | required on `bad`. Without it the note reaches the judge but never the builder |
| `why` | the principle, in words a rubric row could use |
| `rule` | slug. **The join key.** Recurrence is counted on this |
| `pairs` | optional counterpart, so a ❌ can name its ✅ and the row assembles itself |
| `status` | `proposed` → `accepted` → `rejected`. Candidates stay pending until a human rules |
| `as_of` · `still_valid` | corrections supersede rather than delete, per vault convention |

**No `route` field, and nothing about which home it belongs in.** See below.

---

## The bar: observable, not subjective

An annotation is only usable if it names something you could check.

> *"Destructive actions use Verb + Noun" is usable. "Buttons should be clear" is not.*

This is the same instinct as the harness's rule that *every requirement must be
decidable from a picture or from the code*, applied to rules instead of
requirements.

| Rejected | Rewritten |
|---|---|
| "feels cluttered" | "8 stat cards at equal weight, so nothing reads as the headline" |
| "the badge is wrong" | "brand-blue badge duplicates the topbar's upgrade affordance" |
| "make it more premium" | not an annotation. It is a direction, and direction is the designer's call, not a rule |

A note that cannot be rewritten this way is not evidence, and should not be
stored as if it were.

---

## Collector and judge are separate

The capture step **does not propose a home**. A designer pinning a note is in
capture mode, and will route by gut. So an annotation records what was seen; a
separate pass decides what it means.

```
collector   the person, in the browser        writes evidence only
            ↓
analysis    a pass over every annotation      clusters by `rule`, counts across
            plus findings.jsonl                surfaces, verifies anchors resolve
            ↓
packet      proposals with their evidence     "one-emphatic-action: 4 sightings,
            ↓                                  3 surfaces. lint check? style rule?"
you         accept · reject · defer           the only step that changes anything
```

The four homes, matching the harness's harvest table: **lint check** ·
**style rule** in `pai-visual-language` · **checklist default** in
`requirements-template.md` · **content fix** in `content.md`. A `good`
annotation on a clean artifact is also an exemplar candidate.

Which home gets proposed follows one test: **does the note name a concrete value
(a hex, a px, a count, a string)?** If yes it is mechanically checkable and
belongs in the lint. If it names a judgement, it belongs in the rubric.

### Rules cite their source, both ways

A lint check carries a pointer back to the prose it enforces, and the prose
carries the check id:

```
rule/one-emphatic-action     Source: pai-visual-language > Emphasis
```

Without this the lint and the rubric are separate universes, and nobody knows
which checks to revisit when the prose changes.

---

## Where they live

Co-located with what they describe, globbed like everything else in this app:

```
canonical/components/Sidebar.annotations.json      → shows wherever Sidebar renders
explorations/<who>/<problem>/V1.annotations.json   → shows on that route only
```

**The file's location is the scope.** So annotating while looking at an
exploration asks one question: *is this about the sidebar, or about this
variation?* That is the same question harvest asks, so it costs nothing extra.

Not one central `annotations.json`, despite `exemplars.json` setting that
precedent. A central file is a shared file, and shared files are the thing this
app's architecture exists to avoid. Aggregation happens at read time, which
gives "one thing to grep" without the merge conflicts.

---

## Anchors

**Any element is annotatable, at any level of grouping.** Hover to select,
`[` and `]` to narrow and widen through the DOM, so you can judge a nav item,
the nav it sits in, or the whole sidebar.

An earlier version only allowed elements someone had pre-tagged with
`data-annotate`. That made capture serve storage: you could only judge what had
already been anticipated, which is exactly backwards.

A selector alone is fragile — that was the real objection to agentation's
captured selectors, and it still holds. So capture records a **descriptor**, not
just a selector:

```json
{ "region": "sidebar.workspace", "selector": "…", "tag": "button",
  "classes": ["nav-item"], "text": "Create project Pro", "route": "/dashboard" }
```

If the selector rots, the region, classes and text still say what the note was
about, and re-anchoring becomes a job the analysis pass can do rather than a
mystery. `data-annotate` survives as an optional **region marker** — a name for
a part, so notes cluster by area even when the clicked element is three levels
deep and anonymous.

---

## Seeing them

`Shift-C` toggles the overlay on any route. Every anchored element gets a pin:
coloured by verdict where there are notes, a faint `+` where nobody has judged
it yet. Clicking opens the notes, and *Add annotation* opens the composer.

The composer asks four things — verdict, what you see, why, and a rule slug
— plus one scope question: **is this about the component, or this variation?**
That decides which file it writes to, and it's the same question harvest asks.

It asks nothing about where the annotation should end up. It also soft-warns
in place when a note trips the observability bar, so the correction happens
while you're still looking at the screen rather than at review time.

This is the part that makes annotations a design artifact rather than a data
file: you see what has been judged, and what never has, while looking at the
screen.

---

## Two ledgers, one query

`findings.jsonl` is the harness's own log — machine-written at adjudicate, one
line per defect, immutable, and only ever written during a run. Annotations are
human-written, live, correctable, and exist without any run.

Keep them **separate on disk** because their lifecycles genuinely differ. Have
analysis **count across both**, joined on the `rule` slug. That is why the slug
carries so much weight.

On day one `findings.jsonl` is empty, so annotations are the only evidence that
exists. The anti-pattern explorations are, in effect, seeded findings.

---

## Coverage gaps are an artifact

A standing `coverage-gaps.md`: surfaces with no annotations, rules with no check,
checks never written. Absence of guidance stays visible instead of being
discovered at Deliver.

Without it, patchy coverage reads as approval.

---

## What this does not solve

- **It does not know whether an annotation is right.** Wrong notes become wrong
  rules, faster. Evals are the answer and they are not in scope here.
- **It does not write lint checks.** It proposes; a person writes them. If nobody
  does, the ladder stalls, which is already open question #3 in the harness spec.
- **Non-element critique has no home.** "This flow feels slow", "the copy is
  off-brand throughout". Route-level notes cover some of it; flow-level and
  global do not have a scope yet.
- **Stale detection is weak.** The anchor surviving does not mean the note still
  applies.
- **No disagreement handling.** Two designers, one anchor, opposite verdicts,
  nothing resolves it.
- **React only.** The 227 HTML protos cannot carry these.

---

## Open questions for the harness

Three of these touch the harness spec rather than this app, and are proposals
rather than changes:

1. **Does harvest read annotations as well as `findings.jsonl`?** It should, and
   that is a change to harvest's counting step.
2. **Does `exemplars.json` accept a `good` annotation as an anchor candidate?**
   The closing question already asks *"is this the reference?"*; this would give
   it a queue.
3. **Do anti-pattern explorations count as the `example:` path** the anti-pattern
   table wants? They are files sitting where they sit, so it seems yes, but they
   were authored to be bad rather than rejected after the fact.

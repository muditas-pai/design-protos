---
name: design-checklist
description: Turn a written brief into checklist.json — a numbered checklist of what must be true of the finished artifact, one claim per id, each tagged with the state it lives in and how that state is reached, then ratified by the person who owns it. Mechanical, not interpretive: it extracts, splits and classifies what the brief already says, and never interviews, never invents a specific. Invoke once a brief exists and before anything is drawn or generated, when a build needs the list it will be scored against, or when someone asks what this run will be judged on. Works on any brief — one written by design-brief, a PRD, a spec, a Notion page — and reports what was missing rather than filling it in.
---

# design-checklist

## What this produces

One file — `checklist.json` — and the user's ratification of it.

It is a **scoring rubric**: what must be true of the finished thing. Not a plan — it never says how
to build it, in what order, or with what components. If a line you wrote could be *followed*, it is
a step and does not belong here.

The judgement was already spent; the brief is the record of it. This step is mechanical — extract,
split, classify, show, ratify. **No interview**; the only question asked is the gate at the end.
Never add a requirement the brief does not support, and never fill in a specific nobody gave you —
a number, a label, a threshold. A gap is reported, never closed.

---

## Step 1 — map the brief's sections

| What you need | Where it usually is | If it isn't there |
|---|---|---|
| the claims | *What has to be true* · acceptance criteria · a PRD's musts | take them wherever the brief makes them, prose included. Record `no-claims-section` |
| the states | a states / cases table | take every state the prose names. If none, write one state using the brief's own word for the ordinary case, else `default`. Record `states-inferred` |
| how each is reached | that table's *how they get there* column | derive per Step 4. If nothing supports it, `reach: null` and record `reach-unsupported:<state>` |
| what was left open | *Left open* · *Open questions* · *Risks* · TBDs | derive the reasons yourself per Step 5, and record `reasons-derived` |
| widths to draw | *What varies* · responsive notes | `[390, 1440]`, and record `viewports-defaulted` |

**Degrade and report, never fabricate.** Every absence becomes a token in `degraded` and a line at
the gate. A brief missing half its sections still produces a checklist — a visibly thin one.

---

## Step 2 — one claim per id

**A requirement joined by "and" is two requirements.** Split it.

> *"Turning the digest off stops the emails and tells the person when the last one arrives."*
> **R4** Turning the digest off stops the emails.
> **R5** Turning the digest off tells the person when the last email arrives.

The test: can you picture the finished thing where the first half holds and the second does not?
Then they are two. This is not pedantry — a joined requirement gets one half checked by one actor
and the other by another, each reports correctly on its own half, and the half nobody owned is the
one that ships broken.

Do not split when the conjunction *is* the claim — *"the illustration and the caption change
together"* asserts coupling, and splitting it destroys what is being asserted.

Strip modality: "should be able to" becomes a present-tense assertion. Keep the brief's own words
otherwise; never sharpen vague into specific. Number `R1`…`R<n>`, dense, in the brief's reading
order, assigned **after** all splitting. No `R5a`, no gaps, no reuse.

---

## Step 3 — states

Free-form strings in the brief's own vocabulary, not a fixed list — real briefs name their own,
usually more than a stock enum would hold. Take the name from the states table's first column
where there is one, and where the brief names one state two ways use that spelling everywhere.
Never mint a third.

**Normalise:** lowercase · trim · collapse every run of spaces, slashes and punctuation to one
hyphen · no leading or trailing hyphen · under about 32 characters.
`Empty / no results` → `empty-no-results` · `Sync part-finished` → `sync-part-finished`

`state: null` only when the requirement is tied to no state: every `not-checkable` one, and an
active one that holds regardless of what the artifact is showing. Everything else names a state,
the ordinary one included.

---

## Step 4 — reach

One question: **with the artifact freshly loaded and nobody having touched it, can the person be
looking at this state?**

- **Yes → `reach: null`.** The state is a condition of the world at open time — the account, the
  data, the system, something done elsewhere. Downstream loads it directly.
- **No → `reach` is a click path.** The state exists only after someone acts on *this* artifact.

The *how they get there* column usually decides it: a condition, or an action taken elsewhere, is
static; a control on this artifact is driven.

**Click path format** — one line, steps separated by ` > `; each step `<verb> <target>`; verbs
`click`, `press`, `hover`, `type <value> into`; target is a CSS selector when the brief names an id
or class, else the visible label in double quotes. No waits, no assertions: it says how to arrive,
not what to check on arrival. `click "Add teammate" > click #confirm` · `press Escape`

A click path is a **claim**, not evidence. Something downstream drives it for real and reports
whether it got there; a path that cannot be walked is that actor's finding, not yours.

**Reach belongs to the state, not the requirement.** Every requirement carrying the same `state`
carries the byte-identical `reach`. If two need different paths, they are two states.

---

## Step 5 — what cannot be settled from a picture

Every requirement must be decidable by looking at the finished thing or reading its code. One that
isn't is marked `status: "not-checkable"` **with a reason** — never quietly reworded into something
scoreable, because a reworded requirement is a different requirement and the one the brief asked
for stops being tracked by anyone. Usual cases: outcomes measured after launch · frequency, capping
and eligibility rules living server-side · business or legal risk · anything needing usage data.

**Carry the reason, do not re-derive it.** Where the brief has a left-open section, the reason is
already written and already agreed. Compress to a line, keep its sense, do not improve on it. But
not everything left open is a requirement:

| Kind | Destination |
|---|---|
| a claim about the finished thing nobody can score | a `not-checkable` requirement carrying that reason |
| a missing string, number or asset | **not a requirement.** `degraded: ["content-missing:<slug>"]` and a gate line |
| a process note — someone should look at this | a `not-checkable` requirement only if the thing cannot ship without it; else drop it and say so at the gate |

`not-checkable` implies `state: null` and `reach: null`. Nothing renders it, no judge walks it.

---

## The schema

```json
{ "run_id": "2026-06-03-01", "brief_path": "explorations/rae/first-run-checklist/brief.md",
  "brief_sha": "9f2c…", "surface": null, "register": null, "viewports": [390, 1440],
  "anchors": [], "degraded": ["states-inferred"], "ratified_at": null, "requirements": [
    { "id": "R1", "text": "Skipping lands the person on the workspace, not back at sign-up.",
      "source": "backing-out", "state": "skipped", "reach": "click \"Skip for now\"",
      "status": "active" },
    { "id": "R2", "text": "The step is shown at most once per account.",
      "source": "left-open", "state": null, "reach": null, "status": "not-checkable",
      "reason": "server-side eligibility; nothing in the rendered step can evidence it" } ] }
```

Every key is required and always present. `reason` is the one exception: required when `status` is
`not-checkable`, absent otherwise. `null` is legal only where the type says so.

| Field | Type | Meaning |
|---|---|---|
| `run_id` | string | `YYYY-MM-DD-NN`, matching the containing directory |
| `brief_path` | string | repo-relative path of the brief consumed |
| `brief_sha` | string | sha256 of the brief's bytes (`shasum -a 256`), or `"unreadable"`. Lets a later run tell whether the brief moved under it |
| `surface` | string \| null | carried through if the caller supplied one. **Never classified here** — `null` otherwise |
| `register` | string \| null | same |
| `viewports` | int[] | widths in px to be drawn, at least one |
| `anchors` | string[] | written `[]`. A later step fills it after ratification, so nothing is approved sight-unseen |
| `degraded` | string[] | one lowercase-with-hyphens token per expected input absent or decision taken without support; `content-missing:<slug>` for a named gap. May be empty |
| `ratified_at` | string \| null | `null` until the user ratifies, then date and time in words — `"3 Jun 2026 14:07"`. Downstream tests only for non-null; the format is for whoever reads the file |
| `requirements` | object[] | at least one, in `id` order |
| `…[].id` | string | `R<n>`, 1-based, dense, unique in the file |
| `…[].text` | string | exactly one claim, present tense, about the finished thing |
| `…[].source` | string | the brief section it came from, as a lowercase-with-hyphens slug of that heading — `what-has-to-be-true`, `states-and-cases`, `backing-out`, `left-open`. `unsectioned` when the brief has no headings |
| `…[].state` | string \| null | normalised per Step 3 |
| `…[].reach` | string \| null | `null` when the state loads directly; else a click path per Step 4 |
| `…[].status` | `"active"` \| `"not-checkable"` | `active` entries are the only ones anything downstream renders or judges |
| `…[].reason` | string | why it cannot be decided from the finished thing or its code |

**`source` makes coverage checkable.** Group by it, and a brief section that produced zero
requirements shows up as a hole now rather than as a missed obligation later.

---

## Where it writes

`explorations/<designer>/<problem>/runs/<run-id>/checklist.json` — beside the brief, one
directory per run. There will be many runs against one brief, and the problem folder stays
browsable with them together under `runs/` rather than interleaved with the work.

**run-id is `YYYY-MM-DD-NN`** — the date the run started, then a two-digit sequence from `01`,
incremented past the highest existing sibling for that date. Numeric because directory names have
to sort. It is the only numeric date anywhere; every date *inside* a file is written `3 Jun 2026`.

---

## The gate

Nothing downstream runs until the user ratifies. Show, in chat, in this order.

**1. The table** — prose, never JSON; people ratify sentences. Columns `id · requirement · state ·
reach · from`, one row per `active` requirement. Reach reads `loads` for `null`, the click path
verbatim otherwise.

**Group the table by state**, one sub-table per state, cross-state invariants last. A real brief
yields dozens of requirements, and an ungrouped list of fifty is not read — it is scrolled past,
which costs the gate the only thing it is for. Grouped by state, each block is a handful of rows
answering one question: does this state make sense? Say the count per group.

On a re-run against the same `brief_path`, compare with the previous run's `checklist.json` and
show **only what changed** — new, altered and dropped rows — with one line naming how many carried
over untouched. Ratifying fifty rows a second time is how a gate stops being read.

**2. Not checkable — its own block, always, even at one row.** Id, requirement, reason, and the
count against the total on the same line: *"3 of 14 requirements cannot fail."* A checklist where
a third of the rows are unfailable is a checklist that cannot fail, and that has to be seen
**before** approval, not discovered when the verdict comes back clean.

**3. Splits.** Each one as the original sentence and the ids it became. The user ratifies your
surgery as much as your reading.

**4. Coverage and degrade.** One plain line per `degraded` token; one per brief section that
produced no requirements; one per ambiguity and how you read it.

**5. The question.** `AskUserQuestion`, one call: **Ratify** *(Recommended)* — write `ratified_at`
and hand over · **Change something** — they say what; edit, re-show the whole table, ask again ·
**Send the brief back** — the gaps are too big to build against; stop, `ratified_at` stays null.

Ratify is the only thing that writes `ratified_at`, and no downstream step may treat a null
`ratified_at` as approval.

---

## Done when

`checklist.json` exists at its path, every requirement is one claim, every state is normalised
and shares its reach across that state, every `not-checkable` entry has a reason, `degraded` names
every gap you found, and `ratified_at` is set. Hand the file over; do not draw from here.

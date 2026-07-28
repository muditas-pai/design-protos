---
title: Design harness
created: 2026-07-25
updated: 2026-07-25
status: draft
---

> [[#What this is]] · [[#The pieces]] · [[#Day 1]] · [[#The run]] · [[#The two judges]] · [[#Loops and budgets]] · [[#Harvest routes]] · [[#What this deliberately does not do]] · [[#Open questions]]

Companion to `design-harness-diagram.html`. The diagram shows the shape; this pins the decisions the boxes can't hold.

---

## What this is

A harness for building a screen or feature in the presentations.ai house style, from a written brief, with two independent reviews and a feedback loop that makes the next build start smarter.

One skill — `pai-build` — carries the whole thing. Harvest is its closing phase, not a second skill. The entry point is stated in the repo's `CLAUDE.md`, which raises the odds far more than skill triggering does — but it is the same kind of instrument: prompt text, not enforcement.

It lives in the shared PAI-design repo, so every designer working with Claude gets the same harness.

**Vocabulary**, once, because the rest depends on it. A **finding** is one located defect with an edit instruction, marked `blocking` or `advisory`. A **pass** is one full verify — lint, render, both judges. A **halt** ends the run and names what a human must do; a **conflict** is two blocking findings that cannot both be satisfied. **Clean** means a pass produced no blocking findings.

---

## The pieces

Two kinds of input. **The brief** says what to solve. **The assets** say how it should look and what real content goes in it.

| Piece | Job | Owner |
|---|---|---|
| the brief | a feature spec or PRD — the problem, who for, what counts as solved | whoever wrote it |
| `requirements-template.md` | defaults every brief inherits — the edge cases we always forget | harvest grows it |
| `content.md` | real strings and numbers — plan names, prices, limits, error copy. Frontmatter carries `owner:`, `as_of:`, `source:` | the CPO, in v1 |
| `design-system/` | `pai.css` (tokens and class vocabulary), `components.html`, `template.html`, `pai.tailwind.js`. Every artifact links `pai.css` by relative path; the lint keys its checks off its class names | owned elsewhere, PR-gated |
| `exemplars.json` | one row per exemplar: `{path, surface, register, origin: "human"｜"generated", approved_at, run_id, as_of, still_valid, note}`. A file not listed here is never an anchor | harvest appends |
| `pai-visual-language/` | the style in prose; its **anti-pattern table is the design judge's rubric**, and its *Quick reference* section is the surface × register list | harvest amends it |
| `lint/pai-lint.py` | everything checkable without judgment | harvest grows it |

Exemplars are **rows pointing at files that already exist**, never copies. A second copy drifts from the first, which is the disease this system is supposed to cure. One central index rather than per-file sidecars: one thing to grep, prune and diff, and harvest's write is a one-line append. It also means the couple of hundred untagged drafts already sitting in `explorations/` cannot leak into retrieval.

Three things were considered and cut, because each already exists elsewhere in the same repo: a separate `taxonomy.md` (the *Quick reference* covers it), an `interaction patterns` asset (`components.html` is the behavioural vocabulary, and it is PR-gated), and an `examples/bad/` folder (a rejection becomes a row in the anti-pattern table, pointing at the file where it already sits — which also means known-failure matching has entries on day 1, and a rejection reaches the *builder*, not only the judge).

### Scope tags are opt-in

A lint check or an anti-pattern row may carry `applies_to: {surfaces, registers}`, and then it loads only on matching runs. **An entry with no `applies_to` loads on every run.** Global is the default; narrowing is something harvest does later, to a rule that proved too broad. This is why an odd surface cannot accidentally switch the checks off.

---

## Day 1

### Exists today

`design-system/` · `key-screens/` (dashboard, editor, pricing) · `pai-visual-language/SKILL.md`, including its anti-pattern table and its *Quick reference: which register am I in?* section.

### Write before run 1

Three files by hand, in one sitting:

- `content.md` v0 — plan names, prices, limits, error copy, with `owner:` and `as_of:`
- `requirements-template.md` — five to eight defaults you already know you forget. Only things no check already covers: *free-plan behaviour is shown* · *the empty case is designed, not just the happy one* · *what happens after the primary action* · *the copy says what the user gets, not what the system does*
- `exemplars.json` — the three key-screens plus a handful of `explorations/` files you already rate, at least one per register

Then `lint/pai-lint.py`, which is a **day-1-and-after** job, not one sitting. Write the four source checks first (they are a morning's work: template start, no `style=`, no colour/radius/spacing literals, the placeholder denylist). The rendered checks arrive as you need them. **A missing check is not a blocker** — the lint reports which check families are implemented, and Deliver prints the ones that were not run, so a thin lint never reads as a clean bill of health.

**The harness does not run until `content.md`, `requirements-template.md`, `exemplars.json` and a lint with at least its source checks exist.**

### Missing assets, and an empty corpus

Step 0 preflights. A required asset that is missing or empty **halts the run** with `verdict: "preflight"` and prints the paths — it never degrades silently. An optional corpus that comes back empty is recorded in `run.json` as `degraded: [...]` and printed in the Deliver header, so a degraded run never reads like a clean one.

---

## The run

### Where a run writes

Two roots. `$PAI_DESIGN` is the repo the skill itself lives in — resolved from the skill's own directory, walking up to the git root. `$PAI` is the repo the *brief* lives in, resolved the same way from the brief's path. They are different repos, so neither is found by discovery from the other, and neither is ever hardcoded.

One run directory — `$PAI_DESIGN/explorations/<you>/<problem>/<run-id>/`, where run-id is `YYYY-MM-DD-NN` — holding `requirements.json`, `draft.html` (plus `draft-pass<N>.html`), `states/<state>@<width>.png`, `findings/pass<N>.json`, and `run.json`:

```
{ run_id, brief_path, brief_sha, surface, register, anchors: [], degraded: [],
  checks_not_run: [],
  passes: [ { n, blocking, advisory, missed, conflict } ],
  verdict: "clean" | "budget-spent" | "conflict-stop"
         | "checklist-bug" | "content-gap" | "lint-stuck" | "preflight",
  human_rulings: [ {pass, question, ruling} ], overrides: [] }
```

Six of those verdicts are halts. **Every halt names the one thing a human must do, and resuming is a new run** — same `brief_path`, next `run-id`, carrying forward `human_rulings` and `overrides`. There is no mid-run resume to get wrong.

Step 0 loads `human_rulings` and `overrides` from the most recent prior run on the same `brief_path` and shows them at the gate, so a settled question is not re-litigated. `brief_sha` records whether the brief itself changed since; if it did, the gate says so and the rulings are shown as *possibly stale* rather than replayed silently.

### 0 · Frame the brief

Preflight, then turn the doc into a numbered requirements checklist inheriting the template's defaults, and fix the surface and register from *Quick reference*.

```
{ run_id, brief_path, brief_sha, surface, register,
  viewports: [390, 1440], anchors: [<path>], ratified_at,
  requirements: [ { id: "R1", text,
      source: "brief" | "template",
      state: "default"|"empty"|"loading"|"error"|"success"|null,
      reach: null | "<click path>",
      status: "active" | "not-checkable",
      reason } ]                  // required unless status is "active"
}
```

Step 4 renders exactly the distinct non-null `state` values, at every viewport. The product judge walks exactly the `status: "active"` entries and reports the rest as not judged. Every finding carries the requirement `id` it maps to, or `null` for a pure style finding.

One hard rule: **every requirement must be decidable from a picture or from the code.** A requirement that isn't — "increases trial conversion", "feels premium" — is marked `not-checkable` with a reason rather than quietly reworded into something scoreable. `not-checkable` entries are listed at the gate as their own block, because a checklist where half the requirements are unscoreable is a checklist that cannot fail, and you should see that before you ratify it.

If two entries in *Quick reference* fit, both are presented at the gate rather than one being picked. If none fits, `surface: "unclassified"` is written: retrieval falls back to register-only anchors, the design judge skips the pairwise comparison, `degraded: ["surface"]` is recorded so Deliver prints it, and the gap becomes a harvest candidate. Checks and rubric rows are unaffected — unscoped entries load regardless, and a scoped one simply does not match.

### The gate · You ratify

**A minute or two, honestly** — reading twelve requirements and two lists is not a thirty-second job, and pretending otherwise is how a gate gets skipped.

You ratify three things: surface, register, and the numbered list. Plus two blocks when non-empty: what came from the template, and what is `not-checkable`.

This is the only stop that *waits* for you. Everything else that involves you — a checklist bug, a conflict, a content gap — **ends the run** and hands it back, rather than pausing with a prompt open.

The builder and the product judge both score against this list. If the list is wrong they are wrong *together*, and the judge's independence buys nothing — it would be checking the build against the orchestrator's own misreading. Ratification is what makes the product judge's verdict mean something.

### 1 · Retrieve

Exact `surface` + `register`, `still_valid: true`, most recently approved first, cap three. If fewer than two hit, widen to the same surface in any register, then to the register alone.

The set **must include at least one `origin: "human"` anchor** whenever one exists for that surface — the only thing standing between the corpus and feeding on its own output. If nothing is found at all, `anchors: []` is written, the operator is told this is an **unanchored run**, and the design judge is instructed to skip the pairwise comparison and say so, rather than improvise an anchor.

The chosen anchors are written to `requirements.json` at this point — before generation, and after ratification, so they are never something you were asked to approve sight-unseen.

### 2 · Generate

Build against the ratified checklist, **few-shot on the anchors retrieve just chose**. The anchors steer layout, density and voice here, at the only moment prevention is cheaper than correction; the design judge later sees the same ones so that it is comparing like with like.

**Content-gap protocol.** For any user-visible string, number, price or limit not resolvable in `content.md`, generation emits the literal token `{{content:<dotted.key>}}` rather than inventing a value. If any survive to the end of generation, the run halts with `verdict: "content-gap"` and prints the missing keys. You add them to `content.md`; the next run picks them up. This is the intended path, not an error, and it spends no judge pass.

#### Artifact contract

The generated file must start from `design-system/template.html` and link `design-system/pai.css` by relative path — never inlined, never copied.

Every state named in `requirements.json` must be reachable in one of two ways, and the requirement's `reach` field says which: a **driven** state (`reach` is a click path) is produced by interacting with the artifact; a **static** state (`reach: null`) is produced by loading `?state=<name>`, which sets `document.body.dataset.state` and shows the matching `[data-state]` branch. A named state that the renderer can reach neither way is a blocking finding from the renderer.

### 3 · Lint

Two phases, because half of what needs checking only exists once the page has rendered.

**Source checks** run first, on the file, in milliseconds: starts from `template.html`; no `style=` attributes; no colour, radius or spacing literals outside `pai.css`'s token block; no placeholder text (`lorem`, `$XX`, `1234`); no unresolved `{{content:*}}`. A failure here short-circuits before render — no screenshots, no judges, no pass spent.

**Rendered checks** run after step 4, once per state, scoped to that state's `[data-state]` branch:

- **Numbers and prices** — every currency amount, percentage and numeric limit in the rendered text must appear verbatim in `content.md`. Numbers only, deliberately: scraping *all* text would false-fail on ordinary copy every run, and a check that cries wolf gets switched off.
- **Component markup** — any element carrying a `pai.css` component class whose structure differs from that component in `components.html`.
- **Three a11y checks** — text contrast ≥ 4.5:1, an accessible name on every interactive element, a visible `:focus-visible` style on every interactive element.

Lint findings are blocking and route to correct in the same format the judges use. A source-check failure re-runs the source checks only; that cycle is capped at three, and a third consecutive failure halts with `verdict: "lint-stuck"`. Rendered-check findings join the judges' findings at adjudicate and are governed by the ordinary pass budget.

### 4 · Render the states

Playwright, headless, DPR 1, light theme. Every distinct state at every viewport, saved as `states/<state>@<width>.png`.

For a state whose requirement carries a `reach` path, the renderer **drives it through the UI** and records `reached: true|false`. This is where reachability is decided — the renderer is the only actor that tried it. `reached: false` is a blocking finding, emitted by the renderer, and neither judge is asked to guess at it.

### 5 and 6 · The two judges

Both run on the same draft, in parallel, neither seeing the other's findings. Details below.

### 7 · Deliver

Everything comes through here, including the halts — there is one way out of the run, and it always writes a verdict.

On budget exhaustion, Deliver hands over the pass with the fewest blocking findings, ties to the earliest, and names which pass it is.

Deliver always prints, beside the verdict: the requirements that went unjudged, the check families that were not implemented, and anything in `degraded`. It phrases the result as *"no blocking findings across N of M requirements"* whenever any went unjudged. Never a bare "clean". Advisory findings ride along as a list.

---

## The two judges

They are separate because they answer different questions and would corrupt each other if merged. A judge holding the style rules starts explaining away a missing error state as restraint.

| | Design judge | Product judge |
|---|---|---|
| question | does it look right? | does it solve the brief? |
| sees | the pictures · the rubric rows that load for this run · the exact anchors retrieve used | the brief · the ratified checklist · `content.md` · every state · the code |
| never sees | the brief, the checklist, the code, the build reasoning | the build reasoning, the style rules |
| method | known-failure match · pairwise against the anchor · rubric | walks the `active` requirements one by one |
| output | located findings + `anchor_comparison` | one verdict per requirement id |

Isolating the design judge from its *own rubric* was never the point and never possible — the meaningful isolation is from the brief and from the build reasoning.

**Severity, on every finding: `blocking` or `advisory`.** Two levels, no more. One worked example of each goes in the judge prompt — blocking: *"footer has three filled buttons, violates one emphatic action per surface"*; advisory: *"the caption could sit closer to the card"*. A finding returned with no severity is re-asked once, then treated as advisory.

Every finding carries a **locator** — the selector or the visible label of the thing it is about. A finding with no locator is not actionable and is re-asked once, then dropped to advisory. Adjudicate needs locators to tell two findings about the same element apart from two findings about different ones.

**The anchor comparison** is `{anchor, verdict: "worse"|"comparable"|"better", located_reason}`. It is always advisory: it is a judgment about direction, and direction is yours. A `worse` verdict is printed prominently at Deliver and routed to harvest — never to correct, which would be asking the loop to fix taste.

**The product judge's vocabulary,** per requirement: `met` · `partly` · `missed`. Plus one class carrying no requirement id — `unlisted-brief-obligation`, quoting the brief line. Reachability is not in this list; the renderer decided it. `partly` is advisory unless the judge marks it blocking and names the specific thing missing.

An `unlisted-brief-obligation` **halts the run** with `verdict: "checklist-bug"`. It means the ratified checklist was incomplete, so continuing would be correcting against a list you have already been told is wrong. You either add the requirement or rule it out of scope; the ruling lands in `human_rulings` and the next run starts from a checklist you have re-ratified.

A finding must be an edit instruction. *"6/10, make it feel more on-brand"* is useless. *"Footer has three filled buttons, violates one emphatic action per surface, keep Export navy-filled and outline the rest"* is a finding.

**Independence is a prompt instruction, not a sandbox.** The judges get fresh context, but the code the product judge reads carries comments, class names and copy that leak intent. Worth knowing what the guarantee actually is.

---

## Loops and budgets

### What counts as clean

**Clean = zero blocking findings of any kind — lint, renderer, design, or product.**

Advisory findings never enter correct and never delay delivery: a clean pass terminates the loop immediately with them outstanding. `not-checkable` requirements are scored by neither judge and never gate delivery.

### The join

After both judges return, one adjudicate step owns what two gates side by side left ambiguous:

1. **Merges** — blocks until both finding sets are in, then adds the lint's and the renderer's.
2. **Applies the clean test**, and routes to exactly one of deliver, correct, or halt.
3. **Detects conflict** — two blocking findings whose instructions cannot both be applied to the same locator, whether both arrived this pass or one would undo a correction made for the other last pass. The test is **opposition, never recurrence**: the same finding reappearing after a correction means the edit helped without clearing it, and it routes to correct again while the budget allows. On conflict the pass ends, `verdict: "conflict-stop"`, both findings quoted verbatim.
4. **Owns the pass counter, and writes the ledger** — one line per finding to `lint/findings.jsonl`, deduplicated within the run so a finding surviving two passes is one incident, not two.

**Two verify passes.** The initial verify is pass 1; one correction follows. Four judge calls per artifact, maximum. Source-lint cycles are counted separately and do not consume it.

Two passes rather than three because the third almost never converged on anything the second hadn't — and because every mechanism that existed only to stop a runaway third pass could then be deleted. An earlier draft of this design had adjudicate falsifying findings against the DOM and downgrading findings on untouched regions; between them they made the later passes nearly unable to correct anything. Both are gone. A finding that names a mechanically checkable value is instead *logged* as a promotion candidate — evidence for harvest that the rule belongs in the lint, where it can be checked for free rather than argued about.

Each pass is kept as `draft-pass<N>.html`, so the best pass can be delivered rather than merely the last.

### Correcting

Targeted edits, never a regenerate, so nothing that was already right gets gambled away. Then the *whole* surface re-verifies, because fixing A breaks B constantly.

Cost: two judges times two passes, every artifact. The promotion ladder relieves the design side by moving rules into the lint. The product side has a slower ladder — a miss we keep making becomes a checklist default — but requirements are per-brief, so the product judge never gets script-cheap.

### crazy8s

All eight variants get the **source** checks; token discipline is never optional, and crazy8s emits one file per variant. The rendered checks and the judges run only on the pick — eight renders and sixteen judge calls to choose a direction is the most expensive thing this system could do, for seven artifacts about to be discarded.

A supplied artifact — a crazy8s pick — still runs step 0 and the gate, so a checklist is written and ratified for it. Step 2 becomes a content-and-contract pass only: the pick is brought onto `template.html`, its states are wired, and its invented numbers are resolved against `content.md` or raised as a content gap. That is not a regenerate — the design is untouched — and without it the pick would fail the source checks on its first breath.

**On a pick, your choice of direction outranks the judges.** The design judge is restricted to execution findings — tokens, spacing, contrast, missing states, anti-pattern rows. Any direction finding is advisory, recorded in `overrides`, and routed to harvest.

---

## Harvest routes

The session's closing phase. Every learning goes to exactly one home, you confirm each write, and every write prunes.

### The closing question

**Harvest opens with one question, always, before any other route: *is this the reference for `<surface>` / `<register>`?***

A yes appends a row to `exemplars.json` and the file becomes the most recent anchor for that pair — displacing whatever was third. A no is equally useful and costs one line: harvest moves on.

It is asked as its own step rather than as one row in the table below because it is the only route that decides what the *next* build looks like. Every other route writes a rule; this one writes the thing rules cannot express — how a whole surface is composed.

**Approval is file-level; annotations are element-level, and the two are independent.** A file may carry open advisory findings and still be the best reference we have for its surface. Only an open *blocking* finding bars tagging, per the rule further down.

**It fires at the end of any prototype session, not only a harness run** — a hand-build, a crazy8s pick, an ad-hoc pass over an existing file. A file that never entered the harness is exactly the file nobody thought to tag, and an index with one row per surface cannot answer a retrieval query.

### The other routes

| What happened | Where it goes |
|---|---|
| a defect got through with **no blocking findings** | first the check that would have caught it — a lint rule, a rubric row, or a template default — then the anti-pattern row |
| artifact you approved | handled by the closing question above — never re-asked here |
| rejection, with your stated why | one row in the anti-pattern table (❌ don't / ✅ do / why) with an `example:` path to the rejected file — never a copy |
| style finding that looks familiar | a written rule in the visual-language skill |
| rule that turns out mechanically checkable | the lint script |
| a product miss we keep making | a default in `requirements-template.md` |
| a real string or number that turned out wrong | `content.md`, with a fresh `as_of` |
| a brief that didn't fit the surface list | a proposed row in *Quick reference*; when a surface is added, re-tag the exemplars filed under the old nearest-neighbour label |
| snippet you keep rebuilding | a component, proposed as a PR to its owner |
| rule you overrode, or that misfired | amend it, delete it, or **scope** it with `applies_to` |

**The brief itself was wrong** is not a write. It goes back to the author, and the harness records it in `run.json`.

A new anti-pattern row harvested from a single rejection is **born scoped** to that run's surface, and only becomes global when it fires again somewhere else. One bad footer should not become a rule that blocks every screen in the product.

When the verdict was `clean` and you reject anyway, harvest opens with *"nothing blocked this — which check should have caught it?"* before offering any other route. That is the highest-value event in the whole system.

### The counter, and the prune

Adjudicate appends every finding to `lint/findings.jsonl`: `{date, run_id, brief_slug, surface, register, source, rule, requirement_id, severity, locator, outcome}` — where `source` is lint, renderer, design or product, and `outcome` records whether it was corrected, overridden or delivered open.

Harvest then opens with computed evidence instead of a memory test: *"`one-emphatic-action` has fired 6 times across 4 builds and 3 surfaces — promote to a rule? to a lint check?"* You stay the decider and stop being the storage.

The inverse needs care. A rule with zero hits is *not* automatically dead — a rule nobody violates any more is a rule that worked. So the prune query offers two lists and asks which it is: rules with no hits **and** no anti-pattern row citing them (probably dead), and rules with no hits but a live row (probably absorbed). You say which.

Every anti-pattern row, `exemplars.json` entry and `content.md` entry carries `as_of` and `still_valid`. A correction **supersedes** by flipping `still_valid` to false rather than deleting — matching the vault's `_meta/` convention — and the judge and the lint load only `still_valid: true` items. Step 0 warns in one line when `content.md`'s `as_of` is older than thirty days.

Only an artifact whose run ended `clean` may be tagged as an exemplar. One you picked with open blocking findings ships and is logged as *shipped with known exceptions* — harvest says *"tagging blocked, 1 open blocking finding; clear it in a follow-up run if you want this as an anchor."* When a surface has no human anchor left in its top three, harvest asks whether one is worth hand-building.

If the session surfaced nothing worth keeping, harvest says so in one line and stops. Capture, not ceremony — and that applies to the sweep too.

### The sweep

The corpus-wide sweep is triggered, not remembered: it runs inside harvest on the first build after `design-system/` changed, and monthly otherwise. Both conditions are decidable because `lint/last-sweep.json` records when the last one ran and against which `design-system/` commit.

It lists every rule, tag and anti-pattern row whose `as_of` predates the change and walks them with you. Only the token re-sync leaves as a PR to the design-system owner.

---

## What this deliberately does not do

- **No `pai-harvest` skill.** One caller — the end of a build session — so it is a phase, not a skill with an invocation seam.
- **No `pai-drift` skill.** The sweep is a triggered phase of harvest, not a thing you remember to run.
- **No copies of anything.** Exemplars are rows pointing at files; anti-patterns point at the rejected file where it sits.
- **No requirements invented from an investigation.** An investigation is a finding, not a brief. Someone turns it into a spec by hand first.
- **No mid-run resume.** Every halt ends the run; you fix the one named thing and start the next one. Resumption logic is a class of bug this design would rather not own.
- **No full accessibility sweep in v1** — three checks, not axe-core, which on prototypes fires on landmarks and document structure and would drown the findings list.
- **No hover, focus or active screenshots, no dark theme, no third viewport in v1.**
- **No lint on Tailwind arbitrary values in v1.** `pai.tailwind.js` is an asset but not a lint subject, so `w-[437px]` slips past token discipline. Known hole; it needs the utility layer expressed in terms of the tokens before a check is worth writing.
- **No pre-commit hook** enforcing the entry point. It is the only mechanism that would actually enforce it, but it fights the crazy8s and hand-build workflows already in the repo. It is the escalation if the `CLAUDE.md` instruction turns out not to hold.

---

## Open questions

- **Does the gate survive contact with impatience?** It is the cheapest safeguard in the system and the easiest one to start skipping — and it just got honestly repriced from thirty seconds to a couple of minutes, which makes skipping it more tempting, not less.
- **Is `origin: "human"` a strong enough floor?** One human anchor per surface keeps the corpus from feeding purely on itself, but nothing stops that anchor ageing into the wrong answer while every generated exemplar agrees with it.
- **Will the lint ever be finished enough to carry its half of the ladder?** The whole compounding story assumes rules migrate into `pai-lint.py`. If the rendered checks never get written, the design judge keeps re-litigating the same things forever and the system gets slower with age instead of faster.

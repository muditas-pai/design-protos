---
title: Canon harness
created: 2026-07-28
updated: 2026-07-28
status: draft
---

> [[#What this is]] · [[#Where the three kinds of work already live]] · [[#The canon]] · [[#What changes]] · [[#The closing question]] · [[#Divergent work]] · [[#Annotation]] · [[#Keeping it honest]] · [[#Day 1]] · [[#What this deliberately does not do]] · [[#Open questions]]

A variant of [[design-harness]] that adds **one canonical prototype** as the primary source of anchors. Read that spec first — this one states only what differs. Where this document is silent, the design harness governs.

The skill is `pai-canon`.

---

## What this is

The design harness has a corpus problem. `exemplars.json` holds three rows, retrieval asks for up to three anchors on exact surface + register, and the query comes back with fewer than two hits. Everything downstream — few-shot generation, the design judge's pairwise comparison — degrades to an unanchored run. No amount of judging fixes an empty corpus.

The fix is to stop hoping enough scattered files get tagged. **One runnable prototype of the product holds the reference version of every surface we would stake a claim on**, so retrieval always resolves.

**What a canon buys that a pile of files cannot.** Every standalone file shows one surface in isolation. Only a canon shows what the sidebar does *while* the modal is open, whether the pricing page and the upgrade modal use the same plan marks, whether the empty and populated states of one screen share a spine. Most of what "off-brand" actually means is inconsistency *between* surfaces, and that is invisible in a folder of separate files.

**What it costs.** A canon is only as good as its worst surface. A folder can have gaps; a canon makes the gap authoritative — a mediocre settings page anchors mediocre settings pages forever. So it covers **fewer surfaces, well**, and an uncovered surface is an honest absence rather than a weak entry.

---

## Where the three kinds of work already live

Three kinds of work need three homes, and the important thing about this design is that **two of the three already exist in the parent spec.** The canon harness adds one new store, not three.

| Kind of work | Home | Status |
|---|---|---|
| the reference version of a surface — what we would build again | **the canon**, one runnable app | new, and the only new thing here |
| good work not committed to the canon — divergent variants, ideas for surfaces the canon lacks, outside references | **the bank** = `exemplars.json`, unchanged | already exists |
| rejections — what not to do, and why | **the don'ts** = the anti-pattern table in `pai-visual-language/`, unchanged | already exists |

**The bank is `exemplars.json` under a friendlier name.** It already does everything the job needs: one row per entry pointing at a file that already exists, `surface`, `register`, `origin: human｜generated`, `as_of`, `still_valid`, retrieval by surface + register with widening, and a prune query. Inventing a parallel store would have duplicated all of it and created a second thing to keep in sync — the exact disease this system exists to cure.

**The don'ts are the anti-pattern table.** Already the design judge's rubric, already reaching generation as negative examples, already pointing at the offending file rather than copying it, already born scoped to one surface and going global only on a second hit.

So problems 1 and 2 — *good ideas outside the proto still need a bank*, and *don'ts can't live in the proto* — are answered by the parent spec as written. Nothing new is required. What is required is saying so, because the tempting mistake is to build the canon and quietly let the other two rot.

The genuinely new mechanism is **problem 3**, below: getting divergent work into the bank *with its annotations*.

---

## The canon

One app. Five surfaces to start, chosen because we would stake a claim on them. State comes from one JSON per scenario — plan, credits, content volume, route, what is open — and it is deterministic: no clock, no unseeded randomness, because the renderer screenshots it at fixed viewports.

### Addressing

An annotation, a don't and a finding all locate the same way: a **source**, a **ref**, and optionally a **commit**.

| field | canon | bank |
|---|---|---|
| `source` | a route — `/app/dashboard/empty` | a repo-relative file path |
| `ref` | the element's `data-ref` | the element's `data-ref` |
| `commit` | a canon SHA, when the record is about a past state | unused |

Three plain fields, not an encoded string — nothing needs to parse one, and a grammar would only invite a route containing the delimiter.

`commit` is what makes the strongest kind of don't expressible: *"the canon looked like this until March, here is the SHA, here is why we moved."* It is **documentary, not re-rendered** — the harness never checks a historical ref still resolves, and a don't pinned to a commit is read by humans and by the judge as prose.

### `data-ref`, assigned lazily

Generated CSS paths break silently when the canon is edited. Measured, on the real toolbar:

| what changed around an annotated element | how far the marker landed from it |
|---|---|
| moved to a different parent | 235 px |
| wrapped in a new div | 69 px |
| classes renamed | 94 px |

No warning, no error, no missing marker — the pin renders confidently in the wrong place, which is worse than vanishing. With a `data-ref` anchor and re-anchoring at load, the same three cases land within 0.4 px.

**Refs are assigned when someone annotates, not in advance.** Blanket-tagging every meaningful element before anyone has commented on anything is a discipline tax paid forever, on a Friday, to serve a script — and it is the kind of rule that quietly stops being followed. Instead: on annotation, the glue walks up for the nearest `[data-ref]`; if there is none it generates one from the element's role and position and **writes it back into the canon source**. The ref exists because someone cared about that element, which is the correct trigger.

This needs a small dev-time writer to edit the source file. That is real work and it is named here rather than assumed.

---

## What changes

### Retrieve

Three sources instead of one, and the first is guaranteed.

1. **The canon route** for this surface. Always included. If the canon does not cover the surface, `canon_gap` is recorded and printed at Deliver — the strongest signal for what the canon should absorb next.
2. **Up to two bank entries**, by the parent's rules exactly: same surface + register, `still_valid`, most recently approved first, widening as the parent widens.
3. **The don'ts for this surface**, as negative examples, exactly as the parent already does.

**The parent's `origin: "human"` floor is retained and now does double duty** — it keeps the corpus from feeding on its own output, and it keeps the canon from becoming the only voice. A canon that anchors every build alone produces convergence, including on its mistakes.

A bank anchor may disagree with the canon. That is allowed to reach generation; the disagreement is resolved at harvest, not by suppressing the anchor mid-run.

### Generate

The output is one of two things, **decided at the gate**, not after:

- **a canon route** — a new or changed surface, built against the app's own shell and state file. It cannot invent a sidebar, a plan badge, or a grey box behind its surface.
- **a bank file** — a standalone artifact, for divergent work or a surface outside the canon. The parent's artifact contract applies exactly as written.

### The judges

The design judge's **pairwise comparison becomes meaningful for the first time.** Today it compares a standalone file against a standalone anchor — different chrome, different content, different framing. On a canon route it compares the same surface in the same app, so `worse｜comparable｜better` is a judgment about the change rather than about the packaging.

On a canon-route build the judge gains one instruction, not a new finding class: **a surface that contradicts a decision made elsewhere in the canon is an ordinary blocking finding**, whose edit instruction names the contradicted address. The parent holds the line at two severities and one finding format; nothing here earns an exception.

The product judge is unchanged.

---

## The closing question

Harvest's closing question becomes three-way:

> **canon · bank · don't · nothing**

| answer | what happens |
|---|---|
| **canon** | merged into the app; it is now the reference for that surface. If the run originated from a bank entry, that entry is flipped `still_valid: false` with a note naming the canon route that superseded it — never left as a second live answer |
| **bank** | a row in `exemplars.json` pointing at the file where it sits |
| **don't** | a row in the anti-pattern table, with its address and its why |
| **nothing** | most runs. One line, and harvest moves on |

**The answer is written to `run.json` as `disposition`.** The parent's schema gains two fields and nothing else:

```
disposition: "canon" | "bank" | "dont" | "nothing" | null,
canon_gap:   true | false
```

Two rules carry over from the parent without change. **Only a run that ended `clean` may be dispositioned `canon`** — one that shipped with open blocking findings is logged as *shipped with known exceptions* and may go to the bank, never the canon, because a known-broken surface gets copied into the next five screens. And **a crazy8s pick is not exempt.** Its direction outranks the judges, as the parent says, but it reaches the canon only through a canon-route build that ran the ordinary way. A pick brought onto `template.html` is a bank artifact; making it canon is a subsequent run, not a promotion.

---

## Divergent work

This is problem 3, and the only mechanism here the parent does not already provide.

crazy8s produces eight variants to find one direction. Seven are discarded, and several are usually worth keeping — not as the answer, but as *an* answer, for the next time the same problem comes round. Today they die with the session.

**Harvest walks the discards, once, at the end of the session that produced them.** Each is shown; for each you say *bank* or *nothing*. There is no third option and no deferral.

Two details make this work rather than become a chore:

- **You annotate the discard at the moment you bank it**, in the same pass. A discard has never been judged and carries no annotations, so without this the bank fills with files nobody can retrieve from — `explorations/` all over again. One sentence about why it is worth keeping is the price of entry, and it is also the thing a future retrieval actually matches on.
- **The walk is skippable in one line, per session, not per variant.** *"Nothing worth keeping"* ends it. A per-variant prompt eight times is how a good rule gets switched off.

Divergent work destined for the bank never needs the canon's machinery: a bank file is a static standalone artifact, so it keeps the parent's per-file annotation mechanism unchanged. Route bleed, re-anchoring and `data-ref` discipline are canon concerns only.

---

## Annotation

The canon is annotated in the browser with the same toolbar already in **103 of the repo's 227 HTML files**. Three things break when many static files become one routed, living app. All three are measured against the real toolbar, and all three are fixed by `agentation-glue.js` (≈500 lines, ours to maintain — the spike and its test suite are in `harness/agentation-glue/`).

**Route bleed.** The toolbar reads `location.pathname` fresh on every render but loads annotations once at mount, so a `pushState` navigation writes the stale in-memory array under the new key. Observed: annotate `/a`, navigate to `/b`, annotate — `/b` holds both. Fix: tear down and recreate the React root on every navigation, serialised so teardown completes first.

**Silent misplacement.** Markers are positioned from `x` (a percentage of viewport width) and `y` (document pixels), captured from the *click point*. `boundingBox` does not drive the marker at all, and nothing in the toolbar ever re-queries the DOM. Fix: before mount, re-anchor every stored annotation by its `ref` and rewrite its coordinates. **Mount-time only** — a mutation after mount stays stale until the next navigation.

**Lost anchors.** A `ref` that no longer resolves is flagged `orphaned`, held out of the marker array so it is not drawn somewhere wrong, and surfaced as a count. It is not auto-resurrected; someone re-annotates.

### Where annotations live

```
designer annotates          → localStorage    private working copy, instant
      │
   send                     → a small local writer
      │
      ▼
annotations/<source>.json   ← in the repo, versioned with the canon
      │
   committed alongside the design it describes
      │
      ▼
   harvest reads them as files — there is no collection step
```

Annotations become **repo artifacts**: everyone sees everyone's on checkout, the comment and the design move together through git history, and harvest reads files instead of asking people to remember. The toolbar's own lifecycle fields — `status: pending｜resolved｜dismissed`, `resolvedBy` — carry the rest.

Coverage becomes a query. *"Which canon surfaces have zero annotations?"* has an answer, and the answer says where nobody has looked.

---

## Keeping it honest

Most of the guards an earlier draft of this document invented turned out to be process for risks that either do not exist or are visible without instrumentation. Two survive.

**The canon and the bank must never hold two live answers to the same question.** When a run is dispositioned `canon`, any bank entry it supersedes is flipped `still_valid: false` in the same breath — promoted or retired, never left coexisting. This is the one rule that cannot be deferred, because the parent's retrieval reads `still_valid` and would otherwise hand the builder both answers.

**Is the canon what we ship, or what we want to ship?** It is the second. It leads production rather than mirroring it, which is why drift from production is not a defect here — but only because that is written down. Left unstated it gets used as both, and then neither is trustworthy.

Two risks are real and deliberately carry no process. A canon nothing lands in goes stale — but at this size that is visible in the commit log, and a computed staleness metric is ceremony. And the bank could decay into an untagged pile — but annotation-as-price-of-entry plus the parent's prune query already covers it.

---

## Day 1

- **The canon, five surfaces, well.** Start from `key-screens/` — dashboard, editor and pricing already exist. Do not carry `editor.html` (2873 lines) or `pricing.html` (4064 lines) across as-is; take the surface, leave the accumulated one-offs.
- **The state file** — one JSON per scenario, deterministic.
- **`agentation-glue.js`** wired into the canon's router, plus the small writer that assigns a `data-ref` on first annotation.

Nothing else is new. `content.md`, `requirements-template.md`, `exemplars.json`, the anti-pattern table and the lint are the parent's day-1 assets, unchanged and still required.

**Do not migrate the 227 files.** They stay where they are. The bank admits them one at a time, when a run makes one worth admitting.

### When to stop

The investment is the canon and only the canon; everything else here already exists. So the kill criterion is narrow and worth stating before starting:

**After ten runs, if none has been dispositioned `canon`, stop.** It means the work in front of us is one-off surfaces that a tagged file anchors just as well, and the canon is overhead. `bank` is the comfortable answer — it keeps the work without committing to it — so this is the number that will actually tell you.

---

## What this deliberately does not do

- **No new stores.** The bank is `exemplars.json`; the don'ts are the anti-pattern table. One new thing, not three.
- **No copies.** Inherited unchanged. The canon is not a copy of anything — it is an original the product may later follow.
- **No mirroring of production.** The canon leads. Not generated from the app, not diffed against it, not kept in sync.
- **No migration of `explorations/`.**
- **No live re-anchoring.** Mount-time only.
- **No blanket `data-ref` tagging.** Assigned on first annotation.
- **No new finding class, no third severity.**
- **No fifth answer to the closing question.** A "maybe" is a request for someone to decide later, and nobody does.

---

## Open questions

- **Does the disposition get answered honestly?** `bank` keeps the work without committing to it, which makes it the path of least resistance. If ten runs produce no `canon`, the kill criterion fires — but the more likely failure is nine `bank`s and one grudging `canon`, which passes the test while meaning the same thing.
- **Five surfaces, or eleven?** Narrow keeps quality high and leaves `canon_gap` firing constantly. Wide covers retrieval but guarantees weak entries. Start at five and let the `canon_gap` counts choose the sixth.
- **Who owns coherence?** Merging one surface is cheap — that is not in dispute. The recurring cost is *checking it against the other four every time*, which is a different job from merging, is the entire value proposition, and is the thing that quietly stops happening. It needs a name against it, not a process.
- **Does lazy `data-ref` assignment actually hold?** It removes the upfront tax, but it means the canon's source is edited by a tool during a design session. If that writer is flaky or produces churn in git, people will turn it off and the address scheme goes with it.

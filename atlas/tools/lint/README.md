# The linter

Phase-1, source-only. No browser, no server, no network. Standard library only.

Spec: [`docs/lint-spec.md`](../../docs/lint-spec.md). This README is how to run it and
how to change it; the spec is why it behaves the way it does.

```
tools/lint/
  pai-lint.py        the CLI and the output   (spec §7, §8, §10)
  rules.py           the checks               (spec §4)
  dsparse.py         reads design-system/     (spec §2, §3, §6)
  cascade.py         resolves a text element's computed colours  (spec §5)
  rollup.py          the roll-up              (spec §9)
  check_fixtures.py  asserts what the fixtures say the linter finds
  fixtures/          clean.html · violations.html · contrast.html
```

**The linter contains no design knowledge.** There is no list of colours, class
names, radii, token names or design-system property names anywhere in it.
Everything it knows it reads out of `design-system/` at runtime. When radius
tokens land, `border-radius` flips from proposal to error with no code change.
A patch that adds such a list is a patch that breaks the tool.

---

## Run it

```sh
uv run --python 3.12 python tools/lint/pai-lint.py <artifact.html>
```

```
usage: pai-lint.py artifact
                   [--design-system DIR] [--json OUT] [--blocking]
                   [--screen PATH] [--run-id ID]
```

| flag | default | what it does |
|---|---|---|
| `--design-system DIR` | `<repo>/design-system` | where `pai.css` and `pai.tailwind.js` live |
| `--json OUT` | — | write `lint.json` here; without it the JSON goes to stdout |
| `--blocking` | off | exit 1 when errors exist. Off by default: **errors are advisory in phase 1** (§8) |
| `--screen PATH` | derived | the problem folder the roll-up groups by |
| `--run-id ID` | derived | the run's id |

Exit status is **0** unless all three hold: `--blocking` was passed, errors
exist, and the artifact actually loaded the design system. A file that never
opted in never blocks (§6).

```sh
# in the pipeline: generate ──► SOURCE LINT ──► render ──► …
uv run --python 3.12 python tools/lint/pai-lint.py runs/2026-07-31-01/artifact.html \
    --json runs/2026-07-31-01/lint.json --blocking || route_to_correct
```

### `screen`, and why it is the one field worth checking by hand

`screen` is the **problem folder** — not the run, not the state. The roll-up
counts *distinct screens* that reached for the same value, and two screens is
the threshold that turns an observation into a design-system PR candidate (§9).
Get `screen` wrong and that threshold is unimplementable.

It is derived from the path:

```
designs/feature-gate-pricing-modal/runs/2026-07-31-01/artifact.html
└────────────── screen ───────────┘      └─ run_id ─┘
```

A `runs/` segment anywhere on the path means everything above it is the screen,
so one run over seven states rolls up as one screen. Linting a file in place,
the screen is the folder holding it — which is right when a folder is one
screen and **wrong** when a folder holds many. `designs/<feature>/` is one
feature per folder precisely so this stays right; pass `--screen` for anything
laid out otherwise.

`state` is always `null` in phase 1, by §7. It carries a name only for phase-2
findings.

---

## The three buckets

Same shape in all three. Every entry carries every field in `FIELDS`; a field
that does not apply is `null` or `[]`, never missing, so a consumer can read
`entry["value"]` without first asking which bucket it came from.

| bucket | the design system | verdict | blocks? |
|---|---|---|---|
| **error** | has it | the author departed from something that exists | yes, once §8 switches enforcement on |
| **proposal** | is silent | inventing is allowed, and logged for the roll-up | never |
| **extension** | speaks, but has no member for a legitimate need | not the author's fault | never |

**The one rule that decides the split**: the linter may only call something an
error **if it can name what should have been written instead**. That is not a
convention — `Finding.__post_init__` in `rules.py` raises unless
`bucket == "error"` ⟺ `design_system_offers` is non-empty.

Everything follows from it with nothing special-cased:

```
written                  published            replacement?      verdict
#0057f0                  #0055ED              yes, ΔE 3.6   ──► error
ui-monospace, …          3 sans stacks        no            ──► extension
animation: spin 2s …     2 unrelated anims    no            ──► extension
box-shadow: 0 2px 8px …  51 shadows           no*           ──► extension
border-radius: 7px       nothing at all       no vocabulary ──► proposal
```

\* colours, lengths and weights have a nearest member. Font stacks, animations,
gradients, shadows and easings have no ordering — there is no such thing as a
near-miss between two shadows — so they can never block on their own.

`origin` separates `"adopted"` (`p-4`, one decision to take Tailwind's default
scale) from `"invented"` (`p-[18px]`, a genuine one-off). Both are proposals;
only the second is a real invention, and without the distinction the roll-up
drowns in four hundred spacing steps.

Findings are **deduped by (property, value)** inside their bucket, with an
`occurrences` count, and `where` points at the first one. `summary` counts
deduped findings, not instances — one bad CSS rule reads as a catastrophe
otherwise (2,260 raw hits were 31 distinct defects).

### `not_checked` is mandatory

A thin linter must never read as a clean bill of health, and phase 1 is thin.
Every report names the phase-2 checks, the lint-stage checks this linter does
not implement, and the properties nothing was written for. The silent-property
list is **derived** — properties `pai.css` declares a typed value for but
publishes no vocabulary for — so it shrinks on its own as tokens land. So is the
contrast half: every text element the cascade could not resolve is counted there
with its reason, so a report that checked forty pairs and gave up on three says
so.

---

## Contrast

Spec §5. The one check that resolves a **computed** value rather than reading what was
written — because the bug that prompted it lives entirely in the design system:

```
.button-gold-shimmer  color: var(--text-white)      ─┐
                      background: linear-gradient(…) ─┴─►  2.02:1
.button-large         font-size: 14px; font-weight: 500     AA wants 4.5
```

The screen wrote `class="button-gold-shimmer"` and nothing else. `cascade.py` runs a small
cascade over `design-system/*.css`, the artifact's `<style>` and `style=`, and the Tailwind
utilities it uses, ordered by specificity then document order — the Tailwind CDN's injected
`<style>` last, which is where a `text-*` utility's win over a component class comes from.

| | |
|---|---|
| **checked** | text against the background it sits on, following inheritance, `var()`, alpha compositing and gradient stops (worst stop wins) |
| **thresholds** | 4.5:1, or 3:1 for large text — 24px, or 18.66px at weight ≥700. Size and weight come from the same cascade, so the type ramp is read, not assumed |
| **exempt** | disabled controls (SC 1.4.3), `display:none` / `hidden` / `aria-hidden` / `sr-only`, and `:hover` and friends, which are not the resting appearance |
| **not checked** | borders, focus rings and control fills — SC 1.4.11's 3:1 applies to whichever edge is the visual boundary, and a stylesheet does not say which. Named in `not_checked` on every report |
| **bucket** | always `proposal`. §1 forbids an error the linter cannot name a replacement for, and for a failing pair there is none |
| **`origin`** | `published` — both ends from `design-system/`, so it is a finding about the design system. `authored` — the screen wrote an end, or chose the pairing |

### The rule the check hangs on

**A pair that cannot be resolved is recorded with its reason, never passed.** A background
image, an `opacity` above it, a `::before` overlay, a full-bleed positioned sibling, a
dangling `var()`, a selector outside the reader's grammar, a `clamp()` size with a ratio
between the two thresholds — each one lands in `not_checked` with a count. A checker that
quietly skips what it cannot work out is how a 2.02:1 buy button shipped clean.

The reader's selector grammar covers tags, classes, ids, attribute selectors, `>` `+` `~`,
`:not()`, `:has()` and the structural pseudo-classes. Beyond that it admits ignorance — and
the admission is scoped to the selector's **subject**, so one `:has()` in `pai.css` does not
taint every line of text on the page. Widening the grammar is the cheapest way to shrink
`not_checked`; guessing is not.

---

## What is still phase 2

Phase 2 is the rendered layer: a browser, the real composited page. It is **specified but not
built**.

* **contrast for the pairs source cannot resolve** — see above. The resolvable ones are done.
* **tokens dead by scope or type** rather than by name. `background: var(--missing)` goes
  transparent and is obvious; `color: var(--missing)` **inherits the parent's colour**,
  renders as something plausible, and nobody notices. That finding is why phase 2 exists.
* **whether a declaration actually won** the cascade. `cascade.py` models specificity and
  document order, which is most of it, but not `@layer`, not `@media` (declarations behind an
  at-rule are admitted, not applied), and not anything a script writes at run time.
* **laid-out geometry.**

## Adding a rule

Rules live in `rules.py`. `pai-lint.py` is the run, not the rules — it deduped,
named the screen and wrote the JSON, and it should stay that thin.

1. **Do not decide the bucket yourself.** Extract the property and the value the
   author wrote and hand them to `_evaluate(ds, prop, value, ctx)`. It returns
   `(bucket, rule, offers)` or `None`. That is the single decision point, and
   going around it is how a rule ends up blocking on something it cannot fix.

2. **Pick the medium.** `ctx` answers "what would the author have written
   instead, *here*?" — `_CssCtx` offers `var(--tok)`, `_ClassCtx` offers
   `prefix-member`. This is not decoration: the type ramp has no `--var`, so
   `font-size: 0.875rem` must pass clean in CSS while `text-[18px]` must error
   with `text-heading-lg`, because there the name is reachable. A new medium
   (an inline SVG attribute, say) is a new `_Ctx` subclass.

3. **Ask `dsparse`, never a literal.** `ds.vocabulary_for(prop, value)`,
   `ds.is_silent(prop)`, `ds.token_value(name)`, `vocab.entries`. If you find
   yourself typing a hex code, a class name or a design-system property name
   into `rules.py`, the design is wrong, not the rule.

4. **Register it** in `check()` and give it a `rule` name that reads as a
   sentence in a report. `silent:<prop>` and `incomplete:<prop>` are generated
   from the property, so they cost nothing to keep correct.

5. **Plant it in `fixtures/violations.html`** with a comment naming the rule and
   the expected bucket, and keep `fixtures/clean.html` clean. A false positive is
   the worse failure: a linter whose first act is to condemn the design system
   teaches everyone to ignore it.

   **Unless the defect deletes rules** — an unclosed comment, an unbalanced
   brace. Those go in `fixtures/malformed.html`, each in its own `<style>` block,
   because planting one in `violations.html` removes every plant after it and the
   suite falls silent instead of failing.

6. **Run `check_fixtures.py`, then break your rule on purpose and run it again.**
   If the suite still passes, the suite is the problem.

```sh
uv run --python 3.12 python tools/lint/check_fixtures.py          # the test suite
uv run --python 3.12 python tools/lint/pai-lint.py <artifact>     # one file, full report
uv run --python 3.12 python tools/lint/rules.py <files…>          # rule-level counts
uv run --python 3.12 python tools/lint/dsparse.py                 # what the system publishes today
```

`dsparse.py` run bare prints the derived inventory. If a rule is behaving oddly,
read that first — nine times in ten the vocabulary is not what you assumed.

---

## The fixtures

`check_fixtures.py` asserts four things and exits non-zero if any fails.

| fixture | assertion |
|---|---|
| `clean.html` | errors do not exceed the recorded baseline, and no **authored** contrast failure — the file is written against the design system, so one would be a false positive |
| `violations.html` | still produces findings in all three buckets |
| `contrast.html` | every `data-lint` annotation holds, element by element |
| `malformed.html` | every cause in `MALFORMED_CAUSES` is still reported, and no other fixture reports one |

`malformed.html` gets its own file for a reason worth knowing. Its defects delete rules — an
unclosed comment swallows everything after it — so planting one in `violations.html` would
take the rest of that fixture with it, and the suite would go quiet rather than fail. Each
defect sits in its own `<style>` block, because a closing `</style>` ends the element whatever
state the CSS is in.

`contrast.html` annotates each element with one of four verdicts:

```
fail        a contrast finding must be reported here (data-ratio / data-origin checked)
pass        the pair must RESOLVE and must not be reported
unresolved  the check must RECORD the give-up — not merely fail to resolve it
skip        the element must not be considered at all
```

The `pass` and `unresolved` plants carry the weight. A check that reports nothing satisfies
every `fail` plant the moment you delete it; only `pass` plants catch a rule that fires on
everything, and only `unresolved` plants catch the quiet skip.

### Mutation-tested

The suite was checked by breaking the contrast check fourteen ways and confirming each turned
it red — inverting the comparison, removing the large-text branch, taking the first or last
gradient stop instead of the worst, ignoring foreground alpha, dropping the ancestor walk,
skipping unresolvable pairs, passing anything under an overlay, calling every pair `authored`,
and treating a disabled control as ordinary text. Two of those initially slipped through and
the fixtures were fixed, not the mutations: `unresolved` plants were asserting the reader's
state rather than the check's output, and the only gradient plant had its failing stop first.
Break your rule on purpose before you trust the green.

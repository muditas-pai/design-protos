# Run 2026-07-30-01 — lint calibration

**Not a full harness run.** Step 3 only, against a frame nobody generated: the
JAS '26 dashboard (`OywpgPNGvoFAIS4haGGehy` → `101:640`), designed by hand and
treated as canonical. The question was whether a deterministic lint over a
Figma node tree says anything a person would act on.

## Result

```
pass 1   246 nodes   91 findings    ~14% signal
pass 2   166 nodes   45 findings    ~75% signal
```

The difference is one rule: **skip subtrees inside component instances.** Their
internals aren't editable in this file and their correctness belongs to the
library, so 43 nodes of Phosphor and Lucide vector guts were being reported as
the designer's fault. A check that cries wolf gets switched off.

## What it found that matters

| Rule | n | Verdict |
|---|---|---|
| `component-instances` | 15 | **real.** `Upload PPT button`, `Hire expert button`, `chip` ×4 are frames that should be library components |
| `token-bound-fills` | 11 | **6 real, 5 by-design** — see below |
| `named-layers` | 17 | real but low value. `Frame 2147230195` ×17 |
| `auto-layout` | 1 | **real.** `Main container` holds 3 children with no auto-layout |
| `token-bound-strokes` | 1 | **real.** `chip` uses a raw `#000000` stroke |

### The cross-validation worth noticing

Two of the unbound fills are `side-nav/API #f9f9f9` and `Main container
#fcfcfc`. Those are **exactly** the two values that had no design-system
equivalent when the same screen was ported to React and its tokens were aliased
onto `pai.css` by hand, days earlier and by a completely different method.

Two independent routes, same two gaps. That's the strongest evidence in this
run that the check is measuring something real.

Same for the raw `#000000` on the active tab chip, which also surfaced by hand
during that port.

### The 15 component candidates are the interesting part

Nobody asked for them. The harness's harvest table has a route — *a snippet you
keep rebuilding becomes a component PR* — and this check populates it
automatically, from the file, with no human noticing anything.

## Calibration needed

**Content-driven colour is not a token.** `prompt #95c049` and the four `Icon 1`
swatches are the Shopify brand kit: per-customer runtime values that are
*correctly* raw. The check needs an exemption, probably a layer-name convention
or a container opt-out, or it will train people to ignore it.

**`named-layers` is hygiene, not design.** Real, but it will drown the findings
list. Advisory rather than blocking.

## Architecture note

The checks ran **inside** `use_figma`, not from `lint/figma-lint.mjs`. A full
node tree of a real screen exceeds the tool's return payload, so the rules have
to execute where the data is. The `.mjs` should therefore be the *rules module*
that gets injected into the script, not a separate implementation — two copies
would drift, which is the disease this whole system exists to treat.

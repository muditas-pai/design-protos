# baby-PAI — a runnable spike

A radically simplified, runnable clone of presentations.ai, used as the place
prototypes are judged. One JSON drives the world; prototypes mount **into** it
instead of standing alone.

It exists to fix one thing: today every artifact the design harness produces is
a lone HTML file with no product around it. A credits-exhausted upgrade modal
judged as a lone file cannot be judged on what happens after you dismiss it, on
whether the surface behind it makes sense, or on whether the entry point that
opened it was reachable. This spike makes all three checkable, and it does it
without copying anything.

---

## Serve it

The design system is linked by **relative path**, so the server has to be rooted
at your home directory for that path to resolve:

```bash
cd "$(git rev-parse --show-toplevel)" && python3 -m http.server 8917 --bind 127.0.0.1
```

Then open any of:

| Scenario | URL |
|---|---|
| Power user, credits at zero, Gold modal open | `http://127.0.0.1:8917/.claude/jobs/2090741a/tmp/baby-pai/index.html?state=credits-exhausted` |
| Brand-new free user, zero decks, empty state | `http://127.0.0.1:8917/.claude/jobs/2090741a/tmp/baby-pai/index.html?state=empty` |
| Trial user 2 days out, in the editor | `http://127.0.0.1:8917/.claude/jobs/2090741a/tmp/baby-pai/index.html?state=trial-expiring` |
| **An untouched real file from PAI-design, mounted** | `http://127.0.0.1:8917/.claude/jobs/2090741a/tmp/baby-pai/index.html?state=credits-exhausted&mount=slide-limit-crazy8s&overlay=none` |
| The modal prototype, opened standalone (same bytes) | `http://127.0.0.1:8917/.claude/jobs/2090741a/tmp/baby-pai/protos/upgrade-gold.html` |
| Interaction feel — clock and transitions running | append `&freeze=0` to any of the above |

Other query params: `?place=app|editor` (override the place), `?overlay=<id>|none`,
`?mount=<registry-key-or-path>`, `?ribbon=0` (drop the debug ribbon — what the
harness renderer passes).

Re-run the verification suite:

```bash
cd $PAI_DESIGN/baby-pai && node _verify.mjs
```

---

## The files

```
baby-pai/
├── index.html          the shell. Two places (app, editor) + an overlay layer.
│                       Links ../../../../../PAI-design/design-system/pai.css.
│                       Carries the 4-line agentation toolbar.
├── shell.css           chrome. LAYOUT ONLY — zero colour literals, every colour
│                       a var() from pai.css or a color-mix() over one.
├── shell.js            the router + the mount contract. ~180 lines.
├── baby-pai.js         the world loader. ~230 lines, no dependencies.
│                       Loaded by the shell AND by any document it mounts.
├── mounts.json         THE MOUNT REGISTRY. Where a prototype is adapted to the
│                       shell, so the prototype file never has to be.
├── content.md          product truth: prices, plan names, limit copy. NOT state.
├── fixtures.json       user data: deck titles, slide titles, member names.
├── schema/
│   └── baby-pai.state.v1.json     the scenario schema
├── scenarios/
│   ├── credits-exhausted.json     power user, 0 credits, Gold modal, seats full
│   ├── empty.json                 brand-new free user, zero decks
│   └── trial-expiring.json        trial user, 2 days left, no card on file
├── surfaces/
│   ├── dashboard.html   surface 1 — Dashboard/App, mounts at place=app
│   └── deck-canvas.html surface 2 — Slide editor/App, mounts at place=editor
├── protos/
│   └── upgrade-gold.html  a standalone prototype that knows NOTHING about
│                          baby-PAI. Mounted as the overlay, unmodified.
├── _verify.mjs         38 Playwright checks (see "What was verified")
└── screenshots/        renders at 1440 and 390
```

### How the pieces fit

```
        ?state=credits-exhausted
                 │
                 ▼
        scenarios/credits-exhausted.json
                 │   $ref → fixtures.json (first N, never sampled)
                 ▼
        baby-pai.js  ── derive ──▶ remaining, pct_used, counts, ends_on
                     ── freeze ──▶ Date.now(), Math.random(), 0s transitions
                     ── paint  ──▶ body.dataset.{state,plan,credits,docs,trial,…}
                 │                 + [data-bind] / [data-repeat]
                 ▼
        shell.js  ── location.surface ──▶ mounts.json ──▶ place + file
                 │
      ┌──────────┴───────────────────────────┐
      ▼                                      ▼
   place=app                            layer=overlay
   ┌────────────┬──────────────────┐   ┌──────────────────────┐
   │ sidebar    │ topbar (credits) │   │ protos/upgrade-gold  │
   │            ├──────────────────┤   │  (transparent iframe │
   │            │ <iframe>         │   │   over the live app) │
   │            │ surfaces/        │   └──────────────────────┘
   │            │  dashboard.html  │        │ #not-now / #go-gold
   └────────────┴──────────────────┘        │ wired from mounts.json,
                        ▲                   ▼ never from the file
                        └───── PAI.set() repaints the chrome live
```

---

## The three decisions that matter

### 1. The mount is an iframe, and the adaptation lives in a registry

Every prototype in `explorations/` ships its own `<style>`, its own ids
(`#scrim`, `#dialog`, `#chat-panel`) and often its own `tailwind.config`.
Injected into the shell's DOM with `innerHTML` all three collide, and the
prototype *must* be rewritten — the one thing the contract forbids. An iframe
gives a clean cascade and a clean id namespace for free, so **the same bytes
work opened from Finder and opened through the shell**.

That leaves one problem: how does the shell know which button means "dismiss"?
Answer: `mounts.json` says so, in three lines.

```json
"upgrade-gold": {
  "src": "protos/upgrade-gold.html",
  "wire": { "dismiss": "#not-now, #x-close", "primary": "#go-gold" },
  "on_primary_patch": { "user.plan_id": "gold", "user.credits.used": 500 }
}
```

`protos/upgrade-gold.html` contains no `baby-pai.js`, no `data-bind`, no
`postMessage`, no shell classes. Because the iframe is same-origin, the shell
attaches its listeners from outside. **Adapt the registry, never the prototype.**

Prototypes that *want* the world can opt in with one script tag — both surfaces
do — and then they get `data-bind` / `data-repeat` and need no per-file JS at all.

### 2. Where the two reports disagreed, and what I picked

The shell-anatomy report wanted iframe mounting; the state-schema report's
loader assumed the artifact *is* the document (`body.dataset`, `data-bind` in
one DOM). Those are incompatible as written.

**I took the iframe, and ran the loader in both documents.** The shell loads the
scenario to paint its chrome; a mounted document loads the same scenario itself
(the shell forwards `?state=` on the iframe `src`) and paints its own
`body.dataset`. Live changes cross the boundary by `postMessage`. This keeps the
schema report's "CSS drives all visibility" property inside each document, and
keeps the anatomy report's "never rewrite a prototype" property at the boundary.

Two smaller picks:

- **The overlay is not a place.** It is a layer over `app` or `editor`, and the
  host renders live behind it. Giving a modal its own mount would reintroduce
  exactly the lone-file blindness this exists to remove.
- **Three places became two.** `app` and `editor` are built. `page` (marketing /
  pricing, no app chrome) is not — see the honest section.

### 3. "No copies of anything" — the objection, answered

The harness spec's principle is real and a replica of the product is the biggest
copy imaginable. Four things keep this honest, and one cost remains.

**The shell is a de-duplication, not a new copy.** Measured across
`explorations/`: **36 files define their own `.sidebar`,
37 define their own `.topbar`, 33 render their own credit counter** — and the
key screens render none. `pai.css` contains atoms only: no layout, no chrome.
The shell takes 36 divergent hand-typed copies to 1. Refusing to build it does
not avoid a copy; it keeps 36.

**The shell owns zero tokens and zero atoms.** `shell.css` declares no colour
literal anywhere — every colour is a `var()` from `pai.css` or a `color-mix()`
over one. Point the harness's existing "no colour literals outside `pai.css`'s
token block" check at `shell.css` and it passes today. Style drift is therefore
structurally impossible; the shell can only drift on *layout*, which is the kind
a designer catches in one glance.

**Authority is one-directional.** `key-screens/` stays canonical and stays a set
of `exemplars.json` rows. baby-PAI's `app` place is *derived from*
`dashboard.html`; if they diverge, `dashboard.html` wins and the shell is
corrected — never the reverse. Nothing here is copied into `PAI-design`, and
`PAI-design` is only ever read by relative path.

**The state file contains no product truth.** It holds `plan_id: "gold"` — never
`"Gold"`, never `"$40/mo"`. Prices, plan names and limit copy live in
`content.md` with an `owner:` and an `as_of:`. Two sources for a price is exactly
the drift the spec forbids.

**The cost I am not hiding:** the *enum values* are a copy of product truth
living in a schema — that `gold` exists, that credits are the metering unit,
that trials run 14 days. If the product ships a fourth plan, `schema/` and
`content.md` are stale until someone edits them. That is one file with a bounded
diff, not a codebase, and it wants a harvest route ("a plan/limit enum that
turned out wrong → the schema, with a fresh `as_of`"). But it is a real cost.

---

## What this buys the harness, concretely

- **`reach` stops being synthetic.** The credits chip in the topbar is a real
  entry point: click it, the modal opens. `reached: true` now means a path
  through a product, not a path through a lone file.
- **"What happens after the primary action" becomes checkable.** Clicking
  *Upgrade to Gold* patches the world — the sidebar badge flips PRO→GOLD, the
  chip refills 0→4,500, the Upgrade CTA disappears, and both PRO locks in the
  nav unlock. Verified in the browser, screenshot in `screenshots/`.
- **Dismiss reveals a live product**, not a blank page.
- **The empty case is one token.** `"decks": []` in the scenario, and
  `[data-docs="none"]` does the rest. *Empty states/App* is a taxonomy surface
  with no key screen today; here it costs nothing.
- **Interaction feel is finally reachable.** `?freeze=0` un-freezes the clock and
  the transitions for a human; the renderer passes nothing and gets determinism.
  Same artifact, two masters.
- **State facts a lone file cannot know change the design.** `seats_used ==
  seats_total` means adding a seat is *also* blocked. `card_on_file: false` is
  the whole reason the trial banner is `warning` and not `info`.

---

## What this spike does NOT do

Read this section before believing anything above.

1. **It is not wired into the harness.** No `requirements.json`, no
   `pai-lint.py`, no judges, no `states/<state>@<width>.png` output. The spec
   changes this implies — `?state=` widening to a scenario id, the renderer
   waiting on `data-baby="ready"` instead of `load`, screenshotting the shell
   instead of the file — are **described, not implemented**.
2. **Only two of the three places exist.** `page` (marketing, pricing,
   plan-comparison — no app chrome) is not built. Four of the eleven taxonomy
   surfaces have nowhere to mount: Landing hero, Landing sections, Pricing page,
   Plan-comparison table. Settings-account-integrations is not built either,
   though it needs no new place (it is an `app`/`main` payload).
3. **The credit/plan indicator is invented, not extracted.** Neither key screen
   has one; 33 explorations each hand-rolled their own. `.bp-meter` /
   `.bp-credit-chip` in `shell.css` is baby-PAI *adding* design. It should be a
   decision put to the design-system owner and a candidate PR into
   `design-system/`, not quietly owned here.
4. **The 390 collapse rule is also invented.** `dashboard.html` has no media
   query at all (its only `@media` is `prefers-reduced-motion`), so at 390 its
   260px rail would be two-thirds of the viewport. The shell hides the rail
   below 640px. Same status as #3: needs an owner's decision.
5. **`shell.css` has no colour literals, but it does have radius and spacing
   literals.** `pai.css` defines no radius or spacing tokens to consume. I did
   not invent a second token block to fix this — that would be the exact drift
   the file is trying to prevent.
6. **`content.md` here is a stand-in with illustrative numbers.** The prices in
   it and in the Gold modal have **not** been checked against production. In the
   real harness `content.md` is owned outside this folder.
7. **Freezing monkey-patches `Date.now` and `Math.random` globally.** That is
   what makes determinism structural rather than a discipline problem, but it is
   a real side effect — anything else on the page inherits it. Correct for a
   prototype harness, wrong for anything else.
8. **Freeze does not reach into an unaware mounted file.** Each document freezes
   itself when it loads `baby-pai.js`. `protos/upgrade-gold.html` deliberately
   does not, so its 260ms entrance animation still runs under the renderer. A
   real integration needs the shell to inject the freeze stylesheet into
   same-origin frames, or the renderer to wait for animations to settle.
9. **The shell is not responsive below 390 and does not do dark mode.** Light
   theme only, matching the harness's render settings.
10. **No `state.json` write-back, no persistence, no routing between scenarios.**
    `continuity.on_dismiss` / `on_primary` name sibling scenarios
    (`credits-exhausted-dismissed`, `checkout-gold`) that **do not exist as
    files**. The shell resolves those transitions as live in-page patches
    instead, which is better for judging but means the named scenarios are
    currently dead references.
11. **Only one external file is mounted as proof, and it is a crazy8s gallery.**
    It proves the mechanism (untouched, by relative path, renders in chrome) but
    it is not a product surface. `explorations/dhruv/gold-credit-exhausted/` is
    registered too, but note it carries its own sidebar and topbar — mounting it
    double-renders the chrome. **That is the finding**, not a bug: today a modal
    prototype has to ship a whole shell to be seen in context, which is the
    duplication baby-PAI removes.
12. **Agentation annotations are not persisted or read back.** The toolbar
    mounts and works exactly as in the other 103 files; nothing consumes what it
    captures.
13. **`node_modules` here is a symlink** to an npx cache so `_verify.mjs` can
    import Playwright. Not a real dependency of the spike — the spike itself has
    zero build step and zero dependencies.

---

## What was verified, and how

`node _verify.mjs` — 38 checks, all passing, headless Chromium via Playwright at
DPR 1, light theme, viewports 1440 and 390, against the python http.server above.

| Area | Checked |
|---|---|
| Chrome | `pai.css` genuinely applied (`.pai-badge` computed radius = 34px, i.e. the real file loaded over the relative path — not a fallback) |
| Buckets | all three scenarios produce the right `body.dataset` (`state/plan/docs/credits/trial/team/seats/route/modal/banner/place`) |
| Surfaces | dashboard mounts at `place=app` with **24 cards from `fixtures.json`**; deck-canvas mounts at `place=editor` with an **8-slide filmstrip, slide 4 focused**, doc name from fixtures |
| Two places | `place=editor` shows the editor and hides the app frame, and vice versa |
| Overlay | `protos/upgrade-gold.html` mounts as a transparent overlay iframe; dialog has real geometry (460×474) |
| Continuity | **dismiss** hides the overlay and leaves a live dashboard behind; **the credits chip re-opens it** (real click path); **primary action** flips plan→gold, credits 0→4,500, hides the Upgrade CTA and unlocks both PRO nav items |
| Empty | `"decks": []` → empty block visible, file grid `display:none`, 0 rows |
| Determinism | `Date.now()` = `1785229200000` on every load; `Math.random()` gives the identical seeded sequence across two independent page loads |
| Frozen clock | `days_remaining: 2` renders as `30 Jul 2026` in the trial banner |
| Legacy contract | `?state=does-not-exist` → `data-baby="legacy"`, `body.dataset` has exactly one key (`state`). **The 227 existing prototypes are unaffected.** |
| Mount contract | an **untouched** file at `PAI-design/explorations/mudita/free-slide-limit-card/crazy8s-round-2.html` mounts by relative path and renders inside the chrome (1180×1657); the shell around it stays driven by the world |
| Standalone | `protos/upgrade-gold.html` opened directly, with no shell, renders the same dialog — same bytes both ways |
| Agentation | the annotation toolbar mounts (`[data-agentation-toolbar]`), through a React portal, byte-for-byte the same behaviour as the reference file `explorations/mani/7-day-trial/dashboard-trial.html` |
| 390 | sidebar collapses, **no horizontal scroll**, modal becomes a bottom sheet |
| Console | **zero console errors and zero failed requests** on every scenario, at both viewports, including the standalone proto |

Screenshots in `screenshots/`: `credits-exhausted@1440`,
`credits-exhausted-dismissed@1440`, `credits-exhausted-upgraded@1440`,
`credits-exhausted@390`, `empty@1440`, `empty@390`, `trial-expiring@1440`,
`trial-expiring@390`, `mount-external-untouched@1440`, `proto-standalone@1440`.

**Not verified:** anything in the "does NOT do" list above. In particular no
harness step (lint, judges, adjudication) was run against this, because none of
it is wired up.

# Figma harness — a research spike

PRD in, a judged Figma frame out, and a loop that makes the next run start
smarter. Same shape as the design harness; the artifact is a Figma frame
instead of an HTML file.

**Spike. Nothing here is settled.**

---

## What changed, and what didn't

Roughly 80% carries over unchanged. Only the middle three steps move.

| Step | Design harness | Here |
|---|---|---|
| 0 · Frame the brief + gate | brief → numbered checklist, you ratify | **unchanged** |
| **1a · Ground** | — | **new.** Read the live route in `pitchdeckdoclist` first |
| 1b · Retrieve anchors | `exemplars.json` rows → files | rows → `figma://` node ids |
| 2 · Generate | write HTML from `template.html` | `use_figma`, composing library components |
| 3 · Lint | regex over HTML source | **query the node tree** |
| 4 · Render states | Playwright at `?state=` | `get_screenshot` per state frame |
| 5 · Design judge | image model · rubric · anchors | **unchanged** |
| 6 · Product judge | brief · checklist · code | brief · checklist · **node tree** |
| 7 · Deliver + harvest | writes back to the assets | writes back to the **skill** |

### The lint gets stronger, not weaker

This is the part worth noticing. In HTML, *"no colour literals"* is a regex
hoping nobody inlined a hex. In Figma the same question is a boolean on the
node:

| Check | HTML | Figma |
|---|---|---|
| uses a design token | regex for `#rrggbb` outside the token block | `fills[0].boundVariables.color` exists |
| uses the type scale | class-name match | `textStyleId` is set |
| uses a real component | not checkable | node is an `INSTANCE`, not a detached frame |
| layout is systematic | not checkable | `layoutMode !== 'NONE'` |
| no placeholder copy | text scrape | text scrape |
| numbers match `content.md` | text scrape | text scrape |

Four of six go from textual guesswork to structural fact. **Determinism is the
reason to prefer this substrate**, not fidelity.

### Ground before you design

You are almost never inventing a screen. You are changing one that exists, has
users, and already has copy, states and components. So the run reads the live
route in `pitchdeckdoclist` before anything is drawn:

```
which components compose this route   →  the agent matches each to a
what copy is actually in them            Figma component by name
what states it already handles           (Code Connect would bind them,
                                          but needs an Org plan)
```

The repo is 342k LOC and needs three services to run, so it is **read, never
run**. Reading is cheap; running is not.

Two things fall out. Generation starts from what exists instead of redesigning
the dashboard from scratch every run. And the product judge can be asked a
sharper question than "does this solve the brief" — it can be asked what
actually changed, and whether that delta is the one the brief wanted.

Ground says *what is there*. Anchors say *how it should look*. Both, then
generate.

---

### The loop is a diff, not an annotation

Generation snapshots the node tree it produced. Whatever the frame looks like
later, the difference is *what a human changed after the agent handed off* —
the highest-signal correction channel available, captured as a byproduct of
working rather than by remembering to annotate.

```
generate ──► generated.json (baseline)
                  │
   you edit in Figma
                  ▼
harvest ────► diff ────► candidate rules ────► you rule ────► the skill
```

---

## Layout

```
.claude/skills/pai-figma-build/     the workflow and the rules Claude loads
├── SKILL.md
└── references/
    ├── visual-language.md          near-objective style rules, the judge's rubric
    ├── product-judgment.md         what counts as solving the problem
    └── coverage-gaps.md            what we know we have not ruled on

figma-harness/                      the machinery
├── content.md                      real strings and numbers, owner + as_of
├── requirements-template.md        defaults every brief inherits
├── exemplars.json                  figma:// anchors, per surface × register
├── lint/figma-lint.mjs             the deterministic checks
└── runs/<run-id>/                  one directory per run
    ├── requirements.json · generated.json · states/*.png
    └── findings/*.json · run.json
```

The rules live in the repo, versioned and diffable. The artifact lives in
Figma. Nothing has to sit inside Figma, and nothing is a black box.

---

## Open, on purpose

- **`use_figma` is programmatic construction.** Output quality tracks the
  guidance, which is why Figma's own `figma-use` skill is mandatory before any
  write. Composing from an existing library beats generating from scratch.
- **The design judge is an image model on screenshots.** It never sees the node
  tree; the product judge never sees the rubric. Same isolation as before.
- **Figma comments are not readable via MCP.** The tool surface has no comments
  API, so critique capture is the node diff for now, not threads.
- **A frame is not a flow.** States are sibling frames. Anything about motion or
  what-happens-next is out of scope here.
- **Figma Make was checked and ruled out** (30 Jul). It is a real Vite + React
  app, so it would solve flows, but `use_figma` does not support Make files and
  `get_screenshot` refuses them, so the harness cannot drive generation or take
  its own screenshots. It also builds from shadcn/ui rather than our design
  system, and the Make kit that would fix that needs an npm package of
  `uicomponents` which does not exist. Costs the automated loop, buys no brand
  alignment.
- **Code Connect is unavailable.** It needs an Organization or Enterprise plan
  and we are on pro, so nothing binds a library component to its React
  counterpart. Grounding matches by name, and promoting a component changes
  what gets designed rather than what gets shipped. An upgrade closes this.

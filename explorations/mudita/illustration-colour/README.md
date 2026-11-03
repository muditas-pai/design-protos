# Illustration colour: research spike

**Status: research spike. Nothing here is shipped or merged.** Snapshot taken 3 Nov 2026 by Mudita.

Illustrated diagrams ship with hard-coded colours, so they look the same on every brand palette. This spike makes
them follow the palette. It has two parts, and you can pick up either one on its own:

```
 A. Palette  ─────────────────────────────▶  colour tokens for each slide background
    brand colours + slide bg + text colour     (light, dark, colour 1 …)
                                                        │
 B. Role mapping                                        ▼
    a vector's hex colours ──▶ role map ──▶  each shape points at a token
    (Claude proposes, a designer approves)
```

- **A. Palette generation** is code. It's deterministic, with no AI involved. See `palette-spec.md`.
- **B. Role mapping** is judgement. A script drafts it, Claude refines it, and a designer approves it. See
  `role-map-skill/SKILL.md`.

---

## What's in the folder

```
illustration-colour/
├── README.md               you are here
├── palette-spec.md         how the palette tokens are generated, in words
├── role-map-skill/
│   └── SKILL.md            Claude Code skill: map a vector's colours to roles
└── snippets/
    ├── IllusTokenUtil.js   the 20-token generator (copied from pitchdeckdoclist)
    ├── painter-stored.mjs  Painter layer: the 6 colours stored per background
    ├── painter-recipe.css  Painter layer: every form step mixed from those 6 in CSS
    └── illus-tokens/       role-map pipeline: scripts, SPEC.md, 65 role maps, tests
```

**Where the copies came from.** If you go back to the source, check these first; they may have moved on.

| File | Source | State on 3 Nov 2026 |
|---|---|---|
| `IllusTokenUtil.js` | pitchdeckdoclist, branch `illustration-tokens`, `src/listing/core/screens/workspace/styles/` | not pushed |
| `illus-tokens/` | design_assets, branch `illustrated-diagrams-redesign`, `scripts/illus-tokens/` | not committed |
| `painter-*` | the Painter test page's build script | rebuilt here, not in any repo |

---

## Try it

You need Node 20+ and Python 3 with `svgelements` (`pip install svgelements`) for the role-map scripts.

**1. Check the generator works** (should print `1040/1040 values match`):

```bash
cd snippets/illus-tokens
ILLUS_TOKENS_SRC=../IllusTokenUtil.js node test/illus-tokens.test.mjs
```

**2. Print Painter tokens for an example palette:**

```bash
cd snippets
ILLUS_TOKENS_SRC=$PWD/IllusTokenUtil.js node painter-stored.mjs
```

**3. Map a new vector's colours.** Install the skill, then ask Claude Code:

```bash
mkdir -p ~/.claude/skills/illus-role-map
cp role-map-skill/SKILL.md ~/.claude/skills/illus-role-map/
```

> "Map the colours for `iceberg2node.svg` using the illus-role-map skill."

The converter rewrites files in place, so point it at a **copy** of the drawings, never the real `resources` clone.

---

## What's proven and what isn't

| | State |
|---|---|
| 20-token generator | Matches frozen expected values for 12 palettes (1,040 values) |
| Role maps | 9 decided by hand. 56 proposed by rule and approved for review only, never checked by eye |
| Converter | Ran on 59 drawings (891 files) in a local clone. Colours only, nothing else changed |
| Painter layer | Works on the test page in Chrome. Not tried in the app |
| Locked colours | Lighthouse tower white, bridge water blue. Test page only, not in the role maps |

---

## Open questions

- **PPTX export.** The 20-token version stores final colours on purpose, because export reads final values. The
  Painter recipe mixes colours in CSS with `color-mix()` and `oklch(from …)`, which export may not understand. Either
  precompute Painter steps the same way, or check what export does with them.
- **Locked colours as a role.** Water, skin, gold and a white lighthouse all want to keep their colour. Should
  `fixed` become a set of named locked families (`water`, `tower` …) instead of keeping the raw hex?
- **White tower on light slides** nearly disappears. It might need a line in the palette's line colour.
- **Nodes per diagram.** How many nodes each diagram supports, and where they sit, is still to be decided.
- **Big dark objects** (the struggling man's boulder) come out pale on light slides, because neutrals sit light
  there by design.

---

## Background reading

These pages are private to Mudita until they're shared with you.

- Role mapping, worked through on the lighthouse: https://claude.ai/artifact/4z3eHNpGFaWXBLi3oeTCf2
- How each palette's colours are picked: https://claude.ai/artifact/MARP6mticxQQfKpWfUF68E
- Painter test page, 10 drawings on every palette: https://claude.ai/artifact/DrFgRvRDeskPB7n5nwZWDv
- Full technical spec for the pipeline: `snippets/illus-tokens/SPEC.md`

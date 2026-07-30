# Two harnesses, drawn at the same fidelity

Same logic, same loops, same seven steps. The only difference is the
substrate — and until now the two diagrams weren't comparable, because
Dhruv's predates baby-PAI and so drew no substrate at all while the Figma
one drew its substrate in full.

Both now carry a **substrate** column and mark their **costs**, so the
comparison is like-for-like.

| | A · baby-PAI | B · Figma |
|---|---|---|
| `harness-with-baby-pai.html` | 35 boxes · 5 substrate · 2 costs | |
| `harness-with-figma.html` | | 40 boxes · 4 substrate · 4 costs |

## Read them this way

B draws **more** costs than A. That is not the finding. The finding is the
asymmetry in what the substrate boxes *are*:

```
A's substrate boxes are things you must BUILD AND MAINTAIN
   baby-pai-app · src/ds (a third copy) · ported screens that drift ·
   an annotation layer written from scratch · dist/ and a deploy action

B's substrate boxes are things you GET
   the Figma file · one design system, Code Connect bound ·
   capture as a byproduct · every designer can edit it
```

Five boxes of work against four boxes of leverage. A's two costs
(re-implementation, and an artifact only React authors can edit) sit
*downstream* of that work.

B's four costs are real and none of them are maintenance: no flow state
across frames, unverifiable reachability, slower round trips, and comments
that the MCP cannot read. They are capability gaps, not upkeep.

## Everything unmarked is identical

Steps 0 through 7, the gate, two-judge isolation, adjudicate, the conflict
rule, the pass budget, harvest's closing question, the halt verdicts, the
day-1 asset set. That is the ~80% both share.

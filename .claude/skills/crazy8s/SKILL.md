---
name: crazy8s
description: Branching visual-iteration workflow. Produces 8 variations in a single rolling file `crazy8s.html`, waits for the user to pick one, then branches 8 more variations off that pick. Trigger when the user wants to explore visual alternatives — phrases like "give me 8 variations", "different versions of this", "explore alternatives", "branch out from this", "show me a few options of this card", or "give me crazy 8s". Trigger even without the skill name.
---

# crazy8s

## What this skill does

`crazy8s` is a branching visual-iteration workflow. Each round produces **8 variations** in a single file called `crazy8s.html`. The user picks one. The next round keeps the picked one as variant 1 and produces 7 new branches off it. Repeat until the user says **"freeze it"**.

The whole point is to converge on a final design via repeated rounds of meaningfully different options — the user judges, and the skill explores their picks.

## When to use

Use whenever the user wants to **explore visual alternatives** of something, especially after they have a working baseline they want to push on. Phrases that should trigger:

- "give me 8 variations"
- "make different versions"
- "branch out from this"
- "let's explore alternatives"
- "show me a few options of this <thing>"
- "give me crazy 8s"
- "iterate on this"

If the user says "make 4 variations" or some other count, override the default 8 for that round only — but the skill name and file name don't change.

## The workflow

Each round: identify baseline → ask scope (what to vary, what to preserve) → generate 8 variations → wait for pick or freeze. On a pick, branch a new round off it. On freeze, ask what to do with the picked design.

### Round 1 — first invocation

1. **Identify the baseline.** There will always be one — usually one of:
   - An explicit reference file the user points to (e.g., "make 8 variations of `pricing.html`")
   - A screenshot or image the user shares
   - The thing already in progress in the conversation (a file you've been editing, the most recent design discussed)
   - A URL or reference design they paste

   If you can't tell what the baseline is, ask before proceeding.

2. **Ask the user two questions before generating anything:**
   - **What to play around with** — the dimension(s) to vary (e.g., layout, typography, color, copy, ornamentation, hierarchy, density). One dimension or several.
   - **What not to touch** — constants to preserve (e.g., "keep the brand colors", "don't change the headline copy", "design system stays").

   Do not skip this step. Without scope, variations end up either too similar or wildly off-base. The user knows their constraints; ask.

3. **Create `crazy8s.html` next to the baseline file.** Same directory. If the baseline is just an idea (no file), put `crazy8s.html` in the current working directory.

4. **Generate 8 meaningfully distinct variations** in that file as a single scrollable gallery. Each variation:
   - Sits in its own labeled section (`01 · <short descriptive label>`, `02 · <short descriptive label>`, etc.)
   - Uses a label that describes the *idea behind the variation*, not just a number — so the user can refer to it ("the editorial one", "the centered one")
   - Stays within the "what not to touch" constraints
   - Pushes meaningfully along the "what to play around with" dimensions
   - Is fully self-contained and visually complete (no half-finished placeholders)

5. **Tell the user where the file is** and a one-line summary of the 8 directions you tried. Then wait.

### Round 2..N — branching

When the user picks (free-form: "I like 3", "go with the brutalist one", "the second one", "pick #5"):

1. **Confirm the pick** if there's any ambiguity. Better to ask than to branch on the wrong one.
2. **Ask the same two questions again**: what to vary now, what to preserve. Each round narrows the scope — round 1 might explore layout, round 2 might explore typography within the chosen layout. Don't assume the same dimensions carry over.
3. **Rewrite `crazy8s.html`** so that:
   - Variant **1** is exactly the picked design from the previous round (unchanged)
   - Variants **2-8** are 7 new branches off variant 1, varying along the new dimension
4. Tell the user briefly what the 7 new branches try.

The previous variants from the prior round are gone. Don't keep them around. The user picked variant 1 to be the seed; that's the only one that survives.

### Freeze — termination

When the user says **"freeze it"** (or any close variation: "freeze this", "ship it", "this is final", "lock it in", "use this"):

1. Identify which variant is currently the "frozen" one — usually variant 1 of the latest round (the picked one). If ambiguous, ask.
2. **Ask the user what to do next.** Don't auto-move or auto-rename. Most likely the user wants the frozen variant merged into a main file (the baseline they started from, or a target they'll specify). Surface a few sensible defaults:
   - Merge into the baseline file (overwrite it with the frozen variant, stripped of crazy8s scaffolding)
   - Save as a new file with a name they specify
   - Just stop iterating — leave crazy8s.html as-is, they'll handle it manually
3. Once they pick, do the move/extract carefully — strip the gallery scaffolding so the output is a clean standalone file, not a one-section gallery.

## Track cumulative constraints

Each round, the user typically adds constraints — and they accumulate. Round 2 might add "stay table-format." Round 3 might add "use these 4 specific rows + cap height at 600px." Round 4 might narrow to "only typography varies." By round 5, all of these still apply.

Maintain a running spec — either as a sidecar `crazy8s-spec.md` next to `crazy8s.html`, or as a clearly-restated block in every subagent brief and round summary.

**At the start of each round, restate the cumulative spec to the user** before generating, so they can confirm or relax anything. Compact format:

```
Cumulative spec (carried forward):
- Format: comparison table
- Required rows: Discount, Exports, Credits, AI models
- Max height: 600px
- Quote retained
- Design system + content unchanged

This round adds: small-title plan names, body-text cadence, image-next-to-name in corner cell.
```

Don't drop a constraint unless the user explicitly relaxes it. If a new round's brief conflicts with an earlier constraint, surface the conflict and ask.

## Generating meaningfully different variations

This is where the skill earns its keep. 8 variations that all look similar are useless. Make each one feel like a distinct designer made it within the same brief.

**Round 1 is the widest cone.** Each subsequent round narrows it. By round 5, variants might differ only in fine-grained details. By round 1, they should feel almost like *different products solving the same brief*.

If your 8 round-1 variants all share the same overall structure (e.g. they're all rearrangements of the same modal, or 8 versions of the same kind of card with different colors), you've failed the round 1 brief. Each variant should be a fundamentally different way to compose the same content — different formats, different framings, different reading orders, different units of organization.

*Example (illustrative — not a template, your domain may need entirely different angles):* If the brief is "iterate on a pricing modal", round 1 variants could span a comparison table, a magazine spread, a vertical timeline, a postcard layout, a tabbed widget, etc. Use this only as a sense of the *spread* expected — what counts as wide depends on what you're iterating on.

Round 2 then explores *within* the picked format. Round 3 narrows further inside the picked round-2 refinement. The cone tightens with each round.

**Push hard along the dimension the user named.** Don't shuffle padding by 4px. If they said "vary the layout", try wholly different column counts, reading orders, framings, alignments. If they said "vary the typography", explore different type pairings, scale contrasts, weight relationships. The goal is genuinely different choices, not 8 micro-tweaks of the same thing.

**Respect the constraints.** If the user said "design system stays", don't introduce new fonts, colors, or shapes. Stay within the existing token set and explore *arrangements* of those tokens.

**Label each variation with intent**, not just a number. The label is how the user will refer to it. Short, evocative, descriptive: `01 · Centered hero`, `02 · Editorial newspaper`, `03 · Stripe top header`, `04 · Hero price`, `05 · Recommended dark fill`. Two to four words.

**Each variation must be complete.** No half-baked placeholders. No "todo: fill in the rest." If the variation is hard to complete, drop it and pick another direction.

## File structure of `crazy8s.html`

A vertical gallery. Each variation in its own `<section>`, separated visually with generous spacing. At the top, a small header naming the round (`Round N`) and a one-line note about what's being explored.

If the source uses a particular tech stack (React via CDN + Tailwind, plain HTML+CSS, etc.), match it. Don't introduce build tooling. Each variation should be inline so the user can see all 8 by scrolling.

If the file gets large (>2000 lines), consider extracting shared scaffolding (the modal shell, sub-components used by every variant) into helpers at the top, so each variant section reads as just "what's different."

## Example interactions

**Example 1 — pick with adjustment**

User: "I like the editorial one, but lighter."

This is a pick + adjustment, not automatically a new round. Ask: "Branch into 8 variations of the editorial direction with a lighter feel? What specifically — typography weight, colors, density?"

**Example 2 — branching**

User: "Branch on #3."

Skill: Ask what to vary now, what to keep. Once answered, rewrite `crazy8s.html` with variant 3 from round 1 as variant 1, plus 7 new branches.

**Example 3 — freezing**

User: "Freeze it."

Skill: "Frozen variant is the currently-picked one (variant 1 of round N — the centered hero with editorial typography). What's next? Merge into `pricing.html`, save as a new file, or leave as-is and you'll handle it?"

## Things to avoid

- **Don't generate without scope.** Always know what to vary and what to preserve before producing a file. The two upfront questions are not optional — skip them only when the user explicitly states both.
- **Don't keep stale variants.** Round 2 starts fresh with variant 1 = picked + 7 new branches. Old rounds are not preserved in the file (the file always reflects the current round only).
- **Don't change the file name.** It's `crazy8s.html`, every round, every project. The user finds it where they expect.
- **Don't auto-merge on freeze.** Always ask what to do with the frozen variant.
- **Don't render fake variations.** If a direction doesn't actually work in the constraints, swap it out for one that does. Eight half-baked is worse than six excellent.
- **Don't second-guess the user's pick.** If they pick a direction you think is weaker, branch on it anyway. They're the judge.

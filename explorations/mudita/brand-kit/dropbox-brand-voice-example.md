# Dropbox — Brand Voice

Two layers, one source of truth.

```
  UI LAYER          →  chips the user sees & edits  (lean)
  ──────────────────────────────────────────────────────
  DEFINITION LAYER  →  rule + ✓/✗ pairs behind each chip (hidden)
  ──────────────────────────────────────────────────────
  MODEL LAYER       →  both compiled into the system prompt
```

The chip is the handle. Everything below it is what makes the model behave.
Editing a chip in the UI edits its definition; the model prompt recompiles from there.

---

## 1 — UI LAYER (what we show)

Chips only. One word per chip, 4–6 per list. Each is editable (`×` to remove, `+ Add`).
Tapping a chip expands its definition (Layer 2) for power users; the default view stays this clean.

```
Brand voice ⌄

WHO WE ARE
( Plainspoken ) ( Calm ) ( Practical ) ( Human ) ( Focused )          + Add

WHO WE ARE NOT
( Playful ) ( Visionary ) ( Technical ) ( Formal ) ( Salesy )         + Add

WORDS
WORDS WE USE                          WORDS WE'D RATHER SWAP
( get to work )  ( in sync )          ( solutions )  ( users )
( keep it safe ) ( organized )        ( empower )    ( utilize )
( less work )                + Add    ( seamless )            + Add
```

---

## 2 — DEFINITION LAYER (what sits behind each chip)

Every chip carries the same small schema:

```
chip:        one word
intent:      one line — what this trait means in practice
rules:       2–3 do-this directives (length, structure, diction)
examples:    ✓ on-voice  /  ✗ off-voice   (lifted from real Dropbox copy)
```

### WHO WE ARE

**Plainspoken**
- *intent:* say the thing directly; no decoration.
- *rules:* headlines ≤ 6 words · active voice, present tense · one idea per slide.
- ✓ "Find it fast, every time"  ✗ "Our advanced search capabilities enable rapid content retrieval"

**Calm**
- *intent:* steady around security and data — protection stated as fact, not warning.
- *rules:* no fear or urgency-baiting · no exclamation marks · confidence is quiet.
- ✓ "Security never comes second"  ✗ "Don't risk a catastrophic breach — act now!"

**Practical**
- *intent:* lead with the outcome, then the feature.
- *rules:* benefit before spec · name the so-what · cut the technical noun stack.
- ✓ "Save time, save money"  ✗ "AI-powered governance layer with granular ACL controls"

**Human**
- *intent:* write to one person, not an org chart.
- *rules:* use "you / your" · contractions welcome · warm, never stiff.
- ✓ "Your company will feel the impact daily"  ✗ "Organizations will realize material operational efficiencies"

**Focused**
- *intent:* remove friction from the copy itself.
- *rules:* one headline + one support line + ≤ 3 bullets · cut qualifiers and hedging.
- ✓ "Get to work, with a lot less work"  ✗ "A comprehensive, end-to-end, all-in-one productivity suite"

### WHO WE ARE NOT
*Hand-authored, like "who we are." Each is a legitimate voice another brand owns — not a flaw. The value is declaring the fork we deliberately don't take, so the model knows where the edges are.*

| chip | a valid voice (others own it) | so we instead… |
|---|---|---|
| **Playful** | quirky, meme-y, winking (Slack, Mailchimp) | stay straightforward — the work getting done is the fun part |
| **Visionary** | grand mission, future-casting (Apple, Tesla) | stay grounded in the work happening today |
| **Technical** | spec-deep, power-user-coded (Linear, Vercel) | stay accessible to everyone on the team, not just IT |
| **Formal** | polished corporate register (McKinsey, IBM) | sound like a colleague, not a boardroom |
| **Salesy** | persuasive, urgent CTAs, hard close | state the value plainly and let it land |

### WORDS

Three tiers, increasingly firm — most of the list is *preference*, not prohibition.

**Words we use** — *flavor and direction.* The model picks one or two where they fit naturally, never a checklist to stuff in.
> get to work · less work · in sync · keep it safe · find it fast · organized · together · aligned · effortless · source of truth · move work forward

**Words we'd rather swap** — *not bad, just not us.* Each has a warmer fit; rewrite toward the right column.

| instead of | we say |
|---|---|
| solutions | tools, Dropbox |
| users | people, teams, you |
| empower | help |
| utilize | use |
| seamless | effortless |
| leverage *(verb)* | use |

**Hard no** — *empty buzzwords, always rewritten.* This short list is the only true ban.
> synergy · best-in-class · game-changing · revolutionary · paradigm shift

---

## 3 — MODEL LAYER (compiled, not shown)

Built automatically from Layers 1–2 and prepended to any generation prompt.
Adds the cross-cutting structure rules that aren't tied to a single chip:

- **Headline** = the takeaway, not the topic. ✓ "Sharing is key to growth"  ✗ "Sharing Capabilities Overview"
- **Sentences** mostly short; vary rhythm; never two long ones back to back.
- **Bullets** parallel, verb-first, ≤ 1 line, max 3–4.
- **Data** always framed with its meaning, never a bare metric.
- **Case** sentence case for body; Title Case only for short section labels.
- **Punctuation** no exclamation marks.

**Gut check (always last line of the prompt):**
> If a line sounds like a press release or a feature spec, rewrite it as something you'd say out loud to a colleague.

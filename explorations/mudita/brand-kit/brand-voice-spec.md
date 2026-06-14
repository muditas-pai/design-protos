# Brand Voice — spec

**Status:** In progress · **Owner:** Mudita · **Updated:** 14 Jun 2026
**Main spec →** [brand-kit-spec](brand-kit-spec.html) · **Grounding →** [grounding](grounding.html)

The model for the **Brand voice** component of a kit — what it captures, what the user edits, and how
it reaches the slide generator. This replaces the earlier "nine voice rules," which mixed five
different levels of abstraction in one checklist (a grammar guardrail, a typographic nitpick, a
banned-word policy, and a length preference all sitting as sibling toggles). The fix isn't a better
list — it's **layers, each at one consistent level, where the *kind* of thing dictates the *kind* of
control.** A spectrum gets a slider; a set of choices gets a segmented control; a corpus of words
gets a list; a sample gets an example field.

---

## What a brand voice is, here

Two halves, following how brand teams actually document voice (a "brand voice chart") and how the
UX field formalises tone (NN/g's dimensional model): **who the brand is** (constant personality) and
**how that sounds on a slide** (the tunable part). For us it resolves into **four layers**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ A · PERSONALITY     who the brand is — human, descriptive                    │
│    Attributes  ▸ 3–5 chips        "Plainspoken · Principled · Rugged"        │
│    Not this    ▸ anti-attributes  "not corporate · not hype · not ironic"   │
│    → frames everything below; slider defaults are INFERRED from here          │
├────────────────────────────────────────────────────────────────────────────┤
│ B · DIMENSIONS      how it sounds — gradient → SLIDERS (all the same kind)    │
│    Formal     ●──────○───  Casual                                            │
│    Reserved   ────●─────  Expressive    (matter-of-fact ↔ enthusiastic)      │
│    Straight   ●─────────  Playful       (literal ↔ witty / figurative)       │
│    Measured   ───●──────  Bold          (claim strength: "can" ↔ "will")     │
│    Terse      ─────●────  Expansive     (length lean — clipped ↔ fuller)     │
├────────────────────────────────────────────────────────────────────────────┤
│ C · LEXICON         the words — concrete, machine-actionable                  │
│    Favour  ▸ words / phrases we reach for                                     │
│    Avoid   ▸ banned words · off-brand claims   (this IS "plain language")    │
│    POV     ▸ ◉ we   ○ you   ○ impersonal       (discrete, not a slider)      │
├────────────────────────────────────────────────────────────────────────────┤
│ D · EXAMPLES        the anchor — the strongest single signal to the model     │
│    2–3 real on-brand lines, each optionally paired with an ✗ off-brand twin  │
└────────────────────────────────────────────────────────────────────────────┘
```

Each layer maps to a different mechanism in the generation prompt, strongest at the bottom:

| Layer | Feeds the model as | Why it works |
|---|---|---|
| A · Personality | system framing | sets the frame; alone it's too vague to trust |
| B · Dimensions | quantified directives | "formal 0.2 → contractions on, sentences ≤ 18 words" beats an adjective |
| C · Lexicon | hard constraints | literal favour / ban lists — the model pattern-matches words directly |
| D · Examples | few-shot anchor | labelled ✅ / ✗ pairs out-perform every other input |

---

## A · Personality

Three to five **attribute chips** (the adjectives that name the voice) and a parallel **"Not this"**
set (the anti-attributes that sharpen it — "we are plainspoken, *not* folksy"). Both are
**extraction-seeded and fully editable: add a chip, delete a chip, rename a chip.** Nothing here is a
fixed vocabulary — these are the brand's own words. The attributes also set the **default positions
of the Layer-B sliders** (e.g. "Plainspoken" nudges *Formal→Casual* left of centre and *Straight*
toward literal), which the user can then override.

---

## B · Dimensions (the sliders)

Five spectrums, all the same kind of control, each genuinely gradient and each genuinely
brand-differentiating. Defaults inferred from the attributes; the user slides to adjust.

| Slider | Left ↔ Right | What it actually changes in copy |
|---|---|---|
| **Formal ↔ Casual** | register | contractions on/off, sentence complexity, vocabulary level |
| **Reserved ↔ Expressive** | energy | flat statement vs emphatic phrasing, em-dash asides, punch |
| **Straight ↔ Playful** | literal vs witty | metaphor and wordplay vs plain description |
| **Measured ↔ Bold** | claim strength | "can lift margin" vs "will lift margin"; hedged vs asserted |
| **Terse ↔ Expansive** | length lean | a **global** terseness bias for titles + copy |

Two notes on the set:

- **Measured↔Bold** and **Terse↔Expansive** are the presentation-specific additions to NN/g's four;
  claim-strength and terseness are where decks visibly differ. **Respectful↔Irreverent** (NN/g's
  fourth) is dropped — it rarely separates one business deck from another.
- **Terse↔Expansive is only a *lean*.** It biases length globally, but per-slide **density** (a vision
  slide wants prose, a KPI slide wants three words) is still owned by the **slide type + mood**, not
  pinned here. The slider sets the default the slide type modulates around.

---

## C · Lexicon

The word-level layer — the most literal thing the model consumes.

- **Favour** — words and phrases the brand reaches for (seeds from the imported copy; editable list).
- **Avoid** — banned words and off-brand claims. **This is what "plain language" actually was** — a
  pointer at this list, not a separate rule. (e.g. *revolutionary · synergy · best-in-class*.)
- **POV** — a **discrete** choice, not a slider, because there's no midpoint between "we" and "you":

| POV | The same fact, three ways | Feels like |
|---|---|---|
| **We** (first person) | "We cut returns by a third." | the brand owns it — warm, confident |
| **You** (second person) | "You'll cut returns by a third." | speaks to the audience — benefit-framed (sales / marketing) |
| **Impersonal** (third person) | "Returns fell by a third." | neutral, report-like (research / board / analyst) |

POV mostly *follows* the Formal↔Casual lean (casual brands skew "we/you", formal skew impersonal) but
is independently overridable.

---

## D · Examples

Two to three **real on-brand lines** — the anchor, and the single biggest lever on model output.
**Drafted automatically from the brand's imported site / decks**, then **editable** (rewrite, replace,
add). Each line can optionally carry an **✗ off-brand twin** (the same point said wrong) — contrastive
pairs teach the model far more than either line alone. Never a blank "describe your voice" box: setup
is always extraction-first — draft, show, let the user correct.

---

## What is *not* brand voice (evicted, with a home)

Half the cleanup is removing things that were never voice:

| Was a "rule" | Real home | Why |
|---|---|---|
| Sentence case · end punctuation | **Mood / theme** | typography — it *renders* text, doesn't author it |
| Body density · bullet form per slide | **Slide type + mood** | content-dependent; a vision slide ≠ a KPI slide (Terse↔Expansive keeps only the global lean) |
| Active voice · fact-led · no gerund heads | **Product house default** | every brand wants these — they don't make Patagonia ≠ McKinsey, so the generator always applies them, not a per-kit knob |

---

## Open questions

- **Gradient rules to sliders, confirmed — any to keep discrete?** Title-length and formality are
  now sliders (right call). Worth checking none of the five reads better as a 3-stop segment than a
  continuous track in testing.
- **Slider defaults from attributes.** The attribute→slider inference (which adjective nudges which
  track, how far) needs a real mapping table, not hand-waving. Draft it once the set is locked.
- **Off-brand twins — required or optional?** Contrastive pairs are strongest, but asking every user
  to write the "wrong" version is friction. Auto-generate the ✗ twin and let them edit?
- **One voice per kit.** Multiple voices by team (Exec / Marketing / Sales) stays a later expansion
  (see grounding). The POV choice covers much of that need for now.

---

## Research basis

Why the framework looks the way it does — the field, condensed.

**How brand teams define voice (the "brand voice chart").** Near-universal structure: 3–5 **attribute
adjectives**, a **"we are X, not Y"** anti-definition, **do/don't** guidance, a **lexicon**
(words we use / never use), and **on-tone / off-tone examples**. → became Layers A, C, D.

**How UX formalises tone (NN/g).** Tone analysed on **four spectrums** — Formal↔Casual,
Serious↔Funny, Respectful↔Irreverent, Matter-of-fact↔Enthusiastic — each a slider with a neutral
midpoint. **Voice is constant; tone varies by context.** → became Layer B (adapted: dropped
Respectful↔Irreverent, added Measured↔Bold and Terse↔Expansive for decks).

**What actually moves an LLM** (the deciding input for our controls):

- **Adjectives alone fail** — "our voice is conversational" yields bland, cliché-ridden output. They
  need behavioural definitions attached. → why Layer A can't stand alone; B/C/D do the work.
- **Explicit lexicon wins** — "say *helps you*, not *enables you to*" pattern-matches directly. → Layer C.
- **Quantifiable params** — average sentence length, contractions on/off — beat vague directives. → Layer B.
- **Contrastive ✅ / ✗ example pairs out-perform everything else.** → Layer D, the anchor.

**Sources:**
[NN/g — Four Dimensions of Tone of Voice](https://www.nngroup.com/articles/tone-of-voice-dimensions/) ·
[NN/g — Tone of Voice & Brand Perception](https://www.nngroup.com/articles/tone-voice-users/) ·
[HeyOrca — Brand Voice Chart](https://www.heyorca.com/blog/brand-voice-chart) ·
[Pepperland — Brand Voice Chart](https://www.pepperlandmarketing.com/blog/brand-voice-chart) ·
[WordStream — AI Brand Guidelines](https://www.wordstream.com/blog/ai-brand-guidelines) ·
[Latitude — How Examples Improve LLM Style Consistency](https://latitude.so/blog/how-examples-improve-llm-style-consistency)

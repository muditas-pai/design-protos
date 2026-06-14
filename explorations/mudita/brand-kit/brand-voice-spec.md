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
│    rhetoric    Data-led   ───●  Story-led     how you make the case          │
│                Measured   ●───  Bold          claim strength                 │
│    personality Composed   ──●─  Warm          temperature                    │
│                Serious    ──●─  Playful       wit                            │
│                Plainspoken ●──  Refined        craft                          │
├────────────────────────────────────────────────────────────────────────────┤
│ C · LEXICON         the words — concrete, machine-actionable                  │
│    Favour  ▸ words / phrases we reach for                                     │
│    Avoid   ▸ banned words · off-brand claims   (this IS "plain language")    │
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

Five spectrums, all the same kind of control — **two from rhetoric** (how the brand argues) and
**three from personality** (who the brand is). Each is genuinely gradient and genuinely
brand-differentiating. Defaults inferred from the attributes; the user slides to adjust.

| Slider | Poles | Lens | What changes in the copy |
|---|---|---|---|
| **Evidence** | Data-led ↔ Story-led | rhetoric | leads with the number vs leads with the scene |
| **Conviction** | Measured ↔ Bold | rhetoric | claim strength — "can help" vs "beats it, every time" |
| **Warmth** | Composed ↔ Warm | personality | poised & neutral vs personal, you-and-us |
| **Humor** | Serious ↔ Playful | personality | earnest & focused vs witty, light |
| **Polish** | Plainspoken ↔ Refined | personality | blunt & everyday vs crafted & elegant |

**Both poles aspirational.** Every slider passes two tests: (1) *no negative end* — both poles are a
voice a brand would proudly pick ("Measured," never "Hedged"); (2) *voice, not tone* — the answer
doesn't flip by audience or deck type. That second test is why "Expert-to-you ↔ Peer" was cut (a
brand slides that per situation — sales-to-enterprise vs founder-to-investor — so it's tone) and why
these five survive.

**Conviction is culture, not pitch.** The axis that looks pitch-specific isn't: it's the brand's
*epistemic confidence* — how firmly it stands behind what it says — which shows up even in an internal
project update or a research report. A declarative culture writes "Behind plan. Q3, locked."; a careful
one writes "tracking behind; ~Q3, pending dependencies." The slider sets the brand's **baseline**; deck
type nudges the realised level around it (a bold brand's research report still reads firmer than a
measured brand's sales deck — the relative position holds). Same "kit sets the lean, slide-type
modulates" pattern used for length.

### The four steps

Each slider snaps to four positions — **deliberately no neutral middle.** We want the brand to be
opinionated about every dial; there's nowhere to sit on the fence.

```
strong ─── lean ┊ lean ─── strong      (┊ is a gap, not a stop)
  end                          end
```

The preview slide rewrites at **every** step — strongest phrasing at the ends, softer at the inner
leans — so each move is visible. Defaults are inferred from the personality chips, and are never neutral.

### Generic illustration (reusable, brand-agnostic)

The same neutral fact — a new onboarding flow — across each dial, so each row isolates just that
slider (no per-brand regeneration needed). This is what the proto's live preview is built from:

| Slider | ◀ left pole | right pole ▶ |
|---|---|---|
| **Evidence** | "Setup time fell 40% this quarter." | "New users finish before their coffee's gone cold." |
| **Conviction** | "This should cut setup time meaningfully." | "This halves setup time. Full stop." |
| **Warmth** | "Users complete setup in under two minutes." | "You'll be up and running in two minutes flat." |
| **Humor** | "Setup is now faster and simpler." | "Setup used to drag. Not anymore." |
| **Polish** | "We cut the clunky setup steps." | "We stripped the friction out of getting started." |

---

## C · Lexicon

The word-level layer — the most literal thing the model consumes.

- **Favour** — words and phrases the brand reaches for. Seeded from the imported copy, then **fully
  editable** — add your own, rename, remove.
- **Avoid** — banned words and off-brand claims. **This is what "plain language" actually was** — a
  pointer at this list, not a separate rule (e.g. *revolutionary · synergy · best-in-class*). Same
  **add / rename / remove** editing as Favour.

**Point of view (we / you / impersonal) was considered here and cut.** It failed the voice-not-tone
test: the right person shifts with the deck's *job* — a sales deck wants "you," a research report wants
impersonal — so it's tone, decided per deck at generation time, not a brand-constant kit setting.
Warmth already carries the "personal vs poised" signal; the rest is the deck's call.

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
| Body density · bullet form · length per slide | **Slide type + mood** | content-dependent — a vision slide wants prose, a KPI slide wants three words; a fixed kit-level length fights the content |
| Typographic case · register markers (contractions, etc.) | **Mood + house default** | rendering and mechanics, downstream of the voice — not a brand-distinguishing dial |
| Active voice · fact-led · no gerund heads | **Product house default** | every brand wants these — they don't make Patagonia ≠ McKinsey, so the generator always applies them, not a per-kit knob |

---

## Open questions

- **Four steps, no neutral — does it force good choices or frustrate?** Sliders snap to four (no
  middle) on purpose, to make the brand commit. Watch whether users miss a neutral on dials they
  genuinely don't care about.
- **Slider defaults from attributes.** The attribute→slider inference (which adjective nudges which
  track, how far) needs a real mapping table, not hand-waving — the next concrete task now the set is locked.
- **Provocation folded into Conviction.** "Don't buy this jacket" lives at far-Bold rather than a
  separate Edge slider — kept the set orthogonal, but revisit if brands need explicit provocation.
- **Off-brand twins — required or optional?** Contrastive pairs are strongest, but asking every user
  to write the "wrong" version is friction. Auto-generate the ✗ twin and let them edit?
- **Where POV lands.** Cut from the kit as tone; needs a home as a **per-deck** choice at generation
  time (default inferable from the deck type). Out of the voice kit, but not nowhere.
- **One voice per kit.** Multiple voices by team (Exec / Marketing / Sales) stays a later expansion
  (see grounding).

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

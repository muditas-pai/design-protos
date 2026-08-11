---
name: atlas-riff
description: Go wide on how ONE element could look — a pricing card, a badge, an empty state, a CTA — drawing eight to twelve treatments across different families (gradient, stroke, glow, motion, geometry, texture, type) on a sheet you open live. Half of it may sit outside the design system on purpose: this is where the visual language gets extended rather than applied. Use when someone says riff on this, go wide, how else could we highlight X, play with treatments, what are the ways to make this pop, or wants to see motion options for an element. Not for composing a screen — that is AGENTS.md's explore step.
version: 1.0.0
---

# atlas-riff

**Reads** `design-system/DESIGN.md`, `pai.css`, and whatever screen the element lives on.
**Writes** `riffs/<element>/sheet.html` and `riffs/<element>/notes.md`.

One element. Many treatments. Half of it allowed to be outside the system.

## Why this exists

**The design system can only answer questions it already has words for.** Asked "how do we
highlight the recommended plan?" in published tokens alone, the honest answer is "a filled
button" — which is the answer we already had. A visual language that only ever applies
itself stops moving.

So this sheet is where it moves. The deviation is the point, not a lapse. What keeps it
from being a fork is that **nothing here ships** — a treatment that wins leaves this sheet
as a written proposal against `design-system/`, with its values, and gets published before
any screen uses it.

**This is not the explore step.** `AGENTS.md` step 3 settles the *shape* of a screen —
what sits where, in what order — and its variants deliberately hold palette and polish
still. This settles the *treatment* of one element and holds the shape still. Different
question, different sheet, different licence: explore may deviate about a third, a riff
may deviate about half.

## STEPS

### Step 1: name the element and the question

One element. "The recommended pricing card." "The PRO badge." "The empty projects state."
If two elements are in play, that is two riffs.

The question is always *what could this look like*, never *where should it go*. A riff that
moves things is answering explore's question on the wrong sheet.

**Write down what the element has to keep** before drawing: the words it carries, the
action it offers, the claim it makes. A treatment that quietly drops the price is not a
treatment of a pricing card.

**Draw it in its context, not alone.** Emphasis is relative — a recommended card only
reads as recommended beside the two it beats, and a badge only reads loud beside the row
it sits in. Show the neighbours in every frame, quieter and unchanged.

### Step 2: the 50% licence, and its three conditions

**Up to about half of what is on the sheet may sit outside the design system.** An
unpublished gradient, a coloured shadow, a glow, a tint at an opacity no token names, a
type size off the ramp, a radius that is not on the scale, an animation the system has
never had.

Three conditions, and they are what make it exploration rather than a fork:

| | |
|---|---|
| **comment every deviation where it sits** | what it is doing, and the nearest published thing it stands in for: `/* brand at 8% — no token; --bg-brand-selected is 12% and is a button hover */` |
| **list them at handover** | so the person picking knows which frames are free and which cost a design-system conversation |
| **nothing ships from here** | the artifact is not covered by this licence. A winner is published first, then used |

**The other half must be genuinely on the system**, including one frame that is the
*current published treatment*, unchanged, as the control. Without it nobody can tell
whether a riff is better or merely different.

### Step 3: cover the families, then push past them

Eight to twelve frames. **One from each family before a second from any family** — eight
gradients is one idea drawn eight times, and it is the failure this rule exists to
prevent.

**But coverage is the floor, not the sheet.** The first run of this skill covered all nine
families, spent its licence exactly, and produced three frames worth keeping. The nine that
missed were each a single published property turned up or down — a bigger number, a wider
column, a fill, a glow. The three that landed introduced a **new material or a new spatial
fact**: a gradient living inside a stroke, an actual texture on the surface, a card in front
of its neighbours. That is the difference the rest of this step is about.

Three rules follow from it, and a sheet that breaks them is a survey, not an exploration:

| | |
|---|---|
| **At least three frames combine devices.** | The screen you are riffing against already uses two or three together. A sheet of single-property frames is measuring each device against a strawman, and every one of them loses |
| **At least two frames should be ones you expect to be rejected.** | Nothing ships from here, so timidity has no upside. A sheet where every frame is plausible was drawn too close to what already exists — and the frame nobody would ship is often the one that names the idea worth having |
| **Half the sheet should be things the system *cannot currently express*** | not "half the frames contain one unpublished number". A tint at an opacity no token names is a deviation on paper and a variation in the eye. Material, depth, light, motion and geometry are where a system's vocabulary actually ends |

**Name the reference where a frame has one.** Print, packaging, motion graphics, an OS, a
material — what the frame is reaching for, in its line. A treatment traceable to something
real is arguable; one that came from nowhere can only be liked or disliked.

| family | what it plays with |
|---|---|
| **fill** | gradient, tint, wash, solid, inverted |
| **edge** | stroke weight and colour, a gradient in the stroke itself, an inset ring, a cut corner |
| **light** | shadow, coloured shadow, an outer glow, an inner glow, a bloom behind the element |
| **motion** | a pulse, a travelling sheen, a glow that drifts, a slow gradient rotation, an entrance |
| **geometry** | scale, overhang, aspect, a notch, a corner treatment |
| **material** | texture, noise, grain, ribbing, paper, glass, a pattern at low opacity — what the surface is *made of*. The house already owns a ribbed language in `assets/backgrounds/`; a card is allowed to be a material and not just a colour |
| **type** | a step up, a weight change, a different figure treatment, tabular vs proportional |
| **depth** | layering, an element breaking its own frame, something behind the card showing past its edge |
| **subtraction** | quieten everything around it instead of raising it — the frame that is always worth drawing |

Each frame carries **one line: what it bets on, and what it costs.** A frame with no cost
named has not been thought about.

### Step 4: motion, if the riff has any

Motion is in scope here and nowhere else in this repo, so it carries its own rules.

- **`prefers-reduced-motion: reduce` on every animated frame**, falling back to the static
  treatment underneath. Not a nicety — a pulsing purchase surface is exactly what that
  media query exists for.
- **Animate `transform` and `opacity`.** A glow that animates `box-shadow` or a background
  position repaints the element every frame; on a page of three cards it is visible.
- **Say the timing in the frame's line** — duration, easing, whether it loops or fires
  once. "A slow pulse" is not reviewable; "1.8s, ease-in-out, infinite alternate" is.
- **A loop that never stops is a decision, not a default.** Say why it earns permanent
  attention, or fire it once on entry.

**The still cannot judge motion.** The render freezes everything by design, so a screenshot
of a pulsing card is a picture of one arbitrary frame. Motion frames are judged live in the
browser — say so at handover, and capture the frozen state as well so the resting
appearance is on record too.

### Step 5: look at it live, then hand it over

Serve the repo and open the sheet yourself before reporting. Check three things a
screenshot will not tell you: that the motion frames actually move, that the animated ones
degrade to something sensible under reduced motion, and that nothing you drew makes a
neighbouring element read as disabled.

**Write `riffs/<element>/notes.md`** with the frame table — name, family, what it bets,
what it costs, deviations used — so the sheet is readable in six weeks without opening it.

### Step 6: the graduation path

This is what separates a riff from a mood board. When a frame wins:

1. **Write it up in `design-system/coverage-gaps.md`** — the value, where it would live,
   the nearest published thing, and what it would be named. That file is the queue.
2. **A winner is published before it is used.** It lands in `pai.css` with a token name,
   and appears in `sticker-sheet.html` — a component is not finished until something uses
   it. Only then may a screen reach for it.
3. **A frame that wins and is never published is a fork waiting to happen.** If nobody
   intends to publish it, say so in `notes.md` and let it die on the sheet.

## What this skill may not do

**Do not touch a screen.** Not `designs/<slug>/<slug>.html`, not a canonical screen. The
sheet is the deliverable.

**Do not lift the sheet's markup into an artifact.** It is written to be compared, carries
scaffolding that means nothing elsewhere, and has never been near a blocking lint.

**Do not change the element's content to flatter a treatment.** Same words, same price,
same action in every frame, or the comparison is measuring the copy.

**Do not lint-gate the sheet.** It will fail by design. Run the lint on nothing here; the
deviation list is the accounting.

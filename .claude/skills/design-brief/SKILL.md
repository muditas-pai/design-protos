---
name: design-brief
description: Interview whoever arrives with a half-formed design ask and turn it into a written brief — what is being made, when it appears, who it is for, what the person gets, every state and case, and what was left open and why. Works for any design artifact: a screen, a modal, a flow, a component, an empty state, a page. Invoke when someone brings a vague design request (a paragraph, a Slack message, "I want to design X"), when a design job needs a brief before anyone draws, or when an existing brief is too thin to build from. Produces one markdown document and stops there.
---

# design-brief

## What this produces

One markdown file: the brief. The interview is the work; the file is the record of it.

It is prose a designer reads — it does **not** number requirements, tag states, emit JSON, or
classify the thing against any taxonomy. Something downstream may; guessing at it here only
makes the document worse. Describe what is being made in plain words — *"a modal that appears
when someone hits a paid feature gate"*, *"the empty state of a list"* — and stop.

---

## Step 1 — pick the depth, before anything else

Ask this first, via **AskUserQuestion** — a single question, two options:

- **quick** — every question in one batch with a best guess at each answer; they correct the
  ones that are wrong
- **thorough** — one question at a time, with the reasoning, and they decide each

Do not start interviewing before they answer. Do not pick for them.

Use AskUserQuestion for every question in the interview, not just this one — one call per
question in thorough mode, and it takes up to four, so genuinely related questions can share a
call. Put the option you would pick first and mark it `(Recommended)`. Options are how the
person sees what the question would change; a question with no proposed answers is a question
you have not thought about yet.

---

## Step 2 — say what the ask already answers

In both modes, before any question: list in one line each what the ask already settles, phrased
as a reading that can be corrected.

> Reading this as: appears right after someone saves · audience is people who have done this
> before · the win is they can tell it worked without checking. Say if any of that is wrong.

Never re-ask something the ask answered. Never silently assume it either — the readback is what
makes it correctable.

---

## Step 3 — the interview

### Thorough mode

- One question at a time, or a small group of genuinely related ones. Never a form.
- Say **why** you are asking before each — what it would change about what gets drawn.
- Follow the answer where it goes before moving on.

### Quick mode

Quick mode is not "skip the questions". It is "answer them myself and get corrected".

1. Take every standing question the ask has not already settled.
2. For each, **write the answer you would give** — specific, in a sentence, the way it would
   read in the brief. Not "TBD", not a restated question, not "depends".
3. Put them all in one numbered batch, one line each, and say: *reply with the numbers you'd
   change; anything you don't mention I record as written.*
4. Anything waved through is recorded **as the answer, marked `(assumed)`** — in the brief text
   and counted in *Left open*. Silence never becomes a blank; it becomes a visible assumption
   with your name on it.

**The rule that keeps quick mode honest:** only propose a default for a question you can
actually answer from the ask. If the answer depends on something only they know — where the
action lands them, what the fallback is when the data isn't there, who is excluded — that
question does **not** go in the batch with a guess. Ask it outright, in quick mode, as a real
question. Guessing with no basis is the hole. If more than three come out un-defaultable, say
so and recommend thorough; then do whatever they say.

One follow-up round after the batch, and only for a contradiction their answers opened. Do not
turn quick into thorough by attrition.

### Both modes

- **Push back on adjectives.** "Should pop", "feels premium", "cleaner" are not answers. Ask
  what would be true on screen if it were satisfied.
- **Do not invent specifics.** A number, name or string nobody gave you is a gap — write it in
  *Left open*, don't fill it.
- **Stop when the answers stop changing the drawing.**

---

## Standing questions

<!-- APPEND TARGET: add new standing questions to the numbered list below, one line each. -->

Put every one of these on every brief, in either mode. "Doesn't apply, because…" is a complete
answer; silence is not.

1. **What has just happened when this appears — what did the person do, or what did the system
   do to them?**
2. **Who is this for, and what differs between the people who see it — new vs returning, their
   account state, their permissions, their language?** Which of those do we actually draw?
3. **In the person's own words, what do they get out of this?** Does the copy say that, or does
   it say what the system is doing?
4. **What does this look like when it goes wrong or comes up short — nothing to show, blocked,
   failed, still waiting?**
5. **Which states exist besides the default, and what does each one say?**
6. **What happens the instant the main action is taken — where does the person land, what has
   changed, and can they undo it?**
7. **How does someone who does not want this get out, and where does getting out put them?**
8. **Can one person meet this more than once, and does anything change the second time?**
9. **What gets cut, stacked, or reordered when the space is much narrower?**
10. **What will people ask this to do that it deliberately does not do?**

Each is here because only a person can answer it and getting it wrong changes what gets built.
Anything a linter, a token check or a screenshot could settle on its own does not belong here —
do not add style or implementation checks to this list.

---

## The brief document

**Where:** `explorations/<designer>/<problem>/brief.md`. Ask who the designer is and what to
call the problem if the ask does not say.

**Shape:**

```markdown
---
title: <one line, what this is>
created: 3 Jun 2026
status: draft | ready
designer: <who builds it>
depth: quick | thorough
---

## What this is

Plain words, one or two lines — the kind of thing it is and when it shows up.
Then: what triggers it, and who is looking at it.

## The problem

What is broken, for whom, and why it is worth building. Three to five lines.

## What the person gets

The promise in their words, not the system's. One or two lines.

## What has to be true

Plain sentences, one per line, each something you could look at the finished
thing and agree or disagree with. No numbering, no tags.

## States and cases

| State | What the person sees | How they get there |
|---|---|---|
| default | … | … |
| empty / blocked / failed | … | … |

Cover the not-happy cases here, not just the good ones.

## Backing out

How someone leaves without doing the thing, where they end up, and what is
kept or lost.

## What varies

By person, by context, by screen width. Say which variant is the one we draw.

## Out of scope

What this deliberately does not solve.

## Left open

Things nobody could settle, each with the reason and who has to settle it.
Anything marked (assumed) above belongs here too — say how many, and that they
were proposed rather than answered.
```

Mark any answer you supplied rather than received with `(assumed)` inline, wherever it appears.
`status: ready` means the interview is finished and the person you interviewed has read the
brief back. A brief that is still `draft` is not ready to build from.

---

## Growing this list

When the interview turns up a gap the standing questions missed — something you had to invent
and would ask again on the next brief — propose it in one line and offer to append it to
*Standing questions*. Never append silently.

A proposed question earns its place only if it is answerable in a sentence, would change what
gets drawn, and needs a human to answer it.

---

## Done when

The brief exists at its path, `status: ready`, every standing question has an answer or a
stated reason it does not apply, every assumption is marked, and *Left open* says who settles
what. Hand the file over; do not start drawing from here.

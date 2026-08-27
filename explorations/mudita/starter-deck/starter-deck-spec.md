# Starter deck: the deck we put in an empty dashboard

**Type:** Content spec, stable design intent · **Owner:** Mudita · **Updated:** 27 Aug 2026

Ten slides that sit in a new user's dashboard before they have made anything. Where each feature
lives in the code, the plan gates, and the surface this competes with: [grounding.md](grounding.html).

---

## The claim

A deck that explains the product is a manual, and nobody reads a manual. A deck that **makes you do
the thing** is onboarding, and the deck is just the shape it comes in.

So two rules govern every slide below, and the second one is the one that matters.

> **1. Every slide demonstrates the thing it describes.** The remix slide is a remix grid. The brand
> slide is one layout in three brands. Nothing is explained with an icon and a sentence.
>
> **2. Every slide ends in one action the reader takes from the slide.** Not a described action.
> A clickable one, on the slide, that starts the real feature.

If a slide has no action, it has to be earning its place some other way (slide 1 and slide 9 do).
If it has more than one, it has none.

### The unlock: the deck is the practice object

Half the actions in the brief cannot be triggered from a slide, because they are things you do *to a
deck*. Editing with AI, remixing a layout, sharing and seeing analytics: all of them need a deck to
be done to.

The user has one. **This one.** It is sitting in their dashboard, it is theirs, and it is real.

```
   OTHER TUTORIALS               THIS DECK
   ─────────────────             ─────────────────────────────────
   "here is how remix works"     "remix slide 6. it is your deck."
   → you leave, you try,         → you do it here, in the thing you
     you come back (or not)        are already looking at
```

Slides 5, 6 and 7 are performed on the deck itself. That is worth more than any illustration of
them, and it decides an open question straight away: **the deck must be the user's own editable
copy**, not a read-only sample. It is there to be wrecked.

---

## What a slide can actually do (checked in the code, 27 Aug 2026)

Before writing a single action, this is the mechanism the spec is allowed to assume. From
`PresentScreen.jsx` and `SelectedTextStyleChangeOperation.js`:

| What | Works? | How it behaves |
|---|---|---|
| Text hyperlink to a URL | Yes | `window.open(link, "_blank")`, **a new tab** |
| Link to another slide in this deck | Yes | `gotoAndPlaySlide()`, stays in the deck |
| Link on an image or a chart item | Yes | Same two paths, via `data-navigate-to-slide-on-click` |
| Any of it while in the **editor** | **No** | In the editor a link is a thing you edit, not a thing you click. Only present mode dispatches it |
| A button that is not text or an image | No | There is no button element on a slide. Style a linked text run to look like one |
| The deck knowing you did the thing | No | Nothing reads back. Slide 4 cannot grey itself out once a brand kit exists |

Three consequences the design has to swallow:

**1. It only works in present mode.** A deck opened from the dashboard grid goes to the editor,
where none of the links fire. So the tile has to open this deck **in present mode**, or the whole
pattern is dead on arrival. This is the single dependency the deck cannot ship without.

**2. Every outbound action costs a tab.** Click "Set up your brand kit" and the deck stays behind in
the tab you left. Pitch's version has the same problem and lives with it. Two ways out, and I would
push for the first:

- Ask for a same-tab route for internal links. There is precedent: the "For you" cards already hand
  off through `localStorage` deep-link keys (`analyticsdeeplink`, consumed by `TopMenu`). A slide
  link of the same shape would be a small addition rather than a new system.
- Or accept the tab, and write every outbound action's copy so leaving reads as finishing rather
  than as losing your place. That is a real constraint on the copy, not a footnote.

**3. Actions performed on this deck have no tab problem at all**, which is another reason slides 5,
6 and 7 are the strongest three in the file.

---

## Who opens it, and what it must not duplicate

Zero to two decks. The same window as the **"For you" cards** already on the dashboard Recent tab:
they render at 0, 1 and 2 decks and disappear at 3. Those cards already push invite a teammate,
brand kit, analytics, project knowledge and the API, each one click into the real feature.

```
      0 decks          1 deck           2 decks          3+ decks
   ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
   │ 3 cards   │    │ 2 cards   │    │ 1 card    │    │  nothing  │
   └───────────┘    └───────────┘    └───────────┘    └───────────┘
        the deck lives in this window and then stops mattering
```

Both surfaces now do the same thing, which is start a feature in one click. So the split is about
reach, not about kind:

| | The "For you" cards | This deck |
|---|---|---|
| Offers | five actions, flat, no order | ten, in the order you would actually do them |
| Gives | a line of reason each | the argument, and something to practise on |
| Survives | three decks | as long as they keep it |

**No slide repeats a card's copy.** Where they overlap the card is the shortcut and the slide is the
reason plus the rehearsal.

### The side effect to fix first

The card count is `3 - docCount`. This deck is a real editable document in the workspace, so a brand
new user opens the dashboard at **one** deck and sees **two** cards instead of three. Every new user
loses a recommended action the day this ships.

Since the deck has to be a real editable doc (see above), only one fix is left: **exclude the
starter deck from `docCount`.** It is not something the user made.

---

## The gating problem

Four of the brief's seven sections are paid, and this deck's whole audience is people who have not
made three decks. From the code:

| Slide | Feature | Plan | What a free user hits |
|---|---|---|---|
| 4 | Brand kit | Pro | Upgrade popup, `/brand-kit` gated by `brandKitGate` |
| 7 | Analytics | Paid | Coach tooltip on the editor overflow menu, no panel |
| 8 | Invite teammates | Pro | Invite upgrade popup |
| 8 | Save as, or use, a template | Pro+ | The `templates` upgrade trigger |

An action-led deck makes this sharper than a descriptive one would: the user does not read about a
locked feature, they **click into a paywall**. That is worse if it is a surprise and fine if the
slide has already paid for it.

So: **keep all four, and make the slide show the result before the action.** The reader should want
the thing by the time they click. And:

**No lock icons and no PRO badges anywhere in the deck.** A deck that badges itself stops being a
deck and becomes an ad, and it takes the other six slides down with it.

---

## The deck

```
 1 cover        2 the mess       3 five ways in   4 brand         5 edit by asking
 menu           the shift        getting in       make it yours   ON THIS DECK
   │                                  │               │                │
   └─ slide links                  ─ link out ─    ─ link out ─     ─ do it here ─

 6 remix        7 share + learn  8 your team      9 the loop      10 one thing
 ON THIS DECK   ON THIS DECK     link out         no action       new presentation
```

Slides 2 to 7 are the first hour. Slides 8 and 9 are the reason to come back. Slide 10 is the only
place the deck asks for a new deck.

---

### 1 · Cover

**Layout** Full bleed cover, brand kit applied.

| | |
|---|---|
| Setup | You are looking at a deck we made here, |
| Payoff | in about four minutes. |
| Subline | Here is how, and how to do it better than we did. |

**Action** None outbound. Instead, **five slide links** running down the side as a contents list, so
the deck is skimmable rather than linear. Someone who came for one thing can get to it. This is what
`gotoAndPlaySlide` is for and it costs no tab.

**Verify before shipping:** the four minutes has to be true for this deck, start to sendable. If it
is not defensible, cut to "You are looking at a deck we made here." and let the subline carry it.

**Name in the dashboard grid:** `Start here`. It sits in a grid next to "Untitled presentation", so
the name's only job is to say it is worth opening first.

---

### 2 · The mess

**Layout** Two column split. Left raw and monospaced, right clean and designed.

| | |
|---|---|
| Setup | Most tools want a finished outline. |
| Payoff | We would rather have your mess. |
| Body | Paste the notes you already have. We will find the structure in them, and you correct what we got wrong. |
| **Action** | **Try it with yours** → the create prompt, notes tab |

**What is on the slide.** The most persuasive image in the deck, so it gets the most attention:

- **Left.** Real notes. Lowercase, unpunctuated, a question left open, a number the writer is not
  sure about. If it reads like a well formed prompt the contrast dies and the slide is worthless.
- **Right.** The outline that came out of them, section titles readable at thumbnail size.

Write the notes to the standard in `feature-video-scripts/start-from-template-video-script.md`.
Specific, odd numbers. Round numbers read as placeholder.

---

### 3 · Five ways in

**Layout** Five tile grid, built from a real remix layout so the slide is also a demonstration of
the layout library.

| | |
|---|---|
| Headline | Start from whatever you have got. |

**Each tile is its own link.** Five actions on one slide breaks the one-action rule, and it is the
right place to break it: this slide *is* a menu, and its whole point is that the ways in are
parallel.

| Tile | Copy | Links to |
|---|---|---|
| A prompt | One line about the deck you want. Good when you are starting cold. | create prompt |
| An outline | Your section headings, in order. We fill them in. | create, outline tab |
| A PowerPoint | Bring an old deck. We rebuild it rather than re-skin it. | create, upload |
| Notes and documents | A brief, a transcript, a doc. Paste it or upload it. | create, notes |
| A template | Someone has already worked out what a good one covers. | template gallery |

**Verify:** "rebuild rather than re-skin" is the strongest line on the slide and the one most likely
to overpromise. Check what PPT import does today before it ships.

**Order.** Prompt first because it is the lowest effort, template last because it changes the
outcome most and last is what stays in the head.

---

### 4 · Brand

**Layout** One layout, rendered three times, side by side. Nothing else.

| | |
|---|---|
| Setup | Set your brand once. |
| Payoff | Every deck after this one arrives in it. |
| Body | Give us your website. We read your logo, your colors, your type and how you write, and you fix whatever we got wrong. |
| **Action** | **Point us at your website** → `/brand-kit` |

**What is on the slide.** The same slide in three brands. Recognisably the same slide, or the point
does not land. No editor UI, no color pickers, no upgrade prompt.

**The action's copy is the whole gate strategy.** "Point us at your website" describes ten seconds of
work with a visible payoff already on the slide. "Set up your brand kit" describes a chore. A free
user who hits the upgrade popup after the first one has seen what they are buying.

**Say voice out loud.** Logo and colors are what people expect a brand feature to mean. The kit also
holds brand voice, org info and a slide preference. Voice is the one nobody predicts, and the one
that keeps working after they stop thinking about design.

---

### 5 · Edit by asking

**Layout** One slide before, one slide after, the request between them.

| | |
|---|---|
| Headline | Tell us what is wrong with it. |
| Body | Select a slide and say what you want changed. |
| **Action** | **Try it on the next slide** → slide link to 6 |

Three real requests, shown as they would be typed:

```
cut this down to three points
make the tone less formal, it reads like a board paper
add a slide on pricing after this one
```

**The action is performed on this deck.** No tab, no new document, nothing to lose. The instruction
is literally "go to the next slide and change it", and if they do, they have used the feature inside
their first minute.

**The point the slide has to make:** it edits that slide in place. It does not regenerate the deck
and it does not undo work already done. That fear is exactly why people will not touch AI editing on
a deck they have invested in, so name it rather than implying it.

**Not "make it better".** A vague example teaches a vague habit and produces the result that makes
people stop trying.

---

### 6 · Remix

**Layout** One slide's content across six layouts, in a grid, readable in every one.

| | |
|---|---|
| Setup | The first layout is a suggestion. |
| Payoff | It is not the answer. |
| Body | Open Remix on any slide to see the same content laid out other ways. Pick one. Nothing you wrote is lost. |
| Footer | Need a slide that is not there? Insert one with a prompt and it arrives in your theme. |
| **Action** | **Remix this one** |

**This slide is the demonstration and the exercise at once**, which is the best thing in the deck.
It is also the slide slide 5 sent them to, so the two chain: change the words, then change the
shape, both on the same slide, both reversible.

**The content must be identical in all six panels.** That identity is the entire argument and it
only works if the reader can check it, which means the type stays readable. If it has to shrink to
fit, drop to four rather than shrinking.

The brief had "create a new slide with AI" as its own section. It is one line here, because it is
the same claim: the deck is not locked to what was generated.

---

### 7 · Share and learn

**Layout** A per-slide engagement strip across the full width, with one conclusion under it.

| | |
|---|---|
| Setup | Send a link instead of a file. |
| Payoff | Then find out what happened. |
| Body | You will see who opened it, how far they got, and which slides they stayed on. |
| **Action** | **Share this deck with someone** |

**What is on the slide.** A drop-off strip with one obvious spike and one obvious cliff, and a single
line reading it:

> Slide 6 lost half the room. That is the one to rewrite.

**That line is the slide.** A chart of view counts is a dashboard. A chart with the decision already
drawn out of it is the argument for why any of this matters, and it sets up slide 9.

**The action is unusually good and slightly strange.** Sharing the starter deck is a real share, it
produces real data, and by the time they come back there is something in the analytics panel. It
also means their first experience of analytics has actual numbers in it rather than zeroes, which is
the usual reason a new user never opens it twice. Worth checking with whoever owns analytics that a
share of the starter deck is not going to look like noise on our side.

---

### 8 · When your team joins

**Layout** The one list slide in the deck, so it had better be a good one.

| | |
|---|---|
| Headline | Work that outlives one deck. |
| **Action** | **Bring someone in** → invite |

| | |
|---|---|
| Invite your team | They edit, comment and reuse what you have already built. |
| One brand kit for everyone | Nobody has to ask what the hex was. |
| Save a deck as a template | The next person starts from your best one instead of a blank. |

**Two of the brief's sections compressed to three lines**, deliberately. Someone with zero decks does
not have a team problem yet. The job is to leave a shape in their head so that when the problem
arrives they know an answer exists. Full sections would push analytics past where anyone reads.

Only the first line gets the action. The other two are seeds.

---

### 9 · The loop

**Layout** A four step diagram, drawn as a real slide rather than an illustration dropped on one.

| | |
|---|---|
| Setup | A deck is not finished when you send it. |
| Payoff | It is finished when it works. |
| **Action** | None. This slide is the argument, and an action here would undercut it |

```
   make it  ──►  send it  ──►  see where it lost people  ──►  change those two slides
      ▲                                                                   │
      └───────────────────────────────────────────────────────────────────┘
```

The fourth step is specific on purpose. "Iterate" is advice nobody acts on. "Change those two
slides" is a task.

---

### 10 · One thing to do next

**Layout** Cover treatment again, closing the way it opened. One navy button.

| | |
|---|---|
| Headline | Start with the one you actually have to give this week. |
| Body | Paste your notes. We will take it from there. |
| **Action** | **New presentation** |

**One action.** Every extra link here costs the first one. No "explore templates", no "set up your
brand kit", no help centre. Those are what the rest of the dashboard is for, and eight slides have
already offered them.

---

## Where the brief went

| Brief section | Slide | Action it turned into |
|---|---|---|
| Types of inputs | 3 | five entry points, one per tile |
| Brand kits | 4 | point us at your website |
| Editing a deck, edit with AI | 5 | try it on the next slide |
| Creating a new slide with AI | 6, one line | folded into remix, same claim |
| Remix a slide | 6 | remix this one |
| Adding team members | 8, one line | bring someone in |
| Creating a template for your team | 8, one line | seed only, no action |
| Publishing, analytics, improving | 7 and 9 | share this deck |

The compression is all in the team half. Seven equal sections would put templates and analytics at
slides 15 and 18, past where anyone reads a deck they did not ask for.

---

## Copy decisions worth arguing about

- **Actions are verbs about the user's work, never about our features.** "Point us at your website",
  not "Set up your brand kit". "Try it on the next slide", not "Use AI editing". The feature name is
  what they will search for later; the verb is what gets them to click now.
- **"We" throughout**, per the voice guide, except slide 3's template tile. A template can be one the
  user's own team saved, so the authority belongs to the template. Same rule as the template video
  script.
- **No slide counts and no feature counts.** Counting turns a claim about quality into a claim about
  quantity, and quantity is what every competitor can also say.
- **No em dashes**, repo rule, every string on every slide.
- **Nothing on any slide says "AI".** The tool is not the point. What changed about their afternoon
  is the point.

---

## Open questions

1. **Does the dashboard tile open this deck in present mode?** Links do not fire in the editor, so
   without this the deck is a manual again. Everything else is negotiable; this is not.
2. **Same-tab handoff for internal links, or do we live with the new tab?** Affects the copy on
   slides 3, 4 and 8, so it wants deciding before final copy rather than after.
3. **Is the four minutes on slide 1 true?** Everything after it is evidence for that claim.
4. **Exclude the starter deck from `docCount`?** Otherwise every new user silently loses a "For you"
   card the day this ships.
5. **Who owns updating it?** Slides 3, 5, 6 and 7 show product UI, and the UI moves. A starter deck
   showing last quarter's editor is worse than no starter deck. This needs an owner and a review
   cadence, not just a build.
6. **Does it ship per role?** The "For you" cards branch across five role groups. Ten fixed slides is
   the cheap version, and whether it is the right one depends on how differently a sales user and a
   teacher read slides 7 and 8.
7. **What happens on the second open?** Someone who did four of the actions comes back to a deck that
   cannot tell. Nothing reads state back, so the deck repeats itself. Living with that is probably
   fine for v1, but it should be a decision.

---

## Related

- [grounding.md](grounding.html), where each feature lives in the code, the plan gates, the link
  mechanism, and the "For you" card catalog
- Pitch's onboarding deck, the reference for the action-led pattern (Mudita, 27 Aug 2026)
- `feature-video-scripts/start-from-template-video-script.md`, the writing standard for slide 2's
  notes and for the deck's copy
- `deck-analytics/analytics-v1-spec.md`, what slide 7 can honestly promise
- `brand-kit/brand-kit-spec-v2.md`, what slide 4 can honestly promise

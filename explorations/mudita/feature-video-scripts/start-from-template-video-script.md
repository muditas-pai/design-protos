# Start from a Template: first-fold video script

Hero video for the Start from a Template feature page. Screen recording, no face, no hands.
Written for muted autoplay and loop, so the on-screen text carries it. VO is for the long cut only.

Grounded in the JAS '26 handoff flow:
`figma.com/design/OywpgPNGvoFAIS4haGGehy/JAS--26---Handoff?node-id=1-2798`

**Claim the video lands:** the structure is already decided before you type anything.

## The real flow, as designed

```
1  Dashboard           prompt box + 4 quick actions, one is "Use a Template"
2  Select a template   full screen, search + 11 category tabs (Sales, Marketing,
                       Strategy, Education, Branding, Development, Customer Service,
                       Research, HR, Operations), grid of authored template cards
3  Template detail     lightbox: large slide preview + filmstrip of the deck's slides,
                       right panel with title, author, "Use this Template",
                       description, Preview / Export as PowerPoint, share row
4  Share your context  split screen. Left: "Share your own context, and we'll update
                       the template" + prompt box + Upload files or links + model
                       picker + Create Presentation. Right: the template's slides,
                       fully designed and fully populated with their own demo content
5  Context filled      same screen, the box holding an unstructured braindump.
                       Create Presentation goes live
6  Generating          "Letting it simmer… 33s" with a visible reasoning trace.
                       Right panel: slides under a loading shimmer
7  Editor              the finished deck
```

## The problem this script has to solve

Templates are never empty. They arrive fully designed and fully written with their own demo
content, so there is no "blank structure" moment anywhere in the product. The claim still has to
be *the structure is already decided*, which means the video has to find structure where it is
actually visible:

1. **The filmstrip in the detail lightbox (step 3).** The only place you can read what slides the
   deck contains before committing to it.
2. **The editor's slide rail (step 7).** Same slides, same order, now carrying your content. This
   is the proof, and it only works if the video has shown the spine earlier so the viewer can
   recognise it as unchanged.

Everything else in the flow is content, not structure. Those two shots carry the argument.

> **Design note worth raising separately.** In the current detail lightbox the filmstrip is small
> and cropped, so the slide titles are not readable. If the structure claim is the one marketing
> leads with, that panel probably needs a slide-outline list (titles, in order, scrollable) beside
> the thumbnails. Good for the video, and better for the feature: the outline is the reason to pick
> one template over another, and right now you cannot see it.

## Cast and set dressing

| | |
|---|---|
| Persona | Anika Bose, Marketing Lead |
| Her company | **Marlow**, a fictional cold brew coffee brand |
| The partner she is pitching | **Trailhead**, a fictional outdoor gear brand |
| Template she picks | **Co-Marketing Partnership Proposal**, Marketing tab, by Presentations.ai |
| Campaign in her notes | "The Early Start" |

Consumer brands are the right call for a 40 second hero: the overlap is legible in three seconds.
Keep the *content* rigorous (real audience numbers, a real value exchange) so it reads professional
rather than cute.

## The template's spine, visible in the filmstrip

These are the titles the camera scans at 0:09. They exist in the template before Anika types
anything, and they are still there, in this order, in the editor at 0:31.

| # | Slide | What her context turns it into |
|---|---|---|
| 1 | Cover | Marlow × Trailhead, Summer 2026 |
| 2 | Why this, why now | Trailhead's spring gear drop lands the week Marlow's cold brew season opens |
| 3 | **Audience overlap** | Marlow 1.4M, Trailhead 2.1M, roughly 380K shared |
| 4 | What we bring | 12K units capacity, in-house studio, 1.4M list |
| 5 | What you bring | 40 stores, 900K list, spring catalogue placement |
| 6 | The idea | The Early Start: first light, first mile, first cup |
| 7 | Deliverables and channels | Co-branded bundle, content series, joint emails, end cap |
| 8 | Timeline | Feb kickoff, Apr launch alongside the gear drop, Aug wrap |
| 9 | Success metrics | Bundle units, joint email CTR, new-to-file each side |
| 10 | **Value exchange** | No cash. In kind, roughly $180K media value each side |
| 11 | Precedent | Ridge Cycles, Sep 2025: 8.4K bundles, 22% new to Marlow |
| 12 | Next steps and owners | Legal three weeks, named owner each side |

Slide 3 is what makes this read as a partnership deck rather than a generic pitch. Slide 10 is the
one people forget and then get asked about in the meeting. Neither of them is in her notes.

## What she actually types

The braindump is the most important piece of writing in this video. It has to be visibly
unstructured, lowercase, with open questions still in it. The handoff mock does this well with its
travel example, so match that register:

```
ok trailhead partnership thoughts before i forget

their spring gear drop is apr 14, our cold brew season basically starts the
same week, feels too obvious not to do

audience, we're 1.4M monthly, they're 2.1M, overlap is maybe 380k? ask growth
for the real number

they have 40 stores and a 900k list which is the thing we actually want. we
have capacity (12k units) and the studio

idea: "the early start". 5am, first light, first mile, first cup. bundle is
their flask plus our beans

no cash either way, in kind, media value probably evens out around 180k each
side but finance needs to confirm

ridge cycles worked, 8.4k bundles in six weeks, 22% new to us, use that

legal will want 3 weeks so kickoff has to be feb

who owns this on their side? need a name before the meeting
```

Note what is missing from it: no timeline slide, no success metrics, no next steps. She never
thought about them. The template did. That gap is the whole video.

## Storyboard strip

```
┌─────────┐  ┌────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│dashboard│→ │gallery │→ │ FILMSTRIP│→ │braindump│→ │shimmer │→ │ EDITOR │→ │  end   │
│ use a   │  │Marketing│ │ the spine│  │ pasted  │  │ + trace│  │same 12 │  │  card  │
│template │  │  tab   │  │ readable │  │         │  │        │  │ slides │  │        │
└─────────┘  └────────┘  └──────────┘  └─────────┘  └────────┘  └────────┘  └────────┘
   0:00        0:03         0:07          0:14        0:22        0:26        0:36

            ── structure, before content ──   ──── your content, same structure ────
```

## Shot list, 40 second hero cut

| Time | On screen | Text on screen | VO (long cut) |
|---|---|---|---|
| **0:00 to 0:03** | Dashboard. Cursor goes past the prompt box to the quick actions row and clicks **Use a Template**. | | "You don't always want to start from a blank prompt." |
| **0:03 to 0:07** | Select a template. Category tabs visible, cursor taps **Marketing**. Grid reflows. Cursor lands on `Co-Marketing Partnership Proposal`. | | |
| **0:07 to 0:14** | **The structure shot.** Detail lightbox opens. Large slide preview left, right panel with description and `Use this Template`. Camera moves to the filmstrip and scrubs it, slide titles readable as they pass: *Audience overlap · What you bring · Value exchange · Next steps and owners.* Hold on the last one. | `Someone already worked out what goes in this deck.` | "Someone has already worked out what a partnership proposal needs to contain." |
| **0:14 to 0:22** | Click `Use this Template`. Split screen. Right side holds the template's slides, designed and populated. Left side: the headline `Share your own context, and we'll update the template`, and the braindump pastes in, scrolling as it grows. It is visibly a mess. `Create Presentation` turns navy. | `You only bring the mess.` | "You bring your side of it, in whatever state it's in." |
| **0:22 to 0:26** | Click. A loading shimmer sweeps across the slides on the right, a soft moving highlight over the blur rather than a static frost. Left side shows the trace: *Developing Presentation Outline · Refining Strategic Narrative · Analyzing Partnership Value.* `Letting it simmer… 33s`. | | |
| **0:26 to 0:31** | **Cut to the editor.** Slide rail on the left, twelve slides, same order as the filmstrip. Camera holds on the rail for a beat before touching the canvas. | `Same twelve slides.` | |
| **0:31 to 0:36** | Canvas scrolls to slide 10, **Value exchange**, filled: no cash, 12K units against retail space and list access, roughly $180K each side. The thing she never wrote down. | `Including the one you didn't think of.` | "Including the slides you'd have found out you were missing in the meeting." |
| **0:36 to 0:40** | Logo. CTA. | *You know your company.* **The template knows the deck.** | |

## The shot that can't be cut

**0:07 to 0:14, the filmstrip scrub.** It is the only moment in the entire product where the deck's
structure is visible before any of the user's content exists, so it is the only place the claim can
be made. If the titles are not readable at hero scale, the video is just another generation demo
and the feature reads as "AI writes a deck" rather than "the deck already knew its shape".

Its payoff at **0:26**, the editor rail, only works because of it. Show the rail for a full beat
before moving to the canvas. The viewer needs a moment to notice the count and the order did not
change.

## Production notes

- **Shimmer, don't freeze.** The loading state should read as work happening on the slides: a soft
  highlight sweeping across the blurred thumbnails, roughly one pass every 1.2s. A static blur
  reads as a broken image.
- **Do not cut to the editor early.** The shimmer beat is short (4s) but it has to exist, otherwise
  the transition reads as a scene change rather than the same deck arriving.
- **Match the filmstrip order to the editor rail exactly.** If a single slide moves between the two
  shots, the whole argument collapses. This is the one continuity error that matters.
- **The braindump must look typed by a person.** Lowercase, inconsistent punctuation, at least one
  unanswered question left in it. If it reads as a well-formed prompt, the contrast dies.
- **Show the category tabs long enough to register** (about a second on Marketing). They are what
  tells the viewer this is a library of deck types, not a library of colour schemes.
- **One CTA at the end**, navy filled. No exclamation marks in any on-screen text.
- Numbers on screen should be specific and odd (`8.4K bundles`, `roughly 380K`). Round numbers read
  as placeholder.
- Swap **Marlow** and **Trailhead** for whatever clears legal.

## Open dependencies

- The `Co-Marketing Partnership Proposal` template needs to exist in the Marketing tab, with these
  twelve slides. If the real gallery has no partnership template, either the template gets built or
  the video moves to one that does exist.
- The filmstrip needs readable slide titles at hero scale. See the design note above.

## How it pairs with Project Knowledge

```
Start from a Template   →   the deck's skeleton, decided before you type
Project Knowledge       →   the deck's content, drawn from your own files
```

The template guarantees nothing important is missing. Project Knowledge guarantees what fills it is
true. Together they cover the two ways a generated deck normally fails.

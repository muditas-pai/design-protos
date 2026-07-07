# Chat Flow — Loading State Labels

A catalogue of every loading/progress label shown while a presentation generates, as it
exists in production today (`pitchdeckdoclist`, `new_dev`). Written as a reference for
redesigning the loading experience — what the copy is, how it's grouped, whether it's
translated, and what drives its progression (real backend events vs. a fake timer).

There are **7 distinct loaders**. The Chat Flow proper is #1–#3 and #7; #4–#6 are the
adjacent create/regenerate loaders that share some of the same copy.

---

## The two mechanisms (keep these straight)

| Mechanism | Copy source | What advances it |
|---|---|---|
| **Cycling rotator** (chat flow) | `src/chat/loadingPhrases.js` → en.json `chat_*` keys | Pool switches on **real** stream stage events; phrase inside a pool rotates on a ~4.2s timer, shuffled |
| **Simulated timeline** (full-screen create) | `src/common/uicomponents/loader/ResearchSteps.js` — **hardcoded, untranslated** | Pure `setTimeout` — 10s per step, not backend-tied |

---

## 1. In-chat streaming header — planning / research / slides / final

The primary loader in `ChatFlowScreen`: spinner + one **cycling** label + a live count-up timer.

```
 planning ─────► research ─────► slides ─────► final
 "Planning        "Researching    "Designing     "Polishing..."
  your deck..."     ..."           outline..."

 done labels:
 "Plan ready"     "Research done" "Outline        "Your deck
                                   ready"          is ready"
```

Each stage is a **pool**: canonical label first, then flavour variants, then shared generics.

| Stage | Canonical → flavour variants |
|---|---|
| **planning** | Planning your deck… · Mulling over a few directions · Mapping it out · Sorting through what fits best · Working the angles · Lining things up |
| **research** | Researching… · Digging in · Pulling threads together · Picking up the patterns · Following up on a few leads · Working through the details now |
| **slides** | Designing outline… · Putting the pieces in place · Stitching this together · Building the flow · Plugging away at the details · Sharpening the message |
| **final** | Polishing… |

**Generics** (appended to every pool): On the right track · Pieces are clicking · Working
behind the scenes · Making steady progress on this · Letting it simmer · Thinking it over
**Fallback** (no stage yet): Thinking…

**Extra header micro-states** (between stages): `Generating arcs...` · `Processing...` · `Thinking...`

**Where it lives**
- Phrase pools: `src/chat/loadingPhrases.js` (lines 22–70) — `STAGE_PHRASES`, `GENERIC_PHRASES`, `FALLBACK_PHRASES`
- Canonical labels + render: `src/chat/components/ResearchProgress.jsx` (`STAGE_IN_PROGRESS`, lines 20–25; header states 58–62)
- Rotator: `src/chat/components/CyclingLabel.jsx` (fade-in 700ms + hold 3300ms + fade-out 180ms ≈ one phrase / ~4.2s; Fisher-Yates shuffled once per pool)
- Stage transitions: `src/chat/ChatFlowScreen.jsx` (`researchStage` state, line 229; planning @1468, research @2898/3053, slides @1507/3142)

**Translation:** all strings from en.json via `LanguageHelper`, hardcoded string as fallback.
Keys: `chat_stage_{planning|research|slides|final}`, `chat_phrase_{planning|research|slides|generic}_N`,
`chat_status_thinking`, `chat_stage_*_done`. (en.json ~lines 6229–6231, 6415–6418, 6886–6910)

---

## 2. In-chat outline phase

`src/chat/components/MessageBubble.jsx` — while the outline streams, reuses the **slides**
pool (lines 373–378). Done label: **Outline ready** (`chat_stage_slides_done`, line 342).

Done-state keys: `chat_stage_planning_done` = "Plan ready" · `chat_stage_research_done` =
"Research done" · `chat_stage_slides_done` = "Outline ready" · `chat_stage_final_done` =
"Your deck is ready".

---

## 3. In-chat detailed step timeline (hardcoded, tied to real tool events — no timer)

When the expandable step list appears, the rotator **pauses** and these show instead
(`src/chat/components/ResearchStepRow.jsx`, lines 12–15, 47). **Not translated.**

- **Analyzing content** (`analyze_content`) · **Thinking** (`thinking`) · **Building slides**
  (`extract_slide`) · **Searching** (default) · grouped parent **Thinking & searching**

---

## 4. CreationBottomLoader — fresh deck creation (fast-editor create)

`src/editor/core/view/editor/fasteditor/CreationBottomLoader.jsx` — compact bottom progress pill.

- **Phase A (warm-up):** reuses `STAGE_PHRASES.slides` as warm-up, fallback "Designing your
  deck". **Timed** rotation every 2200ms; bar creeps 0→5%.
- **Phase B (rendering):** **Designing slide {n} of {total}** (`designingslideprogress`) —
  advances on real `slideRendered` events.

---

## 5. FastEditorLoader — regenerate / fast-editor panel

`src/editor/core/view/editor/fasteditor/FastEditorLoader.jsx` — a 3-row checklist. All strings
from `fasteditor_copy_*` keys. **Driven by real backend events** (`EVENT_FAST_EDITOR_LOADER`
payloads: PREPARING → RENDERING → FINALIZING), not a timer.

**Create wording:** Preparing your slides… · Generating slide content… · Rendering slide {n}
of {total}… · Rendered {total} slides… · Finalizing your deck…
**Refine/regenerate wording:** Reading… · Updating content… · Regenerating slide {n} of
{total}… · Regenerated {total} slides… · Finalizing your deck…
**Awaiting-suggestions checklist:** Checking tone and narrative options… · Checking pacing and
flow… · Drafting suggestions for you…

---

## 6. Full-screen ResearchLoader — idea-to-deck create flow ("the fake loader")

`src/common/uicomponents/loader/ResearchLoader.jsx`, labels in
`src/common/uicomponents/loader/ResearchSteps.js`. **16 steps, each with in-progress /
completed wording, ALL HARDCODED (no en.json). Pure timer — 10s per step, not backend-tied.**

| # | In progress | Completed |
|---|---|---|
| 1 | Analysing the topic | Analysed the topic |
| 2 | Understanding the context | Understood the context |
| 3 | Researching relevant background | Researched relevant background |
| 4 | Consolidating information | Consolidated information |
| 5 | Planning the presentation outline | Planned the presentation outline |
| 6 | Identifying gaps and missing data | Identified gaps and missing data |
| 7 | Analysing new information | Analysed new information *(conditional — only when "Key details" asked)* |
| 8 | Shaping slide layouts | Shaped slide layouts |
| 9 | Sketching diagrams | Sketched diagrams |
| 10 | Styling content blocks | Styled content blocks |
| 11 | Picking icons | Picked icons |
| 12 | Generating visuals | Generated visuals |
| 13 | Charting the numbers | Charted the numbers |
| 14 | Refining the copy | Refined the copy |
| 15 | Adding motion | Added motion |
| 16 | Finalising the slide | Finalised the slide |

**Phase groupings:** `researchSteps` = 1–6 · `editorStepsForLoader` = 8–16 ·
`editorStepsWithMetrics` = 7 + 8–16 · `stepsWithoutConditional` = 1–6 + 8–16.
Timing: `STEP_DURATION = 10000` (10s/step), `STREAMING_START = 4000` (summary streams after 4s).

---

## 7. PPTX-import chat flow (separate create path)

`src/chat/PptxImportChatFlow.jsx` — all from `pptimport_*` keys. Upload/analyze rows driven by
real status; the build-step list is a static checklist.

- **Uploading your content…** → Uploaded…
- **Analyzing your content…** → Analyzed your content
- Build bubble **Building your presentation**, 4 steps: Reading your deck · Applying the chosen
  theme · Preparing slide generation · Loading the editor

---

## Where the copy lives (quick map)

```
src/chat/loadingPhrases.js ........... cycling chat-flow phrases   → en.json chat_*
src/chat/components/ResearchProgress.jsx  canonical stage labels + header states
src/chat/components/CyclingLabel.jsx ..... the ~4.2s rotator
src/chat/components/MessageBubble.jsx .... outline-phase label + done states
src/chat/components/ResearchStepRow.jsx .. detailed timeline headings (hardcoded)
src/chat/PptxImportChatFlow.jsx .......... pptx-import copy         → en.json pptimport_*
fasteditor/CreationBottomLoader.jsx ...... fresh-create bottom pill
fasteditor/FastEditorLoader.jsx .......... regenerate checklist     → en.json fasteditor_copy_*
loader/ResearchSteps.js .................. full-screen 16-step timeline (hardcoded, fake timer)
```

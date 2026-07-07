# Chat Flow — Loading States

Reference for the loading-experience redesign: the two loading mechanisms in the create /
chat flow, and the full label set of the full-screen ResearchLoader.

---

## The two mechanisms (keep these straight)

| Mechanism | Copy source | What advances it |
|---|---|---|
| **Cycling rotator** (chat flow) | `src/chat/loadingPhrases.js` → en.json `chat_*` keys | Pool switches on **real** stream stage events; phrase inside a pool rotates on a ~4.2s timer, shuffled |
| **Simulated timeline** (full-screen create) | `src/common/uicomponents/loader/ResearchSteps.js` — **hardcoded, untranslated** | Pure `setTimeout` — 10s per step, not backend-tied |

---

## Full-screen ResearchLoader — the 16 steps

The "idea-to-deck" create loader. Labels in `src/common/uicomponents/loader/ResearchSteps.js`,
rendered by `src/common/uicomponents/loader/ResearchLoader.jsx`. Every step has an in-progress
and a completed label. **All hardcoded — no en.json. Pure timer: 10s per step, not tied to
backend progress** (`STEP_DURATION = 10000`; summary text streams after `STREAMING_START = 4000`).

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

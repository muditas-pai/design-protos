# grounding — onboarding-role-in-chat

Remove the **upfront role step**; land the new user straight on the prompt screen. Capture
profile data (**designation**, and optionally **work email**) **softly, inside the chat flow,
while the deck generates** — an incentivised "tailor this deck · get 50 credits" callout, NOT a
mandatory wall. Goal: fastest path to the deck; ask for enrichment where it's justified and skippable.

## The change, in one line

```
BEFORE:  signup → /role (pick role → creates workspace + onboarded) → /create (prompt) → /create/chat (generate)
AFTER:   signup → (silent: create workspace + onboarded, NO role) → /create (prompt) → /create/chat → [generate + soft designation/email capture, concurrent]
```

## Why this shape (the role analysis that drove it)

Tracing `creatorRole` into the microservices pipeline showed role is a **minor tonal input**, not a
structural one: the outline prompt itself says "use as minor context for tone and framing, but topic
drives the content" (`control.txt:93`). The only hard branch is model routing for `student`, and
unknown-role users still ride the premium path. So a **hard gate before generation buys almost
nothing in deck quality** — which is why this pivoted from "mandatory role gate" to "soft concurrent
capture." Whether role/designation is even worth asking is derivable for free from the outline pass,
which already returns `targetAudience` + industry/use-case `tags`.

## The pattern (from Figma — AMJ-26 Handoff, node 2359-3484)

Soft, inline, credit-incentivised asks that sit in the chat timeline *during* generation, styled like
the existing "Get notified" card:

- **Work email** — "Share your work email · Get 50 credits after verification" → email + Submit.
- **Designation** — "Meanwhile, tailor this deck to your designation · Get 50 credits" → searchable
  dropdown → collapses to the picked title (e.g. "Chief Marketing Officer (CMO)").
- Sequenced one at a time (email → designation), only shown when the profile lacks that field.
  This mirrors the `new_designation_flow` branch's reward-ask sequencing already in `ChatFlowScreen`.

## Decisions locked with the designer (Mudita)

- **Build independently** of `new_designation_flow` (we still lift its `getDesignationOptions(role)`
  helper — a clean standalone export, not a collision point).
- **Prompt screen replicated exactly** as it exists in `new_dev` right now (title, Upload Files /
  Slide Count / AI Model / gear toolbar, dark-ringed prompt box, "Leaders are creating presentations
  for" + 3 suggestion rows).
- **Soft concurrent capture, not a hard gate** — generation starts immediately; the designation
  (and work-email) asks appear inline while it streams, and are skippable.
- Role-specific prompt cards on the landing are **acceptable to keep generic** since we don't know
  role at that point (the proto keeps the new_dev leadership examples verbatim).

## Open question for the designer

- The Figma pattern captures **designation + work email**, not role. Do we still want to capture
  **role** anywhere (designation largely implies it), or does designation replace it? Currently the
  proto captures designation + email only.

## Source (production, `pitchdeckdoclist`)

- `src/listing/core/screens/createflowv2/RoleSelectionScreen.jsx` — the upfront `/role` step we're
  removing. Note: it currently does `createWorkspace()` + `updateUserProfile()` + sets `onboarded`.
- `src/pai/App.jsx` — `loadProfile` else-branch (`navigate("/role")`, ~line 1108) is the redirect to
  replace; router hard-gates `!onboarded && !workspace` to only `/start` + `/role`.
- `src/chat/OnboardChatFlowScreen.jsx` + `src/chat/components/OnboardLandingUI.jsx` — the `/create`
  prompt landing. `OnboardLandingUI` already defaults role to `"leadership"` when empty, so generic
  prompts don't break.
- `src/chat/ChatFlowScreen.jsx` — **already has the in-chat role machinery**: `needsRolePick`,
  `creatorRole`, `resumeAfterRole`, `handleAssumptionsConfirm`. The gate reuses this; we just make
  it a dedicated, mandatory, pre-generation step instead of bundled into the assumptions card.
- `onboardingData.js` — `roleOptions` (role cards) + `getDesignationOptions(role)` (on
  `new_designation_flow`; role-aware designation list, role-matched titles first).

## The real risk (flagged, not yet solved in the proto)

**Workspace creation + `onboarded` are coupled to the role step today.** Removing `/role` means a
new user has no workspace and can't reach `/create`. The real implementation must auto-create a
default workspace + set `onboarded` silently on first login (also relocates the 48hr free-trial-block
flag currently set at role selection). The proto skips this plumbing and demos the UX only.

## Notes / decisions

- The gate is the hero of the proto: it should read as "one quick thing to tailor your deck", not a
  wall. Role cards reuse the `/role` card style; designation is a searchable field that surfaces
  role-matched titles first and is clearly skippable.
- Navy `#0A1925` = the Continue action. Continue is disabled until a role is picked.

## TODO

- [ ] Validate the gate interaction with the designer.
- [ ] Real impl: decouple workspace/onboarded bootstrap from role (biggest task).
- [ ] Real impl: generic prompt set for the landing when role is unknown.

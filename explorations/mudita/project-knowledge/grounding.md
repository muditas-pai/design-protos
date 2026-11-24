# Project knowledge: grounding

Volatile reference for this folder. Written 24 Nov 2026; it ages with the code.

## Sources the replicas were rebuilt from

Rebuilt from source, not screenshots (the browser window couldn't be captured). Compare against
https://app.presentations.ai before trusting pixel details.

| Screen | Repo · branch | Files |
| --- | --- | --- |
| Project page | pitchdeckdoclist · `new_dev_migration` (18 Nov 2026) | `src/listing/core/screens/views/dashboard/project/ProjectDashboard.jsx` |
| Knowledge panel | same | `.../project/ProjectsKnowledge.jsx` (redesign branch, not the legacy panel), `ProjectInstructionsPopup.jsx` (approximated) |
| Data sources + Add connector | pitchdeckdoclist · `add-connector-modal-polish` (PR #6872) | `src/listing/core/screens/views/settings/datasources/*` |
| Tokens | `new_dev_migration` | `config/tailwind/pai.tailwind.config.js` (light theme only, inlined in each proto) |

The protos inline these redesign tokens rather than using `design-system/`, which is the older snapshot.
Icons are Phosphor; the app uses Heroicons outline. Connector logos come from simpleicons.org, with
initials when a logo is missing (as `AppLogo.jsx` does).

## How the live panel behaves today (what v1 reacts to)

- File rows show only text: `Uploading…`, then `Processing…`, then `{size} · Added {time}`. No progress, no success moment.
- Reading a file takes about 90 to 100 s for small text and longer for PDF/PPTX. The client polls `getStatus` every 7 s for up to 10 min.
- Section headings say "Add instructions" / "Add files" even when they're filled.
- The project page's Project knowledge button looks the same whether the project has knowledge or not.
- Knowledge is Gold/Team only (`handleProjectKnowledge` shows the upgrade trigger otherwise). v1 assumes a Gold workspace.

## Open questions for v1

- **Whose connectors?** Data sources today are per user ("only for you"). The ask says workspace. v1's copy
  avoids saying either ("Apps you've connected in Data sources"). Needs a product call: if they're per user,
  a shared project reads different apps for different teammates.
- **Do connectors count as "set up"?** v1 says no: since they're on by default, the page keeps prompting for
  instructions and files until one is added, and lists the apps already on.
- **Per-project off state** needs a backend field (e.g. `disabled_toolkits` on the project knowledge record).
- **New connection from the panel** also lands in Data sources, turned on for this project only (other projects get it on by default anyway).
- An Expired connector keeps its on/off choice but can't be used until reconnected.

## v2 decisions (24 Nov 2026)

- The header "Project knowledge" button is gone; the card is the only entry point. Each tile opens the modal on its tab; Manage opens the first tab that needs attention.
- The card always shows, in three states: empty project (no knowledge, no decks), knowledge but no decks, knowledge and decks ("used in N decks", and a "Used knowledge" note on those deck cards).
- Workspace connectors don't make a project "set up". Instructions, files, or a project-only connector do.
- Connectors in the modal: "This project only" (added here, removable, not added to Data sources) and "From your workspace" (switch per app, on by default).
- Instructions are edited inline in the modal, with an explicit Save. No nested dialog.
- Needs backend: project-scoped connections (today Composio connections are per user), and "which decks used knowledge".

## Connector sync (24 Nov 2026)

- Live behaviour (from Mudita): a new connection fetches the last 30 days in seconds, then backfills the full
  history (often 3 to 4 years) over 2 to 3 hours.
- v2 shows three phases: "Getting the last 30 days" (spinner) → "Ready with the last 30 days · older data syncing"
  (a timeline bar, oldest date on the left and Today on the right, filling leftward, with "Synced back to <month year>"
  and a rough time left) → "All data synced, back to <month year>" (green, settles after a few seconds).
- The card's Connectors tile shows a spinner next to a syncing app and swaps its footnote for the sync bar.
- Demo compresses the history sync to ~45 s; time left is computed against ~2.5 hours.
- Needs backend: per-connection sync phase, oldest date available, oldest date synced so far, and an estimate.

## TODO

- [ ] Dark theme pass
- [ ] Mobile: the panel goes full-screen and the page summary row wraps
- [ ] Decide whether the summary row should hide when the panel is open

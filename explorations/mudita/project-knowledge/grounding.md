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

## TODO

- [ ] Dark theme pass
- [ ] Mobile: the panel goes full-screen and the page summary row wraps
- [ ] Decide whether the summary row should hide when the panel is open

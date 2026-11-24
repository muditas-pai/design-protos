# Connector retrieval: grounding

Volatile reference for this folder. Written 24 Nov 2026; it ages with the code.

## What exists today

`pitchdeckdoclist` (`new_dev_migration`):

- `src/chat/components/ConnectAppsButton.jsx`: the composer's connected-apps button. Logos, a menu with a switch per
  app ("Use for this deck"), "Connect another app". Sends `settings.connectedSources` (`all` / `scope` / `off`).
- `src/chat/components/ConnectedSourcesCard.jsx`: the ask after the search (`sources_input`). One AI brief across all
  apps (key facts, what stands out, next steps, gaps), a Switch per source with a short preview and material chips,
  and the buttons "Use this data", "Continue with prompt only" and "Connect another app".
- The search trail strings (`chat_conn_trail_*`): "Opening “{name}”", "Read “{name}”", "Found {n} records", "Nothing matched".

The shell was measured from the live app (https://app.presentations.ai/#/create, logged in, 24 Nov 2026):

| Element | Live value |
| --- | --- |
| Font | system stack (`-apple-system, system-ui, "Segoe UI"…`), not Inter |
| Page | grey surface, 56px header with border; back arrow, "Auto · 10 credits a slide" pill, theme and close icons |
| Prompt screen | "Describe your deck, or upload a file"; composer 800px, 12px radius, toolbar: +, Connected apps, Design, Options, mic, blue send |
| Connected apps menu | "USE FOR THIS DECK", logo + name + switch per app, divider, blue "+ Connect another app" |
| Chat column | 752px; user bubble `rounded-card bg-app-50 px-4 py-3`, 14px text; no assistant avatar |
| Reasoning | "Thought for Ns ›"; while running, a blue spinner status line and "• Searching Google Drive ⌄" with grey sub-bullets |
| Ask card (docked) | 744px, `rounded-card border shadow-menu px-2.5 pb-2.5 pt-2`; title row `min-h-[48px] pl-3 pr-1 pt-2 pb-3`, 16px medium, 28px close X |

## App rules the proto follows (from Mudita, 24 Nov 2026)

- The chat never shows a free text field.
- Ask cards are always fixed to the bottom of the screen, at a fixed height, scrolling inside, with their buttons
  always in view. They never sit inline in the message list.

## What this proto changes

| Today | Proto |
| --- | --- |
| One brief across every app | One summary per connector, in an accordion under that connector |
| Material chips | The files/pages we read, listed by name with type icons |
| Switch per source | Checkbox per connector, ticked by default |
| "Use this data" / "Continue with prompt only" / "Connect another app" | **Continue** (primary) / **Don't use this information** (secondary) / **Add a new connector** (ghost, left) |
| Apps with nothing found | Shown greyed, "Nothing relevant to this deck", can't be ticked |
| Trail stays expanded | Folds to "Searched 3 apps · read 5 files" once the card appears |

Add a new connector: catalog dialog → connect → the card gains a row "Connected. Getting the last 30 days" →
"Looking for anything about Fresh Bites" → results appear ticked, summary open, with "last 30 days only, older data
still syncing" (ties to the history backfill in `explorations/mudita/project-knowledge/`).

## Example content (fictional)

Pawly, a pet care brand, launching Fresh Bites dental chews. Connected: Google Drive (3 files), Notion (2 pages),
HubSpot (nothing relevant). Added during the flow: Google Analytics (2 reports, last 30 days).

## Open questions

- Should the summary accordion start open for the first connector? (Proto: closed, except a newly added one.)
- Does "Continue with 1 of 2" help, or is plain "Continue" enough?
- Where do project connectors (project-knowledge v2) meet this? A project deck would start with the project's connectors on.

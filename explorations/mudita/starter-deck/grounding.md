# Starter deck, grounding

**Type:** Shared grounding for this folder, reference, **not** source of truth · **Owner:** Mudita · **Updated:** 27 Aug 2026

Context for the starter-deck work: how each feature the deck touches maps to today's
`pitchdeckdoclist` code, which plan gates each one sits behind, and what a slide can mechanically
do. It **ages with the code**. True when written, verify before relying on it.

---

## Can a slide trigger an action?

Yes, with three limits. Read 27 Aug 2026 from `editor/core/view/present/PresentScreen.jsx`
(the click handler around line 1555) and `editor/core/history/SelectedTextStyleChangeOperation.js`.

A link is stored on the element as either an `href` or a `data-navigate-to-slide-on-click`
attribute. In present mode the click handler walks up from the click target and does one of two
things with the value:

```
   click on slide
        │
        ├─ closest("a") has an href, and isValidUrl  ──►  window.open(link, "_blank")
        │
        └─ walk up looking for data-navigate-to-slide-on-click
                 │
                 ├─ value is a URL      ──►  window.open(value, "_blank")
                 └─ value is not a URL  ──►  gotoAndPlaySlide(value)
```

| Limit | Detail |
|---|---|
| **Present mode only** | The handler lives in `PresentScreen`. In the editor a link is something the floater edits (`FloaterPropertyUtils` reads the same attribute back), not something that fires. A deck opened from the dashboard grid lands in the editor, so a tutorial deck has to be opened in present mode or none of it works |
| **Outbound links open a new tab** | `_blank`, always. The deck is left behind in the tab you came from |
| **No state read-back** | Nothing on a slide can know whether the action was taken. A slide cannot grey itself out once a brand kit exists |

Settable on text (`selectedtextlink` / `selectedtextlinkslide`), on a background image
(`BgimagePropertyChangeOperation`), on layout text (`SelectedLayoutTextStyleChangeOperation`), on a
title (`TitlePattern`) and on chart items (`ResponsiveChartUtils`). There is no button element on a
slide, so a call to action is a styled text run.

**Precedent for a same-tab handoff:** the "For you" cards already deep-link through `localStorage`
keys (`analyticsdeeplink`, written by `RecommendedNextSteps`, consumed by the editor `TopMenu`;
`improvedeeplink` follows the same pattern). A slide link of that shape would be an addition to an
existing mechanism rather than a new one.

---

## The surface this competes with

`listing/core/screens/views/dashboard/dashboardprompt/` holds the **"For you" cards**, the shipped
recommended-next-steps thumbnails that render as cells inside the Recent-tab document grid.

- **How many:** the first `3 - docCount` entries of the user's role-group list. 0 docs gives 3
  cards, 1 gives 2, 2 gives 1, 3 or more gives none. Purely `docCount` driven, no consume or
  replacement concept.
- **Which:** a direct lookup of `GROUP_CARDS[roleGroup][docCount]`. The 1-doc and 2-doc columns are
  hand-picked per cell, **not** slices of the 0-doc column. Deriving one from another has shipped a
  bug once already.
- **Role groups:** five, from `getRoleGroup`. `core_creation` (also the unknown default),
  `client_audience`, `data_reporting`, `product_technical`, `brand_campaign`.

The catalog, with the shipped descriptions, since the deck must not repeat them:

| id | Description in `en.json` | Click goes to |
|---|---|---|
| `invite_teammate` | Bring teammates in to edit, comment, and reuse your presentations. | `InviteMemberPopup`, free plan gets the invite upgrade popup |
| `setup_knowledge` | Organize your presentation and add knowledge files to keep everything in one place. | Create-a-project popup, then `/folders/<id>`. Gold gated |
| `analytics` | Track views to discover your best-performing slides. | Deck picker, then the deck with `analyticsdeeplink` set. Paid opens the panel, free gets a coach tooltip |
| `brand_kit` | Incorporate your logo, colors, and voice. Every deck will be on-brand. | `/brand-kit`, free plan gets the Brand Kit upgrade popup |
| `build_api` | Create presentations using your own tools via REST API or MCP. | `/settings/developerconsole` |
| `adjust_audience` | Adapt one presentation for executives, customers, or a new market. | **Parked 2026-07-22.** No `GROUP_CARDS` column lists the id, so it never renders. Flow kept intact |

**The `docCount` collision.** A starter deck that exists as a real document in the workspace makes
`docCount` 1 on day one, so a brand new user sees two cards instead of three. Whatever else is
decided, this needs handling.

---

## Plan gates on the features the deck covers

| Feature | Gate | Where |
|---|---|---|
| Brand kit | **Pro**. `isBrandKitLocked()` is `workspaceIsFreePlan` | `listing/core/util/brandKitGate.js`, shared by the side panel, the create-flow selector and the `/brand-kit` route |
| Project knowledge | **Gold** (`isWorkspaceGoldPlan` or `apilevel3`) | `RecommendedNextSteps.isGoldEntitled` |
| Analytics panel | **Paid**. Free gets a coach tooltip on the editor overflow menu | `TopMenu`, via the `analyticsdeeplink` key |
| Invite a teammate | **Pro** | `InviteMemberPopup`, free gets the invite upgrade popup |
| Use a template, refresh with context | **Pro+**, plus free-trial and trial-expired checks | the `templates` upgrade trigger |
| Viewer role | Cannot start create flows at all, has to request full access | `blockedForViewer` in `RecommendedNextSteps` |

---

## What the features actually are

**Brand kit.** `listing/core/screens/views/dashboard/brandkit/`. `BrandKitEditor` renders the merged
analyze result in editable sections: **brand voice, slide preference, typography and color, logos,
org info, images**. The kit object (`brandKitStorage.buildBrandKit`) carries `company_name`,
`about`, `industry`, `brand_voice`, colors, logos, fonts, plus raw company facts from `getCompany`.
Logos are themed (`light` / `dark`) and can be named `icon`. Voice traits are chips with a
confidence score that is tracked but currently hidden in the UI, including negative groups (who we
are not, words we avoid). The create-prompt strip (`chat/components/CreatePromptBrandKitBar.jsx`)
puts a "For {brand}" dropdown plus an on/off toggle at the top of the prompt box, so a kit is chosen
at generation time.

**Remix.** A side panel of layout variations for the current slide, `SIDE_REMIX_PANEL_WIDTH` 500 and
`PREVIEW_REMIX_PANEL_WIDTH` 296 in `AppConstant`. Menus are assembled in
`MenuParser.getRemixMenu` / `getRemixMenuShapes`, filtered by node count so a variation that cannot
hold the slide's content is not offered. Also reachable per slide from the thumbnail list
(`WorkspaceSlideThumbnailListItem`, the "remix" button).

**In-editor discovery.** `src/nudge/config/nudges.json` already defines a nudge catalog covering
Insert Objects, Insert Slide, Remix ("Explore slide variations", "Regenerate single slide"), Theme
(Design, Colors, Font, Mood / style selector, Layout variations) and inline text edits. Editor
mechanics are therefore already being taught in place. The deck should not compete with that layer;
its job is the arc those mechanics sit inside.

**Templates and refresh.** The template flow lives in `listing/core/screens/templateflow/`; the
server detects per slide which parts are data and which are narrative
(`POST /docs/pra/refreshtype`). `RefreshEditorApp` → `TemplateDataInputScreen` is the "Share your own
context" screen, and it mints a **new** deck rather than opening the source one.

**Save as template.** One entry point, `editor/core/view/editor/workspace/topmenu/TopMenu.jsx`.

**Analytics.** Not in this repo as a shipped panel; the design lives in
`explorations/mudita/deck-analytics/`. Model decided 21 Jul 2026: one deck, one tracked link,
deck-level aggregation (the Gamma model, chosen over Pitch's per-link). Check that spec before
promising anything on slide 7.

---

## Reference material

The **Pitch onboarding deck** Mudita raised on 27 Aug 2026 is the closest external reference for the
action-led pattern:
`https://app.pitch.com/app/presentation/c1783bd5-3208-4670-871f-8b4439482e77/c6f50749-bf38-401b-9456-51369f70cd23/b9021a31-9575-4993-809d-da1635e81bcc`

**Not yet read into this grounding.** It is a workspace URL behind Pitch login, so it could not be
fetched. Slide-by-slide notes still to be added by hand: what each slide asks the reader to do,
whether the action happens in the deck or leaves it, and whether anything tracks completion.

---

## TODO

- [ ] Read the Pitch deck properly and write up its slide-by-slide actions here
- [ ] Confirm whether the dashboard can open a deck straight into present mode
- [ ] Confirm what PPT import actually does, so slide 3's "rebuild rather than re-skin" is honest
- [ ] Time this deck end to end, so slide 1's "about four minutes" is defensible
- [ ] Ask analytics whether starter-deck shares will pollute real data
- [ ] Decide the `docCount` exclusion

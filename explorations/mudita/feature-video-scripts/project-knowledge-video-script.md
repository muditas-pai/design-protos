# Project Knowledge: first-fold video script

Hero video for the Project Knowledge feature page. Screen recording, no face, no hands.
Written for muted autoplay and loop, so the on-screen text carries it. VO is for the long cut only.

**Premise:** you teach a Project once, and every deck inside it knows your company.

**Why a sales scenario:** an AE builds one of these weekly, so the setup cost pays back visibly.
Pricing, battlecards, win/loss notes and case study numbers are also exactly the things a
web-searching AI gets confidently wrong, which is the argument the feature needs to make.

## Cast and set dressing

| | |
|---|---|
| Persona | Maya Reddy, Enterprise AE |
| Her company | **Rivet**, a fictional workforce/dispatch ops SaaS |
| The Project | `Enterprise Sales 2026` |
| The deck she makes | First-call deck for **Calderon Logistics** (3PL, 400 drivers, multi-site) |
| The deck already in there | `Brightline Freight, first call` (does the reuse work, silently) |
| Competitor in play | **Northgate** |

### The files she drags into the Project's Knowledge

```
Rivet_Master_Pitch_v14_FINAL.pdf
Q3-2026_Pricing_and_Packaging.xlsx
Competitive_Battlecards_Rev9.pptx
Case_Study_Ridgeline-Foods.pdf
Win-Loss_Notes_H1-2026.docx
Security_and_Compliance_SOC2.pdf
Product_Roadmap_H2-2026.pdf
Rivet_Brand_Guidelines_2026.pdf
```

Keep `v14_FINAL` and `Rev9`. The version-suffix mess is the detail that makes a sales viewer
recognise their own folder.

## Storyboard strip

```
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│  new   │→ │ 8 files│→ │ graph  │→ │ prompt │→ │  deck  │→ │ SOURCE │→ │ 2 decks│
│project │  │ dropped│  │ forms  │  │ typed  │  │ builds │  │  chip  │  │ 1 base │
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘
  0:00        0:03        0:07        0:12        0:16        0:22        0:31

  ──── build the Project's knowledge ────    ──── spend it, and prove it ────
```

## Shot list, 40 second hero cut

| Time | On screen | Text on screen | VO (long cut) |
|---|---|---|---|
| **0:00 to 0:03** | Projects sidebar. `+ New Project`, name types itself: `Enterprise Sales 2026`. Empty **Knowledge** tab, dashed drop zone. | | "Start a project." |
| **0:03 to 0:07** | Finder over the top, folder `Sales Enablement`. Cmd-A, drag all 8 files, drop into Knowledge. Chips land, each ticking `Reading… → 214 facts`, in parallel. | | "Give it everything your team already sells with." |
| **0:07 to 0:12** | Chips dissolve into the graph. Nodes carry real labels, not blobs: `Scale tier, $18/driver/mo` · `Objection: 6-week rollout` · `Proof: 31% fewer missed SLAs` · `Northgate, weak on multi-site`. Edges draw between them. Knowledge tab settles to `8 sources · 1,640 facts`. | `Teach the project once.` | "It gets read, connected, and kept." |
| **0:12 to 0:16** | Still inside the Project. `+ New presentation`. Prompt types itself: *"First-call deck for Calderon Logistics, 3PL, 400 drivers, multi-site. Evaluating Northgate. Lead with the Ridgeline results."* A persistent chip below the prompt reads `Using: Enterprise Sales 2026`. | | "Then just ask." |
| **0:16 to 0:22** | Deck builds in sequence: *What we heard · The cost of missed SLAs · Ridgeline Foods · Rivet vs Northgate · Scale tier and 6-week rollout · Next steps.* On brand, because the brand guidelines were in the folder. | | "It builds from your material, in your brand." |
| **0:22 to 0:27** | **The payoff.** Cursor hovers the headline stat on the Ridgeline slide, `31% fewer missed SLAs in 90 days`. Citation chip opens: `Case_Study_Ridgeline-Foods.pdf · p.3`. | `Not scraped. Sourced.` | "Every claim traces to a file you approved." |
| **0:27 to 0:31** | Cursor moves to the pricing slide, hovers `$18 / driver / month, Scale`. Chip: `Q3-2026_Pricing_and_Packaging.xlsx › Scale tier`. Hold a beat. | `The internet doesn't know your Q3 pricing.` | "Which matters most where public information was never going to be right." |
| **0:31 to 0:36** | Pull back to the Project view. Two decks side by side, `Calderon Logistics` (new) and `Brightline Freight` (already there), with `Knowledge · 8 sources` pinned above both. Sidebar shows a second project, `Investor Materials`, with its own separate knowledge count. | | "Set it up once. Every deck in the project inherits it." |
| **0:36 to 0:40** | Logo. CTA. | *One setup.* **Every deck after.** | |

**Optional 3 second insert** (between 0:27 and 0:31, if you have runtime): the Sources panel open on
the pricing slide. `✓ Enterprise Sales 2026 · Q3 2026 Pricing` in navy, greyed beneath it
`Web · pricing blog, Mar 2024`. Makes vetted vs public literal. Cut this first to get under 30s.

## The shots that can't be cut

1. **The hover to source (0:22 to 0:31).** Everything before it is upload UI, which every product
   has. The citation chip is the whole feature argument in one gesture: the deck isn't guessing,
   and you can check it live in front of a customer.
2. **The pull-back to two decks (0:31).** This is what the Project container buys you that a
   per-deck attach never could. The second deck is sitting there already knowing everything, with
   nobody uploading anything. It answers "is it worth setting up?" without a word of copy.

Third priority is the **labelled** graph at 0:07. A generic constellation of dots reads as
decorative AI filler. Nodes reading `$18/driver/mo` and `Objection: 6-week rollout` read as *your*
company. Same animation budget, completely different message.

## Investor variant

Same structure, swap the Project:

- **Project:** `Investor Materials`, the one already visible in the sidebar at 0:31, so the two
  videos interlock.
- **Files:** `Metrics_Dashboard_Export_Q2-2026.xlsx`, `Board_Deck_Mar-2026_vFinal.pdf`,
  `Cohort_Retention_Analysis.xlsx`, `Cap_Table_Post-Seed.xlsx`, `Customer_Interviews_Summary.docx`,
  `Market_Sizing_Model.xlsx`
- **Prompt:** *"Series A deck for our raise, $18M at $90M pre. Lead with the day-30 retention curve."*
- **Hover:** `92% day-30 retention` → `Cohort_Retention_Analysis.xlsx › Jun 2026 cohort`

Good video, rarer moment. Sales is the one that makes a viewer think "I'd use that this week."

## Production notes

- **Real filenames, real file-type icons.** Excel green and PowerPoint orange in the upload chips
  buy more believability than any animation.
- **Keep `Using: Enterprise Sales 2026` visible during generation.** Cheapest possible way to show
  the knowledge is scoped and active, and it costs no screen time.
- **Don't fake the ingest speed dishonestly.** Show it tick through files, then cut. A knowledge
  base that builds in 0.4s reads as a mockup.
- **If there's also a workspace-level layer** (brand guidelines, SOC2 doc shared across all
  projects), decide whether to show it. Recommendation: don't. A second knowledge tier in a 40
  second hero costs more comprehension than it earns. Put all 8 files in the Project.
- **One CTA at the end**, navy-filled. No exclamation marks in any on-screen text.
- **Colour discipline:** citation chips and the graph stay navy and grey. If the "vetted" tick needs
  to pop, that's the single place an accent earns its keep.
- Swap **Rivet** for whatever name clears legal. Don't put invented pricing on a real company's
  letterhead, even in a demo.

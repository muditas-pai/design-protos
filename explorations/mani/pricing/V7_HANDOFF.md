# Pricing v7: plan-count tabs (Basic / Pro / Gold)

Developer handoff for `explorations/mani/pricing/v7.html`. v7 is v6.2 plus a plan-count tab that switches the individual view between a 2-card and a 3-card layout, with reworked feature points on all cards. Everything else (Teams view, compare table, testimonials, 25%-off hour bump, close-intent popup) carries over from v6.2 unchanged.

## What's new vs v6.2

- Top-left segmented tab (`[data-cards-seg]`): **Pro + Gold** (default) and **Basic + Pro + Gold**.
- New Basic card, shown only on the 3-card tab.
- Gold is now the emphasized card (thicker border, on top); Pro is de-emphasized to Basic's weight.
- Card heights hug content: cards end 60px below their last feature point. All three tops align.
- Feature points rewritten on all cards (final lists below), three Gold points carry tooltips.
- Gold card illustration is the gold rocket (embedded base64, `.illus-gold`).
- Credit counts are emphasized: 26px extra-bold gradient number (`.cred-num`, Brand Blue gradient on Basic and Pro; `.cred-num--gold` adds a slow-shimmer gold gradient on Gold). The sparkle icon next to a gradient count renders at 22px.

## Plan-count tab behavior

- Tab 1 "Pro + Gold": Pro at left 204px, Gold at left 562px. Basic hidden.
- Tab 2 "Basic + Pro + Gold": Basic appears at left 24px, Pro moves to 384px, Gold to 742px.
- Gold sits 2px over Pro's right edge (562 not 564, 742 not 744) so only Gold's border shows at the seam.
- The tab only applies to the Individual audience: it hides when Teams & Enterprise is active.
- Pro's "Export to PowerPoint and Google Slides" point (`#pro-export-li`) shows on the 2-card tab only; on the 3-card tab, Basic carries the export point.
- Mobile (max-width 768px): the tab renders static and centered above the audience segment; cards stack (Pro first via `order:-1`).

## Cards and layout

| | Basic | Pro | Gold |
|---|---|---|---|
| Width | 361px | 360px | 360px |
| Border | 1px, left corners rounded | 1px brand-secondary, rounded, shadow | 2px, rounded, shadow |
| z-index | 0 | 1 | 3 (on top) |
| Height | content + 60px bottom pad | content + 60px bottom pad | content + 60px bottom pad |

## Pricing (annual, from v6.2)

| Plan | Monthly | Billed annually | During 25%-off hour bump |
|---|---|---|---|
| Basic | $9/mo | $108 | no change |
| Pro | $20/mo | $240 | $15/mo, $180 |
| Gold | $100/mo | $1,200 | $75/mo, $900 |

## Final feature points

**Basic**
1. 1,000 Credits
2. 300 slides
3. Basic AI model and agent
4. Export to PowerPoint and Google Slides
5. Email support when you need help

**Pro**
1. 5,000 Credits
2. Advanced AI models and agents
3. Export to PowerPoint and Google Slides (2-card tab only)
4. Create slides from PPT import, up to 60 slides
5. Use your brand's font, colors and logo
6. Full premium template library
7. Organize decks into projects
8. View tracking & analytics

**Gold**
1. 50,000 Credits
2. Ultra AI model, our most powerful
3. Create slides from PPT import, up to 99 slides
4. Export to PowerPoint and Google Slides
5. Projects with a shared knowledge base (tooltip)
6. Refresh data across decks in one click (tooltip)
7. Custom brand kit and moods, built for you (tooltip)
8. Full premium template library
9. Advanced tracking and analytics
10. Audience report on how each deck performs
11. Early access to beta features
12. Priority support, with direct access to our Head of Product

Neither Pro nor Gold uses an "All X features, plus:" label; every point is listed explicitly.

## Tooltip copy (Gold)

- **Projects with a shared knowledge base**: "Upload your files once. The AI references them on every slide, so your decks stay accurate and on-message."
- **Refresh data across decks in one click**: "Update every chart and number across the deck in one click, so nothing goes stale."
- **Custom brand kit and moods, built for you**: "Our team sets up a complete brand kit with fonts, colors, logos and curated moods matched to your brand, free with Gold."

## Unchanged from v6.2

- Compare table and sticky summary stay Pro + Gold on both tabs (Basic column stays CSS-hidden).
- Teams & Enterprise view, testimonials, FAQ.
- 25%-off hour bump mechanics and the close-intent (X) feature popup.
- The Gold card's hidden "1 free custom deck" point stays in markup, display none.

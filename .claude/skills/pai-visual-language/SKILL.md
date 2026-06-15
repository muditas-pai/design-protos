---
name: pai-visual-language
description: Stylistic conventions and brand voice for presentations.ai UI work — color emphasis (navy = action / orange = brand / Brand Blue = growth), copy voice, density, illustration style, hierarchy patterns. Invoke when designing or implementing UI surfaces (app interface, marketing pages, pricing, upgrade modals) or writing product copy for the pai-branded codebase. Use alongside the design system, not as a replacement.
---

# presentations.ai visual language

This skill captures the **subjective, stylistic** decisions that define the
presentations.ai brand — the choices that aren't expressed as Tailwind tokens
or component variants. It runs **alongside** the design system, not in place
of it. The design system answers "which token?"; this skill answers "which
token, used how, in what tone?"

The brand has two visual registers:

- **App / interface** — the dashboard, the slide editor, settings. Restrained,
  polished, recedes around the user's content.
- **Marketing & growth** — landing page, pricing, upgrade modals, paywalls,
  offer banners. More energetic, more visual, more salesy.

Most principles below apply to both. Where they differ, the rule is marked.

---

## Core principles (apply everywhere)

### 1. Three heroes: navy = action · orange = brand · Brand Blue = growth.

The app is **monochrome** by default (navy / grey / white). Three accent colours
each own exactly one job — that restraint is *why* each one stands out:

- **Navy `#0A1925`** (companions `#1C3550`, `#284B71`) — **action**. Primary CTAs
  ("Export as PPT," "Save changes") are navy-filled.
- **Orange `#FF5500`** — **brand identity**. The logo, brand-voice moments,
  "COMING SOON / NEW" attention tags. *Brand, not monetization.*
- **Brand Blue `#005EFF`** (companions `#0055ED`, `#0043B8`; tint `#E6EFFF`) —
  **growth & monetization**. *Every growth feature / intervention uses a Brand Blue
  theme on its buttons, backgrounds and accents:* Upgrade to Pro / Gold, Hire an
  Expert, paywalls, upsell cards & banners, plan callouts, the PRO / GOLD plan
  badges, seat-count / credit purchase — any surface driving a paid action.

Quick test:
- Primary button on the dashboard → **navy**.
- "Upgrade to Pro" button · a Gold-feature upsell card · the PRO badge → **Brand Blue**.
- The logo / brand mark → **orange**.

### 2. Confidence + warmth — never cold, never corporate-stiff.

The brand voice is **bold but human**. Marketing claims like "The World's
Best AI Presentation Maker" sit comfortably next to first-name greetings
("Ready to build, Simon?") and small softening visuals.

The principle: **a polished surface should never feel sterile.** Add a
warming element. The *form* of the warmth varies by surface:

- Marketing copy can include hand-drawn arrows, casual annotations, friendly
  asides ("*No credit card required").
- Onboarding tiles can use small dimensional illustrations (a notepad, a
  folder, a pen, a rocket) instead of flat geometric icons.
- Greetings can use first names ("Ready to build, Simon?", "Welcome back,
  [name]").
- Plan cards can have a small plan-character illustration at the top.

There's no required form. The required *outcome* is "feels human, not
sterile."

### 3. Hierarchy through color contrast, not just size.

When you need two-tier hierarchy in a headline or section title, build it
with **weight + color contrast**, not by making one part visually huge:

```jsx
// Yes — setup/payoff pattern
<h1>
  <span className="text-text-tertiary font-light">The World's Best</span>
  <span className="text-text-primary font-semibold">AI Presentation Maker</span>
</h1>

// Less brand-true
<h1 className="text-7xl">AI Presentation Maker</h1>
```

The setup-payoff structure (lighter pre-statement, darker bolder claim) is
the brand's signature headline pattern. Use it on landing surfaces, section
headings, modal titles, pricing-tier headlines. It can also be switched over
in the case of a title-subtitle pattern.

### 4. Real product over abstract illustration.

When you need imagery, show **the actual product**, not metaphors for it.

- **Yes**: slide thumbnails, real charts, screenshots of the editor, stacks
  of presentation covers at casual angles, real-looking presentation
  layouts.
- **No**: glowing-brain AI metaphors, robot mascots, abstract gradient
  swooshes, stock-photo people pointing at laptops, generic AI-circuit
  imagery, "neural network" visualizations.

Marketing surfaces *can* use small dimensional illustrations as **softening
elements** — onboarding tiles, plan-tier mascots (paper plane, rocket,
building). Those count as warmth, not as the hero imagery. The hero
imagery, when present, is the product.

### 5. Copy voice: declarative, energetic, human.

- **Short sentences.** "ChatGPT for Presentations." "Generate stunning
  slides in minutes."
- **Plain words.** Not "leverage AI to facilitate" — "make slides faster."
- **First-name personalization** where it fits. ("Ready to build, Simon?")
- **No corporate qualifiers.** Avoid "empower," "unlock," "transform,"
  "revolutionize," "next-generation," "cutting-edge," "best-in-class,"
  "seamlessly."
- **No buzzword soup.** "AI-powered platform that empowers teams to unlock
  collaborative productivity" — say what it does instead.
- **Energetic, not desperate.** One exclamation mark per surface, max.
- **Confident claims are fine.** "The World's Best" is on-brand. The
  warmth elsewhere prevents this from reading as arrogant.

### 6. One emphatic action per surface.

Each surface should have exactly one primary CTA. That CTA is navy-filled
(or **Brand Blue** if it's a growth / upsell action). Everything else is
white-outlined or ghost.

- Slide editor: "Export as PPT" is navy-filled; "Share" and "Present" are
  outlined.
- Pricing tier: one "Buy Now" navy CTA per card; "Talk to Sales" on
  Enterprise also navy (same emphasis tier — this is the action).
- Modals: one primary, optional secondary in ghost or outline.

When in doubt: **fewer high-emphasis buttons, more clarity.**

### 7. Emoji are a rare accent, not decoration.

An emoji can warm a single focal moment, but it stops being delightful the
instant it repeats. Restraint is the whole point.

- **At most one emoji per surface**, on the one spot that earns it. An upsell
  card ("Prefer a designer to build it? 🧑‍🎨") earns one; the default
  "Set up your brand kit" card next to it does **not** — two emoji side by
  side flatten the hierarchy and read as clutter.
- **Never decorate every section header / card with an emoji.** That's the
  fastest way to make a polished surface look like a toy.
- **Inside buttons and list items, keep Phosphor line icons.** Emoji are for
  the occasional personable accent (an upsell, an empty state, a celebratory
  moment), never functional affordances.
- When unsure, **drop it** — the one you keep lands harder when it's alone.

### 8. Corners are tight, not pillowy.

presentations.ai reads as crafted and precise, not soft/consumer-bubbly — so
corners stay on the **sharper** end. Anchor the radius scale tight:

- **Cards / large surfaces:** ~10px (not 16–20).
- **Mid surfaces** (inputs, tiles, preview frames): ~7–8px.
- **Small chips / buttons / swatches:** ~5–6px.
- **Pills** (tags, status badges) stay fully round (99px) — the contrast with
  tight rectangles is intentional, not a violation.
- The concentric rule still holds (outer = inner + padding); just build it on
  this tighter base. If a surface feels "round and friendly," it's probably too
  round for this product.

---

## App / interface register

Rules specific to the in-product interface — dashboard, editor, settings,
anywhere the user spends time inside the product.

### A1. Restraint, not sparseness.

The app is calm and polished but not busy. Comfortable padding, comfortable
line-heights — but *not* generous whitespace.

The mental model: **the user's content is the hero**; the UI is
"a calm room around the work." Compare to:

- **Canva** — UI competes with content; lots of color; dense panels. Avoid.
- **Figma** — chrome stays out of the way; content is visually dominant.
  Aim here.

What this means in practice:
- Sidebars are comfortable, not minimal — but every item earns its space.
- Card grids are uniform, not crowded.
- Top bars are quiet; usually grayscale icons with restrained spacing.
- Floating toolbars (like the editor's bottom bar) sit available without
  claiming attention.

### A2. UI chrome is grayscale and navy. Color is punctuation.

Headers, sidebars, toolbars, panels: monochrome (navy / dark grey / light
grey / white). Color enters only:

- Brand orange for the logo; Brand Blue for the PRO / GOLD plan badge.
- The single primary CTA per surface (navy-filled).
- The user's content (which can be any color the user wants — it's their
  presentation, not yours).

Avoid gratuitous accent colors in product chrome. No blue tab indicators,
no green success-tinted backgrounds for whole panels, no purple "AI"
flourishes.

### A3. Friendly personalization where it fits.

"Ready to build, Simon?" is more on-brand than "Dashboard" or "Recent
Presentations." First-name greetings, casual section headers, light-weight
greetings — these signal the human voice without intruding.

Don't over-do it. One personal greeting per major view; the rest of the
surface stays calm.

---

## Marketing & growth register

Rules for: the landing page, the pricing page, upgrade modals, in-app
upsell sheets, offer banners, paid feature gates, plan-comparison tables,
checkout flows.

### M1. Section rhythm — light, dark, light.

Long-scroll marketing pages alternate white and navy sections to give
vertical pacing. Dark sections aren't flat black: they use subtle texture
(gradient overlays, halftone patterns, or wash gradients). Pure flat black
panels feel cold and dated.

This rhythm rule is for **long-scroll** marketing pages (landing,
features). Pricing pages and modals don't follow it — they're bounded
surfaces, not scrolls.

### M2. Density varies by purpose.

Marketing surfaces are **not uniformly airy**:

- **Landing-page hero**: very airy. Big headline, lots of whitespace, one
  CTA. The dramatic register.
- **Pricing page**: dense by design. 3–4 plan tiers visible at once,
  comparison matrix below, testimonials, FAQ — all packed reasonably
  tight. Users want to scan and compare.
- **Upgrade modal**: tight. Bounded size; needs to surface the offer, key
  benefits, and a CTA in limited space.
- **Offer banner**: very tight. One line of text, one CTA, dismissible.

The principle isn't "marketing = lots of whitespace." It's "marketing
surfaces have *more visual energy* than the app, in whatever density the
surface's job requires."

### M3. Brand Blue does the work in growth surfaces.

Growth and monetization is where **Brand Blue `#005EFF`** shines. Use it confidently
on the buttons, backgrounds and accents of:

- Upgrade prompts, paywall CTAs, "Hire an Expert"
- Plan tier callouts ("Most Popular") and the PRO / GOLD plan badges
- Seat-count / quantity / credit selectors during purchase
- Offer banners ("Get 30% off," "Last chance") and plan-comparison "premium" highlights

Orange stays on pure brand moments only (logo, "COMING SOON / NEW / LIMITED" tags).
The app-wide restraint (rule 1) makes these Brand Blue moments feel like
punctuation, not decoration.

### M4. Use small dimensional illustrations.

Marketing surfaces benefit from illustrated icons. Examples from the
product:

- The dashboard's onboarding tiles (notepad, folder, pen).
- Plan tier illustrations on pricing cards (paper plane for Basic, rocket
  for Pro, building for Enterprise).
- Hand-drawn arrows or casual annotations on landing pages.

These are simple, geometric, friendly — not detailed cartoon scenes.

### M5. Show real product imagery, casually arranged.

When marketing surfaces need a hero image, the answer is **a stack of
real slide thumbnails at casual angles** — not stock photos, not abstract
gradients, not illustrations of "AI."

### M6. Comparison tables are dense and scannable.

Pricing-page feature-comparison matrices use:
- Tight rows
- Small left-column labels
- Green/red checks (or simple dashes for "not included")
- Section dividers between feature categories
- No decoration — the table is a tool, not a flourish

---

## Anti-patterns

| ❌ Don't | ✅ Do | Why |
|---|---|---|
| Orange for primary CTAs or growth surfaces | Navy for primary CTAs · Brand Blue for growth/upsells · orange for the brand mark | Three heroes, one job each |
| Stack three equal-emphasis buttons | One primary, others outlined / ghost | One emphatic action per surface |
| Make the app airy / Canva-like | Calm restraint; comfortable not airy | Chrome recedes around user content |
| Glowing-brain or AI-circuit imagery | Real slide thumbnails / actual product | Show product, not metaphors |
| Corporate qualifiers ("empower teams to unlock…") | Plain language ("make slides faster") | Voice is human, not corporate |
| Pure flat-black sections in marketing | Navy with subtle texture / gradient | Flat black feels cold and dated |
| Two equally-large headline tiers | Lighter setup + darker bolder payoff | Hierarchy through color, not just size |
| Sterile, polished UI with no warmth | Add a softening element (illustration, greeting, casual aside) | Polished must not feel cold |
| Dimensional illustrations inside product chrome | Phosphor line icons | Product chrome is restrained |
| Orange / Brand Blue accents scattered through product UI | Orange at brand moments · Brand Blue at growth moments | Punctuation, not theme |
| Emoji on every card / section header | One emoji on the single focal moment, none beside it | Repetition kills delight and flattens hierarchy |
| Emoji as a button or list-item icon | Phosphor line icon; emoji only as a rare accent | Functional affordances stay in the icon set |
| Soft 16–20px pillowy corners | Tighter ~12px cards, 8–10px surfaces, 6–8px chips | Reads crafted/precise, not consumer-bubbly |
| Stock-photo people in marketing imagery | Real slide thumbnails, casually stacked | "Real product, not metaphors" applies to people too |

---

## Quick reference: which register am I in?

| Surface | Register | Density | Color |
|---|---|---|---|
| Landing page hero | Marketing | Airy | Restrained, orange brand mark |
| Landing page features / sections | Marketing | Medium | Light/dark rhythm |
| Pricing page | Marketing | **Dense** | Navy CTAs; **Brand Blue** on plan tags / upgrade / seat selectors; orange "COMING SOON" |
| Upgrade-to-Pro modal | Growth | Tight | **Brand Blue CTA** + navy supporting |
| Plan-comparison table | Marketing-in-app | Dense | Mostly grayscale; green checks |
| Offer banner | Growth | Tight | **Brand Blue** |
| Dashboard | App | Comfortable | Grayscale + navy CTA + **Brand Blue** PRO badge |
| Slide editor | App | Comfortable | Grayscale chrome + navy CTA only |
| Settings, account, integrations | App | Comfortable | Pure grayscale + navy CTA |
| Empty states | App | Calm | Grayscale + small illustration if onboarding-adjacent |
| Onboarding entry tiles | App-marketing-adjacent | Comfortable | Illustrated icons allowed |

When unsure, default to **app register**. The marketing/growth surfaces
are clearly demarcated; everything else is calm restraint with the user's
content as the hero.

---
name: pai-visual-language
description: Stylistic conventions and brand voice for presentations.ai UI work — color emphasis (navy/orange), copy voice, density, illustration style, hierarchy patterns. Invoke when designing or implementing UI surfaces (app interface, marketing pages, pricing, upgrade modals) or writing product copy for the pai-branded codebase. Use alongside the design system, not as a replacement.
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

### 1. Navy is the action color. Orange is for brand identity and upsell.

The brand has two heroes: **orange `#FF5500`** for brand identity, and
**navy `#0A1925`** (with companions `#1C3550`, `#284B71`) for action.

- **Primary CTAs are navy**, not orange. "Export as PPT,"
  "Save changes," — all navy-filled.
- **Orange is reserved for**: the logo, the PRO badge, upgrade prompts,
  plan callouts (Basic / Pro / Gold), offer banners, "COMING SOON" tags,
  seat-count selectors during purchase, in-app upsells, and any surface
  trying to catch attention for monetization.
- **Outside those moments the app is monochrome** (navy / grey / white).
  That restraint is *why* the orange moments stand out when they appear.

A primary button on the dashboard? Navy. The "Upgrade to Pro" button in a
free-tier modal? Orange. The PRO badge next to the workspace name? Orange.

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
(or orange-filled if it's an upsell). Everything else is white-outlined or
ghost.

- Slide editor: "Export as PPT" is navy-filled; "Share" and "Present" are
  outlined.
- Pricing tier: one "Buy Now" navy CTA per card; "Talk to Sales" on
  Enterprise also navy (same emphasis tier — this is the action).
- Modals: one primary, optional secondary in ghost or outline.

When in doubt: **fewer high-emphasis buttons, more clarity.**

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

- Brand orange for the logo and PRO badge.
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

### M3. Orange does the work in growth surfaces.

This is where orange shines. Use it confidently:

- Plan tier callouts ("Most Popular" — though navy works too here for
  emphasis-via-action-color)
- Seat-count or quantity selectors during purchase
- "COMING SOON," "NEW," "LIMITED" tags on features
- Upgrade prompts and paywall CTAs
- Offer banners ("Get 30% off," "Last chance")
- The PRO / GOLD plan badges
- Plan-comparison "premium" highlights

The app-wide restraint (rule 1) makes these orange moments feel like
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
| Use orange for default primary CTAs | Use navy for primary CTAs; orange for upsells | Orange = brand / monetization, not "the action color" |
| Stack three equal-emphasis buttons | One primary, others outlined / ghost | One emphatic action per surface |
| Make the app airy / Canva-like | Calm restraint; comfortable not airy | Chrome recedes around user content |
| Glowing-brain or AI-circuit imagery | Real slide thumbnails / actual product | Show product, not metaphors |
| Corporate qualifiers ("empower teams to unlock…") | Plain language ("make slides faster") | Voice is human, not corporate |
| Pure flat-black sections in marketing | Navy with subtle texture / gradient | Flat black feels cold and dated |
| Two equally-large headline tiers | Lighter setup + darker bolder payoff | Hierarchy through color, not just size |
| Sterile, polished UI with no warmth | Add a softening element (illustration, greeting, casual aside) | Polished must not feel cold |
| Dimensional illustrations inside product chrome | Phosphor line icons | Product chrome is restrained |
| Orange accents scattered through product UI | Orange only at brand/upsell moments | Punctuation, not theme |
| Stock-photo people in marketing imagery | Real slide thumbnails, casually stacked | "Real product, not metaphors" applies to people too |

---

## Quick reference: which register am I in?

| Surface | Register | Density | Color |
|---|---|---|---|
| Landing page hero | Marketing | Airy | Restrained, orange brand mark |
| Landing page features / sections | Marketing | Medium | Light/dark rhythm |
| Pricing page | Marketing | **Dense** | Navy CTAs; orange on tags / "COMING SOON" / seat selectors |
| Upgrade-to-Pro modal | Growth | Tight | **Orange CTA** + navy supporting |
| Plan-comparison table | Marketing-in-app | Dense | Mostly grayscale; green checks |
| Offer banner | Growth | Tight | **Orange** |
| Dashboard | App | Comfortable | Grayscale + navy CTA + orange PRO badge |
| Slide editor | App | Comfortable | Grayscale chrome + navy CTA only |
| Settings, account, integrations | App | Comfortable | Pure grayscale + navy CTA |
| Empty states | App | Calm | Grayscale + small illustration if onboarding-adjacent |
| Onboarding entry tiles | App-marketing-adjacent | Comfortable | Illustrated icons allowed |

When unsure, default to **app register**. The marketing/growth surfaces
are clearly demarcated; everything else is calm restraint with the user's
content as the hero.

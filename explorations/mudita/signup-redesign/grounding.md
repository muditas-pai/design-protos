# grounding — signup-redesign

Redesign of the app's signup/login page (`app.presentations.ai`) to feel like the
**presentations.ai marketing website** while keeping the existing messaging/content.

## Source

- Baseline: screenshot of the live signup page (left = auth, right = light-blue value-prop panel).
- Goal from designer: keep messaging/content largely the same; make the right panel + copy feel
  like the marketing site — one direction is a **"letter from the founder"**.

## Content to preserve (verbatim-ish)

- Headline: **"Your ideas, perfectly presented."** · sub: "Create your free account or login below"
- Auth: **Continue with Google**, **Continue with Email**, "Show other options", terms checkbox.
- Right headline: **"Presentations that drive decisions."**
- 5 value props: Decks in Minutes Not Days · Look Professional Without a Designer · Stay on Brand ·
  Works Everywhere You Present · Unleash Your Creativity.
- Social proof: "Join over **10 million professionals** worldwide who trust us with their most
  critical presentations." + logo strip (Microsoft, Google, Adobe, facebook).
- Language switcher (English).

## Design tokens (from `design-system/`)

- Navy `#0A1925` = action (primary CTA). Brand blue `#0055ED` = brand/growth accent.
  Orange `#FF5500` = brand/upsell only. White base. Inter.

## Notes / decisions

- The **founder's-letter** signature is a **placeholder** ("the founding team") — swap for a real
  name before dev.
- crazy8s iterations live in `crazy8s.html` (+ round snapshots). Frozen pick → clean named file.

## TODO

- [ ] Round 1: pick a direction.
- [ ] Founder-letter copy: get the real founder name + a real short note.

# Creator program (HardLaunch) — grounding

Volatile reference for `creator-modal.html`. Started 22 Oct 2026.

## What it is

In-app users become creators. HardLaunch (https://hardlaunch.com/) recasts a ready-made
UGC template video with the user's face from one photo. The user posts it from their own
account with a personal referral link and earns credits per signup.

## Flow (one modal)

```
Intro ──► Pick a video ──► Add your face ──► Making ──► Share ──► Creator page
 what/why   template grid     photo + consent   ~2 min     download,     stats, link,
 +50/signup + fixed script    (gates the CTA)   can close   link, caption  make another
```

The right-hand phone is the throughline: template creator → dashed "your face" slot →
scan → you, with the caption, handle and "Paid partnership" chip updating per step.

## Prototype decisions (placeholders, confirm before eng)

- **50 credits per signup**, no cap. Number is invented.
- **A signup counts when the person makes their first deck**, not on account creation
  (fraud guard). Pending vs credited shows on the creator page.
- **Scripts are fixed.** Users endorse the product in words they did not write, so the
  script is shown before they commit.
- **Caption changes per platform.** TikTok/Instagram captions cannot hold a tappable link,
  so those say "link in bio"; LinkedIn/Shorts carry the link inline.
- **#ad is pre-filled** and the share step asks users to switch on the platform's paid
  partnership and AI-generated labels.
- **Photo retention:** only for this user's videos, auto-deleted after 30 days. Invented.

- **Intro phone plays HardLaunch's "As filmed" clip**, hotlinked from
  https://hardlaunch.com/website/swap/languages/source.mp4 (not copied into the repo). If
  they rename or move it, the intro shows the poster or goes blank. It is one steady shot,
  so the blurred "Your face" box is a fixed position.

## Open questions

- Voice: HardLaunch matches a voice to the new face. Is it the user's voice, the template
  creator's, or synthetic? Followers who know the user will notice. Changes the consent copy.
- Does rendering happen on HardLaunch's side via API, and what's the real render time?
- Who owns the output video and the face data (PAI or HardLaunch)? Drives the privacy copy.
- Legal review of the consent line and the 18+ gate.
- Credit value: what does 50 credits buy? The intro would land harder as "≈ N decks".
- Touchpoints that open this modal (Mudita to map).

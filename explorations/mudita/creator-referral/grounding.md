# Creator program (HardLaunch) — grounding

Volatile reference for `creator-modal.html`. Started 22 Oct 2026.

## What it is

In-app users become creators. HardLaunch (https://hardlaunch.com/) recasts a ready-made
UGC template video with the user's face from one photo. The user posts it from their own
account with a personal referral link and earns credits per signup.

## Flow (one modal)

```
Intro ──► Pick a video ──► Add your face ──► Making ──► Share ──┐
 what/why   template grid     photo + consent   ~2 min     download,│ "Track my signups"
 +200/first + fixed script    (gates the CTA)   can close   link,    ▼
 deck                                                       caption  Refer & earn page
```

Tracking lives on the existing Refer & earn page
(https://app.presentations.ai/#/referandearn), not in the modal. `refer-and-earn.html` is
that page rebuilt from `pitchdeckdoclist` `ReferAndEarn.jsx` (as of 14 Oct 2026) with the
creator pieces added:

```
Refer & earn
├── Hero (cream)          the live page's hero, unchanged (creator card removed 23 Oct 2026: too busy)
├── Your videos           NEW, right under the hero in both states. Empty: "Create new video" tile
│                         + one line on what it is. With videos: Create tile first, then each video
├── Stat cards            credits meter splits link vs videos (NEW legend)
├── Your invites          "Came from" gets a "Your video" badge + platform + which video
└── How rewards work      NEW bullet: video signups count as referrals
```

The right-hand phone is the throughline: template creator → dashed "your face" slot →
scan → you, with the caption, handle and "Paid partnership" chip updating per step.

## Prototype decisions (placeholders, confirm before eng)

- **Credits follow the existing referral programme**: 200 credits when a friend makes their
  first deck, same link (`?ref=`). The modal originally said 50 per signup, no cap; aligned
  22 Oct 2026.
- **Scripts are fixed.** Users endorse the product in words they did not write, so the
  script is shown before they commit.
- **Share step is a 3-item checklist:** download, copy caption, put link in bio. One
  caption for every platform ("link in bio", since TikTok/Instagram captions can't hold a
  tappable link). The per-platform picker and long hints were cut 22 Oct 2026 as too
  complex. `#ad` stays in the caption with a one-line reminder; the platform's own
  paid-partnership / AI labels are no longer prompted in the modal (open: where to tell
  users about them).
- **Photo retention:** only for this user's videos, auto-deleted after 30 days. Invented.

- **Intro phone plays HardLaunch's "As filmed" clip**, hotlinked from
  https://hardlaunch.com/website/swap/languages/source.mp4 (not copied into the repo). If
  they rename or move it, the intro shows the poster or goes blank. It is one steady shot,
  so the blurred "Your face" box is a fixed position.

- **Both protos are self-contained, with hardcoded live-app values.** They don't load
  `design-system/` (still the old `#005EFF` + Inter snapshot). Values come from
  `pitchdeckdoclist` `new_dev_migration` (22 Oct 2026): indigo `#3427FF`, ink `#14141F`,
  line `#E4E4EC`, sunken `#F3F3F7`, system font stack, radii 6 / 12 / 16, brand-filled
  primary button. Decided 22 Oct 2026 for these few protos only; no design-system PR.

- **Layout: right rail + modal footer** (23 Oct 2026). The right rail shows the video
  and a caption; on Pick it also names the selection and shows its script ("What you'll
  say"). One footer spans the whole modal: Back (or Not now / Try another video) on the
  left, notes or the consent checkbox in the middle, the step's primary button bottom
  right. No stepper (dropped 23 Oct 2026).
- **Tab switch keeps the pick if it's in the new tab, otherwise selects that tab's
  first video**, so the selected card is always visible and matches the rail.

- **No consent checkbox in the modal** (removed 23 Oct 2026). "Make my video" unlocks
  on a photo alone. Open: where the likeness / 18+ consent lives instead (signup to the
  creator program, HardLaunch's terms, or a one-time agreement).

- **Deep link:** `creator-modal.html?step=pick` opens the modal on Pick a video. Refer &
  earn's "Make my first video" links there: a deliberate exception to the repo's
  "protos don't link to each other" rule, asked for 26 Oct 2026. Any step except
  `making` works (`intro`, `pick`, `face`, `share`).

## Touchpoints (26 Oct 2026, thinking)

```
Entry point                         Mindset when they see it          Opens modal at
──────────────────────────────────  ────────────────────────────────  ──────────────
Refer & earn · Your videos          already wants to earn            Pick
Share modal · Social media tab      about to post something          Intro
Dashboard empty state · feature     new, hasn't made anything yet    Intro
```

### Nudge (bottom-right card, weighted engine): proto `creator-nudge.html`

Fits the existing engine in `pitchdeckdoclist/src/nudge/` (new_dev_migration, 26 Oct 2026)
with no engine changes: one new entry in `config/nudges.json` and one new signal.

```jsonc
{
  "id": "creator-video", "name": "Creator video", "type": "growth", "threshold": 10,
  "title": "Post one video, earn credits for every signup",
  "body": "We make the video. You add one photo and post it from your account.",
  "cta": "Make my video",                        // opens the creator modal at Intro
  "image": "nudges/nudge-creator-video.png",     // 440×214 hero band, see the proto
  "actions": {
    "second-deck":        { "score": 4,    "repeatable": false },
    "deck-sharer":        { "score": 5,    "repeatable": false },
    "share-link-copy":    { "score": 4,    "repeatable": true  },
    "pres-publish":       { "score": 4,    "repeatable": true  },
    "export-png-linkedin":{ "score": 6,    "repeatable": true  },
    "acq-referral":       { "score": 8,    "repeatable": false },
    "credits-low":        { "score": 4,    "repeatable": false },
    "credits-zero":       { "score": 6,    "repeatable": false },
    "endshow-reached":    { "score": 2,    "repeatable": true  },
    "creator-video-made": { "score": -100, "repeatable": false }   // NEW signal; suppresses forever
  },
  "roleScores":   { "Creator": 5, "Marketing": 4, "Sales": 3, "Leadership": 3, "Consulting": 2, "_default": 1 },
  "intentScores": { "high": 4, "medium": 2, "low": 0, "_default": 1 }
}
```

- **Place it last in `nudges[]`.** Ties go to the lower index, so the paid-plan nudges win a
  tie and this one never takes revenue from them.
- **Negative score as an off switch.** Scores are summed, so a one-off `-100` from
  `creator-video-made` (signal it when a creator video is downloaded) keeps the nudge from
  ever reaching threshold again. No engine change needed.
- **Free users only, by design of the engine.** `Guardrails.js` disables every nudge for Pro
  users. Paid users still earn referral credits, so they need a different entry point (Refer
  & earn, Share modal).
- **No signal for "first deck made".** `second-deck` and `deck-sharer` stand in. A real
  `first-deck` signal would be a better gate if engineering can add one.
- **Test recipe** (TESTING.md style):
  `await __nudge.resetAll(); await __nudge.setRole("Marketing"); await __nudge.signal("second-deck");`
  `for (let i = 0; i < 2; i++) await __nudge.signal("share-link-copy"); await __nudge.forceFire()`
  → 4 + 2 + 4 + 6.3 = **16.3**.

## Open questions

- **The 2,000-credit yearly cap is 10 friends.** A creator video that works hits it fast,
  and then the reward stops. Do creators get a separate or higher cap?
- **Attribution:** to show "Your video" and which video in the invites table, each video
  needs its own link (e.g. `?ref=<code>&v=<video-id>`) or a UTM. Caption + bio link
  must carry it.

- Voice: HardLaunch matches a voice to the new face. Is it the user's voice, the template
  creator's, or synthetic? Followers who know the user will notice. Changes the consent copy.
- Does rendering happen on HardLaunch's side via API, and what's the real render time?
- Who owns the output video and the face data (PAI or HardLaunch)? Drives the privacy copy.
- Legal review of the consent line and the 18+ gate.
- Credit value: what does 50 credits buy? The intro would land harder as "≈ N decks".
- Touchpoints that open this modal (Mudita to map).

# Earn credits for posts and reviews: eng handoff

**Status:** Dev Ready · **Owner:** Mudita · **Updated:** 27 Oct 2026

**Prototypes**
- Refer & earn section and all dialogs: https://muditas-pai.github.io/design-protos/explorations/mudita/review-rewards/earn-credits.html
- Entry points on the live screens: https://muditas-pai.github.io/design-protos/explorations/mudita/review-rewards/touchpoints.html

The prototypes are the source of truth for layout and copy. The full product spec (rules, reasons, research) is `review-rewards-spec.md` in the same folder.

## What we're building

Users earn credits for an honest public post about presentations.ai, or a G2 review.

| Action | Reward | Verified by |
|---|---|---|
| Public post on LinkedIn | +200 | They paste the post link; a person checks it |
| Public post on X | +200 | Same |
| Public post on Facebook | +200 | Same |
| Review on G2 | +400 | G2 publishes it (daily check) |

- **Up to 1,000 credits per user**, separate from the referral cap.
- **One reward per platform, ever.** A rejected post doesn't use it up; they can retry with no time limit.
- **Eligible after the first deck.** Free and paid plans.
- The reward never depends on what they say. Critical posts count.

## Flows

### 1. Every entry point opens one dialog

```
 Refer & earn page section ─┐
 Export-done banner link ───┤
 Share dialog row ──────────┼──► "Earn more credits" dialog ──┬──► Social post flow (2)
 Earn nudge ────────────────┤    (paid users: "Tell people   └──► G2 flow (3)
 Welcome-to-Pro line ───────┤     what you think")
 Pro checklist row 4 ───────┘
```

Closing the dialog returns to wherever it opened from (Share dialog, welcome dialog, editor).

### 2. Social post (LinkedIn, X, Facebook)

```
 Write ──────────────► Open platform ──► (they post) ──► back in our tab ──► Paste the link ──► Submit
 │ AI draft, ~3s                                         visibilitychange      │ validate host + path
 │ editable                                               moves to step 2      ▼
 │ "I've already posted" ──────────────────────────────────────────────►  In review ──► Approved: +200
 │                                                                         (detail dialog)   Not approved: reason, retry
```

- **Write:** an AI-written draft (see Requirements, *Draft generation*). Editable. Our link and `#ad` are appended. X shows a counter (links count as 23) and disables Open X over 280.
- **Open platform:** LinkedIn and X open their composer with the text filled in. Facebook can't be pre-filled: the button copies the text, then opens Facebook.
- **Paste the link:** a Paste button reads the clipboard; ⌘V also works. Per-platform "where to find the link" steps.
- **Submit:** the dialog turns into the in-review detail (post link, "Expect an answer by [date]", timeline). The button shows **In Review** in orange.

### 3. G2 review

```
 G2 dialog ──► "Write my review" ──► G2 in-app form (email passed in) ──► G2 moderates (≤3 business days)
                                                                              │
                     daily job asks G2 about everyone waiting ◄───────────────┘
                     published → +400 + email      rejected → "Not published", Edit on G2
```

No link to paste. We match on the user's presentations.ai email, so they must start from our button. No G2 account needed.

### 4. Button states (per platform)

| State | Button | Card line | Click opens |
|---|---|---|---|
| Available | Platform name | What to do | Posting dialog |
| In review | Name + **In Review** (orange) | "Checking your X post…" | Detail: link, expected date, timeline |
| Waiting for G2 | G2 + **In Review** | "Credits arrive once G2 publishes it" | Detail: expected date, timeline |
| Credited | Grey, green check | "+400 credits added" | Detail: credited date |
| Not approved | **Retry X** (neutral outline) | The reason, in red | Paste-the-link step |
| Not published by G2 | **Edit on G2** (neutral outline) | "G2 didn't publish your review and emailed you why" | G2 |

## Requirements

### Draft generation (new, on the fly)

- **Endpoint** that returns a post draft per platform for the signed-in user. Call it when the Earn more credits dialog opens and return all three platforms at once, so the draft is usually ready before they pick one.
- **Inputs, built server-side:** role (onboarding), deck kinds (e.g. investor updates, board decks), how decks were started (prompt, document, PDF, URL, PowerPoint import), deck count.
- **Never send or output** deck titles, slide text, company or client names. If deck kinds need classifying from titles, classify server-side and pass only the category.
- **Model:** Claude Haiku 5.5 (`claude-haiku-5-5`), for speed.
- **Output rules:** first person, plain, only facts from the inputs. No outcome claims (time saved, funding, results). No praise words or superlatives. Length: LinkedIn 2 to 4 sentences, X under 240 characters before the link, Facebook 2 to 3 casual sentences.
- **Banned AI tells:** em dashes, rhetorical questions, "not just X, it's Y", lists of three, "Here's the thing", "I'm thrilled", "As a [role]," openers, emoji, hashtags, "seamless / unlock / journey / elevate / game-changer". Check every draft against this list; on a hit, regenerate once, then fall back to a plain template.
- **We append** `\n\nTry it: <referral link> #ad` (X: ` <link> #ad`). The model never writes the link or the disclosure.
- **Loading UI:** skeleton in place of the text box plus a status line that changes every second (3 lines). Open [platform] is disabled until it's ready; "I've already posted" stays enabled.
- **Timeout 6s → template.** Cache one draft set per user per day. Rate-limit per user.
- G2 is never drafted.

### Frontend (pitchdeckdoclist)

| Surface | Where | Work |
|---|---|---|
| Earn more credits section | `ReferAndEarn.jsx` | New section between the hero and the stat cards: two cards with logo stickers |
| Dialogs | new | Earn more credits (free and paid copy), Post on [platform] (3 steps), G2, status detail |
| Export-done banner | `PptOrderStickyBanner.jsx` (confirm it's the editor's download banner) | Link at the end of the success banner |
| Share dialog | `ShareScreen.jsx` / `PublishScreen.jsx` (two copies exist: `src/components/core/share` and `src/listing/core/screens/views/share`, confirm which the editor mounts) | Row under the social buttons |
| Earn nudge | `src/nudge/config/nudges.json`, `engine/Guardrails.js` | New nudge type `earn`. Guardrails currently disable all nudges for Pro; `earn` must bypass that. Shares the session cap and cooldown with the upsells |
| Welcome to Pro | `PaymentSuccessScreenNew.jsx` (welcome body) | One line under the blue card, paid copy. Checkout untouched |
| Pro checklist | `TopmenuGetMostOut.jsx` | Row 4 "Tell people why you chose Pro", no Earn badge |

- **Composer links:** X `https://x.com/intent/post?text=…`; LinkedIn `https://www.linkedin.com/feed/?shareActive=true&text=…` (works but isn't documented by LinkedIn, so test it); Facebook has no pre-fill, so copy to clipboard and open `https://www.facebook.com/`.
- **Return detection:** on `visibilitychange` back to our tab after opening the composer, move to the paste step.
- **Clipboard read** needs permission; fall back to focusing the field.
- **Link validation:** host must match the platform (`linkedin.com`, `x.com` / `twitter.com`, `facebook.com`) and the path must point at a post.
- **Nudge scoring signals:** download PPT/PDF +6, end of show +6, copied share link +4, published +4, third deck +4, credits low +4; generation failed this session −100; all rewards claimed −100. Fires above 10. Two dismissals and it never shows again.
- **Entry point visibility:** hide the banner link, share row and nudge once every reward is claimed. Never before the first deck, during generation, or after an error.

### Backend (presentation-services)

- **Submissions table:** user, workspace, platform, post URL, status (`pending`, `approved`, `rejected`, `g2_waiting`, `g2_published`, `g2_rejected`), rejection reason, submitted at, decided at, decided by.
- **One reward per user per platform:** unique on approved/published per (user, platform). Rejections don't count.
- **Same post URL can't be submitted twice**, across all accounts.
- **Grant credits** through `app/credits/service.grant()`, like `app/credits/checklist_rewards.py` (advisory lock, note-based dedupe). Decide: those grants are per workspace; this reward is per user.
- **Cap:** 1,000 per user from this feature, not counted against the referral cap.
- **Admin review queue** in admin-ui: open the link, approve, or reject with a reason. Target: answer within 2 working days. Rejection reasons: not public, link isn't a post, not about presentations.ai, no #ad, account already rewarded.
- **G2:** build the in-app review form URL with the user's email; a daily job checks every waiting user against G2 (`review_status` or the reviews data feed) and grants +400 on publish.
- **Emails:** post approved (+credits), post not approved (reason, retry), G2 review published (+credits).

### Analytics

`earn_entry_click {entry}` · `earn_dialog_open {entry, paid}` · `earn_platform_pick {platform}` · `earn_draft_ready {platform, ms, fallback}` · `earn_draft_edited {platform, changed_pct}` · `earn_composer_open {platform}` · `earn_link_submit {platform, valid}` · `earn_review_decision {platform, approved, reason}` · `earn_credited {platform, credits}` · `earn_nudge_dismiss`

## Before build

1. **G2 rep:** can our credits be the incentive; does `review_status` distinguish submitted / published / rejected; does our plan include the API.
2. **Value:** 400 credits must be worth under $100 (G2's cap).
3. **Legal sign-off,** including AI-drafted posts specifically. Drafts stick to facts from the user's own usage; opinions and outcomes are theirs.
4. **Owner** for the review queue.
5. **Deleted posts:** do we take credits back if a post is deleted soon after?
6. **Expiry:** do these credits expire (checklist rewards do; referral credits don't)?

## Not in v1

Trustpilot (bans rewards) · Threads, Instagram, Reddit, TikTok, YouTube · automatic post verification · yearly reset of rewards · Write another (regenerate) on the draft.

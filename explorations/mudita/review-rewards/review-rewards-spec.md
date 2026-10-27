# Earn credits for posts and reviews

**Status:** draft for review · **Owner:** Mudita · **Updated:** 27 Oct 2026
**Prototype:** `earn-credits.html` · **Flows:** `posting-flows.html` in this folder · **Notes and code mapping:** `grounding.md`

## In one line

Users earn credits for sharing their honest experience of presentations.ai: **+200 per social post** and **+400 for a G2 review**. Trustpilot gets a plain, unrewarded ask.

## What earns what

| Action | Reward | How many times | How we know it happened |
|---|---|---|---|
| Public post on **LinkedIn** | +200 credits | Once | They paste the post link; we check it |
| Public post on **X** | +200 credits | Once | Same |
| Public post on **Facebook** | +200 credits | Once | Same |
| Review on **G2** | +400 credits | Once | G2 confirms the review was published |
| Review on **Trustpilot** | No reward | – | Not tracked |

Most a user can earn here: **1,000 credits** (3 posts + G2). This is separate from the 2,000-a-year referral cap.

## Rules we have to follow

These decide the shape of the feature. Legal to sign off before build.

| Rule | Source | What it means for the design |
|---|---|---|
| Rewards can't depend on the review being positive | FTC rule on reviews and testimonials (in force 21 Oct 2024) | Copy says “honest experience”, never “positive”, “5 stars” or “testimonial”. We never reject a post for being critical |
| Paid posts must say they're paid | FTC endorsement guides | Suggested post text includes **#ad**; a post without a disclosure isn't approved |
| Trustpilot doesn't allow any incentive for a review | Trustpilot guidelines | No credits for Trustpilot. Ask everyone, not only happy users (selective asking is also against the rules) |
| G2 allows incentives, including credits, if they're disclosed to G2, capped at $100 in value, and never tied to sentiment | G2 Community Guidelines | Run it as a G2 review campaign, or disclose it to G2. G2 labels the review as incentivized. 400 credits must be worth under $100 |

## Who can use it

- **Signed-in users who have made at least one deck.** A review should come from real use, and it slows down abuse.
- Free and paid plans alike.
- One reward per platform per person. A second post on the same platform earns nothing.

## Where it lives

A new **“Earn more credits”** section on the Refer & earn page, between the hero and the stat cards. v1 has no other entry point; a bottom-right nudge can follow once it's live.

## The flow

### Posting on socials

Storyboard for each platform: `posting-flows.html`. A three-step dialog: **Write → Paste the link → Done**.

1. **Write.** Suggested text with #ad and their link, which they rewrite in their own words. X shows a 280-character counter (links count as 23) and blocks Open X when it's too long.
2. **Open the platform** in a new tab:
   - LinkedIn and X open their composer **with the text filled in**.
   - Facebook doesn't allow apps to pre-fill posts, so the button is **Copy text and open Facebook** and says why.
3. **Coming back to our tab** moves the dialog to **Paste the link** on its own. “I've already posted” skips straight there.
4. **Paste the link.** Each platform shows where to find it (LinkedIn: ··· → Copy link to post; X: share icon → Copy link; Facebook: ··· → Copy link, audience must be Public). We check it's a post link from that platform.
5. **Done.** “Thanks, we're checking your post”; the card shows Pending.
6. A person approves it → email + toast, credits added. Or Not approved, with the reason and Try again.

### Reviewing on G2

1. User clicks **Review us on G2**.
2. A dialog explains: the review is written on G2; credits arrive once G2 publishes it; G2 marks it as incentivized; honest reviews of any rating count.
3. **Write my review** opens our G2 campaign page in a new tab. The card shows **Waiting for G2**.
4. When G2 confirms, the card shows **Credited**.

### Trustpilot

One quiet row: “Liking presentations.ai? Leave a review on Trustpilot.” Opens Trustpilot. No reward, no tracking, shown to everyone who qualifies.

## Layout and states

One card, two rows, and a line for Trustpilot. No per-platform cards.

```
Earn more credits  NEW                                     Up to 1,000 credits
Post about us  +200 each                       [in LinkedIn] [X] [f Facebook]
A public post about your honest experience. One per platform.
──────────────────────────────────────────────────────────────────────────────
Review us on G2  +400                                    [G2 Write a review]
An honest review on G2. Any rating counts.
──────────────────────────────────────────────────────────────────────────────
Liking presentations.ai? Leave a review on Trustpilot. There's no reward for this one.
```

Each platform button carries its own state; the row's grey line explains the latest one.

| State | Button | Row line |
|---|---|---|
| Available | Outlined, platform icon + name | What to do |
| Pending | Dashed, hourglass | “Checking your X post, usually within 2 working days.” |
| Waiting for G2 | Dashed, “Waiting for G2” | “Credits arrive when G2 publishes your review.” |
| Credited | Grey fill, green check | (G2) “+400 credits added.” |
| Not approved | Red outline, “Try X again” | The reason, in red |

**Reasons a post isn't approved:** the post isn't public · the link doesn't open a post · the post isn't about presentations.ai · it has no #ad or paid-partnership label · this account was already rewarded.

## Suggested post text

Editable, never required. One per platform, for example:

> I’ve been using presentations.ai to build my decks. Here’s my honest take: [your experience]. Try it: app.presentations.ai/?ref=… #ad

The placeholder makes it clear they should write their own experience. We don't pre-write praise.

## Credits and notifications

- Credits land when the post or review is approved, not when it's submitted.
- Email + in-app toast on **Credited** and **Not approved**.
- Credits from posts and reviews show in the credits history as “Post on LinkedIn”, “Review on G2”, and so on.

## What we measure

- How many people who see the section start a task, and how many finish one.
- Approval rate per platform, and the top reasons for not approving.
- New G2 reviews per month and our G2 rating.
- Signups from links in posts (their referral link is in the suggested text).

## Not in v1

- Rewards for Trustpilot (not allowed).
- Automatic checking of posts (manual review first).
- Instagram, Reddit, TikTok, YouTube (see grounding for why).
- Any link with the creator video program (deprioritized).

## Open questions

1. **G2:** confirm with our G2 rep that in-product credits work as the campaign reward, and how G2 tells us a review was published.
2. **Value:** what 400 credits are worth in dollars, to confirm it's under G2's $100 cap.
3. **Review owner:** who checks submitted posts, and where (an admin queue).
4. **Deleted posts:** do we take credits back if a post is deleted soon after?
5. **Legal:** sign-off on the copy, disclosure and eligibility.

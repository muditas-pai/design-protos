# Earn credits for posts and reviews

**Status:** draft for review · **Owner:** Mudita · **Updated:** 27 Oct 2026
**Prototype:** `earn-credits.html` · **Flows:** `posting-flows.html` in this folder · **Notes and code mapping:** `grounding.md`

## In one line

Users earn credits for sharing their honest experience of presentations.ai: **+200 per social post** and **+400 for a G2 review**. Trustpilot isn't part of it (it doesn't allow rewards).

## What earns what

| Action | Reward | How many times | How we know it happened |
|---|---|---|---|
| Public post on **LinkedIn** | +200 credits | Once | They paste the post link; we check it |
| Public post on **X** | +200 credits | Once | Same |
| Public post on **Facebook** | +200 credits | Once | Same |
| Review on **G2** | +400 credits | Once | G2 reports the review as published (daily check by email) |
| Review on **Trustpilot** | No reward | – | Not part of this feature |

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
- **One reward per platform, ever.** People can post as often as they like, but only their first approved post on each platform earns credits. A post that isn't approved doesn't use up the reward; they can try again with no time limit.
  Why not more: repeat rewards turn it into paid posting, invite spam on their feeds, and are easy to farm. If we want repeat engagement later, a yearly reset per platform is the safest next step.

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
4. **Paste the link.** A **Paste** button reads the clipboard (the field also takes ⌘V). Each platform shows where to find it (LinkedIn: ··· → Copy link to post; X: share icon → Copy link; Facebook: ··· → Copy link, audience must be Public). We check it's a post link from that platform.
5. **Done.** “Thanks, we're checking your post”; the card shows Pending.
6. A person approves it → email + toast, credits added. Or Not approved, with the reason and Try again.

### Reviewing on G2

Nothing to paste. We pass G2 the user's email, and G2 tells us when the review is live.

1. User clicks **Write a review**.
2. A dialog explains: written on G2, about 5 minutes; any honest rating counts; +400 credits once G2 **publishes** it (usually within 3 business days); G2 marks it as rewarded.
3. **Write my review** opens **G2's in-app review form** with the signed-in user's email. G2 ties the review to that email, whether they have a G2 account or review anonymously. The card shows **Waiting for G2**.
   - **They don't need a G2 account with the same email.** If one exists for that email, G2 signs them in; if not, the review is linked to our email, and they may be asked to create a G2 profile after submitting.
   - **They must start from our button.** A review written by going to G2 directly can't be matched to their account. The dialog says so.
4. G2 moderates the review (up to 3 business days).
5. **A daily server job** checks G2 for every user in Waiting for G2:
   - **Published** → add +400 credits, email + toast → **Credited**.
   - **Rejected** → **Not published by G2**. G2 has already emailed them the reason; they can edit and resubmit on G2, and the job keeps checking.

```
Write a review ─► G2 form (our email) ─► G2 moderates ─► Published ─► +400 credits
                                                      └► Rejected  ─► "Not published by G2" · Edit on G2
Card meanwhile: Waiting for G2
```

**How we check, in order of preference** (to confirm with G2):
- G2's `review_status` lookup by email, if it returns submitted / published / rejected.
- G2's reviews data feed filtered to published reviews, matched by email.
- Stopgap only: G2's "review went live" email alert, matched to users by hand.

Credits are added on **published**, never on submitted. G2 documents no webhook, so a daily check is the plan.

### Trustpilot

Not in this section (dropped 27 Oct 2026). If we ask for Trustpilot reviews at all, it's unrewarded and lives elsewhere.

## Layout and states

A plain heading on the page and two cards side by side (no outer box).

```
Earn more credits  NEW                                          Up to 1,000 credits
┌ Post about us  +200 each ───────────────┐ ┌ Review us on G2  +400 ──────────────┐
│ A public post about your honest         │ │ An honest review on G2. Any rating  │
│ experience. One per platform.           │ │ counts.                             │
│ [in LinkedIn] [X] [f Facebook]          │ │ [G2 Write a review]                 │
└─────────────────────────────────────────┘ └─────────────────────────────────────┘
```

Each platform button carries its own state; the row's grey line explains the latest one.

| State | Button | Row line |
|---|---|---|
| Available | Outlined, platform icon + name | What to do |
| Pending | Dashed, hourglass | “Checking your X post, usually within 2 working days.” |
| Waiting for G2 | Dashed, “Waiting for G2” | “Credits arrive once G2 publishes it, usually within 3 business days.” |
| Not published by G2 | Red outline, “Edit on G2” | “G2 didn’t publish your review. They’ve emailed you why; you can edit it on G2.” |
| Credited | Grey fill, green check | (G2) “+400 credits added.” |
| Not approved | Red outline, “Try X again” | The reason, in red |

### Status details

Every button that isn't “available” opens a small dialog with: the post link with **View post** right under the title (socials), a coloured status box, and a three-step timeline (sent → checked → credits) with dates.

| State | Status box | Actions |
|---|---|---|
| Pending | “We’re checking your post. Expect an answer by **[date]**. We’ll email you either way.” | Change the link · Done |
| Waiting for G2 | “G2 checks every review, usually within 3 business days. Expect it by **[date]**.” | Open G2 · Done |
| Credited | “+200 credits added on **[date]**.” | Done |
| Not approved | The reason, then “Fix it and send the link again. No time limit.” | Write a new post · **Send the link again** |
| Not published by G2 | “G2 emailed you the reason. Edit it on G2 and resubmit.” | **Edit on G2** |

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

1. **G2, three things to confirm with our rep:**
   - Can **our credits** be the reward (disclosed to G2), rather than G2's gift cards?
   - Does `review_status` say **submitted / published / rejected**, or only "a review exists"?
   - Does our plan include **API access** to the in-app review form and the reviews data feed?
2. **Value:** what 400 credits are worth in dollars, to confirm it's under G2's $100 cap.
3. **Review owner:** who checks submitted posts, and where (an admin queue).
4. **Deleted posts:** do we take credits back if a post is deleted soon after?
5. **Legal:** sign-off on the copy, disclosure and eligibility.

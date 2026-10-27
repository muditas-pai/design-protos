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
| Paid posts must say they're paid | FTC endorsement guides | The drafted post text always includes **#ad**; a post without a disclosure isn't approved |
| Trustpilot doesn't allow any incentive for a review | Trustpilot guidelines | No credits for Trustpilot. Ask everyone, not only happy users (selective asking is also against the rules) |
| G2 allows incentives, including credits, if they're disclosed to G2, capped at $100 in value, and never tied to sentiment | G2 Community Guidelines | Run it as a G2 review campaign, or disclose it to G2. G2 labels the review as incentivized. 400 credits must be worth under $100 |

## Who can use it

- **Signed-in users who have made at least one deck.** A review should come from real use, and it slows down abuse.
- Free and paid plans alike.
- **One reward per platform, ever.** People can post as often as they like, but only their first approved post on each platform earns credits. A post that isn't approved doesn't use up the reward; they can try again with no time limit.
  Why not more: repeat rewards turn it into paid posting, invite spam on their feeds, and are easy to farm. If we want repeat engagement later, a yearly reset per platform is the safest next step.

## Where it lives

A new **“Earn more credits”** section on the Refer & earn page, between the hero and the stat cards. Every other entry point opens one **Earn more credits** dialog with the same two cards (socials and G2), so people always see every option and pick for themselves (prototype: `touchpoints.html`):

| Touchpoint | Live screen | What's added | Shows |
|---|---|---|---|
| Export done | Green “Your PPT has been downloaded” banner | A link at its end, with the four platform stickers: “Happy with it? Tell people, earn up to 1,000 credits” | Every download, until every reward is claimed |
| Share dialog | Share externally tab | A row under the social buttons: “Say what you think of presentations.ai” · **Earn credits** | Every open, until every reward is claimed |
| Nudge | Bottom-right nudge slot | A new nudge type, `earn`, that the Pro guardrail doesn't block | Scored on downloads, end of show, share links, third deck; never after a failed generation |
| After upgrade | “Welcome to Pro Plan” dialog (not checkout) | One quiet line under the blue card: “You chose Pro. Tell others why and earn up to 1,000 credits” | Paid plans, once |
| Pro checklist | “Get most out of Pro” in the editor top bar (in code, not on prod yet) | Row 4: Tell people about us · Earn up to +1,000 | Paid plans, until done |

Rules for all of them: only after the first deck; never while generating or after an error; earn asks share the nudge engine's session cap with the upsells; two dismissals and the nudge stops for good.

## The flow

### Posting on socials

Storyboard for each platform: `posting-flows.html`. A three-step dialog: **Write → Paste the link → Done**.

1. **Write.** A draft written for them by AI from how they use presentations.ai (see **Drafted post text**), with #ad and their link. About 3 seconds of a writing state first. X shows a 280-character counter (links count as 23) and blocks Open X when it's too long.
2. **Open the platform** in a new tab:
   - LinkedIn and X open their composer **with the text filled in**.
   - Facebook doesn't allow apps to pre-fill posts, so the button is **Copy text and open Facebook** and says why.
3. **Coming back to our tab** moves the dialog to **Paste the link** on its own. “I've already posted” skips straight there.
4. **Paste the link.** A **Paste** button reads the clipboard (the field also takes ⌘V). Each platform shows where to find it (LinkedIn: ··· → Copy link to post; X: share icon → Copy link; Facebook: ··· → Copy link, audience must be Public). We check it's a post link from that platform.
5. **Submitted.** The dialog turns into the same **in review** detail the button opens later (post link, “Expect an answer by [date]”, timeline), and the button shows **In Review**.
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
| Pending | Dashed, platform name + “In Review” in orange | “Checking your X post, usually within 2 working days.” |
| Waiting for G2 | Dashed, “G2” + “In Review” in orange | “Credits arrive once G2 publishes it, usually within 3 business days.” |
| Not published by G2 | Outlined (same as Available), “Edit on G2”: opens the review on G2 | “G2 didn’t publish your review and emailed you why. Edit it on G2; the credits arrive once it’s published.”, in red |
| Credited | Grey fill, green check | (G2) “+400 credits added.” |
| Not approved | Outlined (same as Available), “Retry X”: opens the paste-link step | “Your X post wasn’t approved.” + the reason + “Make it public, then retry.”, in red |

### Status details

Failed buttons retry directly (the reason is already on the card), so no dialog. Every other button that isn't “available” opens a small dialog with: the post link with **View post** right under the title (socials), and a coloured status box. In-review states also show a three-step timeline (sent → checked → credits) with dates; credited and failed states don't, since the status box already says what happened.

| State | Status box | Actions |
|---|---|---|
| Pending | “We’re checking your post. Expect an answer by **[date]**. We’ll email you either way.” | Change the link · Done |
| Waiting for G2 | “G2 checks every review, usually within 3 business days. Expect it by **[date]**.” | Open G2 · Done |
| Credited | “+200 credits added on **[date]**.” | Done |

**Reasons a post isn't approved:** the post isn't public · the link doesn't open a post · the post isn't about presentations.ai · it has no #ad or paid-partnership label · this account was already rewarded.

## Drafted post text

The post is drafted for them by AI, from how they actually use presentations.ai. It's a starting point they edit, never required.

**What it's written from**

| Input | Example | Source |
|---|---|---|
| Role | Founder | Onboarding answer |
| What they make | mostly investor updates and board decks | Deck types, classified from their decks |
| How they start | usually from a Google Doc | Input type per deck: prompt, document, PDF, URL, PowerPoint import |
| How much | 12 decks | Deck count |

Never deck titles, slide text, company or client names. Decks are often confidential; the draft only ever sees categories and counts.

**How it should read**

- First person, plain words, specific to them: what they make, how they start, how many.
- No claims we can't know: no time saved, no "got funded", no results. Outcomes are theirs to add.
- No praise words or superlatives ("amazing", "best", "game-changer").
- None of the usual AI tells: no em dashes, no rhetorical questions, no "not just X, it's Y", no lists of three, no "Here's the thing", no "I'm thrilled", no openers like "As a founder,", no emoji, no hashtags besides #ad, no "seamless / unlock / journey / elevate".
- Length per platform: LinkedIn 2 to 4 sentences, X under 240 characters before the link, Facebook 2 to 3 casual sentences.
- **We add the link and #ad**, not the model, so they're always there and always correct.
- A check runs on every draft for the banned words and patterns. If one slips through, it rewrites once; if it still fails, it falls back to a plain template.

**In the dialog**

- **Writing state, about 3 seconds:** three skeleton lines where the text box goes, and a status line that changes each second: “Looking at your 12 decks” → “Picking out what you make most” → “Writing it the way you'd say it”. Open [platform] is disabled; “I've already posted” still works.
- **Draft ready:** it fades into an editable box that grows to fit. Under it: “Drafted from your work: Founder · 12 decks, mostly investor updates · usually started from a Google Doc”, and **Write another** for a new version.
- Start writing when the **Earn more credits** dialog opens, not when they pick a platform, so by the time they choose, the draft is usually ready.
- If it takes over 6 seconds or fails, show the plain template so they're never stuck.
- Model: a fast one, Claude Haiku 5.5 (`claude-haiku-5-5`). One draft per platform per day is cached.

**Why we draft at all, and the risk.** Earlier we chose not to pre-write anything. Drafting should get more people to post, but the FTC rule bans testimonials that misrepresent the person's experience. Keeping the draft to facts from their own usage, leaving opinions and outcomes to them, and having them edit and post it from their own account keeps it theirs. Legal must sign off on this specifically. G2 reviews are never drafted: G2 wants reviews in the reviewer's own words.

## Credits and notifications

- Credits land when the post or review is approved, not when it's submitted.
- Email + in-app toast on **Credited** and **Not approved**.
- Credits from posts and reviews show in the credits history as “Post on LinkedIn”, “Review on G2”, and so on.

## What we measure

- How many people who see the section start a task, and how many finish one.
- Approval rate per platform, and the top reasons for not approving.
- New G2 reviews per month and our G2 rating.
- Signups from links in posts (their referral link is in the drafted text).

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
5. **Legal:** sign-off on the copy, disclosure and eligibility, and on **AI-drafted posts** in particular (see Drafted post text).

# Review rewards: grounding

Volatile notes for this folder. Started 27 Oct 2026. Ages with the code and with platform
policies; re-check before trusting.

## Policy research (27 Oct 2026)

- **Trustpilot:** its "Action we take" page lists offering incentives (refunds, discounts,
  gifts, money, loyalty points) in exchange for a review as misuse. Third-party summaries say
  people who got an incentive aren't eligible to review, disclosed or not.
  https://corporate.trustpilot.com/legal/for-everyone/action-we-take
- **G2 Community Guidelines:** incentives allowed for honest reviews; eligibility never based
  on the opinion expressed; value capped at $100 USD across "cash, gift cards, and non-cash
  items such as swag, tokens, credits, and subscriptions"; vendors must not incentivize
  independently without disclosing it to G2; incentivized reviews are labelled "a nominal
  incentive was offered in exchange for this review".
  https://legal.g2.com/community-guidelines
  G2's own campaign options (docs) list gift cards and charity donations; vendor credits
  aren't listed there, hence the open question for our G2 rep.
  https://documentation.g2.com/docs/review-campaigns
- **FTC (US Federal Trade Commission):** the Consumer Reviews and Testimonials Rule
  (16 CFR Part 465, final 14 Aug 2024, in force 21 Oct 2024) bans incentives conditioned on
  a review's sentiment. The Endorsement Guides require clear disclosure of paid endorsements.

## Platforms

| Platform | v1 | Why |
|---|---|---|
| LinkedIn | Yes | Our audience; public posts have stable URLs |
| X | Yes | Public by default; stable post URLs |
| Facebook | Yes | Big reach; posts must be set to Public or we can't see them |
| Threads | Maybe later | Public, text-first, easy to verify; small for B2B today |
| Instagram | No | Needs an image or video; links in captions aren't clickable |
| Reddit | No | Most subreddits ban paid or promotional posts; risk of bans |
| TikTok, YouTube | No | Video effort is out of scope (that was the creator program) |

## Prototype decisions

- Lives on Refer & earn as an "Earn more credits" section, built on this repo's rebuild of
  the live page (`../creator-referral/refer-and-earn.html`, from `ReferAndEarn.jsx`), with the
  creator-video parts removed.
- Review bar states: **Fresh** (all available) · **In progress** (LinkedIn credited, X
  pending, G2 waiting) · **Not approved** (X rejected: not public).

## TODO

- Map to code once eng picks it up: credits ledger entry types, admin review queue, G2
  webhook or campaign report.

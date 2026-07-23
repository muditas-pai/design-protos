# Gold offer to credit-exhausted power users

A one-hour, 40%-off Gold offer shown on next login to people who are clearly getting value out of
presentations.ai and have just run into the credit wall. One modal, one CTA, one hour.

## Why these people

They are our best evidence of product-market fit and our clearest case of a plan that no longer fits
the person on it. They build constantly, they've already paid us once, and the thing stopping them is
the credit ceiling — not doubt about the product. The pitch isn't "please upgrade," it's "you've
outgrown this plan, here's the one that fits."

## The cohort

Pulled 23 Jul 2026 from ClickHouse events + the MySQL credit ledger. **433 users.** All three
conditions must hold:

| Condition | How it's measured |
|---|---|
| **Active in the last 30 days** | At least one slide-change or share event in the trailing 30 days — real interaction with a deck, not just opening the editor |
| **More than 10 decks built** | Lifetime completed decks (`doc_create_new_finish`, deduped on docId). Median in this group is 29; the busiest has built 757 |
| **At or near the end of credits** | Balance is zero or negative, **or** under 10% of their grant, **or** their recent burn rate says they run dry within 30 days |

**417 of the 433 already pay us.** That is the headline fact about this group — this is not a
free-to-paid pitch, it's a plan-fit pitch.

### How urgent it is for them

| State | Users |
|---|---|
| Already out of credits | 110 |
| Runs dry within a week | 69 |
| Runs dry in one to two weeks | 68 |
| Runs dry in two to four weeks | 123 |
| Under 10% left, burn rate unclear | 63 |

### What they're on today

Pro 151 · Basic 134 · Pro Education 90 · unknown 44 · Starter 9 · **Gold 3 (exclude these)**

### Where they are

India 109 · Indonesia 44 · Brazil 36 · Nigeria 14 · Mexico 13 · Philippines, Saudi Arabia and the
US 11 each · everywhere else 185.

Price-sensitive markets, mostly. 40% is doing real work here — but check discounted Gold against
local Pro pricing before this goes out, so the offer doesn't read as a downgrade in value.

## The offer

| Item | Value |
|---|---|
| Plan | Gold — 50,000 credits |
| Discount | 40% off |
| Window | One hour, from the moment the modal first renders — not from midnight, not from send |
| Clock start | Stored server-side on first render, so a refresh or a device switch doesn't reset it |
| On expiry | Falls back to the normal upgrade path at list price. Don't quietly keep honouring the discount — the timer has to mean something |
| On dismiss | The hour keeps running; a quiet bottom-right banner carries the remaining time so a reflex dismiss doesn't burn the window |

## Copy

```
Setup       {decks} decks in, {firstName} —
Payoff      you've been on a roll.

Body        And you're at the end of your credits. Gold gives you 50,000 —
            enough to keep building without watching the meter.

Offer strip Gold · 50,000 credits            [LIMITED]
            40% off — because you've built so much with us

Timer       Your discount is live for [59:47]

Primary     Get Gold — 40% off
Secondary   Maybe later

Footnote    Your remaining credits carry over.
            Offer ends one hour after you see this.
```

**Near-exhausted variant:** the body reads "you're *near* the end of your credits" when the balance is
above zero. Everything else is identical — one modal covers both states.

**Expired variant:** offer strip goes neutral and reads "The 40% window has closed — Gold is at list
price", the tag flips to `ENDED`, the timer line becomes "Your discount expired", and the CTA becomes
"See Gold plans".

## Tokens

| Token | Source | Fallback |
|---|---|---|
| `{decks}` | Lifetime completed decks (`doc_create_new_finish`, distinct docId) | Drop the number: "You've built a lot of decks" |
| `{firstName}` | Profile first name | Drop the name and the comma |
| `[timer]` | Counts down from 60:00 against the stored show-time | Use the words "for the next hour" — never ship a frozen clock |

## Visual language

- **Brand Blue `#005EFF` carries the offer** — CTA, offer strip, timer chip. This is a growth surface,
  so Brand Blue does the work; navy stays on supporting chrome.
- **Orange appears exactly once**, on the `LIMITED` tag. That's the brand's attention-tag job and the
  only orange on the surface.
- **Setup/payoff headline** — light grey setup line carrying the deck count, bold dark payoff under it.
- **Real product, casually stacked** — four slide thumbnails fanned at the top stand for the decks
  they've built. No abstract illustration, no AI metaphor.
- **Tight corners** — 12px modal, 10px offer strip, 8px buttons, 4–5px tags.
- **One emphatic action.** Primary is Brand Blue filled; "Maybe later" is ghost.

## Build notes

- **One modal covers everyone in the cohort.** No branching beyond the one-word body change above.
- **50,000 is stated, not implied.** Never soften it to "more credits" or "unlimited" — Gold is a
  finite grant, and the number is the strongest thing in the message.
- **Exclude the 3 users already on Gold**, and anyone who upgrades between the pull and the send.
- **Show once.** Fires on next login. If dismissed, the banner carries the clock but the modal does
  not come back, and nothing reappears after expiry.
- **Don't block the deck.** If someone hit the wall mid-generation, this appears *after* the existing
  top-up path, not instead of it.
- **Measure as a cohort.** 433 people, one shot: take-up rate, time-to-click inside the hour, and how
  many upgrade later at list price after letting it lapse. That last number tells us whether the
  urgency earned anything or just discounted people who'd have paid anyway.

## Open questions

- **Is one hour right for a paying customer?** It's a strong pattern for impulse conversion, but these
  people already trust us. A day might convert as well without the pressure — worth an A/B.
- **Should the 110 already at zero get a different window?** They're blocked right now, so the hour is
  pure upside for them; the 123 who are weeks away may just feel rushed.
- **What happens on the second exposure?** If someone lapses and hits the wall again next month, do
  they get another hour, or does the offer burn once per user?

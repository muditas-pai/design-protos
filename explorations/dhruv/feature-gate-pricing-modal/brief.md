---
title: The modal that sells Pro and Gold at a feature gate
created: 31 Jul 2026
status: draft
designer: Dhruv
depth: thorough
---

## What this is

A modal that opens when someone clicks a feature their plan does not include. It sells both paid
plans — Pro and Gold — leading with the feature they just tried to use.

It is triggered by the gate itself, so the person arrives with a specific want already in mind.
Anyone unpaid or part-paid can see it: Free, Basic and Pro users all hit gates. Which plan
actually unlocks the gated feature varies — some gates are Pro, some are Gold.

## The problem

A feature gate today is a dead end. Someone reaches for something, is told no, and leaves — at
the exact moment they have shown us what they want. That intent is the most valuable signal we
get, and we currently spend it on a refusal.

The modal turns the refusal into the pitch: here is the thing you wanted, here is what else comes
with it, here is what you save by taking it now.

## What the person gets

The thing they just tried to do, unblocked — and a look at the rest of what paying opens up,
shown rather than listed.

## What has to be true

The feature they hit is the one selected when the modal opens, and the headline names it.

Gold is the emphatic card every time, whichever plan unlocks the gated feature. When a Pro
feature was gated, this is a deliberate upsell: the person can get what they wanted from the
cheaper plan, and we still lead with Gold.

Four to six features sit in one flat list, the same list every time, whichever gate fired.

Each feature has a small looping video. Switching to a feature changes its video and its copy
together.

A still frame is present for every feature from first paint, and stays if the video has not
loaded, cannot play, or the person has asked for reduced motion. The video area is never empty.

Features only Gold includes are marked with a lock. Selecting one changes nothing on the plan
cards — the two controls stay independent.

When a discount is running, each plan shows the money and the percentage it saves. The rate is
the same on both plans; the money differs because the plans do.

A small timer shows the time left on the discount. The offer runs for one hour, and the hour
starts once — per person, not per view. Someone who dismisses the modal and comes back inside the
hour sees the time that is actually left; someone who comes back after it sees the expired state.

**Plan prices are not shown.** Only the savings appear in the modal; the person sees the price at
checkout. The savings figure stands on its own and is not stated as a comparison against a base
price — a deliberate call, recorded in *Left open* with the risk it carries.

Both plans are reachable — this modal can sell either one, not just Gold.

At 390 the feature story survives whole: video and copy on top, plan cards stacked beneath, the
feature list a horizontal scroller. Nothing is cut.

## States and cases

| State | What the person sees | How they get there |
|---|---|---|
| default | Discount running, gated feature selected and playing, both plan cards with savings, timer counting | Click a gated feature |
| no offer | Same layout, no savings figures, no timer, no discount badge | Click a gated feature while no promo is running |
| offer expired | Timer replaced by a line saying the offer has ended; savings figures come off | The hour runs out with the modal open, or the person returns after it has passed |
| offer part-spent | Timer shows the remaining minutes, not a fresh hour | The person dismisses and returns inside the hour |
| pending | The chosen plan's button acknowledges the click before checkout opens | Click buy on either card |
| already on Pro | The Pro card reads as their current plan and cannot be bought; Gold is the only purchase | A Pro user hits a Gold gate |
| video unavailable | Still frame in the video area, copy unchanged | Video has not loaded, cannot play, or reduced motion is set |

The no-offer state is the ordinary one. A discount is the exception, and the modal has to hold up
without it.

## Backing out

Close button, click outside, and Esc all dismiss it. The person returns to exactly where they
were and the feature stays locked — nothing was bought, so nothing unlocks. There is no
consolation offer and no free single use.

## What varies

**By plan.** Free and Basic users see two buyable plans. A Pro user sees their current plan
marked and only Gold for sale.

**By which gate fired.** Only the preselected feature and the headline change. The list itself
does not.

**By whether a promo is running.** Savings figures, discount badge and timer are present or
absent together.

**By how much of the hour is left.** The timer is per person and does not restart, so a returning
visitor sees a partly-spent hour or an expired offer.

**By width.** 390 stacks and scrolls as described above; 1440 is the full side-by-side layout.

Every one of these gets drawn.

## Out of scope

Proposed, not confirmed — correct these:

- Buying seats, or anything team or Enterprise
- A full plan-comparison table — the switcher is the comparison
- Downgrading, cancelling, or managing an existing plan
- Contact sales
- Taking payment inside the modal; checkout is elsewhere
- Any quieter fallback surface for people who see this often

## Left open

**Which four to six features are in the list.** Dhruv is supplying these, with a video and a
still frame for each. Nothing can be drawn until they land.

**The savings figures themselves**, and the discount percentage. Real numbers needed.

**Disclosure risk on price-free savings.** Settled by decision: the savings figure stands alone and
is not measured against a stated base price. Recording the residual risk rather than reopening it
— several markets require a reference price wherever a saving is advertised, so this is worth a
look from whoever owns pricing compliance before it ships.

**Frequency.** The modal shows on every gate hit with no cap. Whether that is too often cannot be
settled by looking at the design — it needs usage data.

**Whether the timer and the looping video can be judged at all.** Both are moving; a screenshot
catches one frame. If this design is reviewed from stills, its two most distinctive behaviours go
unexamined. Raised here so nobody assumes coverage that does not exist.

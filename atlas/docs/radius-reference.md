# Rounding

What the corners are, and which one goes on what.

Read off two Figma files on 2 Aug 2026 — the design system's Modal page, and ten nodes in
`AMJ '26 Handoff`. Every number below is measured, not proposed. Where the file contradicts itself
it says so rather than picking a winner.

---

## The scale

```
rounded/none      0     structural edges — card rows, table cells, full-bleed sections
rounded/sm        2     tiny — swatches, thumbnails, dense rows          ← settled at 2, 2 Aug 2026
rounded/base      4     the default — buttons, inputs, cards, panels, nav rows
rounded/md        6     floating chrome — inline menus, toolbars, filmstrip, segmented control
rounded/lg        8     large floating containers — modal shell
rounded/xl       12     the prompt card, and hero surfaces that carry the page
rounded/2xl      16     the largest content cards — billing, pricing, plan
rounded/full   9999     pills — badges, chips, avatars, toggles          ← does not exist
```

Six real values, and 16 is the ceiling. **That is the house character** — the corners are sharper
than most product UI, and it is the single most recognisable thing about the surface treatment. The
Figma screens use nothing above 8 except pills; 12 and 16 are established in code and argued for
below.

**Shipped into `atlas/design-system/` on 2 Aug 2026** as a `borderRadius` key and matching
`--rounded-*` CSS variables. The key replaces Tailwind's rather than extending it, so `rounded-3xl`
and up no longer resolve. The scale lives here and nowhere else.

### The rule

**4px unless it is tiny, floats above the canvas, or is the thing the page is about.** Tiny takes
2. Floating chrome takes 6. A large floating container takes 8. The hero surface takes 12.
Everything else — which is most things — is 4.

---

## By component

| Component | Radius | Measured on |
|---|---|---|
| Button, all sizes | `base` 4 | `button/corner/sm` and `button/corner/md` both resolve to 4 |
| Icon-only button | `base` 4 | top-nav icon buttons |
| Text input | `base` 4 | brand-kit URL field, `Input` |
| Menu list item | `base` 4 | `menu/list-item` |
| Alert | `base` 4 | `alert` |
| Tooltip | `base` 4 | `Tooltip Container` |
| Card | `base` 4 | upload card |
| Card row / section | `none` 0 | Title / Body / Color rows — bordered, not rounded |
| Side-nav row | `base` 4 | see the conflict below |
| **Segmented control** | `md` 6 | `segmented-control` |
| **Inline menu** | `md` 6 | `inlinemenu-dark` |
| **Bottom bar** | `md` 6 | `bottom-bar` |
| **Filmstrip** | `md` 6 | `filmstrip` |
| Modal shell | `lg` 8 | the outer `#fafafa` layer carrying the elevation |
| Modal content panel | `base` 4 | the inset white panel |
| Colour swatch strip | `sm` 2 | 32px tall |
| Small thumbnail | `sm` 2 | 40px tile |
| Chip | `full` | written as `32px` |
| Badge | `full` | written as `34px` |
| Avatar | `full` | written as `999px`, and as `5px` in one place |
| Toggle track | `full` | written as `50px` in `pai.css` |
| Modal dismiss | `full` | written as `24px` |

`md` is the answer to the floating-toolbar question. It is not a general-purpose step — every
element carrying it is chrome that hovers over the canvas.

---

## Nesting

The modal is the worked example, and it is the reason the scale needs `lg` at all:

```
modal shell          lg   8px      ┐
  padding             —   4px      │  8 − 4 = 4, so the corners stay parallel
  └── content panel base   4px     ┘
        └── button   base   4px
```

Outer radius minus the padding between them gives the inner radius. Get this wrong in either
direction and the gap between the two curves visibly wobbles along the corner.

It also means **`lg` is a one-per-screen value.** It belongs to the outermost floating thing and
nothing inside it.

---

## `rounded/sm` did not have one value — it is 2

**Settled at 2 on 2 Aug 2026.** At 4 it would be the fourth name for a number `rounded/base`,
`button/corner/sm` and `button/corner/md` already carry — and those last two collide at 4 today,
which is the same fault one step further along. At 2 it has a job nothing else does: the corner for
things too small to take 4, measured on the 32px swatch strip and the 40px thumbnail.

**The Figma edit is still owed.** The token has to be set, and the stale instance fallbacks swept
with it, or the split below survives the decision.

The evidence it was found on:

**The same token resolved to 2 in some screens and 4 in others.**

```
rounded/sm = 2     Brand kit - empty · Detail - page · 846:15688 · 846:16165
rounded/sm = 4     846:22423 · 846:21717 · 857:16836 · 978:31572
```

Both fallbacks are written into instances *in the same node*: `857:16836` carries
`var(--rounded/sm, 4px)` five times and `var(--rounded/sm, 2px)` three times. `846:16165` carries
both too.

The likeliest cause is that the token was rebound at some point and old instances kept the old
fallback. Whatever the cause, **nobody writing `rounded/sm` today knows what they will get**, and
anywhere the variable fails to resolve the fallback decides — differently per instance.

This has to be settled before any of it is ported to code. It is the one finding here that is a
defect rather than an observation.

The screens also split on brand — `#005eff` where `sm` is 2, `#ff5500` where `sm` is 4 — along with
`border/secondary` (`#0b0f1417` vs `#1a1a1a17`) and `border/primary-inverted` (`#0b0f14` vs
`#0a0a0a`). So this may be two libraries rather than one drifting token. Either reading needs the
same fix: one name, one value.

---

## What is missing

**`rounded/full` is not a token, and six different numbers are standing in for it:**

```
24px    modal dismiss button        design system
28px    a container                 857:16836
32px    chip                        846:16165 — 22 uses
34px    badge                       design system · handoff file
50px    toggle track                pai.css
999px   profile avatar              handoff file
```

Six values, one intention. None is wrong on screen — anything past half the height reads as a
circle — but there is no way to check them, and no way to change the shape of every pill at once.
**This is the first token to add.**

---

## Above 8px

The Figma screens stop at 8. Everything larger in them is a pill written as a guess — `999` on a
28px avatar, `34` on a badge, `32` on a 28px chip (43 instances), `28` on a 32px icon cluster. The
only genuine non-pill value above 8 in any screen read is a single `12px` on the side-nav
`workspace-action` wrapper, which is drift.

Code disagrees, and on two of the four values it is right.

**12px — 241 uses. Keep it.** The prompt card carries it, and not by accident:

```
OnboardLandingUI.jsx:2323
  jas26  →  rounded-xl  +  shadow-elevation-03                 the AMJ '26 prompt card
  else   →  rounded-lg  +  bg-bg-elevated p-2                what it used to be
```

The box was moved from 8 to 12 in this cycle, it has an elevation token of its own
(then `shadow-elevation-prompt-card`, folded into `shadow-elevation-03` on 3 Aug 2026), and its edge ring at `:2342` is a matching `rounded-xl`. That is
a considered decision, not drift. **12 is the radius of the surface a screen is built around** —
the prompt box first.

The other 12px uses are less settled: roughly 101 read as cards, 30 as buttons or chips, 16 as
modal shells, 13 as menus. Cards at 12 contradict the handoff, which draws them at 4. Buttons at
12 are simply wrong. **The step survives; where it is spent needs auditing.**

**16px — 114 uses. Kept.** It concentrates on the largest content cards — billing and pricing plan
cards, `min-h-[90px]` with `p-5 sm:p-6`. Nothing in Figma corroborates it, so it rests on the
product alone; it was dropped and then reinstated on 2 Aug 2026 on the grounds that 114 deliberate
uses on one identifiable surface is evidence, even one-sided evidence. It is the ceiling: nothing
above it survives except `full`.

**20px — 33 uses. Not a step. Delete it.**

```
6 uses   editor Floater      w-[1px] h-[34px] … rounded-[20px]     a 1px divider — rounds nothing
6 uses   slideelement/*      roundclass: rounded-[20px]            slide content, not app chrome
```

A radius on a one-pixel line is meaningless, and the slide-element constants style artwork drawn
*into the deck* at slide scale — a different coordinate system that the app's radius scale does not
govern. What is left is scattered and snaps to 16 or 24.

**24px — 39 uses. Mostly `full`.** `FileChip` spends three on a progress bar (`h-full`, width driven
by `file.progress`), the skeleton loader three more on bars. Those are pills. The remainder is small
enough to fold into 16 or `full`.

---

## Most corners are not tokenised

In `846:16165`, `4px` is written as a literal **47 times** against 12 uses of
`var(--rounded/base, 4px)`. In `857:16836` it is 30 literals to 4 token uses.

So the tokens exist, and are mostly bypassed. That matters for the port: publishing a
`borderRadius` scale is not enough on its own — the literals have to be swept, or the scale
describes a system nobody is using.

---

## What the file gets wrong

Recorded so the reference is not read as a description of a tidy file.

**Side-nav rows use two different radii in one screen.** `Back to home` and the active `Brand kit`
row are `4px`; the other seven rows are `8px`. Same component, same list, same screen. 4px is
right — a nav row is not a floating surface.

**Three singletons, all drift:**

| Written | Where | Should be |
|---|---|---|
| `12px` | workspace-action wrapper, side nav | `base` 4 |
| `6px` | workspace row, side nav | `base` 4 — it is not floating chrome |
| `5px` | 28px avatar image | `full` |

**A token bound to the wrong corner.** The trial pill sets `button/corner/md` on three corners and
`button/corner/sm` on the top-right. Both are 4 today so it renders uniform — it breaks the day the
two values differ.

---

## Carrying it into code

Neither `config/tailwind/pai.tailwind.config.js` in `pitchdeckdoclist` nor the `design-system/`
snapshot here defines a `borderRadius` key. **The tokens exist in Figma and were never ported.**

**`rounded-md` in code is not drift.** 668 uses in production, 6px, and Figma has `rounded/md` = 6
carrying the floating-chrome family. The two agree. What is wrong in code is that 6px is being
spent on everything rather than on chrome — but the step itself is legitimate and must survive
into the token file.

Migration, in order of how safe it is:

```
rounded-[4px] → rounded          76 uses    exact, no visual change
rounded-[8px] → rounded-lg       13         exact
rounded-[6px] → rounded-md       22         exact
rounded-[2px] → rounded-sm       13         exact — once sm is settled at 2 or 4
rounded-[100px] / [50px] → full  45         exact
rounded-[12px] → rounded-xl      37         exact
─────────────────────────────────────────
rounded-md (668)                            keep the step, audit where it is spent
rounded-xl (241)                            keep the step, audit — cards and buttons are wrong
rounded-2xl (114)                           keep the step, the largest content cards
rounded-[20px] → delete           33        a 1px divider and slide content; snap the rest
rounded-[24px] → full or 16       25        mostly progress bars and skeletons
rounded-[10px] / [14px] → 12      55        a decision
rounded-[3px] / [5px] → 4         32        a decision
rounded-[1px]                     22        probably a border, look before moving
```

---

## Coverage

Element-level radii were extracted from every `className` in the full text of `846:16165` and
`857:16836`, from the inline code for `Brand kit - empty` (`2307:24345`), the card cluster
`2029:16513`, and the design system's medium modal.

`846:22423`, `846:21717`, `2034:13625`, `846:15688` and `978:31572` contributed their **token
sets** only — that is where the `rounded/sm` split was found — not per-element mapping. Nothing in
them contradicts the table above, but they have not been walked element by element.

Still unsampled: dropdown menus and context menus proper. `menu/list-item` at `base` 4 is the only
menu-family measurement here; the menu container itself has not been read.

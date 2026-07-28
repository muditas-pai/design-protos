# content.md — product truth

owner: growth
as_of: 2026-07-20

**This file, not the state JSON, is the single source of prices, plan names and
limit copy.** The state JSON holds only `plan_id: "gold"` — an id, never the
string "Gold" and never "$40/mo". Two sources for a price is exactly the drift
the harness spec forbids, so a prototype that needs to render a price reads it
from here, and the harness's rendered lint checks the number verbatim against
this file.

A `plan_id` that does not appear below is a **content gap**: halt and ask the
owner, do not invent a number.

| plan_id | display name | price | period | credits/mo | notes |
|---|---|---|---|---|---|
| `free` | Free | $0 | — | 20 | no rollover |
| `pro` | Pro | $20/mo | billed annually | 500 | rollover 30 days |
| `gold` | Gold | $40/mo | billed annually | 5,000 | rollover 90 days |
| `team` | Team | $60/seat/mo | billed annually | 5,000/seat | min 3 seats |

Standing copy:

- credits exhausted, headline: **You're out of credits**
- credits exhausted, reassurance: monthly credits reset on the plan's reset date
- trial, no card on file: the deck reverts to **view-only** at trial end
- never say "your trial has expired" before the day it does

> **This is a spike stand-in.** In the real harness `content.md` lives beside
> `requirements.json` and is owned outside this folder. The numbers above are
> illustrative and have not been checked against production pricing.

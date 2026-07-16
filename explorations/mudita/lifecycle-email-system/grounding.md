# lifecycle-email-system — grounding

Volatile reference for the whole lifecycle email program. Ages with the code and the tooling; don't trust it as current. Specs and protos point here; this never points back.

## The system has two rails

Two completely separate sending rails. They share a voice, not a pipeline.

```
LIFECYCLE EMAIL SYSTEM
│
├─ TRANSACTIONAL   SES · billing rail · fired by billing events
│  ├─ Dunning (annual renewal fail)          dunning-emails.html  ✅ written
│  ├─ Trial-charge fail (Group B)            same doc
│  └─ Team-plan variants                     same doc
│     status: 🔒 blocked — needs the Chargebee migration. The retry /
│     final-attempt / paused webhooks these fire on don't exist until
│     billing moves to Chargebee.
│
└─ MARKETING       Sendy · list + segment · time / membership
   └─ marketing-campaigns.html                ← in progress
      status: NOT blocked by Chargebee. Different rail entirely.
```

## How Sendy fires (the marketing rail)

Sendy is a self-hosted bulk sender on top of Amazon SES. It has exactly three ways to send, and none of them react to in-product events on their own:

| Mechanism | Fires on | Use for |
|---|---|---|
| **Autoresponder** | subscribe-date + elapsed time (Day 0, Day 2, …) | drips: onboarding, education |
| **Segment broadcast** | manual send to a filtered segment | one-offs: news, seasonal offers |
| **List move** | user added to / removed from a list | crossing a state boundary (e.g. free→paid) |

**The one hard constraint:** Sendy only knows what we sync into it — its list membership and its custom fields. It cannot react to "user created their first deck" unless something *writes that state into Sendy* on a schedule. So how behavioral a campaign can be is bounded by that feed.

## OPEN — what does Sendy know about a user?

Unresolved, and it gates every behavioral campaign. Two scenarios, and we design for both until this is answered:

- **Blind** — Sendy has signup date + plan tier only. Campaigns key off time and plan. Onboarding still works fully (pure time drip); reactivation and behavioral free→paid do not.
- **Synced** — a job writes `deck_count`, `last_active`, `activated?` etc. into Sendy custom fields on a schedule. Segments can then be behavioral.

Every campaign in the doc marks which fields it *needs* and flags the behavioral ones as **needs feed** so they're easy to resolve once we know.

## Conventions

- **Merge fields.** Docs use `{{field}}` for readability, matching the dunning doc. In Sendy these are really `[Field name,fallback=there]` tags — translate at build time.
- **Sender.** Marketing sends from a named person, *not* `billing@` (that's the transactional rail's address). Which name/address is a TODO.
- **Voice.** Same as dunning: plain, short, human, honest. No em dashes. Navy = the one action per email. Show real product, not "AI" abstractions.
- **Unsubscribe.** Marketing is bulk/CAN-SPAM territory, so every send carries a real Sendy `[unsubscribe]` footer. Transactional dunning does not (it's account-servicing). Don't cross the wires.

## Deliverables in this folder

- `dunning-emails.html` — transactional copy spec (dunning + trial-fail + team). Done.
- `marketing-campaigns.html` — marketing campaign map + copy. Onboarding written first (highest impact, zero data dependency); rest scaffolded.
- `grounding.md` — this file.

## TODO

- [ ] Resolve the Sendy sync question above — decides how behavioral we can go.
- [ ] Confirm marketing sender name + from-address.
- [ ] Write copy: free→paid conversion (fast follow), feature education, reactivation, broadcast templates.
- [ ] Confirm whether the product already sends a verify/welcome on signup, so onboarding Day 0 doesn't double up.

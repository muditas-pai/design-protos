# Brand kit — ownership, scoping & editing

Where a brand kit lives, how it's scoped, and who can change it. Context:
[grounding](grounding.html).

## Three layers

```
ASSET PORTAL · presentations.ai, internal
  └─ ~200 company brand kits · IMMUTABLE · the canonical source
        │  user from company X signs in → matched by email domain
        │  a COPY (fork) is seeded into their workspace
        ▼
WORKSPACE · the tenant / org
  ├─ "Patagonia"           ← seeded default (a fork — edits stay here)
  ├─ "Patagonia Sales"     ← member-made variant
  └─ "Patagonia Marketing" ← member-made variant
        ✓ visible to + usable by every member of THIS workspace
        ✗ never seen by other workspaces · no merge · no sync back to portal
```

## Scoping — fork on provision

The workspace copy **detaches from the portal the moment it lands**. After that it lives and
changes entirely within its workspace.

```
company patagonia.com
 ├─ Workspace A (Sales lead)      Patagonia*  (A's edits)        ── A's team sees A's edits
 └─ Workspace B (Marketing lead)  Patagonia   (fresh from portal) ── independent
       both forked from the SAME portal kit, then diverge forever
```

- Edits to a workspace kit **never** touch the portal definition or any other workspace.
- A second workspace from the same company always starts from the **pristine** portal version.
- Because the portal source is immutable, **"Reset to original"** (re-fork) is always available.
- Within a workspace, members can create their own **variants** (Patagonia Sales, Patagonia v2).
- No cross-workspace visibility. **No merging** workspaces.

## Who can do what

Editing rights follow blast radius: using a kit affects no one, a variant is additive, but editing
an existing kit changes every deck that uses it.

| Action | Any member | Kit's creator | Admin |
|---|:---:|:---:|:---:|
| **Use** any kit on a deck | ✓ | ✓ | ✓ |
| **Create** a new kit / variant | ✓ | — | ✓ |
| **Edit** a member-created variant | — | ✓ | ✓ |
| **Edit** the company-default (portal-seeded) kit | — | n/a | ✓ |
| **Edit** the asset-portal definition | nobody — immutable | | |

- **Admins + the kit's creator** edit. The portal-seeded default has no creator, so only admins
  edit it. Multiple admins per workspace is allowed and expected.
- Editing is gated behind a **Pro** seat (brand kit is a Pro feature).

## Open threads

- **Portal updates** — when presentations.ai updates a company's portal kit, do already-forked
  workspaces get notified / offered the update? Default: no auto-sync; maybe surface "a newer brand
  kit is available."
- Confirm **company matching** is by verified email domain.
- Where a **done-for-you custom kit** lands — workspace (editable) vs the portal.

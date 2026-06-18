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

**Editing is admin-only.** Anyone in the workspace can *use* any kit; creating and editing kits is
reserved for admins (multiple admins per workspace is fine). If someone else needs to edit a kit,
they have to be **made an admin** first.

| Action | Member | Admin |
|---|:---:|:---:|
| **Use** any kit on a deck | ✓ | ✓ |
| **Create** a new kit / variant | — | ✓ |
| **Edit** any kit (incl. the company-default, portal-seeded one) | — | ✓ |
| **Edit** the asset-portal definition | nobody — immutable | |

- To create or edit a brand kit, a member must be made an **admin** — there is no separate
  brand-editing permission for now.
- Editing is gated behind a **Pro** seat (brand kit is a Pro feature).
- **Finer-grained seats** (e.g. a dedicated brand-editing role distinct from admin) are a
  deliberate **later** decision — not in scope yet.

## Open threads

- **Portal updates** — when presentations.ai updates a company's portal kit, do already-forked
  workspaces get notified / offered the update? Default: no auto-sync; maybe surface "a newer brand
  kit is available."
- Confirm **company matching** is by verified email domain.
- Where a **done-for-you custom kit** lands — workspace (editable) vs the portal.

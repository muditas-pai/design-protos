# assets/logos/

Nine company logos — the row a screen shows to say who already uses this. Lifted from the export
modal, where they ran as a scrolling ticker.

```
logos/
├── index.json      every logo, its display name and file
└── <slug>.svg      the logo, as it arrived
```

## These are real trademarks

The logos are the companies' own, vendored for prototyping. **A screen built on them must not be
shown as a customer claim unless the claim is true.** A logo row is an assertion about who pays you;
mocking one up is fine, sending it to a customer as evidence is not.

| Slug | Name | | Slug | Name |
|---|---|---|---|---|
| `adobe` | Adobe | | `mckinsey` | McKinsey |
| `amazon` | Amazon | | `meta` | Meta |
| `bcg` | BCG | | `microsoft` | Microsoft |
| `ey` | EY | | `notion` | Notion |
| `google` | Google | | | |

Named for the brand rather than the file each arrived as — every one was `<name>logo.svg`, and
inside a folder where they all are, `logo` carries no information.

## Using them

`.pai-ticker` is the component built for exactly this row; the sticker sheet has it. The one part
that is not optional:

```html
<div class="pai-ticker">
  <div class="pai-ticker-track">
    <span class="pai-ticker-item"><img src="../assets/logos/google.svg" alt="Google" /></span>
    …
    <!-- the same items again, marked as scaffolding -->
    <span class="pai-ticker-item" data-ticker-clone aria-hidden="true"><img src="…" alt="" /></span>
  </div>
</div>
```

**The track must hold its contents twice.** It travels exactly −50%, so the second copy lands where
the first began and the loop cannot be seen. One copy and it visibly snaps.

Or read them from the index:

```js
const { logos } = await fetch("assets/logos/index.json").then(r => r.json());
```

## Sizes

They arrived at wildly different weights — Notion is 3 KB, Google is 55 KB — because some are a few
paths and some carry full outlined type. Nothing has been redrawn. If this folder ever needs to
shrink, Google, EY and McKinsey are 75% of it between them.

Every one is a wordmark, or a symbol with its name beside it, so they want **height, not width**:
`.pai-ticker-item img` sets `height` and leaves `width:auto`, and anything sizing them should do the
same. Fixing width squashes Amazon and leaves Notion tiny.

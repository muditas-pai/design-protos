# examples.json — the canonical corpus

`examples.json` is a **flat JSON array**. It ships as `[]` and an empty array is a legal, working
state: `atlas-build` reports an **unanchored run** and builds from the design system alone.

Every row **points at a file that already exists**. Never a copy of one. A second copy of an
artifact drifts from the first, and then nobody knows which one was approved — that is the disease
this index exists to cure. If the file moves, fix the path; if it is deleted, delete the row.

Do's and Don'ts live in **one array**, told apart by `kind`. Two files would drift apart and
nobody diffs them.

---

## Every row

| Field | Type | Meaning |
|---|---|---|
| `kind` | `"do"` \| `"dont"` | which way the row points |
| `path` | string | repo-relative path to a file that exists |
| `what` | string | what kind of thing it is, in plain words — *"the empty state of a list"*, *"a settings page"*. No taxonomy, no codes. This is what selection matches on |
| `approved` | string | when it was signed off, written `31 Jul 2026` |
| `still_valid` | bool | `false` retires the row without deleting it. Only `true` rows reach generation |
| `origin` | `"human"` \| `"harness"` | who made the file. A corpus feeding purely on its own output stops being a standard and becomes an echo, so selection prefers `human` and admits at most one `harness` row per run |

## A **do** adds

| Field | Type | Meaning |
|---|---|---|
| `why_good` | string | what to copy from it. One or two sentences, specific enough to act on — *"the whole state fits without scrolling and the one action is the only filled control on screen"*. "Looks nice" teaches nothing |

## A **dont** adds

| Field | Type | Meaning |
|---|---|---|
| `element` | string | **which part of the file** — a CSS selector where the file has one, else the visible label or region in plain words. A file-level don't is unactionable |
| `problem` | string | what is wrong with that element |
| `instead` | string | **what to do in its place.** Required. A don't with no instruction is a complaint, and it will be rediscovered and re-paid on every run |

---

## Worked rows

```json
[
  {
    "kind": "do",
    "path": "explorations/rae/team-settings/settings-page-v4.html",
    "what": "a settings page with grouped switches",
    "why_good": "Every group is one card with a single heading, the switch sits on the right of its own label, and nothing is explained twice — the description under a switch says what changes, never what a switch is.",
    "approved": "12 Jun 2026",
    "still_valid": true,
    "origin": "human"
  },
  {
    "kind": "dont",
    "path": "explorations/rae/team-settings/settings-page-v2.html",
    "element": "#danger-zone",
    "problem": "The destructive action is styled as a primary filled control, so it reads as the recommended thing to do on the page.",
    "instead": "Use the danger button variants from pai.css — .button-secondary-danger for a destructive action that is not the page's purpose — and leave the filled treatment for the action you want taken.",
    "approved": "12 Jun 2026",
    "still_valid": true,
    "origin": "human"
  }
]
```

## Adding a row

Append it. Keep `path` pointing at the real file. Set `origin` honestly — a harness-generated
artifact somebody liked is still `"harness"`. Retire a row by flipping `still_valid` to `false`
rather than deleting it, so the reason it was ever in here stays readable.

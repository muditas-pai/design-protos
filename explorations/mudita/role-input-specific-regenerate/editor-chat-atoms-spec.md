# Editor Chat — Atom Spec

The refine panel shows **4 items**.

- **The last two are fixed** — `length` and `ai_model`. Both are PRO features, always present, always in that order. They never compete with anything.
- **The first two are composed** — filled by the logic below from the 16-atom dynamic inventory, based on the user's **role** and **input** type.

## Roles solved for

`default` · `leadership` · `consulting` · `sales`

## Inputs solved for

`simple_prompt` · `skeletal_outline` · `detailed_outline` · `unstructured_doc` · `ppt_redesign` · `ppt_rewrite` · `ppt_adapt`

## How the top two slots are filled

1. **Pinned atoms** first — if `pin: "slot1"` is set and the atom is relevant, it takes its slot ahead of everything.
2. **Tier sort** for the rest — `primary` (role atoms) → `secondary` (input atoms) → `tertiary` (universal fallback). Within a tier, file order wins ties.
3. **Gating filter** runs before sort — `skipFor` excludes atoms for specific inputs (wins over `universal`/`role`/`input` matches).

## The 18 atoms

| Atom | Tier | Pin | Gating |
|---|---|---|---|
| `length` | — | — | `fixed: true` |
| `ai_model` | — | — | `fixed: true` |
| `sales_stage` | primary | — | `roles: [sales]`, `inputs: [simple_prompt, skeletal_outline, unstructured_doc, ppt_adapt]` |
| `outcome` | primary | — | `roles: [leadership]`, `skipFor: [ppt_redesign]` |
| `engagement` | primary | — | `roles: [consulting]`, `skipFor: [ppt_redesign]` |
| `cta` | primary | — | `roles: [sales]`, `skipFor: [ppt_redesign]` |
| `pushback` | primary | — | `roles: [consulting, leadership]`, `skipFor: [ppt_redesign]` |
| `add_context` | secondary | **slot1** | `inputs: [simple_prompt]` |
| `narrative` | secondary | — | `inputs: [simple_prompt, skeletal_outline, unstructured_doc, ppt_adapt]` |
| `layout_density` | secondary | — | `inputs: [ppt_redesign]` |
| `copy_density` | secondary | — | `inputs: [ppt_rewrite]` |
| `focus_area` | secondary | — | `inputs: [unstructured_doc]` |
| `research_depth` | secondary | — | `inputs: [simple_prompt, skeletal_outline]` |
| `pull_more_source` | secondary | — | `inputs: [unstructured_doc]` |
| `abstract_more` | secondary | — | `inputs: [unstructured_doc]` |
| `audience_tone` | tertiary | — | `universal: true`, `skipFor: [ppt_redesign]` |
| `theme` | tertiary | — | `universal: true` |
| `visual` | tertiary | — | `universal: true` |

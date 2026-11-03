---
name: illus-role-map
description: Map an illustrated diagram's hard-coded colours to colour roles (primary, surface, accent, line, gloss, fixed), so the drawing follows the brand palette. Runs the rule-based proposer, then corrects it with judgement about what each shape is, writes a role-map JSON, renders a review sheet, and stops for the designer to approve. Use when the user says "map the colours for <drawing>", "make a role map", "make this illustration follow the palette", "tokenise this vector", or hands over a new diagram SVG that still has hex colours. Research spike: never writes to the real resources clone.
---

# Illustration role mapping

Turns a vector's hex colours into a **role map**: one JSON that says, for every colour, what that colour *is*.
A converter then uses the map to swap each hex for a palette token. Background and worked example:
`../README.md`, `../palette-spec.md`, and https://claude.ai/artifact/4z3eHNpGFaWXBLi3oeTCf2

Scripts live in `../snippets/illus-tokens/`. Read `SPEC.md` there, section 4.2, before your first run.

## Hard rules

- **Never set `"approved"`.** Only the designer does. A map with `"approved": null` is a proposal, and the
  converter refuses to use it.
- **Never guess a colour that isn't in the map.** If the converter reports a missing colour, add it to the
  proposal and tell the designer what you added and why.
- **Never convert into the real `resources` clone.** Copy the drawing's files to a scratch folder and point the
  scripts there.
- **Locked colours stay locked**, whatever the palette:
  - the lighthouse tower body is always white
  - bridge water is always blue

  Any new object with a real-world colour (water, skin, gold, fire, a white lighthouse) gets `fixed`. Flag it to the
  designer as a candidate for a named locked colour.
- Change colours only. Ids, text boxes, point groups and transforms stay byte for byte.

## Steps

1. **Find every version of the drawing.** A drawing `<id>` exists as `<id>2node.svg` … `<id>6node.svg` in each
   style folder (`solid`, `fade`, `fadertl`, `faddedcolor`) under `genericassets/shapes/`. Copy them all to a
   scratch folder that keeps that structure. The map has to cover the colours of every version.

2. **Run the proposer** on the scratch copy:
   ```bash
   python3 ../snippets/illus-tokens/propose_role_maps.py <scratch-resources> <id>
   ```
   It writes `role-maps/<id>.json`, with a role per colour, the area share by role, and **flags**.

3. **Look at the drawing.** Render the solid version at its lowest point count, then render each role in a loud
   colour: `proposal_sheet.py <scratch-resources> out.html` shows it as drawn, in role colours, and on real
   palettes. Do this before you correct anything. The rules only see colour, never meaning.

4. **Correct the roles.** Work through these questions in order, and write down your answer to each:
   - **What is the hero object?** It gets `primary`, even if it's white or grey. On the lighthouse the rules
     filed the white tower under surface. It had to be moved to primary, with its base set by hand to 0.90.
   - **Which small parts should pop?** They get `accent`: stripes, a lamp, a flag, a dart.
   - **What's quiet and supporting?** Rocks, ground and props get `surface`.
   - **Is each dark colour a line or a shadow?** Outlines and windows get `line`. A dark face of an object stays in
     its own role, and the tone sorts it to `shade` or `deep`.
   - **Does anything have a colour it must keep?** It gets `fixed`.
   - **Did the skin flag fire?** The rule flags warm mid-tones as skin. On the lighthouse it caught the lamp glow,
     which is really `accent`.

   The tools beyond `colours`:
   - **Force a tone:** `"#63000c": "primary-shade"`, when the automatic tone reads wrong.
   - **`elements`:** set one shape by id, whatever its colour.
   - **`base`:** set the lightness a role is measured from.

5. **Write a `note`** in the JSON: one line per decision, in plain words. For example: "White tower → primary
   (base set to the tower white) · red stripe, lamp and glow → accent · rock greys → surface · windows → line."

6. **Show the result and stop.** Render `proposal_sheet.py` again and send the designer:
   - the review sheet
   - a table of each part, its colours, what the rule said, and what you chose
   - every flag you didn't resolve

   Then wait for them to approve or edit the map.

7. **After approval** (the designer has set `"approved": "<date>"`), convert the scratch copy and render the review
   sheet:
   ```bash
   python3 ../snippets/illus-tokens/convert_drawings.py <scratch-resources> --only <id>
   python3 ../snippets/illus-tokens/review_sheet.py <scratch-resources> review.html --ids <id>
   ```

## What to check on the review sheet

- **Light slide:** does the hero still read as the hero?
- **Neighbouring facets:** do they stay distinct, or have they merged into one flat block?
- **Accents:** does any accent turn muddy or grey?
- **Locked colours:** do they look right next to the palette colours around them?
- **Dark objects:** does a big dark object come out washed-out pale? That's a known limit: neutrals sit light on
  light slides.

## Role map shape

```json
{
  "id": "lighthouse",
  "note": "White tower → primary (base set to the tower white) · red stripe, lamp and glow → accent · …",
  "approved": null,
  "base": { "primary": 0.9, "surface": 0.693, "accent": 0.822 },
  "vars": { "--th-section-color3": "line" },
  "elements": {},
  "colours": { "#b61c23": "accent", "#565454": "surface", "#607476": "line", "#fff": "primary" }
}
```

Roles: `primary | surface | accent | line | gloss | panel | card | fixed`, optionally with a forced tone:
`primary-` or `surface-` plus `highlight | light | soft | base | dim | shade | deep`, or `accent-` plus
`light | base | shade`. The `role-maps/` folder has 65 real examples. `lighthouse.json` and `iceberg.json` were
decided by hand.

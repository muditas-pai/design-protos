# Gradient fix: give each inlined drawing its own gradient ids

Written 21 Oct 2026. Owner: Mudita (design). For: whoever owns `react_diagrams_lib`. Companion to `SPEC.md` §5 (illustration colour tokens).

**Why it matters to the spike:** without it, drawings with gradients look wrong whenever two copies sit on different backgrounds, even though the colour approach is correct. It also fixes a quieter version of the same bug that exists today.

## 1. The bug

Diagram drawings are inlined into the page. A shape filled with `url(#some-gradient)` uses the **first** element with that id anywhere in the document, and that gradient's stops take their colours from where **it** sits, not from where the shape sits.

The drawing files use the same gradient ids in every copy, e.g. `lighthouse2node-linear-gradient` (lighthouse has 48 gradients). So:

```
slide 3 (light)  lighthouse ── owns gradient "lighthouse2node-linear-gradient" → light-slide tokens
slide 7 (dark)   lighthouse ── fill="url(#lighthouse2node-linear-gradient)"
                               ──▶ resolves to slide 3's gradient → light-slide colours on a dark slide ✗
                               flat fills on slide 7 are correct ✓ (only gradients are wrong)
```

Reproduced in Chrome on 21 Oct 2026: two copies of one drawing under different `--th-illus-*` values. The dark copy's flat circle was blue (correct) and its gradient yellow (borrowed from the first copy).

**Why it shows up now:** before the tokens, gradient stops were hard-coded, so every copy looked the same and the collision was invisible. With tokens, stops change with the background.

**Where you'll see it:** any page with two copies of a drawing on different backgrounds: the filmstrip, Present mode, and the Browse Templates preview grid. About 774 drawings already shipping use theme variables in gradient stops and have the same latent bug.

**Not affected:** PPTX/PDF export. Each exported drawing is a standalone SVG with its own gradients (checked: the exported SVG resolves every stop to plain colours).

## 2. The fix

When the library inlines a drawing, prefix every id that something in the drawing **references** (gradients, clip paths, masks, filters, markers, patterns, `<use>` targets) with an id unique to that copy, and rewrite the references to match.

**Only referenced ids are renamed.** The library finds content rects and point groups with substring selectors (`rect[id*='content']`, `g[id*='-point']`, `g[id*="-placeholder"]` …). None of those elements are referenced by `url(#…)`, so they keep their ids. And because the change is a *prefix*, even a renamed id still matches any `[id*=…]` selector it matched before.

### 2.1 Where

`react_diagrams_lib/src/components/NonLinearDiagram.jsx`, in `parseSvgElement` (around line 695), right after:

```js
const svgElement = doc.querySelector("svg");
```

That runs once per load, before `drawNonLinearAsset` inserts the SVG. Redraws (`drawNonLinearAsset(…, isRedraw = true)`) reuse the inserted element, so they're already covered. The helper is idempotent anyway.

Edit the source, not the built bundles in pitchdeckdoclist (`index.js`, `index.esm.js` and their maps).

### 2.2 The scope must be unique per copy, not per diagram

`diagramId` alone isn't enough. The editor slide and its filmstrip thumbnail render the same diagram data, and template previews can share ids from the template JSON. Use `diagramId` plus a per-mount counter, created once per mount:

```js
// Module level
let svgInstanceCounter = 0;

// In NonLinearDiagramContent: a lazy ref, so the counter moves once per mount, not on every render
const svgIdScope = useRef(null);
if (!svgIdScope.current) svgIdScope.current = `${diagramId}-${++svgInstanceCounter}`;

// In parseSvgElement, after `const svgElement = doc.querySelector("svg");`
scopeSvgReferenceIds(svgElement, svgIdScope.current);
```

### 2.3 The helper

Suggested home: `react_diagrams_lib/src/utils/scopeSvgReferenceIds.js`.

```js
/**
 * Inlined SVGs share one document, and url(#id) / href="#id" resolve to the FIRST element with that id on the
 * page. Two copies of a drawing on different backgrounds would then share the first copy's gradients (and
 * clip paths, masks, filters…), with that copy's theme colours. Prefix every referenced id with a per-copy
 * scope and rewrite its references. Ids nothing references (content rects, point and placeholder groups) are
 * left alone; a prefix keeps renamed ids matching the [id*=…] selectors used elsewhere.
 */
const URL_REFERENCE = /url\(\s*(['"]?)#([^'")\s]+)\1\s*\)/g;
const isHrefAttribute = (name) => name === "href" || name === "xlink:href";

export const scopeSvgReferenceIds = (svgElement, scope) => {
    if (!svgElement || !scope || svgElement.hasAttribute("data-ids-scoped")) return;
    svgElement.setAttribute("data-ids-scoped", "true");

    const elements = [svgElement, ...svgElement.querySelectorAll("*")];
    const styleBlocks = elements.filter((el) => el.tagName.toLowerCase() === "style");

    // 1. Which ids are referenced: url(#…) in any attribute or <style> block, and local href="#…".
    const referenced = new Set();
    elements.forEach((el) => {
        for (const attr of el.attributes) {
            if (isHrefAttribute(attr.name)) {
                if (attr.value.startsWith("#")) referenced.add(attr.value.slice(1));
            } else {
                for (const match of attr.value.matchAll(URL_REFERENCE)) referenced.add(match[2]);
            }
        }
    });
    styleBlocks.forEach((style) => {
        for (const match of style.textContent.matchAll(URL_REFERENCE)) referenced.add(match[2]);
    });
    if (!referenced.size) return;

    const scoped = (id) => (referenced.has(id) ? `${scope}-${id}` : id);
    const rewriteUrls = (text) => text.replace(URL_REFERENCE, (all, quote, id) => `url(${quote}#${scoped(id)}${quote})`);

    // 2. Rename the referenced elements and rewrite every reference to them.
    elements.forEach((el) => {
        if (el.id && referenced.has(el.id)) el.id = scoped(el.id);
        for (const attr of el.attributes) {
            if (isHrefAttribute(attr.name)) {
                // External hrefs (e.g. the swappable <image> in svgimagechange drawings) don't start with "#".
                if (attr.value.startsWith("#")) attr.value = `#${scoped(attr.value.slice(1))}`;
            } else if (attr.value.includes("url(")) {
                attr.value = rewriteUrls(attr.value);
            }
        }
    });

    // 3. <style> blocks: url(#…) references, plus #id selectors that point at a renamed id.
    //    Motion blocks that target point groups are untouched, because those ids aren't renamed.
    styleBlocks.forEach((style) => {
        style.textContent = rewriteUrls(style.textContent).replace(/#([A-Za-z_][\w-]*)/g, (all, id) => (referenced.has(id) ? `#${scope}-${id}` : all));
    });
};
```

**Tested on 21 Oct 2026** in Chrome, on the reproduction from §1 plus a gradient that inherits from another gradient (`xlink:href="#…"`) and a quoted `url('#…')`. After the helper, each copy's gradients followed its own background. The content rect and point group kept their ids, and `rect[id*='content']` and `g[id*='-point']` still found them.

## 3. Check before merging

```
case                                                     expect
one drawing on a light slide and a dark slide            each copy's gradients follow its own slide
filmstrip next to the editor                             thumbnail matches the slide
Browse Templates grid (several copies at once)           every tile correct
Present mode                                             point-group animations unchanged
svgimagechange drawings (swappable image)                image swap still works (external href untouched)
undo / redo of a diagram                                 no double prefix (data-ids-scoped guard)
PPTX and PDF export                                      colours match the editor
an existing drawing with var() gradient stops            also fixed (about 774 such files ship today)
```

Also look for any other place the library inlines drawing SVGs (for example a path that re-parses the file after an asset swap), and call the helper there too.

## 4. Why not fix it in the drawing files

The files can't know how many copies of themselves will be on a page or which backgrounds those copies sit on. Unique-per-file ids, as today, still collide across copies. The scope has to be added when each copy is inserted, which only the library can do.

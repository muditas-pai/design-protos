/* Which file does an annotation go in?

   Two answers, and the compose form asks which one you mean:

     component scope  the file that DECLARES the anchor, so the note follows
                      that part onto every screen it renders on
     route scope      the exploration file you are currently looking at, so the
                      note stays on that variation only

   Both maps are derived from source at load time — nothing hand-maintained. */

const canonicalRaw = import.meta.glob('../canonical/**/*.jsx', {
  eager: true, query: '?raw', import: 'default',
})
const explorationRaw = import.meta.glob('../explorations/**/*.jsx', {
  eager: true, query: '?raw', import: 'default',
})

const strip = (p) => p.replace(/^\.\.\//, '')
const toAnnotations = (p) => strip(p).replace(/\.jsx$/, '.annotations.json')

/* anchor id → the annotations file beside the component that declares it */
export const ANCHOR_FILE = {}
for (const [path, src] of Object.entries(canonicalRaw)) {
  for (const m of src.matchAll(/data-annotate="([^"]+)"/g)) {
    ANCHOR_FILE[m[1]] ??= toAnnotations(path)
  }
}

/* route pathname → the annotations file beside that exploration */
export const ROUTE_FILE = {}
for (const path of Object.keys(explorationRaw)) {
  const m = strip(path).match(/^explorations\/([^/]+)\/([^/]+)\/([^/]+)\.jsx$/)
  if (!m) continue
  ROUTE_FILE[`/x/${m[1]}/${m[2]}/${m[3].toLowerCase()}`] = toAnnotations(path)
}

/* an exploration may declare its own anchors; those still belong to its file */
for (const [path, src] of Object.entries(explorationRaw)) {
  for (const m of src.matchAll(/data-annotate="([^"]+)"/g)) {
    ANCHOR_FILE[m[1]] ??= toAnnotations(path)
  }
}

export function targetsFor(anchor, pathname) {
  const component = ANCHOR_FILE[anchor] ?? null
  const route = ROUTE_FILE[pathname] ?? null
  return { component, route }
}

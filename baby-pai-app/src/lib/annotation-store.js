/* The annotation store — globbed, and imported by both the overlay and the
   composer. Split out so neither imports the other (a circular import here
   fails at runtime with "Cannot access 'ALL' before initialization").

   Files are co-located, so THE FILE'S LOCATION IS THE SCOPE:
     a file under canonical/     applies wherever that part renders
     a file under explorations/  applies on that one route only
*/
const canonicalFiles = import.meta.glob('../canonical/**/*.annotations.json', {
  eager: true, import: 'default',
})
const explorationFiles = import.meta.glob('../explorations/**/*.annotations.json', {
  eager: true, import: 'default',
})

function normalise(entries, source, route) {
  return (Array.isArray(entries) ? entries : []).map((a, i) => ({
    ...a, source, route, index: i, key: `${source}#${a.anchor}#${i}`,
  }))
}

export const ALL = [
  ...Object.entries(canonicalFiles).flatMap(([path, entries]) =>
    normalise(entries, path.replace(/^\.\.\//, ''), null)),
  ...Object.entries(explorationFiles).flatMap(([path, entries]) => {
    const m = path.match(/explorations\/([^/]+)\/([^/]+)\/([^/]+)\.annotations\.json$/)
    const route = m ? `/x/${m[1]}/${m[2]}/${m[3].toLowerCase()}` : null
    return normalise(entries, path.replace(/^\.\.\//, ''), route)
  }),
]

/* what applies on the route currently open */
export function annotationsFor(pathname) {
  return ALL.filter((a) => a.still_valid !== false && (a.route === null || a.route === pathname))
}

/* slugs already in use, so the composer can offer them and build a count */
export const RULES = [...new Set(ALL.map((a) => a.rule).filter(Boolean))].sort()

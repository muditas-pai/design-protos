/* ============================================================================
   Deck library — real decks to prototype against, instead of one placeholder
   thumbnail repeated six times.

   Pages are globbed from the file tree, so adding a deck is dropping a folder
   into src/assets/decks/<slug>/ with page-NN.jpg files. No registry to edit,
   same rule as components, screens, flows and explorations.

   Source PNGs were 1920×1080; these are 480px JPEGs because nothing renders
   them larger than a 366px card. 89 pages, 2.3 MB total.
   ========================================================================== */

const files = import.meta.glob('../assets/decks/**/page-*.jpg', {
  eager: true, query: '?url', import: 'default',
})

/* Titles are the only thing a folder name can't carry. A deck with no entry
   here still works — it just falls back to its slug. */
const META = {
  'ibm-security-data-breach-23': {
    title: "IBM Security: Cost of a Data Breach Report '23", kind: 'Report',
  },
  'nayture-patagonia-brand-23': {
    title: "Nayture: Building a Brand Like Patagonia '23", kind: 'Brand',
  },
  'palantir-q1-investor-25': {
    title: "Palantir: Q1 Investor Presentation '25", kind: 'Investor',
  },
  'refresh-capabilities-24': {
    title: "Refresh: Capabilities Deck '24", kind: 'Capabilities',
  },
  'strava-year-in-sport-21': {
    title: "Strava: Year in Sport '21", kind: 'Data story',
  },
  'nyt-investor-day-22': {
    title: "The New York Times: Investor Day '22", kind: 'Investor',
  },
}

const grouped = {}
for (const path in files) {
  const m = path.match(/decks\/([^/]+)\/(page-\d+)\.jpg$/)
  if (!m) continue
  const [, slug, page] = m
  ;(grouped[slug] ??= []).push({ page, src: files[path] })
}

export const deckLibrary = Object.entries(grouped)
  .map(([slug, pages]) => {
    const sorted = pages.sort((a, b) => a.page.localeCompare(b.page))
    return {
      slug,
      title: META[slug]?.title ?? slug,
      kind: META[slug]?.kind ?? 'Deck',
      cover: sorted[0].src,
      pages: sorted.map((p, i) => ({ n: i + 1, src: p.src })),
    }
  })
  .sort((a, b) => a.title.localeCompare(b.title))

export const deckBySlug = (slug) => deckLibrary.find((d) => d.slug === slug)

/* every page across every deck, for anything that just wants slide imagery */
export const allPages = deckLibrary.flatMap((d) =>
  d.pages.map((p) => ({ ...p, deck: d.slug, title: d.title })))

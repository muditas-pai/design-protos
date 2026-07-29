/* TOKEN ALTITUDE — no component is replaced at all. These CSS vars are scoped
   to this route, so the whole screen restyles and every component stays
   canonical. This is the altitude for "what if our surfaces were warmer".

   Caveat worth knowing: this altitude reaches exactly the values that are
   already CSS vars. Radius and spacing are literals in the ported screen CSS,
   so they can't be explored this way yet — the same gap design-system/pai.css
   has today (tokens for colour and shadow, none for radius or spacing). */
export const title = 'Warm paper surfaces'

export const tokens = {
  '--bg': '#efe9dd',
  '--sidebar-bg': '#efe9dd',
  '--main-bg': '#fdfaf3',
  '--surface': '#fffdf7',
  '--surface-2': '#f3ede1',
  '--line': 'rgba(74, 58, 32, 0.14)',
  '--line-strong': 'rgba(74, 58, 32, 0.26)',
  '--sel': 'rgba(74, 58, 32, 0.09)',
  '--fg': '#241d12',
  '--fg-2': '#5c5040',
  '--fg-3': '#a2937d',
  '--sh-card': '0 2px 8px -2px rgba(74,58,32,.12), 0 0 0 1px rgba(74,58,32,.09)',
  '--sh-btn': '0 1px 2px 0 rgba(74,58,32,.08), 0 0 0 1px rgba(74,58,32,.10)',
  '--sh-pill': '0 3px 10px -2px rgba(74,58,32,.14), 0 0 0 1px rgba(74,58,32,.08)',
}

export default {}

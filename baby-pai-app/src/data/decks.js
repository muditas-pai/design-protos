import { deckLibrary } from './deck-library'

/* Fixture data. Not product truth — prices, plan names and limit copy belong in
   a content file with an owner and an as_of, not here. */

export const brand = {
  name: 'Shopify',
  tint: 'rgba(149, 192, 73, 0.2)',
  palette: ['#95c049', '#fbf7ed', '#002e25', '#ffffff'],
}

const SUBS = [
  'In Drafts • Created by You',
  'In Drafts • updated 2 days ago',
  'Shared with Me • updated 5 days ago',
  'In Drafts • Created by You',
  'In Drafts • updated 1 week ago',
  'Shared with Me • updated 3 days ago',
]

/* The dashboard grid, backed by the real deck library — six different decks
   with their own covers, rather than one placeholder repeated. */
export const decks = deckLibrary.map((d, i) => ({
  id: d.slug,
  title: d.title,
  sub: SUBS[i % SUBS.length],
  thumb: d.cover,
  pages: d.pages.length,
}))

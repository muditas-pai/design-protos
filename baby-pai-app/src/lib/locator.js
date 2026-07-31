/* Describing an element well enough to find it again, and well enough to still
   understand the note if we can't.

   The earlier design only let you annotate elements someone had pre-tagged with
   data-annotate. That made capture serve storage: you could only judge what had
   already been anticipated. Now any element is annotatable, and we capture a
   rich descriptor instead of relying on one stable id.

   A selector may rot. The region, tag, classes and text will still tell a human
   or an LLM what the note was about, which is what actually matters when the
   analysis pass tries to re-anchor it. */

const IGNORED = /^(anno-|is-|has-)/

export function meaningfulClasses(el) {
  return [...el.classList].filter((c) => !IGNORED.test(c))
}

/* the nearest ancestor someone named, so notes cluster by region even when the
   clicked element is three levels deep and anonymous */
export function nearestRegion(el) {
  const named = el.closest('[data-annotate]')
  return named ? named.dataset.annotate : null
}

function segment(el) {
  if (el.id) return `#${el.id}`
  if (el.dataset.annotate) return `[data-annotate="${el.dataset.annotate}"]`
  const cls = meaningfulClasses(el)
  const base = cls.length ? `${el.tagName.toLowerCase()}.${cls[0]}` : el.tagName.toLowerCase()
  const sibs = [...(el.parentElement?.children ?? [])].filter(
    (s) => s.tagName === el.tagName && meaningfulClasses(s)[0] === cls[0],
  )
  return sibs.length > 1 ? `${base}:nth-of-type(${sibs.indexOf(el) + 1})` : base
}

export function selectorFor(el) {
  const parts = []
  let node = el
  while (node && node !== document.body && parts.length < 6) {
    parts.unshift(segment(node))
    if (node.id || node.dataset.annotate) break
    node = node.parentElement
  }
  return parts.join(' > ')
}

/* short human label for the hover chip */
export function labelFor(el) {
  const cls = meaningfulClasses(el)[0]
  const tag = el.tagName.toLowerCase()
  const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 28)
  return `${cls ? `${tag}.${cls}` : tag}${text ? `  “${text}”` : ''}`
}

export function describe(el, pathname) {
  const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ')
  return {
    region: nearestRegion(el),
    selector: selectorFor(el),
    tag: el.tagName.toLowerCase(),
    classes: meaningfulClasses(el),
    ...(text ? { text: text.slice(0, 120) } : {}),
    route: pathname,
  }
}

/* resolve a stored descriptor back to a live element, best effort */
export function resolve(at) {
  if (!at) return null
  try {
    const hit = document.querySelector(at.selector)
    if (hit) return hit
  } catch { /* selector no longer parses */ }
  if (at.region) {
    const r = document.querySelector(`[data-annotate="${at.region}"]`)
    if (r && at.text) {
      const match = [...r.querySelectorAll('*')].find(
        (e) => (e.textContent ?? '').trim().replace(/\s+/g, ' ').startsWith(at.text.slice(0, 40)),
      )
      if (match) return match
    }
    if (r) return r
  }
  return null
}

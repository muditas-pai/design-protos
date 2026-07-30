import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

/* ============================================================================
   Annotations — located judgements, kept in the repo, shown on the screen.

   Files are globbed and co-located, so THE FILE'S LOCATION IS THE SCOPE:

     a file under canonical/     applies wherever that part renders
     a file under explorations/  applies on that one route only

   Capture records evidence only. Nothing here proposes a home for an
   annotation — that is the analysis pass (`npm run annotations`), deliberately
   separated so the person pinning a note isn't also routing it by gut.
   ========================================================================== */

const canonicalFiles = import.meta.glob('../canonical/**/*.annotations.json', {
  eager: true, import: 'default',
})
const explorationFiles = import.meta.glob('../explorations/**/*.annotations.json', {
  eager: true, import: 'default',
})

function normalise(entries, source, route) {
  return (Array.isArray(entries) ? entries : []).map((a, i) => ({
    ...a, source, route, key: `${source}#${a.anchor}#${i}`,
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

const Ctx = createContext({ open: false })
export const useAnnotations = () => useContext(Ctx)

/* ── the overlay ─────────────────────────────────────────────────────────── */

export function AnnotationLayer() {
  const [open, setOpen] = useState(false)
  const [pins, setPins] = useState([])
  const [selected, setSelected] = useState(null)
  const { pathname } = useLocation()
  const raf = useRef(0)

  // Shift-C toggles, matching the way a designer expects comments to work
  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey && (e.key === 'C' || e.key === 'c') && !/input|textarea/i.test(e.target.tagName)) {
        e.preventDefault()
        setOpen((v) => !v)
        setSelected(null)
      }
      if (e.key === 'Escape') { setOpen(false); setSelected(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // measure every anchored element while the layer is open
  useLayoutEffect(() => {
    if (!open) { setPins([]); return }
    const applicable = annotationsFor(pathname)
    const byAnchor = applicable.reduce((m, a) => ((m[a.anchor] ??= []).push(a), m), {})

    const measure = () => {
      const next = []
      document.querySelectorAll('[data-annotate]').forEach((el) => {
        const id = el.dataset.annotate
        const r = el.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) return
        next.push({ id, rect: { top: r.top, left: r.left, width: r.width, height: r.height },
                    notes: byAnchor[id] ?? [] })
      })
      setPins(next)
      raf.current = requestAnimationFrame(measure)
    }
    measure()
    return () => cancelAnimationFrame(raf.current)
  }, [open, pathname])

  if (!open) return <Ctx.Provider value={{ open }}><HintOnce /></Ctx.Provider>

  const counts = pins.reduce((c, p) => {
    p.notes.forEach((n) => { c[n.verdict] = (c[n.verdict] ?? 0) + 1 })
    if (p.notes.length === 0) c.bare += 1
    return c
  }, { good: 0, bad: 0, bare: 0 })

  return (
    <Ctx.Provider value={{ open }}>
      <div className="anno-layer" aria-live="polite">
        {pins.map((p) => (
          <div
            key={p.id}
            className={`anno-box${p.notes.length ? '' : ' is-bare'}`}
            style={{ top: p.rect.top, left: p.rect.left, width: p.rect.width, height: p.rect.height }}
          >
            {p.notes.length > 0 && (
              <button
                className={`anno-pin is-${p.notes[0].verdict}`}
                onClick={() => setSelected(selected?.id === p.id ? null : p)}
                aria-label={`${p.notes.length} annotation on ${p.id}`}
              >
                {p.notes.length}
              </button>
            )}
          </div>
        ))}

        {selected && <AnnotationCard pin={selected} onClose={() => setSelected(null)} />}

        <div className="anno-bar">
          <span className="anno-bar-title">Annotations</span>
          <span className="anno-chip is-good">{counts.good} good</span>
          <span className="anno-chip is-bad">{counts.bad} bad</span>
          <span className="anno-chip is-bare">{counts.bare} unjudged</span>
          <span className="anno-bar-hint">Shift-C to hide</span>
        </div>
      </div>
    </Ctx.Provider>
  )
}

function AnnotationCard({ pin, onClose }) {
  const top = Math.min(pin.rect.top, window.innerHeight - 300)
  const left = Math.min(pin.rect.left + pin.rect.width + 12, window.innerWidth - 372)
  return (
    <div className="anno-card" style={{ top: Math.max(12, top), left: Math.max(12, left) }}>
      <div className="anno-card-head">
        <code>{pin.id}</code>
        <button onClick={onClose} aria-label="Close"><i className="ph ph-x" /></button>
      </div>
      {pin.notes.map((n) => (
        <div key={n.key} className={`anno-note is-${n.verdict}`}>
          <span className={`anno-verdict is-${n.verdict}`}>{n.verdict}</span>
          <p className="anno-text">{n.note}</p>
          {n.instead && <p className="anno-instead"><strong>Instead</strong> {n.instead}</p>}
          {n.why && <p className="anno-why">{n.why}</p>}
          <div className="anno-meta">
            {n.rule && <code>{n.rule}</code>}
            <span>{n.status ?? 'proposed'}</span>
            <span>{n.author}</span>
            <span>{n.as_of}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* one-time nudge so the affordance is discoverable at all */
function HintOnce() {
  const [seen, setSeen] = useState(() => sessionStorage.getItem('anno-hint') === '1')
  useEffect(() => {
    if (seen) return
    const t = setTimeout(() => { sessionStorage.setItem('anno-hint', '1'); setSeen(true) }, 6000)
    return () => clearTimeout(t)
  }, [seen])
  if (seen) return null
  return <div className="anno-hint"><kbd>Shift</kbd> <kbd>C</kbd> annotations</div>
}

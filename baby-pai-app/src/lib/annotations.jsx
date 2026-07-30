import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { annotationsFor } from './annotation-store'
import { describe, labelFor, resolve } from './locator'
import AnnotationComposer from './AnnotationComposer'

/* ============================================================================
   Annotations — Shift-C.

   Hover anything to select it. [ and ] narrow and widen the selection through
   the DOM, so you can judge a nav item, its nav, or the whole sidebar. Click
   to write a note.

   Capture asks two things: good or bad, and what you see. It does NOT ask for
   a rule slug, a principle, or an "instead" — those are inferences, and making
   a person type them while looking at a screen is asking them to do the
   analysis pass's job with none of its context. `npm run annotations` emits
   the evidence for that pass instead.
   ========================================================================== */

const sameRect = (a, b) =>
  a && b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height

const isOverlay = (el) => !!el?.closest?.('.anno-layer, .anno-card, .anno-bar, .anno-hint')

export function AnnotationLayer() {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(null)     // { el, rect, label }
  const [level, setLevel] = useState(0)        // ancestors up from the cursor
  const [picked, setPicked] = useState(null)   // frozen selection being composed
  const [existing, setExisting] = useState([])
  const [reading, setReading] = useState(null)
  const { pathname } = useLocation()
  const raf = useRef(0)
  const cursor = useRef(null)
  const hoverRef = useRef(null)

  const close = useCallback(() => { setPicked(null); setReading(null) }, [])

  useEffect(() => {
    const onKey = (e) => {
      const typing = /input|textarea/i.test(e.target.tagName)
      if (e.shiftKey && e.key.toLowerCase() === 'c' && !typing) {
        e.preventDefault(); setOpen((v) => !v); close(); setLevel(0)
      }
      if (!open || typing) return
      if (e.key === 'Escape') close()
      if (e.key === ']' || e.key === 'ArrowUp') { e.preventDefault(); setLevel((l) => l + 1) }
      if (e.key === '[' || e.key === 'ArrowDown') { e.preventDefault(); setLevel((l) => Math.max(0, l - 1)) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    const onMove = (e) => { cursor.current = { x: e.clientX, y: e.clientY } }
    const onClick = (e) => {
      if (isOverlay(e.target)) return          // the card and bar stay interactive
      if (picked || reading) return
      const h = hoverRef.current
      if (!h) return
      e.preventDefault(); e.stopPropagation()  // don't fire the product's own handler
      setPicked({ el: h.el, rect: h.rect, at: describe(h.el, pathname) })
    }
    window.addEventListener('mousemove', onMove)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('click', onClick, true)
    }
  }, [open, picked, reading, pathname])

  useLayoutEffect(() => {
    if (!open) { setHover(null); setExisting([]); return }

    const tick = () => {
      /* An annotation that doesn't resolve here is usually just a note about a
         component this screen doesn't render — normal, not rot. Telling the two
         apart needs a pass over every route, so it isn't the bar's job. */
      const found = []
      for (const a of annotationsFor(pathname)) {
        const el = a.at ? resolve(a.at) : document.querySelector(`[data-annotate="${a.anchor}"]`)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.width || r.height) found.push({ ...a, rect: r })
      }
      setExisting(found)

      if (!picked && cursor.current) {
        let el = document.elementFromPoint(cursor.current.x, cursor.current.y)
        if (isOverlay(el)) el = null
        for (let i = 0; el && i < level; i++) el = el.parentElement
        if (el && el !== document.body && el !== document.documentElement) {
          const next = { el, rect: el.getBoundingClientRect(), label: labelFor(el) }
          hoverRef.current = next
          // only re-render when the target or its geometry actually moved
          setHover((prev) => (prev?.el === el && sameRect(prev.rect, next.rect)) ? prev : next)
        } else { hoverRef.current = null; setHover(null) }
      }
      raf.current = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf.current)
  }, [open, pathname, level, picked])

  if (!open) return <HintOnce />

  const good = existing.filter((a) => a.verdict === 'good').length
  const bad = existing.length - good

  return (
    <div className="anno-layer">
      {existing.map((a) => (
        <div key={a.key} className="anno-box"
             style={{ top: a.rect.top, left: a.rect.left, width: a.rect.width, height: a.rect.height }}>
          <button className={`anno-pin is-${a.verdict}`}
                  onClick={() => { setReading(a); setPicked(null) }}
                  aria-label={`${a.verdict} note`}>
            {a.verdict === 'good' ? '✓' : '!'}
          </button>
        </div>
      ))}

      {hover && !picked && (
        <>
          <div className="anno-hover"
               style={{ top: hover.rect.top, left: hover.rect.left, width: hover.rect.width, height: hover.rect.height }} />
          <div className="anno-tag"
               style={{ top: Math.max(4, hover.rect.top - 22), left: Math.max(4, hover.rect.left) }}>
            {hover.label}{level > 0 && <em> · {level} up</em>}
          </div>
        </>
      )}

      {picked && (
        <div className="anno-card is-compose" style={cardPos(picked.rect)}>
          <AnnotationComposer at={picked.at} label={labelFor(picked.el)} pathname={pathname}
                              onDone={close} onCancel={close} />
        </div>
      )}

      {reading && <ReadCard note={reading} onClose={close} />}

      <div className="anno-bar">
        <span className="anno-bar-title">Annotations</span>
        <span className="anno-chip is-good">{good}</span>
        <span className="anno-chip is-bad">{bad}</span>
        <span className="anno-bar-hint">
          hover to pick · <kbd>[</kbd><kbd>]</kbd> narrow / widen · <kbd>Shift</kbd><kbd>C</kbd> hide
        </span>
      </div>
    </div>
  )
}

function cardPos(rect) {
  return {
    top: Math.max(12, Math.min(rect.top, window.innerHeight - 330)),
    left: Math.max(12, Math.min(rect.left + rect.width + 12, window.innerWidth - 372)),
  }
}

function ReadCard({ note, onClose }) {
  return (
    <div className="anno-card" style={cardPos(note.rect)}>
      <div className="anno-card-head">
        <code>{note.at?.region ?? note.anchor ?? note.at?.tag}</code>
        <button onClick={onClose} aria-label="Close"><i className="ph ph-x" /></button>
      </div>
      <span className={`anno-verdict is-${note.verdict}`}>{note.verdict}</span>
      <p className="anno-text">{note.note}</p>
      {note.instead && <p className="anno-instead"><strong>Instead</strong> {note.instead}</p>}
      {note.why && <p className="anno-why">{note.why}</p>}
      <div className="anno-meta">
        {note.rule ? <code>{note.rule}</code> : <span className="anno-pending">rule not yet inferred</span>}
        <span>{note.author}</span><span>{note.as_of}</span>
      </div>
    </div>
  )
}

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

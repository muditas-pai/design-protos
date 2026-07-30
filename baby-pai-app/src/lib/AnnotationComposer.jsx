import { useState } from 'react'
import { ROUTE_FILE } from './annotation-targets'
import { addSession } from './annotation-store'

/* Capture, and only capture.

   Two questions: good or bad, and what you see. Everything the schema wants
   beyond that — the principle, the "instead", the rule slug that clusters
   recurrences — is an INFERENCE over the whole corpus, and the person looking
   at one screen has none of that context. Asking them anyway just gets the
   analysis pass's job done badly, by hand.

   Even the target file is derived rather than asked: on an exploration route
   the note belongs to that variation, otherwise to the screen. Re-attribution
   to a specific component is the analysis pass's business too. */
export default function AnnotationComposer({ at, label, pathname, onDone, onCancel }) {
  const [verdict, setVerdict] = useState(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const screen = (pathname.split('/')[1] || 'index').toLowerCase()
  const file = ROUTE_FILE[pathname] ?? `canonical/screens/${cap(screen)}.annotations.json`
  const ready = verdict && note.trim().length > 2

  async function save() {
    setBusy(true); setError(null)
    const annotation = {
      at, verdict, note: note.trim(),
      status: 'proposed', author: 'mudita',
      as_of: new Date().toISOString().slice(0, 10), still_valid: true,
    }
    try {
      const r = await fetch('/__annotations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, annotation }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? 'write failed')
      addSession(annotation, ROUTE_FILE[pathname] ? pathname : null)
      onDone()
    } catch (e) { setError(e.message); setBusy(false) }
  }

  return (
    <div className="anno-compose">
      <div className="anno-card-head">
        <code>{label}</code>
        <button onClick={onCancel} aria-label="Cancel"><i className="ph ph-x" /></button>
      </div>

      <div className="anno-seg" role="group" aria-label="Verdict">
        <button className={verdict === 'good' ? 'is-on is-good' : ''} onClick={() => setVerdict('good')}>
          good
        </button>
        <button className={verdict === 'bad' ? 'is-on is-bad' : ''} onClick={() => setVerdict('bad')}>
          bad
        </button>
      </div>

      <textarea
        className="anno-note-input" rows={4} value={note} autoFocus
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && ready) save() }}
        placeholder={verdict === 'good'
          ? 'What makes this right?'
          : "What's wrong with it?"}
      />

      {error && <p className="anno-error">{error}</p>}

      <div className="anno-actions">
        <span className="anno-target"><code>{file.split('/').pop()}</code></span>
        <button className="anno-btn" onClick={onCancel}>Cancel</button>
        <button className="anno-btn is-primary" disabled={!ready || busy} onClick={save}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

import { useState } from 'react'
import { targetsFor } from './annotation-targets'
import { RULES } from './annotation-store'

const SUBJECTIVE = /\b(clean|clear|nice|premium|cluttered|ugly|pretty|elegant|better|worse|feels?|looks? (good|bad|off))\b/i
const OBSERVABLE = /\d|#[0-9a-f]{3,8}|['"«]|\bpx\b|\bcqw\b|%/i

/* Capture. Records evidence and nothing else — note the absence of any "which
   home does this belong in" field. That question is the analysis pass's, and
   asking it here would just get answered by gut. */
export default function AnnotationComposer({ anchor, pathname, onDone, onCancel }) {
  const targets = targetsFor(anchor, pathname)
  const [scope, setScope] = useState(targets.route ? 'route' : 'component')
  const [verdict, setVerdict] = useState('bad')
  const [note, setNote] = useState('')
  const [instead, setInstead] = useState('')
  const [why, setWhy] = useState('')
  const [rule, setRule] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const file = scope === 'route' ? targets.route : targets.component
  const soft = note && SUBJECTIVE.test(note) && !OBSERVABLE.test(note)
  const ready = note.trim() && rule.trim() && (verdict === 'good' || instead.trim()) && file

  async function save() {
    setBusy(true); setError(null)
    const annotation = {
      anchor, verdict, note: note.trim(),
      ...(verdict === 'bad' ? { instead: instead.trim() } : {}),
      ...(why.trim() ? { why: why.trim() } : {}),
      rule: rule.trim(),
      status: 'proposed',
      author: 'mudita',
      as_of: new Date().toISOString().slice(0, 10),
      still_valid: true,
    }
    try {
      const r = await fetch('/__annotations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, annotation }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? 'write failed')
      onDone(file)
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <div className="anno-compose">
      <div className="anno-card-head">
        <code>{anchor}</code>
        <button onClick={onCancel} aria-label="Cancel"><i className="ph ph-x" /></button>
      </div>

      <div className="anno-seg" role="group" aria-label="Verdict">
        <button className={verdict === 'good' ? 'is-on is-good' : ''} onClick={() => setVerdict('good')}>good</button>
        <button className={verdict === 'bad' ? 'is-on is-bad' : ''} onClick={() => setVerdict('bad')}>bad</button>
      </div>

      <label className="anno-field">
        <span>What you see <em>— name something checkable</em></span>
        <textarea
          rows={3} value={note} autoFocus
          onChange={(e) => setNote(e.target.value)}
          placeholder="3 filled navy pills sit below a filled brand-blue CTA, giving 4 equally weighted controls"
        />
      </label>
      {soft && (
        <p className="anno-soft">
          That reads as a judgement with nothing observable in it. Name the count,
          the value or the element, or the analysis pass will warn on it.
        </p>
      )}

      {verdict === 'bad' && (
        <label className="anno-field">
          <span>Instead <em>— required, or it never reaches the builder</em></span>
          <textarea rows={2} value={instead} onChange={(e) => setInstead(e.target.value)}
            placeholder="keep one filled; render the others outlined" />
        </label>
      )}

      <label className="anno-field">
        <span>Why <em>— the principle</em></span>
        <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="one emphatic action per surface" />
      </label>

      <label className="anno-field">
        <span>Rule slug <em>— the join key; reuse one to build a count</em></span>
        <input list="anno-rules" value={rule} onChange={(e) => setRule(e.target.value)} placeholder="one-emphatic-action" />
        <datalist id="anno-rules">{RULES.map((r) => <option key={r} value={r} />)}</datalist>
      </label>

      <div className="anno-scope">
        <span className="anno-scope-q">This is about</span>
        <label className={scope === 'component' ? 'is-on' : (targets.component ? '' : 'is-off')}>
          <input type="radio" checked={scope === 'component'} disabled={!targets.component}
            onChange={() => setScope('component')} />
          the component <em>everywhere it renders</em>
        </label>
        <label className={scope === 'route' ? 'is-on' : (targets.route ? '' : 'is-off')}>
          <input type="radio" checked={scope === 'route'} disabled={!targets.route}
            onChange={() => setScope('route')} />
          this variation <em>this route only</em>
        </label>
      </div>

      <p className="anno-target">{file ? <code>{file}</code> : 'no writable target for this scope'}</p>
      {error && <p className="anno-error">{error}</p>}

      <div className="anno-actions">
        <button className="anno-btn" onClick={onCancel}>Cancel</button>
        <button className="anno-btn is-primary" disabled={!ready || busy} onClick={save}>
          {busy ? 'Saving…' : 'Save annotation'}
        </button>
      </div>
    </div>
  )
}

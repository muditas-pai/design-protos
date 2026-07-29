import { slide4Content as c, slides } from '../../data/deck'

/* The open slide. Sized in container-query units (cqw) against the canvas
   itself, so the whole slide scales proportionally with the viewport the way a
   real slide does — no JS measuring, no fixed pixel layout. */
export default function SlideCanvas({ current = 4 }) {
  const slide = slides.find((s) => s.n === current)

  if (current !== 4) {
    // the other four slides exist as thumbnails only; show them scaled rather
    // than pretending they're built
    return (
      <div className="canvas">
        <img className="canvas-standin" src={slide?.thumb} alt={slide?.title} />
      </div>
    )
  }

  return (
    <div className="canvas">
      <h1 className="sl-title">{c.title}</h1>

      <div className="sl-body">
        <div className="sl-grid">
          {c.stats.map((s) => (
            <div key={s.label} className="sl-stat">
              <span className="sl-stat-label">{s.label}</span>
              <span className="sl-stat-value">{s.value}</span>
            </div>
          ))}
        </div>

        <aside className="sl-side">
          <div className="sl-footnotes">
            {c.footnotes.map((f) => <p key={f}>{f}</p>)}
          </div>
          <p className="sl-note">{c.note}</p>
        </aside>
      </div>

      <footer className="sl-footer">
        <span className="sl-footer-left">
          <strong>{c.footer.left}</strong>
          <span className="sl-footer-div">|</span>
          <span>{c.footer.sub}</span>
        </span>
        <span className="sl-footer-right">
          <span>{c.footer.page}</span>
          <strong>{c.footer.brand}</strong>
        </span>
      </footer>
    </div>
  )
}

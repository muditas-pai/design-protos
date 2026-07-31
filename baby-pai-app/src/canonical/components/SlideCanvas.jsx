import { slide4Content as c, figmaDeck } from '../../data/deck'

/* The open slide.

   One slide in the Figma deck is built as real DOM and sized in container-query
   units (cqw) against the canvas, so it scales proportionally with no JS
   measuring. Every other slide — and every slide in a library deck — is a page
   image, which is honest: they were never built. */
export default function SlideCanvas({ deck = figmaDeck, current = 1 }) {
  const slide = deck.slides.find((s) => s.n === current)

  if (deck.richSlide !== current) {
    return (
      <div className="canvas is-image">
        {slide && <img className="canvas-standin" src={slide.thumb} alt={slide.title} />}
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

import InlineMenu from './InlineMenu'
import { figmaDeck } from '../../data/deck'

export default function Filmstrip({ deck = figmaDeck, current = 1, onSelect, view = 'strip', onView }) {
  return (
    <aside className="filmstrip">
      <InlineMenu className="filmstrip-head">
        <InlineMenu.Group>
          <InlineMenu.Item
            iconOnly aria-label="List view" active={view === 'list'}
            onClick={() => onView?.('list')}
            icon={<i className="ph ph-list-bullets" />}
          />
          <InlineMenu.Item
            iconOnly aria-label="Filmstrip view" active={view === 'strip'}
            onClick={() => onView?.('strip')}
            icon={<i className="ph ph-film-strip" />}
          />
        </InlineMenu.Group>
        <InlineMenu.Group className="filmstrip-collapse">
          <InlineMenu.Item
            iconOnly aria-label="Collapse panel"
            icon={<i className="ph ph-arrows-in-simple" />}
          />
        </InlineMenu.Group>
      </InlineMenu>

      <button className="filmstrip-new">
        <i className="ph ph-plus" />
        New Slide
      </button>

      <ol className="filmstrip-list">
        {deck.slides.map((s) => (
          <li key={s.n}>
            <button
              className={`slide-thumb${s.n === current ? ' is-current' : ''}`}
              onClick={() => onSelect?.(s.n)}
              aria-current={s.n === current || undefined}
              aria-label={`Slide ${s.n}: ${s.title}`}
            >
              <img src={s.thumb} alt="" loading="lazy" />
              <span className="slide-num">{s.n}</span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  )
}

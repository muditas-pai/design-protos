const TABS = ['Recent', 'Starred', 'Download', 'Recently deleted']

export default function DocumentsHeader({ active = 'Recent', onSelect, view = 'grid', onView }) {
  return (
    <div className="files-head">
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab${t === active ? ' is-active' : ''}`}
            onClick={() => onSelect?.(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="toggle">
        <button
          className={view === 'list' ? 'is-active' : undefined}
          aria-label="List view"
          onClick={() => onView?.('list')}
        >
          <i className="ph ph-list-bullets" />
        </button>
        <button
          className={view === 'grid' ? 'is-active' : undefined}
          aria-label="Grid view"
          onClick={() => onView?.('grid')}
        >
          <i className="ph ph-squares-four" />
        </button>
      </div>
    </div>
  )
}

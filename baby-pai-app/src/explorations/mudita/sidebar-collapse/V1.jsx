/* COMPONENT ALTITUDE — swaps one part. Everything else on the Dashboard stays
   canonical and stays current: if Tyo changes the topbar tomorrow, this
   exploration gets it for free. */
export const title = 'Icon rail, labels on hover'

function IconRailSidebar() {
  const items = [
    { icon: 'ph-house-simple', label: 'Home', active: true },
    { icon: 'ph-file', label: 'Created by Me' },
    { icon: 'ph-plus', label: 'Create project' },
    { icon: 'ph-layout', label: 'Templates' },
    { icon: 'ph-pencil-ruler', label: 'Hire an Expert' },
  ]
  return (
    <aside className="sidebar" style={{ width: 60, minWidth: 60 }}>
      <div className="ws" style={{ justifyContent: 'center', padding: '11px 0' }}>
        <span className="ws-avatar" style={{ background: 'linear-gradient(135deg,#ff5a3c,#e0422a)' }} />
      </div>
      <nav className="nav" style={{ paddingTop: 8 }}>
        {items.map((i) => (
          <button
            key={i.label}
            className={`nav-item${i.active ? ' is-active' : ''}`}
            title={i.label}
            style={{ justifyContent: 'center', padding: 8 }}
          >
            <i className={`ph ${i.icon}`} />
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <nav className="nav nav-flush" style={{ padding: '0 8px 8px' }}>
          <button className="nav-item" title="Workspace settings" style={{ justifyContent: 'center' }}>
            <i className="ph ph-gear" />
          </button>
        </nav>
      </div>
    </aside>
  )
}

export default { Sidebar: IconRailSidebar }

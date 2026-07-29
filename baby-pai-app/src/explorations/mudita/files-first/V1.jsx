import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useComponent } from '../../../lib/overrides'
import { decks } from '../../../data/decks'

/* SCREEN ALTITUDE — the escape hatch, for when the change is arrangement and
   no component swap can express it. Here: decks come first, the composer
   collapses to a strip below the fold.

   Note what is NOT copied. Every part is still resolved through useComponent,
   so this exploration inherits canonical Sidebar, Topbar, DeckCard and the
   rest. You copied the layout, not the parts. */
export const title = 'Files first, composer below'

function FilesFirstDashboard() {
  const Sidebar = useComponent('Sidebar')
  const Topbar = useComponent('Topbar')
  const PromptComposer = useComponent('PromptComposer')
  const DocumentsHeader = useComponent('DocumentsHeader')
  const DeckCard = useComponent('DeckCard')

  const navigate = useNavigate()

  const [tab, setTab] = useState('Recent')
  const [view, setView] = useState('grid')

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Topbar />
        <section className="files" style={{ paddingTop: 8 }}>
          <DocumentsHeader active={tab} onSelect={setTab} view={view} onView={setView} />
          <div className={`grid grid-${view}`}>
            {decks.map((d) => (
              <DeckCard key={d.id} deck={d} onOpen={() => navigate(`/editor/${d.id}`)} />
            ))}
          </div>
        </section>
        <section className="header" style={{ paddingTop: 8 }}>
          <div className="prompt-group"><PromptComposer /></div>
        </section>
      </main>
    </div>
  )
}

export default { Dashboard: FilesFirstDashboard }

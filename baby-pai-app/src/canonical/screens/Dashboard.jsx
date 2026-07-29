import { useState } from 'react'
import { useComponent } from '../../lib/overrides'
import { decks } from '../../data/decks'

/* Every part of this screen is resolved through useComponent, so an
   exploration can replace any one of them without touching this file.
   Direct imports of canonical/components are blocked by the ESLint rule. */
export default function Dashboard() {
  const Sidebar = useComponent('Sidebar')
  const Topbar = useComponent('Topbar')
  const PromptComposer = useComponent('PromptComposer')
  const ActionPills = useComponent('ActionPills')
  const DocumentsHeader = useComponent('DocumentsHeader')
  const DeckCard = useComponent('DeckCard')

  const [tab, setTab] = useState('Recent')
  const [view, setView] = useState('grid')

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Topbar />

        <section className="header">
          <div className="prompt-group">
            <PromptComposer />
            <ActionPills />
          </div>
        </section>

        <section className="files">
          <DocumentsHeader active={tab} onSelect={setTab} view={view} onView={setView} />
          <div className={`grid grid-${view}`}>
            {decks.map((d) => <DeckCard key={d.id} deck={d} />)}
          </div>
        </section>
      </main>
    </div>
  )
}

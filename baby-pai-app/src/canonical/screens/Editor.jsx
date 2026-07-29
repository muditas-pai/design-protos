import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useComponent } from '../../lib/overrides'
import { resolveDeck } from '../../data/deck'

/* Figma "JAS '26 — Handoff" 334:3043 (Editor - Theme - Font).

   Route is /editor/:deckSlug, and /editor with no slug opens the Figma deck.
   The slug is how a dashboard tile hands its deck over. */
export default function Editor() {
  const EditorTopbar = useComponent('EditorTopbar')
  const Filmstrip = useComponent('Filmstrip')
  const SlideCanvas = useComponent('SlideCanvas')
  const EditorToolbar = useComponent('EditorToolbar')

  const { deckSlug } = useParams()
  const navigate = useNavigate()
  const deck = resolveDeck(deckSlug)

  // open on the rich slide when there is one, otherwise the first
  const [current, setCurrent] = useState(deck.richSlide ?? 1)
  const [view, setView] = useState('strip')

  return (
    <div className="editor">
      <EditorTopbar title={deck.title} onHome={() => navigate('/dashboard')} />
      <div className="editor-body">
        <Filmstrip deck={deck} current={current} onSelect={setCurrent} view={view} onView={setView} />
        <div className="editor-stage">
          <SlideCanvas deck={deck} current={current} />
        </div>
      </div>
      <EditorToolbar />
    </div>
  )
}

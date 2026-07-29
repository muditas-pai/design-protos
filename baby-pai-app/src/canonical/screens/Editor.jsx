import { useState } from 'react'
import { useComponent } from '../../lib/overrides'

/* Figma "JAS '26 — Handoff" 334:3043 (Editor - Theme - Font).
   Four seams, same as the Dashboard: every part is resolved by name so an
   exploration can replace one without copying the screen. */
export default function Editor() {
  const EditorTopbar = useComponent('EditorTopbar')
  const Filmstrip = useComponent('Filmstrip')
  const SlideCanvas = useComponent('SlideCanvas')
  const EditorToolbar = useComponent('EditorToolbar')

  const [current, setCurrent] = useState(4)
  const [view, setView] = useState('strip')

  return (
    <div className="editor">
      <EditorTopbar />
      <div className="editor-body">
        <Filmstrip current={current} onSelect={setCurrent} view={view} onView={setView} />
        <div className="editor-stage">
          <SlideCanvas current={current} />
        </div>
      </div>
      <EditorToolbar />
    </div>
  )
}

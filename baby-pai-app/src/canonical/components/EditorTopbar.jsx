import InlineMenu from './InlineMenu'
import { Badge, Button } from '../../ds'
import { collaborators, figmaDeck } from '../../data/deck'

export default function EditorTopbar({ title = figmaDeck.title, onHome }) {
  return (
    <header className="editor-top">
      <InlineMenu>
        <InlineMenu.Group>
          <InlineMenu.Item iconOnly aria-label="Home" onClick={onHome} icon={<i className="ph ph-house" />} />
        </InlineMenu.Group>
        <InlineMenu.Group className="editor-docname" data-annotate="editor.docname">
          <InlineMenu.Item grow title={title}>{title}</InlineMenu.Item>
        </InlineMenu.Group>
      </InlineMenu>

      <InlineMenu>
        <InlineMenu.Group>
          <InlineMenu.Item className="collab-item" aria-label="Collaborators">
            <span className="collab">
              {collaborators.map((c) => (
                <span key={c.id} className="collab-avatar">
                  <img src={c.avatar} alt={c.name} />
                  {c.overflow && <span className="collab-overflow">{c.overflow}</span>}
                </span>
              ))}
            </span>
          </InlineMenu.Item>
        </InlineMenu.Group>

        <InlineMenu.Group>
          <InlineMenu.Item>Share</InlineMenu.Item>
        </InlineMenu.Group>

        <InlineMenu.Group>
          <InlineMenu.Item icon={<i className="ph ph-play" />}>Present</InlineMenu.Item>
        </InlineMenu.Group>

        <InlineMenu.Group>
          <InlineMenu.Item icon={<i className="ph ph-chart-bar" />}>
            Analytics
            <Badge variant="pro">Pro</Badge>
          </InlineMenu.Item>
        </InlineMenu.Group>

        <InlineMenu.Group className="editor-export" data-annotate="editor.export">
          <Button
            variant="primary"
            size="small"
            leading={<i className="ph ph-microsoft-powerpoint-logo" />}
          >
            Export as PPT
          </Button>
        </InlineMenu.Group>

        <InlineMenu.Group>
          <InlineMenu.Item iconOnly aria-label="More" icon={<i className="ph ph-dots-three-vertical" />} />
        </InlineMenu.Group>
      </InlineMenu>
    </header>
  )
}

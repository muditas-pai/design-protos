import InlineMenu from './InlineMenu'

export default function EditorToolbar({ onUndo, onRedo, canUndo = true, canRedo = false }) {
  return (
    <div className="editor-toolbar">
      <InlineMenu>
        <InlineMenu.Group>
          <InlineMenu.Item icon={<i className="ph ph-plus" />}>Insert</InlineMenu.Item>
        </InlineMenu.Group>
        <InlineMenu.Group>
          <InlineMenu.Item icon={<i className="ph ph-palette" />}>Theme</InlineMenu.Item>
        </InlineMenu.Group>
        <InlineMenu.Group>
          <InlineMenu.Item icon={<i className="ph ph-magic-wand" />}>Edit with AI</InlineMenu.Item>
        </InlineMenu.Group>
        <InlineMenu.Group>
          <InlineMenu.Item iconOnly aria-label="More" icon={<i className="ph ph-dots-three-vertical" />} />
        </InlineMenu.Group>
      </InlineMenu>

      {/* undo / redo is a separate surface in the design, not another group */}
      <InlineMenu className="editor-history">
        <InlineMenu.Group>
          <InlineMenu.Item
            iconOnly aria-label="Undo" disabled={!canUndo} onClick={onUndo}
            icon={<i className="ph ph-arrow-counter-clockwise" />}
          />
        </InlineMenu.Group>
        <InlineMenu.Group>
          <InlineMenu.Item
            iconOnly aria-label="Redo" disabled={!canRedo} onClick={onRedo}
            icon={<i className="ph ph-arrow-clockwise" />}
          />
        </InlineMenu.Group>
      </InlineMenu>
    </div>
  )
}

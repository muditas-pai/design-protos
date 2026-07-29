/* The editor's repeated chrome primitive — Figma calls it "inlinemenu-dark".
   A white rounded surface with elevation-2, holding groups of items separated
   by hairline dividers. It appears FOUR times in the editor (topbar left,
   topbar right, filmstrip header, bottom toolbar), which is exactly why it's
   a component rather than four copies.

   Dividers are drawn in CSS from group adjacency, so nothing has to be
   interleaved by hand.

   Note for anyone overriding this seam: it's a compound component, so a
   replacement has to provide .Group and .Item too. */
export default function InlineMenu({ className = '', children, ...rest }) {
  return <div className={`inlinemenu ${className}`.trim()} {...rest}>{children}</div>
}

InlineMenu.Group = function Group({ className = '', children, ...rest }) {
  return <div className={`inlinemenu-group ${className}`.trim()} {...rest}>{children}</div>
}

InlineMenu.Item = function Item({
  icon, iconOnly = false, active = false, grow = false, className = '', children, ...rest
}) {
  const cls = [
    'inlinemenu-item',
    iconOnly && 'is-icon-only',
    active && 'is-active',
    grow && 'is-grow',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={cls} {...rest}>
      {icon}
      {children != null && <span className="inlinemenu-label">{children}</span>}
    </button>
  )
}

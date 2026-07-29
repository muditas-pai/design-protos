/* The design system, as React.

   Every component here is a class-name wrapper over design-system/pai.css,
   which main.jsx imports whole and by relative path. Nothing is copied and no
   styles are declared in this folder, so pai.css stays the single source of
   truth and a change Tyo makes there lands here for free.

   These are NOT seams. Design-system primitives are PR-gated and owned
   elsewhere; baby-PAI's own composition layer (canonical/components/) is where
   overriding happens. Screens may import from here directly.

   If this port proves useful it graduates to design-system/react/ via a PR to
   the design-system owner — it should not live in this app forever. */

export { default as Button } from './Button'
export {
  Badge, Input, Textarea, Checkbox, Radio, Field, Toggle, Tooltip, Skeleton, Text, TEXT,
} from './primitives'

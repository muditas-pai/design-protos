import { createContext, useContext } from 'react'

/* ============================================================================
   The override mechanism — the whole thing.

   A "seam" is a place where a component is looked up BY NAME at render time
   instead of bound at import time. That one indirection is what lets an
   exploration swap a part of a canonical screen without editing canonical.

   Three altitudes fall out of one registry:

     token      exploration exports `tokens` → CSS vars scoped to the route
     component  exploration overrides `Sidebar` → one part swapped
     screen     exploration overrides `Dashboard` → whole arrangement swapped,
                with the components inside it still canonical and still live

   The registry is globbed from the file tree, NOT hand-listed, so adding a
   canonical component never touches a shared file and never conflicts.
   ========================================================================== */

const componentModules = import.meta.glob('../canonical/components/*.jsx', { eager: true })
const screenModules = import.meta.glob('../canonical/screens/*.jsx', { eager: true })

const nameOf = (path) => path.split('/').pop().replace(/\.jsx$/, '')

export const CANONICAL = {}
for (const path in componentModules) CANONICAL[nameOf(path)] = componentModules[path].default
for (const path in screenModules) CANONICAL[nameOf(path)] = screenModules[path].default

/* which names are whole screens rather than parts — used to label an
   exploration's altitude on the index */
export const SCREEN_NAMES = new Set(Object.keys(screenModules).map(nameOf))

const Ctx = createContext({})

/* Overrides nest: an inner map wins, anything it doesn't name falls through to
   the outer map, then to canonical. */
export function Overrides({ map, children }) {
  const parent = useContext(Ctx)
  return <Ctx.Provider value={{ ...parent, ...map }}>{children}</Ctx.Provider>
}

export function useComponent(name) {
  const overrides = useContext(Ctx)
  const Component = overrides[name] ?? CANONICAL[name]
  if (!Component) {
    // string lookup means a typo can't fail at build time — fail loudly here
    throw new Error(
      `useComponent("${name}") — no such component.\n` +
      `Known: ${Object.keys(CANONICAL).sort().join(', ')}`,
    )
  }
  return Component
}

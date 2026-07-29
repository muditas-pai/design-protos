import { createContext, useContext, useMemo, useState } from 'react'
import { useComponent } from './overrides'

/* ============================================================================
   The flow altitude.

   A flow is DATA — an ordered list of steps — kept separate from the screens
   those steps render. That separation is the whole point:

     overriding the flow    does not copy the screens
     overriding a screen    does not copy the flow

   which is the test for whether something deserves its own altitude. A PRD
   almost always describes a flow, so this is the altitude most feature work
   lands in.

   Flows are globbed from the file tree like everything else — no registry to
   hand-edit, so no shared file to conflict on.
   ========================================================================== */

const flowModules = import.meta.glob('../canonical/flows/*.js', { eager: true })

export const FLOWS = {}
for (const path in flowModules) {
  FLOWS[path.split('/').pop().replace(/\.js$/, '')] = flowModules[path].default
}

const Ctx = createContext(null)

/* Returns null outside a flow, so a screen can be flow-aware without becoming
   flow-dependent — the Dashboard works standalone and as step 1. */
export function useFlow() {
  return useContext(Ctx)
}

/* An exploration supplies { id, steps?, define? }.
     steps   the new order, as ids — reorder, insert or drop in one line
     define  step definitions the canonical flow doesn't have  */
export function resolveSteps(canonicalSteps, override) {
  if (!override?.steps) return canonicalSteps

  const defs = Object.fromEntries(canonicalSteps.map((s) => [s.id, s]))
  for (const [id, d] of Object.entries(override.define ?? {})) defs[id] = { id, ...d }

  return override.steps.map((id) => {
    const step = defs[id]
    if (!step) {
      throw new Error(
        `flow step "${id}" is not defined.\n` +
        `Known: ${Object.keys(defs).join(', ')}.\n` +
        `Add it under \`define\` in your exploration's flow export.`,
      )
    }
    return step
  })
}

export function FlowRunner({ flowId, override }) {
  const canonical = FLOWS[flowId]
  if (!canonical) {
    throw new Error(`no flow "${flowId}". Known: ${Object.keys(FLOWS).join(', ') || 'none'}`)
  }

  const steps = useMemo(() => resolveSteps(canonical, override), [canonical, override])
  const [index, setIndex] = useState(0)
  const [data, setData] = useState({})

  const step = steps[Math.min(index, steps.length - 1)]
  const Screen = useComponent(step.screen)
  const FlowFrame = useComponent('FlowFrame')

  const value = useMemo(() => ({
    steps, index, step,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    next: () => setIndex((i) => Math.min(i + 1, steps.length - 1)),
    back: () => setIndex((i) => Math.max(i - 1, 0)),
    goTo: (i) => setIndex(Math.max(0, Math.min(i, steps.length - 1))),
    data,
    set: (patch) => setData((d) => ({ ...d, ...patch })),
  }), [steps, index, step, data])

  return (
    <Ctx.Provider value={value}>
      <Screen />
      <FlowFrame />
    </Ctx.Provider>
  )
}

import { HashRouter, Routes, Route, Navigate, Link, useParams } from 'react-router-dom'
import { Overrides, useComponent, CANONICAL, SCREEN_NAMES } from './lib/overrides'
import { FlowRunner, FLOWS } from './lib/flow'

/* Explorations are auto-registered from the file tree. Nobody edits a router
   file, so two designers adding variations the same afternoon never conflict.

     src/explorations/<designer>/<problem>/<Variant>.jsx
       → #/x/<designer>/<problem>/<variant>

   A module may export any of:
     default   {Name: Replacement}       component or screen altitude
     tokens    {'--line': '…'}           token altitude, scoped to the route
     flow      {id, steps?, define?}     flow altitude
     screen    'Dashboard'               which canonical screen, if not a flow
     title     'Collapsible rail'        label for the index
*/
const modules = import.meta.glob('./explorations/**/*.jsx', { eager: true })

function altitudeOf(mod) {
  if (mod.flow?.steps) return 'flow'
  if (mod.tokens) return 'token'
  if (Object.keys(mod.default ?? {}).some((n) => SCREEN_NAMES.has(n))) return 'screen'
  return 'component'
}

export const EXPLORATIONS = Object.entries(modules)
  .map(([path, mod]) => {
    const m = path.match(/^\.\/explorations\/([^/]+)\/([^/]+)\/([^/]+)\.jsx$/)
    if (!m) return null
    const [, designer, problem, variant] = m
    return {
      key: `${designer}/${problem}/${variant.toLowerCase()}`,
      designer, problem, variant,
      title: mod.title ?? variant,
      screen: mod.screen ?? 'Dashboard',
      flow: mod.flow ?? null,
      map: mod.default ?? {},
      tokens: mod.tokens ?? null,
      altitude: altitudeOf(mod),
    }
  })
  .filter(Boolean)
  .sort((a, b) => a.key.localeCompare(b.key))

const byKey = Object.fromEntries(EXPLORATIONS.map((e) => [e.key, e]))

function Screen({ name }) {
  const S = useComponent(name)
  return <S />
}

function CanonicalFlow() {
  const { flowId } = useParams()
  if (!FLOWS[flowId]) return <NotFound what={`flow ${flowId}`} />
  return <FlowRunner flowId={flowId} override={null} />
}

function ExplorationRoute() {
  const { designer, problem, variant } = useParams()
  const e = byKey[`${designer}/${problem}/${variant}`.toLowerCase()]
  if (!e) return <NotFound what={`${designer}/${problem}/${variant}`} />

  const inner = e.flow
    ? <FlowRunner flowId={e.flow.id} override={e.flow} />
    : <Screen name={e.screen} />

  // token altitude: CSS vars scoped to this route only
  const shell = e.tokens
    ? <div className="token-scope" style={e.tokens}>{inner}</div>
    : inner

  return <Overrides map={e.map}>{shell}</Overrides>
}

function NotFound({ what }) {
  return (
    <div className="index">
      <h1>Not found</h1>
      <p className="index-sub">Nothing registered at <code>{what}</code>.</p>
      <Link className="index-link" to="/">Back to index</Link>
    </div>
  )
}

function Index() {
  const screens = [...SCREEN_NAMES].sort()
  const byDesigner = EXPLORATIONS.reduce((acc, e) => {
    (acc[e.designer] ??= {})[e.problem] ??= []
    acc[e.designer][e.problem].push(e)
    return acc
  }, {})

  return (
    <div className="index">
      <h1>baby-PAI</h1>
      <p className="index-sub">Canonical screens and flows, and every exploration branching off them.</p>

      <h2>Canonical screens</h2>
      <ul className="index-list">
        {screens.map((s) => (
          <li key={s}><Link to={`/${s.toLowerCase()}`}>{s}</Link></li>
        ))}
      </ul>

      <h2>Canonical flows</h2>
      <ul className="index-list">
        {Object.entries(FLOWS).map(([id, steps]) => (
          <li key={id}>
            <Link to={`/flow/${id}`}>{id}</Link>
            <span className="index-meta">{steps.map((s) => s.id).join(' → ')}</span>
          </li>
        ))}
      </ul>

      <h2>Explorations</h2>
      {Object.entries(byDesigner).map(([designer, problems]) => (
        <div key={designer}>
          <h3>{designer}</h3>
          {Object.entries(problems).map(([problem, list]) => (
            <div key={problem} className="index-problem">
              <span className="index-problem-name">{problem}</span>
              <ul className="index-list">
                {list.map((e) => (
                  <li key={e.key}>
                    <Link to={`/x/${e.key}`}>{e.title}</Link>
                    <span className="index-meta">
                      <span className={`alt alt-${e.altitude}`}>{e.altitude}</span>
                      {e.flow ? ` · ${e.flow.steps.length} steps` : ` · ${e.screen}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {[...SCREEN_NAMES].map((s) => (
          <Route key={s} path={`/${s.toLowerCase()}`} element={<Screen name={s} />} />
        ))}
        <Route path="/flow/:flowId" element={<CanonicalFlow />} />
        <Route path="/x/:designer/:problem/:variant" element={<ExplorationRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

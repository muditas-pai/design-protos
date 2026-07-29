import { useFlow } from '../../lib/flow'

/* Harness chrome, not product chrome — a floating pill so it never fights the
   screen's own layout. It's a seam like anything else, so an exploration can
   replace how a flow is stepped through, not just what the steps are. */
export default function FlowFrame() {
  const flow = useFlow()
  if (!flow) return null

  return (
    <div className="flowframe" role="group" aria-label="Flow steps">
      <button className="flowframe-nav" onClick={flow.back} disabled={flow.isFirst} aria-label="Previous step">
        <i className="ph ph-caret-left" />
      </button>

      <ol className="flowframe-steps">
        {flow.steps.map((s, i) => (
          <li key={s.id}>
            <button
              className={`flowframe-step${i === flow.index ? ' is-current' : ''}${i < flow.index ? ' is-done' : ''}`}
              onClick={() => flow.goTo(i)}
            >
              <span className="flowframe-dot">{i + 1}</span>
              {s.label ?? s.id}
            </button>
          </li>
        ))}
      </ol>

      <button className="flowframe-nav" onClick={flow.next} disabled={flow.isLast} aria-label="Next step">
        <i className="ph ph-caret-right" />
      </button>
    </div>
  )
}

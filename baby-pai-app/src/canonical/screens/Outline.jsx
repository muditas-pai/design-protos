import { useComponent } from '../../lib/overrides'
import { useFlow } from '../../lib/flow'
import { Button } from '../../ds'

const OUTLINE = [
  'Where Shopify merchants lose the sale',
  'The three-tap checkout, walked through',
  'What changed in the 2026 rebuild',
  'Merchant results, first 90 days',
  'What we would ship next',
]

export default function Outline() {
  const Sidebar = useComponent('Sidebar')
  const Topbar = useComponent('Topbar')
  const flow = useFlow()

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Topbar />
        <section className="step">
          <div className="step-body">
            <p className="step-eyebrow">Outline</p>
            <h1 className="step-title">Here's the shape of your deck</h1>

            {/* the prompt typed in step 1, carried across — the thing a set of
                standalone HTML files structurally cannot do */}
            {flow?.data.prompt && (
              <p className="step-echo">
                <i className="ph ph-quotes" />
                {flow.data.prompt}
              </p>
            )}

            <ol className="slidelist">
              {OUTLINE.map((t, i) => (
                <li key={t} className="slidelist-row">
                  <span className="slidelist-num">{i + 1}</span>
                  <span className="slidelist-text">{t}</span>
                  <button className="slidelist-edit" aria-label={`Edit slide ${i + 1}`}>
                    <i className="ph ph-pencil-simple" />
                  </button>
                </li>
              ))}
            </ol>

            <Button variant="primary" size="small" className="step-cta" onClick={() => flow?.next()}>
              Generate {OUTLINE.length} slides
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}

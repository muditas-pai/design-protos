import { useComponent } from '../../../lib/overrides'
import { useFlow } from '../../../lib/flow'
import { brand } from '../../../data/decks'
import { Button } from '../../../ds'

/* FLOW ALTITUDE — the canonical flow is three steps. This is four: a brand
   confirmation lands between Outline and Generating.

   Note what is NOT copied. Prompt, Outline and Generating are untouched
   canonical screens; if someone redesigns Outline tomorrow this exploration
   gets it. The only new thing here is the step itself.

   Note also that it composes with the component altitude: the new step's screen
   comes from this file's default export, so a flow can introduce a screen that
   canonical has never heard of. */
export const title = 'Brand check before generating'

export const flow = {
  id: 'create-deck',
  steps: ['prompt', 'outline', 'brand-check', 'generating'],
  define: {
    'brand-check': { screen: 'BrandCheck', label: 'Brand' },
  },
}

function BrandCheck() {
  const Sidebar = useComponent('Sidebar')
  const Topbar = useComponent('Topbar')
  const f = useFlow()

  const confirm = () => {
    f.set({ brandApproved: brand.name })
    f.next()
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Topbar />
        <section className="step">
          <div className="step-body">
            <p className="step-eyebrow">Brand check</p>
            <h1 className="step-title">Use the {brand.name} brand kit?</h1>
            <p className="step-note">
              We'll apply these colours and type to all 5 slides. You can change it later.
            </p>

            <div className="brandcheck">
              <div className="brandcheck-swatches">
                {brand.palette.map((c) => (
                  <span key={c} className="brandcheck-swatch" style={{ background: c }} />
                ))}
              </div>
              <div className="brandcheck-meta">
                <span className="brandcheck-name">{brand.name}</span>
                <span className="brandcheck-sub">4 colours · Inter · logo on file</span>
              </div>
            </div>

            <div className="brandcheck-actions">
              <Button variant="primary" size="small" onClick={confirm}>
                Use {brand.name} branding
              </Button>
              <Button variant="tertiary" size="small" onClick={() => f.next()}>
                Skip, use default
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default { BrandCheck }

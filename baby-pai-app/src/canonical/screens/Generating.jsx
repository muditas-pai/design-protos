import { useComponent } from '../../lib/overrides'
import { useFlow } from '../../lib/flow'

export default function Generating() {
  const Sidebar = useComponent('Sidebar')
  const Topbar = useComponent('Topbar')
  const flow = useFlow()
  const approved = flow?.data.brandApproved

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Topbar />
        <section className="step">
          <div className="step-body step-center">
            <span className="gen-spinner" />
            <p className="step-eyebrow">Generating</p>
            <h1 className="step-title">Building your 5 slides</h1>
            <p className="step-note">
              {approved
                ? `Applying the ${approved} brand kit as we go.`
                : 'This usually takes about a minute.'}
            </p>

            <div className="gen-bar"><span className="gen-fill" /></div>
          </div>
        </section>
      </main>
    </div>
  )
}

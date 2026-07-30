import brandImg from '../../assets/brand-shopify.jpg'
import { brand } from '../../data/decks'
import { useFlow } from '../../lib/flow'
import { Button } from '../../ds'

/* The composer from JAS '26 Handoff 101:747 — a brand-tinted shell carrying the
   active brand kit, wrapping a white prompt with its control row.

   useFlow() returns null outside a flow, so this stays a plain screen component
   when the Dashboard is viewed on its own, and becomes the first real step when
   it's inside one. That's the flow-aware-but-not-flow-dependent property. */
export default function PromptComposer() {
  const flow = useFlow()
  const value = flow?.data.prompt ?? ''
  const ready = value.trim().length > 0

  return (
    <div className="composer" style={{ '--composer-tint': brand.tint }}>
      <div className="composer-head" data-annotate="composer.brand-chip">
        <button className="brand-chip text-body-base-regular">
          <img src={brandImg} alt="" className="brand-chip-avatar" />
          <span>For {brand.name}</span>
          <i className="ph ph-caret-down" />
        </button>
        <div className="swatches" data-annotate="composer.swatches">
          {brand.palette.map((c) => (
            <span key={c} className="swatch" style={{ '--swatch': c }} />
          ))}
        </div>
      </div>

      <div className="composer-body">
        {flow ? (
          <textarea
            className="composer-input"
            value={value}
            onChange={(e) => flow.set({ prompt: e.target.value })}
            placeholder="To start creating, type here or upload a file..."
            aria-label="Presentation prompt"
          />
        ) : (
          <p className="composer-placeholder">
            To start creating, type here or <u>upload a file</u>...
          </p>
        )}

        <div className="composer-actions">
          <div className="composer-tools" data-annotate="composer.tools">
            <Button variant="tertiary" size="small" leading={<i className="ph ph-upload-simple" />}>
              Upload files, or links
            </Button>
            <Button
              variant="tertiary" size="small"
              leading={<i className="ph ph-cards-three" />}
              trailing={<i className="ph ph-caret-down cbtn-trail" />}
            >
              5 Slides
            </Button>
            <Button
              variant="tertiary" size="small"
              leading={<i className="ph ph-sparkle" />}
              trailing={<i className="ph ph-caret-down cbtn-trail" />}
            >
              Standard Model
            </Button>
            <Button
              variant="tertiary" size="small" iconOnly aria-label="More settings"
              leading={<i className="ph ph-sliders-horizontal" />}
            />
          </div>
          <Button
            variant="primary" size="small"
            className="composer-submit"
            data-annotate="composer.submit"
            disabled={!flow || !ready}
            onClick={() => flow?.next()}
          >
            Create Presentation
          </Button>
        </div>
      </div>
    </div>
  )
}

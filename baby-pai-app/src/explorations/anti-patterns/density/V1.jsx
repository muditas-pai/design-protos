import brandImg from '../../../assets/brand-shopify.jpg'
import { brand } from '../../../data/decks'
import { Button } from '../../../ds'

/* ❌ DELIBERATE ANTI-PATTERN.

   This one mirrors a finding the design judge actually raised in run
   2026-07-25-01: "~200px dead space from bottom-pinning the reassurance list".
   Same shape here: the controls are pinned to the bottom of a tall box, so the
   composer reads as empty rather than ready. */
export const title = "❌ 190px of dead space in the composer"

function SparseComposer() {
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

      <div className="composer-body" style={{ height: 340 }} data-annotate="composer.body">
        <p className="composer-placeholder">
          To start creating, type here or <u>upload a file</u>...
        </p>
        <div className="composer-actions">
          <div className="composer-tools" data-annotate="composer.tools">
            <Button variant="tertiary" size="small" leading={<i className="ph ph-upload-simple" />}>
              Upload files, or links
            </Button>
          </div>
          <Button variant="primary" size="small" className="composer-submit" data-annotate="composer.submit" disabled>
            Create Presentation
          </Button>
        </div>
      </div>
    </div>
  )
}

export default { PromptComposer: SparseComposer }

import { Badge } from '../../../ds'

/* ❌ DELIBERATE ANTI-PATTERN — authored to be wrong, not rejected after the fact.
   These exist because canonical screens are all dos by construction, so the
   corpus has no don'ts on day 1 and known-failure matching has nothing to
   match against.

   This one: four filled emphatic controls on one surface, so nothing reads as
   the primary action. */
export const title = "❌ Four filled CTAs on one surface"

function AllFilledPills() {
  return (
    <div className="pills" data-annotate="pills.group">
      <button className="pill is-filled text-body-base-medium">
        <span className="pill-ic"><i className="ph-fill ph-microsoft-powerpoint-logo" /></span>
        Import PowerPoint
      </button>
      <button className="pill is-filled text-body-base-medium">
        <span className="pill-ic"><i className="ph-fill ph-pen-nib" /></span>
        Hire an Expert
      </button>
      <button className="pill is-filled text-body-base-medium">
        <span className="pill-ic"><i className="ph-fill ph-layout" /></span>
        Use a Template
        <Badge variant="pro">Pro</Badge>
      </button>
    </div>
  )
}

export default { ActionPills: AllFilledPills }

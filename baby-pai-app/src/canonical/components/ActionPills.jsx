import { Badge } from '../../ds'

/* The pill shape isn't in pai.css — JAS '26 introduces it. The PRO chip inside
   it is a design-system badge, so that part stays in sync. */
export default function ActionPills() {
  return (
    <div className="pills" data-annotate="pills.group">
      <button className="pill text-body-base-medium">
        <span className="pill-ic"><i className="ph-fill ph-microsoft-powerpoint-logo" /></span>
        Import PowerPoint
      </button>
      <button className="pill text-body-base-medium">
        <span className="pill-ic"><i className="ph-fill ph-pen-nib" /></span>
        Hire an Expert
      </button>
      <button className="pill text-body-base-medium">
        <span className="pill-ic"><i className="ph-fill ph-layout" /></span>
        Use a Template
        <Badge variant="pro">Pro</Badge>
      </button>
    </div>
  )
}

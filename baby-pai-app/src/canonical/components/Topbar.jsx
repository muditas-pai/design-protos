import profileImg from '../../assets/profile.jpg'
import { Button } from '../../ds'

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="trial" data-annotate="topbar.trial">
        <span className="trial-text text-body-base-medium">🔥 Trial: 4 days left</span>
        <Button
          variant="primary-brand"
          data-annotate="topbar.upgrade"
          size="small"
          leading={<i className="ph ph-rocket-launch" />}
        >
          Upgrade
        </Button>
      </div>
      <Button variant="ghost" iconOnly aria-label="Search" leading={<i className="ph ph-magnifying-glass" />} />
      <Button variant="ghost" iconOnly aria-label="Help" leading={<i className="ph ph-question" />} />
      <Button variant="ghost" iconOnly aria-label="Notifications" leading={<i className="ph ph-bell" />} />
      <span className="avatar"><img src={profileImg} alt="Your profile" /></span>
    </header>
  )
}

import workspaceImg from '../../assets/workspace.jpg'
import { Badge } from '../../ds'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="ws">
        <span className="ws-avatar">
          <img src={workspaceImg} alt="" />
        </span>
        <span className="ws-name text-body-base-medium">Foursquare</span>
        <Badge variant="pro">Upgrade</Badge>
        <i className="ph ph-caret-down caret" />
      </div>

      <nav className="nav">
        <button className="nav-item is-active"><i className="ph ph-house-simple" /><span>Home</span></button>
        <button className="nav-item"><i className="ph ph-file" /><span>Created by Me</span></button>
      </nav>

      <div className="divider" />

      <nav className="nav">
        <button className="nav-item"><span>Projects</span></button>
        <button className="nav-item">
          <i className="ph ph-plus" /><span>Create project</span>
          <Badge variant="pro">Pro</Badge>
        </button>
      </nav>

      <div className="divider" />

      <nav className="nav">
        <button className="nav-item"><i className="ph ph-layout" /><span>Templates</span></button>
        <button className="nav-item"><i className="ph ph-pencil-ruler" /><span>Hire an Expert</span></button>
      </nav>

      <div className="sidebar-foot">
        <nav className="nav nav-flush">
          <button className="nav-item"><i className="ph ph-gear" /><span>Workspace settings</span></button>
          <button className="nav-item">
            <i className="ph ph-user-plus" /><span>Invite new member</span>
            <Badge variant="pro">Pro</Badge>
          </button>
        </nav>
      </div>
    </aside>
  )
}

import { Activity, Boxes, LayoutDashboard, Settings2, ShoppingBag, Star, Tag, Users, type LucideIcon } from 'lucide-react'
import type { View } from '../../types-view'

const NAV: { label: View; icon: LucideIcon }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Products', icon: Boxes },
  { label: 'Brands', icon: Tag },
  { label: 'Users', icon: Users },
  { label: 'Orders', icon: ShoppingBag },
  { label: 'Reviews', icon: Star },
]

export function Sidebar({ view, onSelect, isOpen, orderBadge }: { view: View; onSelect: (view: View) => void; isOpen: boolean; orderBadge?: number }) {
  return (
    <aside className={isOpen ? 'sidebar is-open' : 'sidebar'}>
      <div className="brand-lockup">
        <div className="brand-mark">Q</div>
        <span>
          QIO <small>ADMIN</small>
        </span>
      </div>
      <div className="workspace-switcher">
        <i /> QIO Store
      </div>
      <nav>
        <p className="nav-label">Workspace</p>
        {NAV.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className={view === label ? 'nav-item active' : 'nav-item'}
            onClick={() => onSelect(label)}
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === 'Orders' && orderBadge ? <b>{orderBadge}</b> : null}
          </button>
        ))}
        <p className="nav-label secondary">System</p>
        <button type="button" className="nav-item">
          <Activity size={18} />
          <span>Analytics</span>
        </button>
        <button type="button" className="nav-item">
          <Settings2 size={18} />
          <span>Settings</span>
        </button>
      </nav>
      <div className="sidebar-footer">
        <div className="admin-avatar">KS</div>
        <div>
          <strong>Kunal Sarkar</strong>
          <span>Super admin</span>
        </div>
      </div>
    </aside>
  )
}

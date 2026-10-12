import { Bell, Boxes, Flame, LayoutDashboard, LogOut, MessageSquare, ShoppingBag, Star, Tag, TicketPercent, Users, Wallet, type LucideIcon } from 'lucide-react'
import type { View } from '../../types-view'
import type { AdminSessionUser } from '../../types'
import { initials } from '../../lib/format'

const NAV: { label: View; icon: LucideIcon; group: 'Workspace' | 'Customers' }[] = [
  { label: 'Overview', icon: LayoutDashboard, group: 'Workspace' },
  { label: 'Products', icon: Boxes, group: 'Workspace' },
  { label: 'Brands', icon: Tag, group: 'Workspace' },
  { label: 'Orders', icon: ShoppingBag, group: 'Workspace' },
  { label: 'Coupons', icon: TicketPercent, group: 'Workspace' },
  { label: 'Users', icon: Users, group: 'Customers' },
  { label: 'Reviews', icon: Star, group: 'Customers' },
  { label: 'Wallets', icon: Wallet, group: 'Customers' },
  { label: 'Streaks', icon: Flame, group: 'Customers' },
  { label: 'Feedback', icon: MessageSquare, group: 'Customers' },
  { label: 'Notifications', icon: Bell, group: 'Customers' },
]

export function Sidebar({
  view,
  onSelect,
  isOpen,
  orderBadge,
  user,
  onLogout,
}: {
  view: View
  onSelect: (view: View) => void
  isOpen: boolean
  orderBadge?: number
  user: AdminSessionUser | null
  onLogout: () => void
}) {
  const renderGroup = (group: 'Workspace' | 'Customers') =>
    NAV.filter((item) => item.group === group).map(({ label, icon: Icon }) => (
      <button
        key={label}
        type="button"
        className={view === label ? 'nav-item active' : 'nav-item'}
        onClick={() => onSelect(label)}
        aria-current={view === label ? 'page' : undefined}
      >
        <Icon size={18} />
        <span>{label}</span>
        {label === 'Orders' && orderBadge ? <b title="Orders awaiting fulfilment">{orderBadge}</b> : null}
      </button>
    ))

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
        {renderGroup('Workspace')}
        <p className="nav-label secondary">Customers</p>
        {renderGroup('Customers')}
      </nav>
      <div className="sidebar-footer">
        <div className="admin-avatar">{initials(user?.fullName)}</div>
        <div className="sidebar-user">
          <strong>{user?.fullName || 'Admin'}</strong>
          <span>Administrator</span>
        </div>
        <button type="button" className="sidebar-logout" onClick={onLogout} aria-label="Log out" title="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}

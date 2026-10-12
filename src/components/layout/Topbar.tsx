import { LogOut, Menu, RotateCw } from 'lucide-react'
import type { View } from '../../types-view'
import type { AdminSessionUser } from '../../types'
import { initials } from '../../lib/format'

export function Topbar({
    view,
    onOpenMenu,
    user,
    loadedAt,
    refreshing,
    onRefresh,
    onLogout,
}: {
    view: View
    onOpenMenu: () => void
    user: AdminSessionUser | null
    loadedAt: Date | null
    refreshing: boolean
    onRefresh: () => void
    onLogout: () => void
}) {
    return (
        <header className="topbar">
            <button type="button" className="mobile-menu" aria-label="Menu" onClick={onOpenMenu}>
                <Menu size={21} />
            </button>
            <div className="breadcrumbs">
                <span>Workspace</span>
                <strong>/</strong>
                <b>{view}</b>
            </div>
            <div className="top-actions">
                <span className="live-dot">
                    {refreshing
                        ? 'Refreshing…'
                        : loadedAt
                          ? `Updated ${loadedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                          : 'Not loaded yet'}
                </span>
                <button type="button" className="icon-button" aria-label="Refresh dashboard data" title="Refresh" onClick={onRefresh} disabled={refreshing}>
                    <RotateCw size={18} className={refreshing ? 'spin' : undefined} />
                </button>
                <button type="button" className="icon-button" aria-label="Log out" title="Log out" onClick={onLogout}>
                    <LogOut size={18} />
                </button>
                <div className="top-avatar" title={user?.fullName}>
                    {initials(user?.fullName)}
                </div>
            </div>
        </header>
    )
}

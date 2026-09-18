import { Bell, Menu } from 'lucide-react'
import type { View } from '../../types-view'

export function Topbar({ view, onOpenMenu }: { view: View; onOpenMenu: () => void }) {
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
                    <i /> Live data
                </span>
                <button type="button" className="icon-button" aria-label="Notifications">
                    <Bell size={19} />
                    <em>3</em>
                </button>
                <div className="top-avatar">KS</div>
            </div>
        </header>
    )
}

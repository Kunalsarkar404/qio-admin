import { CalendarDays } from 'lucide-react'
import type { View } from '../../types-view'
import { greeting } from '../../lib/format'

const SUBTITLES: Record<View, string> = {
    Overview: 'Here is what is happening across your store.',
    Products: 'Manage listings, pricing, size stock and images.',
    Brands: 'Maintain the brand directory used by your catalog.',
    Orders: 'Track, filter and fulfil customer orders.',
    Coupons: 'Create and manage discount codes.',
    Users: 'Search customers and manage account status.',
    Reviews: 'Moderate product ratings and reviews.',
    Wallets: 'Review balances and make manual wallet adjustments.',
    Streaks: 'Monitor and reset customer activity streaks.',
    Feedback: 'Read customer feedback and track what has been handled.',
    Notifications: 'Send app updates to your customers and review what went out.',
}

export function PageHeader({ view, userName }: { view: View; userName?: string }) {
    const now = new Date()
    const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const firstName = (userName || '').trim().split(/\s+/)[0]

    return (
        <div className="page-heading">
            <div>
                <p className="eyebrow">{today}</p>
                <h1>{view === 'Overview' ? `${greeting(now)}${firstName ? `, ${firstName}` : ''}.` : view}</h1>
                <p className="page-subtitle">{SUBTITLES[view]}</p>
            </div>
            {view === 'Overview' && (
                <div className="heading-actions">
                    <span className="range-label">
                        <CalendarDays size={15} /> Last 30 days
                    </span>
                </div>
            )}
        </div>
    )
}

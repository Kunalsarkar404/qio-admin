import { ChevronDown, Clock3 } from 'lucide-react'
import type { View } from '../../types-view'

export function PageHeader({ view }: { view: View }) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <div className="page-heading">
            <div>
                <p className="eyebrow">{today}</p>
                <h1>{view === 'Overview' ? 'Good morning, Kunal.' : view}</h1>
                <p className="page-subtitle">
                    {view === 'Overview'
                        ? 'Here is what is happening across your store today.'
                        : `Manage your ${view.toLowerCase()} and keep the store moving.`}
                </p>
            </div>
            <div className="heading-actions">
                <button type="button" className="secondary-button">
                    <Clock3 size={16} /> Last 30 days <ChevronDown size={15} />
                </button>
            </div>
        </div>
    )
}

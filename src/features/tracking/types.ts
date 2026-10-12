import type { UserRef } from '../../types'

/** GET /admin/products/:id/viewers row */
export type ProductViewer = {
    user: UserRef | null
    impressions: number
    opens: number
    lastSeenAt: string | null
    lastOpenedAt: string | null
}

/** GET /admin/users/:id/views row */
export type UserProductView = {
    product: { _id: string; name: string; brand: string; image: string; price: number; category: string } | null
    impressions: number
    opens: number
    lastSeenAt: string | null
    lastOpenedAt: string | null
}

/** Opens ÷ impressions, as a display percentage ("—" when never shown). */
export function openRate(opens: number, impressions: number) {
    if (!impressions) return '—'
    return `${Math.round((opens / impressions) * 1000) / 10}%`
}

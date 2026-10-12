import type { PageInfo } from '../../types'

/** GET /admin/feedback item (feedback.controller.js listFeedback) */
export type AdminFeedback = {
    _id: string
    message: string
    source: 'app' | 'order'
    resolved: boolean
    user: { _id: string; name: string; email: string } | null
    /** Empty string when the feedback is not about an order */
    orderNumber: string
    createdAt: string
}

export type FeedbackListResponse = { feedback: AdminFeedback[] } & PageInfo

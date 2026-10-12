import type { PageInfo, UserRef } from '../../types'

export type ReviewStatus = 'approved' | 'rejected'

/** serializeAdminReview (admin.controller.js) */
export type AdminReview = {
    _id: string
    product: { _id: string; name: string; image: string } | null
    user: UserRef | null
    /** Display name the reviewer posted under */
    name: string
    rating: number
    text: string
    status: ReviewStatus
    rejectReason: string
    verified: boolean
    createdAt: string
    updatedAt: string
}

export type ReviewListResponse = { reviews: AdminReview[] } & PageInfo

export type ReviewFilters = {
    productId?: string
    rating?: number | ''
    status?: ReviewStatus | ''
}

export type ReviewStats = {
    totalReviews: number
    averageRating: number
    rejectedReviews: number
    ratingDistribution: Record<'1' | '2' | '3' | '4' | '5', number>
}

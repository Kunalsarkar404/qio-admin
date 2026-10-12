import { apiRequest } from '../../lib/apiClient'
import type { AdminReview, ReviewFilters, ReviewListResponse, ReviewStats, ReviewStatus } from './types'

export function listAdminReviews(filters: ReviewFilters & { page?: number; limit?: number } = {}) {
    return apiRequest<ReviewListResponse>('/admin/reviews', { query: filters })
}

export function getAdminReview(id: string) {
    return apiRequest<{ review: AdminReview }>(`/admin/reviews/${id}`)
}

export function setReviewStatus(id: string, status: ReviewStatus, reason?: string) {
    return apiRequest<{ review: AdminReview }>(`/admin/reviews/${id}`, {
        method: 'PATCH',
        json: status === 'rejected' ? { status, reason: reason ?? '' } : { status },
    })
}

export function deleteReview(id: string) {
    return apiRequest<{ id: string }>(`/admin/reviews/${id}`, { method: 'DELETE' })
}

export function getReviewStats(productId?: string) {
    return apiRequest<ReviewStats>('/admin/reviews/stats', { query: { productId } })
}

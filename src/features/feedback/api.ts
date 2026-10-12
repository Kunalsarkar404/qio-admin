import { apiRequest } from '../../lib/apiClient'
import type { FeedbackListResponse } from './types'

export function listFeedback(filters: { resolved?: boolean; page?: number; limit?: number } = {}) {
    return apiRequest<FeedbackListResponse>('/admin/feedback', { query: filters })
}

export function setFeedbackResolved(id: string, resolved: boolean) {
    return apiRequest<{ id: string; resolved: boolean }>(`/admin/feedback/${id}`, { method: 'PATCH', json: { resolved } })
}

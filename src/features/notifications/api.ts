import { apiRequest } from '../../lib/apiClient'
import type { Broadcast } from './types'

export function listBroadcasts(page = 1, limit = 15) {
    return apiRequest<{ broadcasts: Broadcast[]; total: number; page: number; limit: number }>('/admin/notifications/broadcasts', {
        query: { page, limit },
    })
}

export function sendBroadcast(input: { title: string; body: string; route: string }) {
    return apiRequest<{ broadcast: Broadcast }>('/admin/notifications/broadcast', { method: 'POST', json: input })
}

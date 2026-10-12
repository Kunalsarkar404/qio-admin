import { apiRequest } from '../../lib/apiClient'
import type { StreakFilters, StreakListResponse, StreakStats, UserStreak } from './types'

export function listUserStreaks(filters: StreakFilters & { page?: number; limit?: number } = {}) {
    return apiRequest<StreakListResponse>('/admin/streaks', {
        query: { ...filters, hasActiveStreak: filters.hasActiveStreak ? 'true' : undefined },
    })
}

export function getUserStreak(userId: string) {
    return apiRequest<{ streak: UserStreak }>(`/admin/streaks/${userId}`)
}

export function getStreakStats() {
    return apiRequest<StreakStats>('/admin/streaks/stats')
}

export function resetUserStreak(userId: string) {
    return apiRequest<{ streak: UserStreak }>(`/admin/streaks/${userId}/reset`, { method: 'POST' })
}

export function bulkResetStreaks(userIds: string[]) {
    return apiRequest<{ updated: number }>('/admin/streaks/bulk-reset', { method: 'POST', json: { userIds } })
}

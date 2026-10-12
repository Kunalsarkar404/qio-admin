import { apiRequest, downloadCsv } from '../../lib/apiClient'
import type { UserStatus } from '../../types'
import type { AdminUser, UserFilters, UserListResponse, UserStats } from './types'

export function listAdminUsers(filters: UserFilters & { page?: number; limit?: number } = {}) {
    return apiRequest<UserListResponse>('/admin/users', { query: filters })
}

export function getAdminUser(id: string) {
    return apiRequest<{ user: AdminUser }>(`/admin/users/${id}`)
}

export function updateUserStatus(id: string, status: UserStatus, suspendReason?: string) {
    return apiRequest<{ user: AdminUser }>(`/admin/users/${id}`, {
        method: 'PATCH',
        json: status === 'suspended' ? { status, suspendReason: suspendReason ?? '' } : { status },
    })
}

export function getUserStats() {
    return apiRequest<UserStats>('/admin/users/stats')
}

/** Downloads GET /admin/users/export as CSV with the same filters as the list. */
export function exportUsersCsv(filters: UserFilters = {}) {
    return downloadCsv('/admin/users/export', filters, 'users')
}

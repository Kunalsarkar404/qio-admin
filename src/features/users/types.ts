import type { PageInfo, UserStatus } from '../../types'

export const USER_STATUSES: readonly UserStatus[] = ['active', 'inactive', 'suspended']

/** serializeAdminUsers (admin.controller.js) */
export type AdminUser = {
    _id: string
    name: string
    email: string
    phone: string
    role: 'user' | 'admin'
    status: UserStatus
    suspendReason: string
    totalOrders: number
    totalSpent: number
    totalReviews: number
    walletBalance: number
    streakCount: number
    screenTimeSeconds: number
    joinedDate: string
    lastActive: string | null
}

export type UserListResponse = { users: AdminUser[] } & PageInfo

export type UserFilters = {
    status?: UserStatus | ''
    search?: string
}

export type UserStats = {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    suspendedUsers: number
    newUsersThisMonth: number
    averageOrderValue: number
}

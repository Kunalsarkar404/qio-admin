import type { PageInfo, UserRef } from '../../types'

/** serializeStreakRow — `_id` is the user id */
export type UserStreak = {
    _id: string
    user: UserRef | null
    currentStreak: number
    maxStreak: number
    lastVisitDate: string | null
    totalVisits: number
}

export type StreakListResponse = { streaks: UserStreak[] } & PageInfo

export type StreakFilters = {
    search?: string
    hasActiveStreak?: boolean
    minStreak?: number
}

export type StreakStats = {
    totalUsers: number
    usersWithStreaks: number
    averageCurrentStreak: number
    maxStreakRecord: number
    topStreakUsers: UserStreak[]
}

import { apiRequest } from '../../lib/apiClient';
import type { UserStreak, StreakStats, StreakTrend } from './types';

export async function listUserStreaks(
    token: string,
    filters?: {
        minStreak?: number;
        hasActiveStreak?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }
) {
    const query = new URLSearchParams();
    if (filters?.minStreak) query.append('minStreak', filters.minStreak.toString());
    if (filters?.hasActiveStreak !== undefined)
        query.append('hasActiveStreak', filters.hasActiveStreak.toString());
    if (filters?.search) query.append('search', filters.search);
    if (filters?.page) query.append('page', filters.page.toString());
    if (filters?.limit) query.append('limit', filters.limit.toString());

    const queryString = query.toString();
    const url = `/admin/streaks${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{ streaks: UserStreak[]; total: number }>(url, { token });
}

export async function getUserStreak(token: string, userId: string) {
    return apiRequest<{ streak: UserStreak }>(`/admin/streaks/${userId}`, { token });
}

export async function getStreakStats(token: string) {
    return apiRequest<StreakStats>('/admin/streaks/stats', { token });
}

export async function getStreakTrends(
    token: string,
    filters?: {
        startDate?: string;
        endDate?: string;
        interval?: 'daily' | 'weekly' | 'monthly';
    }
) {
    const query = new URLSearchParams();
    if (filters?.startDate) query.append('startDate', filters.startDate);
    if (filters?.endDate) query.append('endDate', filters.endDate);
    if (filters?.interval) query.append('interval', filters.interval);

    const queryString = query.toString();
    const url = `/admin/streaks/trends${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{ trends: StreakTrend[] }>(url, { token });
}

export async function resetUserStreak(token: string, userId: string) {
    return apiRequest<{ streak: UserStreak }>(`/admin/streaks/${userId}/reset`, {
        method: 'POST',
        token,
    });
}

export async function bulkResetStreaks(token: string, userIds: string[]) {
    return apiRequest<{ updated: number }>('/admin/streaks/bulk-reset', {
        method: 'POST',
        token,
        json: { userIds },
    });
}

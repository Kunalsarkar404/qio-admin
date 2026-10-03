import { apiRequest } from '../../lib/apiClient';
import type { AdminUser, UserStats } from './types';

export async function listAdminUsers(
    token: string,
    filters?: {
        status?: 'active' | 'inactive' | 'suspended';
        search?: string;
        page?: number;
        limit?: number;
    }
) {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.search) query.append('search', filters.search);
    if (filters?.page) query.append('page', filters.page.toString());
    if (filters?.limit) query.append('limit', filters.limit.toString());

    const queryString = query.toString();
    const url = `/admin/users${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{ users: AdminUser[]; total: number }>(url, { token });
}

export async function getAdminUser(token: string, id: string) {
    return apiRequest<{ user: AdminUser }>(`/admin/users/${id}`, { token });
}

export async function updateUserStatus(
    token: string,
    id: string,
    status: 'active' | 'inactive' | 'suspended'
) {
    return apiRequest<{ user: AdminUser }>(`/admin/users/${id}`, {
        method: 'PATCH',
        token,
        json: { status },
    });
}

export async function suspendUser(token: string, id: string, reason?: string) {
    return apiRequest<{ user: AdminUser }>(`/admin/users/${id}`, {
        method: 'PATCH',
        token,
        json: { status: 'suspended', suspendReason: reason },
    });
}

export async function unsuspendUser(token: string, id: string) {
    return apiRequest<{ user: AdminUser }>(`/admin/users/${id}`, {
        method: 'PATCH',
        token,
        json: { status: 'active' },
    });
}

export async function getUserStats(token: string) {
    return apiRequest<UserStats>('/admin/users/stats', { token });
}

export async function exportUsers(token: string, format: 'csv' | 'json') {
    return apiRequest<{ url: string }>('/admin/users/export', {
        token,
        json: { format },
        method: 'POST',
    });
}

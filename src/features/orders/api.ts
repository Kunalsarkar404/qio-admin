import { apiRequest } from '../../lib/apiClient';
import type { AdminOrder, OrderStats } from './types';

export async function listAdminOrders(
    token: string,
    filters?: {
        status?: string;
        startDate?: string;
        endDate?: string;
        userId?: string;
    }
) {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.startDate) query.append('startDate', filters.startDate);
    if (filters?.endDate) query.append('endDate', filters.endDate);
    if (filters?.userId) query.append('userId', filters.userId);

    const queryString = query.toString();
    const url = `/admin/orders${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{ orders: AdminOrder[] }>(url, { token });
}

export async function getAdminOrder(token: string, id: string) {
    return apiRequest<{ order: AdminOrder }>(`/admin/orders/${id}`, { token });
}

export async function updateOrderStatus(
    token: string,
    id: string,
    status: string
) {
    return apiRequest<{ order: AdminOrder }>(`/admin/orders/${id}`, {
        method: 'PATCH',
        token,
        json: { status },
    });
}

export async function getOrderStats(token: string) {
    return apiRequest<OrderStats>('/admin/orders/stats', { token });
}

export async function exportOrders(token: string, format: 'csv' | 'json') {
    return apiRequest<{ url: string }>('/admin/orders/export', {
        token,
        json: { format },
        method: 'POST',
    });
}

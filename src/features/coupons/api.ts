import { apiRequest } from '../../lib/apiClient';
import type { AdminCoupon, CouponStats } from './types';

export async function listAdminCoupons(
    token: string,
    filters?: {
        status?: 'active' | 'expired' | 'all';
        search?: string;
    }
) {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.search) query.append('search', filters.search);

    const queryString = query.toString();
    const url = `/admin/coupons${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{ coupons: AdminCoupon[] }>(url, { token });
}

export async function getAdminCoupon(token: string, id: string) {
    return apiRequest<{ coupon: AdminCoupon }>(`/admin/coupons/${id}`, { token });
}

export async function createAdminCoupon(
    token: string,
    data: Partial<AdminCoupon>
) {
    return apiRequest<{ coupon: AdminCoupon }>('/admin/coupons', {
        method: 'POST',
        token,
        json: data,
    });
}

export async function updateAdminCoupon(
    token: string,
    id: string,
    data: Partial<AdminCoupon>
) {
    return apiRequest<{ coupon: AdminCoupon }>(`/admin/coupons/${id}`, {
        method: 'PATCH',
        token,
        json: data,
    });
}

export async function deleteAdminCoupon(token: string, id: string) {
    return apiRequest<{ id: string }>(`/admin/coupons/${id}`, {
        method: 'DELETE',
        token,
    });
}

export async function getCouponStats(token: string) {
    return apiRequest<CouponStats>('/admin/coupons/stats', { token });
}

export async function validateCoupon(token: string, code: string, cartValue: number) {
    return apiRequest<{
        valid: boolean;
        discount: number;
        message?: string;
    }>('/admin/coupons/validate', {
        token,
        json: { code, cartValue },
        method: 'POST',
    });
}

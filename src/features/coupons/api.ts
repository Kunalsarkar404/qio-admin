import { apiRequest } from '../../lib/apiClient'
import type { AdminCoupon, CouponInput, CouponStats, CouponStatusFilter } from './types'

export function listAdminCoupons(filters: { status?: CouponStatusFilter; search?: string } = {}) {
    return apiRequest<{ coupons: AdminCoupon[] }>('/admin/coupons', {
        query: { status: filters.status === 'all' ? undefined : filters.status, search: filters.search },
    })
}

export function getAdminCoupon(id: string) {
    return apiRequest<{ coupon: AdminCoupon }>(`/admin/coupons/${id}`)
}

export function createAdminCoupon(data: CouponInput) {
    return apiRequest<{ coupon: AdminCoupon }>('/admin/coupons', { method: 'POST', json: data })
}

export function updateAdminCoupon(id: string, data: Partial<CouponInput>) {
    return apiRequest<{ coupon: AdminCoupon }>(`/admin/coupons/${id}`, { method: 'PATCH', json: data })
}

export function deleteAdminCoupon(id: string) {
    return apiRequest<{ id: string }>(`/admin/coupons/${id}`, { method: 'DELETE' })
}

export function getCouponStats() {
    return apiRequest<CouponStats>('/admin/coupons/stats')
}

export function validateCoupon(code: string, cartValue: number) {
    return apiRequest<{ valid: boolean; discount: number; message?: string }>('/admin/coupons/validate', {
        method: 'POST',
        json: { code, cartValue },
    })
}

import { apiRequest, downloadCsv } from '../../lib/apiClient'
import type { AdminOrder, OrderFilters, OrderListResponse, OrderStats, OrderStatus } from './types'

export function listAdminOrders(filters: OrderFilters & { page?: number; limit?: number } = {}) {
    return apiRequest<OrderListResponse>('/admin/orders', { query: filters })
}

export function getAdminOrder(id: string) {
    return apiRequest<{ order: AdminOrder }>(`/admin/orders/${id}`)
}

/** Cancelled refunds the wallet and restocks; Delivered/Cancelled are terminal (409 on change). */
export function updateOrderStatus(id: string, status: OrderStatus) {
    return apiRequest<{ order: AdminOrder }>(`/admin/orders/${id}`, { method: 'PATCH', json: { status } })
}

export function getOrderStats() {
    return apiRequest<OrderStats>('/admin/orders/stats')
}

/** Downloads GET /admin/orders/export as CSV with the same filters as the list. */
export function exportOrdersCsv(filters: OrderFilters = {}) {
    return downloadCsv('/admin/orders/export', filters, 'orders')
}

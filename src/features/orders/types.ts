import type { PageInfo, UserRef } from '../../types'

export const ORDER_STATUSES = ['Packing', 'Picked', 'In Transit', 'Delivered', 'Cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]
/** Orders in these states can no longer change (backend returns 409). */
export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = ['Delivered', 'Cancelled']

/** serializeAdminOrder → items[] */
export type AdminOrderItem = {
    _id: string
    productId: string
    name: string
    brand: string
    image: string
    size: string
    color: string
    price: number
    quantity: number
    rating?: number
}

export type ShippingAddress = {
    label?: string
    fullName?: string
    phone?: string
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
}

/** serializeAdminOrder (admin.controller.js) */
export type AdminOrder = {
    _id: string
    orderNumber: string
    user: UserRef | null
    items: AdminOrderItem[]
    shippingAddress: ShippingAddress
    status: OrderStatus
    paymentMethod: string
    subtotal: number
    discount: number
    couponCode: string
    vat: number
    shippingFee: number
    total: number
    createdAt: string
    updatedAt: string
}

export type OrderListResponse = { orders: AdminOrder[] } & PageInfo

export type OrderFilters = {
    status?: OrderStatus | ''
    search?: string
    startDate?: string
    endDate?: string
    userId?: string
}

export type OrderStats = {
    totalOrders: number
    completedOrders: number
    ongoingOrders: number
    cancelledOrders: number
    totalRevenue: number
    averageOrderValue: number
}

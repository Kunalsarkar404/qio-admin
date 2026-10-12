/** Shapes returned by GET /admin/dashboard (qio-backend admin.controller.js `dashboard`). */
export type DashboardMetrics = {
    /** Pre-formatted INR string, e.g. "₹12,345" */
    revenue: string
    revenueValue: number
    orders: number
    pendingOrders: number
    users: number
    /** Product detail opens */
    clicks: number
    /** Times products were shown in lists */
    impressions: number
    averageScreenTimeSeconds: number
}

export type RevenuePoint = {
    /** YYYY-MM-DD */
    date: string
    revenue: number
    orders: number
}

export type UserStatus = 'active' | 'inactive' | 'suspended'

export type DashboardUser = {
    id: string
    name: string
    email: string
    phone: string
    status: UserStatus
    screenTimeSeconds: number
    lastLoginAt: string | null
    walletBalance: number
    streakCount: number
    createdAt: string
}

export type DashboardOrder = {
    id: string
    orderNumber: string
    customer: string
    email: string
    /** Pre-formatted INR string */
    total: string
    status: string
    createdAt: string
    itemCount: number
}

export type DashboardReview = {
    id: string
    product: string
    customer: string
    rating: number
    text: string
    status: 'approved' | 'rejected'
    createdAt: string
}

export type DashboardBrand = {
    id: string
    name: string
    website: string
    createdAt: string
}

export type DashboardTopProduct = {
    id: string
    name: string
    brand: string
    category: string
    /** Pre-formatted INR string */
    price: string
    /** Product detail opens */
    clicks: number
    /** Times products were shown in lists */
    impressions: number
    stock: 'Live' | 'Inactive' | 'Out of stock'
    image: string
    rating: number
    reviewCount: number
}

export type DashboardData = {
    metrics: DashboardMetrics
    revenueSeries: RevenuePoint[]
    users: DashboardUser[]
    products: DashboardTopProduct[]
    orders: DashboardOrder[]
    reviews: DashboardReview[]
    brands: DashboardBrand[]
}

/** Compact user reference embedded in orders, reviews, wallets and streak rows (`userRef`). */
export type UserRef = {
    _id: string
    name: string
    email: string
    phone: string
}

/** Pagination fields returned alongside list endpoints. */
export type PageInfo = {
    total: number
    page: number
    limit: number
}

/** GET /auth/me and POST /auth/admin-login `user` (auth.controller.js sanitizeUser). */
export type AdminSessionUser = {
    id: string
    fullName: string
    email: string
    phone: string
    role: 'user' | 'admin'
    createdAt?: string
}

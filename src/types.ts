export type DashboardMetrics = {
    revenue: string
    orders: number
    users: number
    clicks: number
    averageScreenTimeSeconds: number
}

export type DashboardUser = {
    id: string
    name: string
    email: string
    phone: string
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
    price: string
    clicks: number
    stock: string
    image: string
    rating: number
    reviewCount: number
}

export type DashboardData = {
    metrics: DashboardMetrics
    users: DashboardUser[]
    products: DashboardTopProduct[]
    orders: DashboardOrder[]
    reviews: DashboardReview[]
    brands: DashboardBrand[]
}

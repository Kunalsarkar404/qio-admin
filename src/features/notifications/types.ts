/** GET /admin/notifications/broadcasts row */
export type Broadcast = {
    _id: string
    title: string
    body: string
    route: string
    recipients: number
    pushed: number
    sentBy: string
    createdAt: string
}

/** Screens a broadcast can open in the app (mirrors the backend allow-list). */
export const ROUTE_LABELS: Record<string, string> = {
    '': 'Just open the notification',
    '/(tabs)': 'Home',
    '/(tabs)/search': 'Search / shop',
    '/(tabs)/cart': 'Bag',
    '/(tabs)/saved': 'Wishlist',
    '/wallet': 'Wallet',
    '/wallet/refer': 'Refer & Earn',
    '/orders': 'My orders',
}

export const TITLE_MAX = 80
export const BODY_MAX = 300

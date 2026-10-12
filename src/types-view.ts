export const VIEWS = ['Overview', 'Products', 'Brands', 'Orders', 'Users', 'Reviews', 'Wallets', 'Streaks', 'Feedback', 'Coupons', 'Notifications'] as const

export type View = (typeof VIEWS)[number]

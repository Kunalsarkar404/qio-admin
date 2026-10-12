export type DiscountType = 'percentage' | 'fixed'

/** serializeCoupon (models/Coupon.js) */
export type AdminCoupon = {
    _id: string
    code: string
    description: string
    discountType: DiscountType
    discountValue: number
    maxDiscount?: number
    minPurchase: number
    maxUses?: number
    usedCount: number
    totalDiscountGiven: number
    expiresAt: string | null
    isActive: boolean
    applicableCategories: string[]
    createdAt: string
    updatedAt: string
}

/** Body for POST/PATCH /admin/coupons. `null` clears an optional field. */
export type CouponInput = {
    code: string
    description: string
    discountType: DiscountType
    discountValue: number
    maxDiscount: number | null
    minPurchase: number | null
    maxUses: number | null
    expiresAt: string | null
    isActive: boolean
    applicableCategories: string[]
}

export type CouponStatusFilter = 'all' | 'active' | 'expired'

export type CouponStats = {
    totalCoupons: number
    activeCoupons: number
    expiredCoupons: number
    totalRedemptions: number
    totalDiscountGiven: number
}

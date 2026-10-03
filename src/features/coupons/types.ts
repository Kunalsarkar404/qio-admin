export interface AdminCoupon {
    _id: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscount?: number;
    minPurchase?: number;
    maxUses?: number;
    usedCount: number;
    expiresAt: string;
    isActive: boolean;
    applicableCategories: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CouponStats {
    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
    totalRedemptions: number;
    totalDiscountGiven: number;
}

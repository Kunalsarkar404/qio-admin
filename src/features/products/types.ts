/** Mirrors Product.CATEGORIES in qio-backend; GET /admin/products also returns the live list. */
export const PRODUCT_CATEGORIES = ['Tshirts', 'Jeans', 'Shoes', 'Hoodie', 'Accessories'] as const

/** Mirrors Product.GENDERS — Unisex products show under both Men and Women in the app. */
export const PRODUCT_GENDERS = ['Unisex', 'Men', 'Women'] as const
export type ProductGender = (typeof PRODUCT_GENDERS)[number]

export const MAX_PRODUCT_IMAGES = 6
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export type SizeStockEntry = { size: string; stock: number }

/** serializeProduct + isActive/createdAt (admin list/detail) */
export type AdminProduct = {
    id: string
    name: string
    brand: string
    price: number
    originalPrice?: number
    category: string
    gender?: ProductGender
    rating: number
    reviewCount: number
    image: string
    images: string[]
    colors: string[]
    sizes: string[]
    sizeStock: SizeStockEntry[]
    stock: number
    /** Detail-page opens */
    clicks: number
    /** Times shown in a list/rail */
    impressions: number
    description: string
    details: string[]
    materialAndFit: string[]
    isNew?: boolean
    isActive: boolean
    createdAt?: string
}

/** Store-facing status: inactive wins, then out-of-stock (only when sizes are tracked). */
export function productStatus(product: Pick<AdminProduct, 'isActive' | 'sizeStock' | 'stock'>) {
    if (product.isActive === false) return 'Inactive'
    if (product.sizeStock?.length && product.stock === 0) return 'Out of stock'
    return 'Live'
}

export const PRODUCT_CATEGORIES = ['Tshirts', 'Jeans', 'Shoes', 'Hoodie', 'Accessories'] as const

export type SizeStockEntry = { size: string; stock: number }

export type AdminProduct = {
    id: string
    name: string
    brand: string
    price: number
    originalPrice?: number
    category: string
    rating: number
    reviewCount: number
    image: string
    images: string[]
    colors: string[]
    sizes: string[]
    sizeStock: SizeStockEntry[]
    stock: number
    clicks: number
    description: string
    details: string[]
    materialAndFit: string[]
    isNew?: boolean
    createdAt?: string
}

import { apiRequest } from '../../lib/apiClient'
import type { ProductViewer, UserProductView } from './types'

export function listProductViewers(productId: string, page = 1, limit = 25) {
    return apiRequest<{ viewers: ProductViewer[]; total: number; page: number; limit: number }>(
        `/admin/products/${productId}/viewers?page=${page}&limit=${limit}`,
    )
}

export function listUserProductViews(userId: string, page = 1, limit = 25) {
    return apiRequest<{ views: UserProductView[]; total: number; page: number; limit: number }>(
        `/admin/users/${userId}/views?page=${page}&limit=${limit}`,
    )
}

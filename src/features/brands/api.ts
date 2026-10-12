import { apiRequest } from '../../lib/apiClient'
import type { AdminBrand } from './types'

/** All brands, including inactive ones. */
export function listAdminBrands() {
    return apiRequest<{ brands: AdminBrand[] }>('/admin/brands')
}

export function createBrand(name: string, website: string) {
    return apiRequest<{ brand: AdminBrand }>('/admin/brands', { method: 'POST', json: { name, website } })
}

export function updateBrand(id: string, patch: { name?: string; website?: string; isActive?: boolean }) {
    return apiRequest<{ brand: AdminBrand }>(`/admin/brands/${id}`, { method: 'PATCH', json: patch })
}

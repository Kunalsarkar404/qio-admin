import { apiRequest } from '../../lib/apiClient'
import type { DashboardBrand } from '../../types'

export async function createBrand(token: string, name: string, website: string) {
    return apiRequest<{ brand: DashboardBrand }>('/admin/brands', {
        method: 'POST',
        token,
        json: { name, website },
    })
}

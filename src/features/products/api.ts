import { apiRequest } from '../../lib/apiClient'
import type { AdminProduct } from './types'

export function listAdminProducts() {
  return apiRequest<{ products: AdminProduct[]; categories: string[] }>('/admin/products')
}

export function getAdminProduct(id: string) {
  return apiRequest<{ product: AdminProduct }>(`/admin/products/${id}`)
}

export function createAdminProduct(formData: FormData) {
  return apiRequest<{ product: AdminProduct }>('/admin/products', { method: 'POST', formData })
}

export function updateAdminProduct(id: string, formData: FormData) {
  return apiRequest<{ product: AdminProduct }>(`/admin/products/${id}`, { method: 'PATCH', formData })
}

export function deleteAdminProduct(id: string) {
  return apiRequest<{ id: string }>(`/admin/products/${id}`, { method: 'DELETE' })
}

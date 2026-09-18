import { apiRequest } from '../../lib/apiClient'
import type { AdminProduct } from './types'

export async function listAdminProducts(token: string) {
  return apiRequest<{ products: AdminProduct[]; categories: string[] }>('/admin/products', { token })
}

export async function getAdminProduct(token: string, id: string) {
  return apiRequest<{ product: AdminProduct }>(`/admin/products/${id}`, { token })
}

export async function createAdminProduct(token: string, formData: FormData) {
  return apiRequest<{ product: AdminProduct }>('/admin/products', { method: 'POST', token, formData })
}

export async function updateAdminProduct(token: string, id: string, formData: FormData) {
  return apiRequest<{ product: AdminProduct }>(`/admin/products/${id}`, { method: 'PATCH', token, formData })
}

export async function deleteAdminProduct(token: string, id: string) {
  return apiRequest<{ id: string }>(`/admin/products/${id}`, { method: 'DELETE', token })
}

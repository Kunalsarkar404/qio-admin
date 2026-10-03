import { apiRequest } from '../../lib/apiClient';
import type { AdminReview, ReviewStats } from './types';

export async function listAdminReviews(
  token: string,
  filters?: {
    productId?: string;
    rating?: number;
    status?: 'pending' | 'approved' | 'rejected';
  }
) {
  const query = new URLSearchParams();
  if (filters?.productId) query.append('productId', filters.productId);
  if (filters?.rating) query.append('rating', filters.rating.toString());
  if (filters?.status) query.append('status', filters.status);

  const queryString = query.toString();
  const url = `/admin/reviews${queryString ? `?${queryString}` : ''}`;

  return apiRequest<{ reviews: AdminReview[] }>(url, { token });
}

export async function getAdminReview(token: string, id: string) {
  return apiRequest<{ review: AdminReview }>(`/admin/reviews/${id}`, { token });
}

export async function approveReview(token: string, id: string) {
  return apiRequest<{ review: AdminReview }>(`/admin/reviews/${id}`, {
    method: 'PATCH',
    token,
    json: { status: 'approved' },
  });
}

export async function rejectReview(token: string, id: string, reason?: string) {
  return apiRequest<{ review: AdminReview }>(`/admin/reviews/${id}`, {
    method: 'PATCH',
    token,
    json: { status: 'rejected', reason },
  });
}

export async function deleteReview(token: string, id: string) {
  return apiRequest<{ id: string }>(`/admin/reviews/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function getReviewStats(token: string, productId?: string) {
  const url = productId
    ? `/admin/reviews/stats?productId=${productId}`
    : '/admin/reviews/stats';
  return apiRequest<ReviewStats>(url, { token });
}

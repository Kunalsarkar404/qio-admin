import { apiRequest } from '../lib/apiClient'
import type { DashboardData } from '../types'
import { useApiData } from './useApiData'

/** Loads the overview metrics, revenue series and recent activity for the signed-in admin. */
export function useDashboard() {
    const { data, error, loading, loadedAt, reload } = useApiData('dashboard', () => apiRequest<DashboardData>('/admin/dashboard'))
    return { data, error, loading, loadedAt, refresh: reload }
}

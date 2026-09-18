import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import type { DashboardData } from '../types'

/** Loads the overview/users/orders/reviews/brands summary for the signed-in admin. */
export function useDashboard() {
    const { token, signOut } = useAuth()
    const [data, setData] = useState<DashboardData | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        if (!token) return
        let cancelled = false
        setLoading(true)

        apiRequest<DashboardData>('/admin/dashboard', { token })
            .then((payload) => {
                if (cancelled) return
                setData(payload)
                setError('')
            })
            .catch((requestError) => {
                if (cancelled) return
                console.error('[QIO admin] Dashboard load failed:', requestError)
                setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard')
                if (requestError?.status === 401) signOut()
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [token, signOut, reloadKey])

    const refresh = () => setReloadKey((key) => key + 1)

    return { data, error, loading, refresh }
}

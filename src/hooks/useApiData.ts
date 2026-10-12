import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '../lib/apiClient'

type LoadResult<T> = { key: string; data: T | null; error: string; loadedAt: Date }

/**
 * Loads data for `key` (any string describing the request — change it to refetch).
 * Previous data stays visible while a new key loads, so tables don't flash empty.
 */
export function useApiData<T>(key: string, loader: () => Promise<T>) {
    const [reloadCount, setReloadCount] = useState(0)
    const [result, setResult] = useState<LoadResult<T> | null>(null)
    const loaderRef = useRef(loader)

    useEffect(() => {
        loaderRef.current = loader
    })

    const requestKey = `${key}::${reloadCount}`

    useEffect(() => {
        let cancelled = false
        loaderRef.current().then(
            (data) => {
                if (!cancelled) setResult({ key: requestKey, data, error: '', loadedAt: new Date() })
            },
            (error) => {
                if (!cancelled) setResult((current) => ({ key: requestKey, data: current?.data ?? null, error: errorMessage(error, 'Unable to load data'), loadedAt: new Date() }))
            },
        )
        return () => {
            cancelled = true
        }
    }, [requestKey])

    const reload = useCallback(() => setReloadCount((count) => count + 1), [])
    const loading = result?.key !== requestKey

    return {
        data: result?.data ?? null,
        error: loading ? '' : (result?.error ?? ''),
        loading,
        loadedAt: result?.loadedAt ?? null,
        reload,
    }
}

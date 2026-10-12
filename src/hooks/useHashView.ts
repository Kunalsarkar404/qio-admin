import { useCallback, useSyncExternalStore } from 'react'
import { VIEWS, type View } from '../types-view'

function subscribe(onChange: () => void) {
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
}

const getHash = () => window.location.hash

function viewFromHash(hash: string): View {
    const slug = hash.replace(/^#\/?/, '').toLowerCase()
    return VIEWS.find((view) => view.toLowerCase() === slug) ?? 'Overview'
}

/** Current view stored in the URL hash (e.g. #orders) so refresh and back/forward work. */
export function useHashView() {
    const hash = useSyncExternalStore(subscribe, getHash, () => '')
    const view = viewFromHash(hash)
    const navigate = useCallback((next: View) => {
        window.location.hash = next.toLowerCase()
    }, [])
    return [view, navigate] as const
}

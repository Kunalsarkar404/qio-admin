import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest, errorMessage, getAuthToken, setAuthToken, setUnauthorizedHandler } from '../lib/apiClient'
import type { AdminSessionUser } from '../types'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState(getAuthToken)
    const [user, setUser] = useState<AdminSessionUser | null>(null)
    const [loginError, setLoginError] = useState('')

    const signOut = useCallback(() => {
        setAuthToken('')
        setToken('')
        setUser(null)
    }, [])

    // Any authenticated request that comes back 401 ends the session.
    useEffect(
        () =>
            setUnauthorizedHandler(() => {
                setLoginError('Your session has expired. Please sign in again.')
                signOut()
            }),
        [signOut],
    )

    // Verify a stored token on load (and whenever a token appears without a known user).
    useEffect(() => {
        if (!token || user) return
        let cancelled = false
        apiRequest<{ user: AdminSessionUser }>('/auth/me')
            .then(({ user: me }) => {
                if (cancelled) return
                if (me?.role !== 'admin') {
                    setLoginError('This account does not have admin access.')
                    signOut()
                    return
                }
                setUser(me)
            })
            .catch((error) => {
                if (cancelled) return
                setLoginError(errorMessage(error, 'Your session could not be verified. Please sign in again.'))
                signOut()
            })
        return () => {
            cancelled = true
        }
    }, [token, user, signOut])

    const signIn = useCallback(async (username: string, password: string) => {
        setLoginError('')
        try {
            const data = await apiRequest<{ token: string; user: AdminSessionUser }>('/auth/admin-login', {
                method: 'POST',
                json: { username, password },
            })
            if (!data?.token) throw new Error('Sign-in response did not include a token')
            if (data.user?.role !== 'admin') throw new Error('This account does not have admin access')
            setAuthToken(data.token)
            setUser(data.user)
            setToken(data.token)
        } catch (error) {
            setLoginError(errorMessage(error, 'Unable to sign in'))
            throw error
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' })
        } catch {
            // best effort — the JWT is discarded locally either way
        }
        setLoginError('')
        signOut()
    }, [signOut])

    const value = useMemo(
        () => ({ token, user, checking: Boolean(token) && !user, loginError, signIn, signOut, logout }),
        [token, user, loginError, signIn, signOut, logout],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

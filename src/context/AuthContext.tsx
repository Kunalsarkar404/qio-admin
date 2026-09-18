import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { apiRequest, ApiRequestError } from '../lib/apiClient'

const STORAGE_KEY = 'qio_admin_token'

type AuthContextValue = {
    token: string
    loginError: string
    signIn: (username: string, password: string) => Promise<void>
    signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
    const [loginError, setLoginError] = useState('')

    const signOut = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY)
        setToken('')
    }, [])

    const signIn = useCallback(async (username: string, password: string) => {
        setLoginError('')
        try {
            const data = await apiRequest<{ token: string }>('/auth/admin-login', {
                method: 'POST',
                json: { username, password },
            })
            if (!data?.token) throw new Error('Sign-in response did not include a JWT')
            localStorage.setItem(STORAGE_KEY, data.token)
            setToken(data.token)
        } catch (error) {
            const message = error instanceof ApiRequestError ? error.message : 'Unable to sign in'
            setLoginError(message)
            throw error
        }
    }, [])

    const value = useMemo(() => ({ token, loginError, signIn, signOut }), [token, loginError, signIn, signOut])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

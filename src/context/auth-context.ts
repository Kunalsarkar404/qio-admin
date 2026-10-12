import { createContext, useContext } from 'react'
import type { AdminSessionUser } from '../types'

export type AuthContextValue = {
    token: string
    user: AdminSessionUser | null
    /** True while a stored token is being verified with GET /auth/me */
    checking: boolean
    loginError: string
    signIn: (username: string, password: string) => Promise<void>
    signOut: () => void
    /** Best-effort POST /auth/logout, then sign out locally */
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

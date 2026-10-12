import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/auth-context'

export function LoginScreen() {
    const { signIn, loginError } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (submitting) return
        setSubmitting(true)
        try {
            await signIn(username.trim(), password)
        } catch {
            // error surfaced via loginError from context
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="admin-login">
            <div className="login-card">
                <div className="brand-lockup login-brand">
                    <div className="brand-mark">Q</div>
                    <span>
                        QIO <small>ADMIN</small>
                    </span>
                </div>
                <p className="eyebrow">Restricted workspace</p>
                <h1>Welcome back.</h1>
                <p className="page-subtitle">Sign in to manage your catalog, customers, orders and store analytics.</p>
                <form className="modal-form" onSubmit={onSubmit}>
                    <label>
                        Username
                        <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
                    </label>
                    <label>
                        Password
                        <input
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            type="password"
                            autoComplete="current-password"
                            required
                        />
                    </label>
                    {loginError && <p className="login-error">{loginError}</p>}
                    <button type="submit" className="primary-button login-submit" disabled={submitting || !username.trim() || !password}>
                        {submitting ? 'Signing in…' : 'Sign in to dashboard'}
                    </button>
                </form>
            </div>
        </main>
    )
}

export function SessionCheckScreen() {
    return (
        <main className="admin-login">
            <div className="login-card">
                <div className="brand-lockup login-brand">
                    <div className="brand-mark">Q</div>
                    <span>
                        QIO <small>ADMIN</small>
                    </span>
                </div>
                <p className="page-subtitle">Verifying your session…</p>
            </div>
        </main>
    )
}

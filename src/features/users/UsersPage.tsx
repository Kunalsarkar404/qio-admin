import { Clock3, Wallet, Flame } from 'lucide-react'
import { StatusPill, Toolbar } from '../../components/ui'
import type { DashboardUser } from '../../types'

function formatDate(value: string | null) {
    if (!value) return 'Never'
    return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatScreenTime(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remMinutes = minutes % 60
    return hours > 0 ? `${hours}h ${remMinutes}m` : `${remMinutes}m`
}

export function UsersPage({ users }: { users: DashboardUser[] }) {
    return (
        <section className="panel table-panel full-panel">
            <Toolbar title="Registered users" text={`${users.length} users tracked`} />
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Wallet Balance</th>
                        <th>Streak</th>
                        <th>Screen time</th>
                        <th>Last login</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>
                                <div className="user-cell">
                                    <div className="user-avatar">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
                                    <div>
                                        <strong>{user.name}</strong>
                                        <span>{user.email}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Wallet size={14} />
                                    ₹{user.walletBalance?.toLocaleString('en-IN') || 0}
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Flame size={14} />
                                    {user.streakCount || 0} days
                                </div>
                            </td>
                            <td>
                                <Clock3 size={14} /> {formatScreenTime(user.screenTimeSeconds)}
                            </td>
                            <td>{formatDate(user.lastLoginAt)}</td>
                            <td>
                                <StatusPill status={user.lastLoginAt ? 'Active' : 'New'} />
                            </td>
                        </tr>
                    ))}
                    {!users.length && (
                        <tr>
                            <td colSpan={6} className="empty-state">
                                No registered users yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    )
}

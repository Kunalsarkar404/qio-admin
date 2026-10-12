import { useState } from 'react'
import { Ban, Download, Eye, Search, UserCheck, UserX } from 'lucide-react'
import { UserViewsModal } from '../tracking/UserViewsModal'
import { ConfirmDialog, FilterBar, Notice, Pagination, StatusPill, TableMessage, Toolbar, UserCell, type NoticeState } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { errorMessage } from '../../lib/apiClient'
import { formatDate, formatDateTime, formatINR } from '../../lib/format'
import type { UserStatus } from '../../types'
import { exportUsersCsv, listAdminUsers, updateUserStatus } from './api'
import { USER_STATUSES, type AdminUser } from './types'

const PAGE_SIZE = 20

type PendingAction = { user: AdminUser; status: UserStatus } | null

export function UsersPage() {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<UserStatus | ''>('')
    const [page, setPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search.trim())
    const [notice, setNotice] = useState<NoticeState>(null)
    const [pending, setPending] = useState<PendingAction>(null)
    const [viewing, setViewing] = useState<AdminUser | null>(null)
    const [busyId, setBusyId] = useState('')
    const [exporting, setExporting] = useState(false)

    const filters = { search: debouncedSearch, status }
    const { data, error, loading, reload } = useApiData(`users:${JSON.stringify(filters)}:${page}`, () =>
        listAdminUsers({ ...filters, page, limit: PAGE_SIZE }),
    )
    const users = data?.users ?? []

    const applyStatus = async (user: AdminUser, next: UserStatus, reason?: string) => {
        await updateUserStatus(user._id, next, reason)
        setNotice({ kind: 'success', text: `${user.name} is now ${next}.` })
        reload()
    }

    const reactivate = async (user: AdminUser) => {
        setBusyId(user._id)
        setNotice(null)
        try {
            await applyStatus(user, 'active')
        } catch (requestError) {
            setNotice({ kind: 'error', text: errorMessage(requestError, 'Could not update the user') })
        } finally {
            setBusyId('')
        }
    }

    const onExport = async () => {
        setExporting(true)
        try {
            await exportUsersCsv(filters)
        } catch (requestError) {
            setNotice({ kind: 'error', text: errorMessage(requestError, 'Export failed') })
        } finally {
            setExporting(false)
        }
    }

    return (
        <section className="panel table-panel full-panel">
            <Toolbar title="Registered users" text={data ? `${data.total.toLocaleString('en-IN')} users match your filters` : 'Loading users…'}>
                <button type="button" className="secondary-button" onClick={onExport} disabled={exporting}>
                    <Download size={15} /> {exporting ? 'Exporting…' : 'Export CSV'}
                </button>
            </Toolbar>

            <FilterBar>
                <label className="search-box">
                    <Search size={17} />
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setPage(1)
                        }}
                        placeholder="Name, email or phone"
                    />
                </label>
                <select
                    className="filter-select"
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value as UserStatus | '')
                        setPage(1)
                    }}
                    aria-label="Status"
                >
                    <option value="">All statuses</option>
                    {USER_STATUSES.map((item) => (
                        <option key={item} value={item}>
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                        </option>
                    ))}
                </select>
            </FilterBar>

            <Notice notice={notice} onDismiss={() => setNotice(null)} />

            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Orders</th>
                        <th>Spent</th>
                        <th>Wallet</th>
                        <th>Streak</th>
                        <th>Joined</th>
                        <th>Last active</th>
                        <th>Status</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>
                                <UserCell name={user.name} email={user.email} />
                            </td>
                            <td>{user.totalOrders}</td>
                            <td>
                                <strong>{formatINR(user.totalSpent)}</strong>
                            </td>
                            <td>{formatINR(user.walletBalance)}</td>
                            <td>
                                {user.streakCount} day{user.streakCount === 1 ? '' : 's'}
                            </td>
                            <td>{formatDate(user.joinedDate)}</td>
                            <td>{formatDateTime(user.lastActive, 'Never')}</td>
                            <td>
                                <span title={user.status === 'suspended' && user.suspendReason ? `Reason: ${user.suspendReason}` : undefined}>
                                    <StatusPill status={user.status} />
                                </span>
                            </td>
                            <td className="row-actions">
                                <button
                                    type="button"
                                    className="row-menu"
                                    aria-label={`Products viewed by ${user.name}`}
                                    title="Products viewed"
                                    onClick={() => setViewing(user)}
                                >
                                    <Eye size={15} />
                                </button>
                                {user.status !== 'active' && (
                                    <button
                                        type="button"
                                        className="row-menu"
                                        aria-label={`Reactivate ${user.name}`}
                                        title="Reactivate"
                                        disabled={busyId === user._id}
                                        onClick={() => reactivate(user)}
                                    >
                                        <UserCheck size={15} />
                                    </button>
                                )}
                                {user.status === 'active' && (
                                    <button
                                        type="button"
                                        className="row-menu"
                                        aria-label={`Mark ${user.name} inactive`}
                                        title="Mark inactive"
                                        onClick={() => setPending({ user, status: 'inactive' })}
                                    >
                                        <UserX size={15} />
                                    </button>
                                )}
                                {user.status !== 'suspended' && (
                                    <button
                                        type="button"
                                        className="row-menu row-menu-danger"
                                        aria-label={`Suspend ${user.name}`}
                                        title="Suspend"
                                        onClick={() => setPending({ user, status: 'suspended' })}
                                    >
                                        <Ban size={15} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {!users.length && <TableMessage colSpan={9} loading={loading} error={error} empty="No users match these filters." />}
                </tbody>
            </table>
            {error && users.length > 0 && <p className="login-error">{error}</p>}
            {data && <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />}

            {pending?.status === 'suspended' && (
                <ConfirmDialog
                    title={`Suspend ${pending.user.name}?`}
                    message="Suspended users are signed out of the app and cannot use their account until reactivated."
                    confirmLabel="Suspend user"
                    danger
                    reason={{ label: 'Reason', required: true, placeholder: 'e.g. Repeated payment abuse' }}
                    onConfirm={(reason) => applyStatus(pending.user, 'suspended', reason)}
                    onClose={() => setPending(null)}
                />
            )}
            {pending?.status === 'inactive' && (
                <ConfirmDialog
                    title={`Mark ${pending.user.name} inactive?`}
                    message="The account is flagged as inactive. The user can still sign in; you can reactivate them at any time."
                    confirmLabel="Mark inactive"
                    onConfirm={() => applyStatus(pending.user, 'inactive')}
                    onClose={() => setPending(null)}
                />
            )}
            {viewing && <UserViewsModal user={viewing} onClose={() => setViewing(null)} />}
        </section>
    )
}

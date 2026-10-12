import { useState } from 'react'
import { Flame, RotateCcw, Search, Trophy, Users } from 'lucide-react'
import { ConfirmDialog, FilterBar, Metric, Notice, Pagination, TableMessage, Toolbar, UserCell, type NoticeState } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { formatDate, formatNumber } from '../../lib/format'
import { bulkResetStreaks, getStreakStats, listUserStreaks, resetUserStreak } from './api'
import type { UserStreak } from './types'

const PAGE_SIZE = 20

export function StreaksPage() {
    const [search, setSearch] = useState('')
    const [activeOnly, setActiveOnly] = useState(false)
    const [page, setPage] = useState(1)
    const [selected, setSelected] = useState<string[]>([])
    const [notice, setNotice] = useState<NoticeState>(null)
    const [pendingReset, setPendingReset] = useState<UserStreak | null>(null)
    const [bulkOpen, setBulkOpen] = useState(false)
    const debouncedSearch = useDebouncedValue(search.trim())

    const stats = useApiData('streak-stats', getStreakStats)
    const filters = { search: debouncedSearch, hasActiveStreak: activeOnly }
    const { data, error, loading, reload } = useApiData(`streaks:${JSON.stringify(filters)}:${page}`, () =>
        listUserStreaks({ ...filters, page, limit: PAGE_SIZE }),
    )
    const rows = data?.streaks ?? []
    const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row._id))

    const changePage = (next: number) => {
        setPage(next)
        setSelected([])
    }
    const toggle = (id: string) => setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    const toggleAll = () => setSelected(allSelected ? [] : rows.map((row) => row._id))
    const afterReset = (text: string) => {
        setNotice({ kind: 'success', text })
        setSelected([])
        reload()
        stats.reload()
    }

    return (
        <>
            <section className="metric-grid">
                <Metric icon={<Users />} label="Customers" value={formatNumber(stats.data?.totalUsers)} />
                <Metric icon={<Flame />} label="Active streaks" value={formatNumber(stats.data?.usersWithStreaks)} detail="Activity today or yesterday" />
                <Metric icon={<Flame />} label="Average active streak" value={`${stats.data?.averageCurrentStreak ?? 0} days`} />
                <Metric icon={<Trophy />} label="Longest streak ever" value={`${stats.data?.maxStreakRecord ?? 0} days`} />
            </section>
            {stats.error && <p className="login-error">{stats.error}</p>}

            {stats.data && stats.data.topStreakUsers.length > 0 && (
                <section className="panel top-streaks">
                    <h2>Top active streaks</h2>
                    <ol>
                        {stats.data.topStreakUsers.map((row) => (
                            <li key={row._id}>
                                <span>{row.user?.name || 'Deleted user'}</span>
                                <b>
                                    <Flame size={13} /> {row.currentStreak}
                                </b>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            <section className="panel table-panel full-panel">
                <Toolbar title="Customer streaks" text={data ? `${data.total.toLocaleString('en-IN')} customers match your filters` : 'Loading streaks…'}>
                    <button type="button" className="secondary-button" disabled={!selected.length} onClick={() => setBulkOpen(true)}>
                        <RotateCcw size={15} /> Reset selected ({selected.length})
                    </button>
                </Toolbar>
                <FilterBar>
                    <label className="search-box">
                        <Search size={17} />
                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value)
                                changePage(1)
                            }}
                            placeholder="Customer name or email"
                        />
                    </label>
                    <label className="checkbox-row filter-check">
                        <input
                            type="checkbox"
                            checked={activeOnly}
                            onChange={(event) => {
                                setActiveOnly(event.target.checked)
                                changePage(1)
                            }}
                        />
                        Active streaks only
                    </label>
                </FilterBar>
                <Notice notice={notice} onDismiss={() => setNotice(null)} />

                <table>
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all on this page" />
                            </th>
                            <th>Customer</th>
                            <th>Current</th>
                            <th>Best</th>
                            <th>Active days</th>
                            <th>Last activity</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row._id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(row._id)}
                                        onChange={() => toggle(row._id)}
                                        aria-label={`Select ${row.user?.name || 'user'}`}
                                    />
                                </td>
                                <td>
                                    <UserCell name={row.user?.name} email={row.user?.email} />
                                </td>
                                <td>
                                    <strong>
                                        {row.currentStreak} day{row.currentStreak === 1 ? '' : 's'}
                                    </strong>
                                </td>
                                <td>{row.maxStreak} days</td>
                                <td>{row.totalVisits}</td>
                                <td>{formatDate(row.lastVisitDate, 'Never')}</td>
                                <td>
                                    <button type="button" className="row-menu" title="Reset streak" aria-label="Reset streak" onClick={() => setPendingReset(row)}>
                                        <RotateCcw size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!rows.length && <TableMessage colSpan={7} loading={loading} error={error} empty="No customers match these filters." />}
                    </tbody>
                </table>
                {error && rows.length > 0 && <p className="login-error">{error}</p>}
                {data && <Pagination page={data.page} limit={data.limit} total={data.total} onChange={changePage} />}
            </section>

            {pendingReset && (
                <ConfirmDialog
                    title={`Reset ${pendingReset.user?.name || 'this user'}'s streak?`}
                    message={`Their current streak of ${pendingReset.currentStreak} days goes back to 0. Their best streak and active-day count are kept.`}
                    confirmLabel="Reset streak"
                    danger
                    onConfirm={async () => {
                        await resetUserStreak(pendingReset._id)
                        afterReset('Streak reset.')
                    }}
                    onClose={() => setPendingReset(null)}
                />
            )}
            {bulkOpen && (
                <ConfirmDialog
                    title={`Reset ${selected.length} streak${selected.length === 1 ? '' : 's'}?`}
                    message="Every selected customer's current streak goes back to 0. This cannot be undone."
                    confirmLabel="Reset selected"
                    danger
                    onConfirm={async () => {
                        const result = await bulkResetStreaks(selected)
                        afterReset(`${result.updated} streak${result.updated === 1 ? '' : 's'} reset.`)
                    }}
                    onClose={() => setBulkOpen(false)}
                />
            )}
        </>
    )
}

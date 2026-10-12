import { useState } from 'react'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { FilterBar, Notice, Pagination, StatusPill, TableMessage, Toolbar, UserCell, type NoticeState } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { errorMessage } from '../../lib/apiClient'
import { formatDateTime } from '../../lib/format'
import { listFeedback, setFeedbackResolved } from './api'
import type { AdminFeedback } from './types'

const PAGE_SIZE = 25
type ResolvedFilter = '' | 'open' | 'resolved'

export function FeedbackPage() {
    const [filter, setFilter] = useState<ResolvedFilter>('open')
    const [page, setPage] = useState(1)
    const [notice, setNotice] = useState<NoticeState>(null)
    const [busyId, setBusyId] = useState('')

    const resolved = filter === '' ? undefined : filter === 'resolved'
    const { data, error, loading, reload } = useApiData(`feedback:${filter}:${page}`, () => listFeedback({ resolved, page, limit: PAGE_SIZE }))
    const items = data?.feedback ?? []

    const toggle = async (item: AdminFeedback) => {
        setBusyId(item._id)
        setNotice(null)
        try {
            await setFeedbackResolved(item._id, !item.resolved)
            setNotice({ kind: 'success', text: item.resolved ? 'Feedback reopened.' : 'Feedback marked as resolved.' })
            reload()
        } catch (requestError) {
            setNotice({ kind: 'error', text: errorMessage(requestError, 'Could not update feedback') })
        } finally {
            setBusyId('')
        }
    }

    return (
        <section className="panel table-panel full-panel">
            <Toolbar title="Customer feedback" text={data ? `${data.total.toLocaleString('en-IN')} messages` : 'Loading feedback…'} />
            <FilterBar>
                <select
                    className="filter-select"
                    value={filter}
                    onChange={(event) => {
                        setFilter(event.target.value as ResolvedFilter)
                        setPage(1)
                    }}
                    aria-label="Resolved filter"
                >
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                    <option value="">All feedback</option>
                </select>
            </FilterBar>
            <Notice notice={notice} onDismiss={() => setNotice(null)} />
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Message</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Received</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item._id}>
                            <td>
                                <UserCell name={item.user?.name} email={item.user?.email} />
                            </td>
                            <td className="review-text">{item.message}</td>
                            <td>{item.source === 'order' ? `Order ${item.orderNumber || ''}`.trim() : 'App'}</td>
                            <td>
                                <StatusPill status={item.resolved ? 'resolved' : 'open'} />
                            </td>
                            <td>{formatDateTime(item.createdAt)}</td>
                            <td>
                                <button type="button" className="secondary-button compact" disabled={busyId === item._id} onClick={() => toggle(item)}>
                                    {item.resolved ? (
                                        <>
                                            <RotateCcw size={14} /> Reopen
                                        </>
                                    ) : (
                                        <>
                                            <CircleCheck size={14} /> Resolve
                                        </>
                                    )}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!items.length && <TableMessage colSpan={6} loading={loading} error={error} empty="No feedback here." />}
                </tbody>
            </table>
            {error && items.length > 0 && <p className="login-error">{error}</p>}
            {data && <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />}
        </section>
    )
}

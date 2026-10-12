import { useState } from 'react'
import { CircleCheck, CircleX, Trash2 } from 'lucide-react'
import { ConfirmDialog, FilterBar, Notice, Pagination, Stars, StatusPill, TableMessage, Toolbar, type NoticeState } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { errorMessage } from '../../lib/apiClient'
import { formatDate } from '../../lib/format'
import { deleteReview, listAdminReviews, setReviewStatus } from './api'
import type { AdminReview, ReviewStatus } from './types'

const PAGE_SIZE = 25

type PendingAction = { review: AdminReview; kind: 'reject' | 'delete' } | null

export function ReviewsPage() {
    const [status, setStatus] = useState<ReviewStatus | ''>('')
    const [rating, setRating] = useState<number | ''>('')
    const [page, setPage] = useState(1)
    const [notice, setNotice] = useState<NoticeState>(null)
    const [pending, setPending] = useState<PendingAction>(null)
    const [busyId, setBusyId] = useState('')

    const filters = { status, rating }
    const { data, error, loading, reload } = useApiData(`reviews:${JSON.stringify(filters)}:${page}`, () =>
        listAdminReviews({ ...filters, page, limit: PAGE_SIZE }),
    )
    const reviews = data?.reviews ?? []

    const approve = async (review: AdminReview) => {
        setBusyId(review._id)
        setNotice(null)
        try {
            await setReviewStatus(review._id, 'approved')
            setNotice({ kind: 'success', text: 'Review approved and visible in the app.' })
            reload()
        } catch (requestError) {
            setNotice({ kind: 'error', text: errorMessage(requestError, 'Could not approve the review') })
        } finally {
            setBusyId('')
        }
    }

    return (
        <section className="panel table-panel full-panel">
            <Toolbar title="Ratings and reviews" text={data ? `${data.total.toLocaleString('en-IN')} reviews match your filters` : 'Loading reviews…'} />

            <FilterBar>
                <select
                    className="filter-select"
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value as ReviewStatus | '')
                        setPage(1)
                    }}
                    aria-label="Status"
                >
                    <option value="">All statuses</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select
                    className="filter-select"
                    value={rating}
                    onChange={(event) => {
                        setRating(event.target.value ? Number(event.target.value) : '')
                        setPage(1)
                    }}
                    aria-label="Rating"
                >
                    <option value="">All ratings</option>
                    {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                            {value} star{value === 1 ? '' : 's'}
                        </option>
                    ))}
                </select>
            </FilterBar>

            <Notice notice={notice} onDismiss={() => setNotice(null)} />

            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Feedback</th>
                        <th>Status</th>
                        <th>Received</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review) => (
                        <tr key={review._id}>
                            <td>
                                <strong>{review.product?.name || 'Deleted product'}</strong>
                            </td>
                            <td>
                                <strong>{review.name || review.user?.name || 'Anonymous'}</strong>
                                <div className="cell-sub">
                                    {review.user?.email || 'No linked account'}
                                    {review.verified ? ' · Verified buyer' : ''}
                                </div>
                            </td>
                            <td>
                                <Stars rating={review.rating} />
                            </td>
                            <td className="review-text">
                                {review.text || <em>No written feedback</em>}
                                {review.status === 'rejected' && review.rejectReason && <div className="cell-sub">Rejected: {review.rejectReason}</div>}
                            </td>
                            <td>
                                <StatusPill status={review.status} />
                            </td>
                            <td>{formatDate(review.createdAt)}</td>
                            <td className="row-actions">
                                {review.status !== 'approved' && (
                                    <button
                                        type="button"
                                        className="row-menu"
                                        aria-label="Approve review"
                                        title="Approve"
                                        disabled={busyId === review._id}
                                        onClick={() => approve(review)}
                                    >
                                        <CircleCheck size={15} />
                                    </button>
                                )}
                                {review.status !== 'rejected' && (
                                    <button type="button" className="row-menu" aria-label="Reject review" title="Reject" onClick={() => setPending({ review, kind: 'reject' })}>
                                        <CircleX size={15} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="row-menu row-menu-danger"
                                    aria-label="Delete review"
                                    title="Delete"
                                    onClick={() => setPending({ review, kind: 'delete' })}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!reviews.length && <TableMessage colSpan={7} loading={loading} error={error} empty="No reviews match these filters." />}
                </tbody>
            </table>
            {error && reviews.length > 0 && <p className="login-error">{error}</p>}
            {data && <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />}

            {pending?.kind === 'reject' && (
                <ConfirmDialog
                    title="Reject this review?"
                    message="Rejected reviews are hidden from the app and excluded from the product rating."
                    confirmLabel="Reject review"
                    danger
                    reason={{ label: 'Reason', placeholder: 'e.g. Contains offensive language' }}
                    onConfirm={async (reason) => {
                        await setReviewStatus(pending.review._id, 'rejected', reason)
                        setNotice({ kind: 'success', text: 'Review rejected.' })
                        reload()
                    }}
                    onClose={() => setPending(null)}
                />
            )}
            {pending?.kind === 'delete' && (
                <ConfirmDialog
                    title="Delete this review?"
                    message="The review is permanently removed and the product rating is recalculated. This cannot be undone."
                    confirmLabel="Delete review"
                    danger
                    onConfirm={async () => {
                        await deleteReview(pending.review._id)
                        setNotice({ kind: 'success', text: 'Review deleted.' })
                        reload()
                    }}
                    onClose={() => setPending(null)}
                />
            )}
        </section>
    )
}

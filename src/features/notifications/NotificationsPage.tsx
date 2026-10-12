import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { ConfirmDialog, Notice, Pagination, TableMessage, Toolbar, type NoticeState } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { formatDateTime } from '../../lib/format'
import { listBroadcasts, sendBroadcast } from './api'
import { BODY_MAX, ROUTE_LABELS, TITLE_MAX } from './types'

const PAGE_SIZE = 15

/** Compose "App Updates" announcements and review what was sent. */
export function NotificationsPage() {
    const [page, setPage] = useState(1)
    const { data, error, loading, reload } = useApiData(`broadcasts:${page}`, () => listBroadcasts(page, PAGE_SIZE))
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [route, setRoute] = useState('')
    const [confirming, setConfirming] = useState(false)
    const [notice, setNotice] = useState<NoticeState>(null)
    const broadcasts = data?.broadcasts ?? []

    const valid = title.trim().length > 0 && body.trim().length > 0

    const onSubmit = (event: FormEvent) => {
        event.preventDefault()
        if (valid) setConfirming(true)
    }

    /** Throws on failure so the confirm dialog can show the error and stay open. */
    const send = async () => {
        const { broadcast } = await sendBroadcast({ title: title.trim(), body: body.trim(), route })
        setNotice({
            kind: 'success',
            text:
                `Sent to ${broadcast.recipients.toLocaleString('en-IN')} user${broadcast.recipients === 1 ? '' : 's'}` +
                (broadcast.pushed
                    ? ` (${broadcast.pushed.toLocaleString('en-IN')} push alerts delivered).`
                    : '. Push alerts only reach devices that registered for them.'),
        })
        setTitle('')
        setBody('')
        setRoute('')
        setPage(1)
        reload()
    }

    return (
        <>
            <section className="panel full-panel">
                <Toolbar title="Send an app update" text="Appears in every customer's notification inbox, and as a push alert on registered devices. Customers who turned off App Updates are skipped." />
                <Notice notice={notice} onDismiss={() => setNotice(null)} />
                <form className="modal-form product-form" onSubmit={onSubmit} noValidate>
                    <label>
                        <span>
                            Title <span className="field-hint">{title.length}/{TITLE_MAX}</span>
                        </span>
                        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={TITLE_MAX} placeholder="New brands just landed" />
                    </label>
                    <label>
                        <span>
                            Message <span className="field-hint">{body.length}/{BODY_MAX}</span>
                        </span>
                        <textarea
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            maxLength={BODY_MAX}
                            rows={3}
                            placeholder="Gucci, Prada and Off-White are now in the app. Go window shop."
                        />
                    </label>
                    <label>
                        When tapped, open
                        <select value={route} onChange={(event) => setRoute(event.target.value)}>
                            {Object.entries(ROUTE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="modal-actions">
                        <button type="submit" className="primary-button" disabled={!valid}>
                            <Send size={16} /> Send to all customers
                        </button>
                    </div>
                </form>
            </section>

            <section className="panel table-panel full-panel">
                <Toolbar title="Sent updates" text={data ? `${data.total.toLocaleString('en-IN')} sent` : 'Loading…'} />
                <table>
                    <thead>
                        <tr>
                            <th>Sent</th>
                            <th>Update</th>
                            <th>Opens</th>
                            <th>Reached</th>
                            <th>Push delivered</th>
                            <th>By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!broadcasts.length && <TableMessage colSpan={6} loading={loading} error={error} empty="No updates sent yet." />}
                        {broadcasts.map((b) => (
                            <tr key={b._id}>
                                <td>{formatDateTime(b.createdAt)}</td>
                                <td>
                                    <div className="cell-stack">
                                        <strong>{b.title}</strong>
                                        <small>{b.body}</small>
                                    </div>
                                </td>
                                <td>{ROUTE_LABELS[b.route] ?? b.route}</td>
                                <td>{b.recipients.toLocaleString('en-IN')}</td>
                                <td>{b.pushed.toLocaleString('en-IN')}</td>
                                <td>{b.sentBy || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data && <Pagination page={page} limit={PAGE_SIZE} total={data.total} onChange={setPage} />}
            </section>

            {confirming && (
                <ConfirmDialog
                    title="Send to all customers?"
                    message={`“${title.trim()}” will appear in every opted-in customer's inbox right now. This cannot be undone.`}
                    confirmLabel="Send now"
                    onConfirm={send}
                    onClose={() => setConfirming(false)}
                />
            )}
        </>
    )
}

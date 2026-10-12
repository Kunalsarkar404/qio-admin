import { useState } from 'react'
import { Download, Search } from 'lucide-react'
import { ConfirmDialog, FilterBar, Notice, Pagination, StatusPill, TableMessage, Toolbar, type NoticeState } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { errorMessage } from '../../lib/apiClient'
import { formatDate, formatINR } from '../../lib/format'
import { exportOrdersCsv, listAdminOrders, updateOrderStatus } from './api'
import { OrderDetail } from './OrderDetail'
import { ORDER_STATUSES, TERMINAL_ORDER_STATUSES, type AdminOrder, type OrderStatus } from './types'

const PAGE_SIZE = 25

export function OrdersPage({ onOrdersChanged }: { onOrdersChanged?: () => void }) {
    const [status, setStatus] = useState<OrderStatus | ''>('')
    const [search, setSearch] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [page, setPage] = useState(1)
    const debouncedSearch = useDebouncedValue(search.trim())
    const [notice, setNotice] = useState<NoticeState>(null)
    const [updatingId, setUpdatingId] = useState('')
    const [pendingCancel, setPendingCancel] = useState<AdminOrder | null>(null)
    const [detailId, setDetailId] = useState('')
    const [exporting, setExporting] = useState(false)

    const filters = { status, search: debouncedSearch, startDate, endDate }
    const { data, error, loading, reload } = useApiData(`orders:${JSON.stringify(filters)}:${page}`, () =>
        listAdminOrders({ ...filters, page, limit: PAGE_SIZE }),
    )
    const orders = data?.orders ?? []

    const changeStatus = async (order: AdminOrder, next: OrderStatus) => {
        setUpdatingId(order._id)
        setNotice(null)
        try {
            await updateOrderStatus(order._id, next)
            setNotice({ kind: 'success', text: `Order ${order.orderNumber} marked ${next}.` })
            reload()
            onOrdersChanged?.()
        } finally {
            setUpdatingId('')
        }
    }

    const onSelectStatus = (order: AdminOrder, next: OrderStatus) => {
        if (next === order.status) return
        if (next === 'Cancelled') {
            setPendingCancel(order)
            return
        }
        changeStatus(order, next).catch((requestError) => setNotice({ kind: 'error', text: errorMessage(requestError, 'Could not update the order') }))
    }

    const onExport = async () => {
        setExporting(true)
        try {
            await exportOrdersCsv(filters)
        } catch (requestError) {
            setNotice({ kind: 'error', text: errorMessage(requestError, 'Export failed') })
        } finally {
            setExporting(false)
        }
    }

    const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
        setter(value)
        setPage(1)
    }

    return (
        <section className="panel table-panel full-panel">
            <Toolbar title="Orders" text={data ? `${data.total.toLocaleString('en-IN')} orders match your filters` : 'Loading orders…'}>
                <button type="button" className="secondary-button" onClick={onExport} disabled={exporting}>
                    <Download size={15} /> {exporting ? 'Exporting…' : 'Export CSV'}
                </button>
            </Toolbar>

            <FilterBar>
                <label className="search-box">
                    <Search size={17} />
                    <input value={search} onChange={(event) => resetPage(setSearch)(event.target.value)} placeholder="Order # or customer" />
                </label>
                <select className="filter-select" value={status} onChange={(event) => resetPage(setStatus)(event.target.value as OrderStatus | '')} aria-label="Status">
                    <option value="">All statuses</option>
                    {ORDER_STATUSES.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
                <label className="filter-field">
                    From
                    <input type="date" value={startDate} max={endDate || undefined} onChange={(event) => resetPage(setStartDate)(event.target.value)} />
                </label>
                <label className="filter-field">
                    To
                    <input type="date" value={endDate} min={startDate || undefined} onChange={(event) => resetPage(setEndDate)(event.target.value)} />
                </label>
            </FilterBar>

            <Notice notice={notice} onDismiss={() => setNotice(null)} />

            <table>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Update</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => {
                        const terminal = TERMINAL_ORDER_STATUSES.includes(order.status)
                        return (
                            <tr key={order._id}>
                                <td>
                                    <button type="button" className="link-button order-id" onClick={() => setDetailId(order._id)}>
                                        {order.orderNumber}
                                    </button>
                                </td>
                                <td>
                                    <strong>{order.user?.name || 'Deleted user'}</strong>
                                    <div className="cell-sub">{order.user?.email}</div>
                                </td>
                                <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                                <td>
                                    <strong>{formatINR(order.total)}</strong>
                                    {order.couponCode && <div className="cell-sub">Coupon {order.couponCode}</div>}
                                </td>
                                <td>
                                    <StatusPill status={order.status} />
                                </td>
                                <td>
                                    <select
                                        className="filter-select compact"
                                        value={order.status}
                                        disabled={terminal || updatingId === order._id}
                                        title={terminal ? `${order.status} orders can no longer change` : 'Change status'}
                                        onChange={(event) => onSelectStatus(order, event.target.value as OrderStatus)}
                                        aria-label={`Status for ${order.orderNumber}`}
                                    >
                                        {ORDER_STATUSES.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>{formatDate(order.createdAt)}</td>
                            </tr>
                        )
                    })}
                    {!orders.length && <TableMessage colSpan={7} loading={loading} error={error} empty="No orders match these filters." />}
                </tbody>
            </table>
            {error && orders.length > 0 && <p className="login-error">{error}</p>}
            {data && <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />}

            {pendingCancel && (
                <ConfirmDialog
                    title={`Cancel order ${pendingCancel.orderNumber}?`}
                    message={
                        <>
                            Cancelling refunds <strong>{formatINR(pendingCancel.total)}</strong> to the customer&apos;s wallet and restocks the items.
                            This cannot be undone.
                        </>
                    }
                    confirmLabel="Cancel order"
                    danger
                    onConfirm={() => changeStatus(pendingCancel, 'Cancelled')}
                    onClose={() => setPendingCancel(null)}
                />
            )}
            {detailId && <OrderDetail orderId={detailId} onClose={() => setDetailId('')} />}
        </section>
    )
}

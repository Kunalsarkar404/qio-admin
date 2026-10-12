import { useState } from 'react'
import { BadgePercent, CircleDollarSign, Pencil, Search, TicketPercent, Trash2 } from 'lucide-react'
import { ConfirmDialog, FilterBar, Metric, Notice, StatusPill, TableMessage, Toolbar, type NoticeState } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { formatDate, formatINR, formatNumber } from '../../lib/format'
import { deleteAdminCoupon, getCouponStats, listAdminCoupons } from './api'
import { CouponForm } from './CouponForm'
import type { AdminCoupon, CouponStatusFilter } from './types'

function couponState(coupon: AdminCoupon) {
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now()) return 'Expired'
    if (!coupon.isActive) return 'Inactive'
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return 'Used up'
    return 'Active'
}

function describeDiscount(coupon: AdminCoupon) {
    if (coupon.discountType === 'fixed') return `${formatINR(coupon.discountValue)} off`
    return `${coupon.discountValue}% off${coupon.maxDiscount != null ? ` (max ${formatINR(coupon.maxDiscount)})` : ''}`
}

export function CouponsPage() {
    const [status, setStatus] = useState<CouponStatusFilter>('all')
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search.trim())
    const [notice, setNotice] = useState<NoticeState>(null)
    const [editing, setEditing] = useState<AdminCoupon | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [deleting, setDeleting] = useState<AdminCoupon | null>(null)

    const stats = useApiData('coupon-stats', getCouponStats)
    const { data, error, loading, reload } = useApiData(`coupons:${status}:${debouncedSearch}`, () => listAdminCoupons({ status, search: debouncedSearch }))
    const coupons = data?.coupons ?? []

    const onChanged = (message: string) => {
        setNotice({ kind: 'success', text: message })
        reload()
        stats.reload()
    }

    return (
        <>
            <section className="metric-grid">
                <Metric icon={<TicketPercent />} label="Coupons" value={formatNumber(stats.data?.totalCoupons)} detail={`${formatNumber(stats.data?.expiredCoupons)} expired`} />
                <Metric icon={<TicketPercent />} label="Active coupons" value={formatNumber(stats.data?.activeCoupons)} />
                <Metric icon={<BadgePercent />} label="Redemptions" value={formatNumber(stats.data?.totalRedemptions)} />
                <Metric icon={<CircleDollarSign />} label="Discount given" value={formatINR(stats.data?.totalDiscountGiven)} />
            </section>
            {stats.error && <p className="login-error">{stats.error}</p>}

            <section className="panel table-panel full-panel">
                <Toolbar
                    title="Discount codes"
                    text={data ? `${coupons.length} coupons match your filters` : 'Loading coupons…'}
                    action="Create coupon"
                    onAction={() => {
                        setEditing(null)
                        setFormOpen(true)
                    }}
                />
                <FilterBar>
                    <label className="search-box">
                        <Search size={17} />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by code" />
                    </label>
                    <select className="filter-select" value={status} onChange={(event) => setStatus(event.target.value as CouponStatusFilter)} aria-label="Status">
                        <option value="all">All coupons</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                    </select>
                </FilterBar>
                <Notice notice={notice} onDismiss={() => setNotice(null)} />

                <table>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Min purchase</th>
                            <th>Categories</th>
                            <th>Usage</th>
                            <th>Expires</th>
                            <th>Status</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon) => (
                            <tr key={coupon._id}>
                                <td>
                                    <strong className="order-id">{coupon.code}</strong>
                                    {coupon.description && <div className="cell-sub">{coupon.description}</div>}
                                </td>
                                <td>{describeDiscount(coupon)}</td>
                                <td>{coupon.minPurchase ? formatINR(coupon.minPurchase) : '—'}</td>
                                <td>{coupon.applicableCategories.length ? coupon.applicableCategories.join(', ') : 'All'}</td>
                                <td>
                                    {coupon.usedCount}
                                    {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ''}
                                    {coupon.totalDiscountGiven > 0 && <div className="cell-sub">{formatINR(coupon.totalDiscountGiven)} given</div>}
                                </td>
                                <td>{formatDate(coupon.expiresAt, 'Never')}</td>
                                <td>
                                    <StatusPill status={couponState(coupon)} />
                                </td>
                                <td className="row-actions">
                                    <button
                                        type="button"
                                        className="row-menu"
                                        aria-label={`Edit ${coupon.code}`}
                                        onClick={() => {
                                            setEditing(coupon)
                                            setFormOpen(true)
                                        }}
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button type="button" className="row-menu row-menu-danger" aria-label={`Delete ${coupon.code}`} onClick={() => setDeleting(coupon)}>
                                        <Trash2 size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!coupons.length && <TableMessage colSpan={8} loading={loading} error={error} empty="No coupons yet. Create one to start a promotion." />}
                    </tbody>
                </table>
                {error && coupons.length > 0 && <p className="login-error">{error}</p>}
            </section>

            {formOpen && <CouponForm coupon={editing} onClose={() => setFormOpen(false)} onSaved={onChanged} />}
            {deleting && (
                <ConfirmDialog
                    title={`Delete coupon ${deleting.code}?`}
                    message="Customers will no longer be able to redeem this code. Past orders keep their discount. This cannot be undone."
                    confirmLabel="Delete coupon"
                    danger
                    onConfirm={async () => {
                        await deleteAdminCoupon(deleting._id)
                        onChanged(`Coupon ${deleting.code} deleted.`)
                    }}
                    onClose={() => setDeleting(null)}
                />
            )}
        </>
    )
}

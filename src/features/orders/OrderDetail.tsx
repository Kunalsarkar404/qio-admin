import { Modal, StatusPill } from '../../components/ui'
import { useApiData } from '../../hooks/useApiData'
import { formatDateTime, formatINR } from '../../lib/format'
import { getAdminOrder } from './api'

export function OrderDetail({ orderId, onClose }: { orderId: string; onClose: () => void }) {
    const { data, error, loading } = useApiData(`order:${orderId}`, () => getAdminOrder(orderId))
    const order = data?.order

    return (
        <Modal title={order ? `Order ${order.orderNumber}` : 'Order details'} subtitle="Order details" onClose={onClose} wide>
            {loading && !order && <p className="empty-state">Loading order…</p>}
            {error && <p className="login-error">{error}</p>}
            {order && (
                <div className="detail-stack">
                    <div className="detail-grid">
                        <div>
                            <p className="field-label">Status</p>
                            <StatusPill status={order.status} />
                        </div>
                        <div>
                            <p className="field-label">Placed</p>
                            <span>{formatDateTime(order.createdAt)}</span>
                        </div>
                        <div>
                            <p className="field-label">Customer</p>
                            <span>{order.user?.name || 'Deleted user'}</span>
                            <small>{[order.user?.email, order.user?.phone].filter(Boolean).join(' · ')}</small>
                        </div>
                        <div>
                            <p className="field-label">Ship to</p>
                            <span>{order.shippingAddress.fullName || '—'}</span>
                            <small>
                                {[
                                    order.shippingAddress.street,
                                    order.shippingAddress.city,
                                    order.shippingAddress.state,
                                    order.shippingAddress.zip,
                                    order.shippingAddress.country,
                                ]
                                    .filter(Boolean)
                                    .join(', ') || 'No address on file'}
                            </small>
                            {order.shippingAddress.phone && <small>{order.shippingAddress.phone}</small>}
                        </div>
                    </div>

                    <div className="table-panel detail-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Size</th>
                                    <th>Color</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Line total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <div className="product-cell">
                                                <div className="product-thumb">{item.image ? <img src={item.image} alt="" /> : null}</div>
                                                <div>
                                                    <strong>{item.name}</strong>
                                                    <span>{item.brand}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{item.size || '—'}</td>
                                        <td>{item.color || '—'}</td>
                                        <td>{item.quantity}</td>
                                        <td>{formatINR(item.price)}</td>
                                        <td>
                                            <strong>{formatINR(item.price * item.quantity)}</strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <dl className="totals">
                        <dt>Subtotal</dt>
                        <dd>{formatINR(order.subtotal)}</dd>
                        <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
                        <dd>{order.discount ? `−${formatINR(order.discount)}` : formatINR(0)}</dd>
                        <dt>VAT</dt>
                        <dd>{formatINR(order.vat)}</dd>
                        <dt>Shipping</dt>
                        <dd>{formatINR(order.shippingFee)}</dd>
                        <dt className="totals-grand">Total ({order.paymentMethod})</dt>
                        <dd className="totals-grand">{formatINR(order.total)}</dd>
                    </dl>
                </div>
            )}
        </Modal>
    )
}

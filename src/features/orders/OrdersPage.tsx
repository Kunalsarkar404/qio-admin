import { StatusPill, Toolbar } from '../../components/ui'
import type { DashboardOrder } from '../../types'

export function OrdersPage({ orders }: { orders: DashboardOrder[] }) {
    return (
        <section className="panel table-panel full-panel">
            <Toolbar title="Orders placed" text={`${orders.length} orders recorded`} />
            <table>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>
                                <strong className="order-id">{order.orderNumber}</strong>
                            </td>
                            <td>{order.customer}</td>
                            <td>{order.itemCount} items</td>
                            <td>
                                <strong>{order.total}</strong>
                            </td>
                            <td>
                                <StatusPill status={order.status} />
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                        </tr>
                    ))}
                    {!orders.length && (
                        <tr>
                            <td colSpan={6} className="empty-state">
                                No orders placed yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    )
}

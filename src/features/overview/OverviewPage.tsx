import { useState } from 'react'
import { BarChart3, Clock3, CircleDollarSign, Eye, PackagePlus, ShoppingBag, Tag, Users } from 'lucide-react'
import { Metric, PanelHeading, ProductCell, Pulse, QuickAction, StatusPill } from '../../components/ui'
import { formatINR, formatINRCompact, formatNumber } from '../../lib/format'
import type { DashboardData, RevenuePoint } from '../../types'
import type { View } from '../../types-view'

function formatScreenTime(seconds: number) {
  const minutes = Math.round(seconds / 60)
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}

function shortDate(isoDay: string) {
  // isoDay is YYYY-MM-DD (UTC day bucket from the backend)
  const date = new Date(`${isoDay}T00:00:00Z`)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function RevenueChart({ series }: { series: RevenuePoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const total = series.reduce((sum, point) => sum + point.revenue, 0)
  const orders = series.reduce((sum, point) => sum + point.orders, 0)
  const max = Math.max(0, ...series.map((point) => point.revenue))
  const active = hovered !== null ? series[hovered] : null

  return (
    <>
      <div className="chart-value">
        <strong>{formatINR(active ? active.revenue : total)}</strong>
        <span className="chart-caption">
          {active
            ? `${shortDate(active.date)} · ${active.orders} order${active.orders === 1 ? '' : 's'}`
            : `${orders} order${orders === 1 ? '' : 's'} in the last 30 days`}
        </span>
      </div>
      <div className="chart" role="img" aria-label={`Daily revenue for the last 30 days, total ${formatINR(total)}`}>
        <div className="y-axis">
          <span>{formatINRCompact(max)}</span>
          <span />
          <span>{formatINRCompact(max / 2)}</span>
          <span />
          <span>₹0</span>
        </div>
        <div className="chart-stage">
          <div className="grid-lines">
            {[1, 2, 3, 4, 5].map((line) => (
              <i key={line} />
            ))}
          </div>
          <div className="bars dense" onMouseLeave={() => setHovered(null)}>
            {series.map((point, index) => {
              const height = max > 0 ? (point.revenue / max) * 100 : 0
              const classes = ['bar']
              if (index === hovered || (hovered === null && index === series.length - 1)) classes.push('highlight')
              if (!point.revenue) classes.push('zero')
              return (
                <div
                  className="bar-wrap"
                  key={point.date}
                  onMouseEnter={() => setHovered(index)}
                  title={`${shortDate(point.date)}: ${formatINR(point.revenue)} (${point.orders} orders)`}
                >
                  <div className={classes.join(' ')} style={{ height: `${height}%` }} />
                </div>
              )
            })}
          </div>
          {series.length > 0 && (
            <div className="x-axis">
              <span>{shortDate(series[0]!.date)}</span>
              <span>{shortDate(series[Math.floor(series.length / 2)]!.date)}</span>
              <span>{shortDate(series[series.length - 1]!.date)}</span>
            </div>
          )}
        </div>
      </div>
      {!total && <p className="chart-empty">No revenue recorded in the last 30 days.</p>}
    </>
  )
}

export function OverviewPage({ data, onNavigate }: { data: DashboardData; onNavigate: (view: View) => void }) {
  const { metrics } = data
  const recentOrders = data.orders.slice(0, 5)
  const topProducts = data.products.slice(0, 5)

  return (
    <>
      <section className="metric-grid">
        <Metric icon={<CircleDollarSign />} label="Gross revenue" value={metrics.revenue} detail="All non-cancelled orders" />
        <Metric
          icon={<ShoppingBag />}
          label="Orders placed"
          value={formatNumber(metrics.orders)}
          detail={`${formatNumber(metrics.pendingOrders)} awaiting fulfilment`}
        />
        <Metric icon={<Users />} label="Registered users" value={formatNumber(metrics.users)} />
        <Metric icon={<Eye />} label="Product opens" value={formatNumber(metrics.clicks)} detail={`${formatNumber(metrics.impressions)} impressions`} />
      </section>

      <section className="content-grid top-grid">
        <div className="panel revenue-panel">
          <PanelHeading title="Revenue overview" detail="Daily gross sales, last 30 days" />
          <RevenueChart series={data.revenueSeries ?? []} />
        </div>

        <div className="panel funnel-panel">
          <PanelHeading title="Store pulse" detail="Current totals" />
          <Pulse
            icon={<ShoppingBag />}
            label="Pending orders"
            value={formatNumber(metrics.pendingOrders)}
            meta="Packing, picked or in transit"
            color="orange"
          />
          <Pulse
            icon={<Clock3 />}
            label="Avg. screen time"
            value={formatScreenTime(metrics.averageScreenTimeSeconds)}
            meta="Average per registered user"
            color="violet"
          />
          <Pulse icon={<BarChart3 />} label="Product opens" value={formatNumber(metrics.clicks)} meta={`From ${formatNumber(metrics.impressions)} impressions`} color="blue" />
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h2>Quick actions</h2>
          <p>Jump straight to the most common tasks.</p>
        </div>
      </section>
      <section className="quick-grid">
        <QuickAction icon={<PackagePlus />} title="Manage products" text="Create listings with images, pricing and size stock." onClick={() => onNavigate('Products')} />
        <QuickAction icon={<Tag />} title="Manage brands" text="Add or deactivate labels in your catalog." onClick={() => onNavigate('Brands')} />
        <QuickAction
          icon={<ShoppingBag />}
          title="Fulfil orders"
          text={`${formatNumber(metrics.pendingOrders)} order${metrics.pendingOrders === 1 ? '' : 's'} awaiting fulfilment.`}
          onClick={() => onNavigate('Orders')}
        />
      </section>

      <section className="content-grid bottom-grid">
        <div className="panel table-panel">
          <PanelHeading
            title="Recent orders"
            detail={`${formatNumber(metrics.orders)} total`}
            action={
              <button type="button" className="link-button" onClick={() => onNavigate('Orders')}>
                View all
              </button>
            }
          />
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong className="order-id">{order.orderNumber}</strong>
                  </td>
                  <td>{order.customer}</td>
                  <td>
                    <strong>{order.total}</strong>
                  </td>
                  <td>
                    <StatusPill status={order.status} />
                  </td>
                </tr>
              ))}
              {!recentOrders.length && (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="panel table-panel">
          <PanelHeading title="Top products" detail="By product opens" />
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Clicks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <ProductCell name={product.name} brand={product.brand} image={product.image} />
                  </td>
                  <td>
                    <strong>{formatNumber(product.clicks)}</strong>
                  </td>
                  <td>
                    <StatusPill status={product.stock} />
                  </td>
                </tr>
              ))}
              {!topProducts.length && (
                <tr>
                  <td colSpan={3} className="empty-state">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

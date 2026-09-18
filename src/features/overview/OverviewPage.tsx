import { ArrowUpRight, BarChart3, Clock3, CircleDollarSign, Eye, PackagePlus, ShoppingBag, Tag, Users } from 'lucide-react'
import { Metric, PanelHeading, ProductCell, Pulse, QuickAction, StatusPill } from '../../components/ui'
import type { DashboardData } from '../../types'

const CHART_BARS = [38, 52, 44, 65, 54, 72, 62, 83, 70, 91, 76, 98]

function formatScreenTime(seconds: number) {
  const minutes = Math.round(seconds / 60)
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}

export function OverviewPage({
  data,
  onNavigateToProducts,
  onNavigateToBrands,
}: {
  data: DashboardData | null
  onNavigateToProducts: () => void
  onNavigateToBrands: () => void
}) {
  const metrics = data?.metrics
  const recentOrders = data?.orders.slice(0, 5) ?? []
  const topProducts = data?.products.slice(0, 5) ?? []

  return (
    <>
      <section className="metric-grid">
        <Metric icon={<CircleDollarSign />} label="Gross revenue" value={metrics?.revenue ?? '₹0'} />
        <Metric icon={<ShoppingBag />} label="Orders placed" value={String(metrics?.orders ?? 0)} />
        <Metric icon={<Users />} label="Registered users" value={String(metrics?.users ?? 0)} />
        <Metric icon={<Eye />} label="Product clicks" value={String(metrics?.clicks ?? 0)} />
      </section>

      <section className="content-grid top-grid">
        <div className="panel revenue-panel">
          <PanelHeading title="Revenue overview" detail="Gross sales" />
          <div className="chart-value">
            <strong>{metrics?.revenue ?? '₹0'}</strong>
            <span className="positive">
              <ArrowUpRight size={14} /> live
            </span>
          </div>
          <div className="chart">
            <div className="y-axis">
              <span>High</span>
              <span />
              <span />
              <span />
              <span>Low</span>
            </div>
            <div className="chart-stage">
              <div className="grid-lines">
                {[1, 2, 3, 4, 5].map((line) => (
                  <i key={line} />
                ))}
              </div>
              <div className="bars">
                {CHART_BARS.map((height, index) => (
                  <div className="bar-wrap" key={index}>
                    <div className={index === CHART_BARS.length - 1 ? 'bar highlight' : 'bar'} style={{ height: `${height}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel funnel-panel">
          <PanelHeading title="Store pulse" detail="Live signals" />
          <Pulse icon={<Users />} label="Registered users" value={String(metrics?.users ?? 0)} meta="Total signed-up customers" color="blue" />
          <Pulse
            icon={<Clock3 />}
            label="Avg. screen time"
            value={formatScreenTime(metrics?.averageScreenTimeSeconds ?? 0)}
            meta="Average per registered user"
            color="violet"
          />
          <Pulse icon={<BarChart3 />} label="Product clicks" value={String(metrics?.clicks ?? 0)} meta="Across the full catalog" color="orange" />
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h2>Quick actions</h2>
          <p>Keep your catalog fresh and your brand directory organized.</p>
        </div>
      </section>
      <section className="quick-grid">
        <QuickAction icon={<PackagePlus />} title="Add a product" text="Create a listing with images, pricing and size stock." onClick={onNavigateToProducts} />
        <QuickAction icon={<Tag />} title="Create a brand" text="Add a new label to your store catalog." onClick={onNavigateToBrands} />
        <QuickAction icon={<BarChart3 />} title="Review analytics" text="See clicks, conversions and screen time trends." />
      </section>

      <section className="content-grid bottom-grid">
        <div className="panel table-panel">
          <PanelHeading title="Recent orders" detail={`${data?.orders.length ?? 0} total`} />
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
          <PanelHeading title="Top products" detail="By product clicks" />
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <ProductCell name={product.name} brand={product.brand} image={product.image} />
                  </td>
                  <td>
                    <strong>{product.clicks}</strong>
                  </td>
                </tr>
              ))}
              {!topProducts.length && (
                <tr>
                  <td colSpan={2} className="empty-state">
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

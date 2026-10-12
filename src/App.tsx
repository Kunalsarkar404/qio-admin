import { useState } from 'react'
import './dashboard.css'
import './dashboard-reset.css'
import './login.css'
import './features/admin-extra.css'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/auth-context'
import { useDashboard } from './hooks/useDashboard'
import { useHashView } from './hooks/useHashView'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { PageHeader } from './components/layout/PageHeader'
import { LoginScreen, SessionCheckScreen } from './features/auth/LoginScreen'
import { OverviewPage } from './features/overview/OverviewPage'
import { ProductsPage } from './features/products/ProductsPage'
import { BrandsPage } from './features/brands/BrandsPage'
import { UsersPage } from './features/users/UsersPage'
import { OrdersPage } from './features/orders/OrdersPage'
import { ReviewsPage } from './features/reviews/ReviewsPage'
import { WalletsPage } from './features/wallet/WalletsPage'
import { StreaksPage } from './features/streak/StreaksPage'
import { CouponsPage } from './features/coupons/CouponsPage'
import { FeedbackPage } from './features/feedback/FeedbackPage'
import { NotificationsPage } from './features/notifications/NotificationsPage'
import type { View } from './types-view'

function Dashboard() {
  const { user, logout } = useAuth()
  const [view, navigate] = useHashView()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data, error, loading, loadedAt, refresh } = useDashboard()

  const selectView = (next: View) => {
    navigate(next)
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        onSelect={selectView}
        isOpen={sidebarOpen}
        orderBadge={data?.metrics.pendingOrders}
        user={user}
        onLogout={logout}
      />
      <main className="main-content">
        <Topbar
          view={view}
          onOpenMenu={() => setSidebarOpen(true)}
          user={user}
          loadedAt={loadedAt}
          refreshing={loading}
          onRefresh={refresh}
          onLogout={logout}
        />
        <div className="page-wrap">
          <PageHeader view={view} userName={user?.fullName} />
          {view === 'Overview' && (
            <>
              {error && (
                <div className="error-banner" role="alert">
                  <span>Could not load dashboard data: {error}</span>
                  <button type="button" className="secondary-button" onClick={refresh}>
                    Retry
                  </button>
                </div>
              )}
              {data ? (
                <OverviewPage data={data} onNavigate={selectView} />
              ) : loading ? (
                <section className="panel loading-panel">Loading dashboard…</section>
              ) : null}
            </>
          )}
          {view === 'Products' && <ProductsPage />}
          {view === 'Brands' && <BrandsPage />}
          {view === 'Orders' && <OrdersPage onOrdersChanged={refresh} />}
          {view === 'Coupons' && <CouponsPage />}
          {view === 'Users' && <UsersPage />}
          {view === 'Reviews' && <ReviewsPage />}
          {view === 'Wallets' && <WalletsPage />}
          {view === 'Streaks' && <StreaksPage />}
          {view === 'Feedback' && <FeedbackPage />}
          {view === 'Notifications' && <NotificationsPage />}
        </div>
      </main>
      {sidebarOpen && <button type="button" className="scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

function Root() {
  const { token, checking } = useAuth()
  if (!token) return <LoginScreen />
  if (checking) return <SessionCheckScreen />
  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}

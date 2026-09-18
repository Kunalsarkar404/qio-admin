import { useState } from 'react'
import './dashboard.css'
import './dashboard-reset.css'
import './login.css'
import './features/admin-extra.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useDashboard } from './hooks/useDashboard'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { PageHeader } from './components/layout/PageHeader'
import { LoginScreen } from './features/auth/LoginScreen'
import { OverviewPage } from './features/overview/OverviewPage'
import { ProductsPage } from './features/products/ProductsPage'
import { BrandsPage } from './features/brands/BrandsPage'
import { UsersPage } from './features/users/UsersPage'
import { OrdersPage } from './features/orders/OrdersPage'
import { ReviewsPage } from './features/reviews/ReviewsPage'
import type { View } from './types-view'

function Dashboard() {
  const [view, setView] = useState<View>('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data, refresh } = useDashboard()

  const selectView = (next: View) => {
    setView(next)
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <Sidebar view={view} onSelect={selectView} isOpen={sidebarOpen} orderBadge={data?.orders.length} />
      <main className="main-content">
        <Topbar view={view} onOpenMenu={() => setSidebarOpen(true)} />
        <div className="page-wrap">
          <PageHeader view={view} />
          {view === 'Overview' && (
            <OverviewPage
              data={data}
              onNavigateToProducts={() => selectView('Products')}
              onNavigateToBrands={() => selectView('Brands')}
            />
          )}
          {view === 'Products' && <ProductsPage />}
          {view === 'Brands' && <BrandsPage brands={data?.brands ?? []} onChanged={refresh} />}
          {view === 'Users' && <UsersPage users={data?.users ?? []} />}
          {view === 'Orders' && <OrdersPage orders={data?.orders ?? []} />}
          {view === 'Reviews' && <ReviewsPage reviews={data?.reviews ?? []} />}
        </div>
      </main>
      {sidebarOpen && <button type="button" className="scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

function Root() {
  const { token } = useAuth()
  return token ? <Dashboard /> : <LoginScreen />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}


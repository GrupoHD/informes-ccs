import { useState } from 'react'
import { ConfigProvider } from './context/ConfigContext'
import { useAuth } from './hooks/useAuth'
import LoginPage from './components/auth/LoginPage'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ReportPage from './pages/ReportPage'
import AdminPage from './pages/AdminPage'

type Page = 'report' | 'admin'

function AppInner() {
  const { user, loading, role } = useAuth()
  const [page, setPage] = useState<Page>('report')

  if (loading) return <LoadingSpinner />
  if (!user)   return <LoginPage />

  if (page === 'admin' && role === 'admin') {
    return <AdminPage onBack={() => setPage('report')} />
  }

  return (
    <ReportPage
      user={user}
      onNavigateAdmin={role === 'admin' ? () => setPage('admin') : undefined}
    />
  )
}

export default function App() {
  return (
    <ConfigProvider>
      <AppInner />
    </ConfigProvider>
  )
}

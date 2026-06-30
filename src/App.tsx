import { ConfigProvider } from './context/ConfigContext'
import { useAuth } from './hooks/useAuth'
import LoginPage from './components/auth/LoginPage'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ReportPage from './pages/ReportPage'

function AppInner() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user)   return <LoginPage />
  return <ReportPage user={user} />
}

export default function App() {
  return (
    <ConfigProvider>
      <AppInner />
    </ConfigProvider>
  )
}

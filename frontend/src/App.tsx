import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/useAuth'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Login from '@/pages/Login'
import Timeline from '@/pages/Timeline'
import RecordForm from '@/pages/RecordForm'
import Pressione from '@/pages/Pressione'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { t } = useTranslation()
  const { isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {isAuthenticated && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
            <span className="text-lg font-semibold">Kura</span>
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className="rounded px-3 py-1 text-sm hover:bg-accent"
              >
                {t('nav.timeline')}
              </Link>
              <Link
                to="/pressione"
                className="rounded px-3 py-1 text-sm hover:bg-accent"
              >
                {t('nav.pressure')}
              </Link>
              <LanguageSwitcher />
              <button
                onClick={logout}
                className="rounded px-3 py-1 text-sm text-muted-foreground hover:bg-accent"
              >
                {t('common.logout')}
              </button>
            </nav>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AuthGuard><Timeline /></AuthGuard>} />
          <Route path="/nuovo" element={<AuthGuard><RecordForm /></AuthGuard>} />
          <Route path="/pressione" element={<AuthGuard><Pressione /></AuthGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  )
}

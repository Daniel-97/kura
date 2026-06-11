import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/useAuth'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AppDrawer from '@/components/AppDrawer'
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
  const { isAuthenticated } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {isAuthenticated && (
        <>
          <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="rounded p-1.5 hover:bg-accent transition-colors"
                  aria-label={t('nav.openMenu')}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <span className="text-lg font-semibold">Kura</span>
              </div>
              <LanguageSwitcher />
            </div>
          </header>
          <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
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

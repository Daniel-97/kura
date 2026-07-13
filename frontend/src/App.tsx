import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/features/auth/useAuth'
import LanguageSwitcher from '@/components/shell/LanguageSwitcher'
import ThemeToggle from '@/components/shell/ThemeToggle'
import BottomBar from '@/components/shell/BottomBar'
import UserMenu from '@/components/shell/UserMenu'
import SidebarContent from '@/components/shell/SidebarContent'
import AuthGuard from '@/features/auth/AuthGuard'
import { routes } from '@/lib/routes'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {isAuthenticated && (
        <>
          {/* Mobile header: solo brand e controlli — la navigazione è
              nella bottom bar (design system §5.4) */}
          <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
            <div className="flex h-14 items-center justify-between px-4">
              <span className="font-display text-lg font-semibold">Kura</span>
              <div className="flex items-center gap-1">
                <LanguageSwitcher />
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          </header>

          {/* Mobile bottom bar */}
          <BottomBar />

          {/* Desktop sidebar */}
          <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-background">
            <SidebarContent />
          </aside>

          {/* Desktop top bar */}
          <div className="hidden lg:flex lg:fixed lg:top-0 lg:left-64 lg:right-0 lg:h-14 lg:items-center lg:justify-end lg:border-b lg:bg-background/95 lg:px-6 lg:gap-1 lg:z-30">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu />
          </div>
        </>
      )}

      <main
        className={`px-4 py-6 ${
          isAuthenticated ? 'pb-24 lg:pl-64 lg:pt-20 lg:pb-6' : 'mx-auto max-w-sm'
        }`}
      >
        <div className={isAuthenticated ? 'mx-auto max-w-5xl' : ''}>
          <Routes>
            {routes.map(({ path, component: Component, requiresAuth }) => {
              const element = requiresAuth ? (
                <AuthGuard><Component /></AuthGuard>
              ) : (
                <Component />
              )
              return <Route key={path} path={path} element={element} />
            })}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <Toaster />
    </div>
  )
}

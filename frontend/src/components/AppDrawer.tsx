import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'

interface AppDrawerProps {
  open: boolean
  onClose: () => void
}

export default function AppDrawer({ open, onClose }: AppDrawerProps) {
  const { t } = useTranslation()
  const { logout } = useAuth()

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open)
    return () => { document.body.classList.remove('overflow-hidden') }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      isActive
        ? 'bg-accent text-accent-foreground font-medium'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        id="app-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background border-r transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold select-none">
            K
          </div>
          <span className="font-semibold text-sm">Kura</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('nav.sections')}
          </p>
          <NavLink to="/" end className={navClass} onClick={onClose}>
            <span>📋</span>
            {t('nav.timeline')}
          </NavLink>
          <NavLink to="/blood-pressure" className={navClass} onClick={onClose}>
            <span>❤️</span>
            {t('nav.pressure')}
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="border-t px-4 py-3">
          <button
            onClick={() => { logout(); onClose() }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>↩</span>
            {t('common.logout')}
          </button>
        </div>
      </div>
    </>
  )
}

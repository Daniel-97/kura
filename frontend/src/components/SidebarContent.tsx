import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'

interface SidebarContentProps {
  onNavigate?: () => void
}

export default function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { t } = useTranslation()
  const { logout } = useAuth()

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
      isActive
        ? 'bg-primary text-primary-foreground font-medium'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
    }`

  return (
    <>
      <div className="flex items-center gap-3 border-b px-4 py-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold select-none">
          K
        </div>
        <span className="font-semibold text-sm">Kura</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('nav.sections')}
        </p>
        <NavLink to="/" end className={navClass} onClick={onNavigate}>
          <span>📋</span>
          {t('nav.timeline')}
        </NavLink>
        <NavLink to="/blood-pressure" className={navClass} onClick={onNavigate}>
          <span>❤️</span>
          {t('nav.pressure')}
        </NavLink>
        <NavLink to="/categories" className={navClass} onClick={onNavigate}>
          <span>🏷️</span>
          {t('nav.categories')}
        </NavLink>
      </nav>

      <div className="border-t px-3 py-3">
        <button
          onClick={() => { logout(); onNavigate?.() }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent/50 hover:text-foreground"
        >
          <span>↩</span>
          {t('common.logout')}
        </button>
      </div>
    </>
  )
}

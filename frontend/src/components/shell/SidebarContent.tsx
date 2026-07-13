import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, NotebookText, HeartPulse, Tags } from 'lucide-react'

interface SidebarContentProps {
  onNavigate?: () => void
}

export default function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { t } = useTranslation()

  // §5.4: voce attiva su tinta chiara brand, icona nel primario
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
      isActive
        ? 'bg-accent text-accent-foreground font-medium [&>svg]:text-primary'
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
        {/* §6: icone solo Lucide in navigazione */}
        <NavLink to="/" end className={navClass} onClick={onNavigate}>
          <LayoutDashboard className="h-5 w-5" />
          {t('nav.dashboard')}
        </NavLink>
        <NavLink to="/timeline" className={navClass} onClick={onNavigate}>
          <NotebookText className="h-5 w-5" />
          {t('nav.timeline')}
        </NavLink>
        <NavLink to="/blood-pressure" className={navClass} onClick={onNavigate}>
          <HeartPulse className="h-5 w-5" />
          {t('nav.pressure')}
        </NavLink>
        <NavLink to="/categories" className={navClass} onClick={onNavigate}>
          <Tags className="h-5 w-5" />
          {t('nav.categories')}
        </NavLink>
      </nav>
    </>
  )
}

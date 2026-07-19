import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, NotebookText, Activity, Pill, Tags } from 'lucide-react'
import { Eyebrow } from '@/components/ui/eyebrow'

interface SidebarContentProps {
  onNavigate?: () => void
}

export default function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { t } = useTranslation()

  // §5.5: voce attiva su surface-raised, icona in --brand-accent,
  //        con barra laterale sinistra spessa per maggiore visibilità
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-fast border-l-[3px] ${
      isActive
        ? 'border-brand-accent bg-accent text-accent-foreground font-semibold [&>svg]:text-brand-accent pl-[9px]'
        : 'border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground'
    }`

  return (
    <>
      {/* §5.5: logo ufficiale (icona 28px + wordmark sans 650).
          h-14 fissa: il bordo inferiore deve allinearsi alla top bar. */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <img src="/kura-icon.svg" alt="" className="h-7 w-7 select-none" />
        <span className="font-sans text-base font-[650]">Kura</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <Eyebrow as="p" tone="muted" className="mb-2 px-3">
          {t('nav.sections')}
        </Eyebrow>
        {/* §6: icone solo Lucide in navigazione */}
        <NavLink to="/" end className={navClass} onClick={onNavigate}>
          <LayoutDashboard className="h-5 w-5" />
          {t('nav.dashboard')}
        </NavLink>
        <NavLink to="/timeline" className={navClass} onClick={onNavigate}>
          <NotebookText className="h-5 w-5" />
          {t('nav.timeline')}
        </NavLink>
        <NavLink to="/measurements" className={navClass} onClick={onNavigate}>
          <Activity className="h-5 w-5" />
          {t('nav.measurements')}
        </NavLink>
        <NavLink to="/therapies" className={navClass} onClick={onNavigate}>
          <Pill className="h-5 w-5" />
          {t('nav.therapies')}
        </NavLink>
        <NavLink to="/categories" className={navClass} onClick={onNavigate}>
          <Tags className="h-5 w-5" />
          {t('nav.categories')}
        </NavLink>
      </nav>
    </>
  )
}

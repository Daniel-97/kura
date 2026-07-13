import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, NotebookText, HeartPulse, Tags } from 'lucide-react'

/** Design system §5.4: navigazione mobile come bottom bar a 4 voci,
 *  icona 24px + label 11px, voce attiva nel primario. */
export default function BottomBar() {
  const { t } = useTranslation()

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] transition-colors ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`

  const items = [
    { to: '/', end: true, icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/timeline', icon: NotebookText, label: t('nav.timeline') },
    { to: '/blood-pressure', icon: HeartPulse, label: t('nav.pressure') },
    { to: '/categories', icon: Tags, label: t('nav.categories') },
  ]

  return (
    <nav
      aria-label={t('nav.sections')}
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {items.map(({ to, end, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={end} className={itemClass}>
            <Icon className="h-6 w-6" />
            <span className="text-[11px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

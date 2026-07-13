import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, HeartPulse, ArrowRight, BellRing, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useCategories } from '@/features/categories/useCategories'
import { getCategoryStyles } from '@/features/categories/category-styles'
import { useBloodPressure } from '@/features/blood-pressure/useBloodPressure'
import { BloodPressureChart } from '@/features/blood-pressure/BloodPressureChart'
import { useUpcomingRecords, usePendingReminders } from './useDashboard'
import { daysUntil, formatMetaDate, lastNDays } from './dashboardUtils'

/** Design system §6: tracciato ECG del logo, unica occorrenza per schermata
 *  (qui: empty state delle prossime visite). */
function EcgTrace() {
  return (
    <svg viewBox="0 -10 290 200" className="h-10 w-auto text-kura-300" aria-hidden="true">
      <path
        d="M0 40 L86 120 H132 L162 44 L196 176 L226 120 H290"
        fill="none" stroke="currentColor" strokeWidth={14}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function CountdownBadge({ days }: { days: number }) {
  const { t } = useTranslation()
  const label =
    days === 0 ? t('dashboard.today')
    : days === 1 ? t('dashboard.tomorrow')
    : t('dashboard.inDays', { count: days })
  // §2.3: warning per le scadenze in arrivo (mai rosso per contenuti medici)
  if (days <= 3) {
    return <Badge className="bg-warning-bg text-warning hover:bg-warning-bg">{label}</Badge>
  }
  return <Badge variant="secondary">{label}</Badge>
}

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const { data: upcoming, isLoading: loadingUpcoming } = useUpcomingRecords()
  const { data: reminders, isLoading: loadingReminders } = usePendingReminders()
  const { data: pressureData, isLoading: loadingPressure } = useBloodPressure()
  const { data: categories = [] } = useCategories()

  const visits = upcoming?.items ?? []
  const pending = reminders?.items ?? []
  const measurements = lastNDays(pressureData?.items ?? [], 30)
  const latest = pressureData?.items?.[0]
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  return (
    <div className="space-y-6">
      <h1 className="page-header">{t('dashboard.title')}</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Azioni rapide — un solo bottone primario per vista (§5.1) */}
        <Card className="lg:order-2">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
            <Button asChild className="flex-1">
              <Link to="/new">
                <Plus className="mr-2 h-5 w-5" />
                {t('dashboard.newVisit')}
              </Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1">
              <Link to="/blood-pressure">
                <HeartPulse className="mr-2 h-5 w-5" />
                {t('dashboard.logPressure')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Prossime visite */}
        <Card className="lg:order-1 lg:row-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="h-5 w-5 text-primary" />
              {t('dashboard.upcoming')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUpcoming ? (
              <p className="muted-empty">{t('common.loading')}</p>
            ) : visits.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <EcgTrace />
                <p className="muted-empty">{t('dashboard.noUpcoming')}</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {visits.map((v) => {
                  const cat = v.category ? categoryById.get(v.category) : undefined
                  const styles = getCategoryStyles(cat?.color ?? null)
                  return (
                    <li key={v.id}>
                      <Link
                        to="/timeline"
                        className="flex items-center justify-between gap-3 rounded-md p-2 -m-2 transition-colors hover:bg-accent/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{v.title}</p>
                          <p className="value-mono text-sm text-muted-foreground">
                            {formatMetaDate(v.date, i18n.language)}
                          </p>
                          {cat && (
                            <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className={cn('h-2 w-2 rounded-full', styles.dot)} />
                              {cat.name}
                            </span>
                          )}
                        </div>
                        <CountdownBadge days={daysUntil(v.date)} />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Pressione recente */}
        <Card className="lg:order-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                {t('dashboard.pressure')}
              </span>
              <Link
                to="/blood-pressure"
                className="flex items-center gap-1 text-sm font-normal text-primary hover:underline"
              >
                {t('dashboard.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPressure ? (
              <p className="muted-empty">{t('common.loading')}</p>
            ) : !latest ? (
              <p className="muted-empty">{t('dashboard.noPressure')}</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  {/* §3: valori clinici in mono */}
                  <span className="value-mono text-3xl font-medium">
                    {latest.systolic}/{latest.diastolic}
                  </span>
                  <span className="text-sm text-muted-foreground">mmHg</span>
                  {latest.pulse != null && (
                    <span className="value-mono text-sm text-muted-foreground">
                      {latest.pulse} bpm
                    </span>
                  )}
                </div>
                <p className="value-mono text-sm text-muted-foreground">
                  {formatMetaDate(latest.measured_at, i18n.language)}
                </p>
                {measurements.length > 1 && (
                  <BloodPressureChart measurements={measurements} />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Promemoria attivi */}
        <Card className="lg:order-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BellRing className="h-5 w-5 text-primary" />
              {t('dashboard.reminders')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingReminders ? (
              <p className="muted-empty">{t('common.loading')}</p>
            ) : pending.length === 0 ? (
              <p className="muted-empty">{t('dashboard.noReminders')}</p>
            ) : (
              <ul className="space-y-2">
                {pending.map((r) => (
                  <li key={r.id} className="flex items-baseline gap-3">
                    <span className="value-mono shrink-0 text-sm text-muted-foreground">
                      {formatMetaDate(r.fire_at, i18n.language)}
                    </span>
                    <span className="truncate text-sm">
                      {r.expand?.record?.title ?? r.message ?? ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

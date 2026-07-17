import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { lastNDays } from '@/features/dashboard/dashboardUtils'
import { computeSummaryStats } from '@/features/measurements/measurementStats'
import { useRecentBloodPressure } from './useBloodPressure'

const PERIODS = [7, 30, 90] as const

export function BloodPressureSummaryCards() {
  const { t } = useTranslation()
  const { data } = useRecentBloodPressure()
  const measurements = data ?? []

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PERIODS.map((days) => {
        const items = lastNDays(measurements, days)
        const systolic = computeSummaryStats(items.map((m) => m.systolic))
        const diastolic = computeSummaryStats(items.map((m) => m.diastolic))
        const pulse = computeSummaryStats(
          items.map((m) => m.pulse).filter((p): p is number => p != null),
        )
        return (
          <Card key={days}>
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t(`pressure.summary.period${days}d`)}
              </p>
              {systolic && diastolic ? (
                <>
                  <p className="value-mono mt-1 text-lg font-semibold">
                    {Math.round(systolic.avg)}/{Math.round(diastolic.avg)}{' '}
                    <span className="text-xs font-normal text-muted-foreground">mmHg</span>
                  </p>
                  <p className="value-mono text-xs text-muted-foreground">
                    {t('measurements.summary.min')} {Math.round(systolic.min)}/{Math.round(diastolic.min)} ·{' '}
                    {t('measurements.summary.max')} {Math.round(systolic.max)}/{Math.round(diastolic.max)}
                  </p>
                  {pulse && (
                    <p className="value-mono text-xs text-muted-foreground">
                      {t('pressure.summary.pulseAverage')} {Math.round(pulse.avg)} bpm
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('pressure.summary.count', { count: systolic.count })}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{t('pressure.summary.empty')}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

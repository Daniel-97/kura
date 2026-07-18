import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { MeasurementType } from '@/lib/types'
import { lastNDays } from '@/features/dashboard/dashboardUtils'
import { MEASUREMENT_TYPES } from './measurementTypes'
import { useRecentMeasurements } from './useMeasurements'
import { computeSummaryStats } from './measurementStats'

const PERIODS = [7, 30, 90] as const

export function MeasurementSummaryCards({ type }: { type: MeasurementType }) {
  const { t } = useTranslation()
  const cfg = MEASUREMENT_TYPES[type]
  const { data } = useRecentMeasurements(type)
  const measurements = data ?? []
  const decimals = cfg.step < 1 ? 1 : 0

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PERIODS.map((days) => {
        const stats = computeSummaryStats(lastNDays(measurements, days).map((m) => m.value))
        return (
          <Card key={days}>
            <CardContent className="p-4">
              <Eyebrow as="p" tone="muted">
                {t(`measurements.summary.period${days}d`)}
              </Eyebrow>
              {stats ? (
                <>
                  <p className="value-mono mt-1 text-lg font-semibold">
                    {stats.avg.toFixed(decimals)}{' '}
                    <span className="text-xs font-normal text-muted-foreground">{cfg.unit}</span>
                  </p>
                  <p className="value-mono text-xs text-muted-foreground">
                    {t('measurements.summary.min')} {stats.min.toFixed(decimals)} · {t('measurements.summary.max')} {stats.max.toFixed(decimals)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('measurements.summary.count', { count: stats.count })}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{t('measurements.summary.empty')}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

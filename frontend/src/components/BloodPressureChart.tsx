import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { BloodPressureRecord } from '@/lib/types'
import {
  filterByPreset, toChartData,
  type ChartPoint, type ChartPreset,
} from '@/lib/bloodPressureUtils'

const PRESETS: { key: ChartPreset; label: string }[] = [
  { key: '7d',  label: '7gg'  },
  { key: '30d', label: '30gg' },
  { key: '3m',  label: '3m'   },
  { key: 'all', label: 'Tutto' },
]

const chartConfig = {
  range: { label: 'Pressione', color: 'var(--chart-1)' },
  pulse: { label: 'Battiti',   color: 'var(--chart-2)' },
}

function BpTooltip({ active, payload, label }: TooltipProps<number, string>) {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload as ChartPoint
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm text-xs space-y-1">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {t('pressure.systolicLabel')}:{' '}
        <span className="font-medium text-foreground">{point.systolic} mmHg</span>
      </p>
      <p className="text-muted-foreground">
        {t('pressure.diastolicLabel')}:{' '}
        <span className="font-medium text-foreground">{point.diastolic} mmHg</span>
      </p>
      {point.pulse != null && (
        <p className="text-muted-foreground">
          {t('pressure.pulseLabel')}:{' '}
          <span className="font-medium text-foreground">{point.pulse} bpm</span>
        </p>
      )}
    </div>
  )
}

interface BloodPressureChartProps {
  measurements: BloodPressureRecord[]
}

export function BloodPressureChart({ measurements }: BloodPressureChartProps) {
  const { t } = useTranslation()
  const [preset, setPreset] = useState<ChartPreset>('30d')

  const chartData = useMemo(
    () => toChartData(filterByPreset(measurements, preset)),
    [measurements, preset],
  )

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant={preset === p.key ? 'default' : 'outline'}
              onClick={() => setPreset(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        {chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            {t('pressure.chart.empty')}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-52 w-full">
            <ComposedChart data={chartData} margin={{ top: 4, right: 36, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                label={{
                  value: 'mmHg', angle: -90,
                  position: 'insideLeft', offset: 10,
                  style: { fontSize: 11 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: 'bpm', angle: 90,
                  position: 'insideRight', offset: 10,
                  style: { fontSize: 11 },
                }}
              />
              <Tooltip content={<BpTooltip />} />
              {/* Transparent base bar lifts the visible range bar to start at diastolic */}
              <Bar yAxisId="left" stackId="bp" dataKey="diastolic" fill="transparent" />
              <Bar
                yAxisId="left" stackId="bp" dataKey="range"
                fill="var(--chart-1)" radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="right"
                dataKey="pulse"
                stroke="var(--chart-2)"
                strokeDasharray="4 2"
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

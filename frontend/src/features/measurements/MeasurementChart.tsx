import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { TooltipProps } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Measurement, MeasurementType } from '@/lib/types'
import { MEASUREMENT_TYPES } from './measurementTypes'
import {
  filterByPreset, type ChartPreset,
} from '@/features/blood-pressure/bloodPressureUtils'

const PRESETS: { key: ChartPreset; label: string }[] = [
  { key: '7d',  label: '7gg'  },
  { key: '30d', label: '30gg' },
  { key: '3m',  label: '3m'   },
  { key: 'all', label: 'Tutto' },
]

interface ChartPoint {
  date: string
  value: number
}

function toPoints(measurements: Measurement[]): ChartPoint[] {
  const p = (n: number) => String(n).padStart(2, '0')
  return [...measurements]
    .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
    .map((m) => {
      const d = new Date(m.measured_at)
      return { date: `${p(d.getDate())}/${p(d.getMonth() + 1)}`, value: m.value }
    })
}

interface Props {
  type: MeasurementType
  measurements: Measurement[]
}

export function MeasurementChart({ type, measurements }: Props) {
  const { t } = useTranslation()
  const [preset, setPreset] = useState<ChartPreset>('30d')
  const cfg = MEASUREMENT_TYPES[type]

  const data = useMemo(
    () => toPoints(filterByPreset(measurements, preset)),
    [measurements, preset],
  )

  function ValueTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg border bg-background px-3 py-2 shadow-sm text-xs space-y-1">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-muted-foreground">
          <span className="value-mono font-medium text-foreground">
            {payload[0].value} {cfg.unit}
          </span>
        </p>
      </div>
    )
  }

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

        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            {t('measurements.chartEmpty')}
          </p>
        ) : (
          <ChartContainer config={{ value: { label: cfg.unit, color: cfg.chartColor } }} className="h-52 w-full">
            <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                domain={['auto', 'auto']}
                label={{
                  value: cfg.unit, angle: -90,
                  position: 'insideLeft', offset: 10,
                  style: { fontSize: 11 },
                }}
              />
              <Tooltip content={<ValueTooltip />} />
              <Line
                dataKey="value"
                stroke={cfg.chartColor}
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

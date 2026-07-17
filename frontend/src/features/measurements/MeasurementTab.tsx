import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/features/auth/useAuth'
import { formatMetaDate } from '@/features/dashboard/dashboardUtils'
import type { MeasurementType } from '@/lib/types'
import { MEASUREMENT_TYPES, validateMeasurement } from './measurementTypes'
import { useMeasurements, useCreateMeasurement } from './useMeasurements'
import { MeasurementChart } from './MeasurementChart'
import { MeasurementSummaryCards } from './MeasurementSummaryCards'

function localDatetimeNow(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function MeasurementTab({ type }: { type: MeasurementType }) {
  const { t, i18n } = useTranslation()
  const { userId } = useAuth()
  const cfg = MEASUREMENT_TYPES[type]
  const { data, isLoading } = useMeasurements(type)
  const create = useCreateMeasurement()

  const [value, setValue] = useState('')
  const [measuredAt, setMeasuredAt] = useState(localDatetimeNow)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    const parsed = Number(value)
    const validation = validateMeasurement(type, parsed)
    if (validation) {
      // §5.3: mai solo il colore — messaggio esplicito sotto il campo
      setError(t('measurements.rangeError', { min: cfg.min, max: cfg.max, unit: cfg.unit }))
      return
    }
    setError(null)
    create.mutate(
      {
        type,
        value: parsed,
        measured_at: new Date(measuredAt).toISOString(),
        notes,
        user: userId,
      },
      {
        onSuccess: () => {
          toast.success(t('measurements.savedSuccess'))
          setValue(''); setNotes(''); setMeasuredAt(localDatetimeNow())
        },
        onError: () => toast.error(t('common.error')),
      },
    )
  }

  const measurements = data?.items ?? []

  return (
    <div className="space-y-6">
      <MeasurementSummaryCards type={type} />
      <MeasurementChart type={type} measurements={measurements} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-grid-cols-2">
              <div className="form-field">
                <Label htmlFor={`${type}-value`}>
                  {t('measurements.valueLabel', { unit: cfg.unit })}
                </Label>
                <Input
                  id={`${type}-value`} type="number" inputMode="decimal"
                  min={cfg.min} max={cfg.max} step={cfg.step}
                  value={value} onChange={(e) => setValue(e.target.value)}
                  aria-invalid={!!error}
                  required
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <div className="form-field">
                <Label htmlFor={`${type}-at`}>{t('measurements.measuredAt')}</Label>
                <Input
                  id={`${type}-at`} type="datetime-local"
                  value={measuredAt} onChange={(e) => setMeasuredAt(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-field">
              <Label htmlFor={`${type}-notes`}>{t('measurements.notes')}</Label>
              <Textarea
                id={`${type}-notes`} rows={2}
                value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder={t('measurements.notesPlaceholder')}
              />
            </div>
            <Button type="submit" className="btn-block" disabled={create.isPending}>
              {create.isPending ? t('common.loading') : t('measurements.add')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="muted-empty">{t('common.loading')}</p>
        ) : measurements.length === 0 ? (
          <p className="muted-empty">{t('measurements.empty')}</p>
        ) : (
          measurements.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <span className="value-mono text-lg font-semibold">
                    {m.value} <span className="text-sm font-normal text-muted-foreground">{cfg.unit}</span>
                  </span>
                  {m.notes && (
                    <p className="text-sm text-muted-foreground">{m.notes}</p>
                  )}
                </div>
                <span className="value-mono shrink-0 text-sm text-muted-foreground">
                  {formatMetaDate(m.measured_at, i18n.language)}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useBloodPressure, useCreateBloodPressure } from './useBloodPressure'
import { useAuth } from '@/features/auth/useAuth'
import { BloodPressureChart } from './BloodPressureChart'

function localDatetimeNow(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Pressione() {
  const { t, i18n } = useTranslation()
  const { userId } = useAuth()
  const { data, isLoading } = useBloodPressure()
  const create = useCreateBloodPressure()

  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [pulse, setPulse] = useState('')
  const [measuredAt, setMeasuredAt] = useState(localDatetimeNow)
  const [notes, setNotes] = useState('')

  const reset = () => {
    setSystolic(''); setDiastolic(''); setPulse('')
    setMeasuredAt(localDatetimeNow()); setNotes('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    create.mutate(
      {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: pulse ? Number(pulse) : undefined,
        measured_at: new Date(measuredAt).toISOString(),
        notes,
        user: userId,
      },
      {
        onSuccess: () => { toast.success(t('pressure.savedSuccess')); reset() },
        onError:   () => toast.error(t('common.error')),
      },
    )
  }

  const measurements = data?.items ?? []
  const dtFmt = new Intl.DateTimeFormat(i18n.language, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // Rendered as a tab inside Measurements: the page title lives there.
  return (
    <div className="space-y-6">
      <BloodPressureChart measurements={measurements} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-grid-cols-2">
              <div className="form-field">
                <Label htmlFor="systolic">{t('pressure.systolicLabel')}</Label>
                <Input
                  id="systolic" type="number" inputMode="numeric"
                  min={50} max={260}
                  value={systolic} onChange={(e) => setSystolic(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <Label htmlFor="diastolic">{t('pressure.diastolicLabel')}</Label>
                <Input
                  id="diastolic" type="number" inputMode="numeric"
                  min={30} max={200}
                  value={diastolic} onChange={(e) => setDiastolic(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-field">
              <Label htmlFor="pulse">{t('pressure.pulseLabel')}</Label>
              <Input
                id="pulse" type="number" inputMode="numeric"
                min={20} max={300}
                value={pulse} onChange={(e) => setPulse(e.target.value)}
              />
            </div>
            <div className="form-field">
              <Label htmlFor="measuredAt">{t('pressure.measuredAt')}</Label>
              <Input
                id="measuredAt" type="datetime-local"
                value={measuredAt} onChange={(e) => setMeasuredAt(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <Label htmlFor="notes">{t('pressure.notes')}</Label>
              <Textarea
                id="notes" rows={2}
                value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder={t('pressure.notesPlaceholder')}
              />
            </div>
            <Button type="submit" className="btn-block" disabled={create.isPending}>
              {create.isPending ? t('common.loading') : t('pressure.add')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <p className="muted-empty">{t('common.loading')}</p>
        ) : measurements.length === 0 ? (
          <p className="muted-empty">{t('pressure.empty')}</p>
        ) : (
          measurements.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <span className="text-lg font-semibold">
                    {m.systolic}/{m.diastolic}
                  </span>
                  {m.pulse != null && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {m.pulse} bpm
                    </span>
                  )}
                  {m.notes && (
                    <p className="text-sm text-muted-foreground">{m.notes}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {dtFmt.format(new Date(m.measured_at))}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

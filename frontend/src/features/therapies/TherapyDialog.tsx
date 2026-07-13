import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/features/auth/useAuth'
import type { Therapy } from '@/lib/types'
import {
  computeNextDue, expiryNoticeAt, type RecurrenceUnit,
} from './therapyUtils'
import { useCreateTherapy, useUpdateTherapy } from './useTherapies'

const UNITS: RecurrenceUnit[] = ['day', 'week', 'month', 'year']
const DEFAULT_NOTICE_DAYS = 30

interface Props {
  open: boolean
  onClose: () => void
  /** Present in edit mode */
  therapy?: Therapy
}

export default function TherapyDialog({ open, onClose, therapy }: Props) {
  const { t } = useTranslation()
  const { userId } = useAuth()
  const create = useCreateTherapy()
  const update = useUpdateTherapy()

  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [notes, setNotes] = useState('')
  const [every, setEvery] = useState('')
  const [unit, setUnit] = useState<'' | RecurrenceUnit>('')
  const [time, setTime] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [expiry, setExpiry] = useState('')
  const [noticeDays, setNoticeDays] = useState(String(DEFAULT_NOTICE_DAYS))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setName(therapy?.name ?? '')
    setDosage(therapy?.dosage ?? '')
    setNotes(therapy?.notes ?? '')
    setEvery(therapy?.every ? String(therapy.every) : '')
    setUnit((therapy?.unit as RecurrenceUnit) || '')
    setTime(therapy?.time ?? '')
    setStartDate(therapy?.start_date ? therapy.start_date.slice(0, 10) : '')
    setEndDate(therapy?.end_date ? therapy.end_date.slice(0, 10) : '')
    setEmailEnabled(therapy?.email_enabled ?? false)
    setExpiry(therapy?.expiry ? therapy.expiry.slice(0, 10) : '')
    setNoticeDays(
      therapy?.expiry && therapy?.expiry_notice_at
        ? String(Math.round(
            (new Date(therapy.expiry).getTime() - new Date(therapy.expiry_notice_at).getTime()) / 86_400_000,
          ))
        : String(DEFAULT_NOTICE_DAYS),
    )
  }, [open, therapy])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const hasRecurrence = !!(every || unit || time || startDate)
    if (hasRecurrence && (!every || !unit || !startDate)) {
      setError(t('therapies.recurrenceIncomplete'))
      return
    }
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setError(t('therapies.invalidTime'))
      return
    }
    setError(null)

    const data = {
      name,
      dosage,
      notes,
      every: hasRecurrence ? Number(every) : 0,
      unit: hasRecurrence ? unit : ('' as const),
      time: hasRecurrence ? time : '',
      start_date: hasRecurrence ? startDate : '',
      end_date: hasRecurrence && endDate ? endDate : '',
      email_enabled: hasRecurrence ? emailEnabled : false,
      next_due: hasRecurrence
        ? computeNextDue(startDate, Number(every), unit as RecurrenceUnit, time).toISOString()
        : '',
      expiry: expiry || '',
      expiry_notice_at: expiry
        ? expiryNoticeAt(expiry, Number(noticeDays) || DEFAULT_NOTICE_DAYS).toISOString()
        : '',
      // Changing the expiry re-arms the warning
      expiry_notified: '',
      user: userId,
    }

    const done = {
      onSuccess: () => { toast.success(t('therapies.savedSuccess')); onClose() },
      onError: () => toast.error(t('common.error')),
    }
    if (therapy) update.mutate({ id: therapy.id, data }, done)
    else create.mutate(data, done)
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {therapy ? t('therapies.editTitle') : t('therapies.newTitle')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <Label htmlFor="th-name">{t('therapies.name')}</Label>
            <Input id="th-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} />
          </div>
          <div className="form-field">
            <Label htmlFor="th-dosage">{t('therapies.dosage')}</Label>
            <Input id="th-dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder={t('therapies.dosagePlaceholder')} />
          </div>

          <p className="text-sm font-semibold">{t('therapies.recurrence')}</p>
          <div className="form-grid-cols-2">
            <div className="form-field">
              <Label htmlFor="th-every">{t('therapies.everyLabel')}</Label>
              <Input
                id="th-every" type="number" inputMode="numeric" min={1}
                value={every} onChange={(e) => setEvery(e.target.value)}
              />
            </div>
            <div className="form-field">
              <Label>{t('therapies.unitLabel')}</Label>
              <Select value={unit || undefined} onValueChange={(v) => setUnit(v as RecurrenceUnit)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('therapies.unitPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{t(`therapies.unit_${u}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="form-grid-cols-2">
            <div className="form-field">
              <Label htmlFor="th-time">{t('therapies.timeLabel')}</Label>
              <Input id="th-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="form-field">
              <Label htmlFor="th-start">{t('therapies.startDate')}</Label>
              <Input id="th-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <Label htmlFor="th-end">{t('therapies.endDate')}</Label>
            <Input id="th-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            {t('therapies.emailEnabled')}
          </label>

          <p className="text-sm font-semibold">{t('therapies.expirySection')}</p>
          <div className="form-grid-cols-2">
            <div className="form-field">
              <Label htmlFor="th-expiry">{t('therapies.expiry')}</Label>
              <Input id="th-expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
            <div className="form-field">
              <Label htmlFor="th-notice">{t('therapies.noticeDays')}</Label>
              <Input
                id="th-notice" type="number" inputMode="numeric" min={1}
                value={noticeDays} onChange={(e) => setNoticeDays(e.target.value)}
                disabled={!expiry}
              />
            </div>
          </div>

          <div className="form-field">
            <Label htmlFor="th-notes">{t('therapies.notes')}</Label>
            <Textarea id="th-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="btn-block" disabled={isPending}>
            {isPending ? t('common.loading') : t('common.save')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

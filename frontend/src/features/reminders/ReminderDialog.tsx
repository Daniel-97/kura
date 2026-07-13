import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/useAuth'
import { useCreateReminder } from './useReminders'
import { Button } from '@/components/ui/button'
import EmailDisabledHint from '@/features/notifications/EmailDisabledHint'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props {
  recordId: string
  recordDate: string
  children: React.ReactNode
}

export default function ReminderDialog({ recordId, recordDate, children }: Props) {
  const { t } = useTranslation()
  const { userId } = useAuth()
  const createReminder = useCreateReminder()
  const [open, setOpen] = useState(false)

  const [kind, setKind] = useState<'offset' | 'custom'>('offset')
  const [offsetQty, setOffsetQty] = useState('1')
  const [offsetUnitVal, setOffsetUnitVal] = useState<'minutes' | 'hours' | 'days'>('days')
  const [customDate, setCustomDate] = useState('')
  const [message, setMessage] = useState('')

  const offsetMinutes = useMemo(() => {
    const qty = parseInt(offsetQty) || 0
    if (offsetUnitVal === 'minutes') return qty
    if (offsetUnitVal === 'hours') return qty * 60
    return qty * 1440
  }, [offsetQty, offsetUnitVal])

  const previewDate = useMemo(() => {
    if (kind === 'offset' && recordDate) {
      const event = new Date(recordDate.replace(" ", "T"))
      const fireAt = new Date(event.getTime() - offsetMinutes * 60000)
      return fireAt.toLocaleString()
    }
    if (kind === 'custom' && customDate) {
      return new Date(customDate).toLocaleString()
    }
    return null
  }, [kind, offsetMinutes, recordDate, customDate])

  const canSubmit = kind === 'offset'
    ? parseInt(offsetQty) > 0
    : customDate.length > 0

  const handleSubmit = () => {
    if (!userId || !canSubmit) return

    let fireAt: string
    if (kind === 'offset' && recordDate) {
      const event = new Date(recordDate.replace(" ", "T"))
      fireAt = new Date(event.getTime() - offsetMinutes * 60000).toISOString()
    } else {
      fireAt = new Date(customDate).toISOString()
    }

    const data: Record<string, unknown> = {
      record: recordId,
      user: userId,
      fire_at: fireAt,
      message: message || undefined,
    }

    createReminder.mutate(data, {
      onSuccess: () => {
        toast.success(t('reminders.savedSuccess'))
        setOpen(false)
        setMessage('')
        setOffsetQty('1')
        setOffsetUnitVal('days')
        setCustomDate('')
      },
      onError: () => toast.error(t('common.error')),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('reminders.add')}</DialogTitle>
        </DialogHeader>

        <EmailDisabledHint />

        <Tabs value={kind} onValueChange={(v) => setKind(v as 'offset' | 'custom')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offset">{t('reminders.kindOffset')}</TabsTrigger>
            <TabsTrigger value="custom">{t('reminders.kindCustom')}</TabsTrigger>
          </TabsList>

          <TabsContent value="offset" className="space-y-4 pt-4">
            <div className="flex gap-2">
              <div className="flex-1 form-field">
                <Label>{t('reminders.value')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={offsetQty}
                  onChange={(e) => setOffsetQty(e.target.value)}
                />
              </div>
              <div className="flex-1 form-field">
                <Label>{t('reminders.unit')}</Label>
                <Select value={offsetUnitVal} onValueChange={(v) => setOffsetUnitVal(v as 'minutes' | 'hours' | 'days')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">{t('reminders.minutes')}</SelectItem>
                    <SelectItem value="hours">{t('reminders.hours')}</SelectItem>
                    <SelectItem value="days">{t('reminders.days')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {previewDate && (
              <p className="text-sm text-muted-foreground">
                {t('reminders.preview')}: {previewDate}
              </p>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 pt-4">
            <div className="form-field">
              <Label>{t('reminders.customDateTime')}</Label>
              <Input
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
            {previewDate && (
              <p className="text-sm text-muted-foreground">
                {t('reminders.preview')}: {previewDate}
              </p>
            )}
          </TabsContent>
        </Tabs>

        <div className="form-field">
          <Label htmlFor="msg">{t('reminders.message')}</Label>
          <Textarea
            id="msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('reminders.messagePlaceholder')}
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!canSubmit || createReminder.isPending}>
            {createReminder.isPending ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

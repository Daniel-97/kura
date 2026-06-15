import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Clock, CheckCircle2, Trash2, Plus, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useReminders, useDeleteReminder } from '@/hooks/useReminders'
import ReminderDialog from './ReminderDialog'

interface Props {
  recordId: string
  recordDate: string
}

export default function ReminderList({ recordId, recordDate }: Props) {
  const { t } = useTranslation()
  const { data, isLoading } = useReminders(recordId)
  const deleteReminder = useDeleteReminder()
  const reminders = data?.items ?? []

  if (isLoading) return null

  const pendingReminders = reminders.filter((r) => !r.sent_at)

  const handleDelete = (id: string) => {
    deleteReminder.mutate({ id, recordId }, {
      onError: () => toast.error(t('common.error')),
    })
  }

  return (
    <div className="pt-1">
      <div className="flex items-center gap-2">
        <Bell className="h-3 w-3 text-muted-foreground" />
        {pendingReminders.length > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {pendingReminders.length}
          </Badge>
        )}
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {t('reminders.title')}
        </span>
      </div>

      {reminders.length === 0 ? (
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          {t('reminders.noReminders')}
        </p>
      ) : (
        <div className="mt-1 space-y-0.5">
          {reminders.map((rem) => {
            const label = new Date(rem.fire_at).toLocaleString()

            return (
              <div
                key={rem.id}
                className={`flex items-center gap-1.5 text-[11px] ${
                  rem.sent_at ? 'text-muted-foreground/40' : 'text-muted-foreground'
                }`}
              >
                {rem.sent_at ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500/60" />
                ) : (
                  <Clock className="h-3 w-3 shrink-0" />
                )}
                <span className="truncate">{label}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(rem.id)}
                  className="ml-auto shrink-0 text-muted-foreground/40 hover:text-destructive"
                  aria-label={t('common.delete')}
                  disabled={deleteReminder.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <ReminderDialog recordId={recordId} recordDate={recordDate}>
        <Button
          variant="ghost"
          size="icon"
          className="mt-1 h-5 w-5"
          aria-label={t('reminders.add')}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </ReminderDialog>
    </div>
  )
}

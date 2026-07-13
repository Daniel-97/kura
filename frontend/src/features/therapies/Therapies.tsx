import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, MoreVertical, Mail, MailX, Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { formatMetaDate } from '@/features/dashboard/dashboardUtils'
import type { Therapy } from '@/lib/types'
import { humanizeSchedule, isActive, type RecurrenceUnit } from './therapyUtils'
import { useTherapies, useDeleteTherapy } from './useTherapies'
import TherapyDialog from './TherapyDialog'

const EXPIRING_SOON_DAYS = 30

export function expiresSoon(therapy: Therapy, now = new Date()): boolean {
  if (!therapy.expiry) return false
  const expiry = new Date(therapy.expiry)
  const limit = new Date(now.getTime() + EXPIRING_SOON_DAYS * 86_400_000)
  return expiry <= limit
}

export default function Therapies() {
  const { t, i18n } = useTranslation()
  const { data: therapies = [], isLoading } = useTherapies()
  const deleteTherapy = useDeleteTherapy()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Therapy | undefined>(undefined)
  const [confirming, setConfirming] = useState<Therapy | null>(null)

  const openNew = () => { setEditing(undefined); setDialogOpen(true) }
  const openEdit = (th: Therapy) => { setEditing(th); setDialogOpen(true) }

  const handleDelete = () => {
    if (!confirming) return
    deleteTherapy.mutate(confirming.id, {
      onSuccess: () => { toast.success(t('therapies.deletedSuccess')); setConfirming(null) },
      onError: () => toast.error(t('common.error')),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-header">{t('therapies.title')}</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" />
          {t('therapies.newTitle')}
        </Button>
      </div>

      {isLoading ? (
        <p className="muted-empty">{t('common.loading')}</p>
      ) : therapies.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Pill className="h-8 w-8 text-kura-300" aria-hidden="true" />
          <p className="muted-empty">{t('therapies.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {therapies.map((th) => {
            const active = isActive(th)
            const soon = expiresSoon(th)
            return (
              <Card key={th.id} className={!active ? 'opacity-60' : undefined}>
                <CardContent className="flex items-start justify-between gap-3 py-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{th.name}</span>
                      {th.dosage && (
                        <span className="text-sm text-muted-foreground">{th.dosage}</span>
                      )}
                      {!active && <Badge variant="outline">{t('therapies.inactive')}</Badge>}
                    </div>
                    {th.every > 0 && th.unit && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {th.email_enabled
                          ? <Mail className="h-3.5 w-3.5" aria-label={t('therapies.emailOn')} />
                          : <MailX className="h-3.5 w-3.5 opacity-50" aria-label={t('therapies.emailOff')} />}
                        {humanizeSchedule(th.every, th.unit as RecurrenceUnit, th.time, t)}
                      </p>
                    )}
                    {th.expiry && (
                      <p className="text-sm">
                        {soon ? (
                          <Badge className="bg-warning-bg text-warning hover:bg-warning-bg">
                            {t('therapies.expiresOn')}{' '}
                            <span className="value-mono ml-1">{formatMetaDate(th.expiry, i18n.language)}</span>
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            {t('therapies.expiresOn')}{' '}
                            <span className="value-mono">{formatMetaDate(th.expiry, i18n.language)}</span>
                          </span>
                        )}
                      </p>
                    )}
                    {th.notes && (
                      <p className="text-sm text-muted-foreground">{th.notes}</p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={t('therapies.openMenu')}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(th)}>
                        <Pencil className="h-4 w-4" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => setConfirming(th)}>
                        <Trash2 className="h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <TherapyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        therapy={editing}
      />

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h2 className="font-semibold">{t('therapies.deleteConfirm')}</h2>
            <p className="text-sm text-muted-foreground">{confirming.name}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirming(null)} disabled={deleteTherapy.isPending}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteTherapy.isPending}>
                {deleteTherapy.isPending ? t('common.loading') : t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileText, MoreVertical, Pencil, Trash2, Download, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Chip } from '@/components/ui/chip'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { pb } from '@/lib/pb'
import { useDeleteRecord } from './useRecords'
import { useFileToken } from './fileToken'
import { exportRecordData, downloadRecordIcs } from '@/features/export/exportRecord'
import { useCategories } from '@/features/categories/useCategories'
import { SWATCH_CLASSES } from '@/features/categories/category-styles'
import ReminderList from '@/features/reminders/ReminderList'
import type { HealthRecord } from '@/lib/types'

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'])

interface Props {
  record: HealthRecord
  className?: string
}

export default function RecordCard({ record, className }: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const deleteRecord = useDeleteRecord()
  const { data: fileToken } = useFileToken()
  const { data: categories = [] } = useCategories()
  const category = categories.find((c) => c.id === record.category)

  const tags = record.tags
    ? record.tags.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const dateLabel = new Intl.DateTimeFormat(i18n.language, {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(record.date))

  const handleDelete = () => {
    deleteRecord.mutate(record.id, {
      onSuccess: () => {
        toast.success(t('record.deletedSuccess'))
        setShowConfirm(false)
      },
      onError: () => toast.error(t('common.error')),
    })
  }

  return (
    <>
      <Card
        ref={cardRef}
        // §4.3: card cliccabile, hover scurisce solo il bordo, mai ripple/ombra
        className={cn('cursor-pointer transition-colors duration-fast hover:border-border-strong', className)}
      >
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{record.title}</span>
                <Chip dotClassName={category?.color ? SWATCH_CLASSES[category.color] : undefined}>
                  {category?.name ?? t('common.uncategorized')}
                </Chip>
              </div>
              {/* §3: date nei metadati in mono */}
              <p className="value-mono text-sm text-muted-foreground">{dateLabel}</p>
              {record.description && (
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {record.description}
                </p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t('record.openMenu')}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/timeline/${record.id}/edit`)}>
                    <Pencil className="h-4 w-4" />
                    {t('record.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      exportRecordData(record, category?.name ?? '')
                        .then(() => toast.success(t('export.success')))
                        .catch(() => toast.error(t('export.error')))
                    }
                  >
                    <Download className="h-4 w-4" />
                    {t('record.export')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadRecordIcs(record)}>
                    <CalendarPlus className="h-4 w-4" />
                    {t('record.addToCalendar')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="my-3 border-t" />
          <ReminderList recordId={record.id} recordDate={record.date} />

          {record.file && record.file.length > 0 && (
            <>
              <div className="my-3 border-t" />
              <div className="flex flex-wrap gap-2">
                {record.file.map((filename) => {
                  const ext = filename.split('.').pop()?.toLowerCase()
                  const isImage = ext ? IMAGE_EXTS.has(ext) : false
                  // Files are protected: without a token the URL would 404,
                  // so the tile stays non-clickable until the token arrives.
                  const url = fileToken
                    ? pb.files.getUrl(record, filename, { token: fileToken })
                    : undefined
                  // 80px tile: serve a cached server-side thumb, not the
                  // multi-MB original (160 stays crisp on retina).
                  const thumbUrl = fileToken
                    ? pb.files.getUrl(record, filename, { token: fileToken, thumb: '160x160' })
                    : undefined
                  return (
                    <a
                      key={filename}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={filename}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isImage && thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={filename}
                          className="h-20 w-20 rounded border object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded border bg-muted">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">
                            {ext ?? '?'}
                          </span>
                        </div>
                      )}
                    </a>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h2 className="font-semibold">{t('record.deleteConfirm')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('record.deleteConfirmMessage')}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={deleteRecord.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                disabled={deleteRecord.isPending}
                onClick={handleDelete}
              >
                {deleteRecord.isPending ? t('common.loading') : t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

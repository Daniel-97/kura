import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileText, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { pb } from '@/lib/pb'
import { useDeleteRecord } from '@/hooks/useRecords'
import type { HealthRecord } from '@/lib/types'

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'])

interface Props {
  record: HealthRecord
  className?: string
}

export default function RecordCard({ record, className }: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const deleteRecord = useDeleteRecord()

  const tags = record.tags
    ? record.tags.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const dateLabel = new Intl.DateTimeFormat(i18n.language, {
    day: '2-digit', month: 'long', year: 'numeric',
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
      <Card className={className}>
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{record.title}</span>
                <Badge variant="secondary">{t(`category.${record.category}`)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{dateLabel}</p>
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
                  <DropdownMenuItem onClick={() => navigate(`/record/${record.id}/edit`)}>
                    <Pencil className="h-4 w-4" />
                    {t('record.edit')}
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

              {record.file && record.file.length > 0 && (
                <div className="flex flex-wrap justify-end gap-2">
                  {record.file.map((filename) => {
                    const ext = filename.split('.').pop()?.toLowerCase()
                    const isImage = ext ? IMAGE_EXTS.has(ext) : false
                    const url = pb.files.getUrl(record, filename)
                    return (
                      <a
                        key={filename}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isImage ? (
                          <img
                            src={url}
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
              )}
            </div>
          </div>
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

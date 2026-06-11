import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, FileText, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { pb } from '@/lib/pb'
import { useFetchRecord, useDeleteRecord } from '@/hooks/useRecords'

export default function RecordDetail() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [showConfirm, setShowConfirm] = useState(false)

  const { data: record, isLoading } = useFetchRecord(id!)
  const deleteRecord = useDeleteRecord()

  const dateLabel = record
    ? new Intl.DateTimeFormat(i18n.language, {
        day: '2-digit', month: 'long', year: 'numeric',
      }).format(new Date(record.date))
    : ''

  const tags = record?.tags
    ? record.tags.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const handleDelete = () => {
    deleteRecord.mutate(id!, {
      onSuccess: () => {
        toast.success(t('record.deletedSuccess'))
        navigate('/')
      },
      onError: () => toast.error(t('common.error')),
    })
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t('common.loading')}
      </div>
    )
  }

  if (!record) return null

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        {t('common.back')}
      </Button>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">{record.title}</h1>
              <p className="text-sm text-muted-foreground">{dateLabel}</p>
            </div>
            <Badge variant="secondary">{t(`category.${record.category}`)}</Badge>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {record.description && (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {record.description}
            </p>
          )}

          {record.file && record.file.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">{t('record.files')}</p>
              <div className="space-y-1">
                {record.file.map((filename) => (
                  <a
                    key={filename}
                    href={pb.files.getUrl(record, filename)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{filename}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => navigate(`/record/${id}/edit`)}>
          <Pencil className="mr-1 h-4 w-4" />
          {t('record.edit')}
        </Button>
        <Button variant="destructive" onClick={() => setShowConfirm(true)}>
          <Trash2 className="mr-1 h-4 w-4" />
          {t('common.delete')}
        </Button>
      </div>

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
    </div>
  )
}

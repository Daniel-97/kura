import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { pb } from '@/lib/pb'
import type { HealthRecord } from '@/lib/types'

interface Props {
  record: HealthRecord
  className?: string
}

export default function RecordCard({ record, className }: Props) {
  const { t, i18n } = useTranslation()
  const tags = record.tags
    ? record.tags.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const dateLabel = new Intl.DateTimeFormat(i18n.language, {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(record.date))

  return (
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
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {record.description}
              </p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
          {record.file && record.file.length > 0 && (
            <div className="flex shrink-0 flex-col gap-1">
              {record.file.map((filename) => (
                <a
                  key={filename}
                  href={pb.files.getUrl(record, filename)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('timeline.attachments')}
                  className="text-primary hover:text-primary/80"
                >
                  <FileText className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

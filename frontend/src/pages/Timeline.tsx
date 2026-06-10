import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useRecords } from '@/hooks/useRecords'
import RecordCard from '@/components/RecordCard'
import TagFilter from '@/components/TagFilter'
import { CATEGORIES } from '@/lib/types'
import type { HealthRecord } from '@/lib/types'

function groupByYearMonth(records: HealthRecord[]): [string, HealthRecord[]][] {
  const map = new Map<string, HealthRecord[]>()
  for (const r of records) {
    const d = new Date(r.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return [...map.entries()].sort(([a], [b]) => b.localeCompare(a))
}

export default function Timeline() {
  const { t, i18n } = useTranslation()
  const [category, setCategory] = useState('')
  const [tag, setTag] = useState('')
  const { data, isLoading } = useRecords({
    category: category || undefined,
    tag: tag || undefined,
  })
  const records = data?.items ?? []
  const grouped = groupByYearMonth(records)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('timeline.title')}</h1>
        <Button asChild size="sm">
          <Link to="/nuovo">
            <Plus className="mr-1 h-4 w-4" />
            {t('record.newRecord')}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('timeline.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('timeline.allCategories')}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{t(`category.${c}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TagFilter value={tag} onChange={setTag} />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : records.length === 0 ? (
        <p className="text-muted-foreground">{t('timeline.empty')}</p>
      ) : (
        grouped.map(([key, items]) => {
          const [year, month] = key.split('-').map(Number)
          const label = new Intl.DateTimeFormat(i18n.language, {
            year: 'numeric', month: 'long',
          }).format(new Date(year, month - 1))
          return (
            <div key={key} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
              </h2>
              {items.map((r) => <RecordCard key={r.id} record={r} />)}
            </div>
          )
        })
      )}
    </div>
  )
}

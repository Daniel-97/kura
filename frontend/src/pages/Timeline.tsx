import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useRecords } from '@/hooks/useRecords'
import RecordCard from '@/components/RecordCard'
import TagFilter from '@/components/TagFilter'
import { CATEGORIES } from '@/lib/types'
import type { HealthRecord, RecordCategory } from '@/lib/types'

const CATEGORY_DOT: Record<RecordCategory | string, string> = {
  visita:  'bg-indigo-500 ring-indigo-500',
  esame:   'bg-sky-500 ring-sky-500',
  referto: 'bg-emerald-500 ring-emerald-500',
  altro:   'bg-slate-400 ring-slate-400',
}

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
        <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('timeline.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('timeline.allCategories')}</SelectItem>
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
        <div className="relative">
          {/* vertical line centered on the dot column */}
          <div className="absolute left-[64px] top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />

          {grouped.map(([key, items]) => {
            const [year, month] = key.split('-').map(Number)
            const monthLabel = new Intl.DateTimeFormat(i18n.language, {
              month: 'long',
            }).format(new Date(year, month - 1))

            return (
              <div key={key} className="mb-8">
                {/* year watermark */}
                <p className="text-5xl font-black tracking-tighter opacity-[0.07] text-foreground leading-none select-none">
                  {year}
                </p>
                {/* month label */}
                <p className="pl-[88px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1 mb-3">
                  {monthLabel}
                </p>

                {items.map((r) => {
                  const day = String(new Date(r.date).getDate()).padStart(2, '0')
                  return (
                    <div key={r.id} className="grid grid-cols-[40px_24px_1fr] items-start gap-x-3 mb-3">
                      {/* day number */}
                      <span className="text-right text-[11px] font-bold text-muted-foreground pt-3 leading-none">
                        {day}
                      </span>
                      {/* dot centered on vertical line */}
                      <div className="flex justify-center pt-2.5">
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full border-2 border-background ring-2 relative z-10',
                            CATEGORY_DOT[r.category] ?? CATEGORY_DOT.altro,
                          )}
                        />
                      </div>
                      {/* record card — component unchanged */}
                      <RecordCard record={r} />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

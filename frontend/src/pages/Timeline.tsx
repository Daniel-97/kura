import { useState, useMemo } from 'react'
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
import { useCategories } from '@/hooks/useCategories'
import { getCategoryStyles } from '@/lib/category-styles'
import RecordCard from '@/components/RecordCard'
import TagFilter from '@/components/TagFilter'
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

function isFuture(dateStr: string, now: Date): boolean {
  return new Date(dateStr) > now
}

export default function Timeline() {
  const { t, i18n } = useTranslation()
  const [category, setCategory] = useState('')
  const [tag, setTag] = useState('')
  const { data: categoriesData = [] } = useCategories()
  const categoryById = useMemo(
    () => new Map(categoriesData.map((c) => [c.id, c])),
    [categoriesData],
  )
  const { data, isLoading } = useRecords({
    category: category === '__null' ? '' : (category || undefined),
    tag: tag || undefined,
  })
  const records = data?.items ?? []
  const grouped = groupByYearMonth(records)

  // Split each group into future and past records; a group can appear in both
  // when it straddles today (e.g. current month has past and future records).
  const today = new Date()
  const futureGroups: [string, HealthRecord[]][] = []
  const pastGroups: [string, HealthRecord[]][] = []
  for (const [key, items] of grouped) {
    const futureItems = items.filter((r) => isFuture(r.date, today))
    const pastItems = items.filter((r) => !isFuture(r.date, today))
    if (futureItems.length > 0) futureGroups.push([key, futureItems])
    if (pastItems.length > 0) pastGroups.push([key, pastItems])
  }
  const hasSplit = futureGroups.length > 0 && pastGroups.length > 0

  const todayLabel = new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date())

  const renderGroups = (groups: [string, HealthRecord[]][], future: boolean) =>
    groups.map(([key, items]) => {
      const [year, month] = key.split('-').map(Number)
      const monthLabel = new Intl.DateTimeFormat(i18n.language, {
        month: 'long',
      }).format(new Date(year, month - 1))

      return (
        <div key={`${key}-${future ? 'f' : 'p'}`} className="mb-8">
          <p className={cn(
            'text-5xl font-black tracking-tighter leading-none select-none text-foreground',
            future ? 'opacity-[0.04]' : 'opacity-[0.07]',
          )}>
            {year}
          </p>
          <p className={cn(
            'pl-[88px] text-[10px] font-bold uppercase tracking-widest mt-1 mb-3',
            future ? 'text-muted-foreground/40' : 'text-muted-foreground',
          )}>
            {monthLabel}
          </p>

          {items.map((r) => {
            const day = String(new Date(r.date).getDate()).padStart(2, '0')
            const cat = r.category ? categoryById.get(r.category) : undefined
            const styles = getCategoryStyles(cat?.color ?? null)
            return (
              <div key={r.id} className="grid grid-cols-[40px_24px_1fr] items-start gap-x-3 mb-3">
                <span className={cn(
                  'text-right text-[11px] font-bold pt-3 leading-none',
                  future ? 'text-muted-foreground/40' : 'text-muted-foreground',
                )}>
                  {day}
                </span>
                <div className="flex justify-center pt-2.5">
                  <div className={cn(
                    'w-3 h-3 rounded-full border-2 border-background ring-2 relative z-10',
                    future ? cn('bg-background', styles.outline) : styles.dot,
                  )} />
                </div>
                <RecordCard
                  record={r}
                  className={cn(
                    'border-l-4',
                    styles.border,
                    future && 'border-dashed border-border/50 bg-muted/20 [border-left-style:solid]',
                  )}
                />
              </div>
            )
          })}
        </div>
      )
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-header">{t('timeline.title')}</h1>
        <Button asChild size="sm">
          <Link to="/new">
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
            <SelectItem value="__null">{t('common.uncategorized')}</SelectItem>
            {categoriesData.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TagFilter value={tag} onChange={setTag} />
      </div>

      {isLoading ? (
        <p className="muted-empty">{t('common.loading')}</p>
      ) : records.length === 0 ? (
        <p className="muted-empty">{t('timeline.empty')}</p>
      ) : (
        <>
          {futureGroups.length > 0 && (
            <div className="relative">
              <div
                className="absolute left-[64px] top-0 bottom-0 w-0.5"
                style={{
                  background: 'repeating-linear-gradient(to bottom, hsl(var(--border)) 0px, hsl(var(--border)) 5px, transparent 5px, transparent 10px)',
                }}
                aria-hidden="true"
              />
              {renderGroups(futureGroups, true)}
            </div>
          )}

          {hasSplit && (
            <div
              className="inline-block bg-rose-500 text-white text-[9px] font-extrabold uppercase tracking-widest py-[5px] pl-[10px] pr-5"
              style={{ clipPath: 'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%)' }}
            >
              {t('timeline.today')} · {todayLabel}
            </div>
          )}

          {pastGroups.length > 0 && (
            <div className="relative">
              <div className="absolute left-[64px] top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
              {renderGroups(pastGroups, false)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
